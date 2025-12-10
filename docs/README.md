# 精美首饰 App - Vue3 前端应用

一个专业精美的首饰展示应用，采用 Vue3 + Vite 构建，具有完善的功能和精美的UI设计。

## ✨ 功能特性

- 🎨 **精美UI设计** - 现代化的界面设计，优雅的视觉效果
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🖼️ **图片自动缩放/压缩** - 智能图片处理，优化加载性能
- 🔍 **搜索功能** - 强大的商品搜索
- 📂 **分类浏览** - 按分类浏览商品
- 🛍️ **购物车** - 购物车功能（状态管理）
- ⚡ **性能优化** - 懒加载、图片预加载等优化
- 🎯 **路由导航** - Vue Router 单页应用
- 💾 **状态管理** - Pinia 状态管理

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 组件
│   ├── NavBar.vue      # 导航栏
│   ├── Footer.vue      # 页脚
│   ├── ProductCard.vue # 商品卡片
│   └── ImageGallery.vue # 图片画廊
├── views/              # 页面
│   ├── Home.vue        # 首页
│   ├── Category.vue    # 分类页
│   ├── ProductDetail.vue # 商品详情
│   └── Search.vue      # 搜索页
├── store/              # 状态管理
│   └── index.js        # Pinia store
├── router/             # 路由配置
│   └── index.js
├── utils/              # 工具函数
│   └── imageProcessor.js # 图片处理工具
├── styles/             # 样式文件
│   └── main.scss       # 主样式
└── main.js             # 入口文件
```

## 🛠️ 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue的状态管理库
- **SCSS** - CSS预处理器

## 🎨 图片处理功能

应用内置了完善的图片处理工具 (`src/utils/imageProcessor.js`)：

- **图片压缩** - 自动压缩图片，优化文件大小
- **响应式图片** - 根据设备自动加载合适尺寸
- **懒加载** - 图片懒加载，提升性能
- **预加载** - 关键图片预加载

## 📱 响应式设计

- 移动端优先设计
- 断点：768px (平板), 1024px (桌面)
- 自适应网格布局
- 触摸友好的交互

## 🎯 主要页面

1. **首页** - 展示精选商品和分类
2. **分类页** - 按分类浏览商品
3. **商品详情** - 详细的商品信息和图片画廊
4. **搜索页** - 商品搜索功能

## 📝 开发说明

### 添加新商品

在 `src/store/index.js` 的 `products` 数组中添加新商品对象。

### 自定义样式

修改 `src/styles/main.scss` 中的CSS变量来自定义主题色。

### 图片处理

使用 `src/utils/imageProcessor.js` 中的工具函数处理图片。

## 📄 许可证

MIT License

