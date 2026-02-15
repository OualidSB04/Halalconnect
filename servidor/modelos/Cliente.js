// modelo de cliente
// aqui van todas las consultas SQL relacionadas con clientes

const pool = require('../configuracion/HalalconnectDB');

// trae todos los clientes ordenados del mas nuevo al mas viejo
const obtenerClientes = async () => {
    const resultado = await pool.query(
        'SELECT * FROM clientes ORDER BY creado_en DESC'
    );
    return resultado.rows;
};

// busca un cliente concreto por su id
const obtenerClientePorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM clientes WHERE id = $1', [id]
    );
    return resultado.rows[0];
};

// crea un cliente nuevo y devuelve el que acaba de crear
const crearCliente = async (nombre_empresa, sector, ciudad, telefono, email) => {
    const resultado = await pool.query(
        'INSERT INTO clientes (nombre_empresa, sector, ciudad, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [nombre_empresa, sector, ciudad, telefono, email]
    );
    return resultado.rows[0];
};

// actualiza un cliente existente
const actualizarCliente = async (id, nombre_empresa, sector, ciudad, telefono, email) => {
    const resultado = await pool.query(
        'UPDATE clientes SET nombre_empresa=$1, sector=$2, ciudad=$3, telefono=$4, email=$5 WHERE id=$6 RETURNING *',
        [nombre_empresa, sector, ciudad, telefono, email, id]
    );
    return resultado.rows[0];
};

// borra un cliente
const eliminarCliente = async (id) => {
    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
};

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};