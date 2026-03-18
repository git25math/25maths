# 开发规范（适用于任何开发者 / AI 工具）

> 本文档是 25Maths Website 项目的唯一权威规范。
> 无论你是人类开发者、Claude、Cursor、Copilot 还是其他 AI——都必须遵守此文档。
> 本文档存在于 git 仓库内，所有协作者均可读取。

---

## 一、项目概览

- **项目**: 25Maths Website — IGCSE 数学学习门户 + 互动练习平台
- **仓库**: `git25math/25maths`
- **磁盘路径**: `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/`
- **部署**: push main → Cloudflare Pages → https://www.25maths.com
- **技术栈**: Jekyll + Tailwind CSS v4 + Supabase + Cloudflare Workers + Payhip
- **当前状态**: 会员系统 ~98% 完成，202 互动练习上线，16 篇双语博客

---

## 二、目标用户

### 学生（核心用户）

| 维度 | 描述 |
|------|------|
| **考试局** | CIE 0580 (Cambridge IGCSE) + Edexcel 4MA1 |
| **年级** | Year 10-11 (IGCSE 考试年) |
| **语言** | 英文为主，中文为辅（双语支持） |
| **能力起点** | 基础最薄弱的学生也能理解 |

### 家长
- 通过 `/membership/parent-dashboard.html` 查看学习进度
- 需要中文支持（海外华人家庭）

### 教师（B2B，schema 已就绪，API 未开发）
- 班级管理、作业布置、成绩分析

### 核心原则
- **可以**: 简洁直白的解释、中英双语对照、按考纲分类
- **不可以**: 过度装饰、无考纲依据的内容、仅有单语的新页面

---

## 三、质量标准

### 金标准规则

| # | 规则 | 检查方法 |
|---|------|---------|
| Q1 | 每个新 HTML 页面必须有双语支持 | 检查 `bilingual-support-only` 类名 |
| Q2 | 博客文章必须成对发布（EN + ZH） | `_posts/` 中 EN/ZH 数量相等 |
| Q3 | 练习 JSON 中 LaTeX 必须 KaTeX 兼容 | `scripts/katex-verify.js` 零错误 |
| Q4 | 所有 API 端点必须验证 auth token | `functions/api/v1/` 每个文件检查 `Authorization` header |
| Q5 | Tailwind 类名优先，禁止新增自定义 CSS | `git diff` 中无 `.css` 文件新增规则 |
| Q6 | 图片必须 WebP 格式 + alt 文本 | `rg '<img' --glob '*.html'` 检查 `alt=` |
| Q7 | 会员页面的关键文案必须双语 | 检查 `data-zh` 属性或 `bilingual-support-only` |

### Anti-patterns

| 禁止 | 原因 |
|------|------|
| 内联 `<style>` 块 | 违反 Tailwind-only 原则 |
| 硬编码 Supabase URL/Key 在 JS 中 | 必须从 `_config.yml` 注入 |
| 跳过 `bundle exec jekyll build` 验证 | 可能引入 Liquid 语法错误 |
| 直接修改 `assets/css/site.css` | 这是 Tailwind 编译输出，改 `styles/site.tailwind.css` |
| 使用 `fetch('/api/...')` 无 error handling | 所有 API 调用必须 try-catch |

---

## 四、内容/设计原则

### 内容撰写

| 维度 | 标准 |
|------|------|
| **标题** | 动词开头，直接说明学生收益（如 "Master Algebra Basics"） |
| **博客** | 1,500-3,000 字，包含 TOC、相关文章、CTA |
| **练习** | 从易到难，每组 10-20 题，覆盖完整 subtopic |
| **双语** | EN 是主内容，ZH 是辅助对照（不是独立翻译） |

### SEO 原则

| 维度 | 实施 |
|------|------|
| **JSON-LD** | BlogPosting（文章）+ BreadcrumbList（导航）+ Organization（全局） |
| **hreflang** | 每个页面通过 `lang_links` frontmatter 生成 `<link rel="alternate">` |
| **Open Graph** | `og_image_default` + 每篇文章自定义 `og_image` |
| **URL 结构** | `/:year/:month/:day/:title.html`（博客）+ `/exercises/:path/`（练习） |

### 品牌色

