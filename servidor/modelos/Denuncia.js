const pool = require('../configuracion/HalalconnectDB');

const obtenerDenuncias = async () => {
    const resultado = await pool.query('SELECT * FROM denuncias ORDER BY creado_en DESC');
    return resultado.rows;
};

const crearDenuncia = async (producto_nombre, establecimiento, descripcion, email_denunciante) => {
    const resultado = await pool.query(`
        INSERT INTO denuncias (producto_nombre, establecimiento, descripcion, email_denunciante)
        VALUES ($1, $2, $3, $4) RETURNING *
    `, [producto_nombre, establecimiento, descripcion, email_denunciante]);
    return resultado.rows[0];
};

const actualizarEstadoDenuncia = async (id, estado) => {
    const resultado = await pool.query(
        'UPDATE denuncias SET estado=$1 WHERE id=$2 RETURNING *',
        [estado, id]
    );
    return resultado.rows[0];
};

const eliminarDenuncia = async (id) => {
    await pool.query('DELETE FROM denuncias WHERE id = $1', [id]);
};

module.exports = {
    obtenerDenuncias,
    crearDenuncia,
    actualizarEstadoDenuncia,
    eliminarDenuncia 
};