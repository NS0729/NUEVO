/**
 * Cloudflare Workers API for Jewelry App
 * Usa la base de datos D1 para almacenar datos de productos y pedidos
 */

// Configuración CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Manejar solicitudes CORS preflight
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
}

// Formato de respuesta unificado
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// Respuesta de error
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status)
}

/**
 * Generar token
 */
function generateToken() {
  return 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

/**
 * Verificar token de administrador
 */
async function verifyAdminToken(request, env) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('⚠️ Verificación de token fallida: No se encontró el encabezado Authorization o el formato es incorrecto')
    return null
  }

  const token = authHeader.substring(7)
  console.log('🔍 Verificando Token:', token.substring(0, 20) + '...')
  
  try {
    // Verificar si el token es válido y no ha expirado
    const session = await env.DB.prepare(
      `SELECT s.*, u.username, u.role, u.isActive 
       FROM admin_sessions s
       JOIN admin_users u ON s.adminId = u.id
       WHERE s.token = ? AND s.expiresAt > datetime('now') AND u.isActive = 1`
    ).bind(token).first()

    if (!session) {
      console.log('⚠️ Verificación de token fallida: No se encontró sesión válida o ha expirado')
      // Depuración: verificar si existe el token pero ha expirado
      const expiredSession = await env.DB.prepare(
        `SELECT s.* FROM admin_sessions s WHERE s.token = ?`
      ).bind(token).first()
      if (expiredSession) {
        console.log('⚠️ El token existe pero ha expirado, tiempo de expiración:', expiredSession.expiresAt)
      } else {
        console.log('⚠️ El token no existe en la base de datos')
      }
      return null
    }

    console.log('✅ Verificación de token exitosa:', session.username)
    return {
      adminId: session.adminId,
      username: session.username,
      role: session.role,
    }
  } catch (error) {
    console.error('❌ Error en la verificación de token:', error)
    return null
  }
}

/**
 * Middleware de verificación de permisos
 */
async function requireAuth(request, env) {
  const admin = await verifyAdminToken(request, env)
  if (!admin) {
    return { error: errorResponse('Acceso no autorizado', 401) }
  }
  return { admin }
}

/**
 * API relacionada con productos
 */
async function handleProducts(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/products', '')

  // GET /api/products - Obtener todos los productos
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
      
      // Procesar array de imágenes
      const products = results.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [product.image],
        featured: product.featured === 1,
        inStock: product.inStock === 1,
      }))

      return jsonResponse({ products })
    } catch (error) {
      return errorResponse(`Error al obtener productos: ${error.message}`, 500)
    }
  }

  // GET /api/products/:id - Obtener un producto individual
  if (request.method === 'GET' && path.startsWith('/')) {
    const id = path.slice(1)
    
    try {
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE id = ?'
      ).bind(id).first()

      if (!product) {
        return errorResponse('Producto no encontrado', 404)
      }

      // Procesar array de imágenes
      const result = {
        ...product,
        images: product.images ? JSON.parse(product.images) : [product.image],
        featured: product.featured === 1,
        inStock: product.inStock === 1,
      }

      return jsonResponse({ product: result })
    } catch (error) {
      return errorResponse(`Error al obtener producto: ${error.message}`, 500)
    }
  }

  // POST /api/products - Crear producto (administrador)
  if (request.method === 'POST' && path === '') {
    // Verificar permisos de administrador
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

      // Validar campos requeridos
      if (!name || !category || price === undefined || price === null || !image) {
        return errorResponse('Campos requeridos faltantes: name, category, price, image', 400)
      }

      // Asegurar que el precio sea un número
      const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price)
      if (isNaN(priceNum) || priceNum < 0) {
        return errorResponse('El precio debe ser un número positivo válido', 400)
      }

      const originalPriceNum = originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : Number(originalPrice)) : null
      if (originalPriceNum !== null && (isNaN(originalPriceNum) || originalPriceNum < 0)) {
        return errorResponse('El precio original debe ser un número positivo válido', 400)
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
          message: 'Producto creado exitosamente' 
        }, 201)
      } catch (dbError) {
        console.error('Error de base de datos:', dbError)
        return errorResponse(`Error al crear producto: ${dbError.message}`, 500)
      }
    } catch (error) {
      console.error('Error al crear producto:', error)
      return errorResponse(`Error al crear producto: ${error.message}`, 500)
    }
  }

  // PUT /api/products/:id - Actualizar producto (administrador)
  if (request.method === 'PUT' && path.startsWith('/')) {
    // Verificar permisos de administrador
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

      // Verificar si el producto existe
      const existing = await env.DB.prepare(
        'SELECT id FROM products WHERE id = ?'
      ).bind(id).first()

      if (!existing) {
        return errorResponse('Producto no encontrado', 404)
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
        message: 'Producto actualizado exitosamente' 
      })
    } catch (error) {
      return errorResponse(`Error al actualizar producto: ${error.message}`, 500)
    }
  }

  // DELETE /api/products/:id - Eliminar producto (administrador)
  if (request.method === 'DELETE' && path.startsWith('/')) {
    // Verificar permisos de administrador
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    const id = path.slice(1)
    try {
      // Verificar si el producto existe
      const existing = await env.DB.prepare(
        'SELECT id FROM products WHERE id = ?'
      ).bind(id).first()

      if (!existing) {
        return errorResponse('Producto no encontrado', 404)
      }

      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()

      return jsonResponse({ 
        message: 'Producto eliminado exitosamente' 
      })
    } catch (error) {
      return errorResponse(`Error al eliminar producto: ${error.message}`, 500)
    }
  }

  return errorResponse('Not Found', 404)
}

