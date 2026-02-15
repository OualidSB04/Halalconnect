// controlador de certificaciones halal
// el corazon del CRM: gestiona los certificados y sus fechas

const Certificacion = require('../modelos/Certificacion');

// GET /api/certificaciones - todas las certificaciones
const obtenerCertificaciones = async (req, res) => {
    try {
        const certificaciones = await Certificacion.obtenerCertificaciones();
        res.json(certificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/certificaciones/cliente/:cliente_id - certificaciones de un cliente
const obtenerCertificacionesPorCliente = async (req, res) => {
    try {
        const certificaciones = await Certificacion.obtenerCertificacionesPorCliente(req.params.cliente_id);
        res.json(certificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/certificaciones/caducando - certificados que vencen en 30 dias
const obtenerProximasACaducar = async (req, res) => {
    try {
        const certificaciones = await Certificacion.obtenerProximasACaducar();
        res.json(certificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/certificaciones/verificar/:numero - verificacion publica
// es la unica ruta del CRM que NO requiere login
const verificarCertificadoPublico = async (req, res) => {
    try {
        const certificado = await Certificacion.verificarCertificadoPublico(req.params.numero);
        
        if (!certificado) {
            return res.status(404).json({ 
                valido: false, 
                mensaje: 'Certificado no encontrado en nuestra base de datos' 
            });
        }
        
        // comprobamos si el certificado ya esta caducado
        const hoy = new Date();
        const fechaCaducidad = new Date(certificado.fecha_caducidad);
        const caducado = fechaCaducidad < hoy;
        
        res.json({
            valido: !caducado,
            caducado: caducado,
            certificado: certificado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/certificaciones - crea una certificacion nueva
const crearCertificacion = async (req, res) => {
    try {
        const { cliente_id, numero_certificado, tipo, fecha_emision, fecha_caducidad } = req.body;
        const nuevaCertificacion = await Certificacion.crearCertificacion(
            cliente_id, numero_certificado, tipo, fecha_emision, fecha_caducidad
        );
        res.status(201).json(nuevaCertificacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/certificaciones/:id - actualiza una certificacion existente
const actualizarCertificacion = async (req, res) => {
    try {
        const { numero_certificado, tipo, fecha_emision, fecha_caducidad, estado } = req.body;
        const certificacionActualizada = await Certificacion.actualizarCertificacion(
            req.params.id, numero_certificado, tipo, fecha_emision, fecha_caducidad, estado
        );
        res.json(certificacionActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/certificaciones/:id - borra una certificacion
const eliminarCertificacion = async (req, res) => {
    try {
        await Certificacion.eliminarCertificacion(req.params.id);
        res.json({ mensaje: 'Certificacion eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerCertificaciones,
    obtenerCertificacionesPorCliente,
    obtenerProximasACaducar,
    verificarCertificadoPublico,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion
};