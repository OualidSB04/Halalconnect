// modelo de certificacion halal
// es el corazon del CRM, controla fechas de emision y caducidad

const pool = require('../configuracion/HalalconnectDB');

// trae todas las certificaciones con el nombre de la empresa
// el JOIN es pa no tener que hacer dos consultas separadas
const obtenerCertificaciones = async () => {
    const resultado = await pool.query(
        `SELECT c.*, cl.nombre_empresa 
         FROM certificaciones c
         JOIN clientes cl ON c.cliente_id = cl.id
         ORDER BY c.fecha_caducidad ASC`
    );
    return resultado.rows;
};

// trae las certificaciones de un cliente concreto
const obtenerCertificacionesPorCliente = async (cliente_id) => {
    const resultado = await pool.query(
        'SELECT * FROM certificaciones WHERE cliente_id = $1', [cliente_id]
    );
    return resultado.rows;
};

// trae las certificaciones que van a caducar en los proximos 30 dias
// esto es lo que da valor real al CRM: las alertas automaticas
const obtenerProximasACaducar = async () => {
    const resultado = await pool.query(
        `SELECT c.*, cl.nombre_empresa 
         FROM certificaciones c
         JOIN clientes cl ON c.cliente_id = cl.id
         WHERE c.fecha_caducidad BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
         ORDER BY c.fecha_caducidad ASC`
    );
    return resultado.rows;
};

// busca un certificado por su numero para la verificacion publica
// no requiere login, es accesible para cualquiera
const verificarCertificadoPublico = async (numero) => {
    const resultado = await pool.query(
        `SELECT c.numero_certificado, c.tipo, c.fecha_emision, c.fecha_caducidad, c.estado,
                cl.nombre_empresa, cl.sector, cl.ciudad
         FROM certificaciones c
         JOIN clientes cl ON c.cliente_id = cl.id
         WHERE c.numero_certificado = $1`, [numero]
    );
    return resultado.rows[0];
};

// crea una certificacion nueva
const crearCertificacion = async (cliente_id, numero_certificado, tipo, fecha_emision, fecha_caducidad) => {
    const resultado = await pool.query(
        'INSERT INTO certificaciones (cliente_id, numero_certificado, tipo, fecha_emision, fecha_caducidad) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [cliente_id, numero_certificado, tipo, fecha_emision, fecha_caducidad]
    );
    return resultado.rows[0];
};

// actualiza una certificacion existente
const actualizarCertificacion = async (id, numero_certificado, tipo, fecha_emision, fecha_caducidad, estado) => {
    const resultado = await pool.query(
        'UPDATE certificaciones SET numero_certificado=$1, tipo=$2, fecha_emision=$3, fecha_caducidad=$4, estado=$5 WHERE id=$6 RETURNING *',
        [numero_certificado, tipo, fecha_emision, fecha_caducidad, estado, id]
    );
    return resultado.rows[0];
};

// borra una certificacion
const eliminarCertificacion = async (id) => {
    await pool.query('DELETE FROM certificaciones WHERE id = $1', [id]);
};

module.exports = {
    obtenerCertificaciones,
    obtenerCertificacionesPorCliente,
    obtenerProximasACaducar,
    verificarCertificadoPublico,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion
};