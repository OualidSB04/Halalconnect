// controlador de pedidos - simulacion de compra

const Pedido = require('../modelos/Pedido');

// POST /api/pedidos - crea un pedido (publico, sin login)
const crearPedido = async (req, res) => {
    try {
        const { nombre, email, direccion, items } = req.body;

        if (!nombre || !items || items.length === 0) {
            return res.status(400).json({ error: 'Faltan datos del pedido o el carrito esta vacio' });
        }

        const datosCliente = { nombre, email, direccion };
        const pedido = await Pedido.crearPedido(datosCliente, items);

        res.status(201).json({
            mensaje: 'Pedido confirmado correctamente',
            pedido: pedido
        });
    } catch (error) {
        console.log('Error al crear pedido:', error.message);
        res.status(500).json({ error: 'No se pudo procesar el pedido' });
    }
};

// GET /api/pedidos - lista todos los pedidos (solo admin)
const obtenerPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.obtenerPedidos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/pedidos/:id/items - los productos de un pedido (solo admin)
const obtenerItemsPedido = async (req, res) => {
    try {
        const items = await Pedido.obtenerItemsPedido(req.params.id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/pedidos/:id/factura - la factura de un pedido (solo admin)
const obtenerFacturaPedido = async (req, res) => {
    try {
        const factura = await Pedido.obtenerFacturaPedido(req.params.id);
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(factura);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { crearPedido, obtenerPedidos, obtenerItemsPedido, obtenerFacturaPedido };