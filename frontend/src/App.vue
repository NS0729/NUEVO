<template>
  <div :class="{ 'admin-layout': isAdminRoute }">
    <NavBar v-if="!isAdminRoute" />
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <Footer v-if="!isAdminRoute" />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import { useJewelryStore } from './store'

const route = useRoute()
const toastRef = ref(null)
const store = useJewelryStore()

// 判断是否为后台路由
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// 提供toast方法给所有子组件使用
provide('toast', {
  success: (message, duration) => toastRef.value?.success(message, duration),
  error: (message, duration) => toastRef.value?.error(message, duration),
  info: (message, duration) => toastRef.value?.info(message, duration)
})

// 监听路由变化，切换body类名
watch(isAdminRoute, (isAdmin) => {
  if (isAdmin) {
    document.body.classList.add('admin-page')
  } else {
    document.body.classList.remove('admin-page')
  }
}, { immediate: true })

onMounted(async () => {
  // 预加载关键资源
  document.body.classList.add('loaded')
  
  // 初始化admin-page类
  if (isAdminRoute.value) {
    document.body.classList.add('admin-page')
  } else {
    // 仅在前端页面初始化store数据（从API加载）
    try {
      console.log('🔄 App: 初始化store，加载商品数据...')
      await store.initialize()
      console.log('✅ App: 数据加载完成')
    } catch (error) {
      console.error('❌ App: 初始化store失败:', error)
      // 如果是连接错误，提供更友好的提示
      if (error.message && error.message.includes('无法连接到服务器')) {
        console.warn('💡 提示: 请确保后端服务正在运行 (npm run dev in backend folder)')
      }
    }
  }
})

// 监听路由变化，当从后台返回前端时重新加载数据
watch(() => route.path, async (newPath, oldPath) => {
  // 如果从后台页面切换到前端页面，重新加载数据
  if (oldPath?.startsWith('/admin') && !newPath.startsWith('/admin')) {
    try {
      console.log('🔄 App: 从后台返回前端，重新加载商品数据...')
      await store.loadProducts()
    } catch (error) {
      console.error('❌ App: 重新加载商品失败:', error)
    }
  }
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  // 后台页面样式
  &.admin-layout {
    min-height: 100vh;
    background: var(--accent-color);
  }
}

// 后台页面body样式
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

