// carrito.js - logica del carrito de compra (simulacion)
// se incluye en marketplace, item y carrito
// guarda el carrito en sessionStorage pa que no se pierda al cambiar de pagina

const API_URL_CARRITO = 'http://localhost:5000/api';

// recupera el carrito guardado o devuelve uno vacio
function obtenerCarrito() {
    const guardado = sessionStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
}

// guarda el carrito en sessionStorage
function guardarCarrito(carrito) {
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// añade un producto al carrito
function añadirAlCarrito(producto) {
    const carrito = obtenerCarrito();

    // si el producto ya esta, subimos la cantidad
    const existente = carrito.find(item => item.producto_id === producto.id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            producto_id: producto.id,
            nombre_producto: producto.nombre,
            precio_unidad: producto.precio || 0,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    mostrarToast(`"${producto.nombre}" añadido al carrito`);
}

// quita un producto del carrito
function quitarDelCarrito(productoId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.producto_id !== productoId);
    guardarCarrito(carrito);
    if (typeof pintarCarrito === 'function') pintarCarrito();
}

// cambia la cantidad de un producto
function cambiarCantidad(productoId, delta) {
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.producto_id === productoId);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            quitarDelCarrito(productoId);
            return;
        }
    }
    guardarCarrito(carrito);
    if (typeof pintarCarrito === 'function') pintarCarrito();
}

// vacia el carrito completo
function vaciarCarrito() {
    sessionStorage.removeItem('carrito');
    actualizarContadorCarrito();
}

// calcula el total del carrito
function calcularTotal() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) =>
        total + (parseFloat(item.precio_unidad) * item.cantidad), 0);
}

// actualiza el numero que sale en el icono del carrito
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// muestra un mensaje flotante cuando se añade algo
function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: #10b981; color: #fff; padding: 14px 24px; border-radius: 12px;
        font-size: 14px; font-weight: 600; z-index: 2000;
        box-shadow: 0 8px 24px rgba(16,185,129,0.4); animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// al cargar cualquier pagina, actualizamos el contador
actualizarContadorCarrito();