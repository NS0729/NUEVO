# 🔧 修复生产环境 API URL 问题

## 问题描述

生产环境前端（`https://mundo.guacara.app`）仍然尝试访问 `http://localhost:8787`，导致 CORS 错误和连接失败。

**错误信息：**
```
Access to fetch at 'http://localhost:8787/api/products' from origin 'https://mundo.guacara.app' 
has been blocked by CORS policy
```

## 问题原因

前端在生产环境构建时没有正确使用 `.env.production` 文件中的 `VITE_API_URL` 环境变量，导致使用了默认的 `localhost:8787`。

## 解决方案

### ✅ 已完成的修复

1. **验证 Workers URL**
   - Workers URL: `https://jewelry-app-api.fengzhihong1994.workers.dev`
   - ✅ 已验证该 URL 可以正常访问

2. **确认环境变量配置**
   - 文件: `frontend/.env.production`
   - 内容:
     ```env
     VITE_API_URL=https://jewelry-app-api.fengzhihong1994.workers.dev
     VITE_WHATSAPP_PHONE=8613800138000
     ```

3. **重新构建前端**
   - ✅ 已使用正确的环境变量重新构建
   - 构建输出: `frontend/dist`

## 下一步操作

### 1. 重新部署前端

将新构建的 `frontend/dist` 目录重新部署到您的静态托管服务：

#### Cloudflare Pages
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Pages**
3. 找到您的项目（`mundo.guacara.app`）
4. 上传新的 `dist` 目录或触发重新部署

#### 其他静态托管服务
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`

### 2. 清除浏览器缓存

部署后，清除浏览器缓存以确保加载新版本：

1. **硬刷新**：
   - Windows/Linux: `Ctrl + Shift + R` 或 `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **清除缓存**：
   - 打开开发者工具 (F12)
   - 右键点击刷新按钮
   - 选择"清空缓存并硬性重新加载"

### 3. 验证修复

访问以下 URL 验证修复是否成功：

- **前端**: https://mundo.guacara.app
- **后台登录**: https://mundo.guacara.app/admin/login
  - 用户名: `admin`
  - 密码: `admin123`

**检查项：**
- ✅ 页面正常加载，无 CORS 错误
- ✅ 商品列表正常显示
- ✅ 后台登录功能正常
- ✅ API 请求指向正确的 Workers URL

## 生产环境信息

### 后端 API
- **Workers URL**: `https://jewelry-app-api.fengzhihong1994.workers.dev`
- **健康检查**: `https://jewelry-app-api.fengzhihong1994.workers.dev/api/health`
- **数据库**: `jewelry-db` (D1)

### 前端
- **生产域名**: `https://mundo.guacara.app`
- **后台管理**: `https://mundo.guacara.app/admin/login`

### 默认管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- ⚠️ **重要**: 部署后立即更改默认密码！

## 自动化修复脚本

如果将来需要重新修复，可以使用：

```powershell
.\scripts\fix-production-api.ps1
```

该脚本会：
1. 自动检测 Workers URL
2. 更新 `.env.production` 文件
3. 重新构建前端

## 常见问题

### Q: 为什么构建后仍然使用 localhost？

**A**: 确保在构建时：
1. `.env.production` 文件存在于 `frontend/` 目录
2. 使用 `npm run build` 命令（不是 `npm run dev`）
3. 环境变量以 `VITE_` 开头

### Q: 如何验证环境变量是否正确注入？

**A**: 检查构建后的 JavaScript 文件：
```powershell
Select-String -Path "dist\assets\*.js" -Pattern "jewelry-app-api"
```

如果找到 `jewelry-app-api.fengzhihong1994.workers.dev`，说明配置正确。

### Q: 部署后仍然有缓存问题？

**A**: 
1. 检查 `index.html` 中的缓存控制 meta 标签
2. 确保静态托管服务配置了正确的缓存策略
3. 在浏览器中执行硬刷新（Ctrl+Shift+R）

## 相关文档

- [生产环境部署指南](./PRODUCTION_DEPLOY.md)
- [生产环境配置指南](./PRODUCTION_SETUP.md)
- [清除缓存修复指南](./CLEAR_CACHE_FIX.md)

