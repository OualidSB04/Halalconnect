// market_map.js - mapa publico de tiendas Halal
// pagina publica SIN login: cualquier consumidor encuentra tiendas cerca

const API_URL = 'http://localhost:5000/api';

// inicializamos el mapa centrado en Espana
const mapa = L.map('mapa').setView([40.4168, -3.7038], 6);

// tiles de OpenStreetMap (gratuito, sin API key)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(mapa);

// crea un icono personalizado segun el tipo de tienda
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

let todasTiendas = [];
let marcadores = [];

// carga las tiendas del backend (endpoint publico)
async function cargarMapa() {
    try {
        const respuesta = await fetch(`${API_URL}/establecimientos/publico/buscar`);
        todasTiendas = await respuesta.json();
        pintarMarcadores(todasTiendas);
    } catch (error) {
        console.error('Error al cargar el mapa:', error);
    }
}

// pinta los marcadores en el mapa
function pintarMarcadores(tiendas) {
    // borramos marcadores anteriores
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];

    // solo las que tienen coordenadas
    const conCoordenadas = tiendas.filter(t => t.latitud && t.longitud);

    conCoordenadas.forEach(t => {
        const icono = iconos[t.tipo] || iconos['default'];
        const marcador = L.marker([t.latitud, t.longitud], { icon: icono })
            .addTo(mapa)
            .bindPopup(`
                <strong>${t.nombre}</strong>
                <p>📍 ${t.direccion || 'Sin direccion'}</p>
                <p>🏙️ ${t.ciudad_nombre || '-'}</p>
                <p>📞 ${t.telefono || 'Sin telefono'}</p>
                <p>✓ Establecimiento verificado</p>
            `);
        marcadores.push(marcador);
    });

    document.getElementById('contador').textContent = conCoordenadas.length;
}

// filtra por texto y por tipo
function filtrarMapa() {
    const texto = document.getElementById('buscar-mapa').value.toLowerCase();
    const tipo = document.getElementById('filtro-tipo').value;

    const filtradas = todasTiendas.filter(t => {
        const coincideTexto = !texto ||
            (t.nombre && t.nombre.toLowerCase().includes(texto)) ||
            (t.ciudad_nombre && t.ciudad_nombre.toLowerCase().includes(texto));
        const coincideTipo = !tipo || t.tipo === tipo;
        return coincideTexto && coincideTipo;
    });

    pintarMarcadores(filtradas);
}

cargarMapa();