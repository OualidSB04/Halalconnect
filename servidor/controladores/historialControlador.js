// controlador del historial de acciones (audit log)

const Historial = require('../modelos/Historial');

// GET /api/historial - lista las ultimas 100 acciones (solo admin)
const obtenerHistorial = async (req, res) => {
    try {
        const historial = await Historial.obtenerHistorial();
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerHistorial };