# App de Joyería Elegante - Aplicación Frontend Vue3

Una aplicación profesional y elegante para exhibir joyería, construida con Vue3 + Vite, con funcionalidades completas y diseño UI elegante.

## ✨ Características

- 🎨 **Diseño UI Elegante** - Diseño de interfaz moderno con efectos visuales elegantes
- 📱 **Diseño Responsivo** - Adaptación perfecta para escritorio y móvil
- 🖼️ **Escalado/Compresión Automática de Imágenes** - Procesamiento inteligente de imágenes para optimizar el rendimiento de carga
- 🔍 **Funcionalidad de Búsqueda** - Búsqueda potente de productos
- 📂 **Navegación por Categorías** - Explorar productos por categoría
- 🛍️ **Carrito de Compras** - Funcionalidad de carrito (gestión de estado)
- ⚡ **Optimización de Rendimiento** - Carga diferida, precarga de imágenes y otras optimizaciones
- 🎯 **Navegación por Rutas** - Aplicación de una sola página con Vue Router
- 💾 **Gestión de Estado** - Gestión de estado con Pinia

## 🚀 Inicio Rápido

### Instalación de Dependencias

```bash
npm install
```

### Modo de Desarrollo

```bash
npm run dev
```

La aplicación se iniciará en `http://localhost:3000`

### Construcción para Producción

```bash
npm run build
```

### Vista Previa de Producción

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes
│   ├── NavBar.vue      # Barra de navegación
│   ├── Footer.vue      # Pie de página
│   ├── ProductCard.vue # Tarjeta de producto
│   └── ImageGallery.vue # Galería de imágenes
├── views/              # Páginas
│   ├── Home.vue        # Página de inicio
│   ├── Category.vue    # Página de categoría
│   ├── ProductDetail.vue # Detalles del producto
│   └── Search.vue      # Página de búsqueda
├── store/              # Gestión de estado
│   └── index.js        # Store de Pinia
├── router/             # Configuración de rutas
│   └── index.js
├── utils/              # Funciones de utilidad
│   └── imageProcessor.js # Herramienta de procesamiento de imágenes
├── styles/             # Archivos de estilo
│   └── main.scss       # Estilo principal
└── main.js             # Archivo de entrada
```

## 🛠️ Stack Tecnológico

- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Herramienta de construcción frontend de próxima generación
- **Vue Router** - Administrador de rutas oficial
- **Pinia** - Biblioteca de gestión de estado para Vue
- **SCSS** - Preprocesador CSS

## 🎨 Funcionalidad de Procesamiento de Imágenes

La aplicación incluye herramientas completas de procesamiento de imágenes (`src/utils/imageProcessor.js`):

- **Compresión de Imágenes** - Comprimir imágenes automáticamente para optimizar el tamaño del archivo
- **Imágenes Responsivas** - Cargar automáticamente el tamaño adecuado según el dispositivo
- **Carga Diferida** - Carga diferida de imágenes para mejorar el rendimiento
- **Precarga** - Precarga de imágenes clave

## 📱 Diseño Responsivo

- Diseño móvil primero
- Puntos de quiebre: 768px (tablet), 1024px (escritorio)
- Diseño de cuadrícula adaptable
- Interacciones táctiles amigables

## 🎯 Páginas Principales

1. **Página de Inicio** - Exhibir productos destacados y categorías
2. **Página de Categoría** - Explorar productos por categoría
3. **Detalles del Producto** - Información detallada del producto y galería de imágenes
4. **Página de Búsqueda** - Funcionalidad de búsqueda de productos

## 📝 Instrucciones de Desarrollo

### Agregar Nuevos Productos

Agregar nuevos objetos de producto en el array `products` de `src/store/index.js`.

### Personalizar Estilos

Modificar las variables CSS en `src/styles/main.scss` para personalizar los colores del tema.

### Procesamiento de Imágenes

Usar las funciones de utilidad en `src/utils/imageProcessor.js` para procesar imágenes.

## 📄 Licencia

MIT License
