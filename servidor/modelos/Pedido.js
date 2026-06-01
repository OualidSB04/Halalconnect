// modelo de pedidos - simulacion de compra
// usa una TRANSACCION SQL para garantizar integridad:
// o se guarda el pedido completo con sus items y factura, o no se guarda nada

const pool = require('../configuracion/HalalconnectDB');

// crea un pedido con sus items y su factura, usando una transaccion
const crearPedido = async (datosCliente, items) => {
    const cliente = await pool.connect();

    try {
        await cliente.query('BEGIN');

        // calculamos el total sumando precio * cantidad de cada item
        let total = 0;
        items.forEach(item => {
            total += parseFloat(item.precio_unidad) * parseInt(item.cantidad);
        });

        // insertamos el pedido principal
        const resultadoPedido = await cliente.query(
            `INSERT INTO pedidos (nombre_cliente, email_cliente, direccion, total)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [datosCliente.nombre, datosCliente.email, datosCliente.direccion, total]
        );
        const pedido = resultadoPedido.rows[0];

        // insertamos cada linea del pedido (los productos)
        for (const item of items) {
            await cliente.query(
                `INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, precio_unidad, cantidad)
                 VALUES ($1, $2, $3, $4, $5)`,
                [pedido.id, item.producto_id, item.nombre_producto, item.precio_unidad, item.cantidad]
            );
        }

        // GENERAMOS LA FACTURA automaticamente
        // el total ya incluye IVA, asi que lo desglosamos al 21% (IVA español)
        const totalConIva = total;
        const baseImponible = totalConIva / 1.21;       // precio sin IVA
        const iva = totalConIva - baseImponible;        // el 21% de IVA

        // numero de factura unico con formato profesional: FAC-2026-0001
        const año = new Date().getFullYear();
        const numeroFactura = `FAC-${año}-${String(pedido.id).padStart(4, '0')}`;

        await cliente.query(
            `INSERT INTO facturas (pedido_id, numero_factura, metodo_pago, base_imponible, iva, total)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [pedido.id, numeroFactura, 'Tarjeta', baseImponible.toFixed(2), iva.toFixed(2), totalConIva.toFixed(2)]
        );

        await cliente.query('COMMIT');
        return pedido;

    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;
    } finally {
        cliente.release();
    }
};

// trae todos los pedidos (para el panel admin)
const obtenerPedidos = async () => {
    const resultado = await pool.query(
        'SELECT * FROM pedidos ORDER BY creado_en DESC'
    );
    return resultado.rows;
};

// trae los items de un pedido concreto
const obtenerItemsPedido = async (pedido_id) => {
    const resultado = await pool.query(
        'SELECT * FROM pedido_items WHERE pedido_id = $1', [pedido_id]
    );
    return resultado.rows;
};

// trae la factura de un pedido concreto
const obtenerFacturaPedido = async (pedido_id) => {
    const resultado = await pool.query(
        'SELECT * FROM facturas WHERE pedido_id = $1', [pedido_id]
    );
    return resultado.rows[0];
};

module.exports = { crearPedido, obtenerPedidos, obtenerItemsPedido, obtenerFacturaPedido };