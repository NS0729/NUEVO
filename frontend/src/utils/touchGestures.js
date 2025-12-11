/**
 * 移动端触摸手势支持
 */

/**
 * 创建滑动检测
 * @param {HTMLElement} element - 目标元素
 * @param {Object} callbacks - 回调函数
 * @param {Function} callbacks.onSwipeLeft - 左滑回调
 * @param {Function} callbacks.onSwipeRight - 右滑回调
 * @param {Function} callbacks.onSwipeUp - 上滑回调
 * @param {Function} callbacks.onSwipeDown - 下滑回调
 * @param {Number} threshold - 滑动阈值（像素）
 */
export function createSwipeDetector(element, callbacks = {}, threshold = 50) {
  let startX = 0
  let startY = 0
  let startTime = 0

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
  }

  const handleTouchEnd = (e) => {
    if (!startX || !startY) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    const deltaTime = Date.now() - startTime

    // 只处理快速滑动（小于300ms）
    if (deltaTime > 300) {
      reset()
      return
    }

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // 判断是否为有效滑动
    if (Math.max(absX, absY) < threshold) {
      reset()
      return
    }

    // 判断滑动方向
    if (absX > absY) {
      // 水平滑动
      if (deltaX > 0 && callbacks.onSwipeRight) {
        callbacks.onSwipeRight(e)
      } else if (deltaX < 0 && callbacks.onSwipeLeft) {
        callbacks.onSwipeLeft(e)
      }
    } else {
      // 垂直滑动
      if (deltaY > 0 && callbacks.onSwipeDown) {
        callbacks.onSwipeDown(e)
      } else if (deltaY < 0 && callbacks.onSwipeUp) {
        callbacks.onSwipeUp(e)
      }
    }

    reset()
  }

  const reset = () => {
    startX = 0
    startY = 0
    startTime = 0
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })

  // 返回清理函数
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
  }
}

/**
 * 创建长按检测
 * @param {HTMLElement} element - 目标元素
 * @param {Function} callback - 长按回调
 * @param {Number} duration - 长按持续时间（毫秒）
 */
export function createLongPressDetector(element, callback, duration = 500) {
  let timer = null

  const handleTouchStart = () => {
    timer = setTimeout(() => {
      callback()
    }, duration)
  }

  const handleTouchEnd = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })
  element.addEventListener('touchmove', handleTouchEnd, { passive: true })

  // 返回清理函数
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchmove', handleTouchEnd)
    if (timer) {
      clearTimeout(timer)
    }
  }
}

/**
 * 创建双击检测
 * @param {HTMLElement} element - 目标元素
 * @param {Function} callback - 双击回调
 * @param {Number} delay - 双击间隔（毫秒）
 */
export function createDoubleTapDetector(element, callback, delay = 300) {
  let lastTap = 0

  const handleTouchEnd = (e) => {
    const currentTime = Date.now()
    const tapLength = currentTime - lastTap

    if (tapLength < delay && tapLength > 0) {
      callback(e)
      lastTap = 0
    } else {
      lastTap = currentTime
    }
  }

  element.addEventListener('touchend', handleTouchEnd, { passive: true })

  // 返回清理函数
  return () => {
    element.removeEventListener('touchend', handleTouchEnd)
  }
}