/**
 * API relacionada con categorías
 */
async function handleCategories(request, env) {
  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare(
        'SELECT * FROM categories ORDER BY id ASC'
      ).all()

      return jsonResponse({ categories: results })
    } catch (error) {
      return errorResponse(`Error al obtener categorías: ${error.message}`, 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}

/**
 * API relacionada con pedidos
 */
async function handleOrders(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/orders', '')

  // GET /api/orders - Obtener todos los pedidos (administrador)
  if (request.method === 'GET' && path === '') {
    // Verificar permisos de administrador
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

      // Obtener los artículos de cada pedido
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { results: items } = await env.DB.prepare(
            'SELECT * FROM order_items WHERE orderId = ?'
          ).bind(order.id).all()
          return { ...order, items }
        })
      )

      // Obtener el total
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
      return errorResponse(`Error al obtener pedidos: ${error.message}`, 500)
    }
  }

  // POST /api/orders - Crear pedido
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
        return errorResponse('Los productos del pedido no pueden estar vacíos', 400)
      }

      // Crear pedido
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

      // Crear artículos del pedido
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
        message: 'Pedido creado exitosamente' 
      }, 201)
    } catch (error) {
      return errorResponse(`Error al crear pedido: ${error.message}`, 500)
    }
  }

  // GET /api/orders/:id - Obtener detalles del pedido
  if (request.method === 'GET' && path.startsWith('/')) {
    const id = path.slice(1)
    
    try {
      const order = await env.DB.prepare(
        'SELECT * FROM orders WHERE id = ?'
      ).bind(id).first()

      if (!order) {
        return errorResponse('Pedido no encontrado', 404)
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
      return errorResponse(`Error al obtener pedido: ${error.message}`, 500)
    }
  }

  // PUT /api/orders/:id - Actualizar estado del pedido (administrador)
  if (request.method === 'PUT' && path.startsWith('/')) {
    // Verificar permisos de administrador
    const authResult = await requireAuth(request, env)
    if (authResult.error) return authResult.error

    const id = path.slice(1)
    try {
      const data = await request.json()
      const { status } = data

      const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
      if (!status || !validStatuses.includes(status)) {
        return errorResponse('Estado de pedido inválido', 400)
      }

      // Verificar si el pedido existe
      const existing = await env.DB.prepare(
        'SELECT id FROM orders WHERE id = ?'
      ).bind(id).first()

      if (!existing) {
        return errorResponse('Pedido no encontrado', 404)
      }

      await env.DB.prepare(
        `UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?`
      ).bind(status, id).run()

      return jsonResponse({ 
        id: parseInt(id),
        status,
        message: 'Estado del pedido actualizado exitosamente' 
      })
    } catch (error) {
      return errorResponse(`Error al actualizar pedido: ${error.message}`, 500)
    }
  }

  return errorResponse('Not Found', 404)
}

