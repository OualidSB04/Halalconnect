// middleware que comprueba si el usuario tiene un token JWT valido
// se ejecuta antes que el controlador en las rutas protegidas

const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // el token viene en el header "Authorization" con formato "Bearer xxxxx"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporciono token.' });
    }
    
    // separamos "Bearer" del token real
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Formato de token invalido.' });
    }
    
    try {
        // verificamos que el token sea valido usando nuestra clave secreta
        // si el token fue manipulado o ha expirado, dara error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // guardamos los datos del usuario en req.usuario pa que los controladores
        // puedan acceder al id y rol del que esta haciendo la peticion
        req.usuario = decoded;
        
        // next() pasa el control al siguiente middleware o al controlador
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalido o expirado.' });
    }
};

module.exports = verificarToken;