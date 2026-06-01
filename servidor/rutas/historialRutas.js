// rutas del historial de acciones

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const { obtenerHistorial } = require('../controladores/historialControlador');

// solo el admin puede ver el historial
router.get('/', verificarToken, soloAdmin, obtenerHistorial);

module.exports = router;