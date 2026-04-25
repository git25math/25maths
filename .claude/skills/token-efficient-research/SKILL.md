---
name: token-efficient-research
description: Use when delegating research/exploration sub-tasks to Explore/Plan/general-purpose agents in this codebase. Enforces small-step decomposition, strict output templates, hard tool-call budgets, and disk-as-cache patterns to prevent timeouts and token waste. Trigger when planning multi-phase work (e.g. section replication like s1.15→s4.6), scoping research sub-tasks, writing prompts for sub-agents, or any task involving 50+ files / 300+ data items where a monolithic agent run risks stream-idle-timeout.
---

# Token-Efficient Agent Research Discipline

> **沉淀来源**: 2026-04-24 s4.6 复刻 session — G0 monolithic agent timeout (62 tool / 6.6min) → 拆成 G0a-e 全部 <4min 完整返回。

---

## 🚀 30 秒速查（新会话第一次读，先读这块）

**完整 generator 生命周期**：
```
[Section G0]    §四·十一 PATTERN-AUDIT 总表 → 共享地图（1 次扫，N 个 generator 共享）
                §四·十二 真题驱动优先级 + 覆盖完整性 + [review] 标签 + 单一→复合开发顺序
   ↓
[Per-Generator] §四·九 (-1) 真题地图 → §四·十 S2.5 题型归纳 → §四·九 (0) 协同核查
                → §四·九 (1-6) 6 灵魂问 → 编码 → §四·八 11 维度打磨
                → §四·十三 E2E 三层贯通（generator → variants-index → frontend）
[元层贯穿]      §四·五 务实审查 + §四·六 ratchet + §四·四·五 sub-agent 协议 + §四·七 按需驱动
```

**13 章节速查**：

| § | 一句话核心 | 应用阶段 |
|---|---|---|
| §一 七铁律 | 拆分 / 模板 / 禁令 / 预算 / 缓存 / heredoc / 去噪 | sub-agent 委派前 |
| §二 失败-成功对照 | G0 monolithic timeout vs G0a 聚焦成功（量化）| 学习反例 |
| §三 调度模板 | Phase × 子任务 × agent 类型，每子任务独立 commit | 多阶段工作 |
| §四 prompt 写法清单 | 必含 7 项（目标/路径/模板/步骤/禁令/预算/去噪）| 写 prompt 前 |
| **§四·四·五** sub-agent 状态协议 | 启动前必写 SESSION-STATE / 返回必清 / 接手者协议 | 跨账号关键 |
| **§四·五** 务实不返工审查 | agent 返回后跑 7 反问表，发现返工风险主线立改 | agent 返回后 |
| **§四·六** incremental ratchet | 架构先 land WARN-only / 细节进清单 / 渐进升级 | commit/hold 决策 |
| **§四·七** 按需驱动补字段 | 不批量、不预留位、检查清单代替预补 | 真实需求来时 |
| **§四·八** 11 维度报告 | per-generator 永久档案 + 反查 hook | each fix |
| **§四·九 (0)** 协同设计纲领 | generator ↔ 前端 字段对应表 + 6 项 checkbox | before coding |
| **§四·九 (1-6)** 6 灵魂问 | 题型/变量/不变/变式维度/UX/反歧义（含 Q5 prefix/suffix）| before coding |
| **§四·九 (-1)** 真题图像复刻 | 5 子步 S1-S5：采集 / 元素清单 / 不变 vs 可变 / 参数池 / figure 复刻 | before coding |
| **§四·十** 单一/综合考法分类 | 6 维度判定 → 升级版 generator 独立 | 题型归纳时 |
| **§四·十一** 题型归纳审计层 | section 共享地图，节省 ~99% 真题扫描 | section G0 阶段 |
| **§四·十二** 真题驱动 + 覆盖完整 + [review] + 单一→复合 | audit ≠ 真题；零频不下架；先单一后复合 | section 启动打磨前 |
| §五 缓存策略 | 输出粒度 / commit 节奏 / 引用而非重述 / 工具调用去重 | 全程 |
| §六 与其他纪律的关系 | 与 CLAUDE.md / EXECUTION-DISCIPLINE 互补 | 全程 |
| §七 anti-pattern | 每个原则的反例清单 | 写 prompt 前 |
| §八 何时不用 sub-agent | 单文件 / 单命令 / ≤3 tool call 直接主线做 | 委派决策 |
| 心法 | token-efficient = current + Σ future rework → min | 时刻 |

**7 大致命反模式**（任何一条命中立刻停）：
1. monolithic agent 跨多数据源（必 timeout，参 §一/§二）
2. 批量预补字段 / 留 placeholder（必返工，参 §四·七）
3. 不归纳真题就写 generator（凭想象造池，参 §四·九 -1）
4. 设计 generator 不查 figure props（白图，参 §四·九 0）
5. 单 generator 多扫真题不用 PATTERN-AUDIT 缓存（浪费 99% token，参 §四·十一）
6. 看 audit issue list 直接修，跳过真题 PATTERN-AUDIT（修健康却不考的 generator，参 §四·十二）
7. **build/test/ratchet 全过就宣告 done，跳过前端 E2E 贯通**（学生看不到 = 0 价值，参 §四·十三）

**Generator 设计 5 大致命反模式**：参 §四·九 第 0 条 反模式表 + §四·七 反模式 + §四·十 反模式。

---

## 一、七条铁律

| # | 规则 | 反例（耗 token / 触发超时）|
|---:|---|---|
| 1 | **拆分 over 整合** — 一个 agent 一个数据源 | 一个 agent 跨 8 数据源 → timeout |
| 2 | **输出模板先行** — 严格 markdown 骨架带 `NN` 占位 | 自由章节 → agent 自行扩展 → 输出膨胀 |
| 3 | **显式禁令清单** — `不读 X / 不分析 / 不建议 / 不写脚本文件 / 不读 CLAUDE.md` | 含糊"专注 X" → agent 顺手读 10 个相关文件 |
| 4 | **硬预算** — `≤N tool call / ≤M 分钟，超时立即 partial 返回` | 未声明上限 → 跑到 hard timeout |
| 5 | **磁盘即缓存** — 每个 sub-task 末 commit 中间产物到 `docs/`，下个 sub-task `Read` 取 | 把 G0a 结果留在对话史 → G0b 时主线被迫重读 |
| 6 | **inline heredoc** — 不写中间 `.py / .sh / scratch` 文件；用 `python3 -c '...'` / `bash -c '...'` | 写 `analyze.py` → 多 1 次 Write + 1 次 Bash + 污染工作区 |
| 7 | **长尾去噪** — 频次 < 2 / 单出现项立即跳过；只在主线发现不足时回查 | 列全部 200+ 唯一 suffix → 每条占行 |

---

## 二、失败-成功对照（s4.6 G0 案例 · 真实数据）

| 维度 | ❌ G0 monolithic | ✅ G0a 聚焦 |
|---|---|---|
| 数据源 | exam.json + mcq.json + sols + gen 33 个 + refs + index + figures + reslice = **8 处** | exam.json = **1 处** |
| 输出目标 | 600-1000 行 markdown / 5 节 / 多表 | ~150 行 / 1 节 / 7 表 |
| Prompt 模板 | 自由风格 + "建议步骤" | 严格 `NN` 占位骨架 |
| Tool budget | 未声明 | `≤8 tool / ≤4 分钟` |
| 禁令清单 | 模糊"只读" | 11 条具体 `不读 X` |
| 长尾规则 | 未声明 | "频次 < 2 跳过" |
| **实际结果** | **62 tool / 6.6 min / timeout / 部分丢失** | **<8 tool / <4 min / 完整 7 表返回** |

---

## 三、调度模板（多 phase 多 agent 工作流）

```
Phase N · 主题
├── G[N]a · 子任务 A（窄数据源 X）→ Explore agent  → commit `docs/HANDOFF-*.md §A`
├── G[N]b · 子任务 B（窄数据源 Y）→ Explore agent  → commit §B
├── G[N]c · 子任务 C（设计/聚合）  → Plan agent    → commit §C
├── G[N]d · 子任务 D（实现）       → general-purpose → commit code + 测试
└── G[N]_final · 主线复审 + skill 沉淀 + push
```

**关键约束**：
- 每子任务一个独立 commit，**随时可中断**
- 复审 / 决策 / skill 沉淀**始终在主线**做，不踢给 agent
- agent 之间通过**磁盘**通信（commit → Read），不通过对话史
- 串行优先（避免主线被多个并发回包淹没），只有真正独立时才并发

---

## 四、prompt 写法清单（写 sub-agent prompt 必查）

**必须 include**：
- [ ] 一句话目标
- [ ] 数据源精确路径（含文件名）
- [ ] 输出模板（markdown / JSON / 表格）带 `NN` 占位
- [ ] 工作步骤建议（标 `≤6 步`）
- [ ] 严格约束清单（`不读 / 不分析 / 不写`，逐项列）
- [ ] 时间预算 + tool-call 上限 + 超时 fallback（"立即 partial 返回"）
- [ ] 长尾去噪规则（"频次 < N 跳过"）

**禁止 include**：
- 大量背景叙述（agent 不需要历史，只需要当下任务）
- "请你聪明地……" / "帮我想想……" 类弹性指令（agent 会过度发挥）
- 没声明的"附加建议"（要求会被当真，触发额外阅读 + 输出膨胀）
- 跨任务 reference（"参照 s1.15 那个" → agent 会去读 s1.15 全部文档）

---

## 四·四·五、Sub-agent 运行状态协议（跨账号切换必备）

> **沉淀来源**: 2026-04-25 真实评价暴露——"Account A 启动 sub-agent 限额停 → Account B 接手不知 agent 在做什么 / 是否会返回" 是双账号场景最大盲区。

### 核心问题

Sub-agent 是**异步**的。Account A 启动后限额耗尽时：
- agent 状态只在 Account A 的 session memory
- Account B clone repo 看不到任何 agent 信息
- B 不知 A 启动了什么 / 期望什么输出 / 是否要重启
- **结果**：B 可能重启同一 agent（重复造轮子）或彻底丢失 A 的工作

### 协议（4 步，每次 sub-agent 调用都跑）

**Step 1 · 启动前必写**

每次 `Agent({...})` 调用**之前**，主线在 `SESSION-STATE.md` "Sub-agent 当前状态" 节写：

