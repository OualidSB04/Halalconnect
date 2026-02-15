// logica de "Mi Perfil"
// cada usuario puede ver y modificar sus datos personales y cambiar la contrasena

const API_URL = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
// le ponemos let en vez de const porque vamos a actualizar el usuario cuando edite
let usuario = JSON.parse(localStorage.getItem('usuario'));

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

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// trae los datos del usuario logueado del backend
async function cargarPerfil() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios/mi-perfil`, { headers });
        
        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesion();
            return;
        }
        
        const datos = await respuesta.json();
        
        // rellenamos el formulario con los datos actuales
        document.getElementById('nombre').value = datos.nombre;
        document.getElementById('email').value = datos.email;
        // rol y fecha son solo informativos (disabled en el HTML)
        document.getElementById('rol').value = datos.rol === 'admin' ? 'Administrador' : 'Empleado';
        document.getElementById('creado_en').value = new Date(datos.creado_en).toLocaleDateString('es-ES');
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error al conectar con el servidor');
    }
}

// formulario para actualizar nombre y email
document.getElementById('formPerfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datos = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value
    };
    
    try {
        const respuesta = await fetch(`${API_URL}/usuarios/mi-perfil`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(datos)
        });
        
        if (!respuesta.ok) {
            const error = await respuesta.json();
            alert(error.error || 'Error al actualizar el perfil');
            return;
        }
        
        const usuarioActualizado = await respuesta.json();
        
        // actualizamos los datos en el localStorage para que se reflejen en toda la app
        usuario.nombre = usuarioActualizado.nombre;
        usuario.email = usuarioActualizado.email;
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // refrescamos el nombre en la navbar al instante (sin recargar)
        document.getElementById('usuario-nombre').innerHTML = `<a href="perfil.html" style="color: white; text-decoration: none;">${usuario.nombre}</a>`;
        
        // mensaje de exito que se borra solo despues de 3 segundos
        const mensaje = document.getElementById('mensaje-perfil');
        mensaje.textContent = 'Perfil actualizado correctamente';
        setTimeout(() => { mensaje.textContent = ''; }, 3000);
    } catch (error) {
        alert('Error al guardar los cambios');
    }
});

// formulario para cambiar la contrasena
document.getElementById('formPassword').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const passwordActual = document.getElementById('passwordActual').value;
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    const mensaje = document.getElementById('mensaje-password');
    
    // validaciones del lado del cliente (las del servidor son las que cuentan de verdad)
    if (passwordNueva !== passwordConfirmar) {
        mensaje.textContent = 'Las contrasenas no coinciden';
        return;
    }
    
    if (passwordNueva.length < 6) {
        mensaje.textContent = 'La contrasena debe tener al menos 6 caracteres';
        return;
    }
    
    try {
        const respuesta = await fetch(`${API_URL}/usuarios/cambiar-password`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ passwordActual, passwordNueva })
        });
        
        const datos = await respuesta.json();
        
        if (!respuesta.ok) {
            // si la contrasena actual es incorrecta, el backend nos lo dice
            mensaje.textContent = datos.error || 'Error al cambiar la contrasena';
            return;
        }
        
        mensaje.textContent = '';
        document.getElementById('formPassword').reset();
        alert('Contrasena actualizada correctamente');
    } catch (error) {
        mensaje.textContent = 'Error al cambiar la contrasena';
    }
});

cargarPerfil();