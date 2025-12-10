# 后端 API 文档 - Cloudflare Workers + D1

## 概述

本项目使用 Cloudflare Workers 作为后端 API，D1 数据库存储数据。

## 技术栈

- **Cloudflare Workers** - 边缘计算平台
- **D1 Database** - Cloudflare 的 SQLite 数据库
- **Wrangler** - Cloudflare Workers 开发工具

## 安装和设置

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

或者使用 npm：

```bash
npm install --save-dev wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

```bash
wrangler d1 create jewelry-db
```

创建成功后，会返回 `database_id`，将其复制到 `wrangler.toml` 文件中。

### 4. 运行数据库迁移

```bash
wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql
```

### 5. 开发环境运行

```bash
wrangler dev
```

### 6. 部署到生产环境

```bash
wrangler deploy
```

## API 端点

### 商品 API

#### GET /api/products
获取所有商品

**查询参数：**
- `category` (可选) - 分类ID
- `featured` (可选) - 是否精选 (true/false)
- `search` (可选) - 搜索关键词

**示例：**
```bash
GET /api/products
GET /api/products?category=rings
GET /api/products?featured=true
GET /api/products?search=钻石
```

**响应：**
```json
{
  "products": [
    {
      "id": 1,
      "name": "经典钻石戒指",
      "category": "rings",
      "price": 12999,
      "originalPrice": 15999,
      "image": "https://...",
      "images": ["https://..."],
      "description": "...",
      "material": "18K白金",
      "stone": "1.5克拉钻石",
      "size": "可定制",
      "inStock": true,
      "featured": true
    }
  ]
}
```

#### GET /api/products/:id
获取单个商品详情

**响应：**
```json
{
  "product": {
    "id": 1,
    "name": "经典钻石戒指",
    ...
  }
}
```

#### POST /api/products
创建新商品（管理员）

**请求体：**
```json
{
  "name": "商品名称",
  "category": "rings",
  "price": 12999,
  "originalPrice": 15999,
  "image": "https://...",
  "images": ["https://..."],
  "description": "商品描述",
  "material": "18K白金",
  "stone": "1.5克拉钻石",
  "size": "可定制",
  "inStock": true,
  "featured": false
}
```

### 分类 API

#### GET /api/categories
获取所有分类

**响应：**
```json
{
  "categories": [
    {
      "id": "rings",
      "name": "戒指",
      "icon": "💍"
    }
  ]
}
```

### 订单 API

#### POST /api/orders
创建订单

**请求体：**
```json
{
  "items": [
    {
      "id": 1,
      "name": "经典钻石戒指",
      "price": 12999,
      "quantity": 2
    }
  ],
  "total": 25998,
  "customerName": "张三",
  "customerPhone": "13800138000",
  "customerAddress": "北京市朝阳区...",
  "customerEmail": "customer@example.com"
}
```

**响应：**
```json
{
  "orderId": 1,
  "message": "订单创建成功"
}
```

#### GET /api/orders/:id
获取订单详情

**响应：**
```json
{
  "order": {
    "id": 1,
    "total": 25998,
    "status": "pending",
    "customerName": "张三",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "经典钻石戒指",
        "price": 12999,
        "quantity": 2,
        "subtotal": 25998
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 健康检查

#### GET /api/health
检查 API 状态

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 数据库结构

### categories 表
- `id` (TEXT, PRIMARY KEY) - 分类ID
- `name` (TEXT) - 分类名称
- `icon` (TEXT) - 图标
- `createdAt` (DATETIME) - 创建时间

### products 表
- `id` (INTEGER, PRIMARY KEY) - 商品ID
- `name` (TEXT) - 商品名称
- `category` (TEXT) - 分类ID
- `price` (REAL) - 价格
- `originalPrice` (REAL) - 原价
- `image` (TEXT) - 主图
- `images` (TEXT) - 图片数组（JSON字符串）
- `description` (TEXT) - 描述
- `material` (TEXT) - 材质
- `stone` (TEXT) - 主石
- `size` (TEXT) - 尺寸
- `inStock` (INTEGER) - 是否有货 (0/1)
- `featured` (INTEGER) - 是否精选 (0/1)
- `createdAt` (DATETIME) - 创建时间
- `updatedAt` (DATETIME) - 更新时间

### orders 表
- `id` (INTEGER, PRIMARY KEY) - 订单ID
- `total` (REAL) - 订单总额
- `customerName` (TEXT) - 客户姓名
- `customerPhone` (TEXT) - 客户电话
- `customerAddress` (TEXT) - 客户地址
- `customerEmail` (TEXT) - 客户邮箱
- `status` (TEXT) - 订单状态 (pending/confirmed/shipped/completed/cancelled)
- `createdAt` (DATETIME) - 创建时间
- `updatedAt` (DATETIME) - 更新时间

### order_items 表
- `id` (INTEGER, PRIMARY KEY) - 订单项ID
- `orderId` (INTEGER) - 订单ID
- `productId` (INTEGER) - 商品ID
- `productName` (TEXT) - 商品名称
- `price` (REAL) - 单价
- `quantity` (INTEGER) - 数量
- `subtotal` (REAL) - 小计
- `createdAt` (DATETIME) - 创建时间

## 环境变量

在 `wrangler.toml` 中配置：

```toml
[vars]
ENVIRONMENT = "production"
```

在前端 `.env` 文件中配置：

```env
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

## 开发工作流

1. **本地开发：**
   ```bash
   wrangler dev
   ```

2. **运行迁移：**
   ```bash
   wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql
   ```

3. **查看数据库：**
   ```bash
   wrangler d1 execute jewelry-db --command="SELECT * FROM products"
   ```

4. **部署：**
   ```bash
   wrangler deploy
   ```

## 注意事项

1. 创建 D1 数据库后，记得更新 `wrangler.toml` 中的 `database_id`
2. 生产环境部署前，确保运行了所有数据库迁移
3. API 支持 CORS，允许跨域请求
4. 订单状态：pending → confirmed → shipped → completed

## 故障排除

### 数据库连接失败
- 检查 `wrangler.toml` 中的数据库配置
- 确认已创建数据库并运行迁移

### CORS 错误
- 检查 `corsHeaders` 配置
- 确认前端请求的域名

### 404 错误
- 检查路由路径是否正确
- 确认 Workers 已正确部署

