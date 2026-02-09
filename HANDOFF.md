# 25Maths 网站 — 项目交接文档

> **最后更新**: 2026-02-09
> **状态**: Wave 1 + Wave 2 全部完成，未提交 Git，未部署

---

## 一、当前进度总览

```
规划 ████████████ 100%
开发 ████████████ 100%  (6 个 Agent 全部完成)
审计 ████████████ 100%  (Agent F 一致性审查 + 全站验证报告)
Git  ░░░░░░░░░░░░   0%  ← 你在这里
部署 ░░░░░░░░░░░░   0%
```

### 已完成的 Agent 任务

| Agent | 任务 | 文件 | 状态 |
|-------|------|------|------|
| A | 产品详情页 | `products/functions.html`, `products/number.html` | ✅ 新建 |
| B | 法律 + SEO | `terms.html`, `privacy.html`, `sitemap.xml`, `robots.txt` | ✅ 新建 |
| C | 首页大修 | `index.html` | ✅ 修改 |
| D | 产品列表 + 定价 | `products.html`, `pricing.html` | ✅ 修改 |
| E | 辅助页面 + 免费资源 | `about.html`, `support.html`, `free/index.html`, 8 PDF | ✅ 新建/修改 |
| F | 全站一致性审查 | `products/algebra.html`, `products.html`, `pricing.html` | ✅ 修复 |

---

## 二、Git 状态（未提交）

### 已修改（6 个文件）
- `index.html` — 首页：产品卡 Available Now、Formspree 邮件表单、完整 footer
- `products.html` — 3 个产品卡全部可用、Google Fonts preconnect
- `pricing.html` — 移除 Coming Soon、mailto 按钮、preconnect
- `products/algebra.html` — 添加 mobile menu、修复 footer
- `about.html` — 添加 mobile menu、完整 footer
- `support.html` — 添加 mobile menu、完整 footer

### 新文件（9 个文件 + 8 PDF）
- `products/functions.html` — Functions 产品详情页
- `products/number.html` — Number 产品详情页
- `terms.html` — 服务条款
- `privacy.html` — 隐私政策
- `sitemap.xml` — 全站 11 URL
- `robots.txt` — SEO 爬虫配置
- `free/index.html` — 免费资源下载页
- `free/*.pdf` — 8 套双语词汇卡 PDF
- `tasks/` — Agent 任务文档（文档类，非网站页面）
- `PROJECT-PLAN.md` — 总体规划文档

---

## 三、部署前必做清单

### 🔴 必须完成（阻塞部署）