| 用途 | 颜色 | CSS 变量 |
|------|------|---------|
| CIE 0580 | `#8B1538` burgundy | `--color-primary` |
| Edexcel 4MA1 | `#2563EB` blue | `--color-secondary` |
| AMC 8 | `#F59E0B` amber | `--color-warning` |
| IAL | `#10B981` green | `--color-success` |

---

## 五、架构原则

### 技术栈分层

```
┌─────────────────────────────────────────────┐
│  Cloudflare Pages (CDN + Edge)              │
│  ├── _redirects (301 规则)                   │
│  ├── _headers (安全头)                       │
│  └── Functions (Cloudflare Workers)          │
│       └── api/v1/* (14 个 REST 端点)         │
├─────────────────────────────────────────────┤
│  Jekyll (静态站点生成)                        │
│  ├── _layouts/ (5 个布局)                    │
│  ├── _includes/ (11 个组件目录)              │
│  ├── _posts/ (16 篇博客)                    │
│  ├── _exercises/ (练习集合)                  │
│  └── _data/ (202 JSON + releases + Kahoot)  │
├─────────────────────────────────────────────┤
│  前端资产                                    │
│  ├── assets/js/ (14 个 JS 文件)             │
│  ├── assets/css/site.css (Tailwind 编译输出) │
│  └── styles/site.tailwind.css (Tailwind 源)  │
├─────────────────────────────────────────────┤
│  Supabase (共享数据库)                       │
│  └── 18 张 public 表 (共享于 Play + ExamHub) │
└─────────────────────────────────────────────┘
```

### 模块定义

模块在 `_config.yml` 的 `modules` 数组中定义，每个模块包含：
- `key` — 唯一标识（如 `cie0580`）
- `path` — URL 路径（如 `/cie0580/`）
- `status` — `active` / `coming_soon`
- `free_count` / `product_count` — 免费/付费资源数

### 依赖关系规则

1. **Jekyll 模板**只能引用 `_includes/` 和 `_data/` 中的文件
2. **前端 JS** 不能直接 `import`——通过 `<script>` 标签按顺序加载
3. **Cloudflare Workers** (`functions/`) 使用 ES modules，共享库在 `functions/_lib/`
4. **Supabase** 操作必须通过 `functions/_lib/supabase_server.js`，不在前端直接操作 service_role_key

---

## 六、新增功能流程

### 新增页面

1. 创建 EN 版本 `path/page.html`（frontmatter 含 `lang: en`、`lang_links`）
2. 创建 ZH 版本 `zh-cn/path/page.html`（frontmatter 含 `lang: zh-CN`）
3. 在 `_includes/global-nav.html` 或 `_includes/module-nav.html` 添加导航入口
4. 运行 `bundle exec jekyll build` 验证
5. 运行 `bash scripts/health/check_bilingual_coverage.sh` 确认双语覆盖

### 新增博客文章

1. 创建 EN: `_posts/YYYY-MM-DD-slug.md`（layout: post, lang: en, subtitle, category, tags）
2. 创建 ZH: `_posts/YYYY-MM-DD-zh-cn-slug.md`（对应中文版本）
3. 确保 `lang_links` 互相指向
4. 验证 `bundle exec jekyll build` + 检查 `_site/` 输出

### 新增练习

1. 在 `_data/exercises/` 创建 JSON 文件，格式参照现有文件
2. 在 `_exercises/` 创建对应的 Markdown 入口文件
3. 运行 `python3 scripts/health/check_exercise_data.py` 验证数据完整性
4. 运行 `node scripts/katex-verify.js` 确认 LaTeX 语法正确

### 新增 API 端点

1. 在 `functions/api/v1/` 创建 JS 文件（遵循 Cloudflare Workers `onRequest` 模式）
2. 必须验证 `Authorization` header（调用 Supabase auth）
3. 错误返回标准 JSON: `{ error: "message" }`
4. 在 `.claude/CLAUDE.md` 的数据库表速查中更新涉及的表

---

## 七、国际化/多语言

### 双语架构

