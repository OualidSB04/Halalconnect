// modelo de contacto
// cada cliente puede tener varios contactos (personas dentro de la empresa)
const pool = require('../configuracion/HalalconnectDB');

// trae todos los contactos de un cliente
const obtenerContactosPorCliente = async (cliente_id) => {
    const resultado = await pool.query(
        'SELECT * FROM contactos WHERE cliente_id = $1', [cliente_id]
    );
    return resultado.rows;
};

// crea un contacto nuevo asociado a un cliente
const crearContacto = async (cliente_id, nombre, cargo, telefono, email) => {
    const resultado = await pool.query(
        'INSERT INTO contactos (cliente_id, nombre, cargo, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [cliente_id, nombre, cargo, telefono, email]
    );
    return resultado.rows[0];
};

// actualiza un contacto existente
const actualizarContacto = async (id, nombre, cargo, telefono, email) => {
    const resultado = await pool.query(
        'UPDATE contactos SET nombre=$1, cargo=$2, telefono=$3, email=$4 WHERE id=$5 RETURNING *',
        [nombre, cargo, telefono, email, id]
    );
    return resultado.rows[0];
};

// borra un contacto
const eliminarContacto = async (id) => {
    await pool.query('DELETE FROM contactos WHERE id = $1', [id]);
};

module.exports = {
    obtenerContactosPorCliente,
    crearContacto,
    actualizarContacto,
    eliminarContacto
};