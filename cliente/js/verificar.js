// verificar.js - verificacion publica de certificados Halal
// pagina publica SIN login

const API_URL = 'http://localhost:5000/api';

// verifica un certificado por su numero
async function verificar() {
    const numero = document.getElementById('numero').value.trim();

    if (!numero) {
        alert('Por favor introduce un numero de certificado');
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/certificaciones/verificar/${numero}`);
        const datos = await respuesta.json();

        // el backend devuelve { valido, caducado, certificado, mensaje }
        // si viene un certificado lo mostramos (vigente o caducado)
        // solo decimos "no encontrado" si NO hay certificado
        if (datos.certificado) {
            mostrarResultado(datos.certificado, datos.caducado);
        } else {
            mostrarInvalido(numero);
        }

    } catch (error) {
        console.error('Error al verificar:', error);
        mostrarInvalido(numero);
    }
}

// muestra el resultado de un certificado encontrado
function mostrarResultado(cert, caducado) {
    const resultado = document.getElementById('resultado');
    const vigente = !caducado;

    // elegimos el estilo segun si esta vigente o caducado
    const claseCard = vigente ? 'valido' : 'caducado';
    const icono = vigente ? '✓' : '⏱';
    const titulo = vigente ? 'Certificado Válido' : 'Certificado Caducado';
    const sub = vigente
        ? 'Este certificado es auténtico y está vigente'
        : 'Este certificado existe pero ha caducado';

    resultado.innerHTML = `
        <div class="ver-card ${claseCard}">
            <div class="ver-card-head">
                <div class="ver-card-badge">${icono}</div>
                <div>
                    <div class="ver-card-titulo">${titulo}</div>
                    <div class="ver-card-sub">${sub}</div>
                </div>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Número de certificado</span>
                <span class="ver-row-value">${cert.numero_certificado}</span>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Empresa</span>
                <span class="ver-row-value">${cert.nombre_empresa || '-'}</span>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Tipo</span>
                <span class="ver-row-value">${cert.tipo || 'Halal'}</span>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Ciudad</span>
                <span class="ver-row-value">${cert.ciudad || '-'}</span>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Fecha de emisión</span>
                <span class="ver-row-value">${new Date(cert.fecha_emision).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Válido hasta</span>
                <span class="ver-row-value">${new Date(cert.fecha_caducidad).toLocaleDateString('es-ES')}</span>
            </div>
        </div>
    `;
    resultado.classList.add('show');
}

// muestra el resultado cuando no se encuentra el certificado
function mostrarInvalido(numero) {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
        <div class="ver-card invalido">
            <div class="ver-card-head">
                <div class="ver-card-badge">✗</div>
                <div>
                    <div class="ver-card-titulo">Certificado No Encontrado</div>
                    <div class="ver-card-sub">No existe ningún certificado con ese número</div>
                </div>
            </div>
            <div class="ver-row">
                <span class="ver-row-label">Número buscado</span>
                <span class="ver-row-value">${numero}</span>
            </div>
            <p style="margin-top:16px;font-size:14px;color:var(--text-muted);line-height:1.6">
                Este número no corresponde a ningún certificado registrado en nuestra plataforma.
                Si crees que un producto se vende como Halal sin estarlo, puedes reportarlo.
            </p>
        </div>
    `;
    resultado.classList.add('show');
}