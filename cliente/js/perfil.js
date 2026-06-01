// perfil.js - gestion del perfil propio del usuario

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

function obtenerIniciales(nombre) {
    if (!nombre) return 'U';
    const partes = nombre.split(' ');
    if (partes.length >= 2) return partes[0][0] + partes[1][0];
    return nombre[0].toUpperCase();
}

async function cargarPerfil() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios/mi-perfil`, { headers });
        const perfil = await respuesta.json();

        document.getElementById('nombre').value = perfil.nombre;
        document.getElementById('email').value = perfil.email;
        document.getElementById('avatar-grande').textContent = obtenerIniciales(perfil.nombre);
        document.getElementById('nombre-display').textContent = perfil.nombre;
        document.getElementById('rol-display').textContent = perfil.rol;
    } catch (error) { console.error('Error al cargar perfil:', error); }
}

function mostrarAlerta(id, tipo, mensaje) {
    const alerta = document.getElementById(id);
    alerta.textContent = mensaje;
    alerta.className = `alert alert-${tipo} show`;
    setTimeout(() => { alerta.className = 'alert'; }, 4000);
}

document.getElementById('formPerfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const respuesta = await fetch(`${API_URL}/usuarios/mi-perfil`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value
            })
        });
        if (respuesta.ok) {
            mostrarAlerta('alerta-perfil', 'success', 'Perfil actualizado correctamente');
            const datos = await respuesta.json();
            localStorage.setItem('usuario', JSON.stringify(datos));
            document.getElementById('avatar-grande').textContent = obtenerIniciales(datos.nombre);
            document.getElementById('nombre-display').textContent = datos.nombre;
        } else {
            mostrarAlerta('alerta-perfil', 'error', 'Error al actualizar el perfil');
        }
    } catch (error) { mostrarAlerta('alerta-perfil', 'error', 'Error de conexion'); }
});

document.getElementById('formPassword').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nueva = document.getElementById('password_nueva').value;
    const confirmar = document.getElementById('password_confirmar').value;

    if (nueva !== confirmar) {
        mostrarAlerta('alerta-password', 'error', 'Las contrasenas no coinciden');
        return;
    }
    if (nueva.length < 6) {
        mostrarAlerta('alerta-password', 'error', 'Minimo 6 caracteres');
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/usuarios/cambiar-password`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                password_actual: document.getElementById('password_actual').value,
                password_nueva: nueva
            })
        });
        if (respuesta.ok) {
            mostrarAlerta('alerta-password', 'success', 'Contrasena cambiada correctamente');
            document.getElementById('formPassword').reset();
        } else {
            const error = await respuesta.json();
            mostrarAlerta('alerta-password', 'error', error.error || 'Error al cambiar la contrasena');
        }
    } catch (error) { mostrarAlerta('alerta-password', 'error', 'Error de conexion'); }
});

cargarPerfil();