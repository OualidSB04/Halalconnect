// clientes.js - CRUD completo de clientes

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaClientes = [];

async function cargarClientes() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaClientes = await respuesta.json();
        mostrarClientes(listaClientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

function mostrarClientes(clientes) {
    const tbody = document.getElementById('tabla-clientes');
    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#64748b">No se encontraron clientes</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    clientes.forEach(c => {
        const botonEliminar = usuario.rol === 'admin'
            ? `<button class="btn-danger" onclick="eliminarCliente(${c.id})">Eliminar</button>` : '';
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${c.nombre_empresa}</strong></td>
                <td>${c.sector || '-'}</td>
                <td>${c.ciudad || '-'}</td>
                <td>${c.telefono || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>
                    <button class="btn-secondary" onclick="verContactos(${c.id})" style="padding:6px 12px;font-size:12px;margin-right:6px">Contactos</button>
                    <button class="btn-edit" onclick="editarCliente(${c.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

function filtrarClientes() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaClientes.filter(c =>
        (c.nombre_empresa && c.nombre_empresa.toLowerCase().includes(texto)) ||
        (c.sector && c.sector.toLowerCase().includes(texto)) ||
        (c.ciudad && c.ciudad.toLowerCase().includes(texto))
    );
    mostrarClientes(filtrados);
}

function verContactos(id) {
    window.location.href = `contactos.html?cliente=${id}`;
}

function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Cliente';
    document.getElementById('formCliente').reset();
    document.getElementById('cliente-id').value = '';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

async function editarCliente(id) {
    try {
        const respuesta = await fetch(`${API_URL}/clientes/${id}`, { headers });
        const c = await respuesta.json();
        document.getElementById('modal-titulo').textContent = 'Editar Cliente';
        document.getElementById('cliente-id').value = c.id;
        document.getElementById('nombre_empresa').value = c.nombre_empresa;
        document.getElementById('sector').value = c.sector || '';
        document.getElementById('ciudad').value = c.ciudad || '';
        document.getElementById('telefono').value = c.telefono || '';
        document.getElementById('email').value = c.email || '';
        document.getElementById('modal').classList.add('active');
    } catch (error) { alert('Error al cargar el cliente'); }
}

async function eliminarCliente(id) {
    if (!confirm('¿Estas seguro? Se eliminaran sus contactos y certificados.')) return;
    try {
        await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE', headers });
        cargarClientes();
    } catch (error) { alert('Error al eliminar'); }
}

document.getElementById('formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cliente-id').value;
    const datos = {
        nombre_empresa: document.getElementById('nombre_empresa').value,
        sector: document.getElementById('sector').value,
        ciudad: document.getElementById('ciudad').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value
    };
    try {
        const url = id ? `${API_URL}/clientes/${id}` : `${API_URL}/clientes`;
        const metodo = id ? 'PUT' : 'POST';
        await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        cerrarModal();
        cargarClientes();
    } catch (error) { alert('Error al guardar'); }
});

function exportarCSV() {
    if (listaClientes.length === 0) { alert('No hay clientes para exportar'); return; }
    const cabeceras = ['Nombre Empresa', 'Sector', 'Ciudad', 'Telefono', 'Email'];
    const filas = listaClientes.map(c => [c.nombre_empresa, c.sector || '', c.ciudad || '', c.telefono || '', c.email || '']);
    let csv = cabeceras.join(';') + '\n';
    filas.forEach(f => { csv += f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';') + '\n'; });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
}

cargarClientes();