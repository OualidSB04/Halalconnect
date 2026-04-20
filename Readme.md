## Changelog

### v0.1 - Setup inicial
- Estructura del proyecto creada
- Conexión a base de datos PostgreSQL configurada

### v0.2 - Modelos del backend
- Modelo Cliente con operaciones CRUD
- Modelo Certificacion con detección de caducidad
- Modelo Usuario con encriptación bcrypt
- Modelo Contacto vinculado a clientes

### v0.3 - Controladores y rutas REST
- Controladores con la lógica de negocio
- Definición de rutas REST para todos los recursos
- API funcional con dieciocho endpoints

### v0.4 - Sistema de autenticación
- Implementación de JWT con tokens de 8 horas
- Encriptación de contraseñas con bcrypt
- Middleware verificarToken para rutas protegidas
- Login funcional con validación de credenciales

### v0.5 - Frontend del login
- Página de login con diseño profesional
- Gestión de sesión con localStorage
- Redirección automática al dashboard tras login
- Logo corporativo integrado

### v0.6 - Dashboard y operaciones CRUD
- Panel de control con estadísticas en tiempo real
- CRUD completo de clientes con modal de edición
- CRUD completo de certificaciones
- Tabla de alertas para certificados próximos a caducar
- Sistema de badges con código de colores

### v0.7 - Sistema de roles
- Diferenciación entre administrador y empleado
- Middleware soloAdmin para rutas restringidas
- Página de gestión de usuarios (solo admin)
- Navbar adaptativa según el rol del usuario
- Botones de eliminar ocultos para empleados
- Protección contra borrarse a sí mismo

### v0.8 - Verificación pública
- Página pública de verificación sin autenticación
- Endpoint público GET /api/certificaciones/verificar/:numero
- Resultados visuales según el estado del certificado
- Aporta transparencia al sector Halal
# HalalConnect CRM

> Sistema de gestión de clientes y certificaciones Halal para el mercado español
---

## Descripción

**HalalConnect CRM** es una aplicación web profesional diseñada para la gestión integral de empresas certificadas Halal en España. Permite a los organismos certificadores administrar su cartera de clientes, controlar fechas de caducidad de los certificados emitidos, y ofrece una zona pública donde los consumidores pueden verificar la autenticidad de cualquier certificado Halal en tiempo real.

El proyecto resuelve tres problemas reales del sector Halal en España:

- **Para los organismos certificadores**: gestión profesional de su cartera de clientes
- **Para los empleados**: control automático de fechas de caducidad con alertas
- **Para los consumidores**: verificación pública e instantánea de certificados

---

## Características principales

- ✅ Autenticación segura con JWT y bcrypt
- ✅ Sistema de roles: administrador y empleado
- ✅ CRUD completo para clientes y certificaciones
- ✅ Búsqueda en tiempo real en todas las tablas
- ✅ Dashboard con estadísticas y gráficos interactivos
- ✅ Sistema de alertas para certificados próximos a caducar
- ✅ Exportación de datos a formato CSV
- ✅ Página pública de verificación de certificados (sin login)
- ✅ Gestión de perfil propio y cambio de contraseña
- ✅ Validación de datos en backend con express-validator
- ✅ Interfaz responsive adaptada a cualquier dispositivo

---

## Stack tecnológico

### Backend
- **Node.js** v20
- **Express** v4 (framework web)
- **PostgreSQL** v17 (base de datos)
- **JWT** (autenticación)
- **bcryptjs** (encriptación de contraseñas)
- **express-validator** (validación de datos)

### Frontend
- **HTML5**
- **CSS3** (sin frameworks)
- **JavaScript** vanilla (ES6+)
- **Chart.js** (gráficos del dashboard)

---

## Instalación

