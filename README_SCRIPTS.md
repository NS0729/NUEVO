# 脚本使用说明

## 📁 脚本文件位置

所有脚本文件已整理到 `scripts/` 文件夹中。

## 🚀 常用脚本

### 启动开发环境

#### 简单启动（推荐）
```powershell
.\scripts\start-all.ps1
```
在新窗口中启动前端和后端服务器。

#### 完整启动
```powershell
.\scripts\start-dev.ps1
```
在当前窗口启动，包含依赖检查和详细日志。

### 测试和验证脚本

#### 测试API连接
```powershell
.\scripts\test-api-connection.ps1
```
测试前端和API配置一致性。

#### 验证API配置
```powershell
.\scripts\verify-api-config.ps1
```
验证前端API端点与后端路由是否匹配。

#### 测试API端点
```powershell
.\scripts\test-api-endpoints.ps1
```
测试所有API端点的连接状态。

#### 验证修复状态
```powershell
.\scripts\verify-fixes.ps1
```
验证所有修复是否正确应用。

## 📝 其他脚本

### 部署相关
- `scripts/deploy-frontend-pages.ps1` - 部署前端到Cloudflare Pages
- `scripts/deploy-production.ps1` - 生产环境部署
- `scripts/fix-production-api.ps1` - 修复生产环境API配置

### 设置相关
- `scripts/setup-github.ps1` - GitHub设置
- `scripts/setup-github-nuevo.ps1` - GitHub设置（Nuevo）
- `scripts/verify-secrets.ps1` - 验证密钥配置

### 管理相关
- `scripts/start-admin.ps1` - 启动管理后台
- `scripts/start-admin-complete.ps1` - 完整启动管理后台

## 💡 使用提示

所有脚本都可以从项目根目录运行，脚本会自动检测项目根目录。

如果从 `scripts/` 文件夹内运行，脚本也会自动找到项目根目录。

## 📚 相关文档

详细文档请查看 `docs/` 文件夹：
- `docs/FIXES_COMPLETE.md` - 修复完成报告
- `docs/API_CONFIG_TEST_RESULTS.md` - API配置测试结果