| 层级 | EN | ZH-CN |
|------|----|----|
| **静态页面** | `/path/page.html` | `/zh-cn/path/page.html` |
| **博客** | `_posts/YYYY-MM-DD-slug.md` | `_posts/YYYY-MM-DD-zh-cn-slug.md` |
| **frontmatter** | `lang: en` | `lang: zh-CN` |
| **hreflang** | `lang_links` 数组自动生成 | 同上 |

### 页面内双语实现

```html
<!-- 方式 1: bilingual-support-only 类（默认隐藏，toggle 开启时显示） -->
<p>This is the English text.</p>
<p class="bilingual-support-only">这是中文文本。</p>

<!-- 方式 2: data-zh 属性（JS 动态替换） -->
<span data-zh="登录">Sign In</span>

<!-- 方式 3: Liquid 条件 -->
{% if page.lang == "zh-CN" %}
  <h1>欢迎</h1>
{% else %}
  <h1>Welcome</h1>
{% endif %}
```

### 双语 Toggle

- 文件: `assets/js/bilingual_support.js` + `_includes/bilingual-floating-toggle.html`
- 位置: 固定在右侧的浮动面板
- 存储: `localStorage` 记住用户偏好
- Tailwind 类: `bilingual-support-only`, `bilingual-support-inline`, `bilingual-support-flex`

### 添加新翻译

1. HTML 静态文案 → 使用 `bilingual-support-only` 类名
2. JS 动态文案 → 使用 `data-zh` 属性或 `t()` 函数（待实现）
3. 运行 `bash scripts/health/check_bilingual_coverage.sh` 验证覆盖率

---

## 八、可视化/UI 规范

### Tailwind CSS 构建

```bash
# 编译 Tailwind（jekyll build 不会自动执行此步骤！）
npx @tailwindcss/cli -i styles/site.tailwind.css -o assets/css/site.css --minify

# 或使用脚本
bash scripts/build_css.sh
```

- **输入**: `styles/site.tailwind.css`（452 行，含自定义 @theme 和组件类）
- **输出**: `assets/css/site.css`（提交到 git，直接由 Jekyll 引用）
- **版本**: Tailwind CSS v4.2.1（无需 `tailwind.config.js`，使用 v4 隐式配置）

### 响应式断点

| 断点 | 布局 |
|------|------|
| `lg` (≥1024px) | 桌面端——侧边栏 TOC、双栏布局 |
| `md` (≥768px) | 平板端——单栏、折叠 TOC |
| `sm` (<768px) | 移动端——紧凑 padding、汉堡菜单 |

### 组件库

| 组件 | 文件 | 用途 |
|------|------|------|
| 全局导航 | `_includes/global-nav.html` | 深色顶部导航栏 |
| 模块导航 | `_includes/module-nav.html` | 白色子导航（模块内页面） |
| 页脚 | `_includes/footer.html` | 5 列页脚 |
| Head | `_includes/head.html` | Meta 标签 + 字体 + OG |
| 双语 Toggle | `_includes/bilingual-floating-toggle.html` | 固定右侧浮动面板 |
| Board Chip | `_includes/ui/board-status-chip.html` | 考试局标签 chip |
| 证据条 | `_includes/evidence-strip.html` | 社会证明图片展示 |

### 字体

- **正文**: Inter (400-800) via Google Fonts
- **数学公式**: KaTeX 默认字体 via CDN

---

## 九、Bug 防范规则

> 详细 Bug 根因分析见 `docs/BUG-POSTMORTEM.md`

### 高频 Bug 速查

| # | Bug | 根因 | 防范 |
|---|-----|------|------|
| B1 | Cloudflare Pages 部署失败 | root `package.json` 含 macOS 专有依赖 | 不要在根目录创建 `package.json`（仅保留 Tailwind 依赖） |
| B2 | profiles PK 不匹配 | 代码用 `id`，DB 用 `user_id` | `supabase_server.js` 统一用 `user_id` |
| B3 | target_board 约束错误 | 前端传 `"CIE 0580"`，DB 存 `"cie0580"` | `profile.js` 中 `VALID_BOARDS` 白名单 |
| B4 | KaTeX 合并伪影 | 批量转换脚本合并逻辑缺陷 | Phase 4 三层修复管道已修复；新转换必须过 `katex-verify.js` |
| B5 | Jekyll `utime` 竞态 | `projects/kahoot-channel/` 大文件 | CI 中重试即可 |

