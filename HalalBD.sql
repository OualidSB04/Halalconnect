-- ============================================
-- HalalConnect - Base de datos completa
-- Marketplace Halal con verificacion de certificaciones
-- PostgreSQL
-- ============================================

-- ============ TABLA USUARIOS ============
-- usuarios del panel de administracion (admin/empleado)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA CLIENTES (EMPRESAS) ============
-- las empresas vendedoras del marketplace
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    sector VARCHAR(100),
    ciudad VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA CONTACTOS ============
-- personas de contacto de cada empresa (relacion 1:N con clientes)
CREATE TABLE contactos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(150)
);

-- ============ TABLA CERTIFICACIONES ============
-- certificados Halal de cada empresa (relacion 1:N con clientes)
CREATE TABLE certificaciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    numero_certificado VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(100),
    fecha_emision DATE,
    fecha_caducidad DATE,
    estado VARCHAR(30) DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA CATEGORIAS ============
-- categorias de productos (alimentacion, carniceria, cosmetica...)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- ============ TABLA CIUDADES ============
-- ciudades con coordenadas para el mapa
CREATE TABLE ciudades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7)
);

-- ============ TABLA PRODUCTOS ============
-- productos del marketplace (relacion con clientes y categorias)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    nombre VARCHAR(200) NOT NULL,
    marca VARCHAR(150),
    descripcion TEXT,
    codigo_barras VARCHAR(100),
    es_halal BOOLEAN DEFAULT true,
    precio NUMERIC(10, 2),
    stock INTEGER DEFAULT 0,
    imagen_url VARCHAR(2000),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA ESTABLECIMIENTOS ============
-- tiendas y restaurantes fisicos para el mapa
CREATE TABLE establecimientos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    ciudad_id INTEGER REFERENCES ciudades(id) ON DELETE SET NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(100),
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7)
);

-- ============ TABLA DENUNCIAS ============
-- reportes publicos de productos sospechosos
CREATE TABLE denuncias (
    id SERIAL PRIMARY KEY,
    producto_nombre VARCHAR(200),
    establecimiento VARCHAR(200),
    descripcion TEXT,
    email_denunciante VARCHAR(150),
    estado VARCHAR(30) DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA PEDIDOS ============
-- pedidos realizados en el marketplace
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(200) NOT NULL,
    email_cliente VARCHAR(150),
    direccion VARCHAR(255),
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'confirmado',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA PEDIDO_ITEMS ============
-- lineas de cada pedido (relacion N:M entre pedidos y productos)
CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    precio_unidad DECIMAL(10, 2) NOT NULL,
    cantidad INTEGER DEFAULT 1
);

-- ============ TABLA FACTURAS ============
-- factura generada automaticamente por cada pedido (relacion 1:1)
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Tarjeta',
    base_imponible DECIMAL(10, 2) NOT NULL,
    iva DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'pagada',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLA HISTORIAL_ACCIONES ============
-- registro de auditoria (quien hace que y cuando)
CREATE TABLE historial_acciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(255) NOT NULL,
    tabla_afectada VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);