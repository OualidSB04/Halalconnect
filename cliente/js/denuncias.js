// denuncias.js - gestion de denuncias (solo admin)
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

// si no es admin no tiene acceso
if (usuario.rol !== 'admin') window.location.href = 'dashboard.html';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaDenuncias = [];

// trae todas las denuncias del backend
async function cargarDenuncias() {
    try {
        const respuesta = await fetch(`${API_URL}/denuncias`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaDenuncias = await respuesta.json();
        mostrarDenuncias(listaDenuncias);
        actualizarEstadisticas(listaDenuncias);
    } catch (error) { console.error('Error al cargar denuncias:', error); }
}

// actualiza las tarjetas de estadisticas
function actualizarEstadisticas(denuncias) {
    document.getElementById('total-denuncias').textContent = denuncias.length;
    document.getElementById('denuncias-pendientes').textContent = denuncias.filter(d => d.estado === 'pendiente').length;
    document.getElementById('denuncias-resueltas').textContent = denuncias.filter(d => d.estado === 'resuelta').length;
    document.getElementById('denuncias-rechazadas').textContent = denuncias.filter(d => d.estado === 'rechazada').length;
}

// pinta las denuncias en la tabla
function mostrarDenuncias(denuncias) {
    const tbody = document.getElementById('tabla-denuncias');
    if (denuncias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b">No hay denuncias registradas</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    denuncias.forEach(d => {
        // badge de color segun el estado
        let badgeClase = 'badge-pendiente';
        if (d.estado === 'resuelta') badgeClase = 'badge-activo';
        else if (d.estado === 'rechazada') badgeClase = 'badge-caducado';

        const fecha = new Date(d.creado_en).toLocaleDateString('es-ES');

        // acortamos la descripcion en la tabla, el boton Ver muestra todo
        const descCorta = d.descripcion.length > 35
            ? d.descripcion.substring(0, 35) + '...'
            : d.descripcion;

        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${d.producto_nombre}</strong></td>
                <td>${d.establecimiento || '-'}</td>
                <td style="font-size:13px;color:#94a3b8">${descCorta}</td>
                <td>${d.email_denunciante || 'Anonimo'}</td>
                <td><span class="badge-estado ${badgeClase}">${d.estado}</span></td>
                <td>${fecha}</td>
                <td style="white-space:nowrap">
                    <button class="btn-edit" onclick="verDenuncia(${d.id})">Ver</button>
                    <select onchange="cambiarEstado(${d.id}, this.value)" style="padding:6px 10px;border-radius:6px;border:0.5px solid #334155;background:#0f172a;color:#e2e8f0;margin:0 6px">
                        <option value="pendiente" ${d.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="resuelta" ${d.estado === 'resuelta' ? 'selected' : ''}>Resuelta</option>
                        <option value="rechazada" ${d.estado === 'rechazada' ? 'selected' : ''}>Rechazada</option>
                    </select>
                    <button class="btn-danger" onclick="eliminarDenuncia(${d.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// abre un popup con todos los detalles de la denuncia
function verDenuncia(id) {
    const d = listaDenuncias.find(x => x.id === id);
    if (!d) return;
    document.getElementById('det-producto').textContent = d.producto_nombre;
    document.getElementById('det-establecimiento').textContent = d.establecimiento || 'No especificado';
    document.getElementById('det-descripcion').textContent = d.descripcion;
    document.getElementById('det-email').textContent = d.email_denunciante || 'Anonimo';
    document.getElementById('det-fecha').textContent = new Date(d.creado_en).toLocaleDateString('es-ES');
    document.getElementById('det-estado').textContent = d.estado;
    document.getElementById('modal-detalle').classList.add('active');
}

function cerrarDetalle() {
    document.getElementById('modal-detalle').classList.remove('active');
}

// cambia el estado de una denuncia
async function cambiarEstado(id, estado) {
    try {
        await fetch(`${API_URL}/denuncias/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ estado })
        });
        cargarDenuncias();
    } catch (error) { alert('Error al cambiar el estado'); }
}

// elimina una denuncia
async function eliminarDenuncia(id) {
    if (!confirm('¿Estas seguro de eliminar esta denuncia?')) return;
    try {
        await fetch(`${API_URL}/denuncias/${id}`, { method: 'DELETE', headers });
        cargarDenuncias();
    } catch (error) { alert('Error al eliminar'); }
}

cargarDenuncias();