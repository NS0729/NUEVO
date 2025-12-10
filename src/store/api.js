/**
 * Store API 集成
 * 将 Pinia store 与后端 API 集成
 */
import { productsAPI, categoriesAPI, ordersAPI } from '../api'

export const apiStore = {
  // 获取所有商品
  async fetchProducts(params = {}) {
    try {
      const response = await productsAPI.getAll(params)
      return response.products || []
    } catch (error) {
      console.error('获取商品失败:', error)
      return []
    }
  },

  // 获取单个商品
  async fetchProduct(id) {
    try {
      const response = await productsAPI.getById(id)
      return response.product || null
    } catch (error) {
      console.error('获取商品失败:', error)
      return null
    }
  },

  // 获取所有分类
  async fetchCategories() {
    try {
      const response = await categoriesAPI.getAll()
      return response.categories || []
    } catch (error) {
      console.error('获取分类失败:', error)
      return []
    }
  },

  // 创建订单
  async createOrder(orderData) {
    try {
      const response = await ordersAPI.create(orderData)
      return response
    } catch (error) {
      console.error('创建订单失败:', error)
      throw error
    }
  },
}

