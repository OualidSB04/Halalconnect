// controlador de usuarios
// gestiona el registro, login, perfil propio y administracion de usuarios

const Usuario = require('../modelos/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../configuracion/HalalconnectDB');

// GET /api/usuarios - lista de todos los usuarios (solo admin)
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/usuarios/mi-perfil - datos del usuario logueado
const obtenerMiPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.obtenerUsuarioPorId(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/usuarios/mi-perfil - actualizar nombre y email propios
const actualizarMiPerfil = async (req, res) => {
    try {
        const { nombre, email } = req.body;
        
        const resultado = await pool.query(
            'UPDATE usuarios SET nombre=$1, email=$2 WHERE id=$3 RETURNING id, nombre, email, rol, creado_en',
            [nombre, email, req.usuario.id]
        );
        
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/usuarios/cambiar-password - cambiar la contrasena propia
const cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;
        
        // buscamos el usuario con su contrasena encriptada actual
        const usuario = await Usuario.obtenerUsuarioPorEmail(
            (await Usuario.obtenerUsuarioPorId(req.usuario.id)).email
        );
        
        // comprobamos que la contrasena actual es correcta antes de cambiarla
        const passwordCorrecta = await Usuario.verificarPassword(passwordActual, usuario.password);
        if (!passwordCorrecta) {
            return res.status(400).json({ error: 'La contrasena actual es incorrecta' });
        }
        
        // encriptamos la nueva contrasena
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(passwordNueva, salt);
        
        await pool.query(
            'UPDATE usuarios SET password=$1 WHERE id=$2',
            [passwordEncriptada, req.usuario.id]
        );
        
        res.json({ mensaje: 'Contrasena actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/usuarios/registro - crear un usuario (solo admin)
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        
        // si ya existe un usuario con ese email, no permitimos duplicados
        const usuarioExiste = await Usuario.obtenerUsuarioPorEmail(email);
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El email ya esta registrado' });
        }

        const nuevoUsuario = await Usuario.crearUsuario(nombre, email, password, rol || 'empleado');
        res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/usuarios/:id - editar un usuario (solo admin)
// incluye proteccion para no quedarse sin admins
const actualizarUsuario = async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;
        const idEditar = parseInt(req.params.id);
        
        // proteccion: el admin no puede bajarse a si mismo de rol
        if (idEditar === req.usuario.id && rol !== 'admin') {
            return res.status(400).json({ 
                error: 'No puedes cambiar tu propio rol. Pide a otro administrador que lo haga.' 
            });
        }
        
        // proteccion: no dejar el sistema sin ningun admin
        if (rol !== 'admin') {
            const usuarioActual = await Usuario.obtenerUsuarioPorId(idEditar);
            if (usuarioActual && usuarioActual.rol === 'admin') {
                const todosUsuarios = await Usuario.obtenerUsuarios();
                const totalAdmins = todosUsuarios.filter(u => u.rol === 'admin').length;
                
                if (totalAdmins <= 1) {
                    return res.status(400).json({ 
                        error: 'No se puede degradar al ultimo administrador del sistema.' 
                    });
                }
            }
        }
        
        const usuarioActualizado = await Usuario.actualizarUsuario(idEditar, nombre, email, rol);
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/usuarios/:id - eliminar un usuario (solo admin)
const eliminarUsuario = async (req, res) => {
    try {
        // proteccion: el admin no puede borrarse a si mismo
        if (parseInt(req.params.id) === req.usuario.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }
        
        await Usuario.eliminarUsuario(req.params.id);
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/usuarios/login - iniciar sesion y obtener un token JWT
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // buscamos el usuario por email
        const usuario = await Usuario.obtenerUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(400).json({ error: 'Email o contrasena incorrectos' });
        }

        // comparamos la contrasena ingresada con el hash de la BD
        const passwordCorrecta = await Usuario.verificarPassword(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(400).json({ error: 'Email o contrasena incorrectos' });
        }

        // generamos un token JWT que el frontend usara en cada peticion
        // expira a las 8 horas para forzar a reloguear de vez en cuando
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ 
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerMiPerfil,
    actualizarMiPerfil,
    cambiarPassword,
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario
};