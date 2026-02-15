-- ========================================
-- HalalConnect CRM - Estructura BD
-- PostgreSQL v17
-- ========================================

-- Crear base de datos
-- CREATE DATABASE "HalalDB";

-- Conectar a HalalDB y ejecutar:

-- Tabla de usuarios del sistema (admin y empleados)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes (empresas certificadas)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    ciudad VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos (personas asociadas a cada cliente)
CREATE TABLE contactos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nombre VARCHAR(100),
    cargo VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

-- Tabla de certificaciones Halal emitidas
CREATE TABLE certificaciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    numero_certificado VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(100),
    fecha_emision DATE NOT NULL,
    fecha_caducidad DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
