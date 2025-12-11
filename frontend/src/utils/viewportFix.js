/**
 * Viewport修复工具
 * 解决移动端viewport缩放问题
 */

/**
 * 修复viewport设置
 */
export function fixViewport() {
  // 移除可能存在的旧viewport
  const oldViewport = document.querySelector('meta[name="viewport"]')
  if (oldViewport) {
    oldViewport.remove()
  }
  
  // 创建新的viewport meta标签
  const viewport = document.createElement('meta')
  viewport.name = 'viewport'
  
  // 检测设备
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
  const isAndroid = /android/i.test(navigator.userAgent.toLowerCase())
  const screenWidth = window.screen.width || window.innerWidth
  
  // 根据设备设置viewport
  if (isIOS) {
    // iOS设备：允许缩放，但设置合理的初始缩放
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes, viewport-fit=cover'
  } else if (isAndroid) {
    // Android设备：根据屏幕宽度调整
    const scale = screenWidth < 360 ? 0.9 : 1.0
    viewport.content = `width=device-width, initial-scale=${scale}, maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes`
  } else {
    // 其他移动设备
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes'
  }
  
  // 插入到head
  document.head.insertBefore(viewport, document.head.firstChild)
  
  return viewport.content
}

/**
 * 动态调整viewport以适应内容
 */
export function adjustViewportForContent() {
  const body = document.body
  const html = document.documentElement
  
  // 获取实际内容宽度
  const contentWidth = Math.max(
    body.scrollWidth,
    body.offsetWidth,
    html.clientWidth,
    html.scrollWidth,
    html.offsetWidth
  )
  
  const screenWidth = window.innerWidth
  
  // 如果内容宽度超过屏幕宽度，调整缩放
  if (contentWidth > screenWidth) {
    const scale = screenWidth / contentWidth
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      const currentContent = viewport.getAttribute('content')
      const newContent = currentContent.replace(
        /initial-scale=[\d.]+/,
        `initial-scale=${Math.max(0.5, Math.min(1.0, scale))}`
      )
      viewport.setAttribute('content', newContent)
    }
  }
}

/**
 * 防止页面缩放导致的布局问题
 */
export function preventZoomIssues() {
  // 监听触摸事件，防止意外缩放
  let lastTouchEnd = 0
  
  document.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })
  
  // 监听双击，防止意外缩放
  let lastTap = 0
  document.addEventListener('touchend', (event) => {
    const currentTime = Date.now()
    const tapLength = currentTime - lastTap
    if (tapLength < 300 && tapLength > 0) {
      event.preventDefault()
    }
    lastTap = currentTime
  }, { passive: false })
}

/**
 * 初始化viewport修复
 */
export function initViewportFix() {
  // 立即修复viewport
  fixViewport()
  
  // 页面加载完成后再次检查
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        adjustViewportForContent()
        preventZoomIssues()
      }, 100)
    })
  } else {
    setTimeout(() => {
      adjustViewportForContent()
      preventZoomIssues()
    }, 100)
  }
  
  // 监听窗口大小变化
  let resizeTimer = null
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      adjustViewportForContent()
    }, 300)
  })
  
  // 监听屏幕方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      fixViewport()
      adjustViewportForContent()
    }, 100)
  })
}

