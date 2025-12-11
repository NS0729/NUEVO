<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ product ? t('admin.products.edit') : t('admin.products.add') }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="product-form">
        <div class="form-group">
          <label>{{ t('admin.products.name') }} *</label>
          <input v-model="formData.name" type="text" required />
        </div>

        <div class="form-group">
          <label>{{ t('admin.products.price') }} *</label>
          <input v-model.number="formData.price" type="number" step="0.01" required />
        </div>

        <div class="form-group">
          <label>{{ t('admin.products.category') }} *</label>
          <select v-model="formData.category" required>
            <option value="">{{ t('admin.products.selectCategory') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('admin.products.barcode') }}</label>
          <input v-model="formData.barcode" type="text" :placeholder="t('admin.products.enterBarcode')" />
        </div>

        <div class="form-group">
          <label>{{ t('admin.products.image') }} *</label>

          <!-- Selección de archivo local -->
          <div class="file-upload-wrapper">
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
              :required="!formData.image"
            />
            <div class="file-upload-area" @click="$refs.fileInput?.click()">
              <div v-if="!selectedFileName" class="upload-placeholder">
                <span class="upload-icon">📁</span>
                <span>{{ t('admin.products.selectImage') }}</span>
                <span class="upload-hint">{{ t('admin.products.imageHint') }}</span>
              </div>
              <div v-else class="selected-file">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ selectedFileName }}</span>
                <button type="button" class="btn-change-file" @click.stop="$refs.fileInput?.click()">{{ t('common.change') }}</button>
              </div>
            </div>
          </div>
          
          <!-- Progreso de procesamiento -->
          <div v-if="isProcessingImage" class="processing-status">
            <div class="processing-spinner"></div>
            <span>{{ t('admin.products.processing') }}</span>
          </div>

          <!-- Información de resultado del procesamiento -->
          <div v-if="imageProcessInfo && !isProcessingImage" class="image-info">
            <div class="info-row">
              <span class="info-label">{{ t('common.originalDimensions') }}:</span>
              <span>{{ imageProcessInfo.dimensions.originalWidth }} × {{ imageProcessInfo.dimensions.originalHeight }}px</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('common.processedDimensions') }}:</span>
              <span class="success">{{ imageProcessInfo.dimensions.width }} × {{ imageProcessInfo.dimensions.height }}px</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('common.originalSize') }}:</span>
              <span>{{ formatFileSize(imageProcessInfo.originalSize) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('common.processedSize') }}:</span>
              <span class="success">{{ formatFileSize(imageProcessInfo.compressedSize) }}</span>
            </div>
            <div v-if="imageProcessInfo.originalSize > 0" class="info-row">
              <span class="info-label">{{ t('common.compressionRate') }}:</span>
              <span class="success">
                {{ Math.round((1 - imageProcessInfo.compressedSize / imageProcessInfo.originalSize) * 100) }}%
              </span>
            </div>
          </div>

          <!-- Vista previa de imagen -->
          <div v-if="formData.image" class="image-preview-container">
            <img :src="formData.image" :alt="t('common.preview')" class="image-preview" />
            <div class="preview-overlay">
              <button type="button" class="btn-remove-image" @click="removeImage">{{ t('common.remove') }}</button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-cancel">{{ t('common.cancel') }}</button>
          <button type="submit" class="btn-save">{{ t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { processImageFile, formatFileSize } from '../../utils/imageProcessor'
import { useI18n } from '../../i18n'
import { useJewelryStore } from '../../store'
import { categoriesAPI } from '../../api'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])
const { t } = useI18n()
const store = useJewelryStore()

const formData = ref({
  name: '',
  price: 0,
  category: '',
  barcode: '',
  image: '',
})

const categoriesRaw = ref([])

// Cargar categorías desde API o store
onMounted(async () => {
  try {
    // Intentar cargar desde API primero
    const response = await categoriesAPI.getAll()
    if (response.categories && Array.isArray(response.categories) && response.categories.length > 0) {
      categoriesRaw.value = response.categories
    } else {
      // Si API no tiene categorías, usar las del store
      categoriesRaw.value = store.categories
    }
  } catch (error) {
    console.warn('No se pudieron cargar categorías desde API, usando categorías del store:', error)
    // Usar categorías del store como fallback
    categoriesRaw.value = store.categories
  }
})

// Computed para categorías con nombres traducidos
const categories = computed(() => {
  return categoriesRaw.value.map(cat => ({
    id: cat.id,
    name: t(`categories.${cat.id}`) || cat.name || cat.id,
    icon: cat.icon || '📦'
  }))
})

