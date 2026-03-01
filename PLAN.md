# 25maths.com 会员系统收尾计划

> 最后更新: 2026-03-01 | 总体完成度: ~80%

---

## 已完成 ✅

### R10 — 本轮会话 (3 commits)

| commit | 内容 |
|--------|------|
| `b554b2b` | 技术债 TD-2/7/8 清理 + profiles PK 修复 + 成就定义修正 + Settings 入口 + PLAN.md |
| `fdede24` | Phase 1: LEVEL_THRESHOLDS 统一 + P0 双语文案 10 处 |
| `ede8b3f` | target_board 约束对齐 + 测试框架 scripts/test-users/ + verify.js 修复 |
| (pending) | fix: 移除 root package.json 修复 Cloudflare Pages 部署失败 |

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

#### Phase 2 测试框架 ✅

| 组件 | 状态 |
|------|------|
| `scripts/test-users/setup.js` | ✅ 4 用户创建 + magic links |
| `scripts/test-users/verify.js` | ✅ 73 项检查 (65 PASS / 8 已知 FAIL) |
| `scripts/test-users/users.json` | ✅ T01 Alice / T03 Charlie / T04 Diana / T08 Henry |

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

### 优先级 P0 — 部署前必须完成

#### 1. Cloudflare Pages 部署修复

**状态**: 3 个 R10 commit 已推送，但 Cloudflare Pages 部署失败（root `package.json` 含 `lightningcss-darwin-arm64` 等 macOS 专有依赖，Linux 构建环境无法安装）

**根因**: `npm init -y && npm install @supabase/supabase-js dotenv` 在项目根目录创建了 `package.json`，Cloudflare Pages 检测到后执行 `npm install`，因平台不兼容导致构建失败。生产环境仍运行 `c40b494`（R10 之前的版本）。

**修复**: 移除 root `package.json`/`package-lock.json`，依赖迁移至 `scripts/test-users/package.json`

**操作**:
```
git push origin main
# 等待 Cloudflare Pages 重新部署
node scripts/test-users/verify.js
# 预期: profile.display_name 4个FAIL → 全部PASS
```

#### 2. 测试用户 XP 数据已重置 ✅

setup.js 重新运行后基准数据已恢复，verify.js 不再调用 POST 端点。

---

### 优先级 P1 — 近期完成

#### 3. 双语文案补全 (剩余 ~68 处)

| 文件 | 剩余 | 优先级 |
|------|------|--------|
| `membership/index.html` | ~17 | P1 |
| `membership/settings.html` | ~15 | P1 |
| `membership/parent-dashboard.html` | ~13 | P1 |
| `membership/leaderboard.html` | ~10 | P1 |
| `membership/achievements.html` | ~8 | P2 |
| `assets/js/member_downloads.js` | ~5 | P1 |

模式：`<span class="bilingual-support-only">中文</span>` 或 `<p class="bilingual-support-only text-sm text-gray-500">中文</p>`

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

| 维度 | CIE 0580 | Edexcel 4MA1 | 差距 |
|------|----------|--------------|------|
| 练习题 JSON | 124 | 78 | -46 (37%) |
| topic 覆盖 | ~70 | ~35 | 需 syllabus 分析 |

任务：
- [ ] 分析 4MA1 syllabus，确定缺失 topic
- [ ] 批量生成练习题 JSON（复用 CIE 管道）
- [ ] 产品页 + 转化漏斗

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

### 修改文件 (R10)
- `functions/_lib/supabase_server.js` — profiles PK (id → user_id)
- `functions/api/v1/user/profile.js` — VALID_BOARDS 对齐 DB
- `functions/api/v1/reports/weekly.js` — import computeLevel
- `functions/api/v1/engagement/achievements.js` — import XP_THRESHOLDS
- `functions/api/v1/engagement/check-achievements.js` — import streak_utils + date_utils
- `functions/api/v1/engagement/streak.js` — import date_utils
- `functions/api/v1/engagement/freeze.js` — import date_utils
- `functions/api/v1/exercise/session/[id]/complete.js` — import streak_utils + date_utils
- `membership/settings.html` — target_board values + 双语
- `membership/index.html` — Settings 入口 + 双语
- `membership/leaderboard.html` — 双语
- `membership/parent-dashboard.html` — 双语
- `membership/achievements.html` — sync 注释
- `assets/js/streak_widget.js` — sync 注释 + titleCn
- `zh-cn/membership/parent-dashboard.html` — sync 注释 + titleCn

---

## 当前 Git 状态

**Working tree**: clean
**Branch**: main (ahead of origin by 3 commits)

```
ede8b3f fix: profiles PK alignment, target_board constraint, test framework setup
fdede24 Phase 1: LEVEL_THRESHOLDS统一 + P0双语文案补全10处
b554b2b fix: profiles PK修复 + 成就定义数据修正 + 技术债TD-2/7/8清理 + Settings入口 + PLAN.md
c40b494 docs: update changelog and decision log for LaTeX Phase 4
```

**Cloudflare Pages 部署**: `ede8b3f` 部署失败 (root package.json 问题)，生产仍为 `c40b494`
**下一步**: 提交 package.json 修复 → `git push` → 等待 Cloudflare 重新部署 → `verify.js` 验证
