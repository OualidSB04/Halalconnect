// mapa.js - mapa interactivo de establecimientos con Leaflet
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// inicializamos el mapa centrado en Espana
const mapa = L.map('mapa').setView([40.4168, -3.7038], 6);

// cargamos las tiles de OpenStreetMap (gratuito, sin API key)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(mapa);

// iconos personalizados por tipo de establecimiento
function crearIcono(emoji, color) {
    return L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#fff;padding:4px 8px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${emoji}</div>`,
        iconAnchor: [30, 15]
    });
}

const iconos = {
    'Restaurante': crearIcono('🍽️ Rest', '#e74c3c'),
    'Carniceria': crearIcono('🥩 Carn', '#e67e22'),
    'Supermercado': crearIcono('🛒 Super', '#27ae60'),
    'Tienda': crearIcono('🏪 Tienda', '#2980b9'),
    'Panaderia': crearIcono('🥖 Pan', '#8e44ad'),
    'default': crearIcono('📍 Halal', '#10b981')
};

let todosEstablecimientos = [];
let marcadores = [];

// carga los establecimientos del backend y los pone en el mapa
async function cargarMapa() {
    try {
        const respuesta = await fetch(`${API_URL}/establecimientos`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        todosEstablecimientos = await respuesta.json();
        pintarMarcadores(todosEstablecimientos);
    } catch (error) { console.error('Error al cargar el mapa:', error); }
}

// pinta los marcadores en el mapa
function pintarMarcadores(establecimientos) {
    // borramos los marcadores anteriores
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];

    // solo los que tienen coordenadas
    const conCoordenadas = establecimientos.filter(e => e.latitud && e.longitud);

    conCoordenadas.forEach(e => {
        const icono = iconos[e.tipo] || iconos['default'];
        const marcador = L.marker([e.latitud, e.longitud], { icon: icono })
            .addTo(mapa)
            .bindPopup(`
                <strong>${e.nombre}</strong>
                <p>📍 ${e.direccion || 'Sin direccion'}</p>
                <p>🏙️ ${e.ciudad_nombre || '-'}</p>
                <p>📞 ${e.telefono || 'Sin telefono'}</p>
                <p>🏢 ${e.nombre_empresa || '-'}</p>
            `);
        marcadores.push(marcador);
    });

    document.getElementById('contador').textContent = conCoordenadas.length;
}

// filtra los marcadores segun el texto y el tipo
function filtrarMapa() {
    const texto = document.getElementById('buscar-mapa').value.toLowerCase();
    const tipo = document.getElementById('filtro-tipo').value;

    const filtrados = todosEstablecimientos.filter(e => {
        const coincideTexto = !texto ||
            (e.nombre && e.nombre.toLowerCase().includes(texto)) ||
            (e.ciudad_nombre && e.ciudad_nombre.toLowerCase().includes(texto)) ||
            (e.nombre_empresa && e.nombre_empresa.toLowerCase().includes(texto));
        const coincideTipo = !tipo || e.tipo === tipo;
        return coincideTexto && coincideTipo;
    });

    pintarMarcadores(filtrados);
}

// centra el mapa en Espana completa y limpia los filtros
function centrarEspana() {
    mapa.setView([40.4168, -3.7038], 6);
    document.getElementById('buscar-mapa').value = '';
    document.getElementById('filtro-tipo').value = '';
    filtrarMapa();
}

cargarMapa();