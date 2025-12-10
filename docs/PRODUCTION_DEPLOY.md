# 🚀 生产环境快速部署指南

## 前置要求

- Cloudflare 账户
- Node.js 和 npm 已安装
- Wrangler CLI 已安装 (`npm install -g wrangler`)

## 步骤 1: 数据库迁移

```bash
cd backend

# 运行初始数据库迁移
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql

# 运行管理员用户表迁移
npx wrangler d1 execute jewelry-db --file=./migrations/0002_admin_users.sql
```

## 步骤 2: 部署后端

```bash
cd backend

# 登录 Cloudflare（如果还没有）
npx wrangler login

# 部署到生产环境
npx wrangler deploy
```

部署成功后，记录 Workers URL（例如：`https://jewelry-app-api.your-subdomain.workers.dev`）

## 步骤 3: 配置前端

创建 `frontend/.env.production`：

```env
VITE_API_URL=https://jewelry-app-api.your-subdomain.workers.dev
VITE_WHATSAPP_PHONE=8613800138000
```

## 步骤 4: 构建前端

```bash
cd frontend
npm run build
```

## 步骤 5: 部署前端

将 `frontend/dist` 目录部署到静态托管服务：

### Cloudflare Pages
1. 登录 Cloudflare Dashboard
2. 进入 Pages
3. 创建新项目
4. 上传 `dist` 目录或连接 Git 仓库

### Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

## 步骤 6: 访问后台

访问 `https://your-frontend-domain.com/admin/login`

**默认登录信息**：
- 用户名: `admin`
- 密码: `admin123`

⚠️ **重要**: 部署后立即更改默认密码！

## 🔒 安全检查清单

- [ ] 更改默认管理员密码
- [ ] 配置生产环境 CORS（限制允许的来源）
- [ ] 启用 HTTPS
- [ ] 设置数据库备份
- [ ] 配置监控和日志
- [ ] 实施密码哈希（当前为演示版本）

## 📊 验证部署

1. **健康检查**: `https://your-api-domain.workers.dev/api/health`
2. **登录测试**: 访问后台登录页面
3. **API 测试**: 使用 Postman 或 curl 测试 API 端点

## 🆘 故障排除

### 登录失败
- 检查数据库迁移是否成功
- 确认管理员用户已创建
- 查看 Workers 日志

### CORS 错误
- 检查 `corsHeaders` 配置
- 确认前端 URL 已添加到允许列表

### 数据库连接失败
- 检查 `wrangler.toml` 中的数据库 ID
- 确认 Cloudflare 账户权限

## 📞 支持

如有问题，请查看：
- [生产环境配置指南](./PRODUCTION_SETUP.md)
- [后端设置指南](./SETUP_BACKEND.md)

