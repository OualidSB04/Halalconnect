// middleware que comprueba si el usuario tiene rol de admin
// se usa en las rutas que solo deberia acceder un administrador
// IMPORTANTE: se ejecuta DESPUES de verificarToken (necesita req.usuario)

const soloAdmin = (req, res, next) => {
    // req.usuario fue puesto por el middleware verificarToken
    // contiene el id y rol del usuario logueado
    if (req.usuario && req.usuario.rol === 'admin') {
        // es admin, le dejamos pasar
        next();
    } else {
        // no es admin, le bloqueamos con un 403 (forbidden)
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
};

module.exports = soloAdmin;