```markdown
**当前 active sub-agent**:
- ID/类型: <Explore/Plan/general-purpose>
- 任务摘要: ≤2 行
- 期望输出: ≤2 行（如"~150 行 markdown，含 X/Y/Z 表格"）
- 启动时间: YYYY-MM-DDTHH:MM
- Prompt 关键约束: <数据源 + 时间预算 + token 上限>
- 接手者动作（如 Account A 限额停）:
  - 如 agent 已返回 → 主线读 result 然后从这步继续
  - 如 agent 未返回 → 等待通知 / 或 SendMessage 检查 / 或重启同样 prompt
```

**Step 2 · 启动 sub-agent**

主线 `Agent({...})` 调用，立即 commit + push 上面 SESSION-STATE 改动（哪怕同个 commit 也行）。

**Step 3 · agent 返回后必清**

Agent 返回主线，主线**立即**：
1. 处理 result（commit / 写入 handoff / 决定下一步）
2. 把 SESSION-STATE 的 "当前 active sub-agent" 改回 "无"
3. 把 agent 加入"最近完成 sub-agent"列表
4. commit + push

**Step 4 · 接手者协议**

Account B 接手时：
1. 读 SESSION-STATE "Sub-agent 当前状态"
2. 如显示 active → 决策：
   - 等通知（任务面板上看是否有未读 task-notification）
   - 如等不到（A 已完全 disconnect）→ 用 SendMessage 检查最后输出
   - 如 agent 已 timeout / 死掉 → 按 Step 1 的 prompt 关键约束重启
3. 如显示 active="无" → 直接按 TODO 接

### 为什么不用 chat history

Chat history 只在 session memory，跨账号丢失。**git tracked 的 SESSION-STATE.md 是唯一可靠通信通道**。

### 反模式

| 反模式 | 后果 |
|---|---|
| 启动 agent 不写 SESSION-STATE | A 限额停 → B 不知有 agent 在跑 → 重启 / 错过结果 |
| Agent 返回不清状态 | 残留 active 标记 → B 误以为还在跑 |
| Prompt 关键约束写在对话里没存 SESSION-STATE | B 重启 agent 时不知约束 → 可能复现 G0 monolithic timeout |
| 同时启动多个 agent 不区分 | SESSION-STATE 只指一个 → 漏 |

### 心法

> Sub-agent = 异步消息，必须写"信件存根" (SESSION-STATE 记录) 才能跨账号传达。
> 否则 = "Account A 寄了信，Account B 不知道有信在路上"。

---

## 四·五、务实不返工审查（主线必做，每次 agent 返回后）

> **沉淀来源**: 2026-04-24 s4.6 G1 (Plan agent SVG SSR 架构) 返回——agent 给出"绕过 FigureRegistry 直接 import 4 组件"方案，一次过看似省事，但**3 个月后发现 dispatch bug 时必须重写整个测试结构**。"务实"≠"快"，是**长期最少返工**的路径。

每次 sub-agent 返回设计/方案时，主线**必须**逐项过以下 7 个反问，发现返工风险**立刻在主线修订**（不要踢回 agent 第二轮）：

| # | 反问 | 触发返工的常见模式 |
|---|---|---|
| 1 | **本次选择是否绕过了真正应该测试的层？** | 为图省事 mock 一切，结果测的是 mock 不是真行为 |
| 2 | **3-6 个月后这个测试/代码若失败，能定位到具体单点吗？** | 单 `it` 跑 N case → 失败 1 条刷出 N 行同质日志，难诊断 |
| 3 | **下个相似 section / variant 复用时需要改几行？** | 写死 section id / 文件路径，复刻 s4.7 时重写一遍 |
| 4 | **CI 默认参数是否覆盖了所有随机分支？** | SAMPLES=3 默认，env 可调高，但 CI 永远不进高值 |
| 5 | **方案是否引入了"沉默退化"？**（如 fallback、默认值、宽容 regex） | 测试通过但实际功能退化，几个月后发现 |
| 6 | **错误处理是吞掉异常还是 surface 出来？** | try/catch 没 record 错误 → 静默跳过 |
| 7 | **本方案在最坏情况下会浪费多少工时？** | 选错架构 → 重写 1-2 天；选对 → 永不返工 |

**判断标准**：任何 1 项亮红灯就主线修订，**不接受 "下次再说"**。

**反例**：s4.6 G1 一次过的话，未来 dispatch bug 必须改：
- ① 测试结构（绕过 FigureRegistry）
- ② vitest 测试范围（重新写 mapping）
- ③ s4.7/s5.4 的同款测试（每 section 都要 mock 一次）
- 总返工 ≥ 1 工作日

修订后（主线介入）：
- ① mock localStorage，正常走 FigureRegistry
- ② 33 describe × 5 it 失败定位精确
- ③ verify-section.sh 用 globbing `s${SEC}-figure-ssr.test.ts` 自动 detect
- 总返工：0

**位置**：每次 agent 输出后，主线立刻在对话里输出审查表（小步），通过后再 commit；不通过则当场修订。**禁止**先 commit 再回头改。

---

## 四·六、架构先跑，细节后修（incremental quality ratchet）

> **沉淀来源**: 2026-04-24 s4.6 G2 SVG SSR 测试 land，捕获 92 个既存 figure bug。
> — **未选** "先批量修再 land 测试"（一次性大改 + 难回滚 + 主线 context 撑爆）。
> — **而选** "测试 land + Phase 7 WARN-only + G2.6+ 逐 commit 修复"（渐进可见，每 commit warn 数下降）。
> 用户原话：「对于错误只要不影响通畅度就完全不记下来，先架构后细节，架构跑起来，细节逐一按高标准修复，不要在一开始就卡死在问题的修复。但也不是说这个就是完美。」

### 核心原则

**架构跑起来 → 细节逐一打磨**。永远**不要因细节问题卡死整体推进**，但**也不是得过且过** —— 细节进入"已知待修"清单，按高标准独立修复，每次 1 commit，warn 数可见下降。

### 6 条铁律

1. **"通畅度" 是分界线**
   - **通畅** = `vite build` 不挂 / CI 不全红 / 关键路径能跑 / verify-section 不 FAIL
   - **不通畅** = 架构本身有 bug，必须当即修
   - **通畅但 92 个细节 bug** = land 架构 + 标注待修，不卡

2. **WARN > FAIL > 假装 OK**
   - 真 bug 用 **WARN** 显式标记（CI 显示但不阻塞 verdict）
   - 绝不放宽阈值 / 沉默 try-catch（这是 §四·五 反问 5"沉默退化"反模式）
   - 绝不假装"baseline 全绿"（自欺，未来必返工）

3. **渐进可见 ratchet（棘轮）**
   - 每修一个 → CI warn 数 −1（可被任何人随时观察进度）
   - 全 0 时 promote WARN → FAIL（守卫升级，从此回归即红）
   - 不允许"先全修再 land"（一次性大改 + 难回滚 + 难分散并行）

4. **细节清单永久存档（不依赖对话）**
   - bug 列表必须写入 `docs/HANDOFF-*.md`（如本次 §六.9 表 19 generator + 失败模式 + P0/P1/P2 优先级）
   - 不留在对话史（会被压缩 / 跨 session 丢失）
   - 后续 session 直接 `Read handoff` 接手对应 G commit

5. **优先级显式分级**
   | 级别 | 含义 | 时序 |
   |---|---|---|
   | **P0** | 架构性 / dispatch 漏 / undefined value | **当 session** 修 |
   | **P1** | 字段缺 / 通用 pattern（一族 generator 共病）| 批量修，**1 commit / 1 group** |
   | **P2** | 边界 / level-specific 单点 | 单独 commit |
   | **P3** | 已知技术债 / nice-to-have | handoff 留 future session |

6. **完美 ≠ 一次到位；完美 = 系统性闭环**
   - 一次到位 = 大改 + 漏修 + 难回滚 + 卡死推进
   - 系统性闭环 = 每 commit 单点改动 + warn 数可见下降 + 全 0 升级守卫 + handoff 永久档案

### 3 条反模式（一发现立即 stop）

| 反模式 | 典型触发 | 修法 |
|---|---|---|
| 因细节问题不 land 架构 | "等我先把 92 个 bug 都修了再 commit" | 立即 land 架构 + 标注细节 + 列后续 commit 序号 |
| 用宽容阈值掩盖 bug | "把 length>200 改成 length>50 就 pass 了" | 拒绝；bug 进 WARN 名单 |
| 不写后续 commit 序号 | "我之后修一下就好" | 必须列 G2.6 / G2.7 / ... 每条对应 1 commit + 必须进 handoff |

### 与 §四·五 务实审查的关系

| skill 章节 | 维度 | 答的问题 |
|---|---|---|
| **§四·五** | **单步审查**（agent 返回后即时） | "这步要不要返工"|
| **§四·六**（本节）| **多步策略**（整体推进分期）| "这步要不要 land 还是先修细节"|

两者互补：审查每一步质量（§四·五）+ 决策每步是 land 还是 hold（§四·六）= 完整工作流。

---

## 四·七、缺字段不批量补，按需驱动（demand-driven field fix）

> **沉淀来源**: 2026-04-24 G2.6 修 `ANG_ANGLES_PROPERTIES_MISC` 时主线一次性给 4 branch 各加 placeholder `vertices + AngleInfo` 字段，结果**反而引入 +3 regression**（`note: 'exterior_angle'` 触发 figure 外角延伸 path 失败）。
> 用户原话：「如果缺字段的话，不要一下子批量补充字段，也不要有预留位...因为那也还会再返工，多此一举，在当时再补充即可，但是要有当时可能需要检查的一个清单」

### 核心原则

**不批量预补字段，不留 placeholder**。**当需求驱动时**（真实题目要求 figure 渲染这个 case、用户报视觉错、真题对照发现错图）才补。当前作为**检查清单待办**记录在 handoff doc，每轮启动时扫一遍。

### 5 条铁律

1. **批量补字段 = 预留位 = 多此一举**
   - 现在猜未来需求 → 几个月后真实需求来时**字段形态已变** → 必重写
   - 例：本次给 generator 加 `vertices: [{x:1,y:4,...}]` placeholder；真实 CIE 真题图坐标完全不同 → 重写

2. **检查清单代替预补**
   - 把"该 generator 缺哪些字段"写进 handoff `docs/HANDOFF-*.md` 的 **Pending Field Checks** 清单
   - 字段：generator 名 / 触发 branch / 缺字段类型（vertices / angles / sides 等） / 已知 figure 期望
   - 下次接触该 generator 时自动 trigger 检查（不依赖记忆 / 不依赖对话史）

3. **当时再补 = 真实需求驱动**
   - 触发条件之一：用户报 figure 视觉错
   - 触发条件之二：真题对照发现错图
   - 触发条件之三：Phase 7 某 sample 实际渲染需要（不是 baseline 全 fail，是某个具体场景必须用）
   - 此时已知具体形态（哪个 vertex 在哪、哪个 angle 是 unknown）→ 一次到位

