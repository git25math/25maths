# 25maths.com 会员系统收尾计划

> 最后更新: 2026-03-01 | 总体完成度: ~85%

---

## 已完成 ✅

### R10 — 本轮会话 (6 commits)

| commit | 内容 |
|--------|------|
| `b554b2b` | 技术债 TD-2/7/8 清理 + profiles PK 修复 + 成就定义修正 + Settings 入口 + PLAN.md |
| `fdede24` | Phase 1: LEVEL_THRESHOLDS 统一 + P0 双语文案 10 处 |
| `ede8b3f` | target_board 约束对齐 + 测试框架 scripts/test-users/ + verify.js 修复 |
| `1482e30` | fix: 移除 root package.json 修复 Cloudflare Pages 部署失败 |
| `e8ca831` | i18n: membership 5 页双语补全 60 处 |
| `73adf90` | feat: Edexcel 4MA1 页面对齐 CIE 0580 (5 项快速修复) |

#### 技术债清理

| # | 项目 | 状态 |
|---|------|------|
| TD-2 | weekly.js import `computeLevel` | ✅ |
| TD-7 | streak 逻辑提取至 `streak_utils.js` | ✅ |
| TD-8 | 日期函数提取至 `date_utils.js` | ✅ |

#### Bug 修复

| 项目 | 状态 |
|------|------|
| profiles PK (`id` → `user_id`) | ✅ supabase_server.js fetchProfile/upsertProfile |
| target_board 约束 (`CIE 0580` → `cie0580`) | ✅ profile.js VALID_BOARDS + settings.html option values |
| 成就定义 4 条修正 (explorer-all/streak-7/streak-60/accuracy-100-5) | ✅ Supabase 直接 UPDATE |
| titleCn 不一致 (实践者/IGCSE冠军) | ✅ streak_widget.js + zh-cn/parent-dashboard.html |

#### Phase 1.1 LEVEL_THRESHOLDS 统一 ✅

| 文件 | 改动 |
|------|------|
| `functions/api/v1/engagement/achievements.js` | import XP_THRESHOLDS 替代硬编码 |
| `membership/achievements.html` | + sync 注释 |
| `membership/parent-dashboard.html` | + sync 注释 |
| `zh-cn/membership/parent-dashboard.html` | + sync 注释 + titleCn 修正 |
| `assets/js/streak_widget.js` | + sync 注释 + titleCn 修正 |

#### Phase 1.2 P0 双语 10 处 ✅

| 文件 | 补全项 |
|------|--------|
| `membership/index.html` | 学习概况、每周练习包、高频错题集群、针对性练习计划、FAQ+3组Q&A |
| `membership/settings.html` | 账户概要、个人资料、保存更改 |
| `membership/parent-dashboard.html` | 登录查看学习进度 |
| `membership/leaderboard.html` | 你的排名 |

#### Phase 1.3 双语补全 60 处 ✅

| 文件 | 补全数 |
|------|--------|
| `membership/index.html` | 17 (Members Only, Last 30 Days, 5 快捷链接, 4 统计标签, 近期练习, 会员权益等) |
| `membership/settings.html` | 10 (4 概要字段, 4 表单标签, 退出登录区域) |
| `membership/parent-dashboard.html` | 12 (家长入口, 描述, 4 表头, 统计标签, 登录提示等) |
| `membership/leaderboard.html` | 12 (游戏化, 描述, 6 表头, 2 按钮等) |
| `membership/achievements.html` | 9 (描述, 已解锁, 7 筛选按钮) |

**合计: P0 (10) + P1.3 (60) = 70 处双语补全完成**

#### Phase 2 测试框架 ✅

| 组件 | 状态 |
|------|------|
| `scripts/test-users/setup.js` | ✅ 4 用户创建 + magic links |
| `scripts/test-users/verify.js` | ✅ 73 项检查 — **73/73 PASS** |
| `scripts/test-users/users.json` | ✅ T01 Alice / T03 Charlie / T04 Diana / T08 Henry |

#### 部署修复 ✅

**问题**: root `package.json` 含 `lightningcss-darwin-arm64` 等 macOS 专有依赖 → Cloudflare Pages Linux 构建失败
**修复**: 移除 root `package.json`/`package-lock.json`，依赖迁移至 `scripts/test-users/package.json`
**部署**: 手动 `wrangler pages deploy` 至 `25maths` + `25maths-website` 两个项目，Functions bundle 上传成功

