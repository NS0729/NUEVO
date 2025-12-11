/**
 * Integración de Store API
 * Integrar Pinia store con la API del backend
 */
import { productsAPI, categoriesAPI, ordersAPI } from '../api'

export const apiStore = {
  // Obtener todos los productos
  async fetchProducts(params = {}) {
    try {
      const response = await productsAPI.getAll(params)
      return response.products || []
    } catch (error) {
      console.error('Error al obtener productos:', error)
      return []
    }
  },

  // Obtener un solo producto
  async fetchProduct(id) {
    try {
      const response = await productsAPI.getById(id)
      return response.product || null
    } catch (error) {
      console.error('Error al obtener producto:', error)
      return null
    }
  },

  // Obtener todas las categorías
  async fetchCategories() {
    try {
      const response = await categoriesAPI.getAll()
      return response.categories || []
    } catch (error) {
      console.error('Error al obtener categorías:', error)
      return []
    }
  },

  // Crear pedido
  async createOrder(orderData) {
    try {
      const response = await ordersAPI.create(orderData)
      return response
    } catch (error) {
      console.error('Error al crear pedido:', error)
      throw error
    }
  },
}

