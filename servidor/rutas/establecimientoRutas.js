const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const { 
    obtenerEstablecimientos, 
    buscarEstablecimientosPublico, 
    obtenerEstablecimientoPorId, 
    crearEstablecimiento, 
    actualizarEstablecimiento, 
    eliminarEstablecimiento 
} = require('../controladores/establecimientoControlador');

// rutas publicas
router.get('/publico/buscar', buscarEstablecimientosPublico);
router.get('/publico/:id', obtenerEstablecimientoPorId);

// rutas privadas
router.get('/', verificarToken, obtenerEstablecimientos);
router.post('/', verificarToken, crearEstablecimiento);
router.put('/:id', verificarToken, actualizarEstablecimiento);
router.delete('/:id', verificarToken, soloAdmin, eliminarEstablecimiento);

module.exports = router;