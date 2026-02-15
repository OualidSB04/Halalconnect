// controlador de cliente
// recibe las peticiones del frontend, llama al modelo y devuelve la respuesta

const Cliente = require('../modelos/Cliente');

// GET /api/clientes - devuelve todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.obtenerClientes();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/clientes/:id - devuelve un cliente concreto
const obtenerClientePorId = async (req, res) => {
    try {
        const cliente = await Cliente.obtenerClientePorId(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/clientes - crea un cliente nuevo
const crearCliente = async (req, res) => {
    try {
        const { nombre_empresa, sector, ciudad, telefono, email } = req.body;
        const nuevoCliente = await Cliente.crearCliente(
            nombre_empresa, sector, ciudad, telefono, email
        );
        res.status(201).json(nuevoCliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/clientes/:id - actualiza un cliente existente
const actualizarCliente = async (req, res) => {
    try {
        const { nombre_empresa, sector, ciudad, telefono, email } = req.body;
        const clienteActualizado = await Cliente.actualizarCliente(
            req.params.id, nombre_empresa, sector, ciudad, telefono, email
        );
        res.json(clienteActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/clientes/:id - borra un cliente
const eliminarCliente = async (req, res) => {
    try {
        await Cliente.eliminarCliente(req.params.id);
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};