const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const { 
    obtenerDenuncias, 
    crearDenuncia, 
    actualizarEstadoDenuncia, 
    eliminarDenuncia 
} = require('../controladores/denunciaControlador');

// publica: cualquiera puede denunciar sin login
router.post('/publico', crearDenuncia);

// privadas: solo admin gestiona las denuncias
router.get('/', verificarToken, soloAdmin, obtenerDenuncias);
router.put('/:id', verificarToken, soloAdmin, actualizarEstadoDenuncia);
router.delete('/:id', verificarToken, soloAdmin, eliminarDenuncia);

module.exports = router;