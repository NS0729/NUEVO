# 🔐 GitHub Secrets 配置指南

## 📋 概述

配置GitHub Secrets后，GitHub Actions可以自动执行数据库迁移等操作。

## 🚀 快速配置步骤

### 步骤1: 获取Cloudflare API Token

1. **访问Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com/profile/api-tokens
   - 或：登录Cloudflare → 点击右上角头像 → "My Profile" → "API Tokens"

2. **创建API Token**
   - 点击 "Create Token"
   - 点击 "Get started" 使用 "Edit Cloudflare Workers" 模板
   - 或手动配置权限：
     - **Account**: `Cloudflare Workers:Edit`
     - **Account**: `D1:Edit`
   - 点击 "Continue to summary"
   - 点击 "Create Token"
   - ⚠️ **重要**: 立即复制Token，它只会显示一次！

3. **保存Token**
   - 将Token保存到安全的地方
   - 格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤2: 获取Cloudflare Account ID

1. **访问Cloudflare Dashboard**
   - 打开：https://dash.cloudflare.com/
   - 登录你的账号

2. **查找Account ID**
   - 在右侧边栏可以看到 "Account ID"
   - 或访问：https://dash.cloudflare.com/
   - Account ID格式类似：`xxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤3: 在GitHub配置Secrets

1. **访问仓库Secrets设置**
   - 打开：https://github.com/NS0729/NUEVO/settings/secrets/actions
   - 或：仓库 → Settings → Secrets and variables → Actions

2. **添加 CLOUDFLARE_API_TOKEN**
   - 点击 "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: 粘贴你的Cloudflare API Token
   - 点击 "Add secret"

3. **添加 CLOUDFLARE_ACCOUNT_ID**
   - 再次点击 "New repository secret"
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: 粘贴你的Cloudflare Account ID
   - 点击 "Add secret"

### 步骤4: 验证配置

配置完成后，可以：

1. **手动触发工作流**
   - 访问：https://github.com/NS0729/NUEVO/actions
   - 点击 "Database Migration" 工作流
   - 点击 "Run workflow" → "Run workflow"

2. **查看运行结果**
   - 在工作流运行页面查看日志
   - 如果成功，会看到 "Run database migrations" 步骤成功

## 🔍 详细说明

### Cloudflare API Token权限

确保Token有以下权限：

| 权限类型 | 权限名称 | 说明 |
|---------|---------|------|
| Account | Cloudflare Workers:Edit | 允许部署和管理Workers |
| Account | D1:Edit | 允许执行D1数据库操作 |

### GitHub Secrets命名

必须使用以下精确的名称（区分大小写）：

- `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID

### 工作流触发条件

GitHub Actions会在以下情况自动运行：

1. **推送迁移文件到main分支**
   - 当 `migrations/` 目录下的文件被修改并推送到main分支时

2. **手动触发**
   - 在Actions页面手动运行工作流

## 🛠️ 故障排除

### 问题1: Token无效

**症状**: 工作流失败，显示认证错误

**解决**:
1. 检查Token是否正确复制（没有多余空格）
2. 确认Token权限包含Workers:Edit和D1:Edit
3. 重新创建Token并更新Secret

### 问题2: Account ID错误

**症状**: 工作流失败，显示账户错误

**解决**:
1. 确认Account ID正确（在Cloudflare Dashboard右侧边栏）
2. 检查Account ID是否包含多余字符
3. 重新复制并更新Secret

### 问题3: 权限不足

**症状**: 工作流失败，显示权限错误

**解决**:
1. 检查Token权限设置
2. 确保Token有D1:Edit权限
3. 重新创建Token并更新Secret

### 问题4: 数据库不存在

**症状**: 工作流失败，显示数据库不存在

**解决**:
1. 确认数据库名称正确（`jewelry-db`）
2. 检查 `wrangler.toml` 中的数据库配置
3. 确认数据库已在Cloudflare创建

## 📝 验证清单

配置完成后，确认：

- [ ] Cloudflare API Token已创建
- [ ] Token权限包含Workers:Edit和D1:Edit
- [ ] Account ID已获取
- [ ] GitHub Secret `CLOUDFLARE_API_TOKEN` 已添加
- [ ] GitHub Secret `CLOUDFLARE_ACCOUNT_ID` 已添加
- [ ] 工作流可以手动触发
- [ ] 工作流运行成功

## 🔗 相关链接

- **GitHub仓库**: https://github.com/NS0729/NUEVO
- **GitHub Secrets设置**: https://github.com/NS0729/NUEVO/settings/secrets/actions
- **GitHub Actions**: https://github.com/NS0729/NUEVO/actions
- **Cloudflare API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **Cloudflare Dashboard**: https://dash.cloudflare.com/

## 💡 提示

1. **安全**: 不要将API Token提交到代码仓库
2. **备份**: 将Token保存在安全的地方（密码管理器）
3. **测试**: 配置后先手动触发工作流测试
4. **监控**: 定期检查工作流运行状态

## 🆘 需要帮助？

如果遇到问题：

1. 检查GitHub Actions日志
2. 验证Cloudflare Token权限
3. 确认数据库配置正确
4. 查看工作流文件：`.github/workflows/database-migrate.yml`


