# 修复 401 未授权错误

## 问题描述

在生产环境添加商品时出现 401 未授权错误。

## 可能的原因

1. **Token 已过期** - Token 有效期为 2 小时
2. **Token 未正确保存** - 登录后 token 未正确保存到 localStorage
3. **Token 验证失败** - 后端数据库中找不到对应的会话记录
4. **本地开发环境 vs 生产环境** - 使用本地开发环境但 token 在生产环境数据库中

## 解决方案

### 1. 重新登录

最简单的方法是重新登录：

1. 退出当前登录
2. 重新登录商家后台
3. 确保登录成功后再尝试添加商品

### 2. 检查 Token

在浏览器控制台运行：

```javascript
// 检查 token
console.log('Token:', localStorage.getItem('admin_token'))
console.log('User:', localStorage.getItem('admin_user'))
console.log('Expiry:', localStorage.getItem('admin_token_expiry'))
```

### 3. 清除并重新登录

如果 token 有问题，清除后重新登录：

```javascript
// 清除所有认证信息
localStorage.removeItem('admin_token')
localStorage.removeItem('admin_user')
localStorage.removeItem('admin_token_expiry')
// 然后刷新页面并重新登录
location.reload()
```

### 4. 检查环境

确保前端使用的 API URL 与后端部署环境一致：

- **本地开发**: `http://localhost:8787`
- **生产环境**: `https://jewelry-app-api.fengzhihong1994.workers.dev`

检查 `frontend/.env.production` 文件中的 `VITE_API_URL` 配置。

## 已实施的修复

1. ✅ 添加了详细的调试日志
2. ✅ 改进了错误处理
3. ✅ 401 错误时自动清除 token 并跳转到登录页
4. ✅ 后端添加了更详细的 token 验证日志

## 调试步骤

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签中的日志
3. 查看 Network 标签中的请求详情
4. 检查请求头中是否包含 `Authorization: Bearer <token>`
5. 检查响应状态码和错误消息

## 预防措施

- Token 有效期为 2 小时，建议定期刷新
- 如果长时间未操作，建议重新登录
- 确保使用正确的 API URL（开发/生产环境）

