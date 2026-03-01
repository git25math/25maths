# 25Maths Project - Decision Log

> **目的**: 记录所有重要的商业决策、技术选型和策略调整，便于未来查阅和复盘
> **维护**: 每次做出重要决策时更新此文档
> **格式**: 按时间倒序（最新的在最上面）

---

## 2026-03-01 | LaTeX Phase 4 — KaTeX 质量保证（~1,094 处修复）

### 决策背景
- Phase 3 批量转换（`9cb4c59`）引入了三类系统性 bug：
  1. **合并伪影**：相邻 `$...$` 块合并逻辑产生 `${DIGIT...}` 模式（547 处）
  2. **嵌套定界符**：双重包裹 `${$...$}$` 模式（329 处）
  3. **断裂表达式**：`$` 定界符位置错误导致数学公式断裂（218 处）
- 另有 ~18 处人工发现的边缘 case（断裂 `\sqrt`、缺失 `$`、断裂 `\frac`、联立方程文件全面损坏）

### 关键实施

#### 1. 三层自动化修复管道
- `scripts/katex-merge-fix.js`（5 pass）：547 fixes / 66 files — 修复合并逻辑产出的伪影
- `scripts/katex-fix-broken.js`：218 fixes / 39 files — 修复 `${DIGIT...}` 断裂模式
- `scripts/katex-fix-nested.js`（3 pass）：329 fixes / 29 files — 修复 `${$...$}$` 嵌套

#### 2. 人工逐文件审查（9 个文件）
- `cie0580-number-c1-c1-14-using-a-calculator.json` — 断裂 `\sqrt` 表达式
- `cie0580-transformations-e7-e7-02-vectors-in-two-dimensions.json` — 缺失 `$` 定界符
- `edexcel-4ma1-geometry-h4-h4-02-polygons.json` — 缺失 `$` 定界符
- `edexcel-4ma1-number-f1-f1-05-set-language-and-notation.json` — 补集符号缺失 `$`
- `edexcel-4ma1-sequences-h3-h3-03-graphs.json` — 缺失 `$` 定界符
- `edexcel-4ma1-equations-h2-h2-06-simultaneous-linear-equations.json` — **完全重写**（12 题全部损坏）
- `edexcel-4ma1-equations-h2-h2-04-linear-equations.json` — 4 处修复
- `cie0580-number-e1-e1-13-percentages.json` — 断裂 `\frac`
- `edexcel-4ma1-number-f1-f1-11-electronic-calculators.json` — 悬挂数字

#### 3. 验证体系
- `scripts/katex-verify.js`：统计每个字段中 `$` 符号数量，奇数即报警
- 最终结果：236 个"问题"全部为货币 `$` 符号（如 `$42`、`$120`），确认为误报
- 202 个 JSON 文件全部通过 `JSON.parse()` 校验

### 结果
- **修复量**：~1,094 处（547 + 218 + 329 + ~18 人工）
- **文件数**：102/202 JSON 文件修改
- **新脚本**：4 个（merge-fix / fix-broken / fix-nested / verify）
- **剩余 LaTeX 错误**：0
- **Commit**: `121ccd9`

### 决策理由
- 三层自动化修复（先修合并→再修断裂→最后修嵌套）比单一脚本更安全
- 联立方程文件损坏过于严重，逐个 Edit 不如完全重写
- 验证脚本误报（货币 `$`）不修改，因为 `normalizeInlineMath` 只匹配配对的 `$...$`，单独 `$42` 不会被误解析

---

## 2026-03-01 | LaTeX Phase 3 — 练习题 KaTeX 批量转换

### 决策背景
- Phase 1-2 完成 Unicode 上标/根号/希腊字母和纯文本分数转换后，仍有 4,158 处数学表达式以纯文本形式存在
- 涵盖六大类：分数（a/b）、角度（angle ABC）、幂次（x²、cm²）、平方根（√n）、希腊字母（π、θ）、代数表达式（3x + 5、y = mx + c）

### 关键实施

