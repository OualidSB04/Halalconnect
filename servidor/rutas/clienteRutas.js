// rutas de la API para clientes
// todas requieren login y validacion de datos

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const { validarCliente } = require('../authentificacion/validaciones');
const {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../controladores/clienteControlador');

// los middlewares se ejecutan en orden:
// 1. verificarToken comprueba que el usuario tenga sesion valida
// 2. validarCliente comprueba que los datos enviados son correctos
// 3. solo entonces se llama al controlador

router.get('/', verificarToken, obtenerClientes);
router.get('/:id', verificarToken, obtenerClientePorId);
router.post('/', verificarToken, validarCliente, crearCliente);
router.put('/:id', verificarToken, validarCliente, actualizarCliente);
router.delete('/:id', verificarToken, eliminarCliente);

module.exports = router;