// item.js - ficha publica de un producto
// muestra el producto y su certificado Halal SOLO si existe de verdad

const API_URL = 'http://localhost:5000/api';

// recuperamos el id del producto de la URL (ej: item.html?id=5)
const params = new URLSearchParams(window.location.search);
const productoId = params.get('id');

if (!productoId) window.location.href = 'marketplace.html';

// carga el producto y su certificacion
async function cargarProducto() {
    try {
        const respuesta = await fetch(`${API_URL}/productos/publico/${productoId}`);
        const p = await respuesta.json();

        // buscamos el certificado de la empresa usando el endpoint PUBLICO
        let certData = null;
        if (p.cliente_id) {
            try {
                const respCert = await fetch(`${API_URL}/certificaciones/publico/empresa/${p.cliente_id}`);
                if (respCert.ok) {
                    certData = await respCert.json();
                }
            } catch (e) { /* sin certificado, seguimos */ }
        }

        mostrarProducto(p, certData);
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        document.getElementById('contenido-producto').innerHTML =
            '<p style="color:var(--text-dim)">No se pudo cargar el producto.</p>';
    }
}

// pinta el producto en la pagina
function mostrarProducto(p, certData) {
    const imagen = p.imagen_url && p.imagen_url.startsWith('http')
        ? p.imagen_url
        : `https://placehold.co/600x450/151d2e/10b981?text=${encodeURIComponent(p.nombre || 'Halal')}`;

    const precio = p.precio && p.precio > 0
        ? `${parseFloat(p.precio).toFixed(2)} <span>€</span>`
        : '<span>Precio a consultar</span>';

    // decidimos que mostrar segun el estado del certificado
    let cajaIcono = 'ℹ️';
    let cajaTitulo = '';
    let cajaSub = '';
    let certHtml = '';

    if (certData && certData.tiene && !certData.caducado) {
        // CASO 1: certificado VIGENTE → verde, verificado
        const cert = certData.certificado;
        cajaIcono = '☪';
        cajaTitulo = 'Certificado Halal verificado';
        cajaSub = 'Garantía de autenticidad HalalConnect';
        certHtml = `
            <div class="cert-row">
                <span class="cert-row-label">Número de certificado</span>
                <span class="cert-row-value">${cert.numero_certificado}</span>
            </div>
            <div class="cert-row">
                <span class="cert-row-label">Tipo</span>
                <span class="cert-row-value">${cert.tipo || 'Halal'}</span>
            </div>
            <div class="cert-row">
                <span class="cert-row-label">Válido hasta</span>
                <span class="cert-row-value">${new Date(cert.fecha_caducidad).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="cert-row">
                <span class="cert-row-label">Estado</span>
                <span class="cert-row-value" style="color:var(--primary)">✓ Vigente</span>
            </div>
        `;
    } else if (certData && certData.tiene && certData.caducado) {
        // CASO 2: certificado CADUCADO → amarillo
        const cert = certData.certificado;
        cajaIcono = '⏱';
        cajaTitulo = 'Certificado caducado';
        cajaSub = 'La certificación de esta empresa ha expirado';
        certHtml = `
            <div class="cert-row">
                <span class="cert-row-label">Número de certificado</span>
                <span class="cert-row-value">${cert.numero_certificado}</span>
            </div>
            <div class="cert-row">
                <span class="cert-row-label">Caducó el</span>
                <span class="cert-row-value" style="color:var(--amber)">${new Date(cert.fecha_caducidad).toLocaleDateString('es-ES')}</span>
            </div>
        `;
    } else {
        // CASO 3: SIN certificado → aviso neutro
        cajaIcono = 'ℹ️';
        cajaTitulo = 'Certificación no disponible';
        cajaSub = 'Este producto aún no tiene certificado verificado';
        certHtml = `
            <p style="font-size:14px;color:var(--text-muted);line-height:1.6">
                Este producto pertenece a una empresa de la plataforma, pero su certificado
                no está disponible o pendiente de verificación.
            </p>
        `;
    }

    document.getElementById('contenido-producto').innerHTML = `
        <div class="item-grid">
            <div>
                <img src="${imagen}" class="item-img" alt="${p.nombre}"
                     onerror="this.src='https://placehold.co/600x450/151d2e/10b981?text=${encodeURIComponent(p.nombre || 'Halal')}'">
            </div>
            <div>
                <div class="item-cat">${p.categoria_nombre || 'Producto Halal'}</div>
                <h1 class="item-name">${p.nombre}</h1>
                <div class="item-brand">${p.marca || ''} ${p.marca && p.nombre_empresa ? '·' : ''} ${p.nombre_empresa || ''}</div>
                <div class="item-price">${precio}</div>
                <div class="item-desc">${p.descripcion || 'Producto Halal disponible en nuestra red de empresas.'}</div>

                <div class="cert-box">
                    <div class="cert-box-head">
                        <div class="cert-box-icon">${cajaIcono}</div>
                        <div>
                            <div class="cert-box-title">${cajaTitulo}</div>
                            <div class="cert-box-sub">${cajaSub}</div>
                        </div>
                    </div>
                    ${certHtml}
                </div>

                <button class="item-buy-btn" onclick='añadirAlCarrito(${JSON.stringify({id: p.id, nombre: p.nombre, precio: p.precio})})'>
                    Añadir al carrito
                </button>

                <div class="item-store">
                    Vendido por <strong>${p.nombre_empresa || 'Empresa de la plataforma'}</strong>.
                </div>
            </div>
        </div>
    `;
}

cargarProducto();