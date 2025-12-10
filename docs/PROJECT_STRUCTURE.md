# 项目结构说明

## 📁 目录结构

```
NUEVO/
├── frontend/              # 前端项目 (Vue.js)
│   ├── src/              # 前端源代码
│   │   ├── api.js        # API 客户端
│   │   ├── App.vue       # 根组件
│   │   ├── main.js       # 入口文件
│   │   ├── components/   # Vue 组件
│   │   ├── composables/  # 组合式函数
│   │   ├── router/       # 路由配置
│   │   ├── store/        # Pinia 状态管理
│   │   ├── styles/       # 样式文件
│   │   ├── utils/        # 工具函数
│   │   └── views/        # 页面组件
│   ├── index.html        # HTML 模板
│   ├── vite.config.js    # Vite 配置
│   └── package.json      # 前端依赖
│
├── backend/              # 后端项目 (Cloudflare Workers)
│   ├── src/
│   │   └── index.js      # Worker 入口文件
│   ├── migrations/       # 数据库迁移文件
│   │   └── 0001_initial_schema.sql
│   ├── wrangler.toml     # Wrangler 配置
│   ├── test-api.js       # API 测试脚本
│   └── package.json      # 后端依赖
│
├── docs/                 # 项目文档
│   ├── README.md         # 主文档
│   ├── PROJECT_STRUCTURE.md  # 项目结构说明（本文件）
│   └── ...               # 其他文档
│
├── scripts/              # 脚本文件
│   ├── setup-github.ps1
│   ├── setup-github-nuevo.ps1
│   └── verify-secrets.ps1
│
├── .github/              # GitHub 配置
│   └── workflows/        # GitHub Actions
│       └── database-migrate.yml
│
├── node_modules/         # 根目录依赖（workspace）
└── package.json          # 根 package.json（workspace 管理）
```

## 🚀 快速开始

### 安装依赖

```bash
# 安装所有依赖（根目录 + 前端 + 后端）
npm run install:all

# 或分别安装
npm install                    # 根目录
cd frontend && npm install     # 前端
cd ../backend && npm install   # 后端
```

### 开发模式

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:frontend   # 前端 (http://localhost:3000)
npm run dev:backend    # 后端 (http://localhost:8787)
```

### 构建

```bash
npm run build  # 构建前端
```

## 📝 开发说明

### 前端开发
- 前端代码位于 `frontend/` 目录
- 使用 Vue 3 + Vite + Pinia + Vue Router
- 开发服务器：`http://localhost:3000`

### 后端开发
- 后端代码位于 `backend/` 目录
- 使用 Cloudflare Workers + D1 数据库
- API 服务器：`http://localhost:8787`
- 数据库迁移：`cd backend && npm run db:migrate`

### 数据库迁移
- 迁移文件位于 `backend/migrations/`
- 本地迁移：`cd backend && npm run db:migrate`
- 远程迁移：`cd backend && npm run db:migrate:remote`
- GitHub Actions 会自动执行远程迁移

## 🔧 配置文件

- **前端配置**: `frontend/vite.config.js`
- **后端配置**: `backend/wrangler.toml`
- **数据库配置**: `backend/wrangler.toml` (D1 数据库绑定)

## 📚 文档

所有文档位于 `docs/` 目录，包括：
- 项目说明
- 后端 API 文档
- 部署指南
- GitHub 设置指南
- 等等...

