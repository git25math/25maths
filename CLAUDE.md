# 25Maths Website — 项目规范

> **重要**: 完整开发规范见 `docs/CONTRIBUTING.md`（适用于任何 AI/人类开发者）。
> 本文件是 Claude Code 专用的启动协议 + 结束协议。

---

## 启动协议（每次新对话必须执行）

```
┌─ 1. 读规范 ─── docs/CONTRIBUTING.md → 15 节完整规范
├─ 2. 读计划 ─── docs/DEVELOPMENT-PLAN.md → 愿景 + 进度 + 任务 + 工作流
├─ 3. Git 基线 ── git status --short && git diff --stat && git log --oneline -5
├─ 4. 构建确认 ── bundle exec jekyll build → 必须零错误
└─ 5. Tailwind ── 如涉及 CSS → npx @tailwindcss/cli -i styles/site.tailwind.css -o assets/css/site.css --minify
```

如涉及已下线的网页练习产品线，额外确认：
- `scripts/health/check_exercise_data.py` 必须继续通过；它现在是下线守卫，不再是题目数据完整性检查。
- 不要恢复 `_exercises/`、`_data/exercises/`、exercise player layout、exercise JS 或 `/api/v1/exercise/*`。
- 不要恢复 `exercise_sessions`、`question_attempts`、旧 `assignments` / `assignment_submissions` schema；最终 Supabase schema 通过迁移删除这些旧表。

## 结束协议（每次会话结束前必须执行）

```
┌─ 1. 提交 ────── git add + commit（描述性 message，含数量和变更摘要）
├─ 2. 推送 ────── git push -u origin <branch>
├─ 3. 构建确认 ── bundle exec jekyll build → 零错误（如环境可用）
├─ 4. 验证 ────── git status --short → 必须为空（工作树干净）
├─ 5. 更新文档 ── 如有里程碑变化 → 更新 docs/DEVELOPMENT-PLAN.md（进度 + 任务状态）
├─ 6. 金标准更新 ─ 如有新的质量规则 → 追加到 DEVELOPMENT-PLAN.md
├─ 7. 推送文档 ── git push origin main
├─ 8. 接手验证 ── 确认: 新窗口/新用户能否仅凭仓库文档接手？
└─ 9. 向用户确认 ─ 输出: 变更摘要 + 当前进度 + 下一步 + 是否有未完成项
```

**关键原则**: 不允许结束会话时有未提交的变更。

---

## Anti-Patterns 黑名单

> 以下行为**严格禁止**，违反会导致数据丢失或线上故障。

| # | Anti-Pattern | 正确做法 |
|---|-------------|----------|
| AP-1 | 修改 `assets/css/site.css`（编译产物） | 改 `styles/site.tailwind.css` 然后编译 |
| AP-2 | 提交 `.env` 或任何含密钥的文件 | 环境变量仅在 `.env` 中，已 gitignore |
| AP-3 | 根目录 `package.json` 加非 Tailwind 依赖 | 参见 BUG-POSTMORTEM.md #B1，会破坏 Cloudflare Pages |
| AP-4 | 恢复已下线的网页练习产品线 | 保持重定向 + 下线守卫，不重建 exercise 集合、页面或 API |
| AP-5 | "show that" 题跳步或数学错误 | 每步推导必须完整，最终等式必须验证 |
| AP-6 | EDX 文件用 CIE 的 command words | CIE: "Calculate/Show that"，EDX: "Work out/Give a reason" |
| AP-7 | Core/Foundation 题包含 Higher-only 内容 | 微积分、向量几何证明等仅限 Extended/Higher |
| AP-8 | 结束会话时有未提交的变更 | 必须 commit + push，工作树必须干净 |
| AP-9 | `service_role_key` 出现在前端代码中 | 仅在 Cloudflare Workers 侧使用 |
| AP-10 | 新增指向 `/exercises/` 的入口 | 指向 `/cie0580/free/`、`/edx4ma1/free/` 或 `/kahoot/` |

