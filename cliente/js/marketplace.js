// marketplace.js - cara publica del marketplace Halal
// pagina publica SIN login: cualquier musulman puede ver los productos

const API_URL = 'http://localhost:5000/api';

let listaProductos = [];

// comprueba si un producto tiene certificado vigente
function tieneCertificadoVigente(producto) {
    if (!producto.cert_caducidad) return false;
    return new Date(producto.cert_caducidad) >= new Date();
}

// trae todos los productos del backend (endpoint publico, sin token)
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/productos/publico/buscar`);
        listaProductos = await respuesta.json();
        mostrarProductos(listaProductos);
        cargarCategorias();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        document.getElementById('grid-productos').innerHTML =
            '<p style="color:var(--text-dim)">No se pudieron cargar los productos.</p>';
    }
}

// rellena el filtro de categorias con las categorias unicas
function cargarCategorias() {
    const categorias = [...new Set(listaProductos.map(p => p.categoria_nombre).filter(Boolean))];
    const select = document.getElementById('filtro-categoria');
    categorias.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

// pinta los productos en el grid del marketplace
function mostrarProductos(productos) {
    const grid = document.getElementById('grid-productos');

    if (productos.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-dim)">No se encontraron productos.</p>';
        return;
    }

    grid.innerHTML = '';
    productos.forEach((p, i) => {
        const imagen = p.imagen_url && p.imagen_url.startsWith('http')
            ? p.imagen_url
            : `https://placehold.co/400x300/151d2e/10b981?text=${encodeURIComponent(p.nombre || 'Halal')}`;

        const precio = p.precio && p.precio > 0
            ? `${parseFloat(p.precio).toFixed(2)} <span>€</span>`
            : '<span>Consultar</span>';

        // mostramos el sello SOLO si el producto tiene certificado vigente
        const sello = tieneCertificadoVigente(p)
            ? '<div class="mk-verified">✓ Certificado Halal verificado</div>'
            : '<div class="mk-verified" style="background:rgba(100,116,139,0.15);color:#94a3b8;border-color:rgba(100,116,139,0.3)">Certificación pendiente</div>';

        const card = document.createElement('div');
        card.className = 'mk-card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.onclick = () => verProducto(p.id);

        card.innerHTML = `
            <img src="${imagen}" class="mk-card-img" alt="${p.nombre}"
                 onerror="this.src='https://placehold.co/400x300/151d2e/10b981?text=${encodeURIComponent(p.nombre || 'Halal')}'">
            <div class="mk-card-body">
                <div class="mk-card-cat">${p.categoria_nombre || 'Producto'}</div>
                <div class="mk-card-name">${p.nombre}</div>
                <div class="mk-card-brand">${p.marca || p.nombre_empresa || 'Marca Halal'}</div>
                ${sello}
                <div class="mk-card-foot">
                    <div class="mk-card-price">${precio}</div>
                </div>
                <button class="mk-card-btn" onclick='event.stopPropagation(); añadirAlCarrito(${JSON.stringify({id: p.id, nombre: p.nombre, precio: p.precio})})'>
                    Añadir al carrito
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// filtra por texto de busqueda y por categoria
function filtrarProductos() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;

    const filtrados = listaProductos.filter(p => {
        const coincideTexto = !texto ||
            (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
            (p.marca && p.marca.toLowerCase().includes(texto)) ||
            (p.nombre_empresa && p.nombre_empresa.toLowerCase().includes(texto));
        const coincideCategoria = !categoria || p.categoria_nombre === categoria;
        return coincideTexto && coincideCategoria;
    });

    mostrarProductos(filtrados);
}

// abre la ficha del producto
function verProducto(id) {
    window.location.href = `item.html?id=${id}`;
}

cargarProductos();