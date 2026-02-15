// logica de la pagina de gestion de usuarios
// SOLO accesible para admins, CRUD de usuarios del CRM

const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token) {
    window.location.href = 'index.html';
}

// doble proteccion: si por accidente un empleado llega aqui, le echamos
// la proteccion REAL esta en el backend, esto es solo cosmetica
if (usuario.rol !== 'admin') {
    alert('Acceso denegado. Esta pagina es solo para administradores.');
    window.location.href = 'dashboard.html';
}

const spanUsuario = document.getElementById('usuario-nombre');
spanUsuario.innerHTML = `<a href="perfil.html" style="color: white; text-decoration: none;">${usuario.nombre}</a>`;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaUsuarios = [];

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// trae los usuarios del backend
async function cargarUsuarios() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios`, { headers });
        
        if (respuesta.status === 401 || respuesta.status === 403) {
            alert('No tienes permisos para acceder a esta seccion');
            window.location.href = 'dashboard.html';
            return;
        }
        
        listaUsuarios = await respuesta.json();
        mostrarUsuarios(listaUsuarios);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('Error al conectar con el servidor');
    }
}

// pinta los usuarios en la tabla con su rol diferenciado por color
function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay usuarios registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        const fecha = new Date(u.creado_en).toLocaleDateString('es-ES');
        // los admin salen en rojo, los empleados en verde para distinguirlos
        const badgeRol = u.rol === 'admin' ? 'badge-danger' : 'badge-success';
        const labelRol = u.rol === 'admin' ? 'Administrador' : 'Empleado';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${u.nombre}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${badgeRol}">${labelRol}</span></td>
                <td>${fecha}</td>
                <td>
                    <button class="btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
                    <button class="btn-danger" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// busqueda en la lista de usuarios
function filtrarUsuarios() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    
    const filtrados = listaUsuarios.filter(u => {
        return (u.nombre && u.nombre.toLowerCase().includes(texto)) ||
               (u.email && u.email.toLowerCase().includes(texto)) ||
               (u.rol && u.rol.toLowerCase().includes(texto));
    });
    
    mostrarUsuarios(filtrados);
}

// abre el modal vacio para crear un usuario nuevo
function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuario-id').value = '';
    
    // al crear, la contrasena es obligatoria y visible
    document.getElementById('password').required = true;
    document.getElementById('grupo-password').style.display = 'block';
    
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

// rellena el modal con los datos del usuario a editar
function editarUsuario(id) {
    const u = listaUsuarios.find(x => x.id === id);
    if (!u) return;
    
    document.getElementById('modal-titulo').textContent = 'Editar Usuario';
    document.getElementById('usuario-id').value = u.id;
    document.getElementById('nombre').value = u.nombre;
    document.getElementById('email').value = u.email;
    document.getElementById('rol').value = u.rol;
    
    // al editar, el campo password se oculta
    // si quieres cambiarla, se hace desde "Mi Perfil" cada usuario
    document.getElementById('password').required = false;
    document.getElementById('grupo-password').style.display = 'none';
    
    document.getElementById('modal').classList.add('active');
}

// elimina un usuario con proteccion para no borrarse a si mismo
async function eliminarUsuario(id) {
    // no te puedes borrar a ti mismo
    if (id === usuario.id) {
        alert('No puedes eliminar tu propia cuenta');
        return;
    }
    
    if (!confirm('Estas seguro de eliminar este usuario?')) return;
    
    try {
        await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE', headers });
        cargarUsuarios();
    } catch (error) {
        alert('Error al eliminar el usuario');
    }
}

// guardar el usuario (crear o editar)
document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('usuario-id').value;
    
    try {
        if (id) {
            // editar usuario existente (sin tocar la contrasena)
            const datos = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                rol: document.getElementById('rol').value
            };
            
            await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(datos)
            });
        } else {
            // crear usuario nuevo (con contrasena)
            const datos = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                rol: document.getElementById('rol').value
            };
            
            const resp = await fetch(`${API_URL}/usuarios/registro`, {
                method: 'POST',
                headers,
                body: JSON.stringify(datos)
            });
            
            // si el backend devuelve error (ej: email duplicado), lo mostramos
            if (!resp.ok) {
                const error = await resp.json();
                alert(error.error || 'Error al crear el usuario');
                return;
            }
        }
        
        cerrarModal();
        cargarUsuarios();
    } catch (error) {
        alert('Error al guardar el usuario');
    }
});

cargarUsuarios();