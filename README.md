# App de Joyería Elegante - Aplicación Full Stack

Una aplicación profesional y elegante para exhibir joyería, construida con Vue3 + Cloudflare Workers + D1.

## ✨ Características

### Funcionalidades Frontend
- 🎨 **Diseño UI Elegante** - Diseño de interfaz moderno con efectos visuales elegantes
- 📱 **Diseño Responsivo** - Adaptación perfecta para escritorio y móvil
- 🖼️ **Escalado/Compresión Automática de Imágenes** - Procesamiento inteligente de imágenes para optimizar el rendimiento de carga
- 🔍 **Funcionalidad de Búsqueda** - Búsqueda potente de productos
- 📂 **Navegación por Categorías** - Explorar productos por categoría
- 🛍️ **Carrito de Compras** - Funcionalidad de carrito (gestión de estado)
- ⚡ **Optimización de Rendimiento** - Carga diferida, precarga de imágenes y otras optimizaciones
- 🎯 **Navegación por Rutas** - Aplicación de una sola página con Vue Router
- 💾 **Gestión de Estado** - Gestión de estado con Pinia
- 👨‍💼 **Panel de Administración** - Gestión completa de productos, pedidos y categorías

### Funcionalidades Backend
- 🚀 **Cloudflare Workers** - API sin servidor
- 💾 **Base de Datos D1** - Base de datos SQLite de Cloudflare
- 🔐 **Autenticación** - Autenticación de inicio de sesión del panel de administración
- 📊 **API RESTful** - API completa para productos, pedidos y categorías
- 🔄 **Migración de Base de Datos** - Migración automatizada de base de datos

## 📁 Estructura del Proyecto

```
NUEVO/
├── frontend/              # Proyecto frontend (Vue.js)
│   ├── src/              # Código fuente frontend
│   ├── index.html        # Plantilla HTML
│   ├── vite.config.js    # Configuración de Vite
│   └── package.json      # Dependencias frontend
│
├── backend/              # Proyecto backend (Cloudflare Workers)
│   ├── src/
│   │   └── index.js      # Archivo de entrada del Worker
│   ├── migrations/       # Archivos de migración de base de datos
│   ├── wrangler.toml     # Configuración de Wrangler
│   └── package.json      # Dependencias backend
│
├── docs/                 # Documentación del proyecto
├── scripts/              # Archivos de script
└── package.json          # package.json raíz (gestión de workspace)
```

Para una descripción detallada de la estructura del proyecto, consulte [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

## 🚀 Inicio Rápido

### Instalación de Dependencias

```bash
# Instalar todas las dependencias (raíz + frontend + backend)
npm run install:all

# O instalar por separado
npm install                    # Raíz
cd frontend && npm install     # Frontend
cd ../backend && npm install   # Backend
```

### Modo de Desarrollo

```bash
# Iniciar frontend y backend simultáneamente
npm run dev

# O iniciar por separado
npm run dev:frontend   # Frontend (http://localhost:3000)
npm run dev:backend    # Backend (http://localhost:8787)
```

### Construcción

```bash
npm run build  # Construir frontend
```

## 🛠️ Stack Tecnológico

### Frontend
- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Herramienta de construcción frontend de próxima generación
- **Vue Router** - Administrador de rutas oficial
- **Pinia** - Biblioteca de gestión de estado para Vue
- **SCSS** - Preprocesador CSS

### Backend
- **Cloudflare Workers** - Entorno de ejecución sin servidor
- **Cloudflare D1** - Base de datos SQLite
- **Wrangler** - Herramienta de desarrollo de Cloudflare

## 📝 Instrucciones de Desarrollo

### Desarrollo Frontend
- El código frontend se encuentra en el directorio `frontend/`
- Servidor de desarrollo: `http://localhost:3000`
- URL base de API: `http://localhost:8787`

### Desarrollo Backend
- El código backend se encuentra en el directorio `backend/`
- Servidor API: `http://localhost:8787`
- Migración de base de datos: `cd backend && npm run db:migrate`
- Migración de base de datos remota: `cd backend && npm run db:migrate:remote`

### Panel de Administración
- URL de acceso: `http://localhost:3000/admin`
- Cuenta predeterminada: consulte `docs/ADMIN_GUIDE.md`

## 📚 Documentación

Toda la documentación se encuentra en el directorio `docs/`:

- [Descripción de la Estructura del Proyecto](docs/PROJECT_STRUCTURE.md)
- [Documentación de API Backend](docs/README_BACKEND.md)
- [Guía del Panel de Administración](docs/ADMIN_GUIDE.md)
- [Guía de Configuración de GitHub](docs/README_GITHUB.md)
- [Guía de Configuración de Base de Datos](docs/DATABASE_GITHUB_SETUP.md)

## 🔧 Variables de Entorno

### Frontend
Crear `frontend/.env`:
```
VITE_API_URL=http://localhost:8787
```

### Backend
Crear `backend/.dev.vars` (entorno de desarrollo):
```
ENVIRONMENT=development
```

## 📄 Licencia

MIT License
