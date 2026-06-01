// dashboard.js - logica del panel principal
// carga estadisticas y graficos de la plataforma

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// muestra la fecha de hoy en el topbar
const fechaHoy = document.getElementById('fecha-hoy');
if (fechaHoy) {
    fechaHoy.textContent = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

async function cargarDashboard() {
    try {
        const [resClientes, resCerts, resProductos, resEstablecimientos] = await Promise.all([
            fetch(`${API_URL}/clientes`, { headers }),
            fetch(`${API_URL}/certificaciones`, { headers }),
            fetch(`${API_URL}/productos`, { headers }),
            fetch(`${API_URL}/establecimientos`, { headers })
        ]);

        const clientes = await resClientes.json();
        const certs = await resCerts.json();
        const productos = await resProductos.json();
        const establecimientos = await resEstablecimientos.json();

        const hoy = new Date();

        // clasificamos los certificados segun su estado
        const activos = certs.filter(c => {
            const dias = Math.ceil((new Date(c.fecha_caducidad) - hoy) / (1000 * 60 * 60 * 24));
            return dias > 30;
        });
        const proximos = certs.filter(c => {
            const dias = Math.ceil((new Date(c.fecha_caducidad) - hoy) / (1000 * 60 * 60 * 24));
            return dias >= 0 && dias <= 30;
        });
        const caducados = certs.filter(c => {
            const dias = Math.ceil((new Date(c.fecha_caducidad) - hoy) / (1000 * 60 * 60 * 24));
            return dias < 0;
        });

        // actualizamos las tarjetas de stats
        document.getElementById('total-clientes').textContent = clientes.length;
        document.getElementById('total-activos').textContent = activos.length;
        document.getElementById('total-proximos').textContent = proximos.length;
        document.getElementById('total-caducados').textContent = caducados.length;
        document.getElementById('total-productos').textContent = productos.length;
        document.getElementById('total-establecimientos').textContent = establecimientos.length;

        // grafico de sectores
        const sectores = {};
        clientes.forEach(c => {
            const sector = c.sector || 'Sin sector';
            sectores[sector] = (sectores[sector] || 0) + 1;
        });

        new Chart(document.getElementById('graficaSectores'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(sectores),
                datasets: [{
                    data: Object.values(sectores),
                    backgroundColor: ['#10b981', '#f59e0b', '#60a5fa', '#f87171', '#a78bfa'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { size: 12 } }
                    }
                }
            }
        });

        // grafico de estados
        new Chart(document.getElementById('graficaEstados'), {
            type: 'bar',
            data: {
                labels: ['Activos', 'Proximos a caducar', 'Caducados'],
                datasets: [{
                    data: [activos.length, proximos.length, caducados.length],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                }
            }
        });

        // tabla de alertas
        const tbody = document.getElementById('tabla-alertas');
        const alertas = [...proximos, ...caducados].slice(0, 10);

        if (alertas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#64748b">No hay alertas pendientes</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        alertas.forEach(c => {
            const dias = Math.ceil((new Date(c.fecha_caducidad) - hoy) / (1000 * 60 * 60 * 24));
            let badge = '';
            if (dias < 0) badge = '<span class="badge-estado badge-caducado">Caducado</span>';
            else if (dias <= 30) badge = `<span class="badge-estado badge-pendiente">${dias} dias</span>`;

            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:#f8fafc">${c.nombre_empresa || '-'}</strong></td>
                    <td style="color:#10b981">${c.numero_certificado}</td>
                    <td>${c.tipo || '-'}</td>
                    <td>${new Date(c.fecha_caducidad).toLocaleDateString('es-ES')}</td>
                    <td>${badge}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

cargarDashboard();