| # | 任务 | 位置 | 操作 |
|---|------|------|------|
| 1 | **替换 Formspree ID** | `index.html` 搜索 `{FORM_ID}` | 去 [formspree.io](https://formspree.io) 注册，创建 form，用真实 endpoint 替换 `{FORM_ID}` |
| 2 | **创建 Gumroad 产品** | Gumroad 后台 | 创建 3 个产品，URL slug 必须为：`25maths-algebra`、`25maths-functions`、`25maths-number` |
| 3 | **Git commit & push** | 终端 | 提交所有更改并推送到 GitHub，触发 Pages 部署 |

### 🟡 建议修复（不阻塞部署，但推荐）

| # | 问题 | 位置 | 修复方法 |
|---|------|------|---------|
| 1 | Number 页 CTA 写了 "algebra skills" | `products/number.html:437` | 改为 "number skills" |
| 2 | about.html 缺 meta description | `about.html` `<head>` | 添加 `<meta name="description" content="...">` |
| 3 | pricing.html 缺 meta description | `pricing.html` `<head>` | 添加 `<meta name="description" content="...">` |

---

## 四、网站文件完整清单

```
25maths-website/
├── index.html              # 首页 (405 行)
├── products.html           # 产品列表 (215 行)
├── pricing.html            # 定价页 (179 行)
├── about.html              # 关于页 (159 行)
├── support.html            # 支持页 (174 行)
├── terms.html              # 服务条款 (191 行)
├── privacy.html            # 隐私政策 (196 行)
├── sitemap.xml             # SEO 站点地图
├── robots.txt              # SEO 爬虫规则
├── CNAME                   # GitHub Pages 域名: www.25maths.com
├── products/
│   ├── algebra.html        # Algebra 产品页 (508 行) £15
│   ├── functions.html      # Functions 产品页 (506 行) £15
│   └── number.html         # Number 产品页 (506 行) £12
├── free/
│   ├── index.html          # 免费资源下载页 (227 行)
│   ├── Algebra-Vocab-Cards.pdf
│   ├── Coordinate-Geometry-Vocab-Cards.pdf
│   ├── Geometry-Vocab-Cards.pdf
│   ├── Mensuration-Vocab-Cards.pdf
│   ├── Number-Vocab-Cards.pdf
│   ├── Statistics-Vocab-Cards.pdf
│   ├── Trigonometry-Vocab-Cards.pdf
│   └── Vectors-Vocab-Cards.pdf
├── PROJECT-PLAN.md         # 总体规划（设计系统、产品数据）
├── HANDOFF.md              # ← 本文件
└── tasks/                  # Agent 任务文档
    ├── AGENT-A ~ F-*.md
    ├── AI-WORKFLOW.md
    ├── EXECUTION-PROTOCOL.md
    └── reports/
        └── VERIFICATION-REPORT.md  # 全站验证报告
```

---

## 五、技术架构速查

| 项目 | 值 |
|------|-----|
| 框架 | 纯 HTML + Tailwind CSS CDN（无构建步骤） |
| 字体 | Inter (400,500,600,700,800) via Google Fonts |
| 主色 primary | `#8B1538` (burgundy) |
| 辅色 secondary | `#2563EB` (blue) |
| 警告色 warning | `#F59E0B` (amber) |
| 成功色 success | `#10B981` (green) |
| 支付 | Gumroad（占位链接） |
| 邮件 | Formspree（占位 `{FORM_ID}`） |
| 托管 | GitHub Pages (www.25maths.com) |
| 域名 | CNAME → www.25maths.com |

---

## 六、恢复工作指引

当你回来继续这个项目时：

### 如果要部署
```bash
# 1. 先修复小问题（可选）
# 2. 替换 Formspree ID 和确认 Gumroad 链接
# 3. 提交并推送
git add -A
git commit -m "feat: Complete website overhaul — all products, legal, SEO, free resources"
git push origin main
# 4. 等待 GitHub Pages 部署，访问 www.25maths.com 验证
```

### 如果要继续开发
- 阅读 `tasks/reports/VERIFICATION-REPORT.md` 了解全站审计详情
- 阅读 `PROJECT-PLAN.md` 了解设计系统和产品数据
- 所有页面共享相同的 nav/footer/Tailwind 配置模式

### 如果要添加新产品
- 以 `products/algebra.html` 为模板（508 行，最完整）
- 修改：Hero 颜色、字母、产品数据、FAQ、Gumroad 链接
- 更新：`products.html` 添加卡片、`sitemap.xml` 添加 URL、footer 添加链接

---

## 七、验证报告摘要

全站 15 项审计全部通过。详见 `tasks/reports/VERIFICATION-REPORT.md`。

| 审计项 | 结果 |
|--------|------|
| 文件完整性 (21 文件) | PASS |
| 导航一致性 (11 页) | PASS |
| 移动端菜单 (11 页) | PASS |
| Footer 一致性 (11 页) | PASS |
| Tailwind 配色 (11 页) | PASS |
| Google Fonts (11 页) | PASS |
| "Coming Soon" 残留 | 0 匹配 PASS |
| Gumroad 链接 (6 个) | PASS |
| 内部链接 | 全部有效 PASS |
| 版权年份 2026 | PASS |
| 邮件表单 | PASS (占位符) |
| SEO 文件 | PASS |
