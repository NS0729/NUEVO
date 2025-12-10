/**
 * 认证和会话管理工具
 */

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'
const TOKEN_EXPIRY_KEY = 'admin_token_expiry'
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2小时

/**
 * 保存认证信息
 * @param {string} token - 认证token
 * @param {string} username - 用户名
 */
export function saveAuth(token, username) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, username)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + SESSION_TIMEOUT))
}

/**
 * 获取认证token
 * @returns {string|null} token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 获取当前用户
 * @returns {string|null} 用户名
 */
export function getCurrentUser() {
  return localStorage.getItem(USER_KEY)
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated() {
  const token = getToken()
  if (!token) return false

  // 检查token是否过期
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (expiry && Date.now() > Number(expiry)) {
    clearAuth()
    return false
  }

  return true
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * 刷新token过期时间
 */
export function refreshToken() {
  if (isAuthenticated()) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + SESSION_TIMEOUT))
  }
}

/**
 * 检查token是否即将过期（30分钟内）
 * @returns {boolean} 是否即将过期
 */
export function isTokenExpiringSoon() {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) return true
  
  const timeUntilExpiry = Number(expiry) - Date.now()
  return timeUntilExpiry < 30 * 60 * 1000 // 30分钟
}

/**
 * 获取剩余会话时间（分钟）
 * @returns {number} 剩余分钟数
 */
export function getRemainingSessionTime() {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) return 0
  
  const timeUntilExpiry = Number(expiry) - Date.now()
  return Math.max(0, Math.floor(timeUntilExpiry / 60000))
}