4. **占位 placeholder 是反模式**
   - "标准 ABCD 矩形 placeholder" 视觉是假的、几何是错的
   - 学生看到错图会被误导 → 比白图更糟（CIE "NOT TO SCALE" 标语也无法掩盖错图）
   - **宁可白图**

5. **每轮检查清单**
   - 每次启动新 commit / G / Phase 前：扫一遍清单
   - 当前任务命中清单某项 → 当下补一处
   - 未命中 → 留清单

### 与 §四·六 的关系

| 章节 | 答的问题 |
|---|---|
| §四·六 | 通畅度优先 / WARN→FAIL ratchet / 细节有清单 |
| **§四·七**（本节）| **细节怎么修：不批量、不预留、需求驱动** |

§四·六 强调"先架构后细节"，§四·七 强调"细节修要等真实需求驱动，写清单不预补"。

### 反例（本次 G2.6 第一次尝试）

| 反模式 | 触发 |
|---|---|
| 一次给 4 branch 都加 `vertices/angles` placeholder | 加 `note: 'exterior_angle'` 推断未来需求 → +3 regression |
| 假装"NOT TO SCALE" 标语能掩盖错误几何 | 错图比白图更误导 |
| 没写检查清单就批量改 | 改完无法精确知道每改了哪些 placeholder 是 placeholder |

### 正例（本次 G2.6 修正后）

| 正模式 | 行动 |
|---|---|
| 回滚所有 placeholder 字段 | `git checkout HEAD -- generator.ts` |
| 把 4 branch 写进 handoff §六.13 清单 | 缺字段 / 触发 / figure 期望 全列 |
| Phase 7 仍 WARN | 保持渐进 ratchet 节奏 |
| 等真实需求驱动再修一处 | 不预补、不预留、不假设 |

### 心法

> **预补字段 = 用想象的代码换真实的 token**。
> 真实需求一来，想象的代码全报废。
> 写检查清单 0 token 成本，等真实驱动来时一次到位。

---

## 四·八、Generator 打磨多维度检测报告（per-generator quality report）

> **沉淀来源**: 2026-04-24 用户原话：「Generator 的打磨是一个非常重要的关键，需要有多维度的指标，不要批量生产，而是要逐一打磨，检测到每一个维度，而且要有专门的检测报告，这样后期有问题才能够高效反查得到。」

### 核心原则

**Generator 是产品的关键资产**。每个 generator 单独深入打磨，**不批量生产**。打磨时按**多维度指标**系统化检测，产出 **per-generator 检测报告**写入 `docs/generator-quality/<section>/<GEN_NAME>.md`，未来反查 bug 时直接定位到对应报告。

### 11 维度指标（generator 健康清单）

| # | 维度 | 检测方法 | 通过标准 |
|---:|---|---|---|
| 1 | **figure 数据完整性** | 跑 SSR 冒烟测试（如 s4.6-figure-ssr.test.ts），看 length>200 且含 `<svg` | layer 1+2+3 全过 |
| 2 | **figure 视觉真实** | 真题截图对照（用户提供 PDF / 真题数据）| 坐标 + 角度反映真实题图，**禁 placeholder** |
| 3 | **answer.value 输入兼容 + prefix/suffix 视觉**（参 §四·九 Q5.2）| 看 `inputTemplate.type/prefix/suffix` 与题面前后缀对照 + answer 数据结构（参 CLAUDE.md anti-pattern "checkFraction" / "等值分数题不设 accept_unsimplified"）| (a) type 匹配（number/fraction/expression）(b) **题面固定前后缀全部进 inputTemplate.prefix/suffix**（学生只填可变部分） |
| 4 | **answer.value 数值正确** | 反向验算（如三角形 angle 和 =180）| 公式自洽 |
| 5 | **bilingual 完整** | grep `t({\\|en:\\|zh:` 数 question/tutorial 中文英文对 | zh + en 全有 |
| 6 | **tutorial 步骤准确** | 人工读，逻辑链不跳跃 | 步骤数 ≥ 2，最后一步含数字答案 |
| 7 | **参数池熵** | `npx tsx scripts/benchmark-generators.ts <SECTION>` 数随机性 | 每 level 20 sample ≥ 15 unique fingerprint |
| 8 | **fingerprint dedup** | `generateUnique` 调用 + retry 限 30 次内成功 | 无 stack overflow / 无静默重复 |
| 9 | **真题语料出处** | 情境池 / 人名池每条对照真题频次（参 CLAUDE.md anti-pattern "情景池条目没有真题语料出处") | 频次 ≥ 2 入主池，1 入稀有扩展，0 删 |
| 10 | **error pattern 覆盖** | `variants-index.json` 中 `common_errors` 字段 | ≥ 2 条 common error |
| 11 | **answer-path 完整** | `inputTemplateToSpec → checker.checkX` 链通顺（CLAUDE.md anti-pattern "分数答案不带 numerator/denominator")| 答题不会被永远判错 |

### 报告位置 + 命名

`docs/generator-quality/<section>/<GENERATOR_FILENAME>.md`

例：
- `docs/generator-quality/s4.6/ANG_ANGLES_PROPERTIES_MISC.md`
- `docs/generator-quality/s1.15/CALC_DURATION.md`

### 报告模板（per-generator）

```markdown
# <GEN_NAME> 质量检测报告

**Generator**: src/engine/generators/v2/<path>/<GEN_NAME>.ts
**variantId**: cie.X.Y.Z.<name>
**最近检测**: YYYY-MM-DD by <agent/main>
**总评**: ✅ GOLD / ⚠️ STANDARD WITH WARNINGS / ❌ FAIL

## 11 维度检测结果

| # | 维度 | 状态 | 证据 / 备注 |
|---:|---|---|---|
| 1 | figure 数据完整性 | ✅/⚠️/❌ | (具体数 / 失败例) |
| 2 | figure 视觉真实 | ✅/⚠️/❌/⏸️待真题对照 | |
| ... | | | |

## 已知 Pending 项（按需驱动修）

[列每条 pending field check 或视觉待对照项，链 handoff §六.13]

## 反查 hook

- 失败 SSR sample 输出含 `figureType=X length=Y` → 看本报告 §1
- 答错率高 → 看本报告 §3 §4
- 题目重复抱怨 → 看本报告 §7 §8
- "题图怪怪的" → 看本报告 §2

## 修订历史

- YYYY-MM-DD: <修了哪 1 个维度>，commit <hash>
```

### 5 条铁律

1. **逐一打磨，绝不批量**
   - 每个 generator 一份独立报告 + 一个独立 commit
   - 拒绝"我把 7 个 polygon generator 一起改了" pattern
   - 例外：仅当所有 generator 改动都是**同一行同一字符**且确认无差异时（罕见）

2. **多维度并重**
   - 不只跑 SSR 测试就算"打磨完"——还有真题对照 / 答题路径 / 真题语料 / 熵 等
   - 维度越多，报告越能反查
   - 但**不一次扫全 11 维度**——每次按需驱动只检相关维度（见 §四·七 按需驱动）

3. **报告永久档案**
   - 报告写到 `docs/generator-quality/`，进 git，跨 session 持久
   - 不依赖对话史 / 不依赖 memory
   - 后期 bug 反查路径：现象 → 维度 → 报告 → 根因

4. **真题对照 = 视觉真实唯一证据**
   - 维度 2（figure 视觉真实）只能由用户提供 PDF / 真题数据驱动
   - 主线绝不"我觉得这样的图差不多"自我满足
   - 真题来了 → 一次到位修；没来 → ⏸️ 待真题对照状态

5. **反查 hook 显式化**
   - 报告必有"反查 hook"节，列具体症状 → 报告对应章节
   - 后期发现 bug 时反向 grep 报告即可定位
   - 例：CI 报 `figureType=quadrilateral length=44` → grep "figureType=quadrilateral" docs/generator-quality/ → 直接看相关报告 §1 / §2

### 与 §四·六 / §四·七 的关系

| 章节 | 答的问题 |
|---|---|
| §四·六 | 通畅度优先 / WARN→FAIL ratchet 总策略 |
| §四·七 | 修字段不批量、不预留、按需驱动 |
| **§四·八**（本节）| **打磨某 generator 时怎么系统化、产档案** |

`先架构 (§四·六)` → `按需驱动一处 (§四·七)` → `按 11 维度系统化打磨这一处 (§四·八)` → 闭环。

### 反例 vs 正例

| 反例 | 正例 |
|---|---|
| 一次给 7 个 polygon generator 都加 sides 字段 | 等用户/真题驱动到 ANG_POLYGON_INT 时，按 11 维度打磨 1 个 generator + 写报告 |
| 跑 SSR 测试过了就算 "ANG_POLYGON_INT 修好了" | 11 维度全测，2 个 ⏸️ 待真题对照标注，9 个 ✅ 才算 |
| 报告只写"修了 figure"一句话 | 报告含证据（具体 sample 输出 / 真题截图 hash） + 维度 ✅/⚠️ + 反查 hook |

### 心法

> **打磨 ≠ 通过测试**。
> 打磨 = 11 维度全测 + 报告留档 + 后期可反查。
> 通过测试 = 一个维度通过，10 个维度未知。
> Generator 是产品资产，不是一次性脚本。

---

## 四·九、Generator 设计灵魂（before coding · 协同设计 + 6 灵魂问）

> **沉淀来源**: 2026-04-24 用户原话：「创建 generator 时。要深刻理解体会题型考查的灵魂核心，哪些是变量参数池，哪些是不变的，要在多大的维度上来变式生成，对应的答题格式是否符合使用者便利性，答案的可容性是否正确，不会产生歧义。」+「这个在考虑到前端显示的时候，输入内容的生成器接纳才不会返工，所以在设计 generator 的时候，一定要和前端显示一起考虑。」

### 第 0 条 · 前置纲领（compulsory）：Generator 与前端协同设计

**Generator 不是孤立的脚本，是前端管线的入口**。设计 generator 的每一个字段都必须**同时**回答"前端怎么用它显示 / 学生怎么交互 / checker 怎么判"。任何字段独立设计 = 必然返工。

#### Generator ↔ 前端关键对应表（每条都必须协同）

