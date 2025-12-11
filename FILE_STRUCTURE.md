# 📁 项目文件结构

## 目录结构

```
NUEVO/
├── backend/              # 后端代码
│   ├── migrations/       # 数据库迁移文件
│   ├── src/             # 源代码
│   ├── package.json      # 后端依赖配置
│   └── wrangler.toml     # Cloudflare Workers 配置
│
├── frontend/             # 前端代码
│   ├── src/             # 源代码
│   │   ├── api.js       # API 客户端
│   │   ├── components/  # Vue 组件
│   │   ├── views/       # 页面视图
│   │   └── ...
│   ├── dist/            # 构建输出
│   ├── package.json     # 前端依赖配置
│   └── vite.config.js   # Vite 配置
│
├── scripts/             # 脚本文件
│   ├── start-all.ps1    # 启动开发环境（简单版）
│   ├── start-dev.ps1   # 启动开发环境（完整版）
│   ├── test-*.ps1      # 测试脚本
│   └── verify-*.ps1    # 验证脚本
│
├── docs/                # 文档文件
│   ├── API_CONFIG_TEST_RESULTS.md
│   ├── FIXES_COMPLETE.md
│   └── ...
│
├── README.md            # 项目说明
├── README_SCRIPTS.md    # 脚本使用说明
└── FILE_STRUCTURE.md    # 本文件
```

## 📂 文件分类

### 前端文件 (`frontend/`)
- 所有前端相关代码和配置
- Vue.js 应用
- Vite 构建配置
- 前端依赖管理

### 后端文件 (`backend/`)
- 所有后端相关代码和配置
- Cloudflare Workers API
- 数据库迁移文件
- 后端依赖管理

### 脚本文件 (`scripts/`)
- 所有 PowerShell 脚本
- 启动脚本
- 测试脚本
- 部署脚本
- 验证脚本

### 文档文件 (`docs/`)
- 所有 Markdown 文档
- API 文档
- 部署文档
- 故障排除文档
- 测试报告

## 🚀 快速开始

### 启动开发环境
```powershell
.\scripts\start-all.ps1
```

### 测试配置
```powershell
.\scripts\test-api-connection.ps1
```

### 验证修复
```powershell
.\scripts\verify-fixes.ps1
```

## 📝 注意事项

1. **脚本路径**: 所有脚本都可以从项目根目录运行
2. **自动检测**: 脚本会自动检测项目根目录，可以从任何位置运行
3. **路径处理**: 脚本已更新，支持从 `scripts/` 文件夹内运行

## 🔍 查找文件

- **前端代码**: `frontend/src/`
- **后端代码**: `backend/src/`
- **脚本文件**: `scripts/`
- **文档文件**: `docs/`

