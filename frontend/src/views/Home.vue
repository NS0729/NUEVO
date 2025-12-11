<template>
  <div class="home">
    <!-- Featured Products -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.featuredProducts') }}</h2>
          <p class="section-subtitle">{{ t('home.featuredSubtitle') }}</p>
        </div>
        <div class="products-grid" :class="{ 'landscape-mode': isLandscape && isMobile }">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            :is-landscape="isLandscape && isMobile"
          />
          <div v-if="featuredProducts.length === 0 && !store.isLoading" class="empty-state">
            <p>{{ t('home.noProducts') || 'No hay productos disponibles' }}</p>
          </div>
          <div v-if="store.isLoading" class="loading-state">
            <p>{{ t('common.loading') || 'Cargando productos...' }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <h3>{{ t('home.features.material') }}</h3>
            <p>{{ t('home.features.materialDesc') }}</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <h3>{{ t('home.features.craft') }}</h3>
            <p>{{ t('home.features.craftDesc') }}</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📦</div>
            <h3>{{ t('home.features.packaging') }}</h3>
            <p>{{ t('home.features.packagingDesc') }}</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <h3>{{ t('home.features.guarantee') }}</h3>
            <p>{{ t('home.features.guaranteeDesc') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useJewelryStore } from '../store'
import ProductCard from '../components/ProductCard.vue'
import { useOrientation } from '../composables/useOrientation'
import { useI18n } from '../i18n'

const store = useJewelryStore()
const { t } = useI18n()
const featuredProducts = computed(() => store.featuredProducts)

// Detección de orientación horizontal
const { isLandscape, isMobile } = useOrientation()

// Si la lista de productos está vacía, intentar cargar
onMounted(async () => {
  console.log('🏠 Home: Componente montado')
  console.log('🏠 Home: Estado inicial - productos:', store.products.length, 'isLoading:', store.isLoading)
  console.log('🏠 Home: FeaturedProducts inicial:', featuredProducts.value.length)
  
  if (store.products.length === 0 && !store.isLoading) {
    console.log('🏠 Home: Cargando productos...')
    await store.loadProducts()
    console.log('🏠 Home: Productos cargados - total:', store.products.length)
    console.log('🏠 Home: FeaturedProducts después de cargar:', featuredProducts.value.length)
  } else {
    console.log('🏠 Home: Productos ya cargados o cargando')
  }
})
</script>

<style lang="scss" scoped>
.home {
  flex: 1;
}

.featured-section {
  padding: 6rem 0;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 3rem 0;
    padding-bottom: 5rem; // Reservar espacio para la barra de navegación inferior
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary-light), transparent);
  }
}

.section-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: var(--primary-gradient);
    border-radius: 2px;
  }
}

.section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.15rem;
  margin-bottom: 3rem;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.section-header {
  margin-bottom: 3rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  animation: fadeIn 0.6s ease-out;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  // Modo horizontal: diseño de desplazamiento horizontal
  &.landscape-mode {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 1.5rem;
    padding-bottom: 1rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-light) transparent;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--primary-light);
      border-radius: 3px;
    }

    // Estilos de tarjeta de producto en modo horizontal
    :deep(.product-card) {
      flex: 0 0 auto;
      width: 85vw;
      max-width: 400px;
      min-width: 300px;
      scroll-snap-align: start;
    }
  }
}

.features-section {
  padding: 6rem 0;
  background: var(--accent-color);
  position: relative;
  
  @media (max-width: 768px) {
    padding: 3rem 0;
    padding-bottom: 5rem; // Reservar espacio para la barra de navegación inferior
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary-light), transparent);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
}

.feature-item {
  text-align: center;
  padding: 2rem;
  border-radius: 20px;
  background: #ffffff;
  transition: var(--transition-smooth);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-light);
  }

  .feature-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    display: inline-block;
    transition: var(--transition-smooth);
    filter: drop-shadow(0 4px 8px rgba(255, 105, 180, 0.2));
  }

  &:hover .feature-icon {
    transform: scale(1.15) rotate(5deg);
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 0.95rem;
  }
}

.empty-state, .loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>

