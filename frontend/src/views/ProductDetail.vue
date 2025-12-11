<template>
  <div v-if="product" class="product-detail-page">
    <div class="container">
      <div class="product-detail">
        <div class="product-images">
          <ImageGallery :images="product.images" :alt="product.name" />
        </div>

        <div class="product-info">
          <div class="breadcrumb">
            <router-link to="/">首页</router-link>
            <span>/</span>
            <router-link :to="`/category/${product.category}`">
              {{ getCategoryName(product.category) }}
            </router-link>
            <span>/</span>
            <span>{{ product.name }}</span>
          </div>

          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-rating">
            <div class="stars">★★★★★</div>
            <span class="rating-text">(4.8分 · 128条评价)</span>
          </div>

          <div class="product-price-section">
            <div class="price-group">
              <span class="current-price">{{ formatPrice(product.price) }}</span>
              <span v-if="product.originalPrice" class="original-price">
                {{ formatPrice(product.originalPrice) }}
              </span>
            </div>
            <div v-if="product.originalPrice" class="discount-info">
              节省 {{ formatPrice(product.originalPrice - product.price) }}
            </div>
          </div>

          <div class="product-description">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-specs">
            <div class="spec-item">
              <span class="spec-label">材质：</span>
              <span class="spec-value">{{ product.material }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">主石：</span>
              <span class="spec-value">{{ product.stone }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">尺寸：</span>
              <span class="spec-value">{{ product.size }}</span>
            </div>
          </div>

          <div v-if="product.inStock" class="quantity-selector">
            <label class="quantity-label">数量：</label>
            <div class="quantity-controls">
              <button 
                class="qty-btn"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >
                −
              </button>
              <input 
                type="number" 
                v-model.number="quantity" 
                min="1" 
                max="99"
                class="qty-input"
                @change="validateQuantity"
              />
              <button 
                class="qty-btn"
                @click="increaseQuantity"
                :disabled="quantity >= 99"
              >
                +
              </button>
            </div>
          </div>

          <div class="product-actions">
            <button 
              class="btn btn-primary btn-large"
              :disabled="!product.inStock"
              @click="addToCart"
            >
              <span v-if="product.inStock">加入购物车</span>
              <span v-else>暂时缺货</span>
            </button>
            <button 
              class="btn btn-whatsapp btn-large"
              :disabled="!product.inStock"
              @click="quickOrderWhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              发送到WhatsApp下单
            </button>
          </div>

          <div class="product-features">
            <div class="feature-item">
              <span class="feature-icon">🚚</span>
              <span>免费配送</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔒</span>
              <span>正品保证</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">↩️</span>
              <span>7天退换</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📜</span>
              <span>权威认证</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <section class="related-section">
        <h2 class="section-title">相关推荐</h2>
        <div class="products-grid">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </section>
    </div>
  </div>

  <div v-else class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <p>商品未找到</p>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJewelryStore } from '../store'
import { quickOrderToWhatsApp } from '../utils/whatsapp'
import { formatPrice } from '../utils/priceFormatter'
import ImageGallery from '../components/ImageGallery.vue'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const store = useJewelryStore()

// 数量状态
const quantity = ref(1)

// WhatsApp电话号码配置
// 格式：国家代码+号码（不含+号），例如：8613800138000（中国）
const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '8613800138000'

const product = computed(() => {
  return store.getProductById(route.params.id)
})

// 如果商品不存在，尝试从API加载
onMounted(async () => {
  if (!product.value && !store.isLoading) {
    await store.loadProducts()
  }
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return store.products
    .filter(p => p.category === product.value.category && p.id !== product.value.id)
    .slice(0, 4)
})

const getCategoryName = (categoryId) => {
  const category = store.categories.find(cat => cat.id === categoryId)
  return category?.name || ''
}


// 增加数量
const increaseQuantity = () => {
  if (quantity.value < 99) {
    quantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 验证数量
const validateQuantity = () => {
  if (quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > 99) {
    quantity.value = 99
  }
}

const addToCart = () => {
  if (product.value && product.value.inStock) {
    store.addToCart(product.value, quantity.value)
    // 显示成功提示
    const toast = inject('toast', null)
    if (toast) {
      toast.success(`已添加 ${quantity.value} 件商品到购物车！`)
    } else {
      alert(`已添加 ${quantity.value} 件商品到购物车！`)
    }
    // 重置数量
    quantity.value = 1
  }
}

const quickOrderWhatsApp = () => {
  if (product.value && product.value.inStock) {
    quickOrderToWhatsApp(whatsappPhone, product.value, quantity.value)
  } else {
    alert('该商品暂时缺货')
  }
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  padding: 3rem 0 5rem;

  @media (max-width: 768px) {
    padding-bottom: 6rem; // 为底部导航栏预留空间
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

