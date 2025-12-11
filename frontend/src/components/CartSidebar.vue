<template>
  <transition name="slide-fade">
    <div v-if="isOpen" class="cart-sidebar-overlay" @click="closeCart">
      <div class="cart-sidebar" @click.stop>
        <div class="cart-header">
          <h2 class="cart-title">购物车</h2>
          <button class="close-btn" @click="closeCart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="cart-content">
          <div v-if="cart.length === 0" class="empty-cart">
            <div class="empty-icon">🛒</div>
            <p>购物车是空的</p>
            <router-link to="/" class="btn btn-primary" @click="closeCart">
              去购物
            </router-link>
          </div>

          <div v-else class="cart-items">
            <div
              v-for="item in cart"
              :key="item.id"
              class="cart-item"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-spec">{{ item.material }} · {{ item.stone }}</p>
                <div class="item-price-info">
                  <div class="price-row">
                    <span class="price-label">单价：</span>
                    <div class="price-group">
                      <span class="item-price">{{ formatPrice(item.price) }}</span>
                      <span v-if="item.originalPrice" class="item-original-price">
                        {{ formatPrice(item.originalPrice) }}
                      </span>
                    </div>
                  </div>
                  <div class="price-row">
                    <span class="price-label">数量：</span>
                    <div class="item-quantity-controls">
                      <button
                        class="qty-btn"
                        @click="decreaseQuantity(item.id)"
                        :disabled="item.quantity <= 1"
                      >
                        −
                      </button>
                      <span class="qty-value">{{ item.quantity }}</span>
                      <button class="qty-btn" @click="increaseQuantity(item.id)">
                        +
                      </button>
                    </div>
                  </div>
                  <div class="price-row subtotal-row">
                    <span class="price-label">小计：</span>
                    <div class="subtotal-group">
                      <span class="item-subtotal">{{ formatPrice(getItemSubtotal(item)) }}</span>
                      <span v-if="item.originalPrice" class="item-savings">
                        节省 {{ formatPrice(getItemSavings(item)) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button class="remove-btn" @click="removeItem(item.id)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="cart.length > 0" class="cart-footer">
          <div class="cart-summary">
            <div class="summary-row">
              <span class="summary-label">商品数量：</span>
              <span class="summary-value">{{ totalItems }} 件</span>
            </div>
            <div v-if="totalSavings > 0" class="summary-row savings-row">
              <span class="summary-label">已节省：</span>
              <span class="summary-value savings">-{{ formatPrice(totalSavings) }}</span>
            </div>
            <div v-if="originalTotal > cartTotal" class="summary-row">
              <span class="summary-label">原价合计：</span>
              <span class="summary-value original-total">{{ formatPrice(originalTotal) }}</span>
            </div>
          </div>
          <div class="cart-total">
            <span class="total-label">订单总额：</span>
            <span class="total-amount">{{ formatPrice(cartTotal) }}</span>
          </div>
          <button class="btn-checkout" @click="handleCheckout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            发送订单到WhatsApp
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useJewelryStore } from '../store'
import { sendOrderToWhatsApp } from '../utils/whatsapp'
import { formatPrice } from '../utils/priceFormatter'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const store = useJewelryStore()
const cart = store.cart
const cartTotal = store.cartTotal

// WhatsApp电话号码配置
// 格式：国家代码+号码（不含+号），例如：8613800138000（中国）
const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '8613800138000'


// 计算单个商品的小计
const getItemSubtotal = (item) => {
  return item.price * item.quantity
}

// 计算单个商品的节省金额
const getItemSavings = (item) => {
  if (!item.originalPrice) return 0
  return (item.originalPrice - item.price) * item.quantity
}

// 计算商品总数
const totalItems = computed(() => {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
})

// 计算总节省金额
const totalSavings = computed(() => {
  return cart.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)
})

// 计算原价合计
const originalTotal = computed(() => {
  return cart.reduce((sum, item) => {
    const originalPrice = item.originalPrice || item.price
    return sum + originalPrice * item.quantity
  }, 0)
})

const increaseQuantity = (productId) => {
  const item = cart.find(item => item.id === productId)
  if (item) {
    item.quantity++
  }
}

const decreaseQuantity = (productId) => {
  const item = cart.find(item => item.id === productId)
  if (item && item.quantity > 1) {
    item.quantity--
  }
}

const removeItem = (productId) => {
  store.removeFromCart(productId)
}

const closeCart = () => {
  emit('close')
}

const handleCheckout = () => {
  if (cart.length === 0) {
    alert('购物车为空')
    return
  }

  // 可以在这里添加客户信息收集
  const customerInfo = {
    // name: '客户姓名',
    // phone: '客户电话',
    // address: '客户地址'
  }

  // 发送订单到WhatsApp
  sendOrderToWhatsApp(whatsappPhone, cart, cartTotal, customerInfo)
  
  // 可选：清空购物车
  // cart.forEach(item => store.removeFromCart(item.id))
}
</script>

<style lang="scss" scoped>
.cart-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(4px);
}

.cart-sidebar {
  width: 100%;
  max-width: 450px;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  border-left: 1px solid var(--border-color);

  @media (max-width: 768px) {
    max-width: 100%;
    background: rgba(255, 255, 255, 0.98);
  }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.cart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: var(--transition);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: var(--transition);
  position: relative;

  @media (max-width: 768px) {
    background: rgba(255, 255, 255, 0.95);
    padding: 1rem 0.75rem;
    gap: 0.75rem;
  }

  &:hover {
    box-shadow: var(--shadow-sm);
    background: rgba(255, 255, 255, 0.25);
  }

  &:active {
    transform: scale(0.98);
  }
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.item-spec {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.item-price-info {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.price-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
}

.price-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-price {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.item-original-price {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
}

.subtotal-row {
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.subtotal-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.item-subtotal {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.item-savings {
  font-size: 0.8rem;
  color: #4ade80;
  font-weight: 600;
}

.item-quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.25rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  transition: var(--transition);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    font-size: 1.2rem;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  &:active:not(:disabled) {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: #fff;
}

.remove-btn {
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: var(--transition);
  align-self: flex-start;

  &:hover {
    background: rgba(231, 76, 60, 0.3);
    color: #fff;
  }
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.cart-summary {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.summary-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.summary-value {
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.summary-value.savings {
  color: #4ade80;
  font-weight: 700;
}

.summary-value.original-total {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: line-through;
  font-size: 0.9rem;
}

.savings-row {
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.total-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.total-amount {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: #25D366;
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-md);
  min-height: 52px; // 移动端最小触摸目标

  @media (max-width: 768px) {
    padding: 1.25rem;
    font-size: 1.15rem;
    min-height: 56px;
  }

  &:hover {
    background: #20BA5A;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
    background: #1EA850;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: var(--transition);
  display: inline-block;

  &.btn-primary {
    background: var(--primary-gradient);
    color: #fff;

    &:hover {
      filter: brightness(1.1);
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
}

.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from .cart-sidebar,
.slide-fade-leave-to .cart-sidebar {
  transform: translateX(100%);
}
</style>