#### 1. 统一转换管道
- 使用 Node.js 编写统一转换脚本（Python 3.13 dylib 故障不可用）
- `splitByLatex()` 分段架构：将文本按已有 `$...$` 分段，仅对未保护文本应用转换规则，避免双重处理
- 转换规则按优先级顺序：分数 → 角度 → 幂次（单位/数字/变量/Unicode）→ 负指数 → 根号 → 希腊 → 代数
- 合并步骤：相邻 `$...$` 块自动合并（如 `$\pi$ $r^2$` → `$\pi r^2$`）

#### 2. 代数表达式专项处理
- 安全模式：仅转换明确的数学模式（`y = mx + c`、`x = 5`、`3x + 8`）
- 上下文感知：跳过货币 `$C`、跳过后跟括号的等式（`y = 3(2)`）
- 分批转换：基础代数 → 括号方程 → 两侧等式 → nth term → 大写变量方程

#### 3. Bug 修复记录
- `angle` 正则 `i` 标志误匹配小写词 → 移除 `i` 标志（354 处修复）
- `$\pi$` 与后续字母合并 → 添加空格（36 处修复）
- `√($...$)` 嵌套破坏 → 定向修复 sqrt 包裹已有 LaTeX（32 处修复）
- `$$` display math → 替换为单 `$`（17 处修复）
- 代数规则过于激进 → 全量回滚后用保守规则重写

### 结果
- **转换量**：4,574 新 LaTeX 表达式（从 4,157 → 8,731 总计）
- **文件数**：161/202 JSON 文件修改（15 此前已完全转换，16 无数学内容，10 未更改）
- **行数**：2,044 insertions / 2,044 deletions（纯替换，行数不变）
- **剩余**：~86 处边缘 case（负幂 Unicode ⁻⁶、嵌套 sqrt、括号因式分解如 `(3a-4)(3a+4)`）
- **Commit**: `9cb4c59`

### 决策理由
- 分段处理（splitByLatex）比全局正则更安全，避免破坏已有 LaTeX
- 保守代数规则优于激进规则 + 回滚（已验证激进规则导致 143 处 broken patterns）
- 剩余 ~86 处为高风险边缘 case，需人工复查

---

## 2026-02-28 ~ 03-01 | Last-Mile Member Delivery — 付款到下载全链路打通

### 决策背景
- 12-Week Term Practice Pass 内容已完成（24 PDFs 在 Supabase），后端代码已完成，支付页面已上线
- 但用户付款后无法获得文件：releases.json 数据 bug + 无下载 UI + API Functions 未部署

### 关键实施

#### 1. 数据修复 (Workstream A)
- `releases.json` 中 22/24 个 member release 的 `payhip_product_id` 为空 → 全部设为 `"eN4l6"`
- `release_registry.js` 同步，三方交叉验证（JS/JSON/Registry）0 mismatch

#### 2. 会员下载 UI (Workstream B)
- 创建 `member_downloads.js`（130 行）：12 周下载卡片，EN + Bilingual 两个按钮
- 遵循现有事件驱动架构（`member-dashboard-data` 事件）
- 三态显示：guest → non-member → active member

#### 3. 基础设施 (Workstream C)
- **Cloudflare Worker proxy 部署**：`25maths-api-proxy-production` 路由 `www.25maths.com/api/*` → Pages Functions
  - 解决方案：wrangler OAuth token 无 DNS 编辑权限，改用 Worker route 实现同等效果
- **环境变量**：7 个必需变量已在 Cloudflare Pages 项目中预设
- **Payhip webhook**：用户手动在 Payhip Dashboard 配置 webhook URL（API 不支持自动化）

#### 4. E2E 测试 (Workstream D) — 26/26 PASS
- D1: `sale_completed` webhook → HTTP 200, `entitlements_granted: 24`
- D2: Reconcile → HTTP 200, status active
- D4-D6: W01/W06/W12 下载 → 签名 URL → `%PDF-1.5` 字节确认
- D-extra: 24/24 releases 全部可下载
- D7/D8: 无 auth 拒绝 (401), 无效 token 拒绝 (401), 无效签名拒绝 (403)
- CORS, 幂等性, 非存在 release (404) 全部通过

