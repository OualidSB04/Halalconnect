const express = require('express');
const router = express.Router();
const verificarToken = require('../authentificacion/verificarToken');
const soloAdmin = require('../authentificacion/soloAdmin');
const { 
    obtenerCategorias, 
    crearCategoria, 
    actualizarCategoria, 
    eliminarCategoria 
} = require('../controladores/categoriaControlador');

// publica: cualquiera puede ver las categorias
router.get('/', obtenerCategorias);

// privadas
router.post('/', verificarToken, soloAdmin, crearCategoria);
router.put('/:id', verificarToken, soloAdmin, actualizarCategoria);
router.delete('/:id', verificarToken, soloAdmin, eliminarCategoria);

module.exports = router;