### Requisitos previos
- Node.js v20 o superior
- PostgreSQL v17 o superior
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/OualidSB04/halalconnect-crm.git
cd halalconnect-crm
```

### 2. Configurar la base de datos
### 2. Configurar la base de datos

Crea una base de datos llamada `HalalDB` en PostgreSQL y ejecuta el archivo `HalalBD.sql` incluido en el proyecto:

```bash
psql -U postgres -d HalalDB -f HalalBD.sql
```

O alternativamente, abre `HalalBD.sql` en pgAdmin y ejecútalo desde la interfaz visual.


### 3. Configurar variables de entorno
En la carpeta `servidor/`, crea un archivo `.env` con el siguiente contenido:

```env
PUERTO=5000
DB_USUARIO=postgres
DB_HOST=localhost
DB_NOMBRE=HalalDB
DB_PASSWORD=tu_contraseña
DB_PUERTO=5432
JWT_SECRET=tu_clave_secreta_jwt
```

### 4. Instalar dependencias del backend
```bash
cd servidor
npm install
```

### 5. Crear el primer usuario administrador
Inicia el servidor con `npm run dev` y usa Thunder Client o Postman para hacer una petición POST a:
http://localhost:5000/api/usuarios/registro

Con el siguiente body:
```json
{
  "nombre": "Tu Nombre",
  "email": "admin@halalconnect.es",
  "password": "tu_contraseña",
  "rol": "admin"
}
```

### 6. Iniciar la aplicación

**Backend:**
```bash
cd servidor
npm run dev
```

**Frontend:**
Abre la carpeta `cliente/` en Visual Studio Code y haz click derecho sobre `index.html` → "Open with Live Server".

---

## Estructura del proyecto
halalconnect-crm/
├── cliente/                    Frontend
│   ├── css/
│   │   └── estilos.css
│   ├── imagenes/
│   │   └── logo.png
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── clientes.js
│   │   ├── certificaciones.js
│   │   ├── usuarios.js
│   │   ├── perfil.js
│   │   └── verificar.js
│   ├── index.html              Login
│   ├── dashboard.html
│   ├── clientes.html
│   ├── certificaciones.html
│   ├── usuarios.html
│   ├── perfil.html
│   └── verificar.html          Verificación pública
└── servidor/                   Backend
├── authentificacion/
│   ├── verificarToken.js
│   ├── soloAdmin.js
│   └── validaciones.js
├── configuracion/
│   └── HalalconnectDB.js
├── controladores/
│   ├── clienteControlador.js
│   ├── contactoControlador.js
│   ├── certificacionControlador.js
│   └── usuarioControlador.js
├── modelos/
│   ├── Cliente.js
│   ├── Contacto.js
│   ├── Certificacion.js
│   └── Usuario.js
├── rutas/
│   ├── clienteRutas.js
│   ├── contactoRutas.js
│   ├── certificacionRutas.js
│   └── usuarioRutas.js
├── .env
├── index.js
└── package.json

---

## Niveles de acceso

| Acción | Público | Empleado | Administrador |
|---|---|---|---|
| Verificar certificado | ✅ | ✅ | ✅ |
| Ver clientes | ❌ | ✅ | ✅ |
| Crear clientes | ❌ | ✅ | ✅ |
| Editar clientes | ❌ | ✅ | ✅ |
| Eliminar clientes | ❌ | ❌ | ✅ |
| Gestionar empleados | ❌ | ❌ | ✅ |
| Cambiar roles | ❌ | ❌ | ✅ |

---

## API REST - Endpoints principales

### Autenticación
- `POST /api/usuarios/login` - Iniciar sesión

### Clientes (requiere token)
- `GET /api/clientes` - Listar todos los clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Certificaciones (requiere token)
- `GET /api/certificaciones` - Listar todas
- `GET /api/certificaciones/caducando` - Próximas a caducar
- `POST /api/certificaciones` - Crear certificación
- `PUT /api/certificaciones/:id` - Actualizar
- `DELETE /api/certificaciones/:id` - Eliminar

### Verificación pública (sin token)
- `GET /api/certificaciones/verificar/:numero` - Verificar certificado

### Usuarios (solo admin)
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios/registro` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar
- `DELETE /api/usuarios/:id` - Eliminar

---

## Autor

**Oualid S'Baai**
- Trabajo de Fin de Grado - Ciclo Formativo de Grado Superior
- Desarrollo de Aplicaciones Multiplataforma (DAM)
- Curso 2025-2026

---

## Licencia

Este proyecto se distribuye bajo licencia MIT.

---

## Agradecimientos

- A **José Vicente Carratalá Sanchis , Aleix Lopez Hinojosa** por la tutorización del proyecto y la plantilla del TFG.
- A la comunidad **open source** por las herramientas y librerías utilizadas.
- Al sector Halal español por la inspiración para crear una solución que aporta transparencia al mercado.