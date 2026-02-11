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
| `d80233f` | Switch free resources to Payhip and update payment provider references |
| `b96a178` | Revise refund policy for digital products |
| `d67213c` | Replace 14-day refund policy with quality promise across all pages |
| `5c25f20` | Convert GBP to USD, remove gumroad frontmatter, add private changelog |

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
| 支付 | Payhip (5% 手续费，内置邮件收集) |
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
│       ├── algebra.html           # Algebra $17
│       ├── functions.html         # Functions $17
│       └── number.html            # Number $12
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
├── admin/
│   └── changelog.html             # 私有更新日志（密码保护）
├── _layouts/
│   ├── global.html                # 门户 + 全局页面布局
│   ├── module.html                # 模块页面布局
│   └── bare.html                  # 裸布局（无导航，用于 admin 页面）
│
├── PROJECT-PLAN.md                # 项目规划文档
├── DECISIONS.md                   # 重要决策记录（按时间顺序）
├── STRATEGY.md                    # 商业策略文档（产品/定价/渠道/营销）
└── HANDOFF.md                     # ← 本文件
```

---

## 三、下一步目标

### 近期（优先）

| # | 任务 | 说明 |
|---|------|------|
| 1 | **完成付费产品 Payhip 上传** | 3 个付费产品（$17/$17/$12），需创建 Payhip listing |
| 2 | **网站付费链接更新** | 3 个产品页面 Gumroad → Payhip（待 URL） |
| 3 | **Google Search Console** | 验证站点所有权，提交 sitemap.xml |

### 新增（2026-02-11 复盘）

| # | 任务 | 说明 |
|---|------|------|
| 4 | **全站价格统一** | 产品页/列表/定价页全部 $17/$17/$12 |
| 5 | **套餐价与折扣一致** | Complete Package / 2-Bundle Deal 文案与价格同步 |
| 6 | **移除免费资源直链** | 删除或迁移 free PDF/ZIP，防绕过邮箱墙 |
| 7 | **Payhip 脚本加载策略** | 产品页加 `payhip: true` 或改为全站加载 |
| 8 | **admin 禁止索引** | robots 或 noindex |
| 9 | **README 状态更新** | 纠正“Other pages creating…”等陈述 |
| 10 | **订阅页面上线** | subscription.html + 邮件序列模板 |

---

## 2026-02-11 更新记录

- ✅ 订阅页面上线（subscription.html）+ 8 周专题规划文档
- ✅ CIE 产品页改为等待名单流程（表单 + thanks.html）
- ✅ 会员入口加到全站导航与核心页面
- ✅ 价格与文案一致性修订（$17/$17/$12，套餐 $29/$39）
- ✅ 移除站内免费 PDF 直链（Payhip 继续作为邮箱墙）
- ✅ 博客上线（/blog + 3 篇文章 + 留言表单）
- ✅ 首页加入最新文章区块，导航加入 Blog 入口
- ✅ 三语页面上线（EN/简体/繁體：首页、订阅、博客与文章）
- ✅ 三语 About/Support/Terms/Privacy 上线

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

## 四、支付与邮件系统

### Payhip 配置

**平台**: https://payhip.com
**手续费**: 5%（比 Gumroad 节省约 7-8%）

**已上传免费产品**：
1. CIE 0580 Free Resources - $0 (payhip.com/b/5j2Sz)
2. Edexcel 4MA1 Free Resources - $0 (payhip.com/b/JzU7h)

**待上传付费产品**：
3. Algebra Complete Bundle - $17.00
4. Functions & Graphs Bundle - $17.00
5. Number System Starter Pack - $12.00

**邮件自动化**（Payhip 内置）：
- ✅ 购买/下载确认邮件（自动）
- ✅ 买家邮箱收集到 Customers 列表
- ⏳ ESP 接入（100+ 订阅后考虑）

**产品链接格式**：
```
https://payhip.com/b/{PRODUCT_ID}
```

**集成方式**：
```html
<!-- _includes/head.html 中已添加 -->
<script src="https://payhip.com/payhip.js"></script>

<!-- 产品页面购买按钮 -->
<a href="https://payhip.com/b/{PRODUCT_ID}"
   data-payhip-product="{PRODUCT_ID}"
   class="payhip-button">
   Buy Now - $17.00
</a>
```

---

## 五、决策与策略文档

### 重要文档体系

| 文档 | 用途 | 更新频率 |
|------|------|---------|
| **DECISIONS.md** | 记录所有重要决策（按时间倒序） | 每次重大决策时 |
| **STRATEGY.md** | 详细商业策略（产品/定价/渠道/营销） | 随业务发展更新 |
| **HANDOFF.md** | 项目交接文档（恢复工作入口） | 每次里程碑后 |
| **PROJECT-PLAN.md** | 技术文档（设计系统/产品数据） | 功能变更时 |

### 如何使用决策文档

**做决策时**:
1. 讨论方案 → 记录到对话中
2. 确定最终方案 → Claude 整理到 `DECISIONS.md`
3. 更新相关策略 → 同步更新 `STRATEGY.md`

**查阅历史决策**:
1. 打开 `DECISIONS.md`（按时间倒序，最新在上）
2. 搜索关键词（如"定价"、"Payhip"）
3. 查看完整决策背景、原因、影响

**复盘决策效果**:
1. 每月/季度在 `DECISIONS.md` 添加复盘记录
2. 评估预期 vs 实际
3. 调整策略（更新 `STRATEGY.md`）

---

## 六、常用操作指引

### 添加新模块

1. 在 `_config.yml` 的 `modules:` 下新增模块定义
2. 创建目录和 `index.html`
3. 导航栏自动更新（Liquid 循环）
4. 内容就绪后添加 products.html / pricing.html / free/
5. 更新 sitemap.xml
6. 在 _config.yml 中将 status 从 `coming_soon` 改为 `active`

### 添加新产品（已有模块）

1. 在 Payhip 创建新产品，上传文件，获取产品链接
2. 复制 `cie0580/products/algebra.html` 为模板
3. 修改：Hero 颜色、产品数据、FAQ、Payhip 链接
4. 在模块 `products.html` 添加产品卡片
5. 更新 sitemap.xml
6. 更新 _config.yml 中的 product_count

### 添加免费资源

1. 将 PDF 放入模块 `free/` 目录
2. 在模块 `free/index.html` 添加下载卡片
3. 更新 _config.yml 中的 free_count
4. 更新门户首页统计数字
