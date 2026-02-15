// logica de la pagina de certificaciones halal
// CRUD + busqueda + exportar CSV + sistema de badges segun la caducidad

const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token) {
    window.location.href = 'index.html';
}

const spanUsuario = document.getElementById('usuario-nombre');
spanUsuario.innerHTML = `<a href="perfil.html" style="color: white; text-decoration: none;">${usuario.nombre}</a>`;

function añadirEnlaceUsuarios() {
    if (usuario.rol === 'admin') {
        const menu = document.querySelector('.navbar-menu');
        const enlaceUsuarios = document.createElement('a');
        enlaceUsuarios.href = 'usuarios.html';
        enlaceUsuarios.textContent = 'Usuarios';
        
        const certEnlace = menu.querySelector('a[href="certificaciones.html"]');
        certEnlace.insertAdjacentElement('afterend', enlaceUsuarios);
    }
}

añadirEnlaceUsuarios();

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaCertificaciones = [];

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// trae las certificaciones del backend
async function cargarCertificaciones() {
    try {
        const respuesta = await fetch(`${API_URL}/certificaciones`, { headers });
        
        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesion();
            return;
        }
        
        listaCertificaciones = await respuesta.json();
        mostrarCertificaciones(listaCertificaciones);
    } catch (error) {
        console.error('Error al cargar certificaciones:', error);
        alert('Error al conectar con el servidor');
    }
}

// pinta las certificaciones en la tabla con badges segun el estado
function mostrarCertificaciones(certificaciones) {
    const tbody = document.getElementById('tabla-certificaciones');
    
    if (certificaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">No se encontraron certificaciones</td></tr>';
        return;
    }
    
    const hoy = new Date();
    tbody.innerHTML = '';
    
    certificaciones.forEach(cert => {
        const fechaEmision = new Date(cert.fecha_emision).toLocaleDateString('es-ES');
        const fechaCaducidad = new Date(cert.fecha_caducidad);
        const fechaCadFormat = fechaCaducidad.toLocaleDateString('es-ES');
        
        // calculamos los dias que quedan para que caduque
        const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
        
        // segun los dias que queden, le ponemos un badge u otro
        let estado = 'Activo';
        let badge = 'badge-success';
        
        if (diasRestantes < 0) {
            estado = 'Caducado';
            badge = 'badge-danger';
        } else if (diasRestantes <= 30) {
            estado = `Caduca en ${diasRestantes} dias`;
            badge = 'badge-warning';
        }
        
        // boton eliminar solo para admin
        const botonEliminar = usuario.rol === 'admin' 
            ? `<button class="btn-danger" onclick="eliminarCertificacion(${cert.id})">Eliminar</button>` 
            : '';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${cert.nombre_empresa}</strong></td>
                <td>${cert.numero_certificado}</td>
                <td>${cert.tipo || '-'}</td>
                <td>${fechaEmision}</td>
                <td>${fechaCadFormat}</td>
                <td><span class="badge ${badge}">${estado}</span></td>
                <td>
                    <button class="btn-edit" onclick="editarCertificacion(${cert.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

// filtro de busqueda
function filtrarCertificaciones() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    
    const filtradas = listaCertificaciones.filter(cert => {
        return (cert.nombre_empresa && cert.nombre_empresa.toLowerCase().includes(texto)) ||
               (cert.numero_certificado && cert.numero_certificado.toLowerCase().includes(texto)) ||
               (cert.tipo && cert.tipo.toLowerCase().includes(texto));
    });
    
    mostrarCertificaciones(filtradas);
}

// rellena el desplegable de clientes en el modal
async function cargarClientesSelect() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes`, { headers });
        const clientes = await respuesta.json();
        
        const select = document.getElementById('cliente_id');
        select.innerHTML = '<option value="">Selecciona un cliente</option>';
        
        clientes.forEach(cliente => {
            select.innerHTML += `<option value="${cliente.id}">${cliente.nombre_empresa}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
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

// rellena el modal con los datos de la certificacion a editar
async function editarCertificacion(id) {
    try {
        // buscamos la certificacion en la lista que ya tenemos cargada
        const cert = listaCertificaciones.find(c => c.id === id);
        
        if (!cert) {
            alert('Certificacion no encontrada');
            return;
        }
        
        document.getElementById('modal-titulo').textContent = 'Editar Certificacion';
        document.getElementById('cert-id').value = cert.id;
        document.getElementById('cliente_id').value = cert.cliente_id;
        document.getElementById('numero_certificado').value = cert.numero_certificado;
        document.getElementById('tipo').value = cert.tipo || '';
        
        // las fechas del backend vienen con formato ISO (con la hora)
        // los inputs type="date" necesitan solo YYYY-MM-DD
        // el .split('T')[0] coge solo la parte de la fecha
        document.getElementById('fecha_emision').value = cert.fecha_emision.split('T')[0];
        document.getElementById('fecha_caducidad').value = cert.fecha_caducidad.split('T')[0];
        
        document.getElementById('modal').classList.add('active');
    } catch (error) {
        alert('Error al cargar la certificacion');
    }
}

async function eliminarCertificacion(id) {
    if (!confirm('Estas seguro de eliminar esta certificacion?')) return;
    
    try {
        await fetch(`${API_URL}/certificaciones/${id}`, { method: 'DELETE', headers });
        cargarCertificaciones();
    } catch (error) {
        alert('Error al eliminar la certificacion');
    }
}

// guardar (crear o editar)
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
        
        if (id) datos.estado = 'activo';
        
        await fetch(url, {
            method: metodo,
            headers,
            body: JSON.stringify(datos)
        });
        
        cerrarModal();
        cargarCertificaciones();
    } catch (error) {
        alert('Error al guardar la certificacion');
    }
});

// exporta las certificaciones a CSV con su estado calculado
function exportarCSV() {
    if (listaCertificaciones.length === 0) {
        alert('No hay certificaciones para exportar');
        return;
    }
    
    const cabeceras = ['Empresa', 'Numero Certificado', 'Tipo', 'Fecha Emision', 'Fecha Caducidad', 'Estado'];
    
    const hoy = new Date();
    const filas = listaCertificaciones.map(c => {
        const fechaCad = new Date(c.fecha_caducidad);
        const diasRestantes = Math.ceil((fechaCad - hoy) / (1000 * 60 * 60 * 24));
        let estadoActual = 'Activo';
        if (diasRestantes < 0) estadoActual = 'Caducado';
        else if (diasRestantes <= 30) estadoActual = `Caduca en ${diasRestantes} dias`;
        
        return [
            c.nombre_empresa || '',
            c.numero_certificado || '',
            c.tipo || '',
            new Date(c.fecha_emision).toLocaleDateString('es-ES'),
            new Date(c.fecha_caducidad).toLocaleDateString('es-ES'),
            estadoActual
        ];
    });
    
    let csv = cabeceras.join(';') + '\n';
    filas.forEach(fila => {
        const filaEscapada = fila.map(campo => `"${String(campo).replace(/"/g, '""')}"`);
        csv += filaEscapada.join(';') + '\n';
    });
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    
    const fecha = new Date().toISOString().split('T')[0];
    enlace.href = url;
    enlace.download = `certificaciones_halalconnect_${fecha}.csv`;
    enlace.click();
    
    URL.revokeObjectURL(url);
}

cargarClientesSelect();
cargarCertificaciones();