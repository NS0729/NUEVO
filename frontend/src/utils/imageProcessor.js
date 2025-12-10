/**
 * 图片自动缩放和压缩工具
 */

/**
 * 压缩图片
 * @param {File|string} file - 图片文件或URL
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // 计算新尺寸，保持宽高比
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片压缩失败'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('图片加载失败'))

    if (file instanceof File) {
      img.src = URL.createObjectURL(file)
    } else {
      img.src = file
    }
  })
}

/**
 * 处理本地图片文件（压缩和缩放）
 * @param {File} file - 图片文件
 * @param {Object} options - 选项
 * @param {number} options.maxWidth - 最大宽度，默认1200
 * @param {number} options.maxHeight - 最大高度，默认1200
 * @param {number} options.quality - 压缩质量 (0-1)，默认0.85
 * @param {string} options.format - 输出格式 ('jpeg'|'webp'|'png')，默认'jpeg'
 * @returns {Promise<{dataUrl: string, blob: Blob, originalSize: number, compressedSize: number, dimensions: {width: number, height: number, originalWidth: number, originalHeight: number}}>}
 */
export async function processImageFile(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const originalSize = file.size

    img.onload = () => {
      try {
        const originalWidth = img.naturalWidth
        const originalHeight = img.naturalHeight

        // 计算新尺寸，保持宽高比
        let width = originalWidth
        let height = originalHeight

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // 创建canvas并绘制图片
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为Blob
        const mimeType = format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片处理失败'))
              return
            }

            // 转换为Data URL
            const reader = new FileReader()
            reader.onloadend = () => {
              // 清理临时URL
              URL.revokeObjectURL(img.src)
              
              resolve({
                dataUrl: reader.result,
                blob: blob,
                originalSize: originalSize,
                compressedSize: blob.size,
                dimensions: {
                  width: width,
                  height: height,
                  originalWidth: originalWidth,
                  originalHeight: originalHeight
                }
              })
            }
            reader.onerror = () => {
              URL.revokeObjectURL(img.src)
              reject(new Error('读取处理后的图片失败'))
            }
            reader.readAsDataURL(blob)
          },
          mimeType,
          quality
        )
      } catch (error) {
        URL.revokeObjectURL(img.src)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('图片加载失败'))
    }

    // 创建临时URL
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 创建响应式图片URL（使用srcset）
 * @param {string} baseUrl - 基础图片URL
 * @param {Array<number>} sizes - 尺寸数组，如 [400, 800, 1200]
 * @returns {Object} 包含src和srcset的对象
 */
export function createResponsiveImage(baseUrl, sizes = [400, 800, 1200]) {
  const srcset = sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ')
  
  return {
    src: `${baseUrl}?w=${sizes[0]}`,
    srcset,
    sizes: '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px'
  }
}

/**
 * 懒加载图片处理
 * @param {HTMLElement} imgElement - 图片元素
 * @param {string} src - 图片URL
 */
export function lazyLoadImage(imgElement, src) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = src
        img.classList.add('loaded')
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px'
  })

  observer.observe(imgElement)
}

/**
 * 预加载图片
 * @param {string|Array<string>} urls - 图片URL或URL数组
 * @returns {Promise}
 */
export function preloadImages(urls) {
  const urlArray = Array.isArray(urls) ? urls : [urls]
  const promises = urlArray.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
  })
  return Promise.all(promises)
}

/**
 * 获取图片尺寸
 * @param {string|File} source - 图片URL或文件
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(source) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = reject

    if (source instanceof File) {
      img.src = URL.createObjectURL(source)
    } else {
      img.src = source
    }
  })
}

/**
 * 从URL加载图片并自动压缩和缩放
 * @param {string} imageUrl - 图片URL
 * @param {Object} options - 选项
 * @param {number} options.maxWidth - 最大宽度，默认1200
 * @param {number} options.maxHeight - 最大高度，默认1200
 * @param {number} options.quality - 压缩质量 (0-1)，默认0.85
 * @param {string} options.format - 输出格式 ('jpeg'|'webp'|'png')，默认'jpeg'
 * @returns {Promise<{dataUrl: string, blob: Blob, originalSize: number, compressedSize: number, dimensions: {width: number, height: number, originalWidth: number, originalHeight: number}}>}
 */
export async function processImageFromUrl(imageUrl, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // 允许跨域图片处理

    img.onload = async () => {
      try {
        const originalWidth = img.naturalWidth
        const originalHeight = img.naturalHeight
        const originalSize = await getImageSizeFromUrl(imageUrl)

        // 计算新尺寸，保持宽高比
        let width = originalWidth
        let height = originalHeight

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // 创建canvas并绘制图片
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为Blob
        const mimeType = format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片处理失败'))
              return
            }

            // 转换为Data URL
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve({
                dataUrl: reader.result,
                blob: blob,
                originalSize: originalSize,
                compressedSize: blob.size,
                dimensions: {
                  width: width,
                  height: height,
                  originalWidth: originalWidth,
                  originalHeight: originalHeight
                }
              })
            }
            reader.onerror = () => reject(new Error('读取处理后的图片失败'))
            reader.readAsDataURL(blob)
          },
          mimeType,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      // 如果跨域失败，尝试不使用crossOrigin
      if (img.crossOrigin) {
        img.crossOrigin = null
        img.src = imageUrl
      } else {
        reject(new Error('图片加载失败，可能是跨域问题或URL无效'))
      }
    }

    img.src = imageUrl
  })
}

/**
 * 获取图片文件大小（通过HEAD请求）
 * @param {string} url - 图片URL
 * @returns {Promise<number>} 文件大小（字节）
 */
async function getImageSizeFromUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength, 10) : 0
  } catch (error) {
    // 如果HEAD请求失败，返回0
    return 0
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

