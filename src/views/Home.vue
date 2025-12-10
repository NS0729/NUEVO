<template>
  <div class="home">
    <!-- Featured Products -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精选推荐</h2>
          <p class="section-subtitle">为您精心挑选的优质珠宝</p>
        </div>
        <div class="products-grid">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <h3>精选材质</h3>
            <p>严格筛选优质材料，确保每一件珠宝的品质</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <h3>精湛工艺</h3>
            <p>传承百年工艺，每一件都是艺术品</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📦</div>
            <h3>精美包装</h3>
            <p>专业包装，完美呈现您的珍贵礼物</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <h3>品质保证</h3>
            <p>正品保证，提供权威认证证书</p>
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

const store = useJewelryStore()
const featuredProducts = computed(() => store.featuredProducts)

// 如果商品列表为空，尝试加载
onMounted(async () => {
  if (store.products.length === 0 && !store.isLoading) {
    await store.loadProducts()
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
}

.features-section {
  padding: 6rem 0;
  background: var(--accent-color);
  position: relative;
  
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
</style>

