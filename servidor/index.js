// archivo principal del servidor
// aqui es donde arranca todo

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // pa leer el archivo .env

// las rutas de cada cosa que maneja la api
const clienteRutas = require('./rutas/clienteRutas');
const contactoRutas = require('./rutas/contactoRutas');
const certificacionRutas = require('./rutas/certificacionRutas');
const usuarioRutas = require('./rutas/usuarioRutas');
const productoRutas = require('./rutas/productoRutas');
const categoriaRutas = require('./rutas/categoriaRutas');
const establecimientoRutas = require('./rutas/establecimientoRutas');
const denunciaRutas = require('./rutas/denunciaRutas');
const chatbotRutas = require('./rutas/chatbotRutas');
const pedidoRutas = require('./rutas/pedidoRutas');
const historialRutas = require('./rutas/historialRutas');

const app = express();

// cors es pa que el frontend pueda hablar con el backend sin problemas
app.use(cors());
// y este pa que entienda los datos que vienen en json
app.use(express.json());

// aqui conectamos cada url con su parte
app.use('/api/clientes', clienteRutas);
app.use('/api/contactos', contactoRutas);
app.use('/api/certificaciones', certificacionRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/productos', productoRutas);
app.use('/api/categorias', categoriaRutas);
app.use('/api/establecimientos', establecimientoRutas);
app.use('/api/denuncias', denunciaRutas);
app.use('/api/chatbot', chatbotRutas);
app.use('/api/pedidos', pedidoRutas);
app.use('/api/historial', historialRutas);
// ruta de prueba pa ver si el server esta vivo
app.get('/', (req, res) => {
    res.json({ mensaje: 'API HalalConnect funcionando' });
});

// arrancamos el server
const PORT = process.env.PUERTO || 5000;
app.listen(PORT, () => {
    console.log('Servidor en puerto ' + PORT);
});