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

  // 调试：记录请求信息
  if (options.headers?.Authorization) {
    console.log('🔐 API请求 - 包含Authorization头:', endpoint)
  } else {
    console.log('📡 API请求 - 无Authorization头:', endpoint)
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
      // 如果是401未授权，清除本地token并提示重新登录
      if (response.status === 401) {
        console.warn('⚠️ 401未授权 - 清除token并提示重新登录')
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_token_expiry')
        // 如果不在登录页面，跳转到登录页
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login'
        }
      }
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('❌ API请求错误:', error)
    console.error('请求URL:', url)
    console.error('请求配置:', {
      method: config.method || 'GET',
      hasAuth: !!config.headers?.Authorization,
      body: config.body ? '有body' : '无body'
    })
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
    const token = localStorage.getItem('admin_token')
    console.log('🔑 创建商品 - Token检查:', token ? `存在 (${token.substring(0, 20)}...)` : '不存在')
    
    if (!token) {
      console.error('❌ 未找到token，请先登录')
      throw new Error('未登录，请先登录')
    }
    
    return request('/api/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    })
  },

  // 更新商品（管理员）
  update: async (id, productData) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登录')
    }
    return request(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    })
  },

  // 删除商品（管理员）
  delete: async (id) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登录')
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

  // 获取所有订单（管理员）
  getAll: async (params = {}) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登录')
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

  // 更新订单状态（管理员）
  updateStatus: async (id, status) => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登录')
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
 * 管理员认证 API
 */
export const adminAuthAPI = {
  // 登录
  login: async (username, password) => {
    return request('/api/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    })
  },

  // 登出
  logout: async () => {
    const token = localStorage.getItem('admin_token')
    return request('/api/admin/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
  },

  // 验证token
  verify: async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登录')
    }
    return request('/api/admin/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

/**
 * 管理员统计 API
 */
export const adminStatsAPI = {
  // 获取统计数据
  getStats: async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登录')
    }
    return request('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

/**
 * 健康检查
 */
export const healthCheck = async () => {
  return request('/api/health')
}

// 导出别名以保持兼容性
export const adminAuth = adminAuthAPI

export default {
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  adminAuth: adminAuthAPI,
  adminStats: adminStatsAPI,
  healthCheck,
}

