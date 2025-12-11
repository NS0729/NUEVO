/**
 * Composable de detección de orientación horizontal y diseño responsivo
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useOrientation() {
  const isLandscape = ref(false)
  const isMobile = ref(false)
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)

  const checkOrientation = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    
    // Detectar si es dispositivo móvil
    isMobile.value = window.innerWidth <= 768
    
    // Detectar orientación horizontal: ancho mayor que alto, o usar API de orientación
    isLandscape.value = 
      window.innerWidth > window.innerHeight ||
      (window.orientation !== undefined && 
       (Math.abs(window.orientation) === 90 || Math.abs(window.orientation) === -90))
  }

  const handleResize = () => {
    checkOrientation()
  }

  const handleOrientationChange = () => {
    // Retrasar verificación, esperar a que el navegador complete el cambio de orientación
    setTimeout(() => {
      checkOrientation()
    }, 100)
  }

  onMounted(() => {
    checkOrientation()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
  })

  return {
    isLandscape,
    isMobile,
    screenWidth,
    screenHeight
  }
}

