# 25Maths 网站 — 项目交接文档

> **最后更新**: 2026-03-01
> **状态**: 已部署上线（会员系统 E2E 验证通过 + Engagement + 双语补全）
> **网站**: https://www.25maths.com

---

## 一、当前进度总览

```
规划 ████████████ 100%
开发 ████████████ 100%  (初版 + Edexcel 资源 + 模块化重构)
审计 ████████████ 100%  (3 轮审计 + 全部修复)
部署 ████████████ 100%  (Jekyll 构建，GitHub Pages + Cloudflare)
会员 ████████████  98%  (认证/支付/下载/Engagement/双语/E2E — 剩余:成就阈值审查+等级统一)
双语 ████████████ 100%  (toggle 基础 + 静态覆盖 + JS t() 动态翻译)
LaTeX ████████████  99%  (Phase 1-4 完成，仅剩浏览器端渲染验证)
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
| `339f42a` | **会员成就系统 3 Bug 修复** — 等级阈值统一 + improvement 评估 + volume 累计 |
| `f3739da` | **公共模块重构** — 提取 achievement_evaluator.js |
| `bd78109` | **LaTeX Phase 1** — Unicode 上标/根号/希腊字母→LaTeX（108 个 JSON） |
| `731ad30` | **LaTeX Phase 2** — 纯文本分数→`\frac{}{}`（170 个 JSON） |
| `ab48f5e` | **账户设置页** — Profile CRUD API + settings.html |
| `269fe7f` | **双语文案补全** — 6 个会员 JS/HTML 文件，~60 处中文翻译 |
| `47bc9b9` | **Hero 颜色修复** — text-gray-300/text-blue-300 品牌色覆盖 |
| `fb85ac8` | **Last-mile delivery** — releases.json 数据修复 + member_downloads.js + membership UI |
| `7e8b4b1` | **E2E 测试通过** — webhook→24 entitlements→24 签名 URL→PDF，26/26 PASS |
| `9cb4c59` | **LaTeX Phase 3** — 批量 KaTeX 转换（161 JSON，4,574 新表达式：分数/角度/幂次/根号/希腊/代数） |
| (待提交) | **LaTeX Phase 4** — KaTeX 质量保证：102 个 JSON 文件 ~1,094 处修复（合并伪影/嵌套定界符/断裂表达式/缺失定界符），4 个自动化脚本 + 人工逐文件审查 |

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

> 详细开发计划见 `docs/membership-status-2026-03-01.md` 第五节

### P1 — 会员体系收尾（98%，剩余 2 项）

| # | 任务 | 状态 |
|---|------|------|
| 1 | 成就 seed 数据审查（20 个定义的 criteria 阈值） | 待做 |
| 2 | `weekly.js` 引入 `computeLevel` 统一等级计算 | 待做 |
| ~~3~~ | ~~releases.json 数据修复（22/24 payhip_product_id 为空）~~ | ✅ 完成 |
| ~~4~~ | ~~member_downloads.js 下载 UI~~ | ✅ 完成 |
| ~~5~~ | ~~Cloudflare Worker proxy 部署~~ | ✅ 完成 |
| ~~6~~ | ~~Payhip webhook URL 配置~~ | ✅ 完成 |
| ~~7~~ | ~~E2E 全链路测试（26/26 PASS）~~ | ✅ 完成 |

### P1.5 — LaTeX 数学渲染（Phase 4）

| # | 任务 | 状态 |
|---|------|------|
| ~~3~~ | ~~批量 KaTeX 转换（分数/角度/幂次/根号/希腊/代数）~~ | ✅ 完成（`9cb4c59`，161 文件，4,574 新转换） |
| ~~4~~ | ~~边缘 case 修复（合并伪影/嵌套定界符/断裂表达式/缺失 $）~~ | ✅ 完成（102 文件，~1,094 处修复，4 个自动化脚本 + 人工审查） |
| 5 | KaTeX 浏览器端渲染验证（抽样检查关键题型） | 待做 |

### P2 — Edexcel 4MA1 补齐

| # | 任务 | 状态 |
|---|------|------|
| 6 | 产品详情页 + CTA 优化 | 待做 |
| 7 | Edexcel 练习 JSON 扩充（当前 202 题全是 CIE） | 待做 |

### P3 — 内容与增长

| # | 任务 | 状态 |
|---|------|------|
| 8 | 5 篇 Blog 文章（SEO 长尾词） | 待做 |
| 9 | GA4 事件追踪 + Google Search Console | 待做 |

### P4 — 未来 Feature

| # | 任务 | 状态 |
|---|------|------|
| 10 | B2B 教师系统（5 张 DB 表已建，零 API） | 未开始 |
| 11 | fill-in-the-blank 题型 | 未开始 |
| 12 | 周报邮件推送 | 未开始 |

---

## 2026-02-11 ~ 03-01 已完成里程碑

- ✅ 订阅页面上线 + CIE 产品等待名单流程 + 价格统一
- ✅ 博客上线（/blog + 3 篇文章）
- ✅ 双语架构重构（EN 为主 + bilingual toggle + Cloudflare 301 重定向）
- ✅ 会员系统全栈（认证/Payhip 支付/仪表盘/下载/福利/推荐）
- ✅ Engagement 系统（Streak/XP/成就/排行榜/家长视图/周报）
- ✅ 练习引擎（202 题 + session/attempt API + 成就触发）
- ✅ LaTeX 数学渲染 Phase 1-2（上标/根号/分数，278 个 JSON）
- ✅ LaTeX Phase 3 — 批量 KaTeX 转换（161 JSON，4,574 新表达式，总计 8,731 处 LaTeX）
- ✅ LaTeX Phase 4 — KaTeX 质量保证（102 JSON，~1,094 处修复：547 合并伪影 + 218 断裂模式 + 329 嵌套定界符 + ~18 人工修复，0 剩余 LaTeX 错误）
- ✅ 会员 JS/HTML 双语文案补全（6 文件，~60 处翻译）
- ✅ 账户设置页（Profile CRUD API）
- ✅ Last-mile 会员交付（releases.json 数据修复 + 下载 UI + Worker proxy 部署）
- ✅ E2E 全链路验证（Payhip webhook → 24 entitlements → 24 签名 URL → PDF 下载）
- ✅ Payhip webhook 配置（sale_completed 事件→www.25maths.com/api/v1/membership/webhook/payhip）

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
