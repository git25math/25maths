# 25Maths Website — 项目规范

> **重要**: 完整开发规范见 `docs/CONTRIBUTING.md`（适用于任何 AI/人类开发者）。
> 本文件是 Claude Code 专用的启动协议补充。

## 启动协议

每次新对话开始时，按此顺序执行：

1. **读取开发规范**: `docs/CONTRIBUTING.md` → 15 节完整规范
2. **读取版本状态**: `docs/DEVELOPMENT-PLAN.md` → 版本历程 + 待办
3. **Git 基线检查**: `git status --short && git diff --stat && git log --oneline -3`
4. **构建确认**: `bundle exec jekyll build` → 必须零错误才能开始
5. **Tailwind 检查**: 如涉及 CSS 变更 → `npx @tailwindcss/cli -i styles/site.tailwind.css -o assets/css/site.css --minify`

## 项目信息

- **根目录**: `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/`
- **部署**: push main → Cloudflare Pages → https://www.25maths.com
- **仓库**: `git25math/25maths`
- **技术栈**: Jekyll + Tailwind CSS v4 + Supabase + Cloudflare Workers + Payhip
- **状态**: 会员系统 ~98% | 202 练习 | 16 双语博客 | 14 API 端点

## 关联项目

| 项目 | 根目录 | 关系 |
|------|--------|------|
| **Play 游戏** | `25maths-games-legends/` | 共享 Supabase + 用户账号 |
| **ExamHub** | `25Maths-Keywords/` | 共享 Supabase；主站提供入口 |
| **CIE 分析** | `CIE/IGCSE_v2/analysis/` | 练习 JSON 数据源 |
| **Dashboard** | `25Maths-Dashboard/` | 运营数据可视化 |

**共享 Supabase**: ref `jjjigohjvmyewasmmmyf` — 改 DB schema 需同步三个项目

## 关键约束

1. **Tailwind 类名**优先，禁止新增自定义 CSS（改 `styles/site.tailwind.css`，不改 `assets/css/site.css`）
2. **双语支持**: EN 为主，ZH 用 `bilingual-support-only` 类名或 `data-zh` 属性
3. **API 安全**: 所有端点验证 `Authorization` header，`service_role_key` 仅在 Workers 侧
4. **部署安全**: 根目录 `package.json` 只能含 Tailwind 依赖（参见 BUG-POSTMORTEM.md #B1）
5. **Serverless**: 函数遵循 Cloudflare Workers `onRequest` 模式

## 环境变量

所有脚本从 `.env` 读取（**禁止提交 git**）：
- `SUPABASE_URL` — Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY` — 服务端密钥
- `SUPABASE_ANON_KEY` — 客户端密钥
- `API_BASE_URL` — Cloudflare Workers API 地址
- `TEST_EMAIL_BASE` — 测试邮箱基础地址

## 文件地图

### 项目内文档

| 文件 | 用途 | 优先级 |
|------|------|--------|
| `docs/CONTRIBUTING.md` | **开发规范**（AI/人类通用唯一权威） | **必读** |
| `docs/DEVELOPMENT-PLAN.md` | 版本历程 + 下一步规划 | **必读** |
| `docs/BUG-POSTMORTEM.md` | Bug 根因分析 + 防范规则 | 高 |
| `docs/EXERCISE-SCHEMA.md` | **练习 v2 schema 规范**（CIE + EDX 双 board） | **必读**（涉及练习时） |
| `docs/examples/exercise-variants-showcase.json` | 9 种 CIE 风格变式题示例 | 高（填题时参考） |
| `DECISIONS.md` | 决策日志 | 参考 |
| `PLAN.md` | 会员系统收尾计划 | 参考 |
| `HANDOFF.md` | 项目交接文档 | 参考 |
| `NEXT-STEPS.md` | 30-60-90 天执行计划 | 参考 |

### 核心源文件

| 文件 | 说明 |
|------|------|
| `_config.yml` | Jekyll 配置 + 模块定义 + Supabase 公钥 |
| `functions/_lib/supabase_server.js` | **DB 操作入口**（700+ 行），理解表结构的入口 |
| `functions/_lib/release_registry.js` | 产品元数据 + release_id 映射 |
| `_data/exercise_registry.json` | 202 练习元数据注册表（slug/board/tier/domain/status） |
| `assets/js/exercise_engine.js` | 做题引擎（待适配 v2 schema） |
| `assets/js/member_auth.js` | 认证客户端 |
| `styles/site.tailwind.css` | Tailwind CSS 源文件 |

### 数据库表速查（18 张 public 表）

**核心业务**: `profiles`, `membership_status`, `entitlements`, `payhip_event_log`, `member_benefit_offers`
**练习系统**: `exercise_sessions`, `question_attempts`
**Engagement**: `user_streaks`, `user_xp`, `user_daily_activity`, `user_achievements`, `achievement_definitions`
**B2B（schema 就绪，API 未开发）**: `institutions`, `institution_members`, `classes`, `class_students`, `assignments`, `assignment_submissions`

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

# 部署验证
gh run list --repo git25math/25maths --limit 1
```

## Workflow（强制执行）

> 与 ExamHub / Play 相同的 Plan → Execute → Ship 流程。

1. **Plan** — 分析需求，探索代码，输出实施计划
2. **Execute** — 按计划逐步实施，遇到错误自动诊断
3. **Ship** — `jekyll build` 验证 → commit → push → 确认 CI 通过 → 汇报

## 用户偏好

- **批量执行**: 确认后按优先级自动推进
- **质量第一**: 先审查后行动，审查量化到数字
- **简洁汇报**: 版本号 + 变更摘要 + 下一步
