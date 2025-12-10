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
      if (!name || !category || !price || !image) {
        return errorResponse('缺少必填字段：name, category, price, image', 400)
      }

      const result = await env.DB.prepare(
        `INSERT INTO products 
         (name, category, price, originalPrice, image, images, description, material, stone, size, inStock, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        featured ? 1 : 0
      ).run()

      return jsonResponse({ 
        id: result.meta.last_row_id,
        message: '商品创建成功' 
      }, 201)
    } catch (error) {
      return errorResponse(`创建商品失败: ${error.message}`, 500)
    }
  }

  // PUT /api/products/:id - 更新商品（管理员）
  if (request.method === 'PUT' && path.startsWith('/')) {
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

  return errorResponse('Not Found', 404)
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

