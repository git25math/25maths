# 25Maths 网站 — 项目交接文档

> **最后更新**: 2026-02-10
> **状态**: 已部署上线（模块化重构完成）
> **网站**: https://www.25maths.com

---

## 一、当前进度总览

```
规划 ████████████ 100%
开发 ████████████ 100%  (初版 + Edexcel 资源 + 模块化重构)
审计 ████████████ 100%  (3 轮审计 + 全部修复)
部署 ████████████ 100%  (Jekyll 构建，GitHub Pages 上线)
```

### Git 提交记录

| Commit | 描述 |
|--------|------|
| `7459a03` | **模块化重构** — Jekyll 模板 + 按考试局分模块架构 |
| `69efb2c` | Rebrand free PDFs from TES to www.25maths.com |
| `794e18a` | Add 6 Edexcel 4MA1 vocabulary cards |
| `b216472` | Complete website overhaul — all products, legal, SEO, free resources |

---

## 二、网站架构

### 技术栈

| 项目 | 值 |
|------|-----|
| 框架 | Jekyll（GitHub Pages 原生支持） |
| 样式 | Tailwind CSS CDN |
| 字体 | Inter (400–800) via Google Fonts |
| 主色 primary | `#8B1538` (burgundy — CIE 0580) |
| 辅色 secondary | `#2563EB` (blue — Edexcel 4MA1) |
| 警告色 warning | `#F59E0B` (amber — AMC 8) |
| 成功色 success | `#10B981` (green — IAL) |
| 支付 | Gumroad |
| 托管 | GitHub Pages (www.25maths.com) |

### 目录结构

```
25maths-website/
├── _config.yml                    # Jekyll 配置 + 5 个模块定义
├── _includes/                     # 共享组件 (5 个)
│   ├── head.html                  # <head> (Tailwind/字体/OG/favicon)
│   ├── global-nav.html            # 全局深色导航栏
│   ├── module-nav.html            # 模块白色子导航栏
│   ├── footer.html                # 5 列页脚
│   └── mobile-menu-js.html        # 移动菜单 JS
├── _layouts/
│   ├── global.html                # 门户 + 全局页面布局
│   └── module.html                # 模块页面布局
│
├── index.html                     # 门户首页（模块选择）
├── about.html                     # 关于
├── support.html                   # 支持
├── terms.html                     # 服务条款
├── privacy.html                   # 隐私政策
├── 404.html                       # 自定义 404
├── favicon.svg                    # SVG 图标
├── Gemfile                        # Jekyll 依赖
├── sitemap.xml                    # 19 个 URL
├── robots.txt                     # 爬虫规则
├── CNAME                          # 域名配置
│
├── cie0580/                       # CIE 0580 模块
│   ├── index.html                 # 模块首页
│   ├── products.html              # 产品列表
│   ├── pricing.html               # 定价页
│   ├── free/
│   │   ├── index.html             # 免费资源下载页
│   │   └── *.pdf                  # 8 套词汇卡
│   └── products/
│       ├── algebra.html           # Algebra £15
│       ├── functions.html         # Functions £15
│       └── number.html            # Number £12
│
├── edx4ma1/                       # Edexcel 4MA1 模块
│   ├── index.html                 # 模块首页
│   ├── products.html              # 产品列表（占位）
│   ├── pricing.html               # 定价页（占位）
│   └── free/
│       ├── index.html             # 免费资源下载页
│       └── 4MA1-*.pdf             # 6 套词汇卡
│
├── amc8/index.html                # AMC 8（即将推出）
├── edx-ial-p1/index.html          # IAL P1（即将推出）
├── edx-ial-p2/index.html          # IAL P2（即将推出）
│
├── products.html                  # 旧 URL 重定向 → /cie0580/products.html
├── pricing.html                   # 旧 URL 重定向 → /cie0580/pricing.html
├── products/*.html                # 旧 URL 重定向 → /cie0580/products/*.html
├── free/index.html                # 旧 URL 重定向 → /cie0580/free/
│
├── PROJECT-PLAN.md                # 项目规划文档
└── HANDOFF.md                     # ← 本文件
```

---

## 三、下一步目标

### 近期（优先）

| # | 任务 | 说明 |
|---|------|------|
| 1 | **配置 Formspree** | 注册 formspree.io → 创建表单 → 在需要的页面添加订阅区块 |
| 2 | **提交 Google Search Console** | 验证站点所有权，提交 sitemap.xml |
| 3 | **制作 Edexcel 4MA1 付费产品** | 内容就绪后更新 edx4ma1/products.html 和 pricing.html |

### 中期

| # | 任务 | 说明 |
|---|------|------|
| 4 | **Tailwind 构建优化** | 用 Tailwind CLI 替代 CDN，生产 CSS < 10KB（当前 CDN ~300KB） |
| 5 | **AMC 8 内容上线** | 创建资源 → 在 _config.yml 改 status 为 active → 添加子页面 |
| 6 | **IAL Pure 内容上线** | 同上 |
| 7 | **生成 favicon.ico + apple-touch-icon.png** | 从 favicon.svg 转换，兼容旧浏览器和 iOS |

### 长期

| # | 任务 | 说明 |
|---|------|------|
| 8 | **订阅制** | 在 _config.yml 模块配置加 subscription_price 字段 |
| 9 | **迁移托管** | 考虑 Cloudflare Pages / Netlify（支持 301 重定向、更快 CDN） |
| 10 | **数据分析** | 添加 Plausible / Umami 等隐私友好的分析工具 |

---

## 四、常用操作指引

### 添加新模块

1. 在 `_config.yml` 的 `modules:` 下新增模块定义
2. 创建目录和 `index.html`
3. 导航栏自动更新（Liquid 循环）
4. 内容就绪后添加 products.html / pricing.html / free/
5. 更新 sitemap.xml
6. 在 _config.yml 中将 status 从 `coming_soon` 改为 `active`

### 添加新产品（已有模块）

1. 复制 `cie0580/products/algebra.html` 为模板
2. 修改：Hero 颜色、产品数据、FAQ、Gumroad 链接
3. 在模块 `products.html` 添加产品卡片
4. 更新 sitemap.xml
5. 更新 _config.yml 中的 product_count

### 添加免费资源

1. 将 PDF 放入模块 `free/` 目录
2. 在模块 `free/index.html` 添加下载卡片
3. 更新 _config.yml 中的 free_count
4. 更新门户首页统计数字
