/**
 * WhatsApp订单发送工具
 */
import { formatPrice } from './priceFormatter'

/**
 * 格式化订单消息
 * @param {Array} cartItems - 购物车商品列表
 * @param {number} total - 订单总价
 * @param {Object} customerInfo - 客户信息（可选）
 * @returns {string} 格式化的订单消息
 */
export function formatOrderMessage(cartItems, total, customerInfo = {}) {
  const lines = []
  
  // 订单标题
  lines.push('🛍️ *新订单*')
  lines.push('━━━━━━━━━━━━━━━━')
  lines.push('')
  
  // 客户信息（如果有）
  if (customerInfo.name || customerInfo.phone || customerInfo.address) {
    lines.push('👤 *客户信息*')
    if (customerInfo.name) lines.push(`姓名：${customerInfo.name}`)
    if (customerInfo.phone) lines.push(`电话：${customerInfo.phone}`)
    if (customerInfo.address) lines.push(`地址：${customerInfo.address}`)
    lines.push('')
  }
  
  // 订单详情
  lines.push('📦 *订单详情*')
  lines.push('')
  
  cartItems.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`)
    lines.push(`   材质：${item.material}`)
    lines.push(`   主石：${item.stone}`)
    lines.push(`   尺寸：${item.size}`)
    lines.push(`   单价：${formatPrice(item.price)}`)
    lines.push(`   数量：${item.quantity}`)
    lines.push(`   小计：${formatPrice(item.price * item.quantity)}`)
    lines.push('')
  })
  
  // 订单总计
  lines.push('━━━━━━━━━━━━━━━━')
  lines.push(`💰 *订单总额：${formatPrice(total)}*`)
  lines.push('')
  
  // 订单时间
  const now = new Date()
  const orderTime = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  lines.push(`📅 下单时间：${orderTime}`)
  lines.push('')
  lines.push('感谢您的订购！我们会尽快与您联系。')
  
  return lines.join('\n')
}

/**
 * 发送订单到WhatsApp
 * @param {string} phoneNumber - WhatsApp电话号码（格式：国家代码+号码，如：8613800138000）
 * @param {Array} cartItems - 购物车商品列表
 * @param {number} total - 订单总价
 * @param {Object} customerInfo - 客户信息（可选）
 */
export function sendOrderToWhatsApp(phoneNumber, cartItems, total, customerInfo = {}) {
  if (!phoneNumber) {
    alert('请先设置WhatsApp电话号码')
    return
  }
  
  if (!cartItems || cartItems.length === 0) {
    alert('购物车为空，请先添加商品')
    return
  }
  
  // 格式化订单消息
  const message = formatOrderMessage(cartItems, total, customerInfo)
  
  // 编码消息
  const encodedMessage = encodeURIComponent(message)
  
  // 构建WhatsApp URL
  // 格式：https://wa.me/PHONENUMBER?text=MESSAGE
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  
  // 打开WhatsApp
  window.open(whatsappUrl, '_blank')
}

/**
 * 快速下单（单个商品）
 * @param {string} phoneNumber - WhatsApp电话号码
 * @param {Object} product - 商品对象
 * @param {number} quantity - 数量，默认为1
 * @param {Object} customerInfo - 客户信息（可选）
 */
export function quickOrderToWhatsApp(phoneNumber, product, quantity = 1, customerInfo = {}) {
  if (!phoneNumber) {
    alert('请先设置WhatsApp电话号码')
    return
  }
  
  if (!product) {
    alert('商品信息错误')
    return
  }
  
  // 将单个商品转换为购物车格式
  const cartItems = [{
    ...product,
    quantity: quantity
  }]
  
  const total = product.price * quantity
  
  sendOrderToWhatsApp(phoneNumber, cartItems, total, customerInfo)
}

