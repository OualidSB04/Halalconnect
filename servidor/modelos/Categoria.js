const pool = require('../configuracion/HalalconnectDB');

const obtenerCategorias = async () => {
    const resultado = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
    return resultado.rows;
};

const crearCategoria = async (nombre, descripcion) => {
    const resultado = await pool.query(
        'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
        [nombre, descripcion]
    );
    return resultado.rows[0];
};

const actualizarCategoria = async (id, nombre, descripcion) => {
    const resultado = await pool.query(
        'UPDATE categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
        [nombre, descripcion, id]
    );
    return resultado.rows[0];
};

const eliminarCategoria = async (id) => {
    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
};

module.exports = { 
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria 
};