/**
 * Herramienta de escalado y compresión automática de imágenes
 */

/**
 * Comprimir imagen
 * @param {File|string} file - Archivo de imagen o URL
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calcular nuevo tamaño, mantener relación de aspecto
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Error al comprimir imagen'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Error al cargar imagen'))

    if (file instanceof File) {
      img.src = URL.createObjectURL(file)
    } else {
      img.src = file
    }
  })
}

/**
 * Procesar archivo de imagen local (compresión y escalado)
 * @param {File} file - Archivo de imagen
 * @param {Object} options - Opciones
 * @param {number} options.maxWidth - Ancho máximo, por defecto 1200
 * @param {number} options.maxHeight - Alto máximo, por defecto 1200
 * @param {number} options.quality - Calidad de compresión (0-1), por defecto 0.85
 * @param {string} options.format - Formato de salida ('jpeg'|'webp'|'png'), por defecto 'jpeg'
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

        // Calcular nuevo tamaño, mantener relación de aspecto
        let width = originalWidth
        let height = originalHeight

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Crear canvas y dibujar imagen
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height

        // Dibujar imagen
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a Blob
        const mimeType = format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al procesar imagen'))
              return
            }

            // Convertir a Data URL
            const reader = new FileReader()
            reader.onloadend = () => {
              // Limpiar URL temporal
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
              reject(new Error('Error al leer imagen procesada'))
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
      reject(new Error('Error al cargar imagen'))
    }

    // Crear URL temporal
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Crear URL de imagen responsiva (usando srcset)
 * @param {string} baseUrl - URL base de la imagen
 * @param {Array<number>} sizes - Array de tamaños, ej: [400, 800, 1200]
 * @returns {Object} Objeto que contiene src y srcset
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
 * Procesamiento de carga diferida de imágenes
 * @param {HTMLElement} imgElement - Elemento de imagen
 * @param {string} src - URL de la imagen
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
 * Precargar imágenes
 * @param {string|Array<string>} urls - URL de imagen o array de URLs
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
 * Obtener dimensiones de imagen
 * @param {string|File} source - URL de imagen o archivo
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
 * Cargar imagen desde URL y comprimir/escalar automáticamente
 * @param {string} imageUrl - URL de la imagen
 * @param {Object} options - Opciones
 * @param {number} options.maxWidth - Ancho máximo, por defecto 1200
 * @param {number} options.maxHeight - Alto máximo, por defecto 1200
 * @param {number} options.quality - Calidad de compresión (0-1), por defecto 0.85
 * @param {string} options.format - Formato de salida ('jpeg'|'webp'|'png'), por defecto 'jpeg'
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
    img.crossOrigin = 'anonymous' // Permitir procesamiento de imágenes de origen cruzado

    img.onload = async () => {
      try {
        const originalWidth = img.naturalWidth
        const originalHeight = img.naturalHeight
        const originalSize = await getImageSizeFromUrl(imageUrl)

        // Calcular nuevo tamaño, mantener relación de aspecto
        let width = originalWidth
        let height = originalHeight

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Crear canvas y dibujar imagen
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height

        // Dibujar imagen
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a Blob
        const mimeType = format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al procesar imagen'))
              return
            }

            // Convertir a Data URL
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
            reader.onerror = () => reject(new Error('Error al leer imagen procesada'))
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
      // Si falla el origen cruzado, intentar sin crossOrigin
      if (img.crossOrigin) {
        img.crossOrigin = null
        img.src = imageUrl
      } else {
        reject(new Error('Error al cargar imagen, puede ser un problema de origen cruzado o URL inválida'))
      }
    }

    img.src = imageUrl
  })
}

/**
 * Obtener tamaño del archivo de imagen (mediante solicitud HEAD)
 * @param {string} url - URL de la imagen
 * @returns {Promise<number>} Tamaño del archivo (bytes)
 */
async function getImageSizeFromUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength, 10) : 0
  } catch (error) {
    // Si la solicitud HEAD falla, retornar 0
    return 0
  }
}

/**
 * Formatear tamaño de archivo
 * @param {number} bytes - Número de bytes
 * @returns {string} Tamaño formateado
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

