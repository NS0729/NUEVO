# Cloudflare Dashboard 数据库管理指南

## ✅ 数据库迁移状态

数据库已成功迁移到 Cloudflare D1，现在可以在 Cloudflare Dashboard 中查看和管理。

## 📊 数据库信息

- **数据库名称**: `jewelry-db`
- **数据库 ID**: `1330c379-effa-43b0-a87e-9a232e7eff57`
- **位置**: Cloudflare D1 (云端)
- **状态**: ✅ 已迁移并运行中

## 🌐 在 Cloudflare Dashboard 中访问数据库

### 方法 1: 通过导航菜单

1. **登录 Cloudflare Dashboard**
   - 访问: https://dash.cloudflare.com/
   - 使用你的 Cloudflare 账号登录

2. **导航到 D1 数据库**
   - 在左侧菜单中找到 **"Workers & Pages"**
   - 点击展开菜单
   - 选择 **"D1"**

3. **选择数据库**
   - 在数据库列表中，找到并点击 **"jewelry-db"**
   - 进入数据库详情页面

### 方法 2: 直接访问（需要账户 ID）

```
https://dash.cloudflare.com/[你的账户ID]/workers/d1/databases/1330c379-effa-43b0-a87e-9a232e7eff57
```

## 📋 Dashboard 功能

在数据库详情页面，你可以：

### 1. 查看数据库概览
- 数据库大小
- 表数量
- 数据统计
- 使用情况

### 2. 查看和管理表
- 查看所有表列表
- 查看表结构
- 查看表数据
- 执行 SQL 查询

### 3. 执行查询
- 在查询编辑器中编写 SQL
- 执行查询并查看结果
- 保存常用查询

### 4. 管理数据
- 查看表数据
- 编辑数据（通过 SQL）
- 导出数据

## 🔍 常用查询示例

### 查看所有表
```sql
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%';
```

### 查看分类
```sql
SELECT * FROM categories;
```

### 查看商品
```sql
SELECT id, name, price, category FROM products LIMIT 10;
```

### 统计商品数量
```sql
SELECT category, COUNT(*) as count FROM products GROUP BY category;
```

### 查看订单
```sql
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;
```

## 📊 当前数据库状态

根据最新验证：

- ✅ **连接状态**: 已连接
- ✅ **表数量**: 5 个表
- ✅ **分类数据**: 4 个分类
- ✅ **商品数据**: 12 个商品
- ✅ **订单表**: 已创建（0 个订单）
- ✅ **订单项表**: 已创建（0 个订单项）

## 🔧 通过命令行访问

你也可以通过 Wrangler CLI 访问数据库：

```bash
cd backend

# 执行查询
npx wrangler d1 execute jewelry-db --command="SELECT * FROM categories;" --remote

# 执行 SQL 文件
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql --remote
```

## 📝 注意事项

1. **数据安全**: 在 Dashboard 中修改数据时要谨慎
2. **备份**: 重要操作前建议先备份数据
3. **权限**: 确保你有足够的权限访问数据库
4. **性能**: 大量数据查询可能影响性能

## 🚀 下一步

数据库已在 Cloudflare Dashboard 中可用，你可以：

1. ✅ 在 Dashboard 中查看数据库
2. ✅ 通过 API 访问数据（后端已配置）
3. ✅ 在商家后台管理商品和订单
4. ✅ 通过 GitHub Actions 自动执行迁移

## 📚 相关文档

- [数据库迁移完成记录](DATABASE_MIGRATION_COMPLETE.md)
- [Cloudflare D1 状态](CLOUDFLARE_D1_STATUS.md)
- [后端 API 文档](README_BACKEND.md)


