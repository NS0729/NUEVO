/**
 * Herramienta de envío de pedidos por WhatsApp
 */
import { formatPrice } from './priceFormatter'

/**
 * Formatear mensaje de pedido
 * @param {Array} cartItems - Lista de productos del carrito
 * @param {number} total - Total del pedido
 * @param {Object} customerInfo - Información del cliente (opcional)
 * @returns {string} Mensaje de pedido formateado
 */
export function formatOrderMessage(cartItems, total, customerInfo = {}) {
  const lines = []
  
  // Título del pedido
  lines.push('🛍️ *Nuevo Pedido*')
  lines.push('━━━━━━━━━━━━━━━━')
  lines.push('')
  
  // Información del cliente (si existe)
  if (customerInfo.name || customerInfo.phone || customerInfo.address) {
    lines.push('👤 *Información del Cliente*')
    if (customerInfo.name) lines.push(`Nombre: ${customerInfo.name}`)
    if (customerInfo.phone) lines.push(`Teléfono: ${customerInfo.phone}`)
    if (customerInfo.address) lines.push(`Dirección: ${customerInfo.address}`)
    lines.push('')
  }
  
  // Detalles del pedido
  lines.push('📦 *Detalles del Pedido*')
  lines.push('')
  
  cartItems.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`)
    lines.push(`   Material: ${item.material || '-'}`)
    lines.push(`   Piedra principal: ${item.stone || '-'}`)
    lines.push(`   Tamaño: ${item.size || '-'}`)
    lines.push(`   Precio unitario: ${formatPrice(item.price)}`)
    lines.push(`   Cantidad: ${item.quantity}`)
    lines.push(`   Subtotal: ${formatPrice(item.price * item.quantity)}`)
    lines.push('')
  })
  
  // Total del pedido
  lines.push('━━━━━━━━━━━━━━━━')
  lines.push(`💰 *Total del Pedido: ${formatPrice(total)}*`)
  lines.push('')
  
  // Hora del pedido
  const now = new Date()
  const orderTime = now.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  lines.push(`📅 Hora del pedido: ${orderTime}`)
  lines.push('')
  lines.push('¡Gracias por su pedido! Nos pondremos en contacto con usted pronto.')
  
  return lines.join('\n')
}

/**
 * Enviar pedido a WhatsApp
 * @param {string} phoneNumber - Número de teléfono de WhatsApp (formato: código de país + número, ej: 8613800138000)
 * @param {Array} cartItems - Lista de productos del carrito
 * @param {number} total - Total del pedido
 * @param {Object} customerInfo - Información del cliente (opcional)
 */
export function sendOrderToWhatsApp(phoneNumber, cartItems, total, customerInfo = {}) {
  if (!phoneNumber) {
    alert('Por favor configure el número de teléfono de WhatsApp primero')
    return
  }
  
  if (!cartItems || cartItems.length === 0) {
    alert('El carrito está vacío, por favor agregue productos primero')
    return
  }
  
  // Formatear mensaje de pedido
  const message = formatOrderMessage(cartItems, total, customerInfo)
  
  // Codificar mensaje
  const encodedMessage = encodeURIComponent(message)
  
  // Construir URL de WhatsApp
  // Formato: https://wa.me/PHONENUMBER?text=MESSAGE
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  
  // Abrir WhatsApp
  window.open(whatsappUrl, '_blank')
}

/**
 * Pedido rápido (producto individual)
 * @param {string} phoneNumber - Número de teléfono de WhatsApp
 * @param {Object} product - Objeto de producto
 * @param {number} quantity - Cantidad, por defecto 1
 * @param {Object} customerInfo - Información del cliente (opcional)
 */
export function quickOrderToWhatsApp(phoneNumber, product, quantity = 1, customerInfo = {}) {
  if (!phoneNumber) {
    alert('Por favor configure el número de teléfono de WhatsApp primero')
    return
  }
  
  if (!product) {
    alert('Información del producto incorrecta')
    return
  }
  
  // Convertir producto individual a formato de carrito
  const cartItems = [{
    ...product,
    quantity: quantity
  }]
  
  const total = product.price * quantity
  
  sendOrderToWhatsApp(phoneNumber, cartItems, total, customerInfo)
}

