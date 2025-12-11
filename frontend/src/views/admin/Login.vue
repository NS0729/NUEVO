<template>
  <div class="admin-login">
    <div class="login-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-container">
            <div class="logo-icon">💎</div>
          </div>
          <h1 class="login-title">{{ t('admin.login.title') }}</h1>
          <p class="login-subtitle">{{ t('admin.login.title') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">
              {{ t('admin.login.username') }}
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                :placeholder="t('admin.login.username')"
                required
                autocomplete="username"
                :class="['form-input', { 'error': errors.username }]"
                @blur="validateUsername"
                @input="clearError('username')"
              />
            </div>
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="password">
              {{ t('admin.login.password') }}
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('admin.login.password')"
                required
                autocomplete="current-password"
                :class="['form-input', { 'error': errors.password }]"
                @blur="validatePassword"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            <div v-if="passwordStrength.valid && formData.password" class="password-strength">
              <div class="strength-bar">
                <div
                  :class="['strength-fill', passwordStrength.strength]"
                  :style="{ width: getStrengthWidth() }"
                ></div>
              </div>
              <span class="strength-text">{{ passwordStrength.message }}</span>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input v-model="rememberMe" type="checkbox" />
              <span>{{ t('admin.login.rememberMe') }}</span>
            </label>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
              {{ t('admin.login.forgotPassword') }}
            </a>
          </div>

          <button type="submit" class="btn-login" :disabled="loading || !isFormValid">
            <span v-if="!loading">
              <span class="btn-icon">🔐</span>
              {{ t('admin.login.login') }}
            </span>
            <span v-else class="loading-content">
              <span class="spinner"></span>
              {{ t('admin.login.loggingIn') }}
            </span>
          </button>
        </form>

        <div class="login-footer">
          <div class="security-info">
            <span class="security-icon">🛡️</span>
            <span>{{ t('admin.login.security') }}</span>
          </div>
          <p class="demo-info">{{ t('admin.login.demoAccount') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { validateUsername as validateUsernameUtil, validatePassword as validatePasswordStrength, sanitizeInput, isSqlInjectionSafe } from '../../utils/security'
import { saveAuth } from '../../utils/auth'
import { useToast } from '../../composables/useToast'
import { useI18n } from '../../i18n'

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const formData = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errors = ref({})
const passwordStrength = ref({ valid: false, strength: 'weak', message: '' })

// Observar cambios en la contraseña, validar intensidad en tiempo real
watch(() => formData.value.password, (newPassword) => {
  if (newPassword) {
    passwordStrength.value = validatePasswordStrength(newPassword)
  } else {
    passwordStrength.value = { valid: false, strength: 'weak', message: '' }
  }
})

const isFormValid = computed(() => {
  return formData.value.username && formData.value.password && 
         !errors.value.username && !errors.value.password
})

const validateUsername = () => {
  const result = validateUsernameUtil(formData.value.username)
  if (!result.valid) {
    errors.value.username = result.message
  } else {
    delete errors.value.username
  }
}

const validatePassword = () => {
  if (!formData.value.password) {
    errors.value.password = t('validation.required')
  } else if (formData.value.password.length < 6) {
    errors.value.password = t('validation.minLength', { min: 6 })
  } else {
    delete errors.value.password
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const getStrengthWidth = () => {
  const strengthMap = { weak: '33%', medium: '66%', strong: '100%' }
  return strengthMap[passwordStrength.value.strength] || '0%'
}

const handleLogin = async () => {
  // Limpiar errores anteriores
  errors.value = {}

  // Validar entrada
  validateUsername()
  validatePassword()

  if (!isFormValid.value) {
    toast.error(t('admin.login.invalidCredentials'))
    return
  }

  // Verificación de seguridad: prevenir inyección SQL
  const username = sanitizeInput(formData.value.username)
  const password = sanitizeInput(formData.value.password)

  if (!isSqlInjectionSafe(username) || !isSqlInjectionSafe(password)) {
    toast.error(t('validation.required'))
    return
  }

  loading.value = true

  try {
    // Llamar a la API para iniciar sesión
    const { adminAuth } = await import('../../api')
    const response = await adminAuth.login(username, password)
    
    // Guardar información de autenticación
    saveAuth(response.token, response.username, response.expiresAt)
    
    toast.success(t('admin.login.loginSuccess'))
    
    setTimeout(() => {
      router.push('/admin/dashboard')
      loading.value = false
    }, 500)
  } catch (error) {
    loading.value = false
    console.error('Error al iniciar sesión:', error)
    const errorMessage = error.message || t('admin.login.loginFailed')
    toast.error(errorMessage)
    errors.value.password = errorMessage
  }
}

const handleForgotPassword = () => {
  toast.info(t('admin.login.forgotPassword'))
}
</script>

<style lang="scss" scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.login-container {
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-container {
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 4rem;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  .required {
    color: #e74c3c;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  transition: var(--transition);
  outline: none;
  background: #fafafa;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: #fff;
  }

  &.error {
    border-color: #e74c3c;
    background: #fff5f5;
  }

  &::placeholder {
    color: var(--text-light);
  }
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  z-index: 1;
  transition: var(--transition);

  &:hover {
    transform: scale(1.1);
  }
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: var(--accent-color);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;

  &.weak {
    background: #e74c3c;
  }

  &.medium {
    background: #f39c12;
  }

  &.strong {
    background: #27ae60;
  }
}

.strength-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  transition: var(--transition);

  &:hover {
    color: #764ba2;
    text-decoration: underline;
  }
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  .btn-icon {
    font-size: 1.2rem;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #27ae60;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  font-weight: 500;

  .security-icon {
    font-size: 1rem;
  }
}

.demo-info {
  color: var(--text-light);
  font-size: 0.85rem;
  padding: 0.75rem;
  background: var(--accent-color);
  border-radius: 8px;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>

