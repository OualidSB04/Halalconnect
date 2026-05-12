// logica de la pagina de contactos por cliente
// muestra y gestiona los contactos asociados a un cliente concreto

const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token) {
    window.location.href = 'index.html';
}

const spanUsuario = document.getElementById('usuario-nombre');
spanUsuario.innerHTML = `<a href="perfil.html" style="color: white; text-decoration: none;">${usuario.nombre}</a>`;

function añadirEnlaceUsuarios() {
    if (usuario.rol === 'admin') {
        const menu = document.querySelector('.navbar-menu');
        const enlaceUsuarios = document.createElement('a');
        enlaceUsuarios.href = 'usuarios.html';
        enlaceUsuarios.textContent = 'Usuarios';
        
        const certEnlace = menu.querySelector('a[href="certificaciones.html"]');
        certEnlace.insertAdjacentElement('afterend', enlaceUsuarios);
    }
}

añadirEnlaceUsuarios();

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// recuperamos el id del cliente de la URL (ej: contactos.html?cliente=5)
const params = new URLSearchParams(window.location.search);
const clienteId = params.get('cliente');

if (!clienteId) {
    alert('Cliente no especificado');
    window.location.href = 'clientes.html';
}

let listaContactos = [];

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

function volverClientes() {
    window.location.href = 'clientes.html';
}

// carga los datos del cliente para mostrar su nombre en el titulo
async function cargarNombreCliente() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes/${clienteId}`, { headers });
        const cliente = await respuesta.json();
        document.getElementById('nombre-cliente').textContent = cliente.nombre_empresa;
    } catch (error) {
        console.error('Error al cargar el cliente:', error);
    }
}

// trae los contactos de este cliente del backend
async function cargarContactos() {
    try {
        const respuesta = await fetch(`${API_URL}/contactos/cliente/${clienteId}`, { headers });
        
        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesion();
            return;
        }
        
        listaContactos = await respuesta.json();
        mostrarContactos(listaContactos);
    } catch (error) {
        console.error('Error al cargar contactos:', error);
        alert('Error al conectar con el servidor');
    }
}

// pinta los contactos en la tabla
function mostrarContactos(contactos) {
    const tbody = document.getElementById('tabla-contactos');
    
    if (contactos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay contactos registrados para este cliente</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    contactos.forEach(c => {
        const botonEliminar = usuario.rol === 'admin' 
            ? `<button class="btn-danger" onclick="eliminarContacto(${c.id})">Eliminar</button>` 
            : '';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${c.nombre || '-'}</strong></td>
                <td>${c.cargo || '-'}</td>
                <td>${c.telefono || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>
                    <button class="btn-edit" onclick="editarContacto(${c.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Contacto';
    document.getElementById('formContacto').reset();
    document.getElementById('contacto-id').value = '';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

function editarContacto(id) {
    const c = listaContactos.find(x => x.id === id);
    if (!c) return;
    
    document.getElementById('modal-titulo').textContent = 'Editar Contacto';
    document.getElementById('contacto-id').value = c.id;
    document.getElementById('nombre').value = c.nombre || '';
    document.getElementById('cargo').value = c.cargo || '';
    document.getElementById('telefono').value = c.telefono || '';
    document.getElementById('email').value = c.email || '';
    
    document.getElementById('modal').classList.add('active');
}

async function eliminarContacto(id) {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;
    
    try {
        await fetch(`${API_URL}/contactos/${id}`, { method: 'DELETE', headers });
        cargarContactos();
    } catch (error) {
        alert('Error al eliminar el contacto');
    }
}

// guardar contacto (crear o editar)
document.getElementById('formContacto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('contacto-id').value;
    const datos = {
        cliente_id: clienteId,
        nombre: document.getElementById('nombre').value,
        cargo: document.getElementById('cargo').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value
    };
    
    try {
        const url = id ? `${API_URL}/contactos/${id}` : `${API_URL}/contactos`;
        const metodo = id ? 'PUT' : 'POST';
        
        await fetch(url, {
            method: metodo,
            headers,
            body: JSON.stringify(datos)
        });
        
        cerrarModal();
        cargarContactos();
    } catch (error) {
        alert('Error al guardar el contacto');
    }
});

cargarNombreCliente();
cargarContactos();