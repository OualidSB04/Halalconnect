// rutas de la API para contactos
// los contactos siempre estan asociados a un cliente

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const {
    obtenerContactosPorCliente,
    crearContacto,
    actualizarContacto,
    eliminarContacto
} = require('../controladores/contactoControlador');

router.get('/cliente/:cliente_id', verificarToken, obtenerContactosPorCliente);
router.post('/', verificarToken, crearContacto);
router.put('/:id', verificarToken, actualizarContacto);
router.delete('/:id', verificarToken, eliminarContacto);

module.exports = router;