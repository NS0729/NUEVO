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

// 路由守卫
router.beforeEach((to, from, next) => {
  // 动态导入auth工具以避免循环依赖
  import('../utils/auth.js').then(({ isAuthenticated }) => {
    const authenticated = isAuthenticated()
    
    // 需要登录的页面
    if (to.meta.requiresAuth && !authenticated) {
      next('/admin/login')
      return
    }
    
    // 已登录用户访问登录页，重定向到后台
    if (to.meta.requiresGuest && authenticated) {
      next('/admin/dashboard')
      return
    }
    
    next()
  }).catch(() => {
    // 如果导入失败，使用简单的localStorage检查
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

