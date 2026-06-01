// chatbotRutas.js - ruta del asistente IA
// es publica: cualquier consumidor puede preguntar sin login

const express = require('express');
const router = express.Router();
const { preguntar } = require('../controladores/chatbotControlador');

// ruta publica del chatbot
router.post('/preguntar', preguntar);

module.exports = router;