<template>
  <div class="category-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <span class="category-icon">{{ categoryIcon }}</span>
          {{ categoryName }}
        </h1>
        <p class="page-subtitle">发现精美的{{ categoryName }}系列</p>
      </div>

      <div v-if="products.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h2>暂无商品</h2>
        <p>该分类下暂时没有商品</p>
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
      </div>

      <div v-else class="products-grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useJewelryStore } from '../store'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const store = useJewelryStore()

const categoryId = route.params.id

const category = computed(() => {
  return store.categories.find(cat => cat.id === categoryId)
})

const categoryName = computed(() => category.value?.name || '分类')
const categoryIcon = computed(() => category.value?.icon || '💎')

const products = computed(() => {
  return store.getProductsByCategory(categoryId)
})

// 如果商品列表为空，尝试加载
onMounted(async () => {
  if (store.products.length === 0 && !store.isLoading) {
    await store.loadProducts()
  }
})
</script>

<style lang="scss" scoped>
.category-page {
  padding: 3rem 0 5rem;
  min-height: 60vh;

  @media (max-width: 768px) {
    padding-bottom: 6rem; // 为底部导航栏预留空间
  }
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.category-icon {
  font-size: 3.5rem;
  filter: drop-shadow(0 4px 8px rgba(255, 105, 180, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  transition: var(--transition-smooth);
  display: inline-block;

  &.btn-primary {
    background: var(--primary-gradient);
    color: #fff;
    box-shadow: var(--shadow-md);

    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
      filter: brightness(1.1);
    }
  }
}
</style>