| Generator 字段 | 前端组件/逻辑 | 协同要点（不一致 = 返工） |
|---|---|---|
| `data.figureType` | `FigureRegistry.tsx` dispatch | figureType 必须在 dispatch 表里；否则白图。漏 case 必返工 |
| `data.{vertices, angles, sides, lines, ...}` | TriangleFigure / PolygonFigure / 等 | figure 组件期望什么字段 → generator 必须传完整。`return null` (白图) = 字段缺 |
| `question.{en, zh}` | PracticePage 题干 (KaTeX 渲染) | LaTeX 转义正确 / 双语都填 / 含 newline 时 ESM 安全 |
| `inputTemplate.type` | `TemplateInput` 选输入框组件 | type 与 answer.value 数据结构必须匹配 (number↔数字 / fraction↔{n,d} / multi_select↔array) |
| **`inputTemplate.prefix`** | `TemplateInput` 输入框前显示 | **题面固定前缀（`Angle ABC =` / `x =`）必须进这里**；学生不重输 |
| **`inputTemplate.suffix`** | `TemplateInput` 输入框后显示 | **题面单位/符号（`°` / `cm` / `cm²`）必须进这里**；学生不重输 |
| `answer.value` | `inputTemplateToSpec → checker.checkX` | 类型对、数值对、结构对 (CLAUDE.md anti-pattern "分数答案不带 numerator/denominator") |
| `answer.display` | 答案展示 / 解析步骤 | LaTeX 安全；和 question 风格一致 |
| `tutorialSteps[].text` | tutorial 渲染 | 双语 / 步骤完整 / 最后一步含数字答案 |
| `fingerprint` | sessionController dedup | 唯一不重复 |

#### 协同设计核查（写 generator 前必跑一遍）

- [ ] **figureType 已在 FigureRegistry 中？** 不在 → 先加 dispatch 或换名
- [ ] **figure 组件的必需 props 字段我都传了？** 缺 → return null 白图
- [ ] **题面 prefix/suffix 都进了 inputTemplate？** 漏 → 学生填错位置/被误判
- [ ] **answer.value 数据结构 ↔ inputTemplate.type 匹配？** 不匹配 → 永远判错
- [ ] **学生最常见的几种合法写法 checker 都接受？** 否 → 误判
- [ ] **真题对照过题面格式？** 否 → 视觉不像 CIE / 考试感弱

#### 反模式（任何一条命中 = 必返工）

| 反模式 | 后果 |
|---|---|
| 设计 generator 数据结构时不查 figure 组件期望 props | 白图 + 重写 figure 字段 |
| `question` 写"Find x in degrees"但 `inputTemplate.suffix` 没 `°` | 学生不知是否填单位 / 填了被误判 / 重写 inputTemplate |
| `answer.value = {n:1, d:2}` 但 `inputTemplate.type='number'` | 永远判错 / 重写 type 或 answer 数据 |
| 编码完才想到"哎前端怎么渲染" | 字段名/类型错 / 重写 generator 30%+ |
| 假设 `answer.display` 等于 `answer.value.toString()` | LaTeX 转义错 / 学生看到原始码 |

#### 心法（前置纲领）

> **Generator 设计 = 前端 UX 设计 + 数据合约设计 + 教育内容设计 三合一**。
> 三个设计同时进行才不返工。
> 单独想 generator 数据 = 把"代码工作"和"产品设计"切割 → 必返工。

---

### 6 灵魂问（在第 0 条前置纲领基础上展开）

写 generator 代码**之前**先回答 6 问，全部答清楚才开始编码。否则会出现"代码跑通但题目教育价值低 / 答案有歧义被误判 / 学生输入框对不上"等问题。

### 6 灵魂问

**Q1 · 题型灵魂核心**
- 这道题考的是哪个 KP / 哪种推理能力？
- 学生答对说明掌握了什么？
- 真题怎么问？（CIE 真题对照原句）

**Q2 · 变量参数池（可变的）**
- 数字（角度 / 边长 / 年份 / 数量）—— 范围 / 步长 / 分布
- 字母标号（顶点 ABC vs PQR vs LMN）—— 真题习惯？
- 情境上下文（人名 / 商品 / 交通工具）—— 真题语料频次（参 CLAUDE.md anti-pattern "情景池条目无真题出处"）
- 视觉布局（朝向 / 横纵 / 镜像）

**Q3 · 不变核心**
- 基础 KP（如"三角形角和=180°"）
- 推理路径（如"外角定理 → 算 missing"）
- 答案类型（number / fraction / expression）+ 单位（°/cm/cm²）

**Q4 · 变式维度尺度**
- 1 维变化 = 1 个数（太单调）
- N 维变化 = 多参数组合（要保证每组合都合法题）
- L1→Boss 复杂度阶梯怎么递增（参 atomic engine 5 levels）
- 参数池熵：每 level 20 sample ≥ 15 unique fingerprint

**Q5 · 答题 UX（使用者便利性）**

**Q5.1 输入框类型**
- 符合答案性质（fraction 题不能用 number 框）
- 学生最容易写法（`5/6` vs `0.833` vs `5÷6`）

**Q5.2 题面 prefix/suffix 视觉一致性（关键）**
- **真题题面里的固定前后缀必须对应到 `inputTemplate.prefix` / `inputTemplate.suffix`**，前端 `TemplateInput` 渲染
- 学生**只填可变部分**（数字 / 表达式），不重复输入固定文字
- 例：
  - 题面 `Angle ABC = ___°` → `inputTemplate: { type: 'number', prefix: 'Angle ABC = ', suffix: '°' }`
  - 题面 `x = ___` → `inputTemplate: { type: 'number', prefix: 'x = ' }`
  - 题面 `___ cm²` → `inputTemplate: { type: 'number', suffix: ' cm²' }`
- 数据源：G0a §一表 3（s4.6 真实 prefix `$x$ =` 22 次 / `Angle $ABC$ =` 2 次等；suffix `$°$` 7 次 / `$\text{cm}$` 30 次等）—— 真题怎么写，generator 就怎么传
- 反模式：`question` 文本里写 "Find the value of x in degrees" 但 inputTemplate 没 suffix `°` → 学生不知该不该填单位 / 填了被误判

**Q5.3 单位与符号约定**
- 答案单位（°/cm/cm²/$）作为 `inputTemplate.suffix`，**不**让学生手填
- 数学符号（`x =` / `Angle ABC =`）作为 `prefix`
- 多 part 题（(a)/(b)/(c)）每 part 独立 inputTemplate

**Q5.4 多解 / 多步**
- 多 part 题分段引导
- 多解题 inputTemplate.type='multi_select' 或 'list'

**Q6 · 答案可容性 + 反歧义**
- 数学等价不同写法都接受吗（`2/4` 与 `1/2` / `0.5` 与 `1/2`）
- 简化必须 vs 不必须（参 CLAUDE.md anti-pattern "等值分数题不设 `accept_unsimplified`"）
- 浮点容差（0.1 vs 0.099999）
- 多解题：所有合法解传给 checker

### 应用流程

```
-1. 真题图像完整复刻 + 跨样本变量分析（详细见下）
 0. 协同核查（第 0 条 6 项 checkbox）
 1. 写第 0+ -1+ 6 问答案到 docs/generator-quality/<section>/<GEN>.md §设计节
 2. 主线复审（或 Plan agent）
 3. 编码 generator
 4. 按 §四·八 11 维度检测，同 .md §检测节
 5. 报告留 §修订历史
```

设计 + 检测 + 历史 **同一份 .md**，反查时一处看全。

### 第 -1 步详细方法：真题图像完整复刻 + 跨样本变量分析

> **沉淀来源**: 2026-04-24 用户原话：「完整的要复刻原题的图像，分析变量」
> Generator 不是凭想象造题——必须从真题出发，跨样本分析"什么不变 / 什么可变"，才能正确参数化。

#### 核心方法（5 步）

**S1 · 真题样本采集**
- 5-10 道**同类题型**的真题（用户提供 PDF / 真题 corpus / G0d 抽样）
- 每道真题需含：完整题面文本 + figure 图像 + mark scheme 答案
- 数量 < 5 → 样本不足，先收集再设计

**S2 · 图像元素逐题清单**
- 列每道真题 figure 的所有视觉元素：
  - 几何对象（点 / 线 / 弧 / 多边形 / 立体）
  - 标号（顶点字母 / 边长 / 角度数值）
  - 单位标注（°/cm/cm²）
  - 题型语义标记（NOT TO SCALE / 平行箭头 / 等长 tick）
  - 视觉特征（朝向 / 旋转 / 镜像）

**S3 · 跨样本"不变 vs 可变"分类表**

| 元素 | 真题 1 | 真题 2 | ... | 真题 N | 类别 |
|---|---|---|---|---|---|
| 三角形结构 | 有 | 有 | ... | 有 | **固定核心**（写死）|
| 角度数值 | 45° | 67° | ... | 73° | **变量池**（范围 20-80 等）|
| 顶点标号 | ABC | PQR | ... | LMN | **变量池**（pick from VERTEX_LABELS）|
| 角和 | 180° | 180° | ... | 180° | **数学不变量**（公式约束）|
| 图朝向 | 顶上 | 底向上 | ... | 倾斜 | **视觉变量**（参数化但有限制）|
| 单位 | ° | ° | ... | ° | **固定单位**（写死） |

**S4 · 参数池设计（基于 S3 表）**
- 每个**变量池**列表：范围 + 步长 + 真题频次驱动的分布
- 每个**数学不变量**：作公式约束（不是变量，是关系）
- 每个**固定核心**：generator 内硬编码（不参数化）
- 每个**视觉变量**：限制范围（如朝向只 4 种，不是任意角度旋转）

**S5 · figure 复刻设计**
- generator 输出的 `data.{vertices, angles, ...}` 必须**精确还原**真题视觉
  - 视觉真实 = 角度数值反映在画图位置（GEOMETRY-TRUTHFUL）
  - 不允许"差不多就行" / "NOT TO SCALE 占位"（参 §四·七 反模式）
- figure 组件期望什么 props（参 §四·九 第 0 条对应表）→ generator 必须传完整
- 若现有 figure 组件不能渲染该题型 → 提议加 figure 组件 / 加 dispatch case（不要硬塞错误 figureType）

#### 应用案例（举例说明 S3 表的写法）

抽样 5 道 `triangle_exterior_angle` 真题后：

| 元素 | T1 (P12-Q11) | T2 (P32-Q05) | T3 (P22-Q08) | T4 (P11-Q07) | T5 (P31-Q04) | 类别 |
|---|---|---|---|---|---|---|
| 三角形 | 有 | 有 | 有 | 有 | 有 | 固定核心 |
| 外角延伸 | C 处 | B 处 | C 处 | C 处 | A 处 | **变量池**（外角顶点 ∈ {A,B,C}）|
| angleA | 45° | 60° | 38° | 72° | 55° | 变量池（20-80°）|
| angleB | 60° | 50° | 75° | 33° | 70° | 变量池（20-80°）|
| 顶点标号 | ABC | PQR | XYZ | ABC | LMN | 变量池（pick）|
| 单位 | ° | ° | ° | ° | ° | 固定单位 |
| 朝向 | 上向 | 下向 | 上向 | 倾斜 | 上向 | **视觉变量**（限 3 种）|

