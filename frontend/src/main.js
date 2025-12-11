import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.scss'
import { checkApiConnection, getApiBaseUrl } from './api'

// 在应用启动时检查API连接
async function initApp() {
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

