/**
 * Cloudflare Workers API for Jewelry App
 * 使用 D1 数据库存储商品和订单数据
 */

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 处理 CORS 预检请求
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
}

// 统一响应格式
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// 错误响应
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status)
}

/**
 * 生成token
 */
function generateToken() {
  return 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

/**
 * 验证管理员token
 */
async function verifyAdminToken(request, env) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('⚠️ Token验证失败: 未找到Authorization头或格式不正确')
    return null
  }

  const token = authHeader.substring(7)
  console.log('🔍 验证Token:', token.substring(0, 20) + '...')
  
  try {
    // 检查token是否有效且未过期
    const session = await env.DB.prepare(
      `SELECT s.*, u.username, u.role, u.isActive 
       FROM admin_sessions s
       JOIN admin_users u ON s.adminId = u.id
       WHERE s.token = ? AND s.expiresAt > datetime('now') AND u.isActive = 1`
    ).bind(token).first()

    if (!session) {
      console.log('⚠️ Token验证失败: 未找到有效会话或已过期')
      // 调试：检查是否有该token但已过期
      const expiredSession = await env.DB.prepare(
        `SELECT s.* FROM admin_sessions s WHERE s.token = ?`
      ).bind(token).first()
      if (expiredSession) {
        console.log('⚠️ Token存在但已过期，过期时间:', expiredSession.expiresAt)
      } else {
        console.log('⚠️ Token不存在于数据库中')
      }
      return null
    }

    console.log('✅ Token验证成功:', session.username)
    return {
      adminId: session.adminId,
      username: session.username,
      role: session.role,
    }
  } catch (error) {
    console.error('❌ Token验证异常:', error)
    return null
  }
}

/**
 * 权限验证中间件
 */
async function requireAuth(request, env) {
  const admin = await verifyAdminToken(request, env)
  if (!admin) {
    return { error: errorResponse('未授权访问', 401) }
  }
  return { admin }
}

/**
 * 商品相关 API
 */
