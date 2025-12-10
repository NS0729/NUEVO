/**
 * API 客户端
 * 用于前端与 Cloudflare Workers API 通信
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

/**
 * 通用请求函数
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

  try {
    const response = await fetch(url, config)
    
    // 检查响应类型
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
      const errorMessage = data.error || data.message || `请求失败 (${response.status})`
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('API请求错误:', error)
    // 如果是网络错误，提供更友好的错误信息
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('无法连接到服务器，请检查后端服务是否运行')
    }
    throw error
  }
}

/**
 * 商品 API
 */
export const productsAPI = {
  // 获取所有商品
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.category) queryParams.append('category', params.category)
    if (params.featured) queryParams.append('featured', params.featured)
    if (params.search) queryParams.append('search', params.search)

    const query = queryParams.toString()
    return request(`/api/products${query ? `?${query}` : ''}`)
  },

  // 获取单个商品
  getById: async (id) => {
    return request(`/api/products/${id}`)
  },

  // 创建商品（管理员）
  create: async (productData) => {
    return request('/api/products', {
      method: 'POST',
      body: productData,
    })
  },

  // 更新商品（管理员）
  update: async (id, productData) => {
    return request(`/api/products/${id}`, {
      method: 'PUT',
      body: productData,
    })
  },

  // 删除商品（管理员）
  delete: async (id) => {
    return request(`/api/products/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * 分类 API
 */
export const categoriesAPI = {
  // 获取所有分类
  getAll: async () => {
    return request('/api/categories')
  },
}

/**
 * 订单 API
 */
export const ordersAPI = {
  // 创建订单
  create: async (orderData) => {
    return request('/api/orders', {
      method: 'POST',
      body: orderData,
    })
  },

  // 获取订单详情
  getById: async (id) => {
    return request(`/api/orders/${id}`)
  },
}

/**
 * 健康检查
 */
export const healthCheck = async () => {
  return request('/api/health')
}

export default {
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  healthCheck,
}

