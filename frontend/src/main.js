import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.scss'
import { checkApiConnection, getApiBaseUrl } from './api'
import { initMobileScale, detectDevice } from './utils/mobileScale'
import { initViewportFix } from './utils/viewportFix'
import { initI18n } from './i18n'

// Verificar conexión API al iniciar la aplicación
async function initApp() {
  // Inicializar i18n (ejecutar primero)
  initI18n()
  
  // Inicializar corrección de viewport
  initViewportFix()
  
  // Inicializar escalado automático móvil
  const device = detectDevice()
  if (device.isMobile) {
    const cleanup = initMobileScale()
    // Guardar función de limpieza en window para llamarla cuando sea necesario
    window.__mobileScaleCleanup = cleanup
    
    // Exponer funciones de utilidad a window (para depuración)
    window.__mobileUtils = {
      detectDevice,
      getCurrentScale: () => {
        const viewport = document.querySelector('meta[name="viewport"]')
        if (viewport) {
          const content = viewport.getAttribute('content')
          const match = content.match(/initial-scale=([\d.]+)/)
          return match ? parseFloat(match[1]) : 1.0
        }
        return 1.0
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('📱 Detección de dispositivo móvil:', {
        isMobile: device.isMobile,
        isIOS: device.isIOS,
        isAndroid: device.isAndroid,
        width: device.width,
        height: device.height,
        devicePixelRatio: device.devicePixelRatio,
        scale: window.__mobileUtils.getCurrentScale()
      })
      console.log('💡 Usar window.__mobileUtils para ver funciones de utilidad móvil')
    }
  }
  
  // Mostrar información de configuración API (entorno de desarrollo)
  if (import.meta.env.DEV) {
    console.log('🚀 Iniciando aplicación...')
    console.log('📡 URL de API:', getApiBaseUrl())
    
    // Verificar conexión API
    const connectionStatus = await checkApiConnection()
    if (connectionStatus.connected) {
      console.log('✅ Conexión API normal:', connectionStatus.data)
    } else {
      console.warn('⚠️ Fallo en conexión API:', connectionStatus.error)
      console.warn('💡 Asegúrese de que el servicio backend esté ejecutándose (npm run dev en la carpeta backend)')
    }
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
  
  if (import.meta.env.DEV) {
    console.log('✅ Aplicación iniciada')
  }
}

initApp().catch(error => {
  console.error('❌ Error al iniciar la aplicación:', error)
})

