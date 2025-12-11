<template>
  <div class="cart-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">🛒 {{ t('cart.title') }}</h1>
        <p class="page-subtitle">{{ t('cart.emptyDesc') }}</p>
      </div>

      <div v-if="cart.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>{{ t('cart.empty') }}</h2>
        <p>{{ t('cart.emptyDesc') }}</p>
        <router-link to="/" class="btn btn-primary">
          {{ t('cart.goShopping') }}
        </router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-main">
          <div class="cart-items-section">
            <div class="section-header">
              <h2 class="section-title">{{ t('cart.items') }}</h2>
              <button class="clear-cart-btn" @click="clearCart">
                {{ t('cart.clear') }}
              </button>
            </div>

            <div class="cart-items">
              <div
                v-for="item in cart"
                :key="item.id"
                class="cart-item"
              >
                <div class="item-image-wrapper">
                  <img :src="item.image" :alt="item.name" class="item-image" />
                  <div v-if="item.originalPrice" class="discount-badge">
                    {{ getDiscountPercent(item) }}% OFF
                  </div>
                </div>
                
                <div class="item-details">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <p class="item-description">{{ item.description }}</p>
                  
                  <div class="item-specs">
                    <span class="spec-tag">{{ item.material }}</span>
                    <span class="spec-tag">{{ item.stone }}</span>
                    <span class="spec-tag">{{ item.size }}</span>
                  </div>

                  <div class="item-pricing">
                    <div class="price-row">
                      <span class="price-label">{{ t('common.price') }}:</span>
                      <div class="price-group">
                        <span class="item-price">{{ formatPrice(item.price) }}</span>
                        <span v-if="item.originalPrice" class="item-original-price">
                          {{ formatPrice(item.originalPrice) }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="quantity-row">
                      <span class="price-label">{{ t('common.quantity') }}:</span>
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

                    <div class="subtotal-row">
                      <span class="price-label">{{ t('cart.subtotal') }}:</span>
                      <div class="subtotal-group">
                        <span class="item-subtotal">{{ formatPrice(getItemSubtotal(item)) }}</span>
                        <span v-if="item.originalPrice" class="item-savings">
                          {{ t('cart.itemRemoved') }} {{ formatPrice(getItemSavings(item)) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button class="remove-btn" @click="removeItem(item.id)" :title="t('cart.remove')">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="cart-summary-section">
            <div class="summary-card">
              <h2 class="summary-title">{{ t('cart.total') }}</h2>
              
              <div class="summary-content">
                <div class="summary-row">
                  <span class="summary-label">{{ t('cart.items') }}</span>
                  <span class="summary-value">{{ totalItems }} {{ t('cart.item') }}</span>
                </div>
                
                <div v-if="totalSavings > 0" class="summary-row savings-row">
                  <span class="summary-label">{{ t('cart.itemRemoved') }}</span>
                  <span class="summary-value savings">-{{ formatPrice(totalSavings) }}</span>
                </div>
              </div>

              <div class="total-section">
                <span class="total-label">{{ t('cart.total') }}</span>
                <span class="total-amount">{{ formatPrice(cartTotal) }}</span>
              </div>

              <button class="btn-checkout" @click="handleCheckout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {{ t('cart.checkout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useJewelryStore } from '../store'
import { sendOrderToWhatsApp } from '../utils/whatsapp'
import { formatPrice } from '../utils/priceFormatter'
import { useI18n } from '../i18n'

const router = useRouter()
const store = useJewelryStore()
const { t } = useI18n()
const cart = store.cart
const cartTotal = store.cartTotal

// Configuración de número de teléfono WhatsApp
const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '8613800138000'


// Calcular porcentaje de descuento
const getDiscountPercent = (item) => {
  if (!item.originalPrice) return 0
  return Math.round(
    ((item.originalPrice - item.price) / item.originalPrice) * 100
  )
}

// Calcular subtotal de un solo producto
const getItemSubtotal = (item) => {
  return item.price * item.quantity
}

// Calcular ahorro de un solo producto
const getItemSavings = (item) => {
  if (!item.originalPrice) return 0
  return (item.originalPrice - item.price) * item.quantity
}

// Calcular total de productos
const totalItems = computed(() => {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
})

// Calcular ahorro total
const totalSavings = computed(() => {
  return cart.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)
})

// Calcular total de precio original
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
  const toast = inject('toast', null)
  if (confirm(t('cart.confirmClear'))) {
    store.removeFromCart(productId)
    if (toast) {
      toast.success(t('cart.itemRemoved'))
    }
  }
}

const clearCart = () => {
  const toast = inject('toast', null)
  if (confirm(t('cart.confirmClear'))) {
    cart.forEach(item => store.removeFromCart(item.id))
    if (toast) {
      toast.success(t('cart.cartCleared'))
    }
  }
}

const handleCheckout = () => {
  const toast = inject('toast', null)
  if (cart.length === 0) {
    if (toast) {
      toast.error(t('cart.empty'))
    } else {
      alert(t('cart.empty'))
    }
    return
  }

  const customerInfo = {}

  sendOrderToWhatsApp(whatsappPhone, cart, cartTotal, customerInfo)
  if (toast) {
    toast.success(t('messages.orderPlaced'))
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  padding: 3rem 0 5rem;
  min-height: 60vh;

  @media (max-width: 768px) {
    padding-bottom: 6rem; // Reservar espacio para la barra de navegación inferior
  }
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.empty-cart {
  text-align: center;
  padding: 6rem 2rem;

  .empty-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    animation: float 3s ease-in-out infinite;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.cart-content {
  margin-top: 2rem;
}

.cart-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 400px;
  }
}

.cart-items-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.clear-cart-btn {
  padding: 0.5rem 1rem;
  background: #fee;
  color: #e74c3c;
  border: 1px solid #fcc;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition-smooth);
  cursor: pointer;

  &:hover {
    background: #fdd;
    border-color: #e74c3c;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--accent-color);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  transition: var(--transition-smooth);

  &:hover {
    background: #ffffff;
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--primary-light);
  }

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 80px 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}

.item-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--accent-color);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary-gradient);
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: var(--shadow-pink);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.item-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.item-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.spec-tag {
  padding: 0.25rem 0.75rem;
  background: var(--accent-color);
  border-radius: 12px;
  font-size: 0.8rem;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
}

