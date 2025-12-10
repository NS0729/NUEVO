import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { productsAPI, categoriesAPI } from '../api'

export const useJewelryStore = defineStore('jewelry', () => {
  // 初始化为空数组，从API加载
  const products = ref([])
  const isLoading = ref(false)
  const loadError = ref(null)

  // 分类数据，也从API加载
  const categories = ref([
    { id: 'rings', name: '戒指', icon: '💍' },
    { id: 'necklaces', name: '项链', icon: '📿' },
    { id: 'earrings', name: '耳环', icon: '👂' },
    { id: 'bracelets', name: '手镯', icon: '💎' }
  ])

  // 从API加载商品
  const loadProducts = async () => {
    isLoading.value = true
    loadError.value = null
    try {
      const response = await productsAPI.getAll()
      const productsList = response.products || []
      products.value = Array.isArray(productsList) ? productsList : []
      console.log('✅ Store: 商品列表已加载', products.value.length, '个商品')
    } catch (error) {
      console.error('❌ Store: 加载商品失败:', error)
      loadError.value = error.message || '加载商品失败'
      // 如果API失败，保持空数组
      products.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 从API加载分类
  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      const categoriesList = response.categories || []
      if (Array.isArray(categoriesList) && categoriesList.length > 0) {
        categories.value = categoriesList
      }
      console.log('✅ Store: 分类列表已加载', categories.value.length, '个分类')
    } catch (error) {
      console.error('❌ Store: 加载分类失败:', error)
      // 如果API失败，使用默认分类
    }
  }

  // 初始化加载数据
  const initialize = async () => {
    await Promise.all([
      loadProducts(),
      loadCategories()
    ])
  }

  const cart = ref([])
  const searchQuery = ref('')

  const featuredProducts = computed(() => 
    products.value.filter(p => p.featured)
  )

  const getProductById = (id) => {
    return products.value.find(p => p.id === parseInt(id))
  }

  const getProductsByCategory = (categoryId) => {
    return products.value.filter(p => p.category === categoryId)
  }

  const searchProducts = (query) => {
    if (!query) return products.value
    const lowerQuery = query.toLowerCase()
    return products.value.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.material.toLowerCase().includes(lowerQuery)
    )
  }

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({ ...product, quantity: quantity })
    }
  }

  const removeFromCart = (productId) => {
    const index = cart.value.findIndex(item => item.id === productId)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = cart.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  return {
    products,
    categories,
    cart,
    searchQuery,
    isLoading,
    loadError,
    featuredProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    loadProducts,
    loadCategories,
    initialize
  }
})

