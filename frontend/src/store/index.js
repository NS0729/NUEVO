import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { productsAPI, categoriesAPI } from '../api'

export const useJewelryStore = defineStore('jewelry', () => {
  // Inicializar como array vacío, cargar desde API
  const products = ref([])
  const isLoading = ref(false)
  const loadError = ref(null)

  // Datos de categorías, también cargados desde API
  // Nota: Los nombres de categorías ahora se obtienen de i18n, aquí solo se mantienen ID e icono
  const categories = ref([
    { id: 'rings', name: 'Anillos', icon: '💍' },
    { id: 'necklaces', name: 'Collares', icon: '📿' },
    { id: 'earrings', name: 'Aretes', icon: '👂' },
    { id: 'bracelets', name: 'Pulseras', icon: '💎' }
  ])

  // Cargar productos desde API
  const loadProducts = async () => {
    isLoading.value = true
    loadError.value = null
    try {
      console.log('🔄 Store: Iniciando carga de productos desde API...')
      const response = await productsAPI.getAll()
      console.log('📦 Store: Respuesta de API recibida:', response)
      const productsList = response.products || []
      products.value = Array.isArray(productsList) ? productsList : []
      console.log('✅ Store: Lista de productos cargada', products.value.length, 'productos')
      console.log('📊 Store: Productos destacados:', products.value.filter(p => p.featured).length)
      if (products.value.length > 0) {
        console.log('🔍 Store: Primer producto:', products.value[0])
        console.log('⭐ Store: Featured del primer producto:', products.value[0].featured, typeof products.value[0].featured)
      }
    } catch (error) {
      console.error('❌ Store: Error al cargar productos:', error)
      console.error('❌ Store: Detalles del error:', {
        message: error.message,
        stack: error.stack,
        details: error.details
      })
      loadError.value = error.message || 'Error al cargar productos'
      // Si la API falla, mantener array vacío
      products.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Cargar categorías desde API
  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      const categoriesList = response.categories || []
      if (Array.isArray(categoriesList) && categoriesList.length > 0) {
        categories.value = categoriesList
      }
      console.log('✅ Store: Lista de categorías cargada', categories.value.length, 'categorías')
    } catch (error) {
      console.error('❌ Store: Error al cargar categorías:', error)
      // Si la API falla, usar categorías por defecto
    }
  }

  // Inicializar y cargar datos
  const initialize = async () => {
    await Promise.all([
      loadProducts(),
      loadCategories()
    ])
  }

  const cart = ref([])
  const searchQuery = ref('')

  const featuredProducts = computed(() => {
    const featured = products.value.filter(p => {
      // Manejar diferentes tipos de valores para featured (boolean, string, number)
      const featuredValue = p.featured
      if (featuredValue === true || featuredValue === 1 || featuredValue === '1' || featuredValue === 'true') {
        return true
      }
      return false
    })
    
    console.log('⭐ Store: FeaturedProducts calculado:', {
      totalProducts: products.value.length,
      featuredCount: featured.length,
      featuredIds: featured.map(p => p.id)
    })
    
    // Si no hay productos destacados, mostrar todos los productos (máximo 12)
    // Esto asegura que siempre haya productos visibles en la página principal
    if (featured.length === 0 && products.value.length > 0) {
      console.log('⚠️ Store: No hay productos destacados, mostrando todos los productos')
      return products.value.slice(0, 12)
    }
    
    // Si hay productos destacados pero son menos de 3, agregar productos adicionales hasta tener al menos 3
    if (featured.length > 0 && featured.length < 3 && products.value.length > featured.length) {
      const additional = products.value
        .filter(p => !featured.find(fp => fp.id === p.id))
        .slice(0, 3 - featured.length)
      console.log('📦 Store: Agregando productos adicionales para tener al menos 3:', additional.length)
      return [...featured, ...additional]
    }
    
    return featured
  })

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

