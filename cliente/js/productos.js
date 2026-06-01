// productos.js - CRUD del catalogo de productos Halal
// API_URL, token, usuario y cerrarSesion vienen de sidebar.js

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let listaProductos = [];

// carga los clientes pa el select del modal
async function cargarClientesSelect() {
    try {
        const respuesta = await fetch(`${API_URL}/clientes`, { headers });
        const clientes = await respuesta.json();
        const select = document.getElementById('cliente_id');
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre_empresa}</option>`;
        });
    } catch (error) { console.error('Error al cargar clientes:', error); }
}

// carga las categorias pa el select del modal
async function cargarCategoriasSelect() {
    try {
        const respuesta = await fetch(`${API_URL}/categorias`);
        const categorias = await respuesta.json();
        const select = document.getElementById('categoria_id');
        categorias.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    } catch (error) { console.error('Error al cargar categorias:', error); }
}

// trae todos los productos del backend
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`, { headers });
        if (respuesta.status === 401 || respuesta.status === 403) { cerrarSesion(); return; }
        listaProductos = await respuesta.json();
        mostrarProductos(listaProductos);
    } catch (error) { console.error('Error al cargar productos:', error); }
}

// pinta los productos en la tabla
function mostrarProductos(productos) {
    const tbody = document.getElementById('tabla-productos');
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b">No se encontraron productos</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    productos.forEach(p => {
        const botonEliminar = usuario.rol === 'admin'
            ? `<button class="btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>` : '';
        // mostramos el precio formateado o un guion si no tiene
        const precio = p.precio && p.precio > 0 ? `${parseFloat(p.precio).toFixed(2)} €` : '-';
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:#f8fafc">${p.nombre}</strong></td>
                <td>${p.marca || '-'}</td>
                <td>${p.categoria_nombre || '-'}</td>
                <td style="color:#10b981;font-weight:600">${precio}</td>
                <td>${p.stock || 0}</td>
                <td>${p.nombre_empresa || '-'}</td>
                <td>
                    <button class="btn-edit" onclick="editarProducto(${p.id})">Editar</button>
                    ${botonEliminar}
                </td>
            </tr>
        `;
    });
}

// filtra los productos en tiempo real
function filtrarProductos() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaProductos.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
        (p.marca && p.marca.toLowerCase().includes(texto)) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(texto)) ||
        (p.nombre_empresa && p.nombre_empresa.toLowerCase().includes(texto))
    );
    mostrarProductos(filtrados);
}

function abrirModal() {
    document.getElementById('modal-titulo').textContent = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('producto-id').value = '';
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

// carga los datos del producto en el modal pa editarlo
async function editarProducto(id) {
    try {
        const respuesta = await fetch(`${API_URL}/productos/publico/${id}`);
        const p = await respuesta.json();
        document.getElementById('modal-titulo').textContent = 'Editar Producto';
        document.getElementById('producto-id').value = p.id;
        document.getElementById('cliente_id').value = p.cliente_id;
        document.getElementById('categoria_id').value = p.categoria_id || '';
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('marca').value = p.marca || '';
        document.getElementById('descripcion').value = p.descripcion || '';
        document.getElementById('codigo_barras').value = p.codigo_barras || '';
        document.getElementById('precio').value = p.precio || '';
        document.getElementById('stock').value = p.stock || '';
        document.getElementById('imagen_url').value = p.imagen_url || '';
        document.getElementById('modal').classList.add('active');
    } catch (error) { alert('Error al cargar el producto'); }
}

// elimina un producto
async function eliminarProducto(id) {
    if (!confirm('¿Estas seguro de eliminar este producto?')) return;
    try {
        await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE', headers });
        cargarProductos();
    } catch (error) { alert('Error al eliminar'); }
}

// guarda el producto (crear o editar) con todos los campos del marketplace
document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('producto-id').value;
    const datos = {
        cliente_id: document.getElementById('cliente_id').value,
        categoria_id: document.getElementById('categoria_id').value || null,
        nombre: document.getElementById('nombre').value,
        marca: document.getElementById('marca').value,
        descripcion: document.getElementById('descripcion').value,
        codigo_barras: document.getElementById('codigo_barras').value,
        precio: document.getElementById('precio').value || 0,
        stock: document.getElementById('stock').value || 0,
        imagen_url: document.getElementById('imagen_url').value
    };
    try {
        const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
        const metodo = id ? 'PUT' : 'POST';
        await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        cerrarModal();
        cargarProductos();
    } catch (error) { alert('Error al guardar'); }
});

// iniciamos cargando todo
cargarClientesSelect();
cargarCategoriasSelect();
cargarProductos();