const pool = require('../configuracion/HalalconnectDB');

// trae todos los productos con su categoria, empresa y fecha de caducidad del certificado
const obtenerProductos = async () => {
    const resultado = await pool.query(`
        SELECT p.*, c.nombre AS categoria_nombre, cl.nombre_empresa,
               (SELECT MAX(cert.fecha_caducidad) 
                FROM certificaciones cert 
                WHERE cert.cliente_id = p.cliente_id) AS cert_caducidad
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN clientes cl ON p.cliente_id = cl.id
        ORDER BY p.creado_en DESC
    `);
    return resultado.rows;
};

// busca productos por nombre, marca o empresa, incluye la caducidad del certificado
const buscarProductos = async (texto) => {
    const resultado = await pool.query(`
        SELECT p.*, c.nombre AS categoria_nombre, cl.nombre_empresa,
               (SELECT MAX(cert.fecha_caducidad) 
                FROM certificaciones cert 
                WHERE cert.cliente_id = p.cliente_id) AS cert_caducidad
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN clientes cl ON p.cliente_id = cl.id
        WHERE p.nombre ILIKE $1 OR p.marca ILIKE $1 OR cl.nombre_empresa ILIKE $1
        ORDER BY p.nombre ASC
    `, [`%${texto}%`]);
    return resultado.rows;
};

// trae un producto por su id con la caducidad del certificado
const obtenerProductoPorId = async (id) => {
    const resultado = await pool.query(`
        SELECT p.*, c.nombre AS categoria_nombre, cl.nombre_empresa,
               (SELECT MAX(cert.fecha_caducidad) 
                FROM certificaciones cert 
                WHERE cert.cliente_id = p.cliente_id) AS cert_caducidad
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN clientes cl ON p.cliente_id = cl.id
        WHERE p.id = $1
    `, [id]);
    return resultado.rows[0];
};

// trae los productos de un cliente concreto
const obtenerProductosPorCliente = async (cliente_id) => {
    const resultado = await pool.query(`
        SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.cliente_id = $1
        ORDER BY p.creado_en DESC
    `, [cliente_id]);
    return resultado.rows;
};

// crea un producto con precio, stock e imagen
const crearProducto = async (cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url) => {
    const resultado = await pool.query(`
        INSERT INTO productos (cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio || 0, stock || 0, imagen_url]);
    return resultado.rows[0];
};

// actualiza un producto con precio, stock e imagen
const actualizarProducto = async (id, cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url) => {
    const resultado = await pool.query(`
        UPDATE productos SET cliente_id=$1, categoria_id=$2, nombre=$3,
        marca=$4, descripcion=$5, codigo_barras=$6, precio=$7, stock=$8, imagen_url=$9
        WHERE id=$10 RETURNING *
    `, [cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio || 0, stock || 0, imagen_url, id]);
    return resultado.rows[0];
};

// borra un producto
const eliminarProducto = async (id) => {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
};

module.exports = {
    obtenerProductos,
    buscarProductos,
    obtenerProductoPorId,
    obtenerProductosPorCliente,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};