---

## 项目信息

- **部署**: push main → Cloudflare Pages → https://www.25maths.com
- **仓库**: `git25math/25maths`
- **技术栈**: Jekyll + Tailwind CSS v4 + Supabase + Cloudflare Workers + Payhip
- **状态**: 网页练习产品线和旧 telemetry schema 已下线 | 会员系统 ~98% | Free packs + Kahoot + Term Pass 保留

## 关联项目

| 项目 | 仓库 | 关系 |
|------|------|------|
| **Play 游戏** | `25maths-games-legends/` | 共享 Supabase + 用户账号 |
| **ExamHub** | `25Maths-Keywords/` | 共享 Supabase；主站提供入口 |
| **Practice** | `25maths-practice/` | 练习引擎独立化（规划中） |
| **CIE 分析** | `CIE/IGCSE_v2/analysis/` | 练习 JSON 数据源 |
| **Dashboard** | `25Maths-Dashboard/` | 运营数据可视化 |

**共享 Supabase**: ref `jjjigohjvmyewasmmmyf` — 改 DB schema 需同步三个项目

---

## 关键约束

1. **Tailwind 类名**优先，禁止新增自定义 CSS（改 `styles/site.tailwind.css`，不改 `assets/css/site.css`）
2. **双语支持**: EN 为主，ZH 用 `bilingual-support-only` 类名或 `data-zh` 属性
3. **API 安全**: 所有端点验证 `Authorization` header，`service_role_key` 仅在 Workers 侧
4. **部署安全**: 根目录 `package.json` 只能含 Tailwind 依赖（参见 BUG-POSTMORTEM.md #B1）
5. **Serverless**: 函数遵循 Cloudflare Workers `onRequest` 模式
6. **练习产品线下线**: 保持 retired exercise guard 通过；不要恢复已删除的数据、页面、JS 或 API

## 环境变量

所有脚本从 `.env` 读取（**禁止提交 git**）：
- `SUPABASE_URL` — Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY` — 服务端密钥
- `SUPABASE_ANON_KEY` — 客户端密钥
- `API_BASE_URL` — Cloudflare Workers API 地址
- `TEST_EMAIL_BASE` — 测试邮箱基础地址

---

## 文件地图

### 项目内文档

| 文件 | 用途 | 优先级 |
|------|------|--------|
| `docs/CONTRIBUTING.md` | **开发规范**（AI/人类通用唯一权威） | **必读** |
| `docs/DEVELOPMENT-PLAN.md` | **愿景 + 进度 + 任务 + 工作流 + 金标准** | **必读** |
| `docs/BUG-POSTMORTEM.md` | Bug 根因分析 + 防范规则 | 高 |
| `docs/ECOSYSTEM-ANALYSIS.md` | retired 生态系统旧快照；不要作为实现输入 | 历史 |
| `DECISIONS.md` | 决策日志 | 参考 |
| `HANDOFF.md` | 项目交接文档（非 Claude Code 用户入口） | 参考 |

### 核心源文件

| 文件 | 说明 |
|------|------|
| `_config.yml` | Jekyll 配置 + 模块定义 + Supabase 公钥 |
| `functions/_lib/supabase_server.js` | **DB 操作入口**（700+ 行），理解表结构的入口 |
| `functions/_lib/release_registry.js` | 产品元数据 + release_id 映射 |
| `assets/js/member_auth.js` | 认证客户端 |
| `styles/site.tailwind.css` | Tailwind CSS 源文件 |

### 数据库表速查（14 张 public 表）

**核心业务**: `profiles`, `membership_status`, `entitlements`, `payhip_event_log`, `member_benefit_offers`
**Engagement**: `user_streaks`, `user_xp`, `user_daily_activity`, `user_achievements`, `achievement_definitions`
**B2B（基础 schema，就绪部分）**: `institutions`, `institution_members`, `classes`, `class_students`

**已下线 DB 表**: `exercise_sessions`, `question_attempts`, `assignments`, `assignment_submissions`。不要在新代码中查询或重建这些表；历史迁移后由 `20260503080000_retire_exercise_schema.sql` 删除。

---

## 构建命令速查

```bash
# Jekyll 构建
bundle exec jekyll build

