<template>
  <div class="products-management">
    <div class="management-header">
      <h2>商品管理</h2>
      <button class="btn-add" @click="showAddModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加商品
      </button>
    </div>

    <div class="products-table">
      <div v-if="products.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p class="empty-text">暂无商品</p>
        <p class="empty-hint">点击"添加商品"按钮开始添加商品</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>原价</th>
            <th>库存</th>
            <th>精选</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>
              <div class="product-info">
                <img :src="product.image" :alt="product.name" class="product-thumb" />
                <span>{{ product.name }}</span>
              </div>
            </td>
            <td>{{ getCategoryName(product.category) }}</td>
            <td class="price">${{ formatPrice(product.price) }}</td>
            <td class="price" v-if="product.originalPrice">
              <span class="original">${{ formatPrice(product.originalPrice) }}</span>
            </td>
            <td v-else>-</td>
            <td>
              <span :class="['stock-badge', product.inStock ? 'in-stock' : 'out-stock']">
                {{ product.inStock ? '有货' : '缺货' }}
              </span>
            </td>
            <td>
              <span :class="['featured-badge', product.featured ? 'yes' : 'no']">
                {{ product.featured ? '是' : '否' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" @click="editProduct(product)">编辑</button>
                <button class="btn-delete" @click="deleteProduct(product.id)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑商品模态框 -->
    <ProductModal
      v-if="showAddModal || editingProduct"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productsAPI } from '../../api'
import { formatPrice } from '../../utils/priceFormatter'
import ProductModal from './ProductModal.vue'
import { useToast } from '../../composables/useToast'

const products = ref([])
const showAddModal = ref(false)
const editingProduct = ref(null)
const toast = useToast()

const categories = [
  { id: 'rings', name: '戒指' },
  { id: 'necklaces', name: '项链' },
  { id: 'earrings', name: '耳环' },
  { id: 'bracelets', name: '手镯' },
]

const getCategoryName = (categoryId) => {
  return categories.find(c => c.id === categoryId)?.name || categoryId
}

const loadProducts = async () => {
  try {
    const response = await productsAPI.getAll()
    // 确保products是数组
    const productsList = response.products || []
    products.value = Array.isArray(productsList) ? productsList : []
    console.log('✅ 商品列表已加载:', products.value.length, '个商品')
  } catch (error) {
    console.error('❌ 加载商品失败:', error)
    toast.error('加载商品失败: ' + (error.message || '未知错误'))
    // 如果 API 失败，使用空数组
    products.value = []
  }
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
  showAddModal.value = true
}

const deleteProduct = async (id) => {
  if (!confirm('确定要删除这个商品吗？')) return
  
  try {
    await productsAPI.delete(id)
    toast.success('商品已删除')
    // 重新加载商品列表
    await loadProducts()
  } catch (error) {
    console.error('删除商品失败:', error)
    toast.error('删除失败: ' + (error.message || '未知错误'))
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingProduct.value = null
}

const handleSave = async (productData) => {
  try {
    // 验证必填字段
    if (!productData.name || !productData.name.trim()) {
      toast.error('请输入商品名称')
      return
    }
    if (!productData.category) {
      toast.error('请选择商品分类')
      return
    }
    if (!productData.price || productData.price <= 0) {
      toast.error('请输入有效的商品价格')
      return
    }
    if (!productData.image) {
      toast.error('请选择商品图片')
      return
    }

    console.log('💾 开始保存商品:', productData.name)
    console.log('📦 商品数据:', {
      name: productData.name,
      category: productData.category,
      price: productData.price,
      hasImage: !!productData.image,
      imageLength: productData.image?.length || 0
    })

    // 确保价格是数字
    const productDataToSend = {
      ...productData,
      price: Number(productData.price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      inStock: Boolean(productData.inStock),
      featured: Boolean(productData.featured)
    }

    if (editingProduct.value) {
      // 更新商品
      console.log('📝 更新商品 ID:', editingProduct.value.id)
      const response = await productsAPI.update(editingProduct.value.id, productDataToSend)
      console.log('✅ 更新商品响应:', response)
      toast.success('商品已更新')
    } else {
      // 添加新商品
      console.log('➕ 创建新商品')
      const response = await productsAPI.create(productDataToSend)
      console.log('✅ 创建商品响应:', response)
      if (!response || !response.id) {
        throw new Error('创建商品失败：未返回商品ID')
      }
      toast.success('商品已添加')
    }
    
    // 关闭模态框
    closeModal()
    
    // 重新加载商品列表，确保数据与数据库一致
    console.log('🔄 重新加载商品列表...')
    await loadProducts()
    console.log('✅ 商品列表已刷新')
  } catch (error) {
    console.error('❌ 保存商品失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    const errorMessage = error.message || '未知错误'
    toast.error('保存失败: ' + errorMessage)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style lang="scss" scoped>
.products-management {
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

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.products-table {
  overflow-x: auto;
  min-height: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

thead {
  background: var(--accent-color);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.price {
  font-weight: 600;
  color: var(--text-primary);

  .original {
    color: var(--text-light);
    text-decoration: line-through;
    font-weight: 400;
  }
}

.stock-badge,
.featured-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.stock-badge.in-stock {
  background: #d4edda;
  color: #155724;
}

.stock-badge.out-stock {
  background: #f8d7da;
  color: #721c24;
}

.featured-badge.yes {
  background: #fff3cd;
  color: #856404;
}

.featured-badge.no {
  background: var(--accent-color);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;

  &:hover {
    background: #bbdefb;
  }
}

.btn-delete {
  background: #ffebee;
  color: #c62828;

  &:hover {
    background: #ffcdd2;
  }
}
</style>

