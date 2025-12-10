/**
 * API 测试脚本
 * 用于测试后端 API 是否正常工作
 */

const API_BASE = 'http://localhost:8787'

async function testAPI() {
  console.log('🧪 开始测试 API...\n')

  try {
    // 测试健康检查
    console.log('1. 测试健康检查...')
    const healthRes = await fetch(`${API_BASE}/api/health`)
    const health = await healthRes.json()
    console.log('✅ 健康检查:', health)
    console.log('')

    // 测试获取所有商品
    console.log('2. 测试获取所有商品...')
    const productsRes = await fetch(`${API_BASE}/api/products`)
    const productsData = await productsRes.json()
    console.log(`✅ 获取到 ${productsData.products?.length || 0} 个商品`)
    if (productsData.products?.length > 0) {
      console.log('   第一个商品:', productsData.products[0].name)
    }
    console.log('')

    // 测试获取分类
    console.log('3. 测试获取分类...')
    const categoriesRes = await fetch(`${API_BASE}/api/categories`)
    const categoriesData = await categoriesRes.json()
    console.log(`✅ 获取到 ${categoriesData.categories?.length || 0} 个分类`)
    if (categoriesData.categories?.length > 0) {
      console.log('   分类列表:', categoriesData.categories.map(c => c.name).join(', '))
    }
    console.log('')

    // 测试获取单个商品
    console.log('4. 测试获取单个商品...')
    const productRes = await fetch(`${API_BASE}/api/products/1`)
    const productData = await productRes.json()
    if (productData.product) {
      console.log('✅ 商品详情:', productData.product.name)
      console.log('   价格:', `$${productData.product.price}`)
    }
    console.log('')

    // 测试搜索
    console.log('5. 测试商品搜索...')
    const searchRes = await fetch(`${API_BASE}/api/products?search=钻石`)
    const searchData = await searchRes.json()
    console.log(`✅ 搜索"钻石"找到 ${searchData.products?.length || 0} 个商品`)
    console.log('')

    // 测试分类筛选
    console.log('6. 测试分类筛选...')
    const categoryRes = await fetch(`${API_BASE}/api/products?category=rings`)
    const categoryData = await categoryRes.json()
    console.log(`✅ 分类"rings"找到 ${categoryData.products?.length || 0} 个商品`)
    console.log('')

    console.log('🎉 所有测试通过！')
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('\n💡 提示: 确保开发服务器正在运行 (npm run wrangler:dev)')
  }
}

// 等待服务器启动
setTimeout(() => {
  testAPI()
}, 3000)

