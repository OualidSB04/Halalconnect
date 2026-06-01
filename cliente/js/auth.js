// auth.js - logica del login

const API_URL = 'http://localhost:5000/api';

// si ya hay sesion activa, vamos directo al dashboard
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

function mostrarError(mensaje) {
    const alerta = document.getElementById('alerta-login');
    alerta.textContent = mensaje;
    alerta.classList.add('show');
    setTimeout(() => { alerta.classList.remove('show'); }, 4000);
}

document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            // guardamos token y usuario en localStorage
            localStorage.setItem('token', datos.token);
            localStorage.setItem('usuario', JSON.stringify(datos.usuario));
            window.location.href = 'dashboard.html';
        } else {
            mostrarError(datos.error || 'Email o contraseña incorrectos');
        }
    } catch (error) {
        mostrarError('Error de conexión con el servidor');
    }
});