#### Edexcel 4MA1 页面对齐 ✅

| # | 任务 | 文件 | 改动 |
|---|------|------|------|
| 1 | UI chip 统一 | `edx4ma1/products.html` | raw `token-chip` → `{% include ui/board-status-chip.html board='edx' %}` |
| 2 | 产品子页面 redirect | `edx4ma1/products/{algebra,functions,number}.html` | 3 个新文件，redirect → `/edx4ma1/products.html` |
| 3 | "Try before you buy" CTA | `edx4ma1/products.html` | Kahoot + 免费下载 双 CTA 区块 |
| 4 | Value Propositions 3 卡片 | `edx4ma1/index.html` | Bilingual / Syllabus-Aligned / Quality，文案适配 4MA1 |
| 5 | Statistics 指标补全 | `edx4ma1/index.html` | 3→4 列，新增 Edexcel free/Kahoot coverage |

### 之前已完成（Round 1-9）

| 轮次 | 内容 | commit |
|------|------|--------|
| R1 | Blog 系统 (16 篇 EN+ZH) | `b9f0420` |
| R2 | SEO & 本地化 | `9d45f43` |
| R3 | 设计一致性审计 | `3d7823d` |
| R4 | 交叉链接 & 质量审计 | `20aa975` |
| R5 | 性能 & SEO | `d47cc8a` |
| R6 | 无障碍 & 安全审计 | `eaf4815` |
| R7 | 练习题 LaTeX Phase 1-2 | `731ad30` |
| R8 | 会员系统 last-mile (E2E 26/26) | `f6bb787` |
| R9 | KaTeX Phase 3-4 (8,731 表达式) | `c40b494` |

---

## 待完成任务

### 优先级 P0 — 全部完成 ✅

| 项目 | 状态 |
|------|------|
| Cloudflare Pages 部署修复 | ✅ `1482e30` + 手动 wrangler deploy |
| 测试用户 XP 数据重置 | ✅ setup.js 重新运行 |
| verify.js 73/73 PASS | ✅ 全部通过 |

---

### 优先级 P1 — 近期完成

#### 3. 双语文案补全 — ✅ 70/78 完成

**HTML 页面: 70 处 ✅** (P0: 10 + P1.3: 60)

| 文件 | 状态 |
|------|------|
| `membership/index.html` | ✅ 17 处 |
| `membership/settings.html` | ✅ 10 处 |
| `membership/parent-dashboard.html` | ✅ 12 处 |
| `membership/leaderboard.html` | ✅ 12 处 |
| `membership/achievements.html` | ✅ 9 处 |

**JS 文件: 剩余 ~8 处（需 i18n 框架支持，暂不处理）**

| 文件 | 剩余 | 说明 |
|------|------|------|
| `assets/js/member_downloads.js` | ~5 | JS 动态生成文案，需 t() 或类似 i18n 机制 |
| Retired exercise JS | 0 | 已删除；不再跟踪该文件的 i18n 工作 |

---

### 优先级 P2 — 可选改进

#### 4. 遗留代码项

| 项目 | 说明 |
|------|------|
| KaTeX CSS 预加载 | `<link rel="preload" as="style">` |
| sitemap.xml lastmod 自动化 | hook 到 build 流程 |
| ~86 KaTeX 边缘用例 | 负数上标、嵌套 sqrt 等 |
| 练习筛选器缺 id | `<select>` 无障碍修复 |

#### 5. CSP unsafe-inline 迁移

需 nonces/hashes，影响所有内联 `<script>`。工作量大，可后续专项处理。

---

### 优先级 P3 — 远期规划

#### 6. Edexcel 4MA1 补齐

**页面对齐: ✅ Phase 1 完成** — UI chip / 产品子页 / Try before you buy / Value Props / Statistics

**剩余差距:**

