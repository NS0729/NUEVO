<template>
  <div class="orders-management">
    <div class="management-header">
      <h2>订单管理</h2>
      <div class="filter-group">
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="confirmed">已确认</option>
          <option value="shipped">已发货</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
    </div>

    <div class="orders-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>暂无订单</p>
      </div>

      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单 #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-status">
            <select
              :value="order.status"
              @change="updateOrderStatus(order.id, $event.target.value)"
              class="status-select"
            >
              <option value="pending">待处理</option>
              <option value="confirmed">已确认</option>
              <option value="shipped">已发货</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        <div class="order-customer">
          <div class="customer-info">
            <span><strong>客户:</strong> {{ order.customerName || '未填写' }}</span>
            <span><strong>电话:</strong> {{ order.customerPhone || '未填写' }}</span>
            <span><strong>地址:</strong> {{ order.customerAddress || '未填写' }}</span>
          </div>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-item"
          >
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
            <span class="item-price">${{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <strong>订单总额: ${{ formatPrice(order.total) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ordersAPI } from '../../api'
import { formatPrice } from '../../utils/priceFormatter'

const orders = ref([])
const statusFilter = ref('')

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter(order => order.status === statusFilter.value)
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const loadOrders = async () => {
  try {
    // 这里应该调用 API 获取订单列表
    // 暂时使用空数组
    orders.value = []
  } catch (error) {
    console.error('加载订单失败:', error)
    orders.value = []
  }
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // 这里应该调用 API 更新订单状态
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = newStatus
    }
    alert('订单状态已更新')
  } catch (error) {
    console.error('更新订单状态失败:', error)
    alert('更新失败')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-management {
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
  }
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: var(--transition);

  &:focus {
    border-color: #667eea;
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
}

.order-card {
  background: #ffffff;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: var(--transition);

  &:hover {
    border-color: #667eea;
    box-shadow: var(--shadow-sm);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-id {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.order-date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.status-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: var(--transition);

  &:focus {
    border-color: #667eea;
  }
}

.order-customer {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--accent-color);
  border-radius: 8px;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
    margin-right: 0.5rem;
  }
}

.order-items {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--accent-color);
  border-radius: 8px;
}

.item-name {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.item-quantity {
  color: var(--text-secondary);
  margin: 0 1rem;
}

.item-price {
  font-weight: 600;
  color: var(--text-primary);
}

.order-footer {
  padding-top: 1rem;
  border-top: 2px solid var(--border-color);
  text-align: right;
}

.order-total {
  font-size: 1.2rem;
  color: var(--text-primary);
}
</style>

