# 后端设置指南

## 步骤 1: 登录 Cloudflare

首先需要登录 Cloudflare 账户：

```bash
npx wrangler login
```

这会打开浏览器，让你登录 Cloudflare 账户。

## 步骤 2: 创建 D1 数据库

创建数据库：

```bash
npx wrangler d1 create jewelry-db
```

**重要：** 命令执行后会返回类似这样的输出：
```
✅ Successfully created DB 'jewelry-db'!

[[d1_databases]]
binding = "DB"
database_name = "jewelry-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← 复制这个 ID
```

**复制 `database_id`，然后更新 `wrangler.toml` 文件中的 `database_id`。**

## 步骤 3: 更新 wrangler.toml

打开 `wrangler.toml` 文件，将两处 `your-database-id-here` 替换为实际的 `database_id`：

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换这里
```

和

```toml
[env.development]
[[env.development.d1_databases]]
binding = "DB"
database_name = "jewelry-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换这里
```

## 步骤 4: 运行数据库迁移

创建数据库表结构：

```bash
npm run db:migrate
```

或者：

```bash
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql
```

## 步骤 5: 启动开发服务器

```bash
npm run wrangler:dev
```

或者：

```bash
npx wrangler dev
```

后端 API 将在 `http://localhost:8787` 运行。

## 步骤 6: 测试 API

打开浏览器访问：
- `http://localhost:8787/api/health` - 健康检查
- `http://localhost:8787/api/products` - 获取所有商品
- `http://localhost:8787/api/categories` - 获取所有分类

## 步骤 7: 配置前端环境变量

创建 `.env` 文件（如果还没有）：

```env
VITE_API_URL=http://localhost:8787
VITE_WHATSAPP_PHONE=8613800138000
```

## 部署到生产环境

当准备好部署时：

```bash
npm run wrangler:deploy
```

或者：

```bash
npx wrangler deploy
```

部署后，更新 `.env` 文件中的 `VITE_API_URL` 为实际的 Workers URL。

## 常见问题

### 1. 数据库连接失败
- 确保已更新 `wrangler.toml` 中的 `database_id`
- 确保已运行数据库迁移

### 2. CORS 错误
- 检查 `src/index.js` 中的 CORS 配置
- 确保前端请求的 URL 正确

### 3. 404 错误
- 检查 API 路由路径是否正确
- 确认 Workers 已正确部署

## 下一步

设置完成后，可以：
1. 测试 API 端点
2. 更新前端代码以使用 API
3. 部署到生产环境

