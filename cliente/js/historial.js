// historial.js - vista del historial de acciones (solo admin)
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

// si no es admin no tiene acceso
if (usuario.rol !== 'admin') window.location.href = 'dashboard.html';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// trae el historial del backend
async function cargarHistorial() {
    try {
        const respuesta = await fetch(`${API_URL}/historial`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        const historial = await respuesta.json();
        mostrarHistorial(historial);
    } catch (error) { console.error('Error al cargar historial:', error); }
}

// pinta el historial en la tabla
function mostrarHistorial(historial) {
    const tbody = document.getElementById('tabla-historial');
    if (historial.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:#64748b">No hay acciones registradas todavia</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    historial.forEach(h => {
        // formateamos la fecha con hora
        const fecha = new Date(h.creado_en).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${h.usuario_nombre || 'Sistema'}</strong></td>
                <td>${h.accion}</td>
                <td><span class="badge-estado badge-activo">${h.tabla_afectada}</span></td>
                <td style="color:#94a3b8">${fecha}</td>
            </tr>
        `;
    });
}

cargarHistorial();