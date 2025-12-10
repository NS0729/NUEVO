<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image-wrapper">
      <img 
        :src="product.image" 
        :alt="product.name"
        class="product-image"
        loading="lazy"
        @load="onImageLoad"
        @error="onImageError"
      />
      <div v-if="product.originalPrice" class="discount-badge">
        {{ discountPercent }}% OFF
      </div>
      <div class="product-overlay">
        <div class="overlay-actions">
          <button class="quick-view-btn" @click.stop="goToDetail">
            查看详情
          </button>
          <button 
            v-if="product.inStock"
            class="quick-order-btn" 
            @click.stop="quickOrder"
            title="快速下单"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp下单
          </button>
        </div>
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ product.description.substring(0, 50) }}...</p>
      
      <div class="product-price">
        <span class="current-price">{{ formatPrice(product.price) }}</span>
        <span v-if="product.originalPrice" class="original-price">
          {{ formatPrice(product.originalPrice) }}
        </span>
      </div>

      <div class="product-meta">
        <span class="material">{{ product.material }}</span>
        <span class="stock" :class="{ 'out-of-stock': !product.inStock }">
          {{ product.inStock ? '有货' : '缺货' }}
        </span>
      </div>

      <div v-if="product.inStock" class="quantity-selector">
        <label class="quantity-label">数量：</label>
        <div class="quantity-controls">
          <button 
            class="qty-btn"
            @click.stop="decreaseQuantity"
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
            @click.stop
            @change="validateQuantity"
          />
          <button 
            class="qty-btn"
            @click.stop="increaseQuantity"
            :disabled="quantity >= 99"
          >
            +
          </button>
        </div>
      </div>

      <div class="product-actions">
        <button 
          class="action-btn add-cart-btn"
          :disabled="!product.inStock"
          @click.stop="addToCart"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          加入购物车
        </button>
        <button 
          v-if="product.inStock"
          class="action-btn whatsapp-btn"
          @click.stop="quickOrder"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          快速下单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useJewelryStore } from '../store'
import { quickOrderToWhatsApp } from '../utils/whatsapp'
import { formatPrice } from '../utils/priceFormatter'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const store = useJewelryStore()

// 数量状态
const quantity = ref(1)

// WhatsApp电话号码配置
const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '8613800138000'

const discountPercent = computed(() => {
  if (!props.product.originalPrice) return 0
  return Math.round(
    ((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100
  )
})


const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
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
  if (props.product.inStock) {
    store.addToCart(props.product, quantity.value)
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

const quickOrder = () => {
  if (props.product.inStock) {
    quickOrderToWhatsApp(whatsappPhone, props.product, quantity.value)
  } else {
    alert('该商品暂时缺货')
  }
}

const onImageLoad = (e) => {
  e.target.classList.add('loaded')
}

const onImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found'
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 2px;
    background: var(--primary-gradient);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: var(--transition-smooth);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);

    &::before {
      opacity: 1;
    }

    .product-overlay {
      opacity: 1;
    }

    .product-image {
      transform: scale(1.08);
    }

    .product-name {
      color: var(--primary-color);
    }
  }
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--accent-color);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
  opacity: 0;

  &.loaded {
    opacity: 1;
  }
}

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--primary-gradient);
  color: #fff;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
  box-shadow: var(--shadow-pink);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition-smooth);
  backdrop-filter: blur(2px);
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.quick-view-btn {
  background: var(--primary-gradient);
  color: #fff;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-md);
  white-space: nowrap;

  &:hover {
    filter: brightness(1.1);
    transform: scale(1.08) translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.quick-order-btn {
  background: #25D366;
  color: #fff;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:hover {
    background: #20BA5A;
    transform: scale(1.08) translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.product-info {
  padding: 1.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.product-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  transition: var(--transition-smooth);
  line-height: 1.4;
}

.product-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex: 1;
  line-height: 1.6;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.current-price {
  font-size: 1.75rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.original-price {
  font-size: 1rem;
  color: var(--text-light);
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.material {
  padding: 0.375rem 0.875rem;
  background: var(--accent-color);
  border-radius: 12px;
  color: var(--primary-color);
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.stock {
  &.out-of-stock {
    color: #e74c3c;
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--border-color);
}

.quantity-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-color);
  border-radius: 10px;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.2rem;
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
  width: 50px;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  padding: 0.25rem 0;
  outline: none;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    background: rgba(255, 105, 180, 0.1);
    border-radius: 6px;
  }
}

.product-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
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

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.add-cart-btn {
  background: var(--accent-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover:not(:disabled) {
    background: var(--primary-light);
    color: #fff;
    border-color: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
}

.whatsapp-btn {
  background: #25D366;
  color: #fff;
  box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);

  &:hover {
    background: #20BA5A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  }
}

@media (max-width: 768px) {
  .product-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .overlay-actions {
    width: 100%;
    padding: 0 1rem;
  }

  .quick-view-btn,
  .quick-order-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