→ 参数池：`exteriorVertex: pick(['A','B','C'])` / `angleA: randInt(20,80)` / `angleB: randInt(20,80)` / `vertices: pick(VERTEX_LABEL_SETS)` / `orientation: pick(['up','down','tilted'])`
→ figure 复刻：`vertices` 数组按 `orientation` 选预设坐标布局，标号按 `vertices` 数组写入

#### 反模式

| 反模式 | 后果 |
|---|---|
| 没收集真题样本就开始设计 | 凭想象造池 → 题型不像 CIE / 漏关键变量 |
| 单题样本就抽变量 | 把"该题特有"误当作"所有题都这样" → 变量池过窄/过宽 |
| 跳过 S5 figure 复刻直接编码 | 视觉不真实 → 学生看到错图（比白图更糟，参 §四·七）|
| 视觉变量不限范围 | 朝向乱转 → 出生成奇怪图形 |
| 数学不变量误当变量 | 角和不是 180° → 出非法题 |

#### 心法

> **真题是地图，不是参考**。
> 所有 generator 设计都从地图出发：先复刻已知地点（真题），再发现规律（变量），最后参数化扩展（变式）。
> 跳过地图直接画 = 凭想象造伪 CIE 题，必返工。

### 反模式

| 反模式 | 触发症状 |
|---|---|
| 没答 6 问就写代码 | "边写边想" → 题型混乱 / 参数池随手加 / 答案歧义 |
| 6 问答案在脑子里没写下来 | 几个月后接手者不懂设计意图 |
| 变量池无真题出处 | 凭想象造情境/人名 |
| 答案只接受 1 种写法 | 学生写法多样 → 误判 |
| UX 没考虑 | 输入框与答案类型不匹配 → 学生填不进去 |

### 与其他章节关系（generator 完整生命周期）

| 阶段 | 章节 | 产出 |
|---|---|---|
| **设计**（before code）| §四·九（本节） | 6 问答案 → `docs/generator-quality/<sec>/<GEN>.md §设计节` |
| **架构 land**（first commit）| §四·六 incremental ratchet | 测试 land + WARN |
| **修字段时机**（real demand）| §四·七 按需驱动 | 检查清单 |
| **打磨方法**（each fix）| §四·八 11 维度 | 检测报告 |
| **审查每步**（agent return）| §四·五 务实审查 | 7 反问表 |

完整闭环：**设计灵魂 (Q1-6) → 架构 land → 按需修一处 → 11 维度打磨 → 反查 hook**。

### 心法

> **Generator 是教学材料，不是脚本**。
> 教学材料 = 学生学得到 + 答得对 + 老师批得动。
> 没答灵魂 6 问 = "代码工作"和"教学设计"混淆。

---

## 四·十、真题题型归纳 + 单一/综合考法分类

> **沉淀来源**: 2026-04-24 用户原话：「然后要对真题原题进行题型归纳，同一种类型考法是怎样的，每个 generator 针对每一个单独的考法，对于复合考法也需要升级版的 generator...所以需要区分每一道题是考单一的知识点单一的考法，还是综合的考点综合的考法。这个需要做明确的标注。」

### 核心原则

**1 generator = 1 考法**：
- **单一考法**（基础版 generator）= 1 KP × 1 考法
- **综合考法**（升级版 generator）= 多 KP / 多考法复合 → **独立 generator**，依赖基础 KP

**真题先归纳，再拆 generator**。每道真题先标"单一" or "综合"，跨样本归纳后才决定 generator 数量与拆分。

### 单一 vs 综合考法判定 6 维度

| 维度 | 单一考法 | 综合考法 |
|---|---|---|
| KP 数 | 1 | 2+ |
| 推理步骤 | 1-2 步 | 3+ 步 |
| 解题路径 | 公式直接套 | 多公式串联 / 多 KP 联动 |
| Marks | 1-3 分 | 4+ 分（CIE 真题信号）|
| 真题 cmd | 单一（calculate / find） | 多 part (a)(b)(c) |
| Generator 设计 | 基础版 1 个 | 升级版 1 个，依赖基础 KP |

≥ 4 维度落"综合" → 升级版 generator。

### 题型归纳方法（§四·九 第 -1 步 S2.5 新加）

应用流程更新：

```
S1 · 真题样本采集
S2 · 图像元素逐题清单
S2.5 · 考点+考法标注（新）
S3 · 跨样本"不变 vs 可变"分类
S4 · 参数池设计
S5 · figure 复刻设计
```

#### S2.5 · 考点+考法标注表

每道真题在元素清单后加这一行：

| qid | KP 列表 | 考法描述 | 综合度 | Generator 归属 |
|---|---|---|---|---|
| 0580-2024MJ-P12-Q11 | `triangle_exterior_angle` | 单一外角定理 | 单一 (1KP/2步/2分) | `cie.4.6.NN.exterior_tri`（基础版）|
| 0580-2025MJ-P32-Q05 | `triangle_exterior_angle` + `isosceles_triangle` | 外角+等腰联动 | 综合 (2KP/4步/5分) | `cie.4.6.NN.exterior_iso_combined`（升级版）|
| 0580-2023ON-P22-Q08 | `triangle_exterior_angle` | 单一 | 单一 (1KP/1步/2分) | `cie.4.6.NN.exterior_tri`（基础版）|
| ... | | | | |

跨样本归纳后产出 2 张清单：
- **单一考法清单**：每条 → 1 个基础 generator
- **综合考法清单**：每条 → 1 个升级版 generator，标注依赖的基础 KP

### 标注规范

#### 1. variants-index.json metadata（按需补，不批量）

基础版：
```json
{
  "id": "cie.4.6.NN.exterior_tri",
  "kn_id": "kn_xxxx",
  "kp_count": 1,
  "kp_list": ["triangle_exterior_angle"],
  "complexity": "single"
}
```

升级版：
```json
{
  "id": "cie.4.6.NN.exterior_iso_combined",
  "kn_id": "kn_yyyy",
  "kp_count": 2,
  "kp_list": ["triangle_exterior_angle", "isosceles_triangle"],
  "complexity": "compound",
  "depends_on": ["cie.4.6.NN.exterior_tri", "cie.4.6.NN.iso_basic"]
}
```

#### 2. handoff doc 题型归纳表

每个 section handoff §X 一份表（s4.6 加在 §六.14 / 类似位置）。列每道真题 → KP / 考法 / 综合度 / generator 归属。反查时一查表搞定。

#### 3. generator 文件顶 JSDoc 标注

```ts
/**
 * cie.4.6.NN.exterior_iso_combined — 三角形外角 + 等腰三角形 综合考法（升级版）
 *
 * **复合度**: 综合 (2 KP)
 * **依赖基础**: triangle_exterior_angle, isosceles_triangle
 * **真题样本**: 0580-2025MJ-P32-Q05 (5 marks), 0580-2024ON-P42-Q07 (4 marks)
 * **设计文档**: docs/generator-quality/s4.6/<GEN>.md
 */
```

### 与现有 generator 的关系（s4.6 实证应用）

s4.6 已有 33 generator，目前**未明确标注**单一 vs 综合。按 §四·七 按需驱动补标（不批量预补）：

可能的标注（待 §四·九 第 -1 步 S2.5 真题归纳时验证）：

| Generator | 推断综合度 | 理由 |
|---|---|---|
| `ANG_TRIANGLE_BASIC` | 单一 | 角和 = 180° 单一 KP |
| `ANG_TRIANGLE_EQUI` | 单一 | 等边角 = 60° 单一 KP |
| `ANG_TRIANGLE_ISO` | 单一 | 等腰底角相等 单一 KP |
| `ANG_EXTERIOR_TRI` | 单一 | 外角定理 单一 KP |
| `ANG_ISOSCELES_ALGEBRAIC` | **综合** | 等腰 + 代数（2 KP）|
| `ANG_ALGEBRA_TRI` | **综合** | 三角形 + 代数（2 KP）|
| `ANG_MULTI_STEP` | **综合** | 名字明示（多 step）|
| `ANG_COMPOUND` | **综合** | 名字明示（compound）|
| `ANG_PARALLEL_COMPLEX` | **综合** | 名字明示（complex）|
| `ANG_TRIANGLE_APPLIED` | 待真题对照 | "applied" 暗示综合，需 verify |
| ... | | |

每次接触 generator 时按 S2.5 标注本 generator + 更新 variants-index.json。

### 反模式

| 反模式 | 后果 |
|---|---|
| 1 generator 同时处理单一+综合考法 | 复杂度爆炸 / 测试覆盖难 / 难升级 |
| 综合考法用基础 generator 加 if-else | 维度膨胀 / 后期拆分难（CLAUDE.md 反模式有先例：s1.15 多 mode generator）|
| 不标注 KP 数 / 考法类型 | 反查不知 generator 设计意图 / variants-index 死板 |
| 单一考法只看 1 真题样本就开始设计 | 把"该题特有"误当作"通用单一考法" |
| 综合考法不依赖基础 generator，重写 KP 逻辑 | 代码重复 / 基础 KP 修改时升级版漏改 |

### 心法

> **题型归纳 = 把真题分类 → 决定 generator 数量**。
> 1 generator 1 考法 = 单元测试可写 / 升级路径清晰 / 学生进度可追踪。
> 1 generator 多考法 = 黑盒 / 难维护 / 后期必拆。
> **综合考法 = 升级版 generator，依赖基础 KP**——不是"高难度模式"，是独立产品资产。

### 与其他章节关系

| 章节 | 关系 |
|---|---|
| §四·九 第 -1 步 S2.5 | 本章节方法的具体执行步骤（标注每道真题）|
| §四·八 维度 10（error pattern 覆盖）| 综合考法 generator 的 common_errors 必含基础 KP 误用陷阱 |
| §四·七 按需驱动 | 标注按需驱动补，不批量给 33 generator 预填 metadata |
| variants-index.json | 标注的物理存放位置（kp_count / complexity / depends_on 字段）|

---

## 四·十一、题型归纳审计层（section-wide pattern audit）

> **沉淀来源**: 2026-04-24 用户原话：「对于所有专题的题型，需要有题型归纳总结分类的这一层审计，而且这一层审计很重要，是作为后边变式 generator 的基础，不要重复造轮子，所以从节省 token 和节省返工的原则，应该要如何设计，把这个关键的一步定下来，并且要在最适合的位置。可以利用缓存。」