# Tailwind 编译
npx @tailwindcss/cli -i styles/site.tailwind.css -o assets/css/site.css --minify

# Health checks
python3 scripts/health/check_exercise_data.py
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_nav_consistency.py
bash scripts/health/check_style_consistency.sh
bash scripts/health/check_bilingual_coverage.sh

# Retired exercise product line guard
python3 scripts/health/check_exercise_data.py
```

---

## Workflow（强制执行）

> 所有项目统一的 Plan → Execute → Ship 流程。

### 标准开发循环

```
Plan ──→ Execute ──→ Validate ──→ Ship ──→ Document
  │         │           │          │          │
  │  分析需求   按计划逐步    构建零错误     commit     更新
  │  探索代码   遇错自动诊断   mark验证      push      DEVELOPMENT-PLAN
  │  输出计划                 测试通过      merge     DECISIONS
```

### 已下线产品线规则

网页练习产品线已经从主站移除。任何后续工作不得恢复 `_exercises/`、`_data/exercises/`、exercise player layout、exercise JS、exercise Functions API 或公开 `/exercises/` 入口；旧 URL 只保留 301 重定向。

---

## 用户偏好

- **批量执行**: 确认后按优先级自动推进
- **质量第一**: 先审查后行动，审查量化到数字
- **简洁汇报**: 版本号 + 变更摘要 + 下一步
- **每步验收**: 完成 → 验证 → 提交推送 → 合并 → 更新文档 → 下一步

<!-- BEGIN auto-synced charter v3 · do not edit · source: 25maths-planning · last sync: 2026-04-26 -->

<!-- ═══ CACHE-FRIENDLY HEADER (slow-change · ADR-0066 · 顶部 ~5K tokens 进 prompt cache) ═══ -->

## 🔴 Quick Context (Claude session · 60 秒 read · auto-cache)

**项目**:25Maths · 国际学校 IGCSE 数学 · Internal Beta · 注册即会员 · 全员免费(ADR-0058)
**身份**:NZH = 国际学校高年级数学老师(ADR-0055)
**初心**:在合规边界内把 NZH 课堂经验变自助工具(ADR-0059)
**北极星**:承接每个想学的孩子 + 软化每个焦虑的家长

**13 红线**(任一触发→紧急 ADR 复审):
- 合规 6:不收补习费/不私聊/不绕学校/不替代教师/不撮合市场/不卖老师时间(ADR-0059 § 2)
- 灵魂 7:不焦虑特性/不红点 streak/不差生排名/不同班对比/不"应该早就会"/学生永久免费/variant 1=1=1(ADR-0040 § 5)

**5 灵魂问**(每 PR 必过):温度?声音?老师?三学生?走人?(任一答错 = block)

**Cache 5 铁律**(ADR-0066):
1 慢变内容(ADR-0040/0059/V3_FINAL)不 daily edit  2 用 `---` 分隔  3 Edit > Write  4 大文件 50 行/chunk  5 5 min 内不重复 read

**`/<skills>` 可调用**(repo-committed · 跨账号):
`/25maths-context-loader` `/25maths-cache-optimizer` `/25maths-session-summarizer`

**当前 Tag**:v3.22-stages-5-7-synthesis · ADR 总数 71 · TASK 总数 137

<!-- ═══ END CACHE-FRIENDLY HEADER · 以下是详细 charter ═══ -->

---

## 25Maths Cross-Repo Charter v3.9 FINAL (auto-synced · soul-deepened · Beta · teacher-workbench)

本仓是 25Maths Learning OS 的一部分。**灵魂宪章 ADR-0040 是产品最高优先级 · 任何冲突服从此节**。

### 仓库分层(repo.L4 拆 4 类 · ADR-0029)

| 层 | 仓 | 角色 |
|---|---|---|
| L1 Constitution | git25math/25maths-os | 宪法 + ADR + 契约 |
| L2 Content data | git25math/25maths-knowledge-registry | KN ontology + DAG + routes |
| L3 Operations | git25math/25maths-planning | Phase 报告 + 战略 + 灵魂审计 · **真相源** |
| L4-platform | 25maths-practice | **25Maths 主平台** |
| L4-source | 25Maths-Keywords / 25maths-games-legends | 6 月迁移源 → 只读 → 下线 |
| L4-tool | 25maths-Visual(v3.3:Dashboard 已移出) | NZH 内部数据可视化 |
| ⛔ 独立 | 25Maths-Dashboard | NZH 个人工作台 · 不融合(ADR-0046) |
| L4-marketing | 25maths-website | 对外营销 |
| L4-pedagogy | 25maths-teaching | **教研内容源** · 用户本人创作 · 单向 ETL 流入 platform · 自留地保护(ADR-0043) |
| L4-media | math-video-engine | **视频教学源** · 1,046 元题型 · 7 板 · ISS 10 模块 · CDN/B站 · 单向 ETL(ADR-0044) |

### 创立初心(ADR-0059 · 最深动机)

> **25Maths 之所以存在,是因为家长向 NZH 求助而 NZH 不能直接帮:**
> - 学校合同 + 双减红线 = 不能私下接课收费
> - 但家长焦虑是真的 / 学生想学是真的 / NZH 教学经验是真的
> - 平台 = 在合规边界内,把 NZH 课堂经验变成自助工具的合法路径

**6 红线**(§ 2):不收补习费 / 不私聊师生 / 不绕开学校 / 不替代教师 / 不做补习市场 / 不卖老师时间。

### 灵魂宪章(ADR-0040 · 操作层)

> **这不只是一个学习网站。这是一个让孩子重新认识自己的地方。**
> 北极星 = **承接住每一个想要学的孩子 + 软化每一个焦虑的家长**(ADR-0059)

任何 PR 必过 5 灵魂问:
1. 温度问 · 学生感到被支持还是被追赶?
2. 声音问 · 学生此刻没说出口的内心 OS 是?
3. 老师问 · 更像中国老师还是酷工具?
4. 三学生问 · 差/中/优三类学生体验分层吗?
5. 走人问 · 学生离开一周回来感到温暖还是内疚?

任一答错 → block merge。详见 [ADR-0040](https://github.com/git25math/25maths-os/blob/main/decisions/0040-soul-charter.md) + [ADR-0041](https://github.com/git25math/25maths-os/blob/main/decisions/0041-feedback-voice-ironclads.md)。

### 双轨 Track 体系(ADR-0045 · v3.3)

学生的真实生态是 **学校学一套(Learning)+ 自己备考一套或多套(Exam)** 双轨并行:

- **Learning Track**(学习线 · 主线 · 必选):`hhk-sow`(哈罗海口课纲)+ 未来其他学校 SoW + `none` 自学者
- **Exam Tracks**(备考线 · 0-N 并行 · v3.4 三类分 · ADR-0047):
  - 主考(subject_exam):`cie-igcse-0580` / `edx-igcse-4ma1` / `hnzk-zhongkao` / 高考 / CIE A
  - 竞赛(competition):`ukmt-{pmc,jmc,imc,smc,bmo}` / `amc-{8,10,12}` / `aamc-*` / `kangaroo-*` / `bmmt-*` / `asdan` / IMO
  - 学术延展(academic_extension):`edx-ial-{p1-4,fp1-3,m1-3,s1-3,d1}` / 未来 CIE A Pure/Mech/Stat
- 学生 user_profile 双指针:`learning_track`(单)+ `exam_tracks[]`(多 · 含 track_category)
- UI 主页四区:📚 我在学 + 🎯 我的主考 + 🏆 我的竞赛 + 🎓 我的 A Level + 💡 智能融合(KP 跨 track 重叠)

### MUST READ(任何 session 启动前 · v3.9 final)

- 🔴 [planning/V3_FINAL_CHEATSHEET.md](https://github.com/git25math/25maths-planning/blob/main/V3_FINAL_CHEATSHEET.md) · **60 秒读完即知 · single source of truth**
- [planning/CLAUDE.md](https://github.com/git25math/25maths-planning/blob/main/CLAUDE.md) · session 宪章
- [planning/PROJECT_FUSION_PLAN_V3.md](https://github.com/git25math/25maths-planning/blob/main/PROJECT_FUSION_PLAN_V3.md) · 60 ADR + 115 TASK 全表
- [planning/AUDIT_FRAMEWORK.md](https://github.com/git25math/25maths-planning/blob/main/AUDIT_FRAMEWORK.md) · 6 维度 + § 12-§ 14 trigger / 四轴 / 灵魂自检
- [planning/STUDENT_PLEDGE.md](https://github.com/git25math/25maths-planning/blob/main/STUDENT_PLEDGE.md) · 9 封信反向验证
- [planning/SOUL_INVARIANTS_TEST_SUITE.md](https://github.com/git25math/25maths-planning/blob/main/SOUL_INVARIANTS_TEST_SUITE.md) · 12 套测试 80 断言

### 四轴度量(Beta 期 · ADR-0035 + ADR-0058 § 6)

Beta 期:`code` / `experience` / **`data_collection`**(替代 commercial)/ `soul`
Exit-Beta 后:`commercial` 复位

M2 目标:code 75% / experience 50% / data_collection 60% / **soul 80%**(灵魂轴最严格 · < 70% 阻 Phase)

### 两套红线(命名清晰)

**合规红线 6 条**(ADR-0059 § 2 · 法律 / 合同 / 双减):
1. 不收补习费(K-12 双减禁)
2. 不私聊师生(学校合同)
3. 不绕开学校
4. 不替代教师(平台 = 自助 amplifier)
5. 不做撮合市场(允 SaaS 工具 · ADR-0060 § 4 精确化)
6. 不卖老师时间

**灵魂红线 7 条**(ADR-0040 § 5 反向 · 行为表现层):
1. 反向论证"为 KPI 必加焦虑特性"
2. trigger 反向驱动 UI 红点 / streak / 倒计时
3. 教师 dashboard 出现"差生排名" / 公开比较
4. 家长报告出现"成绩不如同班 X%"
5. "你应该早就会了" 语义出现在系统反馈
6. 学生练习核心收费(永远免费 · ADR-0025/0058)
7. variant_mastery 降级到 unit/section 级(违反 1=1=1)

任一 13 红线触发 → ADR 紧急复审。

### 北极星(v3.7 Beta 极简版)

**身份**:由一名 IGCSE 国际学校高年级数学老师为他班里的孩子亲手搭建(ADR-0055)
**阶段**:**Internal Beta · 注册即会员 · 全员免费 · 不商业化 · 信息收集为主**(ADR-0058)
**使命**:**承接住每一个想要学的孩子,从能够接受的地方开始,手把手陪着重建自信**
**节奏**:M1-M6 = 12 月对齐学校 academic calendar(ADR-0056)· Summer Break 集中 sprint
**铁律**:无 paywall / 无 Stripe / 无 SKU / 无 user_vip / 无 paywall_impressions · 只 analytics_events
**Exit-Beta**:NZH 显式签 ADR 才结束 · 无自动退出 · 4 季度自检
**Post-Beta 商业引擎**(ADR-0060):**独立教师工作台 SaaS** ¥99-299/月 · 学生家长永久免费 · 不撮合 / 不抽佣 / 工具供应商身份

### 冲突仲裁

ADR-0040 灵魂宪章 > L1 概念 > L3 prod 状态 > L2 KN 数据 > L4 实施 · prod 偏离记录在 L1 ADR。

<!-- END auto-synced charter v3 -->
