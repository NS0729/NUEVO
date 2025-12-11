<template>
  <div :class="{ 'admin-layout': isAdminRoute }">
    <NavBar v-if="!isAdminRoute" />
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <Footer v-if="!isAdminRoute" />
    <MobileBottomNav v-if="!isAdminRoute" />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import Toast from './components/Toast.vue'
import { useJewelryStore } from './store'

const route = useRoute()
const toastRef = ref(null)
const store = useJewelryStore()

// Determinar si es una ruta de administración
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// Proporcionar métodos toast para que los usen todos los componentes hijos
provide('toast', {
  success: (message, duration) => toastRef.value?.success(message, duration),
  error: (message, duration) => toastRef.value?.error(message, duration),
  info: (message, duration) => toastRef.value?.info(message, duration)
})

// Observar cambios de ruta, cambiar clase del body
watch(isAdminRoute, (isAdmin) => {
  if (isAdmin) {
    document.body.classList.add('admin-page')
  } else {
    document.body.classList.remove('admin-page')
  }
}, { immediate: true })

onMounted(async () => {
  // Precargar recursos clave
  document.body.classList.add('loaded')
  
  // Inicializar clase admin-page
  if (isAdminRoute.value) {
    document.body.classList.add('admin-page')
  } else {
    // Inicializar datos del store solo en páginas frontend (cargar desde API)
    try {
      console.log('🔄 App: Inicializando store, cargando datos de productos...')
      await store.initialize()
      console.log('✅ App: Carga de datos completada')
    } catch (error) {
      console.error('❌ App: Error al inicializar store:', error)
      // Si es un error de conexión, proporcionar una sugerencia más amigable
      if (error.message && error.message.includes('No se pudo conectar al servidor')) {
        console.warn('💡 Sugerencia: Asegúrese de que el servicio backend esté ejecutándose (npm run dev en la carpeta backend)')
      }
    }
  }
})

// Observar cambios de ruta, recargar datos cuando se regresa del panel de administración al frontend
watch(() => route.path, async (newPath, oldPath) => {
  // Si se cambia de página de administración a página frontend, recargar datos
  if (oldPath?.startsWith('/admin') && !newPath.startsWith('/admin')) {
    try {
      console.log('🔄 App: Regresando del panel de administración al frontend, recargando datos de productos...')
      await store.loadProducts()
    } catch (error) {
      console.error('❌ App: Error al recargar productos:', error)
    }
  }
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  // Estilos de página de administración
  &.admin-layout {
    min-height: 100vh;
    background: var(--accent-color);
  }
}

// Estilos del body para página de administración
body.admin-page {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

