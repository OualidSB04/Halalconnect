// certificaciones.js - CRUD completo de certificaciones

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaCertificaciones = [];

async function cargarClientes() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes`, { headers });
        const clientes = await respuesta.json();
        const select = document.getElementById('cliente_id');
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre_empresa}</option>`;
        });
    } catch (error) { console.error('Error al cargar clientes:', error); }
}

async function cargarCertificaciones() {
    try {
        const respuesta = await fetch(`${API_URL}/certificaciones`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaCertificaciones = await respuesta.json();
        mostrarCertificaciones(listaCertificaciones);
    } catch (error) { console.error('Error:', error); }
}

function calcularEstado(fechaCaducidad) {
    const hoy = new Date();
    const dias = Math.ceil((new Date(fechaCaducidad) - hoy) / (1000 * 60 * 60 * 24));
    if (dias < 0) return { clase: 'badge-caducado', texto: 'Caducado' };
    if (dias <= 30) return { clase: 'badge-pendiente', texto: `${dias} dias` };
    return { clase: 'badge-activo', texto: 'Activo' };
}

function mostrarCertificaciones(certs) {
    const tbody = document.getElementById('tabla-certificaciones');
    if (certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b">No se encontraron certificaciones</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    certs.forEach(c => {
        const estado = calcularEstado(c.fecha_caducidad);
        const botonEliminar = usuario.rol === 'admin'
            ? `<button class="btn-danger" onclick="eliminarCertificacion(${c.id})">Eliminar</button>` : '';
        tbody.innerHTML += `
            <tr>
                <td style="color:#10b981;font-weight:500">${c.numero_certificado}</td>
                <td><strong style="color:#f8fafc">${c.nombre_empresa || '-'}</strong></td>
                <td>${c.tipo || '-'}</td>
                <td>${new Date(c.fecha_emision).toLocaleDateString('es-ES')}</td>
                <td>${new Date(c.fecha_caducidad).toLocaleDateString('es-ES')}</td>
                <td><span class="badge-estado ${estado.clase}">${estado.texto}</span></td>
                <td>
                    <button class="btn-edit" onclick="editarCertificacion(${c.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

function filtrarCertificaciones() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaCertificaciones.filter(c =>
        (c.numero_certificado && c.numero_certificado.toLowerCase().includes(texto)) ||
        (c.nombre_empresa && c.nombre_empresa.toLowerCase().includes(texto)) ||
        (c.tipo && c.tipo.toLowerCase().includes(texto))
    );
    mostrarCertificaciones(filtrados);
}

function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nueva Certificacion';
    document.getElementById('formCertificacion').reset();
    document.getElementById('cert-id').value = '';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

async function editarCertificacion(id) {
    try {
        const c = listaCertificaciones.find(x => x.id === id);
        if (!c) return;
        document.getElementById('modal-titulo').textContent = 'Editar Certificacion';
        document.getElementById('cert-id').value = c.id;
        document.getElementById('cliente_id').value = c.cliente_id;
        document.getElementById('numero_certificado').value = c.numero_certificado;
        document.getElementById('tipo').value = c.tipo || '';
        document.getElementById('fecha_emision').value = c.fecha_emision.split('T')[0];
        document.getElementById('fecha_caducidad').value = c.fecha_caducidad.split('T')[0];
        document.getElementById('modal').classList.add('active');
    } catch (error) { alert('Error al cargar la certificacion'); }
}

async function eliminarCertificacion(id) {
    if (!confirm('¿Estas seguro de eliminar esta certificacion?')) return;
    try {
        await fetch(`${API_URL}/certificaciones/${id}`, { method: 'DELETE', headers });
        cargarCertificaciones();
    } catch (error) { alert('Error al eliminar'); }
}

document.getElementById('formCertificacion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cert-id').value;
    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        numero_certificado: document.getElementById('numero_certificado').value,
        tipo: document.getElementById('tipo').value,
        fecha_emision: document.getElementById('fecha_emision').value,
        fecha_caducidad: document.getElementById('fecha_caducidad').value
    };
    try {
        const url = id ? `${API_URL}/certificaciones/${id}` : `${API_URL}/certificaciones`;
        const metodo = id ? 'PUT' : 'POST';
        await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        cerrarModal();
        cargarCertificaciones();
    } catch (error) { alert('Error al guardar'); }
});

function exportarCSV() {
    if (listaCertificaciones.length === 0) { alert('No hay datos para exportar'); return; }
    const cabeceras = ['Numero', 'Empresa', 'Tipo', 'Emision', 'Caducidad'];
    const filas = listaCertificaciones.map(c => [
        c.numero_certificado, c.nombre_empresa || '',
        c.tipo || '',
        new Date(c.fecha_emision).toLocaleDateString('es-ES'),
        new Date(c.fecha_caducidad).toLocaleDateString('es-ES')
    ]);
    let csv = cabeceras.join(';') + '\n';
    filas.forEach(f => { csv += f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';') + '\n'; });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `certificaciones_${new Date().toISOString().split('T')[0]}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
}

cargarClientes();
cargarCertificaciones();