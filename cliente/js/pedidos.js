// pedidos.js - vista de pedidos del marketplace (solo admin)
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

// si no es admin no tiene acceso
if (usuario.rol !== 'admin') window.location.href = 'dashboard.html';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaPedidos = [];

// trae todos los pedidos del backend
async function cargarPedidos() {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaPedidos = await respuesta.json();
        mostrarPedidos(listaPedidos);
        actualizarEstadisticas(listaPedidos);
    } catch (error) { console.error('Error al cargar pedidos:', error); }
}

// actualiza las tarjetas de estadisticas
function actualizarEstadisticas(pedidos) {
    document.getElementById('total-pedidos').textContent = pedidos.length;
    const ingresos = pedidos.reduce((suma, p) => suma + parseFloat(p.total || 0), 0);
    document.getElementById('total-ingresos').textContent = ingresos.toFixed(2) + ' €';
    const ticketMedio = pedidos.length > 0 ? ingresos / pedidos.length : 0;
    document.getElementById('ticket-medio').textContent = ticketMedio.toFixed(2) + ' €';
}

// pinta los pedidos en la tabla
function mostrarPedidos(pedidos) {
    const tbody = document.getElementById('tabla-pedidos');
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#64748b">No hay pedidos todavia</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    pedidos.forEach(p => {
        const fecha = new Date(p.creado_en).toLocaleDateString('es-ES');
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#10b981">#${p.id}</strong></td>
                <td><strong style="color:#f8fafc">${p.nombre_cliente}</strong></td>
                <td>${p.email_cliente || '-'}</td>
                <td>${p.direccion || '-'}</td>
                <td style="color:#10b981;font-weight:700">${parseFloat(p.total).toFixed(2)} €</td>
                <td><span class="badge-estado badge-activo">${p.estado}</span></td>
                <td>${fecha}</td>
                <td style="white-space:nowrap">
                    <button class="btn-edit" onclick="verItems(${p.id})">Productos</button>
                    <button class="btn-edit" onclick="verFactura(${p.id})">Factura</button>
                </td>
            </tr>
        `;
    });
}

// abre un popup con los productos del pedido
async function verItems(pedidoId) {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos/${pedidoId}/items`, { headers });
        const items = await respuesta.json();

        let html = '<div style="display:flex;flex-direction:column;gap:10px">';
        items.forEach(item => {
            const subtotal = (parseFloat(item.precio_unidad) * item.cantidad).toFixed(2);
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#0f172a;border-radius:10px;border:1px solid #334155">
                    <div>
                        <div style="color:#f8fafc;font-weight:600">${item.nombre_producto}</div>
                        <div style="color:#64748b;font-size:13px">${parseFloat(item.precio_unidad).toFixed(2)} € × ${item.cantidad}</div>
                    </div>
                    <div style="color:#10b981;font-weight:700">${subtotal} €</div>
                </div>
            `;
        });
        html += '</div>';

        document.getElementById('modal-titulo-detalle').textContent = `Productos del Pedido #${pedidoId}`;
        document.getElementById('detalle-contenido').innerHTML = html;
        document.getElementById('modal-detalle').classList.add('active');
    } catch (error) { alert('Error al cargar los productos del pedido'); }
}

// abre un popup con la factura del pedido
async function verFactura(pedidoId) {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos/${pedidoId}/factura`, { headers });
        if (!respuesta.ok) { alert('Este pedido no tiene factura'); return; }
        const f = await respuesta.json();

        const fecha = new Date(f.creado_en).toLocaleDateString('es-ES');

        const html = `
            <div style="background:#0f172a;border-radius:12px;border:1px solid #334155;padding:24px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #334155">
                    <div>
                        <div style="font-size:18px;font-weight:800;color:#10b981">${f.numero_factura}</div>
                        <div style="font-size:12px;color:#64748b">Fecha: ${fecha}</div>
                    </div>
                    <span class="badge-estado badge-activo">${f.estado}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#94a3b8">
                    <span>Método de pago</span>
                    <span style="color:#e2e8f0;font-weight:600">${f.metodo_pago}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#94a3b8">
                    <span>Base imponible</span>
                    <span style="color:#e2e8f0">${parseFloat(f.base_imponible).toFixed(2)} €</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#94a3b8">
                    <span>IVA (21%)</span>
                    <span style="color:#e2e8f0">${parseFloat(f.iva).toFixed(2)} €</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:14px 0 0;margin-top:8px;border-top:1px solid #334155;font-size:18px;font-weight:800;color:#f8fafc">
                    <span>TOTAL</span>
                    <span style="color:#10b981">${parseFloat(f.total).toFixed(2)} €</span>
                </div>
            </div>
        `;

        document.getElementById('modal-titulo-detalle').textContent = `Factura del Pedido #${pedidoId}`;
        document.getElementById('detalle-contenido').innerHTML = html;
        document.getElementById('modal-detalle').classList.add('active');
    } catch (error) { alert('Error al cargar la factura'); }
}

function cerrarDetalle() {
    document.getElementById('modal-detalle').classList.remove('active');
}

cargarPedidos();