/**
 * API de autenticación de administrador
 */
async function handleAdminAuth(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/admin/auth', '')

  // POST /api/admin/auth/login - Inicio de sesión de administrador
  if (request.method === 'POST' && path === '/login') {
    try {
      const data = await request.json()
      const { username, password } = data

      if (!username || !password) {
        return errorResponse('El nombre de usuario y la contraseña no pueden estar vacíos', 400)
      }

      // Consultar usuario administrador (nota: en producción se debe usar hash de contraseña)
      const admin = await env.DB.prepare(
        'SELECT * FROM admin_users WHERE username = ? AND isActive = 1'
      ).bind(username).first()

      if (!admin) {
        return errorResponse('Nombre de usuario o contraseña incorrectos', 401)
      }

      // Verificación simple de contraseña (en producción se debe usar algoritmo de hash como bcrypt)
      // Aquí para demostración, se compara directamente la contraseña en texto plano
      if (admin.password_hash !== password) {
        return errorResponse('Nombre de usuario o contraseña incorrectos', 401)
      }

      // Generar token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 horas

      // Guardar sesión
      await env.DB.prepare(
        `INSERT INTO admin_sessions (adminId, token, expiresAt)
         VALUES (?, ?, ?)`
      ).bind(admin.id, token, expiresAt).run()

      // Actualizar último tiempo de inicio de sesión
      await env.DB.prepare(
        `UPDATE admin_users SET lastLogin = datetime('now') WHERE id = ?`
      ).bind(admin.id).run()

      return jsonResponse({
        token,
        username: admin.username,
        role: admin.role,
        expiresAt,
        message: 'Inicio de sesión exitoso'
      })
    } catch (error) {
      return errorResponse(`Error en el inicio de sesión: ${error.message}`, 500)
    }
  }

  // POST /api/admin/auth/logout - Cerrar sesión
  if (request.method === 'POST' && path === '/logout') {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run()
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }
    return jsonResponse({ message: 'Cierre de sesión exitoso' })
  }

  // GET /api/admin/auth/verify - Verificar token
  if (request.method === 'GET' && path === '/verify') {
    const admin = await verifyAdminToken(request, env)
    if (!admin) {
      return errorResponse('Token inválido o expirado', 401)
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
 * API de estadísticas (administrador)
 */
async function handleAdminStats(request, env) {
  // Verificar permisos de administrador
  const authResult = await requireAuth(request, env)
  if (authResult.error) return authResult.error

  try {
    // Obtener total de productos
    const { totalProducts } = await env.DB.prepare(
      'SELECT COUNT(*) as totalProducts FROM products'
    ).first()

    // Obtener total de pedidos
    const { totalOrders } = await env.DB.prepare(
      'SELECT COUNT(*) as totalOrders FROM orders'
    ).first()

    // Obtener ingresos totales
    const { totalRevenue } = await env.DB.prepare(
      'SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE status != "cancelled"'
    ).first()

    // Obtener número de pedidos pendientes
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
    return errorResponse(`Error al obtener estadísticas: ${error.message}`, 500)
  }
}

/**
 * Función principal de manejo
 */
export default {
  async fetch(request, env, ctx) {
    // Manejar CORS
    const corsResponse = handleCORS(request)
    if (corsResponse) return corsResponse

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Distribución de rutas
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
      return errorResponse(`Error del servidor: ${error.message}`, 500)
    }
  },
}

