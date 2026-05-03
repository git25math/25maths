# 30-60-90 Day Execution Plan

> **起始日期**: 2026-02-10
> **网站**: https://www.25maths.com
> **支付平台**: Payhip (5% 手续费)

---

## 核心约束原则

> "凡是不会影响你收到第一笔钱的事情，一律延后。"

---

## Day 1-30: 第一笔收入（2026-02-10 → 03-12）

**核心目标**: 完成付费产品上线，获得第一笔付费订单

### 🔴 进行中：Algebra Bundle v2.0 重构（2026-02-11）

**问题**: 当前付费产品质量不如免费版（用户要求"至少超过免费的2-3倍"）

**解决方案**: 
- [ ] **Algebra Mastery Guide** - 完全重写词汇卡（43术语→20概念，增加实例+常见错误+考试技巧）
- [ ] **Practice Worksheets** - 视觉升级（修复品牌、移除假促销、添加背景）
- [ ] **Quick Reference** - 视觉升级（添加信息框、改进排版）

**技术切换**: NZH-MathPrep → 25Maths-Theme.sty（统一品牌）

### 📋 待完成任务

- [ ] 完成 Algebra Bundle v2.0 编译和 QA
- [ ] 上传到 Payhip（替换旧版本）
- [ ] Functions Bundle 质量审查（是否需要重构？）
- [ ] Number Bundle 质量审查（是否需要重构？）
- [ ] **结合 Edexcel 4MA1 考纲按“每个小考点”更新 Kahoot 题组，并创建对应 worksheet + 下一页答案解析**
- [ ] 网站付费链接 Gumroad → Payhip
- [ ] Google Search Console 提交
- [ ] 第一篇社交媒体内容（小红书/Reddit）

**指标**: 第一笔付费订单

---

## 2026-02-11 网站进展复盘 → 待办清单（按优先级）

### P0+ 会员系统开发（✅ 全部完成，2026-02-18 → 03-01）
- [x] **建立指挥中枢与执行标准**
  - 指挥文档：`plan/MEMBER-SYSTEM-COMMAND-CENTER.md`
  - 执行基线：`plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md`
  - 调度脚本：`scripts/member/dispatch_member_agents.sh`
- [x] **完成 Supabase 生产路径准备**
  - Auth 回调 URL 配置完成（本地 + 生产）
  - OTP 登录上线（自定义 SMTP 未接入，使用 Supabase 默认）
- [x] **完成数据层与权限控制**
  - 14 张最终 public 表：profiles、membership_status、entitlements + engagement 5 表 + B2B 基础 4 表 + payhip_event_log + member_benefit_offers
  - RLS：全部 18 表启用，用户仅能读写本人数据
- [x] **网页练习产品线下线**
  - 移除旧题目集合、页面、播放器 JS 和 Functions API
  - 旧 URL 通过 `_redirects` 指向免费资源页
  - `scripts/health/check_exercise_data.py` 改为下线守卫
- [x] **会员下载权限网关**
  - Webhook：`POST /api/v1/membership/webhook/payhip` — E2E 验证通过（24 entitlements granted）
  - 下载：`GET /api/v1/download/:release_id` — E2E 验证通过（24/24 签名 URL → PDF）
  - Cloudflare Worker proxy 部署（`www.25maths.com/api/*` → Pages Functions）
- [x] **题库双渠道发布清单**
  - `_data/releases.json`（25 条）+ `release_registry.js` 同步
  - Payhip 产品 eN4l6（$24.99 Term Practice Pass）上线
  - Payhip webhook URL 已配置

### P0 直接影响收入与信任
- [x] **Payhip 付费产品上线** — Term Practice Pass eN4l6 ($24.99) 已上线
- [ ] **替换付费产品购买链接**（Gumroad → Payhip，3 个产品页）— 3 个 Bundle 产品待上传
- [x] **Payhip 脚本加载** — payhip.js 已全站加载
- [ ] **全站价格统一为 $17/$17/$12**（产品页 + 产品列表 + 定价页）
- [ ] **套餐价与折扣一致**（Complete Package、2-Bundle Deal 文案与价格）
- [x] **移除站内直链免费 PDF/ZIP** — 已改为 Payhip 邮箱墙

### P1 转化与一致性
- [ ] **Kahoot + Worksheet 闭环继续完善**
  - 新内容入口统一指向免费 worksheet、Kahoot 和 paid bundle，不再生成网页练习页
