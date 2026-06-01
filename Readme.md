# 🌙 HalalConnect

**Marketplace Halal de confianza con verificación de certificaciones e inteligencia artificial**

HalalConnect es una plataforma web dirigida a la comunidad musulmana en España, donde los consumidores pueden descubrir y comprar productos Halal de confianza, con un sistema de verificación de certificaciones integrado que garantiza su autenticidad.

Proyecto de Fin de Grado — Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM).

---

## ✨ Características principales

### 🛒 Marketplace público (sin registro)
- Catálogo de productos Halal con buscador y filtros por categoría
- Distintivo visual de certificación verificada en cada producto
- Fichas de producto con el estado real de la certificación de la empresa
- Carrito de compra con proceso de pago simulado
- Generación automática de pedidos y facturas (con desglose de IVA)
- Mapa interactivo de establecimientos Halal
- Verificador público de certificados por número
- Formulario de denuncias de productos sospechosos
- Asistente virtual con inteligencia artificial (Ollama + RAG)

### 🔐 Panel de administración (con login)
- Dashboard con estadísticas y gráficos
- Gestión de empresas, certificaciones, productos y establecimientos
- Gestión de pedidos con métricas de negocio (ingresos, ticket medio)
- Visualización de facturas
- Gestión de denuncias
- Historial de acciones (auditoría)
- Sistema de usuarios y roles

---

## 🛠️ Tecnologías

**Backend**
- Node.js + Express
- PostgreSQL
- JWT (autenticación) + bcrypt (cifrado de contraseñas)
- Arquitectura MVC

**Frontend**
- HTML5, CSS3, JavaScript (vanilla)
- Leaflet (mapas interactivos)
- Chart.js (gráficos)

**Inteligencia Artificial**
- Ollama (modelo Llama 3.2, ejecución local)
- Técnica RAG (Retrieval-Augmented Generation)

---

## 🗄️ Base de datos

13 tablas relacionadas: `usuarios`, `clientes`, `contactos`, `certificaciones`, `categorias`, `ciudades`, `productos`, `establecimientos`, `denuncias`, `pedidos`, `pedido_items`, `facturas`, `historial_acciones`.

El esquema completo está en el archivo `HalalBD.sql`.

---

## 🚀 Instalación y ejecución

### Requisitos previos
- Node.js (v18 o superior)
- PostgreSQL
- Ollama (para el asistente de IA)

### Pasos

1. Clonar el repositorio:
```bash
   git clone https://github.com/OualidSB04/Halalconnect.git
   cd halalconnect
```

2. Crear la base de datos en PostgreSQL e importar el esquema:
```bash
   psql -U postgres -d HalalDB -f HalalBD.sql
```

3. Configurar las variables de entorno. Crear un archivo `.env` en la carpeta `servidor` con:
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=HalalDB
JWT_SECRET=tu_clave_secreta
PORT=5000
4. Instalar dependencias y arrancar el backend:
```bash
   cd servidor
   npm install
   npm run dev
```

5. Abrir el frontend con Live Server (VS Code), empezando por `cliente/marketplace.html`.

6. (Opcional) Para el asistente de IA, tener Ollama corriendo:
```bash
   ollama run llama3.2
```

---

## 👤 Autor

**Oualid S'Baai**
Proyecto de Fin de Grado — DAM