---

## 十、审查标准

### 功能正确性 Checklist

- [ ] `bundle exec jekyll build` 零错误
- [ ] 所有链接可访问（无 404）
- [ ] API 端点返回正确 HTTP 状态码
- [ ] 练习引擎正确评分
- [ ] 会员下载权限网关正常

### 内容质量 Checklist

- [ ] 博客文章 EN+ZH 成对
- [ ] 练习 JSON 中 LaTeX 语法正确（`katex-verify.js` 零错误）
- [ ] 所有图片有 alt 文本
- [ ] 页面标题和 meta description 符合 SEO 标准

### UI/UX Checklist

- [ ] 移动端（375px）无水平滚动
- [ ] 双语 Toggle 正常工作
- [ ] 深色导航栏在所有页面一致
- [ ] Tailwind 编译后 `site.css` 已更新

### 安全 Checklist

- [ ] API 端点验证 Authorization header
- [ ] 无 Supabase service_role_key 泄露到前端
- [ ] CSP 策略未被放宽
- [ ] `_headers` 中安全头完整

---

## 十一、关联项目

### 项目关系图

```
                    ┌─────────────────┐
                    │  CIE 0580 分析   │
                    │  流水线          │
                    └──────┬──────────┘
                           │ 知识点 + 真题标签
              ┌────────────┼────────────┐
              ▼            ▼            ▼
    ┌─────────────┐ ┌───────────┐ ┌──────────────┐
    │  Play 游戏   │ │  ExamHub  │ │  视频引擎     │
    │ play.25maths│ │ examhub.  │ │              │
    │   .com      │ │ 25maths   │ │              │
    └──────┬──────┘ └─────┬─────┘ └──────────────┘
           │              │
           │  共享 Supabase (ref: jjjigohjvmyewasmmmyf)
           │  共享用户账号
           │              │
           └──────┬───────┘
                  ▼
         ┌───────────────┐
         │  25Maths 主站  │ ← 本项目
         │  www.25maths  │
         │    .com       │
         └───────────────┘
```

### 关联详情

| 项目 | 仓库 | 根目录 | 关系 |
|------|------|--------|------|
| **Play 游戏** | `git25math/25maths-games-legends` | `25maths-games-legends/` | 共享 Supabase；主站提供入口链接 |
| **ExamHub** | `git25math/25maths-examhub` | `25Maths-Keywords/` | 共享 Supabase + 用户账号；主站提供入口链接 |
| **CIE 分析** | `git25math/cie-igcse-0580` | `CIE/IGCSE_v2/analysis/` | 分析结果 → 练习 JSON 数据源 |
| **Dashboard** | `git25math/25maths-dashboard` | `25Maths-Dashboard/` | 运营数据可视化 |

### 共享 Supabase 数据库

- **Project ref**: `jjjigohjvmyewasmmmyf`
- **共享表**: `auth.users`, `profiles`, `user_streaks`, `user_xp`, `user_achievements` 等
- **关键约束**: 修改 DB schema 需同步 Website + Play + ExamHub 三个项目
- **Website 独占表**: `exercise_sessions`, `question_attempts`, `payhip_event_log`, `entitlements`, `member_benefit_offers`

### 入口链接

主站是所有子产品的统一入口，以下链接必须保持有效：

| 入口 | 目标 | 位置 |
|------|------|------|
| 互动练习 | `/exercises/` | 全局导航 + 模块页 |
| 付费产品 | `/cie0580/products.html` + `/edx4ma1/products.html` | 模块页 |
| 会员中心 | `/membership/` | 全局导航 |
| Kahoot 频道 | `/kahoot/` | 全局导航 |

> **待添加**: Play 游戏入口 (`play.25maths.com`) 和 ExamHub 入口 (`examhub.25maths.com`) 在对应产品正式对外发布后添加到全局导航。

---

## 十二、Git 规范

### Commit Message 格式

```
<type>: <简要描述>

<可选的详细说明>
```

**Type 前缀**:

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add account settings page` |
| `fix` | Bug 修复 | `fix: profiles PK alignment` |
| `i18n` | 双语/国际化 | `i18n: complete bilingual labels for membership` |
| `docs` | 文档 | `docs: update PLAN.md` |
| `refactor` | 重构 | `refactor: 提取 achievement_evaluator.js` |
| `chore` | 杂项 | `chore: auto-update visual baseline` |

### 部署方式

```bash
# 方式 1: 推送到 main（自动触发 Cloudflare Pages 构建）
git push origin main

