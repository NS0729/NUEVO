<template>
  <div class="categories-management">
    <div class="management-header">
      <h2>分类管理</h2>
      <button class="btn-add" @click="showAddModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加分类
      </button>
    </div>

    <div class="categories-grid">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-info">
          <h3 class="category-name">{{ category.name }}</h3>
          <p class="category-id">ID: {{ category.id }}</p>
        </div>
        <div class="category-actions">
          <button class="btn-edit" @click="editCategory(category)">编辑</button>
          <button class="btn-delete" @click="deleteCategory(category.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>分类ID</label>
            <input
              v-model="formData.id"
              type="text"
              placeholder="例如: rings"
              required
              :disabled="!!editingCategory"
            />
          </div>
          <div class="form-group">
            <label>分类名称</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="例如: 戒指"
              required
            />
          </div>
          <div class="form-group">
            <label>图标</label>
            <input
              v-model="formData.icon"
              type="text"
              placeholder="例如: 💍"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">取消</button>
            <button type="submit" class="btn-save">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoriesAPI } from '../../api'

const categories = ref([])
const showAddModal = ref(false)
const editingCategory = ref(null)
const formData = ref({
  id: '',
  name: '',
  icon: '',
})

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll()
    categories.value = response.categories || []
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  formData.value = { ...category }
  showAddModal.value = true
}

const deleteCategory = async (id) => {
  if (!confirm('确定要删除这个分类吗？')) return
  
  try {
    categories.value = categories.value.filter(c => c.id !== id)
    alert('分类已删除')
  } catch (error) {
    console.error('删除分类失败:', error)
    alert('删除失败')
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingCategory.value = null
  formData.value = { id: '', name: '', icon: '' }
}

const handleSave = () => {
  if (editingCategory.value) {
    // 更新分类
    const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
    if (index > -1) {
      categories.value[index] = { ...formData.value }
    }
  } else {
    // 添加新分类
    categories.value.push({ ...formData.value })
  }
  closeModal()
  alert(editingCategory.value ? '分类已更新' : '分类已添加')
}

onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss" scoped>
.categories-management {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #ffffff;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: var(--transition);

  &:hover {
    border-color: #667eea;
    box-shadow: var(--shadow-sm);
    transform: translateY(-4px);
  }
}

.category-icon {
  font-size: 4rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 50%;
}

.category-info {
  text-align: center;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.category-id {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: 8px;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
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
  }

  input {
    padding: 0.875rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: var(--transition);

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
      background: var(--accent-color);
      cursor: not-allowed;
    }
  }
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