- [ ] **Algebra Bundle v2.0 完成重构与 QA**
- [ ] **Functions/Number Bundle 质量审查**
- [ ] **定价页“School & Bulk Licensing”是否保留**（若暂不做则下线）
- [ ] **README 状态更新**（与当前实际进度一致）
- [x] **订阅页面上线**（subscription.html）
- [x] **订阅节奏与8周专题表落地**（见 plan/SUBSCRIPTION-PLAN.md）
- [x] **博客与主页入口上线**（/blog + 首页最新文章）
- [x] **移除 AMC8 / IAL P1 / IAL P2 模块**
- [x] **Waitlist 架构升级（单端点 + 分专题标签）**
  - 方案文档：`plan/WAITLIST-GSHEETS-PLAN.md`
  - 脚本模板：`plan/WAITLIST-GSHEETS.gs`
  - 表单改造：6 个产品页共 12 个入口统一到一个 endpoint，并保留 `topic/lang/source_page` 字段

### P2 SEO 与可维护性
- [ ] **admin 页面禁止索引**（robots 或 noindex）
- [ ] **产品页补充 OG 图**（提升分享转化）
- [ ] **sitemap.xml lastmod 更新**（完成修改后）

### P3 性能优化（可延后）
- [ ] **Tailwind CDN → 构建版 CSS**
- [ ] **生成 favicon.ico 与 apple-touch-icon**

---

## Day 31-60: 自动化（2026-03-13 → 04-11）

**核心目标**: 建立邮件自动化流程，扩展产品线

- [ ] 100+ 邮箱后接入 ESP（Mailchimp/ConvertKit）
- [ ] 欢迎邮件序列设置
- [ ] Edexcel 4MA1 第一个付费产品

**指标**: 月销 10+ 单，邮箱 100+

---

## Day 61-90: 评估与扩展（2026-04-12 → 05-11）

**核心目标**: 复盘数据，决定扩展方向

- [ ] 复盘 60 天数据
- [ ] 决定是否 TPT/TES 引流
- [ ] 考虑 AMC 8 / IAL 扩展

**指标**: 月销 30+ 单，邮箱 300+

---

## 明确延后（不影响第一笔钱）

以下事项在当前阶段明确不做：

- Tailwind CSS 构建优化（CDN 够用）
- 订阅制模式（产品线不够丰富）
- 托管迁移（GitHub Pages 够用）
- 数据分析工具（流量太少没意义）
- TPT/TES 平台上传（先验证独立销售）
- TikzVault 与 25maths-website 联动（作为后备资源，当前阶段不开发）

---

## 已完成

- [x] 免费资源 Payhip 上线（CIE: payhip.com/b/5j2Sz, 4MA1: payhip.com/b/JzU7h）
- [x] 网站免费下载链接 → Payhip 邮箱墙
- [x] 退款政策：All Sales Final + Quality Promise
- [x] 货币迁移：GBP → USD 全站
- [x] IP 条款强化（terms.html）
- [x] 战略框架整合（STRATEGY.md, DECISIONS.md）
- [x] Waitlist 数据方案落地（Google Sheets 去重模型：email 主键 + topic 标签）
- [x] 免费赠品漏斗上线（统一问卷入口 + 感谢页双资源下载）
  - 页面：`/free-gift.html`、`/en/free-gift.html`、`/zh-cn/free-gift.html`
  - 感谢页：`/gift-thanks.html`、`/en/gift-thanks.html`、`/zh-cn/gift-thanks.html`
  - 入口替换：首页 + CIE/Edexcel 免费资源 CTA 改为问卷领取
- [x] **会员系统全栈完成** (2026-03-01)
  - 认证（OTP）+ 支付（Payhip webhook）+ 下载（签名 URL）+ 权益（24 entitlements）
  - Engagement 系统（streak/XP/成就/排行榜/家长面板）
  - 12 周下载 UI（member_downloads.js）
  - Cloudflare Worker proxy 部署
  - E2E 测试 26/26 项通过
- [x] **账户设置页** (2026-03-01) — Profile CRUD API + settings.html (`ab48f5e`)
- [x] **会员 JS/HTML 双语文案补全** (2026-03-01) — 6 文件 ~60 处翻译，isZh()+t() 模式 (`269fe7f`)
- [x] **Hero 颜色修复** (2026-03-01) — text-gray-300/text-blue-300 品牌色覆盖 (`47bc9b9`)
- [x] **LaTeX Phase 1** (2026-03-01) — Unicode 上标/根号/希腊字母→LaTeX，108 个 JSON (`bd78109`)
- [x] **LaTeX Phase 2** (2026-03-01) — 纯文本分数→\frac{}{}，170 个 JSON (`731ad30`)
- [x] **LaTeX Phase 3** (2026-03-01) — 批量 KaTeX 转换（分数/角度/幂次/根号/希腊/代数），161 JSON，4,574 新转换，总计 8,731 处 (`9cb4c59`)
- [x] **LaTeX Phase 4** (2026-03-01) — KaTeX 质量保证：102 文件 ~1,094 处修复（合并伪影/嵌套定界符/断裂表达式/缺失定界符），4 个自动化脚本 + 9 文件人工修复，0 剩余 LaTeX 错误
