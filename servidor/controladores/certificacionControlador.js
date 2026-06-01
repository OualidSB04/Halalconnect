// controlador de certificaciones halal

const Certificacion = require('../modelos/Certificacion');

const obtenerCertificaciones = async (req, res) => {
    try {
        const certificaciones = await Certificacion.obtenerCertificaciones();
        res.json(certificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerCertificacionesPorCliente = async (req, res) => {
    try {
        const certificaciones = await Certificacion.obtenerCertificacionesPorCliente(req.params.cliente_id);
        res.json(certificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerProximasACaducar = async (req, res) => {
    try {
        const certificaciones = await Certificacion.obtenerProximasACaducar();
        res.json(certificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// verificacion publica por numero de certificado
const verificarCertificadoPublico = async (req, res) => {
    try {
        const certificado = await Certificacion.verificarCertificadoPublico(req.params.numero);

        if (!certificado) {
            return res.status(404).json({
                valido: false,
                mensaje: 'Certificado no encontrado en nuestra base de datos'
            });
        }

        const hoy = new Date();
        const caducado = new Date(certificado.fecha_caducidad) < hoy;

        res.json({
            valido: !caducado,
            caducado: caducado,
            certificado: certificado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// certificado de una empresa (publico) - lo usa el marketplace
const obtenerCertificadoPublicoPorEmpresa = async (req, res) => {
    try {
        const certificado = await Certificacion.obtenerCertificadoPublicoPorEmpresa(req.params.cliente_id);

        if (!certificado) {
            return res.status(404).json({ tiene: false });
        }

        const hoy = new Date();
        const caducado = new Date(certificado.fecha_caducidad) < hoy;

        res.json({
            tiene: true,
            caducado: caducado,
            certificado: certificado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
    obtenerCertificadoPublicoPorEmpresa,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion
};