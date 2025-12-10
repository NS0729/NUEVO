# ⚡ 快速配置GitHub Secrets

## 🎯 3步完成配置

### 1️⃣ 获取Cloudflare API Token
👉 https://dash.cloudflare.com/profile/api-tokens
- 点击 "Create Token"
- 使用 "Edit Cloudflare Workers" 模板
- 复制Token（只显示一次！）

### 2️⃣ 获取Account ID
👉 https://dash.cloudflare.com/
- 在右侧边栏找到 "Account ID"
- 复制Account ID

### 3️⃣ 添加到GitHub
👉 https://github.com/NS0729/NUEVO/settings/secrets/actions
- 点击 "New repository secret"
- 添加 `CLOUDFLARE_API_TOKEN` = [你的Token]
- 添加 `CLOUDFLARE_ACCOUNT_ID` = [你的Account ID]

## ✅ 完成！

配置完成后，访问 https://github.com/NS0729/NUEVO/actions 手动触发工作流测试。