### 决策理由
- Worker proxy 而非 DNS 迁移：降低风险，不影响现有 GitHub Pages 托管
- 一次性购买授予永久 entitlement（`expires_at: null`），12 周 membership period 仅影响 dashboard 显示
- Payhip webhook 配置确认为 dashboard-only（无 API），已验证签名可通过

### 影响范围
- Gate B (Paid MVP): IN PROGRESS → **PASS**
- Gate D (Production Readiness): IN PROGRESS → **PARTIAL PASS**（E2E 通过，回滚演练待做）
- 完整交付日志：`_ops/delivery-log/2026-02-28-last-mile.md`

---

## 2026-02-27 | Engagement 系统全链路实现 + B2B 教师工具

### 决策背景
- 四份技术规格已完成（自适应、打卡/成就、周报、B2B），进入实施阶段
- 用户要求自主推进 6 小时，完成所有可独立完成的工作

### 关键实施

#### 1. Engagement 系统上线（前端 + API + 数据集成）
- 数据库: 2 个迁移文件（engagement 5 表 + B2B 6 表）+ 成就种子数据 20 条
- API: 4 个新端点 (streak / achievements / check-achievements / freeze)
- Supabase helpers: 10 个新函数 (fetch/upsert streak, XP, achievements, daily activity)
- 前端: streak_widget.js + achievement_toast.js + 成就画廊页
- 集成: session complete 端点自动触发 engagement 处理（streak + XP + 成就评估）
- 练习引擎: 完成时自动派发 achievement-unlocked 事件 → 弹出 toast 通知

#### 2. B2B 教师工具
- 着陆页 institution/index.html（3 tier 定价、痛点、功能预览）
- 教师仪表盘 institution/dashboard.html（统计、热力图、at-risk、常见错误）
- 作业管理 institution/assignments.html（创建表单、练习选择器、完成度追踪）

#### 3. 内容扩展
- 10 篇 SEO 博客（5 EN + 5 CN），双向 lang_links
- 家长周报邮件模板 templates/emails/weekly-report.html（双语、内联 CSS）
- Demo 数据种子脚本（30 天练习历史 + 成就 + 机构数据）

### 决策理由
- 前端 + API + 数据库同步推进，确保部署即可端到端验证
- Achievement toast 直接集成到 exercise_engine.js，零额外用户操作
- 教师工具以 demo 数据为骨架，API 未上线也可预览完整 UI

---

## 2026-02-27 | B2B 教培机构平台 + 技术规格库 + SEO 内容

### 决策背景
- 用户明确要求深度研究并开发针对教培机构的功能
- 竞品研究发现：无平台同时满足 IGCSE 大纲对齐 + 中文界面 + B2B 管理 + AI 自适应
- 全球教培 CRM 市场 $16.3 亿，亚太增速 15.2% CAGR
- 中国 IGCSE 头部教培（唯寻、翰林、犀牛）均缺专业化练题 SaaS

### 关键决策

#### 1. B2B 定价策略
- Starter: ¥99/学生/月 (10+ 学生)
- Professional: ¥149/学生/月 (30+ 学生)
- Enterprise: 定制 (100+ 学生)
- 教师账号免费（随机构方案）

#### 2. 技术规格库建立
四份技术规格已落盘，可直接交给 Codex/Gemini 实施：
- `plan/specs/ADAPTIVE-DIFFICULTY-ENGINE.md` — Elo 算法 + IRT 简化模型
- `plan/specs/STREAK-ACHIEVEMENT-SYSTEM.md` — 打卡/成就/XP/等级体系
- `plan/specs/WEEKLY-REPORT-SYSTEM.md` — 双语邮件 + 家长 CC
- `plan/specs/B2B-INSTITUTION-PLATFORM.md` — 完整机构端设计

#### 3. SEO 内容发布
新增 5 篇英文 SEO 博客文章，目标关键词：
- "IGCSE maths revision strategy"
- "CIE 0580 Paper 4 tips"
- "IGCSE trigonometry guide"
- "IGCSE percentage problems"
- "CIE 0580 vs Edexcel 4MA1"

#### 4. B2B 获客路径
教师免费使用 → 机构采购升级 → 30 天免费试用 → 签约

### 影响范围
- 新建 4 份 spec 文档 + 5 篇博客 + sitemap 更新
- CHIEF-ENGINEER-OPS-PLAN.md 更新路线图
- 项目方向增加 B2B 收入线

