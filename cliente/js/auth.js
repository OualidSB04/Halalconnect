// logica del login
// envia las credenciales al backend, recibe el token y redirige al dashboard

const API_URL = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    // preventDefault evita que el formulario recargue la pagina
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        // mandamos email y password al backend
        const respuesta = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        // si la respuesta no es OK, mostramos el error
        if (!respuesta.ok) {
            errorMsg.textContent = datos.error || 'Error al iniciar sesion';
            return;
        }

        // guardamos el token y el usuario en localStorage
        // localStorage es el almacenamiento del navegador, persiste aunque cierres pestana
        localStorage.setItem('token', datos.token);
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));

        // redirigimos al dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        errorMsg.textContent = 'Error de conexion con el servidor';
        console.error(error);
    }
});