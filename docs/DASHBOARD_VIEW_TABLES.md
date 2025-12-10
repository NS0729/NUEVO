# 在 Cloudflare Dashboard 中查看数据库表

## ✅ 数据库迁移状态

数据库已成功迁移，包含以下表：
- ✅ `categories` (4 个分类)
- ✅ `products` (12 个商品)
- ✅ `orders` (订单表)
- ✅ `order_items` (订单项表)

## 🔍 在 Dashboard 中查看表的步骤

### 方法 1: 通过 D1 页面查看

1. **登录 Cloudflare Dashboard**
   - 访问: https://dash.cloudflare.com/
   - 使用你的账号登录

2. **导航到 D1 数据库**
   - 点击左侧菜单 **"Workers & Pages"**
   - 在子菜单中点击 **"D1"**
   - 你会看到数据库列表

3. **选择数据库**
   - 找到并点击 **"jewelry-db"**
   - 进入数据库详情页面

4. **查看表**
   - 在数据库详情页面，你会看到 **"Tables"** 或 **"Query"** 标签
   - 点击 **"Query"** 标签
   - 在查询编辑器中输入以下 SQL 查看所有表：
     ```sql
     SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%';
     ```
   - 点击 **"Run"** 执行查询

### 方法 2: 通过查询查看数据

在 Dashboard 的查询编辑器中执行以下查询：

#### 查看所有表
```sql
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%';
```

#### 查看分类数据
```sql
SELECT * FROM categories;
```

#### 查看商品数据
```sql
SELECT id, name, price, category FROM products LIMIT 10;
```

#### 查看表结构
```sql
SELECT sql FROM sqlite_master WHERE type='table' AND name='products';
```

## 🐛 如果看不到表，请尝试以下步骤

### 1. 刷新页面
- 按 `F5` 或 `Ctrl+R` 刷新 Dashboard
- 有时需要等待几秒钟让数据加载

### 2. 检查数据库选择
- 确保你选择的是正确的数据库 `jewelry-db`
- 数据库 ID: `1330c379-effa-43b0-a87e-9a232e7eff57`

### 3. 使用查询功能
- 在 Dashboard 中，表可能不会自动显示在列表中
- 使用 **"Query"** 功能执行 SQL 查询来查看表和数据

### 4. 检查权限
- 确保你的账号有权限访问 D1 数据库
- 检查账号是否有足够的权限

### 5. 清除浏览器缓存
- 清除浏览器缓存和 Cookie
- 重新登录 Cloudflare Dashboard

## 📊 验证数据库状态

通过命令行验证数据库：

```bash
cd backend

# 查看所有表
npx wrangler d1 execute jewelry-db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# 查看分类
npx wrangler d1 execute jewelry-db --command="SELECT * FROM categories;" --remote

# 查看商品
npx wrangler d1 execute jewelry-db --command="SELECT COUNT(*) FROM products;" --remote
```

## 💡 重要提示

1. **Dashboard 显示**: Cloudflare Dashboard 可能不会自动显示表列表，需要使用查询功能
2. **查询功能**: 在 Dashboard 中使用 SQL 查询是查看和管理数据的主要方式
3. **数据存在**: 即使 Dashboard 不显示表列表，数据仍然存在，可以通过查询访问

## 🚀 快速验证

执行以下命令快速验证数据库：

```bash
cd backend

# 验证表存在
npx wrangler d1 execute jewelry-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('categories', 'products', 'orders', 'order_items');" --remote

# 验证数据存在
npx wrangler d1 execute jewelry-db --command="SELECT 'categories' as table_name, COUNT(*) as count FROM categories UNION ALL SELECT 'products', COUNT(*) FROM products;" --remote
```

## 📝 当前数据库状态

根据最新验证：
- ✅ 4 个表已创建
- ✅ 4 个分类数据
- ✅ 12 个商品数据
- ✅ 数据库大小: 0.07 MB
- ✅ 迁移状态: 成功

## 🔗 相关链接

- Cloudflare Dashboard: https://dash.cloudflare.com/
- D1 文档: https://developers.cloudflare.com/d1/