| 维度 | CIE 0580 | Edexcel 4MA1 | 差距 | 优先级 |
|------|----------|--------------|------|--------|
| 练习 JSON | 124 (1,488q) | 78 (936q) | -46 ex / -552q (37%) | P3 |
| Domain 覆盖 | 9 | 6 | 缺 algebra/coordinate/mensuration/probability/transformations/trigonometry | P3 |
| Topic 覆盖 | 98 | 52 | -46 | P3 |
| releases.json | 25 条 | 0 条 | EDX 无 release → 无法下载/授权 | P2 |
| release_registry.js | 有 CIE | 无 EDX | 无法触发 entitlement | P2 |
| Term Practice Pass | ✅ $24.99 | ❌ 无 | 需商业决策 | P3 |
| subscription.html | CIE 专属 | 无 EDX 版 | 需新建或扩展 | P3 |

任务：
- [ ] `releases.json` + `release_registry.js` 注册 EDX 产品 (P2)
- [ ] 分析 4MA1 syllabus，确定缺失 topic (P3)
- [ ] 批量生成练习题 JSON — 复用 CIE 管道 (P3)
- [ ] EDX Term Practice Pass 产品化 — Payhip + subscription 页 (P3)

#### 7. 内容与增长

- [ ] Blog: IGCSE 备考系列
- [ ] GA4: 事件追踪 (session_complete, achievement_unlock, download)
- [ ] SEO: FAQ 结构化数据, breadcrumbs
- [ ] Email: 周报模板 (weekly_report_enabled)

---

## 关键文件索引

### 新建文件 (R10)
- `functions/_lib/date_utils.js` — formatDateStr, subtractDays
- `functions/_lib/streak_utils.js` — updateStreak (统一 freeze + 防护)
- `scripts/test-users/setup.js` — 测试用户创建
- `scripts/test-users/verify.js` — DB + API 验证 (73 项)
- `scripts/test-users/users.json` — 4 用户配置 + 24 CIE release_id
- `edx4ma1/products/algebra.html` — redirect → /edx4ma1/products.html
- `edx4ma1/products/functions.html` — redirect → /edx4ma1/products.html
- `edx4ma1/products/number.html` — redirect → /edx4ma1/products.html

### 修改文件 (R10)
- `functions/_lib/supabase_server.js` — profiles PK (id → user_id)
- `functions/api/v1/user/profile.js` — VALID_BOARDS 对齐 DB
- `functions/api/v1/reports/weekly.js` — import computeLevel
- `functions/api/v1/engagement/achievements.js` — import XP_THRESHOLDS
- Retired `functions/api/v1/engagement/check-achievements.js`; no public endpoint writes exercise-based achievement events.
- `functions/api/v1/engagement/streak.js` — import date_utils
- `functions/api/v1/engagement/freeze.js` — import date_utils
- Retired online exercise API files removed; engagement remains on non-exercise membership surfaces.
- `membership/settings.html` — target_board values + 双语补全 (P0+P1.3 共 13 处)
- `membership/index.html` — Settings 入口 + 双语补全 (P0+P1.3 共 25 处)
- `membership/leaderboard.html` — 双语补全 (P0+P1.3 共 13 处)
- `membership/parent-dashboard.html` — 双语补全 (P0+P1.3 共 13 处)
- `membership/achievements.html` — sync 注释 + 双语补全 (9 处)
- `assets/js/streak_widget.js` — sync 注释 + titleCn
- `zh-cn/membership/parent-dashboard.html` — sync 注释 + titleCn
- `edx4ma1/index.html` — Value Propositions + Statistics 4 列
- `edx4ma1/products.html` — board-status-chip + "Try before you buy"

---

## 当前 Git 状态

**Working tree**: clean (PLAN.md 待提交)
**Branch**: main — 已推送并部署

```
73adf90 feat: Edexcel 4MA1 page parity with CIE 0580
e8ca831 i18n: complete bilingual labels for all membership pages (60 additions)
1482e30 fix: remove root package.json to fix Cloudflare Pages deployment
ede8b3f fix: profiles PK alignment, target_board constraint, test framework setup
fdede24 Phase 1: LEVEL_THRESHOLDS统一 + P0双语文案补全10处
b554b2b fix: profiles PK修复 + 成就定义数据修正 + 技术债TD-2/7/8清理 + Settings入口 + PLAN.md
c40b494 docs: update changelog and decision log for LaTeX Phase 4
```

**Cloudflare Pages 部署**: ✅ `73adf90` 已通过 `wrangler pages deploy` 部署至 `25maths` + `25maths-website`
**verify.js**: ✅ 73/73 PASS
**下一步**: P2 releases.json EDX 注册 → P3 练习内容补齐
