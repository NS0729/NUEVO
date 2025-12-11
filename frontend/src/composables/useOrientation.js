/**
 * 横屏检测和响应式布局 Composable
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
    
    // 检测是否为移动设备
    isMobile.value = window.innerWidth <= 768
    
    // 检测横屏：宽度大于高度，或者使用 orientation API
    isLandscape.value = 
      window.innerWidth > window.innerHeight ||
      (window.orientation !== undefined && 
       (Math.abs(window.orientation) === 90 || Math.abs(window.orientation) === -90))
  }

  const handleResize = () => {
    checkOrientation()
  }

  const handleOrientationChange = () => {
    // 延迟检查，等待浏览器完成方向变化
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