# 方式 2: 手动部署（绕过 CI）
npx wrangler pages deploy _site --project-name 25maths

# 验证部署
gh run list --repo git25math/25maths --limit 1
```

### 禁止事项

- **禁止** `git push --force` 到 main
- **禁止** 提交 `.env` 文件（含 Supabase service_role_key）
- **禁止** 提交 `node_modules/`、`_site/`、`vendor/`
- **禁止** 在 root 创建带 macOS 专有依赖的 `package.json`（会导致 Cloudflare 构建失败）

---

## 十三、数据/ID 分配规则

### 练习 ID 格式

```
{board}-{domain}-{tier}-{subtopic_code}
```

示例: `cie0580-algebra-c2-c2-01-use-of-symbols`

| 字段 | 取值 |
|------|------|
| `board` | `cie0580` / `edexcel-4ma1` |
| `domain` | `algebra` / `number` / `geometry` / `statistics` / ... |
| `tier` | CIE: `c1`-`c9`, `e1`-`e9`; EDX: `f1`-`f6`, `h1`-`h6` |
| `subtopic_code` | 与 syllabus 对齐的编号 |

### Release ID 格式

定义在 `_data/releases.json` + `functions/_lib/release_registry.js`:

```
{board}-{bundle}-{product_type}
```

示例: `cie-algebra-vocab-cards`, `cie-term-practice-pass`

### Achievement ID 格式

```
{category}-{metric}-{threshold}
```

示例: `explorer-all`, `streak-7`, `accuracy-100-5`

---

## 十四、工作流

### 开发流程

```
1. 回顾 → 读 docs/DEVELOPMENT-PLAN.md 确认版本和待办
2. 开发 → 按优先级执行任务
3. 验证 → bundle exec jekyll build + health checks
4. 部署 → git commit + push main
5. 确认 → gh run list 检查 CI 通过
```

### 构建验证命令

```bash
# 完整构建
bundle exec jekyll build

# Tailwind 编译（修改 CSS 后必须执行）
npx @tailwindcss/cli -i styles/site.tailwind.css -o assets/css/site.css --minify

