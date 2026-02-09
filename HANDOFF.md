# 25Maths 网站 — 项目交接文档

> **最后更新**: 2026-02-09
> **状态**: 已部署上线，2 项外部服务待配置

---

## 一、当前进度总览

```
规划 ████████████ 100%
开发 ████████████ 100%  (6 个 Agent 全部完成 + 小修复 + Edexcel 资源)
审计 ████████████ 100%  (Agent F 一致性审查 + 全站验证报告)
Git  ████████████ 100%  (2 commits pushed, GitHub Pages live)
部署 ██████████░░  85%  ← 你在这里 (Formspree + Gumroad 待配置)
```

### Git 提交记录

| Commit | 描述 |
|--------|------|
| `b216472` | Complete website overhaul — all products, legal, SEO, free resources, minor fixes |
| `794e18a` | Add 6 Edexcel 4MA1 vocabulary cards to free resources |

### 已完成的 Agent 任务

| Agent | 任务 | 文件 | 状态 |
|-------|------|------|------|
| A | 产品详情页 | `products/functions.html`, `products/number.html` | ✅ 新建 |
| B | 法律 + SEO | `terms.html`, `privacy.html`, `sitemap.xml`, `robots.txt` | ✅ 新建 |
| C | 首页大修 | `index.html` | ✅ 修改 |
| D | 产品列表 + 定价 | `products.html`, `pricing.html` | ✅ 修改 |
| E | 辅助页面 + 免费资源 | `about.html`, `support.html`, `free/index.html`, 8 CIE PDF | ✅ 新建/修改 |
| F | 全站一致性审查 | `products/algebra.html`, `products.html`, `pricing.html` | ✅ 修复 |
| — | 小修复 + Edexcel | `number.html` CTA 文案、meta desc、6 Edexcel PDF | ✅ 额外修复 |

---

## 二、上线前待办清单

### 🔴 需要配置外部服务（2 项）

| # | 任务 | 操作 |
|---|------|------|
| 1 | **替换 Formspree ID** | 去 [formspree.io](https://formspree.io) 注册 → 创建 form → 在 `index.html` 中搜索 `{FORM_ID}` 替换为真实 endpoint → commit & push |
| 2 | **创建 Gumroad 产品** | 在 Gumroad 后台创建 3 个产品，URL slug 必须为：`25maths-algebra`、`25maths-functions`、`25maths-number` |

### ✅ 已修复的小问题（无需再处理）

| 问题 | 状态 |
|------|------|
| `products/number.html` CTA 写了 "algebra skills" | ✅ 已改为 "number skills" |
| `about.html` 缺 `<meta name="description">` | ✅ 已添加 |
| `pricing.html` 缺 `<meta name="description">` | ✅ 已添加 |

---

## 三、网站文件完整清单

```
25maths-website/
├── index.html              # 首页 (405 行)
├── products.html           # 产品列表 (215 行)
├── pricing.html            # 定价页 (180 行)
├── about.html              # 关于页 (160 行)
├── support.html            # 支持页 (174 行)
├── terms.html              # 服务条款 (191 行)
├── privacy.html            # 隐私政策 (196 行)
├── sitemap.xml             # SEO 站点地图 (11 URL)
├── robots.txt              # SEO 爬虫规则
├── CNAME                   # GitHub Pages 域名: www.25maths.com
├── products/
│   ├── algebra.html        # Algebra 产品页 (508 行) £15
│   ├── functions.html      # Functions 产品页 (506 行) £15
│   └── number.html         # Number 产品页 (506 行) £12
├── free/
│   ├── index.html          # 免费资源下载页 (CIE 8 + Edexcel 6)
│   ├── Algebra-Vocab-Cards.pdf           # ┐
│   ├── Coordinate-Geometry-Vocab-Cards.pdf # │
│   ├── Geometry-Vocab-Cards.pdf          # │ CIE 0580
│   ├── Mensuration-Vocab-Cards.pdf       # │ (8 套)
│   ├── Number-Vocab-Cards.pdf            # │
│   ├── Statistics-Vocab-Cards.pdf        # │
│   ├── Trigonometry-Vocab-Cards.pdf      # │
│   ├── Vectors-Vocab-Cards.pdf           # ┘
│   ├── 4MA1-Number-Vocab-Cards.pdf       # ┐
│   ├── 4MA1-Algebra-Vocab-Cards.pdf      # │
│   ├── 4MA1-Functions-Vocab-Cards.pdf    # │ Edexcel 4MA1
│   ├── 4MA1-Geometry-Vocab-Cards.pdf     # │ (6 套)
│   ├── 4MA1-Vectors-Vocab-Cards.pdf      # │
│   └── 4MA1-Statistics-Vocab-Cards.pdf   # ┘
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

## 四、技术架构速查

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

## 五、免费资源来源

| 考试局 | 数量 | 源目录 | 网站文件名前缀 |
|--------|------|--------|---------------|
| Cambridge CIE 0580 | 8 套 | `/ExamBoard/25Maths/products/freebies/` | 无前缀 |
| Edexcel 4MA1 | 6 套 | `/ExamBoard/25Maths-4MA1/products/freebies/` | `4MA1-` |

首页统计数字 "14 Free Resources" = 8 + 6 ✅

---

## 六、恢复工作指引

当你回来继续这个项目时：

### 如果要配置 Formspree
1. 注册 [formspree.io](https://formspree.io)
2. 创建新 form，获取 endpoint (格式: `f/xxxxxxxx`)
3. 在 `index.html` 中搜索 `{FORM_ID}` 替换为真实 ID
4. `git add index.html && git commit -m "fix: Add Formspree endpoint" && git push`

### 如果要继续开发
- 阅读 `tasks/reports/VERIFICATION-REPORT.md` 了解全站审计详情
- 阅读 `PROJECT-PLAN.md` 了解设计系统和产品数据
- 所有页面共享相同的 nav/footer/Tailwind 配置模式

### 如果要添加新产品
- 以 `products/algebra.html` 为模板（508 行，最完整）
- 修改：Hero 颜色、字母、产品数据、FAQ、Gumroad 链接
- 更新：`products.html` 添加卡片、`sitemap.xml` 添加 URL、footer 添加链接

### 如果要添加更多免费资源
- CIE PDF 直接放 `free/` 目录
- Edexcel PDF 用 `4MA1-` 前缀
- 更新 `free/index.html` 对应板块
- 更新首页统计数字

---

## 七、验证报告摘要

全站 15 项审计全部通过。详见 `tasks/reports/VERIFICATION-REPORT.md`。

| 审计项 | 结果 |
|--------|------|
| 文件完整性 (27 文件) | PASS |
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
| 免费资源 (14 PDF) | PASS |
