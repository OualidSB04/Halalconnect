// usuarios.js - gestion de usuarios (solo admin)

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

if (usuario.rol !== 'admin') window.location.href = 'dashboard.html';

let listaUsuarios = [];

async function cargarUsuarios() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaUsuarios = await respuesta.json();
        mostrarUsuarios(listaUsuarios);
    } catch (error) { console.error('Error:', error); }
}

function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios');
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#64748b">No se encontraron usuarios</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        const esTuCuenta = u.id === usuario.id;
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${u.nombre} ${esTuCuenta ? '<span style="color:#10b981;font-size:11px">(tu cuenta)</span>' : ''}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge-estado ${u.rol === 'admin' ? 'badge-activo' : 'badge-pendiente'}">${u.rol}</span></td>
                <td>${new Date(u.creado_en).toLocaleDateString('es-ES')}</td>
                <td>
                    <button class="btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
                    ${!esTuCuenta ? `<button class="btn-danger" onclick="eliminarUsuario(${u.id})">Eliminar</button>` : ''}
                </td>
            </tr>
        `;
    });
}

function filtrarUsuarios() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaUsuarios.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(texto)) ||
        (u.email && u.email.toLowerCase().includes(texto)) ||
        (u.rol && u.rol.toLowerCase().includes(texto))
    );
    mostrarUsuarios(filtrados);
}

function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('grupo-password').style.display = 'block';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

function editarUsuario(id) {
    const u = listaUsuarios.find(x => x.id === id);
    if (!u) return;
    document.getElementById('modal-titulo').textContent = 'Editar Usuario';
    document.getElementById('usuario-id').value = u.id;
    document.getElementById('nombre').value = u.nombre;
    document.getElementById('email').value = u.email;
    document.getElementById('rol').value = u.rol;
    document.getElementById('grupo-password').style.display = 'none';
    document.getElementById('modal').classList.add('active');
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estas seguro de eliminar este usuario?')) return;
    try {
        await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE', headers });
        cargarUsuarios();
    } catch (error) { alert('Error al eliminar'); }
}

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('usuario-id').value;
    const datos = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        rol: document.getElementById('rol').value
    };
    if (!id) datos.password = document.getElementById('password').value;
    try {
        const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios/registro`;
        const metodo = id ? 'PUT' : 'POST';
        await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        cerrarModal();
        cargarUsuarios();
    } catch (error) { alert('Error al guardar'); }
});

cargarUsuarios();