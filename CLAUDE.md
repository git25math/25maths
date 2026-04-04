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

如涉及练习/组卷，额外读取：
- `docs/EXERCISE-SCHEMA.md` → v2 schema 规范（含工作流 + 金标准）
- `docs/examples/exercise-variants-showcase.json` → 9 种变式题示例

## 结束协议（每次会话结束前必须执行）

```
┌─ 1. 提交 ────── git add + commit（描述性 message，含数量和变更摘要）
├─ 2. 推送 ────── git push -u origin <branch>
├─ 3. 构建确认 ── bundle exec jekyll build → 零错误（如环境可用）
├─ 4. 验证 ────── git status --short → 必须为空（工作树干净）
├─ 5. 更新文档 ── 如有里程碑变化 → 更新 docs/DEVELOPMENT-PLAN.md（进度 + 任务状态）
├─ 6. 金标准更新 ─ 如有新的质量规则 → 追加到 EXERCISE-SCHEMA.md 或 DEVELOPMENT-PLAN.md
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
| AP-4 | 练习 JSON 的 correctAnswer 未经算术验证 | 每个答案必须用 Python/计算器反向验算 |
| AP-5 | "show that" 题跳步或数学错误 | 每步推导必须完整，最终等式必须验证 |
| AP-6 | EDX 文件用 CIE 的 command words | CIE: "Calculate/Show that"，EDX: "Work out/Give a reason" |
| AP-7 | Core/Foundation 题包含 Higher-only 内容 | 微积分、向量几何证明等仅限 Extended/Higher |
| AP-8 | 结束会话时有未提交的变更 | 必须 commit + push，工作树必须干净 |
| AP-9 | `service_role_key` 出现在前端代码中 | 仅在 Cloudflare Workers 侧使用 |
| AP-10 | 直接修改 `exercise_registry.json` | 用 Python 脚本从 202 个 JSON 重新生成 |

---

## 项目信息

- **部署**: push main → Cloudflare Pages → https://www.25maths.com
- **仓库**: `git25math/25maths`
- **技术栈**: Jekyll + Tailwind CSS v4 + Supabase + Cloudflare Workers + Payhip
- **状态**: 练习 v2 schema 100% (202/202) | 会员系统 ~98% | B2B 组卷 UI 35%

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
6. **练习 v2 Schema**: 所有练习文件必须遵循 `docs/EXERCISE-SCHEMA.md` 规范

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
| `docs/EXERCISE-SCHEMA.md` | **练习 v2 schema 规范**（CIE + EDX 双 board） | **必读**（涉及练习时） |
| `docs/examples/exercise-variants-showcase.json` | 9 种 CIE 风格变式题示例 | 高（填题时参考） |
| `docs/BUG-POSTMORTEM.md` | Bug 根因分析 + 防范规则 | 高 |
| `docs/ECOSYSTEM-ANALYSIS.md` | 生态系统 5 项目集成分析 | 参考 |
| `DECISIONS.md` | 决策日志 | 参考 |
| `HANDOFF.md` | 项目交接文档（非 Claude Code 用户入口） | 参考 |

### 核心源文件

| 文件 | 说明 |
|------|------|
| `_config.yml` | Jekyll 配置 + 模块定义 + Supabase 公钥 |
| `functions/_lib/supabase_server.js` | **DB 操作入口**（700+ 行），理解表结构的入口 |
| `functions/_lib/release_registry.js` | 产品元数据 + release_id 映射 |
| `_data/exercise_registry.json` | 202 练习元数据注册表（slug/board/tier/domain/status） |
| `assets/js/exercise_engine.js` | 做题引擎（**待适配 v2 schema**） |
| `assets/js/member_auth.js` | 认证客户端 |
| `institution/assignments.html` | 教师组卷页面（UI 完成，API 待开发） |
| `styles/site.tailwind.css` | Tailwind CSS 源文件 |

### 数据库表速查（18 张 public 表）

**核心业务**: `profiles`, `membership_status`, `entitlements`, `payhip_event_log`, `member_benefit_offers`
**练习系统**: `exercise_sessions`, `question_attempts`
**Engagement**: `user_streaks`, `user_xp`, `user_daily_activity`, `user_achievements`, `achievement_definitions`
**B2B（schema 就绪，API 未开发）**: `institutions`, `institution_members`, `classes`, `class_students`, `assignments`, `assignment_submissions`

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

# 练习 mark total 验证
python3 -c "
import json, os
for f in sorted(os.listdir('_data/exercises')):
    if not f.endswith('.json'): continue
    with open(f'_data/exercises/{f}') as fh: d = json.load(fh)
    nq = len(d.get('questions',[]));
    if nq == 0: continue
    calc = sum(q['totalMarks'] if q['type']!='structured' else sum(p['marks'] for p in q.get('parts',[])) for q in d['questions'])
    if calc != d.get('totalMarks',0): print(f'MISMATCH {d[\"syllabusCode\"]}: stated={d[\"totalMarks\"]}, calc={calc}')
"
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

### 练习填充专用工作流

详见 `docs/EXERCISE-SCHEMA.md` → "Exercise Authoring Workflow" 章节：
- Phase A: 准备（读 schema + 读示例 + 查真题）
- Phase B: 填充（3-5 题/文件 + 算术验证）
- Phase C: 验证 → 提交 → 合并
- Phase D: 质量审查（draft → review → live）

---

## 用户偏好

- **批量执行**: 确认后按优先级自动推进
- **质量第一**: 先审查后行动，审查量化到数字
- **简洁汇报**: 版本号 + 变更摘要 + 下一步
- **每步验收**: 完成 → 验证 → 提交推送 → 合并 → 更新文档 → 下一步
