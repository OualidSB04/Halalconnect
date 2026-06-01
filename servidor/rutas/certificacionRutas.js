// rutas de la API para certificaciones halal

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const { validarCertificacion } = require('../authentificacion/validaciones');
const {
    obtenerCertificaciones,
    obtenerCertificacionesPorCliente,
    obtenerProximasACaducar,
    verificarCertificadoPublico,
    obtenerCertificadoPublicoPorEmpresa,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion
} = require('../controladores/certificacionControlador');

// RUTAS PUBLICAS (sin login)
// verificar un certificado por su numero
router.get('/verificar/:numero', verificarCertificadoPublico);
// certificado de una empresa, para el marketplace
router.get('/publico/empresa/:cliente_id', obtenerCertificadoPublicoPorEmpresa);

// RUTAS PRIVADAS (requieren login)
router.get('/', verificarToken, obtenerCertificaciones);
router.get('/caducando', verificarToken, obtenerProximasACaducar);
router.get('/cliente/:cliente_id', verificarToken, obtenerCertificacionesPorCliente);
router.post('/', verificarToken, validarCertificacion, crearCertificacion);
router.put('/:id', verificarToken, validarCertificacion, actualizarCertificacion);
router.delete('/:id', verificarToken, eliminarCertificacion);

module.exports = router;