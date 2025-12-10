/**
 * 价格格式化工具
 * 统一处理所有价格显示格式
 */

/**
 * 格式化价格为美元格式
 * @param {number} price - 价格数值
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0.00'
  }
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

/**
 * 格式化价格为美元格式（带小数）
 * @param {number} price - 价格数值
 * @returns {string} 格式化后的价格字符串
 */
export const formatPriceWithDecimals = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0.00'
  }
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

