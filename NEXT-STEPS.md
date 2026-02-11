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
- [ ] 网站付费链接 Gumroad → Payhip
- [ ] Google Search Console 提交
- [ ] 第一篇社交媒体内容（小红书/Reddit）

**指标**: 第一笔付费订单

---

## 2026-02-11 网站进展复盘 → 待办清单（按优先级）

### P0 直接影响收入与信任
- [ ] **Payhip 付费产品上线**（获取 3 个付费产品 URL）
- [ ] **替换付费产品购买链接**（Gumroad → Payhip，3 个产品页）
- [ ] **Payhip 脚本加载**（产品页增加 `payhip: true` 或全站加载）
- [ ] **全站价格统一为 $17/$17/$12**（产品页 + 产品列表 + 定价页）
- [ ] **套餐价与折扣一致**（Complete Package、2-Bundle Deal 文案与价格）
- [ ] **移除站内直链免费 PDF/ZIP**（避免绕过邮箱墙）

### P1 转化与一致性
- [ ] **Algebra Bundle v2.0 完成重构与 QA**
- [ ] **Functions/Number Bundle 质量审查**
- [ ] **定价页“School & Bulk Licensing”是否保留**（若暂不做则下线）
- [ ] **README 状态更新**（与当前实际进度一致）
- [x] **订阅页面上线**（subscription.html）
- [x] **订阅节奏与8周专题表落地**（见 plan/SUBSCRIPTION-PLAN.md）
- [x] **博客与主页入口上线**（/blog + 首页最新文章）

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

---

## 已完成

- [x] 免费资源 Payhip 上线（CIE: payhip.com/b/5j2Sz, 4MA1: payhip.com/b/JzU7h）
- [x] 网站免费下载链接 → Payhip 邮箱墙
- [x] 退款政策：All Sales Final + Quality Promise
- [x] 货币迁移：GBP → USD 全站
- [x] IP 条款强化（terms.html）
- [x] 战略框架整合（STRATEGY.md, DECISIONS.md）
