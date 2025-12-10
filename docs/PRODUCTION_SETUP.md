# 生产环境商家后台配置指南

## 📋 概述

本文档说明如何配置和部署生产环境的商家后台管理系统。

## 🔐 管理员认证

### 数据库设置

1. **运行管理员用户表迁移**：
   ```bash
   cd backend
   npx wrangler d1 execute jewelry-db --file=./migrations/0002_admin_users.sql
   ```

2. **默认管理员账户**：
   - 用户名: `admin`
   - 密码: `admin123`
   - ⚠️ **重要**: 生产环境部署后，请立即更改默认密码！

### API 端点

#### 管理员认证
- `POST /api/admin/auth/login` - 管理员登录
- `POST /api/admin/auth/logout` - 登出
- `GET /api/admin/auth/verify` - 验证token

#### 管理员统计
- `GET /api/admin/stats` - 获取统计数据（需要认证）

#### 订单管理（需要认证）
- `GET /api/orders` - 获取所有订单
- `PUT /api/orders/:id` - 更新订单状态

#### 商品管理（需要认证）
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

## 🚀 部署步骤

### 1. 数据库迁移

```bash
cd backend

# 运行初始数据库迁移
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql

# 运行管理员用户表迁移
npx wrangler d1 execute jewelry-db --file=./migrations/0002_admin_users.sql
```

### 2. 配置环境变量

在 `backend/wrangler.toml` 中确保生产环境配置：

```toml
[vars]
ENVIRONMENT = "production"
```

### 3. 部署后端

```bash
cd backend
npm run wrangler:deploy
# 或
npx wrangler deploy
```

部署成功后，记录下 Workers URL（例如：`https://jewelry-app-api.your-subdomain.workers.dev`）

### 4. 配置前端环境变量

创建 `frontend/.env.production`：

```env
VITE_API_URL=https://jewelry-app-api.your-subdomain.workers.dev
VITE_WHATSAPP_PHONE=8613800138000
```

### 5. 构建和部署前端

```bash
cd frontend
npm run build
```

将 `dist` 目录部署到静态托管服务（如 Cloudflare Pages, Vercel, Netlify 等）

## 🔒 安全建议

### 1. 更改默认密码

生产环境部署后，立即更改默认管理员密码：

```sql
-- 使用SQL更新密码（注意：实际应该使用密码哈希）
UPDATE admin_users 
SET password_hash = 'your_secure_password_hash' 
WHERE username = 'admin';
```

### 2. 密码哈希

当前实现使用明文密码比较（仅用于演示）。生产环境应该：

1. 使用 bcrypt 或类似库进行密码哈希
2. 在 Cloudflare Workers 中使用 Web Crypto API 进行密码验证
3. 或使用 Cloudflare Workers 的 KV 存储配合外部认证服务

### 3. Token 安全

- Token 存储在 localStorage 中，有效期为 2 小时
- Token 过期后需要重新登录
- 建议在生产环境使用更短的过期时间（如 30 分钟）

### 4. CORS 配置

当前 CORS 设置为允许所有来源（`*`）。生产环境应该：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-frontend-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

### 5. HTTPS

确保所有通信都通过 HTTPS 进行。

## 📊 管理员功能

### 登录
访问 `/admin/login`，使用管理员账户登录。

### 后台功能
- **商品管理**: 添加、编辑、删除商品
- **订单管理**: 查看所有订单，更新订单状态
- **分类管理**: 管理商品分类
- **统计信息**: 查看商品总数、订单总数、销售额等

## 🔧 故障排除

### 登录失败
1. 检查数据库迁移是否成功运行
2. 确认管理员用户已创建
3. 检查后端 API 是否正常运行
4. 查看浏览器控制台的错误信息

### API 401 错误
- Token 可能已过期，需要重新登录
- 检查 Authorization header 是否正确设置

### 数据库连接问题
- 确认 `wrangler.toml` 中的数据库 ID 正确
- 检查 Cloudflare 账户权限

## 📝 注意事项

1. **密码安全**: 当前使用明文密码，仅用于演示。生产环境必须使用密码哈希。
2. **Token 存储**: Token 存储在 localStorage，注意 XSS 攻击风险。
3. **数据库备份**: 定期备份 D1 数据库。
4. **监控**: 建议设置 API 监控和错误日志。

## 🎯 下一步

1. ✅ 更改默认管理员密码
2. ✅ 配置生产环境 CORS
3. ✅ 实施密码哈希
4. ✅ 设置监控和日志
5. ✅ 配置数据库备份

