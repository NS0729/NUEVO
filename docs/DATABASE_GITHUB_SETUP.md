# 📦 GitHub数据库管理指南

## 📋 概述

虽然GitHub不直接提供数据库服务，但我们可以通过以下方式管理数据库：

1. **版本控制数据库迁移文件** - 将SQL迁移文件存储在GitHub
2. **自动化数据库操作** - 使用GitHub Actions自动执行迁移
3. **数据库配置管理** - 将数据库配置纳入版本控制

## 🗂️ 当前项目结构

```
项目根目录/
├── migrations/              # 数据库迁移文件
│   └── 0001_initial_schema.sql
├── wrangler.toml          # Cloudflare Workers配置（包含数据库配置）
└── .github/
    └── workflows/         # GitHub Actions工作流
        └── database-migrate.yml
```

## 🚀 设置GitHub仓库

### 1. 创建GitHub仓库

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: Jewelry app with database migrations"

# 在GitHub上创建新仓库，然后连接
git remote add origin https://github.com/你的用户名/jewelry-app.git
git branch -M main
git push -u origin main
```

### 2. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets（Settings → Secrets and variables → Actions）：

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

**获取Cloudflare API Token:**
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "My Profile" → "API Tokens"
3. 创建新Token，权限包括：
   - Account: Cloudflare Workers:Edit
   - Zone: Zone:Read
   - Account: D1:Edit

**获取Account ID:**
1. 在Cloudflare Dashboard右侧边栏可以看到Account ID

## 📝 数据库迁移文件管理

### 迁移文件命名规范

```
migrations/
├── 0001_initial_schema.sql      # 初始数据库结构
├── 0002_add_user_table.sql      # 添加用户表
├── 0003_add_indexes.sql          # 添加索引
└── ...
```

### 创建新迁移文件

```bash
# 创建新的迁移文件
touch migrations/0002_add_new_feature.sql

# 编辑迁移文件
# 添加SQL语句
```

### 本地执行迁移

```bash
# 本地数据库迁移
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql --local

# 远程数据库迁移
npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql --remote
```

## 🔄 GitHub Actions自动化

### 自动迁移工作流

当推送迁移文件到main分支时，GitHub Actions会自动执行：

1. 检查代码
2. 安装依赖
3. 设置Wrangler
4. 执行数据库迁移

### 手动触发迁移

在GitHub仓库的Actions标签页，可以手动触发迁移工作流。

## 🔒 安全注意事项

### ✅ 应该提交到GitHub的：

- ✅ 数据库迁移文件（`.sql`）
- ✅ 数据库结构定义
- ✅ Wrangler配置（不含敏感信息）

### ❌ 不应该提交到GitHub的：

- ❌ 数据库文件（`.db`, `.sqlite`）
- ❌ API密钥和Token
- ❌ 环境变量文件（`.env`）
- ❌ 本地数据库文件

## 📊 数据库备份

### 导出数据库

```bash
# 导出远程数据库
npx wrangler d1 execute jewelry-db --command="SELECT * FROM products" --remote > backup.sql

# 导出本地数据库
npx wrangler d1 execute jewelry-db --command="SELECT * FROM products" --local > backup_local.sql
```

### 导入数据库

```bash
# 导入到远程数据库
npx wrangler d1 execute jewelry-db --file=backup.sql --remote

# 导入到本地数据库
npx wrangler d1 execute jewelry-db --file=backup_local.sql --local
```

## 🛠️ 常用命令

### 查看数据库信息

```bash
# 查看数据库列表
npx wrangler d1 list

# 查看数据库详情
npx wrangler d1 info jewelry-db
```

### 执行SQL查询

```bash
# 查询远程数据库
npx wrangler d1 execute jewelry-db --command="SELECT COUNT(*) FROM products" --remote

# 查询本地数据库
npx wrangler d1 execute jewelry-db --command="SELECT COUNT(*) FROM products" --local
```

### 数据库迁移

```bash
# 执行所有迁移（需要手动创建脚本）
for file in migrations/*.sql; do
  npx wrangler d1 execute jewelry-db --file="$file" --remote
done
```

## 📚 最佳实践

1. **版本控制迁移文件**
   - 所有迁移文件都应该提交到GitHub
   - 使用清晰的命名规范
   - 添加注释说明每个迁移的目的

2. **测试迁移**
   - 先在本地测试迁移
   - 确保迁移可以回滚
   - 在生产环境执行前备份

3. **自动化**
   - 使用GitHub Actions自动执行迁移
   - 设置CI/CD流程
   - 添加迁移验证步骤

4. **文档化**
   - 记录每个迁移的目的
   - 说明数据库结构变更
   - 更新API文档

## 🔗 相关资源

- [Cloudflare D1文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions文档](https://docs.github.com/en/actions)

## 📞 需要帮助？

如果遇到问题，请检查：
1. Cloudflare API Token是否正确配置
2. Account ID是否正确
3. 数据库名称是否匹配
4. 迁移文件语法是否正确


