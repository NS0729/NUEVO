<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">💎</span>
          <span class="logo-text">{{ t('home.title') }}</span>
        </router-link>

        <div class="nav-links">
          <router-link 
            v-for="category in categories" 
            :key="category.id"
            :to="`/category/${category.id}`"
            class="nav-link"
          >
            <span class="nav-icon">{{ category.icon }}</span>
            <span class="nav-text">{{ category.name }}</span>
          </router-link>
        </div>

        <div class="nav-actions">
          <button class="search-btn" @click="toggleSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
          <button class="cart-btn" @click="openCart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </button>
          <button 
            class="menu-btn" 
            :class="{ active: mobileMenuOpen }"
            @click="toggleMobileMenu"
            :aria-label="t('nav.home')"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Menú móvil -->
    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <router-link 
          v-for="category in categories" 
          :key="category.id"
          :to="`/category/${category.id}`"
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <span class="mobile-nav-icon">{{ category.icon }}</span>
          {{ category.name }}
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJewelryStore } from '../store'
import { useI18n } from '../i18n'

const router = useRouter()
const store = useJewelryStore()
const { t } = useI18n()


const categories = store.categories
const mobileMenuOpen = ref(false)

const cartCount = computed(() => {
  return store.cart.reduce((sum, item) => sum + item.quantity, 0)
})

const toggleSearch = () => {
  router.push('/search')
}

const openCart = () => {
  router.push('/cart')
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<style lang="scss" scoped>
.navbar {
  background: #ffffff;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 1rem 0;
    gap: 1rem;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: var(--transition-smooth);
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    gap: 0.375rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    
    .logo-text {
      display: none; // Solo mostrar icono en pantallas pequeñas
    }
  }
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
}

.logo-icon {
  font-size: 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-smooth);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: var(--accent-color);
    opacity: 0;
    transition: var(--transition-smooth);
    z-index: -1;
  }

  &:hover,
  &.router-link-active {
    color: var(--primary-color);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
    
    .nav-icon {
      transform: scale(1.2) rotate(5deg);
    }
  }
}

.nav-icon {
  font-size: 1.2rem;
  transition: var(--transition-smooth);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-btn,
.cart-btn {
  position: relative;
  padding: 0.625rem;
  color: var(--text-secondary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
    background: var(--accent-color);
    transform: scale(1.1) rotate(5deg);
  }
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--primary-gradient);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
  box-shadow: var(--shadow-pink);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(25%, -25%) scale(1);
  }
  50% {
    transform: translate(25%, -25%) scale(1.1);
  }
}

.menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 0.5rem;
  border-radius: 8px;
  transition: var(--transition);

  @media (max-width: 768px) {
    display: flex;
  }

  &:hover {
    background: var(--accent-color);
  }

  &:active {
    transform: scale(0.95);
  }

  span {
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    border-radius: 2px;
    transition: var(--transition);
  }

  &.active {
    span:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }
  }
}

.mobile-menu {
  display: none;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  background: #ffffff;

  @media (max-width: 768px) {
    display: block;
  }
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-smooth);
  border-radius: 12px;
  margin: 0.5rem 1rem;

  &:hover {
    color: var(--primary-color);
    background: var(--accent-color);
    transform: translateX(8px);
  }
}

.mobile-nav-icon {
  font-size: 1.5rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>

