const Establecimiento = require('../modelos/Establecimiento');

const obtenerEstablecimientos = async (req, res) => {
    try {
        const establecimientos = await Establecimiento.obtenerEstablecimientos();
        res.json(establecimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const buscarEstablecimientosPublico = async (req, res) => {
    try {
        const { texto } = req.query;
        const establecimientos = texto && texto.trim() !== ''
            ? await Establecimiento.buscarEstablecimientos(texto)
            : await Establecimiento.obtenerEstablecimientos();
        res.json(establecimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerEstablecimientoPorId = async (req, res) => {
    try {
        const establecimiento = await Establecimiento.obtenerEstablecimientoPorId(req.params.id);
        if (!establecimiento) return res.status(404).json({ error: 'Establecimiento no encontrado' });
        res.json(establecimiento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearEstablecimiento = async (req, res) => {
    try {
        const { cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud } = req.body;
        if (!nombre || !cliente_id) return res.status(400).json({ error: 'Nombre y cliente son obligatorios' });
        const establecimiento = await Establecimiento.crearEstablecimiento(cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud);
        res.status(201).json(establecimiento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEstablecimiento = async (req, res) => {
    try {
        const { cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud } = req.body;
        const establecimiento = await Establecimiento.actualizarEstablecimiento(req.params.id, cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud);
        res.json(establecimiento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarEstablecimiento = async (req, res) => {
    try {
        await Establecimiento.eliminarEstablecimiento(req.params.id);
        res.json({ mensaje: 'Establecimiento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerEstablecimientos, 
    buscarEstablecimientosPublico, 
    obtenerEstablecimientoPorId, 
    crearEstablecimiento, 
    actualizarEstablecimiento, 
    eliminarEstablecimiento 
};