---

## 2026-02-27 | 北极星愿景：全球最佳 IGCSE 数学备考平台

### 决策背景
- 项目已有完整会员系统、202个微专题、双语内容体系、LaTeX 生产流水线
- 竞品分析显示：无人同时满足「双语」+「个性化」+「家长报告」
- 中国国际学校 IGCSE 学生 50 万+，是被严重低估的市场切口

### 关键决策

#### 1. 市场切入点：中国 IGCSE 家庭
- 竞品（Save My Exams、Dr Frost、Seneca）均无中文支持
- 中国家长是付费决策者，愿意为子女教育投入
- 口碑传播文化强（微信群、小红书）

#### 2. 五大战略支柱
1. **内容护城河** — 最深的双语 IGCSE 数学内容（目标 15,000+ 题）
2. **智能层** — 自适应难度 + 间隔重复 + 薄弱点分析
3. **体验层** — 每日打卡、成就系统、掌握度热力图
4. **报告层** — 中文家长报告（独一无二的差异化）
5. **营销引擎** — SEO 200+ 文章 + 小红书 + 微信

#### 3. 产品定价演进
- Phase 1: $9.99/月（学生版）
- Phase 2: $14.99/月（学生+家长版，含中文报告）
- Phase 3: $299/年（学校班级授权）

#### 4. 飞轮模型
更多内容 → 更好 SEO → 更多免费用户 → 更多练习数据 → 更好个性化 → 更高留存 → 更多付费 → 更多投入

### 行动项
- [x] 竞品分析完成（Save My Exams / Dr Frost / Seneca / Revision Village / PMT）
- [x] 北极星愿景文档创建 (`plan/NORTH-STAR-VISION.md`)
- [ ] Gate B 关闭（当前优先）
- [ ] 自适应引擎设计（Q2）
- [ ] 家长面板设计（Q3）

---

## 2026-02-27 | 总工程师运维计划 + AI 多引擎协作模式 + Gate B 推进

### 决策背景
- 会员系统代码 99% 完成（W0-W3 done, W4-W8 in_progress）
- subscription.html 从 waitlist 切换到 Payhip checkout（本次完成）
- 需要系统化的 AI 协作模式来高效推进剩余工作

### 关键决策

#### 1. AI 工具分工明确化
- **Claude Code (Opus)**: 总工程师角色 — 架构规划、多文件编辑、代码审查、文档生成
- **Codex (GPT-5)**: 实现工程师 — 后端/前端迭代编码、具体功能实现
- **Gemini Pro**: 架构审计员 — 风险分析、设计评审、内容初稿
- **Gemini Flash**: QA 工程师 — 测试矩阵、内容质量检查、练习题生成

#### 2. 进度追踪文档体系固化
- 新增 `plan/CHIEF-ENGINEER-OPS-PLAN.md` 作为总调度中心
- 所有执行进度必须落盘到对应文档
- Gate 状态变更实时更新到 COMMAND-CENTER

#### 3. Gate B 关键路径确认
- 人工操作（Payhip 产品创建 + Cloudflare env vars）是当前唯一阻塞项
- 代码层面已就绪（subscription.html + releases.json + release_registry.js）

### 行动项
- [x] subscription.html 切换到 Payhip checkout 模式
- [x] releases.json 添加 Week 1 entry
- [x] release_registry.js 同步
- [x] 创建 CHIEF-ENGINEER-OPS-PLAN.md
- [ ] Payhip 创建订阅产品（人工）
- [ ] Cloudflare 环境变量配置（人工）
- [ ] 替换 `{PRODUCT_ID}` 占位符
- [ ] E2E 验证通过

---

## 2026-02-10 | 战略框架整合 + Payhip 上线 + 退款政策

### 📌 决策背景
- 网站完成 Payhip 集成（免费产品已上线）
- 外部战略讨论产出 IP 保护、执行框架等洞察
- 退款政策需适配数字产品特性

### ✅ 关键决策

#### 1. 战略定位："内容系统构建者"
核心壁垒 = LaTeX 内容系统（NZH-MathPrep），非单个 PDF