### 核心原则

**每个 section 一次性产出题型归纳总表**（PATTERN-AUDIT），作为该 section 所有 generator 的**共享地图**。后续每个 generator 设计时直接 Read 总表对应行，**不重复扫真题**。

### 为什么要这层（节省成本量化）

- **节省 token**: 33 generator × 354 真题各自扫 = 11,682 题次扫描 ❌；总表 1 次扫 + 33 次 Read 行 ✅，节省 ~99%
- **节省返工**: 先有全景图 → 知道总共几种题型 → 决定 generator 数和拆分 → 不会"写完 1 generator 才发现还有 5 种题型没覆盖"必拆
- **不重复造轮子**: 题型归纳 = 跨 generator 公共资产
- **磁盘缓存**: 总表入 git → 跨 session 复用 → 新 session 接手 0 重新扫

### 总表位置 + 命名

`docs/generator-quality/<section>/_PATTERN-AUDIT.md`

- `_` 前缀 → ASCII 排序排在所有 per-generator 报告之前
- 例：`docs/generator-quality/s4.6/_PATTERN-AUDIT.md`、`docs/generator-quality/s1.15/_PATTERN-AUDIT.md`
- 跨 section 同名同结构 → 复刻零适配

### 总表结构（标准模板）

```markdown
# s<N>.<M> 题型归纳审计总表

**section**: cie.<N>.<M>
**真题总数**: NNN (exam.json) + NN (mcq.json)
**最近审计**: YYYY-MM-DD
**审计方法**: G0 sub-agent (token-efficient prompt)

## §一 · 题型分类清单

### 单一考法（每条 → 1 个基础 generator）

| 题型 ID | KP | 考法描述 | 真题数 | 代表 qid (≤3) | Generator 归属 |
|---|---|---|---|---|---|
| P1 | triangle_angle_sum | 三角形角和=180 求 missing | 28 | 0580-2024MJ-P11-Q05 | cie.4.6.04.triangle_basic |
| P2 | triangle_exterior | 外角定理 | 11 | 0580-2025MJ-P32-Q03 | cie.4.6.08.exterior_tri |
| ... | | | | | |

### 综合考法（每条 → 1 个升级版 generator，参 §四·十）

| 题型 ID | KP 组合 | 考法描述 | 真题数 | 代表 qid | Generator 归属 | 依赖基础题型 |
|---|---|---|---|---|---|---|
| P10 | tri_sum + isosceles | 等腰三角形求顶角 | 8 | 0580-2024ON-P22-Q08 | cie.4.6.12.iso_triangle | P1 + isosceles_basic |
| ... | | | | | | |

### 不可生成考法（SKIP）

| 题型 ID | 考法 | 真题数 | 处理 |
|---|---|---|---|
| P50 | "Show that angle X = Y" | 9 | SKIP（无法自动判 reasoning）|
| P51 | "Measure angle X" | 4 | SKIP（实操题）|
| P52 | "Draw / construct" | 8 | SKIP（作图题）|

## §二 · Generator 覆盖矩阵

| 题型 ID | 现有 Generator | 状态 | 缺口 |
|---|---|---|---|
| P1 | cie.4.6.04.triangle_basic | ✅ | — |
| P2 | cie.4.6.08.exterior_tri | ✅ | — |
| P10 | cie.4.6.12.iso_triangle | ⚠️ 部分覆盖 | L4-Boss 综合度不够 |
| ... | | | |

## §三 · 反查 hook（section 级）

| 症状 | 题型 ID | Generator 报告 |
|---|---|---|
| 学生报"等腰底角应该相等啊" | P10 | docs/generator-quality/s4.6/ANG_TRIANGLE_ISO.md |
| 真题对照"看起来不像 P32" | P2 | docs/generator-quality/s4.6/ANG_EXTERIOR_TRI.md |
| ... | | |
```

### 何时做总表

**第一次做**：section 复刻的 **G0 阶段**（即 s4.6 G0f / 在 G0e 聚合之后）。这是该 section 所有 generator 工作的前置基础设施。

**增量更新**（按需驱动 §四·七）：
- 新 paper 数据加入 → 增量加该 paper 题次到对应题型行
- 发现新题型（罕见）→ 追加新行
- generator 升级 / 拆分 → 更新归属列
- 不主动重扫全 section

### Sub-agent 拆分（token-efficient，按 §一-§四 7 铁律）

总表生成可拆 4 sub-task，串行：

```
Sub-task A · 题型预分类（基于 G0a 元数据 + cmd / suffix / marks）
  ↓ 输出：每道真题预归类到 P_id（含模糊匹配）
Sub-task B · 人工 review + 单一/综合判定（参 §四·十 6 维度）
  ↓ 输出：题型清单（单一 / 综合 / SKIP 三组）
Sub-task C · 跨题型聚合 + Generator 归属
  ↓ 输出：覆盖矩阵 §二
Sub-task D · 写总表 markdown（按上面结构模板）
  ↓ 输出：_PATTERN-AUDIT.md commit
```

每 sub-agent ≤200 行输出 / ≤8 tool call，按 §四 prompt 清单写。

### 复用机制（每个 generator 设计时怎么用）

按 §四·九 第 -1 步 S1 升级流程：

```
旧 (没总表)：
  agent 扫 354 真题找该 generator 对应的 5-10 道 → 重复 33 次 → 浪费

新 (有总表，§四·十一 缓存)：
  1. main 线 Read docs/generator-quality/<section>/_PATTERN-AUDIT.md 对应题型行
  2. 拿到 5-10 个代表 qid（总表已列）
  3. 直接进入 §四·九 第 -1 步 S2 元素清单（无需扫全 section）
  4. S2.5 标注（综合度）→ 复用总表的判定
  → 单 generator 设计时省 ~80% 真题扫描成本
```

### 反模式

| 反模式 | 后果 |
|---|---|
| 每个 generator 各自扫 354 真题 | token 浪费 / 归纳不一致 / 跨 generator 拼不起 |
| 不写总表，靠 generator JSDoc 拼凑 | 反查难 / 跨 generator 聚合不出 / 接手者重做 |
| 总表只人工写不存档 git | 跨 session 丢失 / 重复做 |
| 写完总表不增量更新 | 新 paper 来时数据失效 |
| 总表覆盖矩阵 §二 不维护 | 不知 generator 缺口在哪 → 无法判断 phase 3 工作量 |

### 与其他章节关系

| 章节 | 关系 |
|---|---|
| §四·九 第 -1 步 S1（真题样本采集）| **从本总表 §一 取代表 qid**，不重复扫 |
| §四·九 第 -1 步 S2.5（考点+考法标注）| 总表 §一 已经分好类，逐 generator 直接复用 |
| §四·十 单一/综合分类 | 总表 §一 显式分两组（单一表 + 综合表）|
| §四·七 按需驱动 | 总表**第一次做需 G0 完整跑**；后续**增量按需** |
| §四·八 反查 hook | 总表 §三 是 section 级反查；per-generator 报告反查 hook 是 generator 级；两层互补 |

### 心法

> **题型归纳 = section 级地图，不是逐 generator 各自散步路线**。
> 一次扫，全 generator 共享。
> 一次绘，反查 / 升级 / 拆分都基于这张图。
> 没总表的 section = 没地图的探险队，必走重路、必返工。

---

## 四·十二、真题驱动优先级 + 覆盖完整性 + `[review]` 标签 + 单一→复合开发顺序

> **来源**：2026-04-25 s2.7 Sequences 验收 session 实战沉淀。原本按 audit-script issue list（68 issue）规划修 25 generator；做完真题 PATTERN-AUDIT 后发现 **~10 个高优 generator 真题 0-1 出现**（GE_SUM_*, PELL_LUCAS, RECURRENCE / CONVERGENCE / INVESTMENT 等）—— 全是审计 HIGH/MEDIUM 但**真题不考**。如果按 audit 跑直接修，浪费 ~40% 工作量在不考的题型上；而 4 个真题高频但当前 healthy 的题型反而被低估。

### 12.1 四条原则速查

| # | 原则 | 一句话 | 触发时机 |
|---:|---|---|---|
| 1 | **真题驱动 > audit 驱动** | audit 报告是代码质量标尺，真题分布是教学价值标尺；冲突时真题赢 | section 启动打磨前必查 |
| 2 | **覆盖完整性硬约束** | 已在真题出现的题型 → 必须有对应 generator；缺口 = 最高优先级（先建后修）| section 启动 G0 后 |
| 3 | **`[review]` 标签** | 真题零出现 / 极罕见的 generator **不直接下架**，加 `[review]` 标签待人工审教学价值 | 任何 zero-freq generator |
| 4 | **单一先于复合** | 单一考法 generator 全部 healthy 后，才进复合考法新 generator 开发 | 计划阶段 |

### 12.2 原则 1：真题驱动 > audit 驱动

**做法**：section 启动 generator 打磨前，**必先**跑两个独立标尺：

1. `scripts/audit-all-generators.ts` 输出 issue list（fingerprint uniqueness / NaN / tutorial 等代码质量缺陷）
2. **PATTERN-AUDIT G0**（参 §四·十一）扫真题，输出 `_PATTERN-AUDIT.md` 题型频次表

冲突时**真题驱动赢**：
- audit 报 generator X 是 HIGH（unique=8/25），但真题 0 道考此考法 → **不修**，加 `[review]` 标签（参 12.4）
- audit 报 generator Y 是 healthy（unique=22/25），但真题 18 道考此考法 → **优先级提升**，进入第一顺位"健康提升"清单（升 ratchet target 到 ≥ 20 当目标，进一步隔绝 noise）

**反模式**：
- ❌ 看 audit log 直接安排修复优先级（**最常见**，正是 2026-04-25 session 第一稿 plan 犯的）
- ❌ 跳过 PATTERN-AUDIT 直接进 fingerprint 修复（不知道哪些 generator 真考，盲修）
- ❌ 真题 PATTERN-AUDIT 跑了但只用来分类，不用来 override 优先级

### 12.3 原则 2：覆盖完整性硬约束（题型 → generator 必须覆盖）

**做法**：完成 PATTERN-AUDIT 后，加一节 **§二·B 覆盖完整性确认表**（在 PATTERN-AUDIT 模板里）：

```markdown
| # | 题型 ID | 真题数 | 已有 Generator | 覆盖状态 | 缺口 |
|---|---|---:|---|---|---|
| 1 | seq_linear_find_next | 20 | FIND_NEXT, ... | ✅ 全覆盖 | — |
| 2 | seq_xxx_new_pattern | 5 | (无) | ❌ 缺口 | 必须新建 |
```

