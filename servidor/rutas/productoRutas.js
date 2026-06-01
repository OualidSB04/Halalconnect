// rutas de productos
// define los endpoints REST para el recurso productos

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const {
    obtenerProductos,
    buscarProductosPublico,
    obtenerProductoPorId,
    obtenerProductosPorCliente,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controladores/productoControlador');

// ============================================
// RUTAS PUBLICAS (sin token)
// cualquier consumidor puede buscar productos
// ============================================
router.get('/publico/buscar', buscarProductosPublico);
router.get('/publico/:id', obtenerProductoPorId);

// ============================================
// RUTAS PRIVADAS (requieren token)
// ============================================
router.get('/', verificarToken, obtenerProductos);
router.get('/cliente/:cliente_id', verificarToken, obtenerProductosPorCliente);
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, soloAdmin, eliminarProducto);

module.exports = router;