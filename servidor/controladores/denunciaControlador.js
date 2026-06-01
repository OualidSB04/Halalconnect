const Denuncia = require('../modelos/Denuncia');

const obtenerDenuncias = async (req, res) => {
    try {
        const denuncias = await Denuncia.obtenerDenuncias();
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearDenuncia = async (req, res) => {
    try {
        const { producto_nombre, establecimiento, descripcion, email_denunciante } = req.body;
        if (!producto_nombre || !descripcion) return res.status(400).json({ error: 'Producto y descripcion son obligatorios' });
        const denuncia = await Denuncia.crearDenuncia(producto_nombre, establecimiento, descripcion, email_denunciante);
        res.status(201).json(denuncia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEstadoDenuncia = async (req, res) => {
    try {
        const { estado } = req.body;
        const denuncia = await Denuncia.actualizarEstadoDenuncia(req.params.id, estado);
        res.json(denuncia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarDenuncia = async (req, res) => {
    try {
        await Denuncia.eliminarDenuncia(req.params.id);
        res.json({ mensaje: 'Denuncia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerDenuncias, 
    crearDenuncia, 
    actualizarEstadoDenuncia, 
    eliminarDenuncia 
};