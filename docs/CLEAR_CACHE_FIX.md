# 清除浏览器缓存修复指南

## 问题

如果看到 `productsAPI is not defined` 或类似的错误，这通常是因为浏览器缓存了旧版本的 JavaScript 文件。

## 快速解决方案

### 方法 1：强制刷新（最简单）

**Windows/Linux:**
- 按 `Ctrl + Shift + R` 或 `Ctrl + F5`

**Mac:**
- 按 `Cmd + Shift + R`

### 方法 2：开发者工具清除缓存

1. 按 `F12` 打开开发者工具
2. 右键点击浏览器刷新按钮（地址栏左侧）
3. 选择"清空缓存并硬性重新加载"

### 方法 3：完全清除缓存

1. 按 `Ctrl + Shift + Delete`（Windows）或 `Cmd + Shift + Delete`（Mac）
2. 选择"缓存的图片和文件"
3. 时间范围选择"全部时间"
4. 点击"清除数据"
5. 关闭浏览器
6. 重新打开浏览器并访问网站

### 方法 4：使用无痕模式

1. 打开浏览器的无痕/隐私模式
   - Chrome/Edge: `Ctrl + Shift + N`（Windows）或 `Cmd + Shift + N`（Mac）
   - Firefox: `Ctrl + Shift + P`（Windows）或 `Cmd + Shift + P`（Mac）
2. 在无痕模式下访问商家后台

### 方法 5：手动清除特定网站缓存

**Chrome/Edge:**
1. 按 `F12` 打开开发者工具
2. 点击 Network 标签
3. 勾选 "Disable cache"
4. 保持开发者工具打开
5. 刷新页面

**Firefox:**
1. 按 `F12` 打开开发者工具
2. 点击 Network 标签
3. 点击设置图标（齿轮）
4. 勾选 "Disable HTTP Cache"
5. 保持开发者工具打开
6. 刷新页面

## 验证是否加载了新文件

1. 按 `F12` 打开开发者工具
2. 点击 Network 标签
3. 刷新页面
4. 查找 JavaScript 文件（.js 文件）
5. 确认文件名是新的（例如：`index-q4K6X3uP.js` 而不是 `index-CmOb7ihW.js`）

## 如果问题仍然存在

如果清除缓存后问题仍然存在：

1. **检查构建文件**
   - 确认 `frontend/dist` 目录中有新的构建文件
   - 检查文件修改时间是否为最新

2. **检查服务器配置**
   - 如果使用静态托管服务，确认已上传新的 `dist` 目录
   - 检查服务器缓存设置

3. **检查 CDN 缓存**
   - 如果使用 CDN，可能需要清除 CDN 缓存
   - 等待 CDN 缓存过期（通常几分钟到几小时）

4. **完全重新部署**
   - 删除旧的部署
   - 重新上传新的 `dist` 目录
   - 清除所有缓存

## 预防措施

为了避免将来出现缓存问题：

1. **使用版本号**
   - 构建文件已包含哈希值，确保文件名唯一
   - 每次构建都会生成新的文件名

2. **设置正确的缓存头**
   - HTML 文件：不缓存
   - JavaScript/CSS 文件：长期缓存（因为文件名包含哈希）

3. **开发时禁用缓存**
   - 在开发者工具中启用 "Disable cache"

## 当前构建文件

最新构建文件：
- JavaScript: `index-q4K6X3uP.js`
- CSS: `index-BD8QQqap.css`

如果看到其他文件名（如 `index-CmOb7ihW.js`），说明浏览器在使用缓存的旧文件。

