const Categoria = require('../modelos/Categoria');

const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.obtenerCategorias();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
        const categoria = await Categoria.crearCategoria(nombre, descripcion);
        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const categoria = await Categoria.actualizarCategoria(req.params.id, nombre, descripcion);
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        await Categoria.eliminarCategoria(req.params.id);
        res.json({ mensaje: 'Categoria eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria 
};