#### 2. 执行框架：30-60-90 天
替代松散的"阶段一二三"，以"第一笔收入"为核心里程碑

#### 3. 退款政策：All Sales Final + Quality Promise
数字产品不退款，但承诺质量问题必处理

#### 4. IP 条款强化
区分考试局 IP（考题）vs 25Maths IP（源码、排版、翻译、设计）

#### 5. 约束原则落地
"凡是不会影响你收到第一笔钱的事情，一律延后"

### 行动项
- [x] 免费产品 Payhip 上线（CIE: payhip.com/b/5j2Sz, 4MA1: payhip.com/b/JzU7h）
- [x] 网站链接更新（免费→Payhip，£→$，退款政策）
- [x] terms.html IP 条款强化
- [x] NEXT-STEPS.md 重写为 30-60-90 框架
- [ ] 3 个付费产品 Payhip 上传（待 URL）

---

## 2026-02-11 | 订阅制方向明确 + 等待名单闭环

### 📌 决策背景
- 目标从“一次性购买”扩展到“持续价值交付”
- 需要让用户每周收到高质量专题练习，形成稳定订阅收入

### ✅ 关键决策

#### 1. 订阅模式：每周 1 个专题包
- 交付频率：每周 1 个专题练习包（含解析）
- 价格：$9.99 / 月
- 目标：稳定留存 + 可预测现金流

#### 2. 等待名单优先收集
- 付费产品未上架前先收集邮箱
- 通过早鸟价格 + 直接下载链接提高转化

#### 3. 免费资源作为信任入口
- 免费资源页面新增 “Free vs Complete” 对比
- 强化从免费 → 订阅 / 付费的路径

### 行动项
- [x] 订阅页面上线（subscription.html）
- [x] 8 周专题规划文档（plan/SUBSCRIPTION-PLAN.md）
- [x] 会员入口加入导航与核心页面
- [x] 博客与首页最新文章入口
- [ ] Payhip 订阅链接替换占位符
- [x] 移除 AMC8 / IAL P1 / IAL P2 模块

---

## 2026-02-10 | 销售渠道与邮箱收集策略

### 📌 决策背景
- 网站已完成开发，准备上线销售
- 需要确定支付平台、定价货币、免费资源策略
- 考虑是否在 TPT/TES 等第三方平台销售

### ✅ 关键决策

#### **1. 支付平台：Payhip > Gumroad**

**决策**: 使用 Payhip 作为独立网站的支付平台

**原因**:
- **手续费优势**: Payhip 5% vs Gumroad 12.5%（节省 7.5%）
- **一体化功能**: 内置邮件收集、自动发货、自动回复（无需 Formspree）
- **更适合低价产品**: $12-17 价格区间，Payhip 利润保留率更高（95% vs 87.5%）
- **营销工具**: 折扣码、捆绑销售、推荐计划、多语言支持

**财务影响**（月销 100 单）:
```
产品: Algebra $17
Payhip 收入: $1,615 (95%)
Gumroad 收入: $1,488 (87.5%)
月节省: $127
年节省: $1,524
```

**行动项**:
- [x] 注册 Payhip 账户
- [ ] 上传 5 个产品（3 付费 + 2 免费）
- [ ] 配置邮件自动化
- [ ] 网站集成 Payhip 链接

---

#### **2. 定价策略：美元 > 英镑**

**决策**: 统一使用美元定价（$17/$17/$12），放弃英镑（£15/£15/£12）

**原因**:
- **目标市场全球化**: CIE/Edexcel/AMC 覆盖美国、中国、新加坡、中东等
- **Payhip 限制**: 只支持美元定价
- **心理定价**: $17 比 $19 更友好，$12 保持整数
- **行业标准**: 数字产品市场美元更通用

**定价方案**（心理定价原则）:
```
Algebra Complete Bundle: $17.00 (原 £15 ≈ $19)
Functions & Graphs Bundle: $17.00 (原 £15 ≈ $19)
Number System Starter Pack: $12.00 (原 £12 ≈ $15)
```

**行动项**:
- [ ] 网站所有价格 £ → $
- [ ] Payhip 产品设置为美元
- [ ] 更新营销文案

---

