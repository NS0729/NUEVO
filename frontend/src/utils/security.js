/**
 * Funciones de utilidad de seguridad
 */

/**
 * Escapar HTML, prevenir ataques XSS
 * @param {string} str - Cadena a escapar
 * @returns {string} Cadena escapada
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
 * Validar formato de correo electrónico
 * @param {string} email - Dirección de correo electrónico
 * @returns {boolean} Si es válido
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validar fortaleza de contraseña
 * @param {string} password - Contraseña
 * @returns {Object} {valid: boolean, strength: string, message: string}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, strength: 'weak', message: 'La contraseña no puede estar vacía' }
  }

  if (password.length < 6) {
    return { valid: false, strength: 'weak', message: 'La contraseña debe tener al menos 6 caracteres' }
  }

  if (password.length < 8) {
    return { valid: true, strength: 'weak', message: 'Fortaleza de contraseña: Débil' }
  }

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const strengthCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

  if (strengthCount < 2) {
    return { valid: true, strength: 'weak', message: 'Fortaleza de contraseña: Débil' }
  } else if (strengthCount < 3) {
    return { valid: true, strength: 'medium', message: 'Fortaleza de contraseña: Media' }
  } else {
    return { valid: true, strength: 'strong', message: 'Fortaleza de contraseña: Fuerte' }
  }
}

/**
 * Validar formato de nombre de usuario
 * @param {string} username - Nombre de usuario
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateUsername(username) {
  if (!username) {
    return { valid: false, message: 'El nombre de usuario no puede estar vacío' }
  }

  if (username.length < 3) {
    return { valid: false, message: 'El nombre de usuario debe tener al menos 3 caracteres' }
  }

  if (username.length > 20) {
    return { valid: false, message: 'El nombre de usuario no puede tener más de 20 caracteres' }
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' }
  }

  return { valid: true, message: '' }
}

/**
 * Generar token aleatorio seguro
 * @param {number} length - Longitud del token
 * @returns {string} Token aleatorio
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
 * Hash simple de contraseña (en producción se debe usar bcrypt u otros)
 * @param {string} password - Contraseña
 * @returns {string} Contraseña hasheada
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
 * Verificar si la entrada contiene características de inyección SQL
 * @param {string} input - Cadena de entrada
 * @returns {boolean} Si es seguro
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
 * Limpiar entrada del usuario
 * @param {string} input - Entrada del usuario
 * @returns {string} Cadena limpiada
 */
export function sanitizeInput(input) {
  if (!input) return ''
  
  // Eliminar etiquetas HTML
  let cleaned = String(input).replace(/<[^>]*>/g, '')
  
  // Eliminar caracteres peligrosos
  cleaned = cleaned.replace(/[<>'"&]/g, '')
  
  // Eliminar espacios en blanco adicionales
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Limitar longitud de entrada
 * @param {string} input - Cadena de entrada
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Cadena truncada
 */
export function limitLength(input, maxLength = 255) {
  if (!input) return ''
  return String(input).substring(0, maxLength)
}

/**
 * Validar rango numérico
 * @param {number} value - Valor numérico
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} Si está en el rango
 */
export function isInRange(value, min, max) {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * Validar formato de URL
 * @param {string} url - Cadena de URL
 * @returns {boolean} Si es válido
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
 * Generar token CSRF
 * @returns {string} Token CSRF
 */
export function generateCsrfToken() {
  return generateToken(32)
}

/**
 * Verificar token CSRF
 * @param {string} token - Token a verificar
 * @param {string} storedToken - Token almacenado
 * @returns {boolean} Si es válido
 */
export function verifyCsrfToken(token, storedToken) {
  if (!token || !storedToken) return false
  return token === storedToken
}

