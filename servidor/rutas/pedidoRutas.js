// rutas de pedidos - simulacion de compra

const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const { crearPedido, obtenerPedidos, obtenerItemsPedido, obtenerFacturaPedido } = require('../controladores/pedidoControlador');

// RUTA PUBLICA: cualquier consumidor puede hacer un pedido sin login
router.post('/', crearPedido);

// RUTAS PRIVADAS: solo admin
router.get('/', verificarToken, soloAdmin, obtenerPedidos);
router.get('/:id/items', verificarToken, soloAdmin, obtenerItemsPedido);
router.get('/:id/factura', verificarToken, soloAdmin, obtenerFacturaPedido);

module.exports = router;