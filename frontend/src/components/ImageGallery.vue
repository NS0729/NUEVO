<template>
  <div class="image-gallery">
    <div class="main-image-wrapper">
      <img 
        :src="currentImage" 
        :alt="alt"
        class="main-image"
        @load="onImageLoad"
      />
      <button 
        v-if="images.length > 1"
        class="nav-btn prev-btn" 
        @click="prevImage"
        :disabled="currentIndex === 0"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button 
        v-if="images.length > 1"
        class="nav-btn next-btn" 
        @click="nextImage"
        :disabled="currentIndex === images.length - 1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <div v-if="images.length > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <div v-if="images.length > 1" class="thumbnail-list">
      <button
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
        @click="setCurrentImage(index)"
      >
        <img :src="image" :alt="`${alt} ${index + 1}`" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  alt: {
    type: String,
    default: 'Product image'
  }
})

const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value] || props.images[0])

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const setCurrentImage = (index) => {
  currentIndex.value = index
}

const onImageLoad = (e) => {
  e.target.classList.add('loaded')
}
</script>

<style lang="scss" scoped>
.image-gallery {
  width: 100%;
}

.main-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 16px;
  background: var(--accent-color);
  margin-bottom: 1rem;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.loaded {
    opacity: 1;
  }
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  z-index: 2;

  &:hover:not(:disabled) {
    background: #fff;
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.prev-btn {
    left: 16px;
  }

  &.next-btn {
    right: 16px;
  }
}

.image-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: var(--shadow-sm);
}

.thumbnail-list {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  background: var(--accent-color);
  cursor: pointer;
  transition: var(--transition);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover,
  &.active {
    border-color: var(--primary-color);
    transform: scale(1.05);
  }
}
</style>