# Health checks（CI 中自动运行）
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_exercise_data.py
python3 scripts/health/check_nav_consistency.py
bash scripts/health/check_style_consistency.sh
bash scripts/health/check_bilingual_coverage.sh
```

### 审查流程

```
1. 量化 → 双语覆盖率、练习数量、LaTeX 错误数
2. 对标 → 对照本文档第三节金标准逐项检查
3. 修复 → CRITICAL/HIGH 当场修复
4. 再审 → 至少 2 轮（功能→内容→UI）
```

### 一致性验证脚本

```bash
# 1. 文档互引 CONTRIBUTING.md
for f in docs/*.md CLAUDE.md; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c CONTRIBUTING $f)"
done

# 2. Jekyll 构建
bundle exec jekyll build 2>&1 | tail -3

# 3. 未提交改动
git status -s | grep '^ M'

# 4. 最近部署
gh run list --repo git25math/25maths --limit 1

# 5. Health checks
python3 scripts/health/check_exercise_data.py
bash scripts/health/check_bilingual_coverage.sh
```

---

## 十五、核心文件索引

### 配置文件

| 文件 | 用途 |
|------|------|
| `_config.yml` | Jekyll 配置 + 模块定义 + Supabase 公钥 |
| `package.json` | Node 依赖（仅 Tailwind CSS） |
| `Gemfile` | Ruby 依赖（github-pages, jekyll-redirect-from） |
| `.env` | 环境变量（**不提交 git**） |
| `_redirects` | Cloudflare 边缘 301 重定向规则 |
| `_headers` | Cloudflare 安全头 |
| `robots.txt` | 爬虫规则 |

### 布局与组件

| 文件 | 用途 |
|------|------|
| `_layouts/global.html` | 门户 + 全局页面布局 |
| `_layouts/module.html` | 模块页面布局 |
| `_layouts/post.html` | 博客文章（286 行，含 TOC + JSON-LD + 双语） |
| `_layouts/interactive_exercise.html` | 练习引擎包装 |
| `_layouts/bare.html` | 最小包装 |

### 前端 JS

| 文件 | 用途 |
|------|------|
| `assets/js/exercise_engine.js` | 做题引擎核心 |
| `assets/js/member_auth.js` | Supabase 认证客户端 |
| `assets/js/member_center.js` | 会员仪表盘 |
| `assets/js/member_downloads.js` | 下载管理 |
| `assets/js/bilingual_support.js` | 双语 Toggle 逻辑 |
| `assets/js/streak_widget.js` | 连续登录展示 |
| `assets/js/achievement_toast.js` | 成就通知 |
| `assets/js/exercise_hub.js` | 练习列表/筛选 |
| `assets/js/blog_index_enhancements.js` | 博客索引筛选 |
| `assets/js/post_conversion.js` | 博客文章增强 |
| `assets/js/post_enhancements.js` | 排版/无障碍 |
| `assets/js/site_interactions.js` | 全局交互 |
| `assets/js/member_benefits.js` | 权益展示 |
| `assets/js/member_recommendations.js` | 个性化推荐 |

### Serverless 函数

| 文件 | 用途 |
|------|------|
| `functions/_lib/supabase_server.js` | **DB 操作入口**（700+ 行） |
| `functions/_lib/release_registry.js` | 产品元数据 + release_id 映射 |
| `functions/_lib/payhip_events.js` | 支付事件解析 |
| `functions/_lib/achievement_evaluator.js` | 成就评估逻辑 |
| `functions/_lib/streak_utils.js` | 连续登录计算 |
| `functions/_lib/date_utils.js` | 日期工具 |
| `functions/_lib/crypto.js` | 加密辅助 |
| `functions/_lib/http.js` | HTTP 工具 |
| `functions/api/v1/user/profile.js` | Profile CRUD |
| `functions/api/v1/engagement/*.js` | 成就/连续/排行 (5 端点) |
| `functions/api/v1/exercise/session/*.js` | 练习会话 (3 端点) |
| `functions/api/v1/download/[release_id].js` | 产品下载 |
| `functions/api/v1/membership/webhook/payhip.js` | 支付 Webhook |
| `functions/api/v1/membership/reconcile.js` | 会员对账 |

### 数据文件

| 文件 | 用途 |
|------|------|
| `_data/exercises/*.json` | 202 个练习 JSON（8,731 LaTeX 表达式） |
| `_data/releases.json` | 25 个产品定义（CIE 0580） |
| `_data/kahoot_*.json` | Kahoot 元数据 |
| `_data/content/week-*.json` | 周练习包内容 |

### CI/CD

| 文件 | 用途 |
|------|------|
| `.github/workflows/ci.yml` | push/PR → 验证 + Jekyll build + 视觉回归 |
| `.github/workflows/site-health-check.yml` | 每日 2:15 UTC 健康检查 |

### 健康检查脚本

| 文件 | 用途 |
|------|------|
| `scripts/health/check_kahoot_data.py` | Kahoot 数据完整性 |
| `scripts/health/check_exercise_data.py` | 练习数据完整性 |
| `scripts/health/check_nav_consistency.py` | 导航一致性 |
| `scripts/health/check_style_consistency.sh` | 样式一致性 |
| `scripts/health/check_bilingual_coverage.sh` | 双语覆盖率 |
| `scripts/health/check_visual_regression.sh` | 视觉回归（RMSE ≤ 0.0040） |

### 项目文档

| 文件 | 用途 |
|------|------|
| `CLAUDE.md` | Claude Code 启动协议（指向本文件） |
| `docs/CONTRIBUTING.md` | **本文件** — 唯一权威规范 |
| `docs/DEVELOPMENT-PLAN.md` | 版本历程 + 开发计划 |
| `docs/BUG-POSTMORTEM.md` | Bug 根因分析 + 防范规则 |
| `DECISIONS.md` | 决策日志（24KB） |
| `PLAN.md` | 会员系统收尾计划 |
| `HANDOFF.md` | 项目交接文档 |
| `NEXT-STEPS.md` | 30-60-90 天执行计划 |
