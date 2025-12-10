<template>
  <teleport to="body">
    <transition-group name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else>ℹ</span>
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">×</button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const toasts = ref([])
let toastId = 0

const addToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastId
  const toast = { id, message, type }
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

// 暴露方法供外部调用
defineExpose({
  success: (message, duration) => addToast(message, 'success', duration),
  error: (message, duration) => addToast(message, 'error', duration),
  info: (message, duration) => addToast(message, 'info', duration),
  addToast
})
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none;

  @media (max-width: 768px) {
    right: 10px;
    left: 10px;
    top: 80px;
  }
}

.toast {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border-left: 4px solid var(--primary-color);
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  animation: slideInRight 0.3s ease-out;

  @media (max-width: 768px) {
    min-width: auto;
    max-width: 100%;
  }
}

.toast-success {
  border-left-color: #4ade80;
  
  .toast-icon {
    background: #4ade80;
    color: #fff;
  }
}

.toast-error {
  border-left-color: #e74c3c;
  
  .toast-icon {
    background: #e74c3c;
    color: #fff;
  }
}

.toast-info {
  border-left-color: var(--primary-color);
  
  .toast-icon {
    background: var(--primary-gradient);
    color: #fff;
  }
}

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-message {
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.toast-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  padding: 0;

  &:hover {
    background: var(--accent-color);
    color: var(--text-primary);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>