async function handleProducts(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/products', '')

  // GET /api/products - 获取所有商品
  if (request.method === 'GET' && path === '') {
    const { searchParams } = url
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    let query = 'SELECT * FROM products WHERE 1=1'
    const params = []

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    if (featured === 'true') {
      query += ' AND featured = 1'
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR material LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    query += ' ORDER BY id ASC'

    try {
      const { results } = await env.DB.prepare(query).bind(...params).all()
      
      // 处理图片数组
      const products = results.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [product.image],
        featured: product.featured === 1,
        inStock: product.inStock === 1,
      }))

      return jsonResponse({ products })
    } catch (error) {
      return errorResponse(`获取商品失败: ${error.message}`, 500)
    }
  }

  // GET /api/products/:id - 获取单个商品
  if (request.method === 'GET' && path.startsWith('/')) {
    const id = path.slice(1)
    
    try {
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE id = ?'
      ).bind(id).first()

      if (!product) {
        return errorResponse('商品不存在', 404)
      }

      // 处理图片数组
      const result = {
        ...product,
        images: product.images ? JSON.parse(product.images) : [product.image],
        featured: product.featured === 1,
        inStock: product.inStock === 1,
      }

      return jsonResponse({ product: result })
    } catch (error) {
      return errorResponse(`获取商品失败: ${error.message}`, 500)
    }
  }

  // POST /api/products - 创建商品（管理员）
  if (request.method === 'POST' && path === '') {
    // 验证管理员权限
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    try {
      const data = await request.json()
      const {
        name,
        category,
        price,
        originalPrice,
        image,
        images,
        description,
        material,
        stone,
        size,
        inStock = true,
        featured = false,
      } = data

      // 验证必填字段
      if (!name || !category || price === undefined || price === null || !image) {
        return errorResponse('缺少必填字段：name, category, price, image', 400)
      }

      // 确保价格为数字
      const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price)
      if (isNaN(priceNum) || priceNum < 0) {
        return errorResponse('价格必须是有效的正数', 400)
      }

      const originalPriceNum = originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : Number(originalPrice)) : null
      if (originalPriceNum !== null && (isNaN(originalPriceNum) || originalPriceNum < 0)) {
        return errorResponse('原价必须是有效的正数', 400)
      }

      try {
        const result = await env.DB.prepare(
          `INSERT INTO products 
           (name, category, price, originalPrice, image, images, description, material, stone, size, inStock, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          String(name).trim(),
          String(category).trim(),
          priceNum,
          originalPriceNum,
          String(image).trim(),
          JSON.stringify(Array.isArray(images) ? images : [image]),
          description ? String(description).trim() : '',
          material ? String(material).trim() : '',
          stone ? String(stone).trim() : '',
          size ? String(size).trim() : '',
          inStock ? 1 : 0,
          featured ? 1 : 0
        ).run()

        return jsonResponse({ 
          id: result.meta.last_row_id,
          message: '商品创建成功' 
        }, 201)
      } catch (dbError) {
        console.error('数据库错误:', dbError)
        return errorResponse(`创建商品失败: ${dbError.message}`, 500)
      }
    } catch (error) {
      console.error('创建商品错误:', error)
      return errorResponse(`创建商品失败: ${error.message}`, 500)
    }
  }

  // PUT /api/products/:id - 更新商品（管理员）
  if (request.method === 'PUT' && path.startsWith('/')) {
    // 验证管理员权限
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    const id = path.slice(1)
    try {
      const data = await request.json()
      const {
        name,
        category,
        price,
        originalPrice,
        image,
        images,
        description,
        material,
        stone,
        size,
        inStock,
        featured,
      } = data

      // 检查商品是否存在
      const existing = await env.DB.prepare(
        'SELECT id FROM products WHERE id = ?'
      ).bind(id).first()

      if (!existing) {
        return errorResponse('商品不存在', 404)
      }

      await env.DB.prepare(
        `UPDATE products SET
         name = ?, category = ?, price = ?, originalPrice = ?, image = ?, images = ?,
         description = ?, material = ?, stone = ?, size = ?, inStock = ?, featured = ?
         WHERE id = ?`
      ).bind(
        name,
        category,
        price,
        originalPrice || null,
        image,
        JSON.stringify(images || [image]),
        description || '',
        material || '',
        stone || '',
        size || '',
        inStock ? 1 : 0,
        featured ? 1 : 0,
        id
      ).run()

      return jsonResponse({ 
        id: parseInt(id),
        message: '商品更新成功' 
      })
    } catch (error) {
      return errorResponse(`更新商品失败: ${error.message}`, 500)
    }
  }

  // DELETE /api/products/:id - 删除商品（管理员）
  if (request.method === 'DELETE' && path.startsWith('/')) {
    // 验证管理员权限
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    const id = path.slice(1)
    try {
      // 检查商品是否存在
      const existing = await env.DB.prepare(
        'SELECT id FROM products WHERE id = ?'
      ).bind(id).first()

      if (!existing) {
        return errorResponse('商品不存在', 404)
      }

      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()

      return jsonResponse({ 
        message: '商品删除成功' 
      })
    } catch (error) {
      return errorResponse(`删除商品失败: ${error.message}`, 500)
    }
  }

  return errorResponse('Not Found', 404)
}

/**
 * 分类相关 API
 */
async function handleCategories(request, env) {
  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare(
        'SELECT * FROM categories ORDER BY id ASC'
      ).all()

      return jsonResponse({ categories: results })
    } catch (error) {
      return errorResponse(`获取分类失败: ${error.message}`, 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}

/**
 * 订单相关 API
 */
async function handleOrders(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/orders', '')

  // GET /api/orders - 获取所有订单（管理员）
  if (request.method === 'GET' && path === '') {
    // 验证管理员权限
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    try {
      const { searchParams } = url
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '100')
      const offset = parseInt(searchParams.get('offset') || '0')

      let query = 'SELECT * FROM orders WHERE 1=1'
      const params = []

      if (status) {
        query += ' AND status = ?'
        params.push(status)
      }

      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const { results: orders } = await env.DB.prepare(query).bind(...params).all()

      // 获取每个订单的商品项
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { results: items } = await env.DB.prepare(
            'SELECT * FROM order_items WHERE orderId = ?'
          ).bind(order.id).all()
          return { ...order, items }
        })
      )

      // 获取总数
      let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1'
      const countParams = []
      if (status) {
        countQuery += ' AND status = ?'
        countParams.push(status)
      }
      const { total } = await env.DB.prepare(countQuery).bind(...countParams).first()

      return jsonResponse({ 
        orders: ordersWithItems,
        total: total || 0,
        limit,
        offset
      })
    } catch (error) {
      return errorResponse(`获取订单失败: ${error.message}`, 500)
    }
  }

  // POST /api/orders - 创建订单
  if (request.method === 'POST' && path === '') {
    try {
      const data = await request.json()
      const {
        items,
        total,
        customerName,
        customerPhone,
        customerAddress,
        customerEmail,
      } = data

      if (!items || items.length === 0) {
        return errorResponse('订单商品不能为空', 400)
      }

      // 创建订单
      const orderResult = await env.DB.prepare(
        `INSERT INTO orders 
         (total, customerName, customerPhone, customerAddress, customerEmail, status, createdAt)
         VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`
      ).bind(
        total,
        customerName || null,
        customerPhone || null,
        customerAddress || null,
        customerEmail || null
      ).run()

      const orderId = orderResult.meta.last_row_id

      // 创建订单项
      for (const item of items) {
        await env.DB.prepare(
          `INSERT INTO order_items 
           (orderId, productId, productName, price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          orderId,
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.price * item.quantity
        ).run()
      }

      return jsonResponse({ 
        orderId,
        message: '订单创建成功' 
      }, 201)
    } catch (error) {
      return errorResponse(`创建订单失败: ${error.message}`, 500)
    }
  }

  // GET /api/orders/:id - 获取订单详情
  if (request.method === 'GET' && path.startsWith('/')) {
    const id = path.slice(1)
    
    try {
      const order = await env.DB.prepare(
        'SELECT * FROM orders WHERE id = ?'
      ).bind(id).first()

      if (!order) {
        return errorResponse('订单不存在', 404)
      }

      const { results: items } = await env.DB.prepare(
        'SELECT * FROM order_items WHERE orderId = ?'
      ).bind(id).all()

      return jsonResponse({ 
        order: {
          ...order,
          items,
        }
      })
    } catch (error) {
      return errorResponse(`获取订单失败: ${error.message}`, 500)
    }
  }

  // PUT /api/orders/:id - 更新订单状态（管理员）
  if (request.method === 'PUT' && path.startsWith('/')) {
    // 验证管理员权限
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    const id = path.slice(1)
    try {
      const data = await request.json()
      const { status } = data

      const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
      if (!status || !validStatuses.includes(status)) {
        return errorResponse('无效的订单状态', 400)
      }

      // 检查订单是否存在
      const existing = await env.DB.prepare(
        'SELECT id FROM orders WHERE id = ?'
      ).bind(id).first()

      if (!existing) {
        return errorResponse('订单不存在', 404)
      }

      await env.DB.prepare(
        `UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?`
      ).bind(status, id).run()

      return jsonResponse({ 
        id: parseInt(id),
        status,
        message: '订单状态更新成功' 
      })
    } catch (error) {
      return errorResponse(`更新订单失败: ${error.message}`, 500)
    }
  }

  return errorResponse('Not Found', 404)
}

