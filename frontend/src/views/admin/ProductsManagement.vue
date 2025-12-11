<template>
  <div class="products-management">
    <div class="management-header">
      <h2>{{ t('admin.products.title') }}</h2>
      <button class="btn-add" @click="showAddModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        {{ t('admin.products.add') }}
      </button>
    </div>

    <div class="products-table">
      <div v-if="products.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p class="empty-text">{{ t('admin.products.empty') }}</p>
        <p class="empty-hint">{{ t('admin.products.emptyHint') }}</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>{{ t('admin.products.name') }}</th>
            <th>{{ t('admin.products.category') }}</th>
            <th>{{ t('common.price') }}</th>
            <th>{{ t('common.barcode') }}</th>
            <th>{{ t('common.all') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <span class="product-name">{{ product.name }}</span>
            </td>
            <td>
              <span class="category-badge">{{ getCategoryName(product.category) }}</span>
            </td>
            <td class="price">${{ formatPrice(product.price) }}</td>
            <td>
              <span class="barcode">{{ product.barcode || '-' }}</span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" @click="editProduct(product)">{{ t('common.edit') }}</button>
                <button class="btn-delete" @click="deleteProduct(product.id)">{{ t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar producto -->
    <ProductModal
      v-if="showAddModal || editingProduct"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productsAPI } from '../../api'
import { formatPrice } from '../../utils/priceFormatter'
import ProductModal from './ProductModal.vue'
import { useToast } from '../../composables/useToast'
import { useI18n } from '../../i18n'
import { useJewelryStore } from '../../store'

const products = ref([])
const showAddModal = ref(false)
const editingProduct = ref(null)
const toast = useToast()
const { t } = useI18n()
const store = useJewelryStore()

// Obtener nombre de categoría por ID
const getCategoryName = (categoryId) => {
  if (!categoryId) return '-'
  const category = store.categories.find(cat => cat.id === categoryId)
  if (category) {
    // Usar traducción de i18n si está disponible, sino usar el nombre del store
    const translatedName = t(`categories.${categoryId}`) || category.name || categoryId
    return `${category.icon || '📦'} ${translatedName}`
  }
  // Si no se encuentra, intentar obtener desde i18n
  const translatedName = t(`categories.${categoryId}`) || categoryId
  return `📦 ${translatedName}`
}


const loadProducts = async () => {
  try {
    const response = await productsAPI.getAll()
    // Asegurar que products sea un array
    const productsList = response.products || []
    products.value = Array.isArray(productsList) ? productsList : []
    console.log('✅ Lista de productos cargada:', products.value.length, 'productos')
  } catch (error) {
    console.error('❌ Error al cargar productos:', error)
    toast.error('Error al cargar productos: ' + (error.message || 'Error desconocido'))
    // Si la API falla, usar array vacío
    products.value = []
  }
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
  showAddModal.value = true
}

const deleteProduct = async (id) => {
  if (!confirm(t('admin.products.deleteConfirm'))) return
  
  try {
    await productsAPI.delete(id)
    toast.success(t('admin.products.deleted'))
    // Recargar lista de productos
    await loadProducts()
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    toast.error(t('admin.products.deleteFailed') + ': ' + (error.message || t('common.error')))
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingProduct.value = null
}

const handleSave = async (productData) => {
  try {
    // Validar campos requeridos
    if (!productData.name || !productData.name.trim()) {
      toast.error(t('admin.products.nameRequired'))
      return
    }
    if (!productData.price || productData.price <= 0) {
      toast.error(t('admin.products.priceInvalid'))
      return
    }

    console.log('💾 Iniciando guardado de producto:', productData.name)

    if (editingProduct.value) {
      // Actualizar producto: actualizar nombre, precio, categoría, código de barras e imagen, mantener otros campos
      const productDataToSend = {
        ...editingProduct.value, // Mantener todos los campos del producto original
        name: productData.name.trim(), // Actualizar nombre
        price: Number(productData.price), // Actualizar precio
        category: productData.category || editingProduct.value.category, // Actualizar categoría
        barcode: productData.barcode || '', // Actualizar código de barras
        image: productData.image || editingProduct.value.image || '', // Actualizar imagen (si hay nueva imagen)
      }
      console.log('📝 Actualizando producto ID:', editingProduct.value.id)
      const response = await productsAPI.update(editingProduct.value.id, productDataToSend)
      console.log('✅ Respuesta de actualización:', response)
      toast.success(t('admin.products.saved'))
    } else {
      // Agregar nuevo producto: necesita proporcionar valores por defecto
      const productDataToSend = {
        name: productData.name.trim(),
        price: Number(productData.price),
        category: productData.category || 'rings', // Usar categoría seleccionada o 'rings' por defecto
        barcode: productData.barcode || '',
        image: productData.image || '',
        description: '', // Descripción vacía por defecto
        material: '', // Material vacío por defecto
        originalPrice: null,
        inStock: true,
        featured: true, // Por defecto, los nuevos productos son destacados para que aparezcan en la página principal
      }
      console.log('➕ Creando nuevo producto')
      const response = await productsAPI.create(productDataToSend)
      console.log('✅ Respuesta de creación:', response)
      if (!response || !response.id) {
        throw new Error('Error al crear producto: no se devolvió el ID del producto')
      }
      toast.success(t('admin.products.saved'))
    }
    
    // Cerrar modal
    closeModal()
    
    // Recargar lista de productos, asegurar que los datos sean consistentes con la base de datos
    console.log('🔄 Recargando lista de productos...')
    await loadProducts()
    console.log('✅ Lista de productos actualizada')
    
    // También actualizar el store del frontend si está disponible
    // Esto asegura que los nuevos productos aparezcan inmediatamente en la página principal
    try {
      console.log('🔄 Actualizando store del frontend...')
      await store.loadProducts()
      console.log('✅ Store del frontend actualizado')
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar el store del frontend:', error)
      // No es crítico, el store se actualizará cuando el usuario regrese al frontend
    }
  } catch (error) {
    console.error('❌ Error al guardar producto:', error)
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    const errorMessage = error.message || 'Error desconocido'
    toast.error('Error al guardar: ' + errorMessage)
  }
}

onMounted(async () => {
  // Asegurar que las categorías estén cargadas antes de mostrar productos
  await store.loadCategories()
  await loadProducts()
})
</script>

<style lang="scss" scoped>
.products-management {
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
  }
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.products-table {
  overflow-x: auto;
  min-height: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

thead {
  background: var(--accent-color);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.product-name {
  font-weight: 600;
  color: var(--text-primary);
}

.barcode {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: var(--accent-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.price {
  font-weight: 600;
  color: var(--text-primary);

  .original {
    color: var(--text-light);
    text-decoration: line-through;
    font-weight: 400;
  }
}


.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--accent-color);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;

  &:hover {
    background: #bbdefb;
  }
}

.btn-delete {
  background: #ffebee;
  color: #c62828;

  &:hover {
    background: #ffcdd2;
  }
}
</style>

