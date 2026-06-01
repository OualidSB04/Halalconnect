// sidebar.js - logica compartida del sidebar
// se incluye en todas las paginas del panel privado

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

// si no hay token redirigimos al login
if (!token) window.location.href = 'index.html';

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// genera las iniciales del usuario pa el avatar
function obtenerIniciales(nombre) {
    if (!nombre) return 'U';
    const partes = nombre.split(' ');
    if (partes.length >= 2) return partes[0][0] + partes[1][0];
    return nombre[0].toUpperCase();
}

// genera el HTML completo del sidebar segun el rol del usuario
function generarSidebar(paginaActiva) {
    const esAdmin = usuario.rol === 'admin';
    const iniciales = obtenerIniciales(usuario.nombre);

    const html = `
        <div class="sidebar">
            <div class="sidebar-logo">
                <div class="sidebar-logo-icon">☪</div>
                <div>
                    <div class="sidebar-logo-text">HalalConnect</div>
                    <div class="sidebar-logo-sub">Plataforma Halal</div>
                </div>
            </div>

            <div class="sidebar-section">Principal</div>
            <a href="dashboard.html" class="sidebar-item ${paginaActiva === 'dashboard' ? 'active' : ''}">
                📊 Dashboard
            </a>
            <a href="clientes.html" class="sidebar-item ${paginaActiva === 'clientes' ? 'active' : ''}">
                🏢 Clientes
            </a>
            <a href="certificaciones.html" class="sidebar-item ${paginaActiva === 'certificaciones' ? 'active' : ''}">
                📜 Certificaciones
            </a>

            <div class="sidebar-section">Catalogo</div>
            <a href="productos.html" class="sidebar-item ${paginaActiva === 'productos' ? 'active' : ''}">
                📦 Productos
            </a>
            <a href="establecimientos.html" class="sidebar-item ${paginaActiva === 'establecimientos' ? 'active' : ''}">
                🏪 Establecimientos
            </a>
            <a href="mapa.html" class="sidebar-item ${paginaActiva === 'mapa' ? 'active' : ''}">
                🗺️ Mapa Halal
            </a>

            ${esAdmin ? `
            <div class="sidebar-section">Administracion</div>
            <a href="denuncias.html" class="sidebar-item ${paginaActiva === 'denuncias' ? 'active' : ''}">
                🚨 Denuncias
                <span class="sidebar-badge red" id="badge-denuncias"></span>
            </a>
            <a href="pedidos.html" class="sidebar-item ${paginaActiva === 'pedidos' ? 'active' : ''}">
                🛒 Pedidos
            </a>
            <a href="historial.html" class="sidebar-item ${paginaActiva === 'historial' ? 'active' : ''}">
                📋 Historial
            </a>
            <a href="usuarios.html" class="sidebar-item ${paginaActiva === 'usuarios' ? 'active' : ''}">
                👥 Usuarios
            </a>
            ` : ''}

            <div class="sidebar-bottom">
                <div class="sidebar-user">
                    <div class="sidebar-avatar">${iniciales}</div>
                    <div>
                        <div class="sidebar-user-name">${usuario.nombre}</div>
                        <div class="sidebar-user-role">${usuario.rol}</div>
                    </div>
                </div>
                <a href="perfil.html" class="sidebar-item ${paginaActiva === 'perfil' ? 'active' : ''}">
                    👤 Mi Perfil
                </a>
                <a class="sidebar-item danger" onclick="cerrarSesion()" style="cursor:pointer">
                    🚪 Cerrar Sesion
                </a>
            </div>
        </div>

        <div class="main-content">
    `;

    document.body.innerHTML = html + document.body.innerHTML + '</div>';

    // cargamos el numero de denuncias pendientes pa el badge
    if (esAdmin) cargarBadgeDenuncias();
}

// carga el numero de denuncias pendientes pa mostrar en el badge
async function cargarBadgeDenuncias() {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const respuesta = await fetch(`${API_URL}/denuncias`, { headers });
        const denuncias = await respuesta.json();
        const pendientes = denuncias.filter(d => d.estado === 'pendiente').length;
        const badge = document.getElementById('badge-denuncias');
        if (badge && pendientes > 0) {
            badge.textContent = pendientes;
        }
    } catch (error) {
        console.error('Error al cargar denuncias:', error);
    }
}