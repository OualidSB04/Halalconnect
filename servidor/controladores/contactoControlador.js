// controlador de contacto
// gestiona los contactos asociados a cada cliente

const Contacto = require('../modelos/Contacto');

// GET /api/contactos/cliente/:cliente_id - todos los contactos de un cliente
const obtenerContactosPorCliente = async (req, res) => {
    try {
        const contactos = await Contacto.obtenerContactosPorCliente(req.params.cliente_id);
        res.json(contactos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/contactos - crea un contacto nuevo
const crearContacto = async (req, res) => {
    try {
        const { cliente_id, nombre, cargo, telefono, email } = req.body;
        const nuevoContacto = await Contacto.crearContacto(
            cliente_id, nombre, cargo, telefono, email
        );
        res.status(201).json(nuevoContacto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/contactos/:id - actualiza un contacto existente
const actualizarContacto = async (req, res) => {
    try {
        const { nombre, cargo, telefono, email } = req.body;
        const contactoActualizado = await Contacto.actualizarContacto(
            req.params.id, nombre, cargo, telefono, email
        );
        res.json(contactoActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/contactos/:id - borra un contacto
const eliminarContacto = async (req, res) => {
    try {
        await Contacto.eliminarContacto(req.params.id);
        res.json({ mensaje: 'Contacto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerContactosPorCliente,
    crearContacto,
    actualizarContacto,
    eliminarContacto
};