# 数据库位置说明

## 📍 数据库位置

### D1 数据库是云端数据库

**重要：** D1 是 Cloudflare 的云端 SQLite 数据库，**不是本地文件**。数据存储在 Cloudflare 的服务器上。

### 数据库信息

- **数据库名称**: `jewelry-db`
- **数据库 ID**: `1330c379-effa-43b0-a87e-9a232e7eff57`
- **位置**: Cloudflare 云端（区域：ENAM - 北美东部）
- **类型**: SQLite（通过 D1 服务）

## 🔄 本地开发数据库

### 本地副本位置

当运行 `wrangler dev` 时，Wrangler 会在本地创建数据库副本用于开发：

**Windows 路径**:
```
.wrangler/state/v3/d1/
```

**完整路径示例**:
```
C:\App\NUEVO\.wrangler\state\v3\d1\1330c379-effa-43b0-a87e-9a232e7eff57\
```

### 本地数据库说明

- ✅ 本地数据库是**开发副本**，用于快速开发测试
- ✅ 本地修改**不会自动同步**到云端
- ✅ 云端数据库是**生产数据**，需要手动同步

## 📊 查看数据库内容

### 1. 查看本地数据库

```bash
# 查看商品
npx wrangler d1 execute jewelry-db --command="SELECT * FROM products"

# 查看分类
npx wrangler d1 execute jewelry-db --command="SELECT * FROM categories"

# 查看订单
npx wrangler d1 execute jewelry-db --command="SELECT * FROM orders"
```

### 2. 查看远程（云端）数据库

```bash
# 添加 --remote 标志
npx wrangler d1 execute jewelry-db --command="SELECT * FROM products" --remote

# 查看分类
npx wrangler d1 execute jewelry-db --command="SELECT * FROM categories" --remote
```

### 3. 查看数据库信息

```bash
# 查看数据库列表
npx wrangler d1 list

# 查看特定数据库信息
npx wrangler d1 info jewelry-db
```

## 🌐 云端数据库访问

### Cloudflare Dashboard

1. 登录 https://dash.cloudflare.com
2. 进入 **Workers & Pages** → **D1**
3. 找到 `jewelry-db` 数据库
4. 可以在网页界面查看和管理数据

### 数据库 URL

数据库通过 Cloudflare Workers 访问，不是直接 URL。需要通过 API 访问：

- **开发环境**: `http://localhost:8787/api/products`
- **生产环境**: `https://your-worker.workers.dev/api/products`

## 📁 数据库文件结构

### 表结构

数据库包含以下表：

1. **categories** - 分类表
   - id, name, icon, createdAt

2. **products** - 商品表
   - id, name, category, price, originalPrice, image, images, description, material, stone, size, inStock, featured, createdAt, updatedAt

3. **orders** - 订单表
   - id, total, customerName, customerPhone, customerAddress, customerEmail, status, createdAt, updatedAt

4. **order_items** - 订单项表
   - id, orderId, productId, productName, price, quantity, subtotal, createdAt

## 🔧 数据库操作

### 同步到云端

```bash
# 运行迁移到远程数据库
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql --remote
```

### 备份数据库

```bash
# 导出数据（本地）
npx wrangler d1 execute jewelry-db --command="SELECT * FROM products" > products_backup.json

# 导出数据（远程）
npx wrangler d1 execute jewelry-db --command="SELECT * FROM products" --remote > products_backup.json
```

## 📝 总结

- **云端数据库**: Cloudflare D1（主要数据存储）
- **本地数据库**: `.wrangler/state/v3/d1/`（开发副本）
- **访问方式**: 通过 API (`/api/products` 等) 或 Wrangler CLI
- **管理界面**: Cloudflare Dashboard

数据库是**云端服务**，不需要担心本地文件管理！

