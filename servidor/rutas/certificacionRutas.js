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
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion
} = require('../controladores/certificacionControlador');

// esta ruta es publica, NO requiere login, cualquier consumidor puede verificar un certificado halal
router.get('/verificar/:numero', verificarCertificadoPublico);

// estas si requieren login
router.get('/', verificarToken, obtenerCertificaciones);
router.get('/caducando', verificarToken, obtenerProximasACaducar);
router.get('/cliente/:cliente_id', verificarToken, obtenerCertificacionesPorCliente);
router.post('/', verificarToken, validarCertificacion, crearCertificacion);
router.put('/:id', verificarToken, validarCertificacion, actualizarCertificacion);
router.delete('/:id', verificarToken, eliminarCertificacion);

module.exports = router;