#### **3. 免费资源策略：邮箱墙 > 直接下载**

**决策**: 免费资源（14 个 PDF）只通过 Payhip 下载，必须填写邮箱

**方案对比**:

| 方案 | 用户体验 | 邮箱收集率 | 长期价值 | 选择 |
|------|---------|-----------|---------|------|
| A. 邮箱墙（Payhip） | 填邮箱 → 下载 | 40-60% | ⭐⭐⭐⭐⭐ | ✅ |
| B. 直接下载 | 一键下载 | 0% | ⭐ | ❌ |
| C. 混合（样品+完整版） | 部分直接 | 20-30% | ⭐⭐⭐ | ❌ |

**关键洞察**:
- 邮箱列表是最宝贵的长期资产（可重复营销）
- 40% 有邮箱 > 80% 无邮箱（长期价值）
- 用户已习惯"邮箱换免费资源"（行业标准）

**按考试局分包**: 2 个免费产品（而非 1 个）
```
产品 1: CIE 0580 Free Resources (8 PDFs, 1.4 MB)
产品 2: Edexcel 4MA1 Free Resources (6 PDFs, 1.1 MB)
```

**原因**:
- CIE 学生只需要 CIE 资源
- Edexcel 学生只需要 Edexcel 资源
- 文件更小，用户体验更好
- 可以分别追踪每个考试局的下载数据

**行动项**:
- [x] 创建 2 个免费资源 ZIP 包
- [ ] Payhip 上传 2 个免费产品（$0）
- [ ] 网站移除所有直接下载链接
- [ ] 改为 Payhip 按钮 + "为什么需要邮箱"说明

---

#### **4. 销售渠道策略：独立网站优先 > TPT/TES 引流**

**决策**: 现阶段专注独立网站（25maths.com），6 个月后再考虑 TPT/TES 引流

**三种渠道对比**:

| 渠道 | 手续费 | 流量来源 | 用户数据 | 品牌控制 | 利润率 |
|------|--------|---------|---------|---------|--------|
| **独立网站 (Payhip)** | 5% | 需自己引流 | ✅ 完全拥有 | ✅ 完全控制 | **95%** ✅ |
| TPT (免费账户) | 45% | 平台提供 | ❌ 平台控制 | ❌ 受限 | 55% ❌ |
| TPT (付费账户) | 20% | 平台提供 | ❌ 平台控制 | ❌ 受限 | 80% |
| TES | 35% | 平台提供 | ❌ 平台控制 | ❌ 受限 | 65% |

**阶段性策略**:

**阶段 1: 独立网站为主（现在 - 6个月）**
```
渠道: 25maths.com (Payhip 5%)
产品: 3 付费 + 2 免费（邮箱收集）
引流: SEO + 社交媒体（免费）
目标:
  - 月销售 10-30 单 ($200-500)
  - 邮件列表 100-300 人
  - 积累客户评价
```

**阶段 2: TPT/TES 引流（6个月后）**
```
TPT/TES 策略:
  ✅ 上传: 免费资源（吸引下载）
  ✅ 上传: 1-2 个低价入门产品
  ✅ 引导: 产品内引流到 25maths.com
  ❌ 不上传: 高价完整产品（手续费太高）

目的: 利用 TPT/TES 流量 → 引流到独立网站
```

**利润对比**（100 单 Algebra $17）:
```
Payhip 独立网站: $1,615 ✅
TPT (免费账户): $935 (-$680)
TPT (付费账户): $1,360 (-$255)

结论: Payhip 比 TPT 免费账户多赚 73%！
```

**关键原则**:
1. **邮箱列表 = 最宝贵资产**（TPT/TES 无法收集）
2. **独立品牌 > 平台依赖**（长期价值）
3. **利润最大化**（Payhip 95% vs TPT 55%）
4. **TPT/TES 仅作引流工具**（不作主要销售渠道）

**行动项**:
- [ ] 专注独立网站 6 个月
- [ ] Google SEO 优化
- [ ] 社交媒体营销（小红书、知乎、Reddit）
- [ ] 6 个月后评估是否需要 TPT/TES 引流

---

### 📊 决策影响预测

#### **财务影响**（年度预测）

