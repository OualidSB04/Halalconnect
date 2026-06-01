// modelo de historial de acciones (audit log)
// registra quien hace que y cuando, para trazabilidad y seguridad

const pool = require('../configuracion/HalalconnectDB');

// registra una accion en el historial
// se llama desde otros controladores cada vez que pasa algo importante
const registrarAccion = async (usuario_id, accion, tabla_afectada) => {
    try {
        await pool.query(
            `INSERT INTO historial_acciones (usuario_id, accion, tabla_afectada)
             VALUES ($1, $2, $3)`,
            [usuario_id, accion, tabla_afectada]
        );
    } catch (error) {
        // si falla el log no queremos romper la accion principal, solo avisamos
        console.log('Error al registrar en historial:', error.message);
    }
};

// trae todo el historial con el nombre del usuario que hizo cada accion
const obtenerHistorial = async () => {
    const resultado = await pool.query(
        `SELECT h.*, u.nombre AS usuario_nombre
         FROM historial_acciones h
         LEFT JOIN usuarios u ON h.usuario_id = u.id
         ORDER BY h.creado_en DESC
         LIMIT 100`
    );
    return resultado.rows;
};

module.exports = { registrarAccion, obtenerHistorial };