**缺口处理优先级**：
- **缺口 = 最高优先级**：先开发新 generator，**才能**继续修其他 generator 的 fingerprint
- 缺口 generator 设计走完整 §四·九（6 灵魂问）+ §四·八（11 维度报告）

**s2.7 案例**：10 个单一题型 10/10 全覆盖（无缺口）→ 第一顺位转化为"修已有 generator 的 fingerprint"，没有"建新 generator"工作量。

**反模式**：
- ❌ 默认所有 generator 都对应着真题题型（事实是：~30-50% generator 是早期教学扩展，无真题对应）
- ❌ 不做覆盖确认就跳到 fingerprint 修复（万一有缺口，事后发现就是"修了 fingerprint 但学生练习时仍遇到不会的考法"）

### 12.4 原则 3：`[review]` 标签机制（zero-freq generator 不下架）

**问题**：真题零出现的 generator 怎么处理？
- ❌ 直接下架（删 `_index.ts` export）：可能有教学价值（CIE 大纲扩展 / 邻 board 考 / 老师额外训练用）
- ❌ 当 healthy 修 fingerprint：浪费修复工作（学生不会练到、修了无收益）
- ✅ **加 `[review]` 标签**：保留代码不动，明确标注"真题 0 出现，等用户人工审教学价值"

**`[review]` 4 选 1 决策格式**（写进 PATTERN-AUDIT § 二·C）：

```
[ ] 保留 + 修复 fingerprint：教学价值高，应升入 ratchet target=15
[ ] 保留 + 不修 fingerprint：教学价值存在但 fingerprint 投入回报低；从 ratchet log 移到独立"教学保留"区
[ ] 标记 [legacy]：保留代码但不再扩 pool，不出现在新 ratchet 升档目标里
[ ] 删除：从 _index.ts 注释掉 export（参 SHOW_THAT_SEQ delist 模式）
```

**何时加 `[review]`**：真题 ≤ 1-2 道（具体阈值由 section 决定，但 zero-freq 一律加）。

**s2.7 案例**：21 个 generator 加 `[review]`（GE_SUM_*, PELL_LUCAS, RECURRENCE, CONVERGENCE, INVESTMENT, 各种 *_PROOF_* / ADVANCED_* / OPTIMIZATION_* / PARAMETRIC_* / CONSTRAINT_*），等用户审完 4 选 1。

**反模式**：
- ❌ 看到 zero-freq 直接 delist（丢失潜在教学价值，且不可逆 — 后悔需 git revert）
- ❌ 加 `[review]` 但没在 PATTERN-AUDIT 写明 4 选 1 决策格式（用户不知道审什么）
- ❌ 加完 `[review]` 仍把它纳入 ratchet 修复目标（自相矛盾 — 既然待审，就别先动）

### 12.5 原则 4：单一先于复合（开发顺序铁律）

**做法**：generator 开发分两阶段：

**阶段 A — 单一考法**：每个 section ~5-15 个单一题型 → 每题型至少 1 个对应 generator → 这些 generator 全部 fingerprint healthy（≥ target）。

**阶段 B — 复合考法**：跨 2+ 题型的综合题（如"先求 r 再求 nth"、"算术 + sum 链"），**只在 A 阶段全绿后启动**。

**为什么这个顺序**：
- 复合 generator 的参数池要"组合"两个单一题型的不同维度，单一题型 fingerprint 都不稳定时，复合也必不稳定
- 复合 generator 调试 / 11 维度报告比单一题型复杂 ~3×，先做容易拖死 session
- 单一题型修完，才能从真题里精确识别"哪些是真复合（跨 KP）vs 哪些只是连续两道单一"

**s2.7 案例**：3 个综合题型（`seq_compound_linear_quad` 6 道、`seq_compound_geo_nth` 3 道、`seq_sum_arithmetic` 2 道）→ 列入 PATTERN-AUDIT § 二·D 待开发清单 → **不今天做**，等阶段 A 完成。

**反模式**：
- ❌ 看到综合题难就先攻（认为"难的解决了简单的也通"— 错，简单题型基础不稳综合题更不稳）
- ❌ 单一题型有缺口（题型 → generator 缺）就开始做复合
- ❌ 用复合 generator 同时覆盖单一题（违反 §四·七：一个 generator 只做一件事）

### 12.6 与既有方法论关系

| 章节 | 互补关系 |
|---|---|
| §四·十 单一/综合分类 | 12.5 是"开发顺序"；§四·十 是"识别分类"。先识别 → 再按顺序开发 |
| §四·十一 PATTERN-AUDIT | 12.1-12.4 全部依赖 PATTERN-AUDIT 的真题频次表作为输入 |
| §四·七 按需驱动 | 12.4 `[review]` 标签 = §四·七"不批量修"在 generator 整体退役场景的应用 |
| §四·六 ratchet | 12.4 "保留 + 不修 fingerprint" = 把 generator 从 ratchet 监控中移到 archive 区 |
| §四·八 11 维度 | 阶段 A 修复时，11 维度报告里加 row "真题频次"（来自 PATTERN-AUDIT），让"修不修"决策可追溯 |

### 12.7 反模式总结

1. ❌ 看 audit issue list 直接修，跳过真题 PATTERN-AUDIT
2. ❌ zero-freq generator 直接 delist 不加 `[review]`
3. ❌ 单一题型 generator 有缺口 / 不健康就开始复合
4. ❌ PATTERN-AUDIT 写了但优先级表里不 override audit 排序
5. ❌ `[review]` 标签加完不写 4 选 1 决策格式
6. ❌ 把 `[review]` generator 仍纳入 ratchet 升档目标（自相矛盾）

### 心法

> **代码质量审计 ≠ 教学价值审计**。
> audit-script 看 generator 内部健康；真题 PATTERN-AUDIT 看 generator 外部价值。
> 健康但不考 = 修了浪费；考但不健康 = 必修；不考也不修 = `[review]` 等审。
> 单一题型不稳 → 复合题型必崩 → 永远先单一后复合。

---

## 四·十三、前后端贯通验证（generator → variants-index → frontend → student）

> **来源**：2026-04-25 s2.7 Phase 4 session — 我把 3 个 compound generator 全 land、ratchet test 213/213 PASS、build 0 错、`_exam-refs.ts` 11 papers 全标注后宣布"task done"。用户问"前端都有显示出来了吗"才发现 — `variants-index.json` 没注册。前端枚举 variants 走的是这个 JSON，**generator 代码再完整、test 再绿，没注册就等于学生看不到**。所有打磨工作的价值都是 0。
>
> 用户 2026-04-25 原话："所有这些设计都必须要能够在前端页面显示出来，所有这些打磨才有意义和价值，需要将后端和前端，或者说是生成器和前端完全的打通才有意义。"

### 13.1 三层贯通模型（任何一层断 = 0 价值）

```
Layer 1  Generator code      src/engine/generators/v2/.../<GEN>.ts
                             + _index.ts barrel export
                             + _exam-refs.ts PaperRef entries
                             ↓
Layer 2  Variant registry    public/data/units/<board>/<sec>/variants/
                             variants-index.json (frontend reads this!)
                             + (optional) variants/<id>/exam.json deep data
                             ↓
Layer 3  Frontend dispatch   PracticePage / SectionPage / KnowledgeMap
                             reads variants-index → lists variants →
                             student picks → calls generator →
                             renders inputTemplate → checker grades →
                             shows tutorialSteps
```

**任意一层缺**：学生看不到，**无价值**。

### 13.2 反模式（必背）

❌ **只看 build / ratchet / verify-section 就宣告 done**
   - build 通过 = TypeScript 编译过
   - ratchet PASS = 单元测试过
   - verify-section PASS = section-level audit 过
   - **以上都过 ≠ 学生能用**。前端不显示 → 学生看不到 → 0 价值

❌ **新建 generator 不更新 variants-index.json**
   - 53 个 generator export from `_index.ts` 但 variants-index 只 22 entries（s2.7 实测 2026-04-25）—— 31 个 generator 是"幽灵代码"，永不被学生触达
   - 必须 register entry 含 `id` / `unitId` / `sectionId` / `generatorId` / `name` / `description` / `prerequisites` / `leads_to` / `common_errors` / `mastery_criteria` / `answer_spec` / `tags` / `tiers` / `exam_frequency` / `kn_id`

❌ **跳过 dev server + 浏览器手测**
   - 即使 variants-index 加了 entry，前端 dispatch 仍可能断（input template 渲染失败 / checker 不认 answer.value 格式 / tutorialSteps 不显示）
   - CLAUDE.md "对于 UI 或前端改变，启动 dev server 并使用 feature in browser" 是硬要求

❌ **跨账号 / 跨 session 假设上一 session 验过**
   - 上 session 可能也跳过前端验证。**新 session 接手时必跑一次端到端**

### 13.3 必查 checklist（任何 generator land 前必通过）

```
[ ] (1) Generator code: src/engine/generators/v2/.../<GEN>.ts 实现 + 默认 export
[ ] (2) _index.ts barrel: export { default as <GEN> } from './<GEN>'
[ ] (3) _exam-refs.ts: variantId entry with PaperRef[] (实际真题映射)
[ ] (4) variants-index.json: 加 entry，至少含 13.2 列出的 14 字段
[ ] (5) ratchet test: BASELINE entry（如有 fingerprint regression risk）
[ ] (6) build: npx vite build → 零错误
[ ] (7) measure: scripts/measure-s2.7-baseline.ts（或对应 section 的 measure）→ unique 满足 baseline
[ ] (8) **dev server smoke test**: npm run dev → 浏览器访问对应 PracticePage
       - variant 出现在列表（KnowledgeMap / SectionPage）
       - 点入触发 generator → 题目正常渲染（含 figure 如有）
       - inputTemplate UI 渲染（学生能填）
       - 提交答案 → checker 判对 / 判错 → tutorialSteps 显示
       - 至少跑 3 道题确认 fingerprint 不撞
[ ] (9) bilingual smoke: 切 zh/en 两遍跑 step 8
[ ] (10) commit + push + verify-section: commit message 标"E2E verified ✓"
```

**Step 8 不能跳过**。如无浏览器（CI / sub-agent 环境），用 `mcp__Claude_Preview__preview_*` 或 `mcp__Claude_in_Chrome__*` 自动化（参 13.4），但**必须有验证证据**才能 commit。

### 13.4 自动化 E2E 验证手段（按可达性排序）

1. **本地浏览器手测**（首选 — 真实环境）
   - `npm run dev` 起 dev server → 浏览器访问 → 手动跑 8/9 步
   - 截图保存到 `logs/e2e/<gen>-<date>.png`（commit 入 repo）

