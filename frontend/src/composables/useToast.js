/**
 * Toast通知组合式函数
 */
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = ++toastId
    const toast = { id, message, type, duration }
    toasts.value.push(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, duration = 3000) => {
    return addToast(message, 'success', duration)
  }

  const error = (message, duration = 4000) => {
    return addToast(message, 'error', duration)
  }

  const info = (message, duration = 3000) => {
    return addToast(message, 'info', duration)
  }

  const warning = (message, duration = 3000) => {
    return addToast(message, 'warning', duration)
  }

  return {
    toasts,
    success,
    error,
    info,
    warning,
    addToast,
    removeToast
  }
}

