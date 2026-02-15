// configuracion de la conexion con postgres
const { Pool } = require('pg');
require('dotenv').config();

// el pool maneja varias conexiones a la vez
// asi no abrimos y cerramos cada vez que hay que consultar la base de datos
// los datos los cogemos del archivo .env pa no tenerlos hardcoded
const pool = new Pool({
    user: process.env.DB_USUARIO,
    host: process.env.DB_HOST,
    database: process.env.DB_NOMBRE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PUERTO,
});

module.exports = pool;