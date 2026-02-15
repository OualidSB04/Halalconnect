// logica de la pagina publica de verificacion de certificados halal
// NO requiere login - cualquier consumidor puede acceder
// es la funcionalidad estrella del proyecto

const API_URL = 'http://localhost:5000/api';

document.getElementById('formVerificar').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // trim() quita espacios al principio y al final
    const numero = document.getElementById('numero').value.trim();
    const resultado = document.getElementById('resultado');
    
    if (!numero) {
        resultado.innerHTML = '';
        return;
    }
    
    // mensaje mientras consultamos al backend
    resultado.innerHTML = '<p class="cargando">Verificando...</p>';
    
    try {
        // encodeURIComponent es importante: si el numero tiene caracteres raros
        // (espacios, guiones, etc.) los convierte para que la URL sea valida
        const respuesta = await fetch(`${API_URL}/certificaciones/verificar/${encodeURIComponent(numero)}`);
        const datos = await respuesta.json();
        
        // CASO 1: el certificado no existe -> tarjeta roja
        if (respuesta.status === 404) {
            resultado.innerHTML = `
                <div class="resultado-card resultado-error">
                    <div class="resultado-icon">x</div>
                    <h3>Certificado No Encontrado</h3>
                    <p>Este numero de certificado no existe en nuestra base de datos.</p>
                    <p class="resultado-aviso">No confies en este establecimiento si afirma tener este certificado.</p>
                </div>
            `;
            return;
        }
        
        const cert = datos.certificado;
        const fechaEmision = new Date(cert.fecha_emision).toLocaleDateString('es-ES');
        const fechaCaducidad = new Date(cert.fecha_caducidad).toLocaleDateString('es-ES');
        
        // CASO 2: existe pero esta caducado -> tarjeta amarilla
        if (datos.caducado) {
            resultado.innerHTML = `
                <div class="resultado-card resultado-caducado">
                    <div class="resultado-icon">!</div>
                    <h3>Certificado Caducado</h3>
                    <p>Este certificado existe pero ha caducado.</p>
                    
                    <div class="resultado-datos">
                        <div class="dato-fila">
                            <span class="dato-label">Empresa</span>
                            <span class="dato-valor">${cert.nombre_empresa}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Sector</span>
                            <span class="dato-valor">${cert.sector || '-'}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Ciudad</span>
                            <span class="dato-valor">${cert.ciudad || '-'}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Numero Certificado</span>
                            <span class="dato-valor">${cert.numero_certificado}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Fecha Caducidad</span>
                            <span class="dato-valor">${fechaCaducidad}</span>
                        </div>
                    </div>
                    
                    <p class="resultado-aviso">El establecimiento debe renovar su certificacion.</p>
                </div>
            `;
        } else {
            // CASO 3: certificado valido y en vigor -> tarjeta verde
            resultado.innerHTML = `
                <div class="resultado-card resultado-valido">
                    <div class="resultado-icon">v</div>
                    <h3>Certificado Valido</h3>
                    <p>Este certificado es autentico y esta en vigor.</p>
                    
                    <div class="resultado-datos">
                        <div class="dato-fila">
                            <span class="dato-label">Empresa</span>
                            <span class="dato-valor">${cert.nombre_empresa}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Sector</span>
                            <span class="dato-valor">${cert.sector || '-'}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Ciudad</span>
                            <span class="dato-valor">${cert.ciudad || '-'}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Numero Certificado</span>
                            <span class="dato-valor">${cert.numero_certificado}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Tipo</span>
                            <span class="dato-valor">${cert.tipo || '-'}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Emision</span>
                            <span class="dato-valor">${fechaEmision}</span>
                        </div>
                        <div class="dato-fila">
                            <span class="dato-label">Caducidad</span>
                            <span class="dato-valor">${fechaCaducidad}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        resultado.innerHTML = '<p class="error-msg">Error al conectar con el servidor. Intentalo de nuevo.</p>';
    }
});