// establecimientos.js - CRUD de establecimientos Halal
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaEstablecimientos = [];

async function cargarClientesSelect() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes`, { headers });
        const clientes = await respuesta.json();
        const select = document.getElementById('cliente_id');
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre_empresa}</option>`;
        });
    } catch (error) { console.error('Error al cargar clientes:', error); }
}

async function cargarEstablecimientos() {
    try {
        const respuesta = await fetch(`${API_URL}/establecimientos`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaEstablecimientos = await respuesta.json();
        mostrarEstablecimientos(listaEstablecimientos);
    } catch (error) { console.error('Error al cargar establecimientos:', error); }
}

function mostrarEstablecimientos(establecimientos) {
    const tbody = document.getElementById('tabla-establecimientos');
    if (establecimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b">No se encontraron establecimientos</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    establecimientos.forEach(e => {
        const botonEliminar = usuario.rol === 'admin'
            ? `<button class="btn-danger" onclick="eliminarEstablecimiento(${e.id})">Eliminar</button>` : '';
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${e.nombre}</strong></td>
                <td><span class="badge-estado badge-activo">${e.tipo || '-'}</span></td>
                <td>${e.ciudad_nombre || '-'}</td>
                <td>${e.direccion || '-'}</td>
                <td>${e.telefono || '-'}</td>
                <td>${e.nombre_empresa || '-'}</td>
                <td>
                    <button class="btn-edit" onclick="editarEstablecimiento(${e.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

function filtrarEstablecimientos() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaEstablecimientos.filter(e =>
        (e.nombre && e.nombre.toLowerCase().includes(texto)) ||
        (e.tipo && e.tipo.toLowerCase().includes(texto)) ||
        (e.ciudad_nombre && e.ciudad_nombre.toLowerCase().includes(texto)) ||
        (e.nombre_empresa && e.nombre_empresa.toLowerCase().includes(texto))
    );
    mostrarEstablecimientos(filtrados);
}

function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Establecimiento';
    document.getElementById('formEstablecimiento').reset();
    document.getElementById('establecimiento-id').value = '';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

async function editarEstablecimiento(id) {
    try {
        const respuesta = await fetch(`${API_URL}/establecimientos/publico/${id}`);
        const e = await respuesta.json();
        document.getElementById('modal-titulo').textContent = 'Editar Establecimiento';
        document.getElementById('establecimiento-id').value = e.id;
        document.getElementById('cliente_id').value = e.cliente_id;
        document.getElementById('ciudad_id').value = e.ciudad_id || '';
        document.getElementById('nombre').value = e.nombre;
        document.getElementById('tipo').value = e.tipo || 'Otro';
        document.getElementById('direccion').value = e.direccion || '';
        document.getElementById('telefono').value = e.telefono || '';
        document.getElementById('latitud').value = e.latitud || '';
        document.getElementById('longitud').value = e.longitud || '';
        document.getElementById('modal').classList.add('active');
    } catch (error) { alert('Error al cargar el establecimiento'); }
}

async function eliminarEstablecimiento(id) {
    if (!confirm('¿Estas seguro de eliminar este establecimiento?')) return;
    try {
        await fetch(`${API_URL}/establecimientos/${id}`, { method: 'DELETE', headers });
        cargarEstablecimientos();
    } catch (error) { alert('Error al eliminar'); }
}

document.getElementById('formEstablecimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('establecimiento-id').value;
    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        ciudad_id: document.getElementById('ciudad_id').value || null,
        nombre: document.getElementById('nombre').value,
        tipo: document.getElementById('tipo').value,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value,
        latitud: document.getElementById('latitud').value || null,
        longitud: document.getElementById('longitud').value || null
    };
    try {
        const url = id ? `${API_URL}/establecimientos/${id}` : `${API_URL}/establecimientos`;
        const metodo = id ? 'PUT' : 'POST';
        await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        cerrarModal();
        cargarEstablecimientos();
    } catch (error) { alert('Error al guardar'); }
});

cargarClientesSelect();
cargarEstablecimientos();