/**
 * 管理员认证 API
 */
async function handleAdminAuth(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/admin/auth', '')

  // POST /api/admin/auth/login - 管理员登录
  if (request.method === 'POST' && path === '/login') {
    try {
      const data = await request.json()
      const { username, password } = data

      if (!username || !password) {
        return errorResponse('用户名和密码不能为空', 400)
      }

      // 查询管理员用户（注意：生产环境应该使用密码哈希）
      const admin = await env.DB.prepare(
        'SELECT * FROM admin_users WHERE username = ? AND isActive = 1'
      ).bind(username).first()

      if (!admin) {
        return errorResponse('用户名或密码错误', 401)
      }

      // 简单的密码验证（生产环境应该使用bcrypt等哈希算法）
      // 这里为了演示，直接比较明文密码
      if (admin.password_hash !== password) {
        return errorResponse('用户名或密码错误', 401)
      }

      // 生成token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2小时

      // 保存会话
      await env.DB.prepare(
        `INSERT INTO admin_sessions (adminId, token, expiresAt)
         VALUES (?, ?, ?)`
      ).bind(admin.id, token, expiresAt).run()

      // 更新最后登录时间
      await env.DB.prepare(
        `UPDATE admin_users SET lastLogin = datetime('now') WHERE id = ?`
      ).bind(admin.id).run()

      return jsonResponse({
        token,
        username: admin.username,
        role: admin.role,
        expiresAt,
        message: '登录成功'
      })
    } catch (error) {
      return errorResponse(`登录失败: ${error.message}`, 500)
    }
  }

  // POST /api/admin/auth/logout - 登出
  if (request.method === 'POST' && path === '/logout') {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run()
      } catch (error) {
        console.error('登出失败:', error)
      }
    }
    return jsonResponse({ message: '登出成功' })
  }

  // GET /api/admin/auth/verify - 验证token
  if (request.method === 'GET' && path === '/verify') {
    const admin = await verifyAdminToken(request, env)
    if (!admin) {
      return errorResponse('Token无效或已过期', 401)
    }
    return jsonResponse({ 
      valid: true,
      username: admin.username,
      role: admin.role
    })
  }

  return errorResponse('Not Found', 404)
}

