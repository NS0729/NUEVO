/**
 * 移动端自动缩放工具
 * 确保页面在不同设备上正确显示
 */

/**
 * 检测设备类型
 */
export function detectDevice() {
  const ua = navigator.userAgent.toLowerCase()
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isWeChat = /micromessenger/i.test(ua)
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isWeChat,
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1
  }
}

/**
 * 设置页面缩放
 * @param {Number} scale - 缩放比例 (0.5 - 2.0)
 */
export function setPageScale(scale) {
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    const device = detectDevice()
    const maxScale = device.isIOS ? 5.0 : 5.0
    const minScale = 0.5
    const clampedScale = Math.max(minScale, Math.min(maxScale, scale))
    
    viewport.setAttribute('content', 
      `width=device-width, initial-scale=${clampedScale}, maximum-scale=${maxScale}, minimum-scale=${minScale}, user-scalable=yes, viewport-fit=cover`
    )
  }
}

/**
 * 自动调整页面缩放以适应屏幕
 */
export function autoScalePage() {
  const device = detectDevice()
  
  if (!device.isMobile) {
    return // 非移动设备不需要缩放
  }

  const screenWidth = device.width
  const designWidth = 375 // 设计稿基准宽度（iPhone标准宽度）
  
  // 计算缩放比例
  let scale = screenWidth / designWidth
  
  // 限制缩放范围
  if (scale < 0.5) {
    scale = 0.5
  } else if (scale > 1.5) {
    scale = 1.5
  }
  
  // 对于小屏幕设备，使用更小的初始缩放
  if (screenWidth < 360) {
    scale = Math.max(0.8, scale)
  }
  
  // 应用缩放
  setPageScale(scale)
  
  // 设置根元素字体大小（用于rem单位）
  const rootFontSize = 16 * scale
  document.documentElement.style.fontSize = `${rootFontSize}px`
  
  return scale
}

/**
 * 监听屏幕方向变化
 */
export function handleOrientationChange() {
  let orientationTimer = null
  
  const handleChange = () => {
    clearTimeout(orientationTimer)
    orientationTimer = setTimeout(() => {
      autoScalePage()
      // 触发resize事件，让其他组件响应
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }
  
  window.addEventListener('orientationchange', handleChange)
  window.addEventListener('resize', handleChange)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('orientationchange', handleChange)
    window.removeEventListener('resize', handleChange)
    clearTimeout(orientationTimer)
  }
}

/**
 * 初始化移动端缩放
 */
export function initMobileScale() {
  const device = detectDevice()
  
  if (device.isMobile) {
    // 立即执行一次缩放
    autoScalePage()
    
    // 监听方向变化
    const cleanup = handleOrientationChange()
    
    // 页面加载完成后再次调整
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(autoScalePage, 100)
      })
    } else {
      setTimeout(autoScalePage, 100)
    }
    
    // 返回清理函数
    return cleanup
  }
  
  return () => {}
}

/**
 * 获取当前缩放比例
 */
export function getCurrentScale() {
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    const content = viewport.getAttribute('content')
    const match = content.match(/initial-scale=([\d.]+)/)
    if (match) {
      return parseFloat(match[1])
    }
  }
  return 1.0
}

/**
 * 重置缩放
 */
export function resetScale() {
  setPageScale(1.0)
  document.documentElement.style.fontSize = '16px'
}

