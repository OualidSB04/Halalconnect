// modelo de usuario
// gestiona los usuarios que pueden acceder al CRM (admin y empleados)

const pool = require('../configuracion/HalalconnectDB');
const bcrypt = require('bcryptjs');

// trae todos los usuarios SIN la contrasena (por seguridad)
const obtenerUsuarios = async () => {
    const resultado = await pool.query(
        'SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    return resultado.rows;
};

// busca un usuario por su id (sin contrasena)
const obtenerUsuarioPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = $1', [id]
    );
    return resultado.rows[0];
};

// busca un usuario por email (con contrasena, solo se usa en el login)
const obtenerUsuarioPorEmail = async (email) => {
    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1', [email]
    );
    return resultado.rows[0];
};

// crea un usuario nuevo encriptando su contrasena con bcrypt
const crearUsuario = async (nombre, email, password, rol) => {
    // el salt es una cadena random que se anade a la contrasena antes de encriptarla
    // hace que dos contrasenas iguales tengan hashes diferentes
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);
    
    const resultado = await pool.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, creado_en',
        [nombre, email, passwordEncriptada, rol]
    );
    return resultado.rows[0];
};

// actualiza los datos basicos del usuario (sin tocar la contrasena)
const actualizarUsuario = async (id, nombre, email, rol) => {
    const resultado = await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3 WHERE id=$4 RETURNING id, nombre, email, rol, creado_en',
        [nombre, email, rol, id]
    );
    return resultado.rows[0];
};

// borra un usuario
const eliminarUsuario = async (id) => {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
};

// compara una contrasena en texto plano con el hash guardado en la BD
// devuelve true si coinciden, false si no
const verificarPassword = async (passwordIngresada, passwordEncriptada) => {
    return await bcrypt.compare(passwordIngresada, passwordEncriptada);
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorEmail,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    verificarPassword
};