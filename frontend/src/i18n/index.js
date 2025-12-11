/**
 * Sistema de internacionalización
 */
import es from './es.js'

// Mapeo de paquetes de idioma
const locales = {
  es: es,
}

// Idioma actual
let currentLocale = 'es'

/**
 * Obtener texto traducido
 * @param {string} key - Clave de traducción, admite rutas separadas por puntos, como 'home.title'
 * @param {Object} params - Objeto de parámetros para reemplazar marcadores de posición
 * @returns {string} Texto traducido
 */
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = locales[currentLocale]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`[i18n] Translation key not found: ${key}`)
      return key
    }
  }
  
  // Si el valor es una cadena, reemplazar marcadores de posición
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match
    })
  }
  
  return value || key
}

/**
 * Establecer idioma actual
 * @param {string} locale - Código de idioma
 */
export function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale
    // Guardar en localStorage
    localStorage.setItem('app_locale', locale)
    // Actualizar atributo lang de HTML
    document.documentElement.lang = locale
  } else {
    console.warn(`[i18n] Locale not found: ${locale}`)
  }
}

/**
 * Obtener idioma actual
 * @returns {string} Código de idioma actual
 */
export function getLocale() {
  return currentLocale
}

/**
 * Inicializar i18n
 */
export function initI18n() {
  // Leer configuración de idioma guardada desde localStorage
  const savedLocale = localStorage.getItem('app_locale')
  if (savedLocale && locales[savedLocale]) {
    setLocale(savedLocale)
  } else {
    // Usar español por defecto
    setLocale('es')
  }
}

/**
 * Crear composable i18n
 */
export function useI18n() {
  return {
    t,
    locale: currentLocale,
    setLocale,
    getLocale,
  }
}

// Exportación por defecto
export default {
  t,
  setLocale,
  getLocale,
  initI18n,
  useI18n,
}

