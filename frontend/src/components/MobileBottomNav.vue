<template>
  <nav class="mobile-bottom-nav" v-if="isMobile">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="handleClick(item)"
    >
      <div class="nav-icon-wrapper">
        <component :is="item.icon" v-if="item.icon" />
        <span v-else class="nav-emoji">{{ item.emoji }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </div>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJewelryStore } from '../store'
import { useI18n } from '../i18n'

const route = useRoute()
const router = useRouter()
const store = useJewelryStore()
const { t } = useI18n()

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const cartCount = computed(() => {
  return store.cart.reduce((sum, item) => sum + item.quantity, 0)
})

const navItems = computed(() => [
  {
    path: '/',
    label: t('nav.home'),
    emoji: '🏠',
    icon: null
  },
  {
    path: '/search',
    label: t('nav.search'),
    emoji: '🔍',
    icon: null
  },
  {
    path: '/cart',
    label: t('nav.cart'),
    emoji: '🛒',
    icon: null,
    badge: cartCount.value > 0 ? cartCount.value : null
  }
])

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleClick = (item) => {
  // Se puede agregar retroalimentación de clic aquí
  if (item.path === '/search') {
    // La página de búsqueda puede requerir procesamiento especial
  }
}
</script>

<style lang="scss" scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.08);

  @media (min-width: 769px) {
    display: none;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  flex: 1;
  min-width: 0;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    color: var(--primary-color);

    .nav-icon-wrapper {
      transform: scale(1.1);
    }

    .nav-emoji {
      filter: drop-shadow(0 2px 4px rgba(255, 105, 180, 0.3));
    }
  }
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.nav-emoji {
  font-size: 1.5rem;
  transition: var(--transition);
  display: block;
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--primary-gradient);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.4);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  transition: var(--transition);
}

// Reservar espacio para la barra de navegación inferior
:deep(.home),
:deep(.category),
:deep(.search),
:deep(.cart) {
  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
}
</style>

