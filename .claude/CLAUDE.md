# 25maths.com — Claude Code 项目指令

## 项目概况
- IGCSE 数学练习平台：CIE 0580 + Edexcel 4MA1
- 技术栈：Jekyll + Tailwind CSS + Supabase + Payhip + Cloudflare Workers + GitHub Pages
- 仓库：github.com/git25math/25maths.git

## 关键约束
1. Tailwind CSS 类名，不新增自定义 CSS
2. 双语支持：EN 为主，中文用 `bilingual-support-only` 类名
3. 不做品牌叙事重构
4. 数据库操作必须用 Supabase JS client（`@supabase/supabase-js`）
5. Serverless 函数遵循现有 Cloudflare Workers 模式

## 环境变量
所有脚本从 `.env` 读取：
- `SUPABASE_URL` — Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY` — 服务端密钥（admin 操作）
- `SUPABASE_ANON_KEY` — 客户端密钥
- `API_BASE_URL` — Cloudflare Workers API 地址
- `TEST_EMAIL_BASE` — 测试邮箱基础地址（如 yourname@gmail.com）

## 关键文件索引
- `functions/_lib/supabase_server.js` — 所有 DB 操作（700+ 行），理解表结构的入口
- `functions/_lib/release_registry.js` — 产品元数据和 release_id 硬编码
- `functions/_lib/payhip_events.js` — 支付事件解析
- `_data/releases.json` — 版本/产品信息
- `_data/exercises/*.json` — 202 个练习题目数据
- `assets/js/exercise_engine.js` — 做题引擎
- `assets/js/member_auth.js` — 认证客户端

## 数据库表速查（18 张 public 表）

### 核心业务
- `auth.users` — 认证用户（Supabase 内置）
- `profiles` — user_id, display_name, preferred_lang, role(student), target_board, weekly_report_enabled
- `membership_status` — user_id, status(active/paused/cancelled), period_start, period_end, provider(payhip)
- `entitlements` — user_id, release_id, source, expires_at, granted_at (unique: user_id+release_id+source)
- `payhip_event_log` — provider_event_id(幂等去重), event_type, customer_email, payload, handled_status, attempts
- `member_benefit_offers` — kind, title, cta_url, coupon_code, available_for, is_active, priority, starts_at, ends_at

### 练习系统
- `exercise_sessions` — user_id, exercise_slug, board, tier, syllabus_code, started_at, completed_at, score, **question_count**, duration_seconds
- `question_attempts` — session_id, user_id, question_index, is_correct, selected_answer, correct_answer, skill_tag

### Engagement 系统
- `user_streaks` — user_id, current_streak, **best_streak**, last_active_date, **freeze_available**(bool), freeze_used_at, total_active_days
- `user_xp` — user_id, total_xp, level
- `user_daily_activity` — user_id, activity_date, sessions_completed, questions_answered, correct_answers, total_time_seconds, skills_practiced(text[])
- `user_achievements` — user_id, achievement_id, unlocked_at, notified(bool)
- `achievement_definitions` — id(text), title_en, title_cn, description_en, description_cn, icon, tier, category, criteria(jsonb), xp_reward, is_secret, is_active, sort_order

### B2B 教师系统（schema 已就绪，API 未开发）
- `institutions` — name, slug, plan, max_students, max_teachers, billing_email, features(jsonb)
- `institution_members` — user_id, institution_id, role, display_name
- `classes` — institution_id, teacher_id, name, board, tier, academic_year
- `class_students` — class_id, student_id, is_active
- `assignments` — class_id, teacher_id, title, exercise_slugs(text[]), due_at, allow_retry, status
- `assignment_submissions` — assignment_id, student_id, session_id, score, accuracy_pct, submitted_at

## 自定义命令
- `/test-setup` — 创建/重置测试用户
- `/test-verify` — 运行验证检查
- `/test-report` — 生成分析报告
