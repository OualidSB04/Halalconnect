const Producto = require('../modelos/Producto');
const Historial = require('../modelos/Historial');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.obtenerProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const buscarProductosPublico = async (req, res) => {
    try {
        const { texto } = req.query;
        const productos = texto && texto.trim() !== ''
            ? await Producto.buscarProductos(texto)
            : await Producto.obtenerProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.obtenerProductoPorId(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerProductosPorCliente = async (req, res) => {
    try {
        const productos = await Producto.obtenerProductosPorCliente(req.params.cliente_id);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// crear producto con todos los campos del marketplace
const crearProducto = async (req, res) => {
    try {
        const { cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url } = req.body;
        if (!nombre || !cliente_id) return res.status(400).json({ error: 'Nombre y cliente son obligatorios' });
        const producto = await Producto.crearProducto(cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url);

        // registramos la accion en el historial
        if (req.usuario) await Historial.registrarAccion(req.usuario.id, `Creó el producto: ${nombre}`, 'productos');

        res.status(201).json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// actualizar producto con todos los campos del marketplace
const actualizarProducto = async (req, res) => {
    try {
        const { cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url } = req.body;
        const producto = await Producto.actualizarProducto(req.params.id, cliente_id, categoria_id, nombre, marca, descripcion, codigo_barras, precio, stock, imagen_url);

        // registramos la accion en el historial
        if (req.usuario) await Historial.registrarAccion(req.usuario.id, `Editó el producto: ${nombre}`, 'productos');

        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        await Producto.eliminarProducto(req.params.id);

        // registramos la accion en el historial
        if (req.usuario) await Historial.registrarAccion(req.usuario.id, `Eliminó un producto (ID: ${req.params.id})`, 'productos');

        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    obtenerProductos, 
    buscarProductosPublico, 
    obtenerProductoPorId, 
    obtenerProductosPorCliente, 
    crearProducto, 
    actualizarProducto, 
    eliminarProducto 
};