/**
 * 统计信息 API（管理员）
 */
async function handleAdminStats(request, env) {
  // 验证管理员权限
  const authResult = await requireAuth(request, env)
  if (authResult.error) return authResult.error

  try {
    // 获取商品总数
    const { totalProducts } = await env.DB.prepare(
      'SELECT COUNT(*) as totalProducts FROM products'
    ).first()

    // 获取订单总数
    const { totalOrders } = await env.DB.prepare(
      'SELECT COUNT(*) as totalOrders FROM orders'
    ).first()

    // 获取总销售额
    const { totalRevenue } = await env.DB.prepare(
      'SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE status != "cancelled"'
    ).first()

    // 获取待处理订单数
    const { pendingOrders } = await env.DB.prepare(
      'SELECT COUNT(*) as pendingOrders FROM orders WHERE status = "pending"'
    ).first()

    return jsonResponse({
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: totalRevenue || 0,
      pendingOrders: pendingOrders || 0,
    })
  } catch (error) {
    return errorResponse(`获取统计信息失败: ${error.message}`, 500)
  }
}

/**
 * 主处理函数
 */
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
    const corsResponse = handleCORS(request)
    if (corsResponse) return corsResponse

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // 路由分发
      if (path.startsWith('/api/products')) {
        return await handleProducts(request, env)
      } else if (path.startsWith('/api/categories')) {
        return await handleCategories(request, env)
      } else if (path.startsWith('/api/orders')) {
        return await handleOrders(request, env)
      } else if (path.startsWith('/api/admin/auth')) {
        return await handleAdminAuth(request, env)
      } else if (path === '/api/admin/stats') {
        return await handleAdminStats(request, env)
      } else if (path === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
      } else {
        return errorResponse('Not Found', 404)
      }
    } catch (error) {
      return errorResponse(`服务器错误: ${error.message}`, 500)
    }
  },
}

