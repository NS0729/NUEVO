import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Search from '../views/Search.vue'
import Cart from '../views/Cart.vue'
import AdminLogin from '../views/admin/Login.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Category
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { requiresGuest: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guardia de rutas
router.beforeEach((to, from, next) => {
  // Importar dinámicamente herramienta de autenticación para evitar dependencias circulares
  import('../utils/auth.js').then(({ isAuthenticated }) => {
    const authenticated = isAuthenticated()
    
    // Páginas que requieren inicio de sesión
    if (to.meta.requiresAuth && !authenticated) {
      next('/admin/login')
      return
    }
    
    // Usuario autenticado accediendo a página de inicio de sesión, redirigir al panel de administración
    if (to.meta.requiresGuest && authenticated) {
      next('/admin/dashboard')
      return
    }
    
    next()
  }).catch(() => {
    // Si la importación falla, usar verificación simple de localStorage
    const isAuthenticated = localStorage.getItem('admin_token')
    
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/admin/login')
      return
    }
    
    if (to.meta.requiresGuest && isAuthenticated) {
      next('/admin/dashboard')
      return
    }
    
    next()
  })
})

export default router

