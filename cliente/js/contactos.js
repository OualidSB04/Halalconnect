// contactos.js - gestion de contactos por cliente
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// recuperamos el id del cliente de la URL (ej: contactos.html?cliente=5)
const params = new URLSearchParams(window.location.search);
const clienteId = params.get('cliente');

// si no hay cliente especificado volvemos a la lista
if (!clienteId) window.location.href = 'clientes.html';

let listaContactos = [];

// carga el nombre del cliente pa mostrarlo en el subtitulo
async function cargarNombreCliente() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes/${clienteId}`, { headers });
        const cliente = await respuesta.json();
        document.getElementById('subtitulo-cliente').textContent =
            `Personas de contacto de ${cliente.nombre_empresa}`;
    } catch (error) { console.error('Error al cargar el cliente:', error); }
}

// trae los contactos de este cliente
async function cargarContactos() {
    try {
        const respuesta = await fetch(`${API_URL}/contactos/cliente/${clienteId}`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaContactos = await respuesta.json();
        mostrarContactos(listaContactos);
    } catch (error) { console.error('Error al cargar contactos:', error); }
}

// pinta los contactos en la tabla
function mostrarContactos(contactos) {
    const tbody = document.getElementById('tabla-contactos');
    if (contactos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#64748b">No hay contactos registrados para este cliente</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    contactos.forEach(c => {
        const botonEliminar = usuario.rol === 'admin'
            ? `<button class="btn-danger" onclick="eliminarContacto(${c.id})">Eliminar</button>` : '';
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${c.nombre || '-'}</strong></td>
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

// carga los datos del contacto en el modal pa editarlo
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

// elimina un contacto
async function eliminarContacto(id) {
    if (!confirm('¿Estas seguro de eliminar este contacto?')) return;
    try {
        await fetch(`${API_URL}/contactos/${id}`, { method: 'DELETE', headers });
        cargarContactos();
    } catch (error) { alert('Error al eliminar'); }
}

// guarda el contacto (crear o editar)
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
        await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        cerrarModal();
        cargarContactos();
    } catch (error) { alert('Error al guardar'); }
});

cargarNombreCliente();
cargarContactos();