2. **`mcp__Claude_Preview__*` (Claude Code Preview MCP)**
   - `preview_start` → `preview_screenshot` → `preview_click` 自动跑
   - 限制：本地 dev server 必须 listen

3. **`mcp__Claude_in_Chrome__*` (Chrome extension MCP)**
   - 用户安装 Chrome 扩展后，Claude 直接控制浏览器
   - 限制：用户已 setup 扩展

4. **vitest + @testing-library/react** 渲染测试
   - 单测 PracticePage 组件 + mock variant
   - 限制：mock 容易遗漏真实 dispatch / sessionController 路径

**优先级**：1 > 2 > 3 > 4。**绝对不要**跳过 1-3 直接说"vitest 测过就行"。

### 13.4·B inputTemplate 选型守则（13.3 step 8 的反模式延伸）

> **来源**：2026-04-25 s2.7 浏览器 smoke 暴露——**5 个 generator 用 `{ type: 'text' }` 作 fallback** 而不是合适的 structured input。学生看到一个简陋文本框，需要按精确字面拼答案（"Add 7" / "an^2+bn+c" 字符串占位等），text checker 严苛 exact match → 任何拼写差异 / 大小写错位 / 顺序不同都被判错。这是**隐性 UX 退化**，build/test/ratchet 都通过看不出来，**只有真在浏览器渲染才暴露**。

**选型对照表（必背）**：

| answer 形态 | inputTemplate（推荐） | wire format |
|---|---|---|
| 单一数值 | `{ type: 'number' }` | `"42"` |
| 分数 | `{ type: 'fraction' }` | `"3/7"` |
| 几何 nth: $a × r^{n-1}$ | `{ type: 'nth_term', degree: 0 }` | `"a,r"` |
| 线性 nth: $an+c$ | `{ type: 'nth_term', degree: 1 }` | `"a,c"` |
| 二次 nth: $an²+bn+c$ | `{ type: 'nth_term', degree: 2 }` | `"a,b,c"` |
| 三次 nth: $an³+bn²+cn+d$ | `{ type: 'nth_term', degree: 3 }` | `"a,b,c,d"` |
| 数列前 N 项 | `{ type: 'sequence_terms', count: N }` | `"t1,t2,t3"` |
| 加减规则（"Add 7"）| `{ type: 'arithmetic_rule', operators: ['+','-'] }` | `"+|7"` |
| 选择题（A/B/C 或列表）| `{ type: 'multi_select' }` + `data.list` | `"Quadratic"` |
| 排序 | `{ type: 'ordering' }` | `"a,b,c,..."` |
| 多项式因式分解 | `{ type: 'factored_double', var: 'x' }` 等 | varies |
| Show that（推理类）| `{ type: 'show_that' }` | — |
| **真正自由文本** | `{ type: 'text', hint: {...} }` | `"raw input"` |

**反模式**：

❌ **`{ type: 'text' }` 当 fallback**——除非 answer 真的是自由文本（"quadratic" / "yes" / 学生写论证句）。看到 generator 输出 `answer.value = "${a},${b},${c}"` + `inputTemplate: { type: 'text' }` ⇒ 100% 错——必有对应 structured template（这例是 `nth_term degree=2`）。

❌ **`answer.value` 写占位符字符串而不是真实 wire 值**：常见 pattern `value: "an^2 + bn + c"` 注释写"接受任何等价形式"——但 text checker 是 exact match，没有等价容许逻辑。学生**永不可能**输入这个字面 placeholder → 永远判错。修法：value 写真实数值（"a,b,c" 系数串）+ inputTemplate 用 structured input + checker 自然走 coefficients spec。

❌ **`inputTemplate.type` 与 `answer.value` 的 wire 形态不匹配**：每个 structured template 有独立 wire format（参表）。容易踩的坑：
- `arithmetic_rule` wire = `"${op}|${num}"`（管道符分隔），不是 `"Add 7"` 自然语言
- `multi_select` 选 1 个 = wire 单一字符串；选多个 = `","` 逗号 join 后字典序
- `nth_term degree=N` wire = 高次到低次系数 join `","`

### 13.4·C 反向核查 audit 步骤（commit 前必跑）

每 generator commit 前对每个 inputTemplate 自查：

1. **answer.value 是什么形态**（string / number / 字面字符串 / wire 编码）？
2. **是否有对应 structured template**（查上方对照表）？
3. **UI 渲染时学生看到什么**——free-form text box 还是 structured layout？必跑 dev server 看实际渲染。
4. **学生不同合理写法 checker 能否接受**——`"Add 7"` vs `"add 7"` vs `"+7"` 这种空隙必有 structured template 才能解掉。

如果 (3) 是 text 且 (4) 学生有歧义 → ❌ 必换 structured template。

### 13.5 与既有原则关系

| 章节 | 互补关系 |
|---|---|
| §四·九 (0) 协同设计纲领 | 13.x 是 § 协同设计 的**运行时验证延伸**。设计层 checkbox 通过 ≠ 运行时贯通 |
| §四·七 按需驱动 | 13.4 不要预补 chrome MCP 模块 / 不要批量跑全 generator E2E。**单 generator 修复 → 单 generator E2E** |
| §四·六 ratchet | ratchet 是**代码层**的不可退；E2E 是**用户层**的不可退。两层 ratchet 互补 |
| §四·五 务实审查 | agent 返回后跑 7 反问表的最后一问应该是"前端跑过吗？" |

### 13.6 反例清单总结

1. ❌ Generator code + test + build 全过 → 跳 variants-index 注册 → 学生看不到
2. ❌ Variants-index 加了 → 跳 dev server smoke → input UI 渲染失败 / checker 拒绝 answer.value
3. ❌ 单浏览器跑过 → 跳 zh/en 切换 → 中文模式题面 / tutorial 缺失
4. ❌ 浏览器手测 → 跳 commit message E2E 标注 → 下个 session 接手不知是否验过
5. ❌ 跨 session 假设上 session 验过 → 实际上 session 也跳了 → 永远没验过

### 心法

> **学生看不到 = 0**。
> ratchet test 213/213 = 代码内部健康；verify-section 18 PASS = section 元数据健康；
> 但**只有 dev server 浏览器跑通**才证明学生真能用。
> Generator → variants-index → frontend dispatch 三层中任一断点 → 全部白做。
> "build OK + test OK = task done" 是新人最致命幻觉。

---

## 五、缓存策略（"未雨绸缪"）

### 5.1 输出粒度
每子任务输出**自包含 markdown section**（≤300 行），可直接 append 到主 handoff doc。

### 5.2 commit 节奏
每子任务后立即 `git add docs/HANDOFF-*.md && git commit && git push`。
事故案例：把 5 个子任务结果攒在主线对话里 → 主线 context 撑爆 → 后续 phase 必须重读 → 浪费 token × 5。

### 5.3 引用而非重述
后续 phase 用 `请 Read docs/HANDOFF-*.md §三` 而非贴全文。

### 5.4 工具调用去重
- 同一 baseline (`vite build` / `verify-section`) 只在 phase 始 / 末 各跑一次
- agent 内已跑过的统计**禁止**主线重跑（依赖磁盘 commit 物）
- 已读过的文件不再重读（除非 Edit 后）

---

## 六、与项目其他纪律的关系

| 文件 | 处理 | 适用阶段 |
|---|---|---|
| `CLAUDE.md` §四·五 Phase A/B | 同 section 内 7 步 sprint（清 unmapped/INVESTIGATE）| 数据归类阶段 |
| `docs/EXECUTION-DISCIPLINE.md` | 主线 AI 反模式清单（如不打断、不踢回菜单）| 全程 |
| **本 skill** | **主线 AI ↔ sub-agent 委派纪律** | **任何调用 Agent 工具时** |

**启动时序**：
1. 新 session → 读 CLAUDE.md（启动协议）
2. 读最新 `docs/HANDOFF-*.md`
3. 第一次需要委派 sub-agent → **read 本 skill**
4. 执行委派 → 按本 skill 模板写 prompt

---

## 七、Anti-pattern 清单（写 prompt 前自检）

| 禁止 | 触发症状 |
|---|---|
| 让 agent "做完整研究 + 写报告 + 给建议" 一次性 | 必 timeout |
| 输出无模板，让 agent 自由发挥章节结构 | 输出 2-3× 膨胀 |
| 让 agent 读 CLAUDE.md / KP-CHARTER / 其他 meta 文档 | agent 会 "顺势" 跑去做 ADR 类工作 |
| 让 agent 同时跑统计 + 跑 generator + 抽样真题 | 跨认知任务，每跑一类要 reset 心智 |
| 让 agent 跨多 section（s4.6 + s4.7 + s5.1）一次扫 | 数据量翻倍，必撞 stream timeout |
| Prompt 内含 "如果时间够，再多做 X" | agent 当作主任务做 X |
| 不声明输出语言（中/英）| 50/50 概率乱混 |

---

## 八、何时**不**用 sub-agent（直接主线做）

- 单文件 Read（不超过 1000 行）
- 单 Bash 一行命令统计（`grep -c`、`wc -l`）
- 已知精确路径的 Edit
- ≤3 个 tool call 能完成的任务

委派代价：每次 Agent 调用本身有 ~3-5K token overhead（系统 prompt + 工具描述）。**值不值得调** 看任务是否同时满足：(a) ≥6 个 tool call 才能完成，(b) 涉及独立认知/决策，(c) 主线 context 已紧张需要外部完成。

---

_本 skill 由主线 Claude 在 2026-04-24 s4.6 G0 失败 → G0a 成功的对照中沉淀。每次 sub-agent 调用前花 30 秒过一遍 §IV 清单和 §VII 反模式，调用后过一遍 §四·五 7 个反问，可以避免 90% 的 timeout、token 浪费、与未来返工。_

---

## 心法

> **token-efficient ≠ shortest-path**.
> token-efficient = (current run cost) + Σ (future rework cost) → minimum.
>
> 一次返工的成本通常 = 5-10 次正常调用的 token + 你的认知重启成本。
> 因此**务实不返工审查**（§四·五）和**任务拆分**（§一）同等重要。

> **架构先 land = 让团队/CI 看见全貌的真实健康度**；
> **细节进 WARN = 既不假装通过，也不阻塞推进**；
> **逐项修复 = 每次小改 + 可见进展 + 不返工**。
> （§四·六）

> **完美不是一次到位，完美是系统性闭环**。
> 卡死在第一关 = 永远到不了第十关；
> 第一关跑通 + 第二三四五逐项打磨 = 最终所有关都过。
