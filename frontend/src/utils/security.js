/**
 * 安全工具函数
 */

/**
 * 转义HTML，防止XSS攻击
 * @param {string} str - 要转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
  if (!str) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(str).replace(/[&<>"']/g, m => map[m])
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} {valid: boolean, strength: string, message: string}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, strength: 'weak', message: '密码不能为空' }
  }

  if (password.length < 6) {
    return { valid: false, strength: 'weak', message: '密码长度至少6位' }
  }

  if (password.length < 8) {
    return { valid: true, strength: 'weak', message: '密码强度：弱' }
  }

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const strengthCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

  if (strengthCount < 2) {
    return { valid: true, strength: 'weak', message: '密码强度：弱' }
  } else if (strengthCount < 3) {
    return { valid: true, strength: 'medium', message: '密码强度：中' }
  } else {
    return { valid: true, strength: 'strong', message: '密码强度：强' }
  }
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateUsername(username) {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }

  if (username.length < 3) {
    return { valid: false, message: '用户名长度至少3位' }
  }

  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20位' }
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }

  return { valid: true, message: '' }
}

/**
 * 生成安全的随机token
 * @param {number} length - token长度
 * @returns {string} 随机token
 */
export function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length]
  }
  
  return token
}

/**
 * 简单的密码哈希（实际生产环境应使用bcrypt等）
 * @param {string} password - 密码
 * @returns {string} 哈希后的密码
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * 验证输入是否包含SQL注入特征
 * @param {string} input - 输入字符串
 * @returns {boolean} 是否安全
 */
export function isSqlInjectionSafe(input) {
  if (!input) return true
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|#|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b).*?=.*?/gi,
    /(\bUNION\b).*?(\bSELECT\b)/gi
  ]
  
  return !sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * 清理用户输入
 * @param {string} input - 用户输入
 * @returns {string} 清理后的字符串
 */
export function sanitizeInput(input) {
  if (!input) return ''
  
  // 移除HTML标签
  let cleaned = String(input).replace(/<[^>]*>/g, '')
  
  // 移除危险字符
  cleaned = cleaned.replace(/[<>'"&]/g, '')
  
  // 移除多余空格
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * 限制输入长度
 * @param {string} input - 输入字符串
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的字符串
 */
export function limitLength(input, maxLength = 255) {
  if (!input) return ''
  return String(input).substring(0, maxLength)
}

/**
 * 验证数字范围
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean} 是否在范围内
 */
export function isInRange(value, min, max) {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * 验证URL格式
 * @param {string} url - URL字符串
 * @returns {boolean} 是否有效
 */
export function isValidUrl(url) {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 生成CSRF token
 * @returns {string} CSRF token
 */
export function generateCsrfToken() {
  return generateToken(32)
}

/**
 * 验证CSRF token
 * @param {string} token - 要验证的token
 * @param {string} storedToken - 存储的token
 * @returns {boolean} 是否有效
 */
export function verifyCsrfToken(token, storedToken) {
  if (!token || !storedToken) return false
  return token === storedToken
}

