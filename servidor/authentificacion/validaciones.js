// reglas de validacion de datos antes de llegar al controlador
// usa la libreria express-validator
// si los datos no cumplen las reglas, se devuelve un error 400

const { body, validationResult } = require('express-validator');

// middleware que comprueba si hubo errores en la validacion
// si los hay, devuelve los mensajes al frontend
const comprobarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ 
            errores: errores.array().map(e => e.msg) 
        });
    }
    next();
};

// reglas para crear/editar un cliente
const validarCliente = [
    body('nombre_empresa')
        .trim()
        .notEmpty().withMessage('El nombre de la empresa es obligatorio')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),
    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage('El email no es valido')
        .normalizeEmail(),
    body('telefono')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[0-9 +()-]+$/).withMessage('El telefono solo puede contener numeros'),
    body('ciudad')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('La ciudad no puede superar 100 caracteres'),
    body('sector')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El sector no puede superar 100 caracteres'),
    comprobarErrores
];

// reglas para crear/editar una certificacion
const validarCertificacion = [
    body('cliente_id')
        .notEmpty().withMessage('Debes seleccionar un cliente')
        .isInt({ min: 1 }).withMessage('Cliente invalido'),
    body('numero_certificado')
        .trim()
        .notEmpty().withMessage('El numero de certificado es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El numero debe tener entre 3 y 100 caracteres'),
    body('fecha_emision')
        .notEmpty().withMessage('La fecha de emision es obligatoria')
        .isISO8601().withMessage('La fecha de emision no es valida'),
    body('fecha_caducidad')
        .notEmpty().withMessage('La fecha de caducidad es obligatoria')
        .isISO8601().withMessage('La fecha de caducidad no es valida')
        // validacion personalizada: la caducidad debe ser POSTERIOR a la emision
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.fecha_emision)) {
                throw new Error('La fecha de caducidad debe ser posterior a la de emision');
            }
            return true;
        }),
    comprobarErrores
];

// reglas para crear/editar un usuario
const validarUsuario = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email no es valido')
        .normalizeEmail(),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
    body('rol')
        .optional({ checkFalsy: true })
        .isIn(['admin', 'empleado']).withMessage('El rol debe ser admin o empleado'),
    comprobarErrores
];

// reglas para el login
const validarLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email no es valido'),
    body('password')
        .notEmpty().withMessage('La contrasena es obligatoria'),
    comprobarErrores
];

module.exports = {
    validarCliente,
    validarCertificacion,
    validarUsuario,
    validarLogin
};