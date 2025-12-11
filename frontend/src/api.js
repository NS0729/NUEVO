/**
 * Cliente API
 * Para la comunicación del frontend con la API de Cloudflare Workers
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

/**
 * Función de solicitud genérica
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  // Depuración: registrar información de la solicitud
  console.log('📡 API: Realizando solicitud a:', url)
  if (options.headers?.Authorization) {
    console.log('🔐 API: Solicitud con encabezado Authorization:', endpoint)
  } else {
    console.log('📡 API: Solicitud sin encabezado Authorization:', endpoint)
  }

  try {
    const response = await fetch(url, config)
    
    // Verificar tipo de respuesta
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text || `HTTP ${response.status}: ${response.statusText}`)
      }
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Solicitud fallida (${response.status})`
      console.error('❌ API: Error en respuesta:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        data: data
      })
      // Si es 401 no autorizado, limpiar el token local y pedir iniciar sesión de nuevo
      if (response.status === 401) {
        console.warn('⚠️ 401 No autorizado - Limpiando token y solicitando iniciar sesión de nuevo')
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_token_expiry')
        // Si no estamos en la página de inicio de sesión, redirigir a la página de inicio de sesión
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login'
        }
      }
      throw new Error(errorMessage)
    }

    console.log('✅ API: Respuesta exitosa:', {
      endpoint: endpoint,
      dataKeys: Object.keys(data),
      hasProducts: !!data.products,
      productsCount: data.products?.length || 0
    })
    return data
  } catch (error) {
    console.error('❌ API: Error en solicitud:', error)
    console.error('URL de solicitud:', url)
    console.error('Configuración de solicitud:', {
      method: config.method || 'GET',
      hasAuth: !!config.headers?.Authorization,
      body: config.body ? 'con body' : 'sin body'
    })
    
    // Si es un error de red, proporcionar un mensaje de error más amigable
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const friendlyError = new Error('No se pudo conectar al servidor, por favor verifique que el servicio backend esté funcionando')
      friendlyError.details = {
        apiUrl: API_BASE_URL,
        endpoint: endpoint,
        suggestion: 'Por favor, asegúrese de que el servicio backend esté funcionando: cd backend && npm run dev'
      }
      throw friendlyError
    }
    
    // Si la conexión fue rechazada
    if (error.message && error.message.includes('ECONNREFUSED')) {
      const friendlyError = new Error('No se pudo conectar al servidor API')
      friendlyError.details = {
        apiUrl: API_BASE_URL,
        endpoint: endpoint,
        suggestion: 'Por favor, verifique que el servicio backend esté funcionando en el puerto 8787'
      }
      throw friendlyError
    }
    
    throw error
  }
}

/**
 * API de productos
 */
export const productsAPI = {
  // Obtener todos los productos
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.category) queryParams.append('category', params.category)
    if (params.featured) queryParams.append('featured', params.featured)
    if (params.search) queryParams.append('search', params.search)

    const query = queryParams.toString()
    return request(`/api/products${query ? `?${query}` : ''}`)
  },

  // Obtener un solo producto
  getById: async (id) => {
    return request(`/api/products/${id}`)
  },

  // Crear producto (administrador)
  create: async (productData) => {
    const token = localStorage.getItem('admin_token')
    console.log('🔑 Crear producto - Verificación de token:', token ? `existe (${token.substring(0, 20)}...)` : 'no existe')
    
    if (!token) {
      console.error('❌ Token no encontrado, por favor inicie sesión primero')
      throw new Error('No ha iniciado sesión, por favor inicie sesión primero')
    }
    
    return request('/api/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    })
  },

  // Actualizar producto (administrador)
  update: async (id, productData) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('No ha iniciado sesión')
    }
    return request(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    })
  },

  // Eliminar producto (administrador)
  delete: async (id) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('No ha iniciado sesión')
    }
    return request(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

/**
 * API de categorías
 */
export const categoriesAPI = {
  // Obtener todas las categorías
  getAll: async () => {
    return request('/api/categories')
  },
}

/**
 * API de pedidos
 */
export const ordersAPI = {
  // Crear pedido
  create: async (orderData) => {
    return request('/api/orders', {
      method: 'POST',
      body: orderData,
    })
  },

  // Obtener detalles del pedido
  getById: async (id) => {
    return request(`/api/orders/${id}`)
  },

  // Obtener todos los pedidos (administrador)
  getAll: async (params = {}) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('No ha iniciado sesión')
    }

    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.offset) queryParams.append('offset', params.offset)

    const query = queryParams.toString()
    return request(`/api/orders${query ? `?${query}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Actualizar estado del pedido (administrador)
  updateStatus: async (id, status) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('No ha iniciado sesión')
    }
    return request(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { status },
    })
  },
}

/**
 * API de autenticación de administrador
 */
export const adminAuthAPI = {
  // Iniciar sesión
  login: async (username, password) => {
    return request('/api/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    })
  },

  // Cerrar sesión
  logout: async () => {
    const token = localStorage.getItem('admin_token')
    return request('/api/admin/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
  },

  // Verificar token
  verify: async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('No ha iniciado sesión')
    }
    return request('/api/admin/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

/**
 * API de estadísticas de administrador
 */
export const adminStatsAPI = {
  // Obtener datos estadísticos
  getStats: async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('No ha iniciado sesión')
    }
    return request('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

// Asegurar que adminStatsAPI se exporte correctamente (para evitar problemas de optimización de compilación)
if (typeof window !== 'undefined') {
  window.__adminStatsAPI = adminStatsAPI
}

/**
 * Verificación de salud
 */
export const healthCheck = async () => {
  return request('/api/health')
}

/**
 * Verificar estado de conexión de la API
 */
export const checkApiConnection = async () => {
  try {
    const result = await healthCheck()
    return { connected: true, status: 'ok', data: result }
  } catch (error) {
    console.error('Error al verificar la conexión de la API:', error)
    return { 
      connected: false, 
      status: 'error', 
      error: error.message,
      apiUrl: API_BASE_URL
    }
  }
}

/**
 * Obtener URL base de la API (para depuración)
 */
export const getApiBaseUrl = () => {
  return API_BASE_URL
}

// Exportar alias para mantener la compatibilidad
export const adminAuth = adminAuthAPI

export default {
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  adminAuth: adminAuthAPI,
  adminStats: adminStatsAPI,
  healthCheck,
  checkApiConnection,
  getApiBaseUrl,
}

