# 🚀 立即部署指南

## 当前状态

✅ **前端已重新构建**
- 新构建文件: `index-MSIUPEA0.js`
- 包含正确的 Workers API URL
- 构建时间: 刚刚完成

✅ **Workers API 正常运行**
- URL: `https://jewelry-app-api.fengzhihong1994.workers.dev`
- 产品数量: 24 个

⚠️ **需要立即部署前端到 Cloudflare Pages**

## 快速部署方法

### 方法 1: 使用自动化脚本（推荐）

运行以下命令：

```powershell
.\scripts\deploy-frontend-pages.ps1
```

脚本会引导您完成部署过程。

### 方法 2: 使用 Wrangler CLI

```powershell
cd frontend
npx wrangler pages deploy dist --project-name=YOUR_PROJECT_NAME
```

**注意**: 将 `YOUR_PROJECT_NAME` 替换为您的实际项目名称。

### 方法 3: 手动上传（最简单）

1. **打开 Cloudflare Dashboard**
   - 访问: https://dash.cloudflare.com
   - 进入 **Workers & Pages** → **Pages**

2. **找到项目**
   - 查找与 `mundo.guacara.app` 相关的项目

3. **上传文件**
   - 点击项目
   - 选择 **Upload assets** 或 **Deploy site**
   - 选择 `frontend/dist` 目录中的所有文件
   - 点击 **Deploy**

4. **等待部署**
   - 通常需要 1-2 分钟
   - 查看部署状态直到显示 "Success"

## 部署后操作

### 1. 清除 Cloudflare 缓存

在 Cloudflare Dashboard 中：
- 进入您的域名设置
- 找到 **Caching** 或 **Purge Cache**
- 点击 **Purge Everything**

### 2. 清除浏览器缓存

- **硬刷新**: `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac)
- **或**: 打开开发者工具（F12）→ 右键刷新按钮 → "清空缓存并硬性重新加载"

### 3. 验证部署

访问 https://mundo.guacara.app 并检查：

1. 打开开发者工具（F12）→ Network 标签
2. 刷新页面
3. ✅ 应该看到 `index-MSIUPEA0.js`（新文件）
4. ❌ 不应该看到 `index-CmOb7ihW.js`（旧文件）
5. ✅ API 请求应该指向 `https://jewelry-app-api.fengzhihong1994.workers.dev`
6. ✅ 产品列表应该正常显示

## 故障排除

### 如果仍然看到旧文件

1. **等待更长时间**（Cloudflare 缓存可能需要几分钟更新）
2. **再次清除 Cloudflare 缓存**
3. **使用隐私模式**访问网站
4. **检查部署状态**是否真的成功

### 如果产品仍然无法显示

1. **检查浏览器控制台**（F12）是否有错误
2. **检查 Network 标签**中的 API 请求
3. **验证 Workers API** 是否可访问：
   ```powershell
   curl https://jewelry-app-api.fengzhihong1994.workers.dev/api/products
   ```

## 需要帮助？

如果遇到问题，请提供：
- 浏览器控制台的错误信息
- Network 标签中的请求详情
- Cloudflare Pages 的部署日志

