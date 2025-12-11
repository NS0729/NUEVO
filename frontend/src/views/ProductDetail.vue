<template>
  <div v-if="product" class="product-detail-page">
    <div class="container">
      <div class="product-detail">
        <div class="product-images">
          <ImageGallery :images="product.images" :alt="product.name" />
        </div>

        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price-section">
            <span class="current-price">{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <p>{{ t('product.notFound') }}</p>
      <router-link to="/" class="btn btn-primary">{{ t('product.backHome') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useJewelryStore } from '../store'
import { formatPrice } from '../utils/priceFormatter'
import ImageGallery from '../components/ImageGallery.vue'
import { useI18n } from '../i18n'

const route = useRoute()
const store = useJewelryStore()
const { t } = useI18n()

const product = computed(() => {
  return store.getProductById(route.params.id)
})

// Si el producto no existe, intentar cargar desde la API
onMounted(async () => {
  if (!product.value && !store.isLoading) {
    await store.loadProducts()
  }
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  padding: 3rem 0 5rem;

  @media (max-width: 768px) {
    padding-bottom: 6rem; // Reservar espacio para la barra de navegación inferior
  }
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  margin-bottom: 5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.product-images {
  position: sticky;
  top: 100px;
  height: fit-content;

  @media (max-width: 1023px) {
    position: static;
  }
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);

  a {
    color: var(--text-secondary);
    transition: var(--transition);

    &:hover {
      color: var(--primary-color);
    }
  }
}

.product-title {
  font-size: 3rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.3rem;
}

.rating-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.product-price-section {
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.current-price {
  font-size: 3rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
}

.original-price {
  font-size: 1.5rem;
  color: var(--text-light);
  text-decoration: line-through;
}

.discount-info {
  color: #e74c3c;
  font-weight: 600;
}

.product-description {
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.8;
  }
}

.product-specs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: var(--accent-color);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.spec-item {
  display: flex;
  gap: 1rem;

  .spec-label {
    font-weight: 600;
    color: var(--text-primary);
    min-width: 80px;
  }

  .spec-value {
    color: var(--text-secondary);
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.quantity-label {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-color);
  border-radius: 12px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
}

.qty-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.3rem;
  transition: var(--transition-smooth);
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--primary-light);
    color: #fff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.qty-input {
  width: 60px;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.5rem 0;
  outline: none;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    background: rgba(255, 105, 180, 0.1);
    border-radius: 8px;
  }
}

.product-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: var(--transition);
  flex: 1;
  min-width: 150px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }

  &.btn-large {
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
  }

  &.btn-primary {
    background: var(--primary-gradient);
    color: #fff;
    box-shadow: var(--shadow-md);

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
      filter: brightness(1.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.btn-outline {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);

    &:hover {
      background: var(--primary-gradient);
      color: #fff;
      transform: translateY(-2px);
    }
  }

  &.btn-whatsapp {
    background: #25D366;
    color: #fff;
    box-shadow: var(--shadow-md);

    &:hover:not(:disabled) {
      background: #20BA5A;
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.product-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 2rem;
  background: var(--accent-color);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;

  .feature-icon {
    font-size: 1.5rem;
  }
}

.related-section {
  margin-top: 5rem;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-content {
  text-align: center;

  h1 {
    font-size: 6rem;
    color: var(--text-light);
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
}
</style>