**保守预估**（月均 50 单）:
```
产品组合: 20 Algebra + 20 Functions + 10 Number
月收入: (20×$17) + (20×$17) + (10×$12) = $800
Payhip 手续费 (5%): -$40
月净收入: $760
年净收入: $9,120

如果用 Gumroad (12.5%):
月净收入: $700
年净收入: $8,400
差额: -$720/年
```

**乐观预估**（月均 200 单 + 邮件营销转化）:
```
月收入: $3,200
Payhip 手续费: -$160
月净收入: $3,040
年净收入: $36,480

邮件列表价值:
1000 邮箱 × 10% 转化 × $17 = $1,700/次营销
年营销 4 次 = $6,800
总年收入: $43,280
```

#### **战略影响**

**短期（0-6个月）**:
- ✅ 建立独立品牌
- ✅ 积累客户邮箱（最宝贵资产）
- ✅ 获得真实用户反馈
- ✅ 优化产品和网站

**长期（6个月+）**:
- ✅ 扩展产品线（AMC 8, IAL, 更多考试局）
- ✅ 推出订阅制（月费 $9.99，全部资源）
- ✅ 邮件营销自动化（新品、促销、学习技巧）
- ✅ 建立行业影响力

---

### 🎯 下一步行动清单

**立即执行**（本周）:
- [ ] 完成 Payhip 产品上传（5 个产品）
  - [ ] Algebra $17
  - [ ] Functions $17
  - [ ] Number $12
  - [ ] CIE Free $0
  - [ ] Edexcel Free $0
- [ ] 网站集成 Payhip 链接
- [ ] 价格更新 £ → $
- [ ] 配置 Payhip 邮件自动化

**本月完成**:
- [ ] Google Search Console 提交
- [ ] 社交媒体账号设置
- [ ] 第一篇营销内容发布

**3 个月内**:
- [ ] 积累 50+ 客户
- [ ] 邮件列表 200+ 人
- [ ] 收集用户反馈
- [ ] 优化产品和网站

**6 个月后评估**:
- [ ] 决定是否启动 TPT/TES 引流
- [ ] 考虑推出订阅制
- [ ] 扩展产品线（AMC 8, IAL）

---

### 📚 相关文档

- [STRATEGY.md](./STRATEGY.md) - 详细商业策略
- [HANDOFF.md](./HANDOFF.md) - 项目交接文档
- [PROJECT-PLAN.md](./PROJECT-PLAN.md) - 项目规划
- [MEMORY.md](~/.claude/projects/.../memory/MEMORY.md) - 项目记忆

---

### 💡 经验教训

**支付平台选择**:
- 对于低价数字产品（$10-20），手续费差异巨大
- 总成本 = 平台费 + 支付处理费 + 月订阅费
- 内置功能（邮件营销）可以节省额外工具成本

**定价策略**:
- 国际数字产品应使用美元（最通用）
- 心理定价有效：$17 比 $19 感觉便宜很多
- 保持定价简单一致

**邮箱收集**:
- 邮箱列表比单次销售更有价值
- 40% 转化率的邮箱 > 80% 无邮箱的下载
- 用户已习惯"邮箱换免费资源"

**销售渠道**:
- 独立网站 > 第三方平台（长期看）
- 平台手续费会吃掉 40-50% 利润
- 无法收集用户数据 = 失去最大价值

---

### 🔄 决策复盘机制

**每月复盘**（每月 1 号）:
- 回顾上月决策执行情况
- 分析数据（销量、邮箱增长、流量来源）
- 评估决策效果
- 调整策略（如需要）

**季度复盘**（每季度末）:
- 重大策略调整评估
- 财务目标达成情况
- 产品路线图调整
- 市场反馈总结

**记录格式**:
```markdown
## YYYY-MM-DD | 复盘：[决策主题]

### 原始决策
[引用原决策]

### 执行情况
- 已完成: ...
- 未完成: ...
- 遇到的问题: ...

### 数据结果
- 预期: ...
- 实际: ...
- 差距分析: ...

### 调整建议
- 保持: ...
- 优化: ...
- 放弃: ...
```

---

*本文档持续更新，记录所有影响项目发展的重要决策。*
