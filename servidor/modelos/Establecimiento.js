const pool = require('../configuracion/HalalconnectDB');

const obtenerEstablecimientos = async () => {
    const resultado = await pool.query(`
        SELECT e.*, c.nombre AS ciudad_nombre, c.provincia,
               c.latitud AS ciudad_lat, c.longitud AS ciudad_lng,
               cl.nombre_empresa
        FROM establecimientos e
        LEFT JOIN ciudades c ON e.ciudad_id = c.id
        LEFT JOIN clientes cl ON e.cliente_id = cl.id
        ORDER BY e.creado_en DESC
    `);
    return resultado.rows;
};

const buscarEstablecimientos = async (texto) => {
    const resultado = await pool.query(`
        SELECT e.*, c.nombre AS ciudad_nombre, c.provincia,
               cl.nombre_empresa
        FROM establecimientos e
        LEFT JOIN ciudades c ON e.ciudad_id = c.id
        LEFT JOIN clientes cl ON e.cliente_id = cl.id
        WHERE e.nombre ILIKE $1 OR e.tipo ILIKE $1
        OR c.nombre ILIKE $1 OR cl.nombre_empresa ILIKE $1
        ORDER BY e.nombre ASC
    `, [`%${texto}%`]);
    return resultado.rows;
};

const obtenerEstablecimientoPorId = async (id) => {
    const resultado = await pool.query(`
        SELECT e.*, c.nombre AS ciudad_nombre, c.provincia,
               cl.nombre_empresa
        FROM establecimientos e
        LEFT JOIN ciudades c ON e.ciudad_id = c.id
        LEFT JOIN clientes cl ON e.cliente_id = cl.id
        WHERE e.id = $1
    `, [id]);
    return resultado.rows[0];
};

const crearEstablecimiento = async (cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud) => {
    const resultado = await pool.query(`
        INSERT INTO establecimientos (cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud]);
    return resultado.rows[0];
};

const actualizarEstablecimiento = async (id, cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud) => {
    const resultado = await pool.query(`
        UPDATE establecimientos SET cliente_id=$1, ciudad_id=$2, nombre=$3,
        tipo=$4, direccion=$5, telefono=$6, latitud=$7, longitud=$8
        WHERE id=$9 RETURNING *
    `, [cliente_id, ciudad_id, nombre, tipo, direccion, telefono, latitud, longitud, id]);
    return resultado.rows[0];
};

const eliminarEstablecimiento = async (id) => {
    await pool.query('DELETE FROM establecimientos WHERE id = $1', [id]);
};

module.exports = {
    obtenerEstablecimientos,
    buscarEstablecimientos,
    obtenerEstablecimientoPorId,
    crearEstablecimiento,
    actualizarEstablecimiento,
    eliminarEstablecimiento
 };