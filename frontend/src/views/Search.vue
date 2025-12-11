<template>
  <div class="search-page">
    <div class="container">
      <div class="search-header">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('search.placeholder')"
            class="search-input"
            @input="handleSearch"
            @keyup.enter="handleSearch"
          />
          <button class="search-button" @click="handleSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="searchQuery" class="search-results">
        <div class="results-header">
          <h2>{{ t('search.results') }}</h2>
          <p class="results-count">{{ t('search.found', { count: searchResults.length }) }}</p>
        </div>

        <div v-if="searchResults.length === 0" class="empty-results">
          <div class="empty-icon">🔍</div>
          <h3>{{ t('search.noResults') }}</h3>
          <p>{{ t('search.tryOther') }}</p>
        </div>

        <div v-else class="products-grid" :class="{ 'landscape-mode': isLandscape && isMobile }">
          <ProductCard
            v-for="product in searchResults"
            :key="product.id"
            :product="product"
            :is-landscape="isLandscape && isMobile"
          />
        </div>
      </div>

      <div v-else class="search-suggestions">
        <h2>{{ t('search.hotSearch') }}</h2>
        <div class="suggestions-list">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="suggestion-tag"
            @click="searchQuery = suggestion; handleSearch()"
          >
            {{ suggestion }}
          </button>
        </div>

        <div class="categories-preview">
          <h2>{{ t('search.browseCategories') }}</h2>
          <div class="categories-list">
            <router-link
              v-for="category in categories"
              :key="category.id"
              :to="`/category/${category.id}`"
              class="category-preview-card"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useJewelryStore } from '../store'
import ProductCard from '../components/ProductCard.vue'
import { useOrientation } from '../composables/useOrientation'
import { useI18n } from '../i18n'

// Detección de orientación horizontal
const { isLandscape, isMobile } = useOrientation()

const store = useJewelryStore()
const { t } = useI18n()
const searchQuery = ref('')
const searchResults = ref([])

const categories = store.categories
const suggestions = ['Diamante', 'Oro', 'Perla', 'Jade', 'Zafiro', 'Anillo', 'Collar']

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    searchResults.value = store.searchProducts(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

onMounted(async () => {
  // Si la lista de productos está vacía, cargar productos primero
  if (store.products.length === 0 && !store.isLoading) {
    await store.loadProducts()
  }
  
  // Si hay una consulta de búsqueda inicial, ejecutar búsqueda
  if (store.searchQuery) {
    searchQuery.value = store.searchQuery
    handleSearch()
  }
})
</script>

<style lang="scss" scoped>
.search-page {
  padding: 3rem 0 5rem;
  min-height: 60vh;

  @media (max-width: 768px) {
    padding-bottom: 6rem; // Reservar espacio para la barra de navegación inferior
  }
}

.search-header {
  margin-bottom: 3rem;
}

.search-box {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  gap: 0;
  background: #fff;
  border-radius: 50px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 2px solid var(--border-color);
  transition: var(--transition-smooth);

  &:focus-within {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-lg);
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    border-radius: 25px;
    
    &:focus-within {
      transform: scale(1.01);
    }
  }
}

.search-input {
  flex: 1;
  padding: 1.25rem 1.5rem;
  border: none;
  font-size: 1rem;
  outline: none;
  color: var(--text-primary);

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 16px; // Prevenir escalado automático de iOS
  }

  &::placeholder {
    color: var(--text-light);
  }
}

.search-button {
  padding: 1.25rem 2rem;
  background: var(--primary-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);

  &:hover {
    filter: brightness(1.1);
    transform: scale(1.05);
  }
}

.search-results {
  .results-header {
    margin-bottom: 2rem;

    h2 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
  }

  .results-count {
    color: var(--text-secondary);
  }
}

.empty-results {
  text-align: center;
  padding: 4rem 2rem;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

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

.search-suggestions {
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 4rem;
}

.suggestion-tag {
  padding: 0.875rem 1.75rem;
  background: var(--accent-color);
  border-radius: 25px;
  color: var(--text-primary);
  font-weight: 500;
  transition: var(--transition-smooth);
  border: 1px solid var(--border-color);

  &:hover {
    background: var(--primary-gradient);
    color: #fff;
    transform: translateY(-3px) scale(1.05);
    box-shadow: var(--shadow-md);
    border-color: transparent;
  }
}

.categories-preview {
  margin-top: 4rem;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }
}

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
    
    .category-icon {
      transform: scale(1.2) rotate(5deg);
    }
    
    .category-name {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .category-icon {
    font-size: 3.5rem;
    transition: var(--transition-smooth);
    filter: drop-shadow(0 4px 8px rgba(255, 105, 180, 0.2));
  }

  .category-name {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-primary);
    transition: var(--transition-smooth);
  }
}
</style>

