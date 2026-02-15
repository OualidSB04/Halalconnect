// logica del dashboard
// muestra estadisticas, graficos y certificados proximos a caducar

const API_URL = 'http://localhost:5000/api';

// recuperamos el token y los datos del usuario logueado
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

// cierra sesion borrando el token y el usuario del localStorage
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// carga todos los datos del dashboard
async function cargarDashboard() {
    try {
        // primero traemos los clientes para contar el total
        const respClientes = await fetch(`${API_URL}/clientes`, { headers });
        
        // si el token caduca o es invalido, te echamos al login
        if (respClientes.status === 401 || respClientes.status === 403) {
            cerrarSesion();
            return;
        }
        
        const clientes = await respClientes.json();
        document.getElementById('total-clientes').textContent = clientes.length;

        // ahora traemos las certificaciones para calcular estados
        const respCerts = await fetch(`${API_URL}/certificaciones`, { headers });
        const certificaciones = await respCerts.json();
        
        const hoy = new Date();
        let activos = 0;
        let caducados = 0;
        let proximos = 0;
        
        // recorremos cada certificado y lo clasificamos segun su fecha
        certificaciones.forEach(cert => {
            const fechaCad = new Date(cert.fecha_caducidad);
            const diasRestantes = Math.ceil((fechaCad - hoy) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes < 0) {
                caducados++;
            } else if (diasRestantes <= 30) {
                proximos++;
                activos++;
            } else {
                activos++;
            }
        });
        
        document.getElementById('total-certificados').textContent = activos;
        document.getElementById('caducados').textContent = caducados;
        document.getElementById('proximos-caducar').textContent = proximos;

        // creamos los graficos con los datos calculados
        crearGraficoSectores(clientes);
        crearGraficoEstados(activos - proximos, proximos, caducados);

        // tabla de certificados que caducan en los proximos 30 dias
        const respCaducando = await fetch(`${API_URL}/certificaciones/caducando`, { headers });
        const caducando = await respCaducando.json();

        const tbody = document.getElementById('tabla-alertas');
        
        if (caducando.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay certificados proximos a caducar</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        caducando.forEach(cert => {
            const fechaCad = new Date(cert.fecha_caducidad);
            const diasRestantes = Math.ceil((fechaCad - hoy) / (1000 * 60 * 60 * 24));
            const fechaFormat = fechaCad.toLocaleDateString('es-ES');
            
            // el color del badge cambia segun la urgencia
            let badge = 'badge-success';
            if (diasRestantes <= 7) badge = 'badge-danger';
            else if (diasRestantes <= 15) badge = 'badge-warning';
            
            tbody.innerHTML += `
                <tr>
                    <td>${cert.nombre_empresa}</td>
                    <td>${cert.numero_certificado}</td>
                    <td>${cert.tipo || '-'}</td>
                    <td>${fechaFormat}</td>
                    <td><span class="badge ${badge}">${diasRestantes} dias</span></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        alert('Error al conectar con el servidor');
    }
}

// grafico de tarta con la distribucion de clientes por sector
function crearGraficoSectores(clientes) {
    // agrupamos los clientes por sector y contamos cuantos hay de cada uno
    const sectores = {};
    clientes.forEach(c => {
        const sector = c.sector || 'Sin sector';
        sectores[sector] = (sectores[sector] || 0) + 1;
    });

    const ctx = document.getElementById('grafico-sectores').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sectores),
            datasets: [{
                data: Object.values(sectores),
                backgroundColor: ['#2e75b6', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#fd7e14'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 15, font: { size: 13 } }
                }
            }
        }
    });
}

// grafico de barras con los estados de las certificaciones
function crearGraficoEstados(activos, proximos, caducados) {
    const ctx = document.getElementById('grafico-estados').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Activos', 'Proximos a caducar', 'Caducados'],
            datasets: [{
                label: 'Cantidad',
                data: [activos, proximos, caducados],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

cargarDashboard();