.item-pricing {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.price-row,
.quantity-row,
.subtotal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.price-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.price-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-price {
  font-size: 1.1rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.item-original-price {
  font-size: 0.9rem;
  color: var(--text-light);
  text-decoration: line-through;
}

.item-quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--accent-color);
  border-radius: 10px;
  padding: 0.5rem;
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

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }

  &:hover:not(:disabled) {
    background: var(--primary-light);
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
  min-width: 30px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.subtotal-row {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.subtotal-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.item-subtotal {
  font-size: 1.3rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.item-savings {
  font-size: 0.85rem;
  color: #4ade80;
  font-weight: 600;
}

.remove-btn {
  padding: 0.75rem;
  color: var(--text-secondary);
  border-radius: 12px;
  transition: var(--transition-smooth);
  align-self: flex-start;
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background: #fee;
    color: #e74c3c;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    justify-self: flex-end;
  }
}

.cart-summary-section {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.summary-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.summary-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
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
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--accent-color);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 2px solid var(--primary-light);
}

.total-label {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

.total-amount {
  font-size: 2rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-checkout {
  width: 100%;
  padding: 1.25rem;
  background: #25D366;
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-md);
  border: none;
  cursor: pointer;
  margin-bottom: 1.5rem;
  min-height: 52px;

  @media (max-width: 768px) {
    padding: 1.5rem;
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

.checkout-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;

  .feature-icon {
    font-size: 1.2rem;
  }
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  transition: var(--transition-smooth);
  display: inline-block;
  text-decoration: none;

  &.btn-primary {
    background: rgba(255, 255, 255, 0.95);
    color: var(--primary-color);

    &:hover {
      background: #fff;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }
}
</style>