const selectedFileName = ref('')
const isProcessingImage = ref(false)
const imageProcessInfo = ref(null)

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = {
      name: newProduct.name || '',
      price: newProduct.price || 0,
      category: newProduct.category || '',
      barcode: newProduct.barcode || '',
      image: newProduct.image || '',
    }
    // Si ya hay imagen, mostrar nombre de archivo
    if (newProduct.image) {
      selectedFileName.value = 'Imagen cargada'
    } else {
      selectedFileName.value = ''
    }
    imageProcessInfo.value = null
  } else {
    formData.value = {
      name: '',
      price: 0,
      category: '',
      barcode: '',
      image: '',
    }
    selectedFileName.value = ''
    imageProcessInfo.value = null
  }
}, { immediate: true })

// Procesar selección de archivo local
const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert(t('admin.products.imageRequired') || 'Por favor seleccione un archivo de imagen')
    return
  }

  // Validar tamaño de archivo (límite 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    alert('El archivo de imagen es demasiado grande, por favor seleccione una imagen menor a 10MB')
    return
  }

  selectedFileName.value = file.name
  isProcessingImage.value = true
  imageProcessInfo.value = null

  try {
    // Comprimir y redimensionar imagen automáticamente
    const result = await processImageFile(file, {
      maxWidth: 1200,  // Ancho máximo 1200px
      maxHeight: 1200, // Alto máximo 1200px
      quality: 0.85,   // Calidad de compresión 85%
      format: 'jpeg'   // Formato de salida JPEG
    })

    // Usar imagen procesada
    formData.value.image = result.dataUrl
    imageProcessInfo.value = result
    
    console.log('✅ Procesamiento de imagen completado:', {
      tamañoOriginal: formatFileSize(result.originalSize),
      tamañoProcesado: formatFileSize(result.compressedSize),
      tasaCompresion: Math.round((1 - result.compressedSize / result.originalSize) * 100) + '%',
      dimensionesOriginales: `${result.dimensions.originalWidth} × ${result.dimensions.originalHeight}`,
      dimensionesProcesadas: `${result.dimensions.width} × ${result.dimensions.height}`
    })
  } catch (error) {
    console.error('Error al procesar imagen:', error)
    alert('Error al procesar imagen: ' + (error.message || 'Error desconocido'))
    selectedFileName.value = ''
    imageProcessInfo.value = null
  } finally {
    isProcessingImage.value = false
  }
}

// Eliminar imagen
const removeImage = () => {
  formData.value.image = ''
  selectedFileName.value = ''
  imageProcessInfo.value = null
  // Restablecer entrada de archivo
  const fileInput = document.querySelector('.file-input')
  if (fileInput) {
    fileInput.value = ''
  }
}

const handleSubmit = () => {
  // Validar campos requeridos
  if (!formData.value.name || !formData.value.name.trim()) {
    alert(t('admin.products.nameRequired'))
    return
  }

  if (!formData.value.price || formData.value.price <= 0) {
    alert(t('admin.products.priceInvalid'))
    return
  }

  if (!formData.value.category) {
    alert(t('admin.products.categoryRequired'))
    return
  }

  if (!formData.value.image) {
    alert(t('admin.products.imageRequired'))
    return
  }

  emit('save', { ...formData.value })
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--border-color);

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: var(--transition);

  &:hover {
    background: var(--accent-color);
    color: var(--text-primary);
  }
}

.product-form {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  input[type="text"],
  input[type="number"],
  select,
  textarea {
    padding: 0.875rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: var(--transition);
    font-family: inherit;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 0.5rem;
    cursor: pointer;
  }

  label:has(input[type="checkbox"]) {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}


.file-input {
  display: none;
}

.file-upload-wrapper {
  margin-top: 0.5rem;
}

.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: #fafafa;

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .upload-icon {
    font-size: 2.5rem;
  }

  .upload-hint {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  .file-icon {
    font-size: 1.5rem;
  }

  .file-name {
    flex: 1;
    text-align: left;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-change-file {
    padding: 0.5rem 1rem;
    background: var(--accent-color);
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    color: var(--text-primary);
    font-size: 0.9rem;

    &:hover {
      background: #e0e0e0;
    }
  }
}

.btn-process {
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.processing-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f0f4ff;
  border-radius: 8px;
  color: #667eea;
  font-size: 0.9rem;
}

.processing-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.85rem;
  color: var(--text-secondary);

  .info-label {
    font-weight: 600;
    color: var(--text-primary);
  }

  .success {
    color: #10b981;
    font-weight: 600;
  }
}

.image-preview-container {
  position: relative;
  margin-top: 1rem;
  display: inline-block;
}

.image-preview {
  width: 100%;
  max-width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-container:hover .preview-overlay {
  opacity: 1;
}

.btn-remove-image {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: var(--transition);

  &:hover {
    background: rgba(239, 68, 68, 1);
    transform: translateY(-2px);
  }
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-color);
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel {
  background: var(--accent-color);
  color: var(--text-secondary);

  &:hover {
    background: #e0e0e0;
  }
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}
</style>

