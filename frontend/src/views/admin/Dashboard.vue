<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-left">
        <h1>{{ t('admin.dashboard.title') }}</h1>
        <div class="header-info">
          <span class="admin-name">
            <span class="info-icon">👤</span>
            Administrador: {{ adminUser }}
          </span>
          <span v-if="remainingTime > 0" class="session-time">
            <span class="info-icon">⏱️</span>
            {{ t('admin.dashboard.sessionExpiring') }}: {{ remainingTime }} minutos
          </span>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-refresh" @click="loadStats" :title="t('common.all')">
          <span>🔄</span>
        </button>
        <button class="btn-logout" @click="handleLogout">
          <span>🚪</span>
          {{ t('admin.dashboard.logout') }}
        </button>
      </div>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalProducts }}</div>
          <div class="stat-label">{{ t('admin.dashboard.stats.totalProducts') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div class="stat-label">{{ t('admin.dashboard.stats.totalOrders') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">${{ formatPrice(stats.totalRevenue) }}</div>
          <div class="stat-label">{{ t('admin.dashboard.stats.totalRevenue') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pendingOrders }}</div>
          <div class="stat-label">{{ t('admin.dashboard.stats.pendingOrders') }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <div class="content-body">
        <!-- Gestión de productos -->
        <ProductsManagement v-if="activeTab === 'products'" />

        <!-- Gestión de pedidos -->
        <OrdersManagement v-if="activeTab === 'orders'" />

        <!-- Gestión de categorías -->
        <CategoriesManagement v-if="activeTab === 'categories'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductsManagement from './ProductsManagement.vue'
import OrdersManagement from './OrdersManagement.vue'
import CategoriesManagement from './CategoriesManagement.vue'
import { formatPrice } from '../../utils/priceFormatter'
import { isAuthenticated, getCurrentUser, clearAuth, refreshToken, getRemainingSessionTime, isTokenExpiringSoon } from '../../utils/auth'
import { useToast } from '../../composables/useToast'
import { useI18n } from '../../i18n'
// Importar API - usar importación con nombre
import { adminStatsAPI, adminAuth } from '../../api'

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const adminUser = ref(getCurrentUser() || 'admin')
const activeTab = ref('products')
const sessionWarningShown = ref(false)

const tabs = [
  { id: 'products', name: t('admin.dashboard.tabs.products'), icon: '📦' },
  { id: 'orders', name: t('admin.dashboard.tabs.orders'), icon: '🛒' },
  { id: 'categories', name: t('admin.dashboard.tabs.categories'), icon: '📁' },
]

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
})

const remainingTime = ref(0)

const loadStats = async () => {
  try {
    // Asegurar que adminStatsAPI se haya importado correctamente
    if (!adminStatsAPI || typeof adminStatsAPI.getStats !== 'function') {
      console.error('❌ adminStatsAPI no se importó correctamente')
      throw new Error('La API de estadísticas no se cargó correctamente, por favor actualice la página')
    }
    
    // Llamar a la API para obtener datos estadísticos
    console.log('📊 Iniciando carga de datos estadísticos...')
    const data = await adminStatsAPI.getStats()
    console.log('✅ Datos estadísticos cargados exitosamente:', data)
    
    stats.value = {
      totalProducts: data.totalProducts || 0,
      totalOrders: data.totalOrders || 0,
      totalRevenue: data.totalRevenue || 0,
      pendingOrders: data.pendingOrders || 0,
    }
  } catch (error) {
    console.error('❌ Error al cargar datos estadísticos:', error)
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack,
      adminStatsAPI: typeof adminStatsAPI,
      getStats: typeof adminStatsAPI?.getStats
    })
    toast.error('Error al cargar datos estadísticos: ' + (error.message || 'Error desconocido'))
    // Si la API falla, usar valores por defecto
    stats.value = {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
    }
  }
}

const handleLogout = async () => {
  if (confirm(t('admin.dashboard.logoutConfirm'))) {
    try {
      // Llamar a la API para cerrar sesión
      await adminAuth.logout()
    } catch (error) {
      console.error('Error al llamar a la API de cierre de sesión:', error)
    }
    clearAuth()
    toast.success(t('admin.dashboard.logoutSuccess'))
    router.push('/admin/login')
  }
}

// Gestión de sesión
let sessionCheckInterval = null
let activityTimeout = null

const checkSession = () => {
  if (!isAuthenticated()) {
    toast.error(t('admin.dashboard.sessionExpired'))
    router.push('/admin/login')
    return
  }

  // Refrescar token
  refreshToken()
  remainingTime.value = getRemainingSessionTime()

  // Verificar si está a punto de expirar
  if (isTokenExpiringSoon() && !sessionWarningShown.value) {
    sessionWarningShown.value = true
    toast.warning(t('admin.dashboard.sessionExpiring', { time: remainingTime.value }))
  }
}

const resetActivityTimeout = () => {
  if (activityTimeout) {
    clearTimeout(activityTimeout)
  }
  
  // Refrescar token cuando el usuario está activo
  activityTimeout = setTimeout(() => {
    refreshToken()
  }, 5 * 60 * 1000) // Refrescar después de 5 minutos de inactividad
}

onMounted(() => {
  // Verificar estado de inicio de sesión
  if (!isAuthenticated()) {
    toast.error(t('admin.dashboard.sessionExpired'))
    router.push('/admin/login')
    return
  }

  // Inicializar gestión de sesión
  refreshToken()
  remainingTime.value = getRemainingSessionTime()
  
  // Verificar estado de sesión periódicamente
  sessionCheckInterval = setInterval(checkSession, 60000) // Verificar cada minuto

  // Escuchar actividad del usuario
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, resetActivityTimeout, { passive: true })
  })

  loadStats()
})

onUnmounted(() => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval)
  }
  if (activityTimeout) {
    clearTimeout(activityTimeout)
  }
})
</script>

<style lang="scss" scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--accent-color);
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.header-left {
  flex: 1;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.admin-name,
.session-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;

  .info-icon {
    font-size: 1rem;
  }
}

.session-time {
  color: #f39c12;
  font-weight: 600;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-refresh,
.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.btn-refresh {
  background: var(--accent-color);
  color: var(--text-primary);

  &:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }

  span {
    font-size: 1.1rem;
    animation: none;
  }

  &:hover span {
    animation: spin 0.6s linear;
  }
}

.btn-logout {
  background: #e74c3c;
  color: #fff;

  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
}

.stat-icon {
  font-size: 3rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dashboard-content {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.content-nav {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  background: var(--accent-color);
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);

  .tab-icon {
    font-size: 1.2rem;
  }

  &:hover {
    color: var(--text-primary);
    background: rgba(102, 126, 234, 0.1);
  }

  &.active {
    color: #667eea;
    border-bottom-color: #667eea;
    background: #ffffff;
    font-weight: 600;
  }
}

.content-body {
  padding: 2rem;
}
</style>

