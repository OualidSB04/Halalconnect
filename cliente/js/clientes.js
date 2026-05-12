// logica de la pagina de clientes
// CRUD completo (crear, ver, editar, eliminar) + busqueda + exportar CSV + acceso a contactos

const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

// si no hay token, no estas logueado, te mandamos al login
if (!token) {
    window.location.href = 'index.html';
}

// mostramos el nombre del usuario en la navbar (clickable, lleva al perfil)
const spanUsuario = document.getElementById('usuario-nombre');
spanUsuario.innerHTML = `<a href="perfil.html" style="color: white; text-decoration: none;">${usuario.nombre}</a>`;

// si el usuario es admin, le anadimos un enlace "Usuarios" en la navbar
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

// headers que mandaremos en todas las peticiones para autenticarnos
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// guardamos la lista de clientes en una variable global
// asi la busqueda puede filtrarla sin volver a llamar al backend
let listaClientes = [];

// cierra sesion borrando el token y el usuario del localStorage
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// trae los clientes del backend y los pinta en la tabla
async function cargarClientes() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes`, { headers });
        
        // si el token caduca o es invalido, te echamos al login
        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesion();
            return;
        }
        
        listaClientes = await respuesta.json();
        mostrarClientes(listaClientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        alert('Error al conectar con el servidor');
    }
}

// pinta la lista de clientes en la tabla
function mostrarClientes(clientes) {
    const tbody = document.getElementById('tabla-clientes');
    
    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No se encontraron clientes</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    clientes.forEach(cliente => {
        // el boton eliminar solo lo ven los admins
        const botonEliminar = usuario.rol === 'admin' 
            ? `<button class="btn-danger" onclick="eliminarCliente(${cliente.id})">Eliminar</button>` 
            : '';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${cliente.nombre_empresa}</strong></td>
                <td>${cliente.sector || '-'}</td>
                <td>${cliente.ciudad || '-'}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>${cliente.email || '-'}</td>
                <td>
                    <button class="btn-secondary" onclick="verContactos(${cliente.id})">Contactos</button>
                    <button class="btn-edit" onclick="editarCliente(${cliente.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

// abre la pagina de contactos del cliente seleccionado
function verContactos(id) {
    window.location.href = `contactos.html?cliente=${id}`;
}

// filtra la lista de clientes a medida que el usuario escribe en el buscador
function filtrarClientes() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    
    const filtrados = listaClientes.filter(cliente => {
        return (cliente.nombre_empresa && cliente.nombre_empresa.toLowerCase().includes(texto)) ||
               (cliente.sector && cliente.sector.toLowerCase().includes(texto)) ||
               (cliente.ciudad && cliente.ciudad.toLowerCase().includes(texto));
    });
    
    mostrarClientes(filtrados);
}

// abre el modal vacio para crear un cliente nuevo
function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Cliente';
    document.getElementById('formCliente').reset();
    document.getElementById('cliente-id').value = '';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

// abre el modal con los datos del cliente para editarlo
async function editarCliente(id) {
    try {
        const respuesta = await fetch(`${API_URL}/clientes/${id}`, { headers });
        const cliente = await respuesta.json();
        
        document.getElementById('modal-titulo').textContent = 'Editar Cliente';
        document.getElementById('cliente-id').value = cliente.id;
        document.getElementById('nombre_empresa').value = cliente.nombre_empresa;
        document.getElementById('sector').value = cliente.sector || '';
        document.getElementById('ciudad').value = cliente.ciudad || '';
        document.getElementById('telefono').value = cliente.telefono || '';
        document.getElementById('email').value = cliente.email || '';
        
        document.getElementById('modal').classList.add('active');
    } catch (error) {
        alert('Error al cargar el cliente');
    }
}

// elimina un cliente despues de confirmar
async function eliminarCliente(id) {
    if (!confirm('¿Estas seguro de eliminar este cliente? Se eliminaran tambien sus contactos y certificados.')) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE', headers });
        cargarClientes();
    } catch (error) {
        alert('Error al eliminar el cliente');
    }
}

// gestiona el envio del formulario tanto para crear como para editar
document.getElementById('formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('cliente-id').value;
    const datos = {
        nombre_empresa: document.getElementById('nombre_empresa').value,
        sector: document.getElementById('sector').value,
        ciudad: document.getElementById('ciudad').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value
    };
    
    try {
        // si hay id, es edicion (PUT). si no, es creacion (POST)
        const url = id ? `${API_URL}/clientes/${id}` : `${API_URL}/clientes`;
        const metodo = id ? 'PUT' : 'POST';
        
        await fetch(url, {
            method: metodo,
            headers,
            body: JSON.stringify(datos)
        });
        
        cerrarModal();
        cargarClientes();
    } catch (error) {
        alert('Error al guardar el cliente');
    }
});

// exporta la lista actual de clientes a un archivo CSV
// se puede abrir directamente en Excel
function exportarCSV() {
    if (listaClientes.length === 0) {
        alert('No hay clientes para exportar');
        return;
    }
    
    const cabeceras = ['Nombre Empresa', 'Sector', 'Ciudad', 'Telefono', 'Email', 'Fecha Creacion'];
    
    const filas = listaClientes.map(c => [
        c.nombre_empresa || '',
        c.sector || '',
        c.ciudad || '',
        c.telefono || '',
        c.email || '',
        new Date(c.creado_en).toLocaleDateString('es-ES')
    ]);
    
    // construimos el CSV: separamos los campos por ; y las filas por salto de linea
    let csv = cabeceras.join(';') + '\n';
    filas.forEach(fila => {
        const filaEscapada = fila.map(campo => `"${String(campo).replace(/"/g, '""')}"`);
        csv += filaEscapada.join(';') + '\n';
    });
    
    // BOM para que Excel detecte UTF-8 y muestre las tildes bien
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    
    // ponemos la fecha de hoy en el nombre del archivo
    const fecha = new Date().toISOString().split('T')[0];
    enlace.href = url;
    enlace.download = `clientes_halalconnect_${fecha}.csv`;
    enlace.click();
    
    URL.revokeObjectURL(url);
}

cargarClientes();