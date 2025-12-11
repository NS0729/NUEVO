import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.scss'
import { checkApiConnection, getApiBaseUrl } from './api'
import { initMobileScale, detectDevice } from './utils/mobileScale'
import { initViewportFix } from './utils/viewportFix'

// 在应用启动时检查API连接
async function initApp() {
  // 初始化viewport修复（优先执行）
  initViewportFix()
  
  // 初始化移动端自动缩放
  const device = detectDevice()
  if (device.isMobile) {
    const cleanup = initMobileScale()
    // 保存清理函数到window，以便需要时调用
    window.__mobileScaleCleanup = cleanup
    
    // 暴露工具函数到window（用于调试）
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
      console.log('📱 移动端设备检测:', {
        isMobile: device.isMobile,
        isIOS: device.isIOS,
        isAndroid: device.isAndroid,
        width: device.width,
        height: device.height,
        devicePixelRatio: device.devicePixelRatio,
        scale: window.__mobileUtils.getCurrentScale()
      })
      console.log('💡 使用 window.__mobileUtils 查看移动端工具函数')
    }
  }
  
  // 显示API配置信息（开发环境）
  if (import.meta.env.DEV) {
    console.log('🚀 应用启动中...')
    console.log('📡 API URL:', getApiBaseUrl())
    
    // 检查API连接
    const connectionStatus = await checkApiConnection()
    if (connectionStatus.connected) {
      console.log('✅ API连接正常:', connectionStatus.data)
    } else {
      console.warn('⚠️ API连接失败:', connectionStatus.error)
      console.warn('💡 请确保后端服务正在运行 (npm run dev in backend folder)')
    }
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
  
  if (import.meta.env.DEV) {
    console.log('✅ 应用已启动')
  }
}

initApp().catch(error => {
  console.error('❌ 应用启动失败:', error)
})

