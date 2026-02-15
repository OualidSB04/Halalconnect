// rutas de la API para usuarios
// incluye login publico, perfil propio y administracion de usuarios

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const { validarUsuario, validarLogin } = require('../authentificacion/validaciones');
const {
    obtenerUsuarios,
    obtenerMiPerfil,
    actualizarMiPerfil,
    cambiarPassword,
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario
} = require('../controladores/usuarioControlador');

// ruta publica - cualquiera puede intentar logearse
router.post('/login', validarLogin, loginUsuario);

// rutas del perfil propio - cualquier usuario logueado
router.get('/mi-perfil', verificarToken, obtenerMiPerfil);
router.put('/mi-perfil', verificarToken, actualizarMiPerfil);
router.put('/cambiar-password', verificarToken, cambiarPassword);

// rutas de administracion - SOLO admin
// el orden de los middlewares importa: primero comprobar token, luego rol, luego validar
router.get('/', verificarToken, soloAdmin, obtenerUsuarios);
router.post('/registro', verificarToken, soloAdmin, validarUsuario, registrarUsuario);
router.put('/:id', verificarToken, soloAdmin, validarUsuario, actualizarUsuario);
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);

module.exports = router;