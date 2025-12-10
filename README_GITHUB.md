# 🚀 将项目推送到GitHub

## 快速开始

### 1. 初始化Git仓库

```bash
# 如果还没有初始化Git
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: Jewelry app with Cloudflare D1 database"
```

### 2. 在GitHub创建仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库名称（例如：`jewelry-app`）
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

### 3. 连接本地仓库到GitHub

```bash
# 添加远程仓库（替换为你的GitHub用户名和仓库名）
git remote add origin https://github.com/你的用户名/jewelry-app.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

## 🔐 配置GitHub Secrets（用于自动化）

### 设置Secrets

1. 进入GitHub仓库
2. 点击 "Settings" → "Secrets and variables" → "Actions"
3. 点击 "New repository secret"
4. 添加以下Secrets：

#### CLOUDFLARE_API_TOKEN
- **名称**: `CLOUDFLARE_API_TOKEN`
- **值**: 你的Cloudflare API Token
- **获取方式**:
  1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
  2. 进入 "My Profile" → "API Tokens"
  3. 点击 "Create Token"
  4. 使用 "Edit Cloudflare Workers" 模板
  5. 添加权限：
     - Account: Cloudflare Workers:Edit
     - Account: D1:Edit
  6. 复制生成的Token

#### CLOUDFLARE_ACCOUNT_ID
- **名称**: `CLOUDFLARE_ACCOUNT_ID`
- **值**: 你的Cloudflare Account ID
- **获取方式**: 在Cloudflare Dashboard右侧边栏可以看到

## 📁 仓库结构

```
jewelry-app/
├── .github/
│   └── workflows/
│       └── database-migrate.yml    # 自动数据库迁移
├── migrations/
│   └── 0001_initial_schema.sql     # 数据库迁移文件
├── src/
│   ├── index.js                    # Cloudflare Workers后端
│   └── ...                         # 前端代码
├── wrangler.toml                   # Cloudflare配置
├── package.json
└── README.md
```

## 🔄 自动数据库迁移

当推送迁移文件到main分支时，GitHub Actions会自动执行数据库迁移。

### 手动触发迁移

1. 进入GitHub仓库的 "Actions" 标签页
2. 选择 "Database Migration" 工作流
3. 点击 "Run workflow"

## 📝 提交更改

```bash
# 查看更改
git status

# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到GitHub
git push
```

## 🛡️ 安全提示

- ✅ `.gitignore` 已配置，不会提交敏感文件
- ✅ 数据库文件不会提交到GitHub
- ✅ 环境变量不会提交到GitHub
- ⚠️ 确保GitHub Secrets正确配置
- ⚠️ 不要将API密钥提交到代码中

## 📚 更多信息

查看 [DATABASE_GITHUB_SETUP.md](./DATABASE_GITHUB_SETUP.md) 了解详细的数据库管理指南。

