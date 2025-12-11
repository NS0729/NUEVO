<template>
  <div class="product-card" :class="{ 'landscape-layout': isLandscape }" @click="goToDetail">
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
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      
      <div class="product-price">
        <span class="current-price">{{ formatPrice(product.price) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatPrice } from '../utils/priceFormatter'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isLandscape: {
    type: Boolean,
    default: false
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

    .product-image {
      transform: scale(1.08);
    }

    .product-name {
      color: var(--primary-color);
    }
  }

  // 横屏布局：横向排列（图片在左，信息在右）
  &.landscape-layout {
    flex-direction: row;
    height: auto;
    min-height: 200px;
    max-height: 250px;

    .product-image-wrapper {
      flex: 0 0 40%;
      max-width: 200px;
      aspect-ratio: 1;
      height: 100%;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      min-width: 0; // 防止内容溢出

      .product-name {
        font-size: 1rem;
        margin-bottom: 0.5rem;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-description {
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-price {
        margin-bottom: 0.5rem;
      }

      .product-meta {
        font-size: 0.7rem;
        margin-bottom: 0.5rem;
      }

      .quantity-selector {
        margin-bottom: 0.5rem;
        font-size: 0.8rem;

        .quantity-label {
          font-size: 0.75rem;
        }

        .quantity-controls {
          .qty-btn {
            width: 28px;
            height: 28px;
            font-size: 0.9rem;
          }

          .qty-input {
            width: 40px;
            height: 28px;
            font-size: 0.85rem;
          }
        }
      }

      .product-actions {
        flex-direction: row;
        gap: 0.5rem;
        margin-top: auto;

        .action-btn {
          flex: 1;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          white-space: nowrap;
          min-height: 36px;

          svg {
            width: 14px;
            height: 14px;
          }
        }
      }
    }

    // 横屏时隐藏覆盖层，直接显示信息
    .product-overlay {
      display: none;
    }

    &:hover {
      transform: translateY(-4px) scale(1.01);
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
    .product-card {
      &:active {
        transform: scale(0.98);
      }
    }

    .product-actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      min-height: 48px; // 移动端最小触摸目标
    }

    .overlay-actions {
      width: 100%;
      padding: 0 1rem;
    }

    .quick-view-btn,
    .quick-order-btn {
      width: 100%;
      justify-content: center;
      padding: 1rem;
      min-height: 48px;
    }

    .product-info {
      padding: 1.25rem;
    }

    .product-name {
      font-size: 1.1rem;
    }

    .current-price {
      font-size: 1.5rem;
    }
  }
</style>

