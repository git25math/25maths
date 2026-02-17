# Codex 账号切换交接（2026-02-17）

## 1) 交接基线
- Repo: `/Users/zhuxingzhe/Project/ExamBoard/25maths-website`
- Branch: `codex/gemini-exercise-loop`
- Remote: `origin/codex/gemini-exercise-loop`
- Current HEAD: `f561f36` (`docs(handoff): add codex relay checklist and project status`)

## 2) 本对话周期核心成果（按产品线）

### A. Kahoot 子专题与站点结构
- 已切换为按 SubTopic 管理（非旧章节合集）。
- CIE 0580 已明确分层：`Core` / `Extended`。
- Edexcel 4MA1 已明确分层：`Foundation` / `Higher`。
- 缩略图规范统一为各子文件夹下：`cover-2320x1520-kahoot-minimal.*`。
- 已移除/下架历史遗留项：`Number (Extended) - Legacy Pre Official`。

### B. Kahoot 页面交互与筛选逻辑
- 已实现多层筛选路径：
  - Board: `CIE 0580` / `Edexcel 4MA1`
  - Tier: `Core/Extended` 或 `Foundation/Higher`
  - SubTopic: 对应子专题列表
- 相关关键提交链（近期）：
  - `45474c0` exam board filter
  - `933a60b` board-tier-subtopic hierarchical filters
  - `741f60f` sharable URL state + search
  - `2a716f6` incremental loading

### C. Payhip 预售闭环（L1-L4）
- 已建立完整矩阵与文案流水线（共 249 SKU）：
  - L1: 202（SubTopic MVP）
  - L2: 30（Section Bundle）
  - L3: 15（Unit Bundle）
  - L4: 2（All-Units Bundle）
- 已交付脚本：
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/scripts/payhip/generate_kahoot_payhip_listing_matrix.py`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/scripts/payhip/generate_l1_payhip_copy_templates.py`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/scripts/payhip/generate_l2_payhip_copy_templates.py`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/scripts/payhip/generate_l3_payhip_copy_templates.py`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/scripts/payhip/generate_l4_payhip_copy_templates.py`
- 已生成文案产物：
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-payhip-l1-copy-template.csv`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-payhip-l2-copy-template.csv`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-payhip-l3-copy-template.csv`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-payhip-l4-copy-template.csv`
  - 以及对应 `*.md` 手工粘贴版本
- 已更新操作文档：
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-payhip-listing-upload-plan.md`
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/PAYHIP-SLEEP-HANDOFF-2026-02-16.md`

### D. Interactive Exercises（近期并行线）
- 已完成 CIE/Edexcel 互动题的主链路与站内闭环，含首页入口、导航入口、中文入口、Next-in-syllabus 连续练。
- 关键提交链（近期）：
  - `4185ba6`, `cc15a3d`, `1cdecfc`, `93914d1`, `d10f548`, `30791c1`, `6ad26e3`, `56c369c`, `f561f36`
- 详细交接文档：
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/plan/CODEX-HANDOFF-2026-02-17.md`

## 3) 目前健康状态（切换账号前实测）

### 构建
- `bundle exec jekyll build --trace`：通过。

### 数据完整性
- `python3 scripts/health/check_kahoot_data.py`：通过（Failures: 0, Warnings: 0）。

### 漏斗严格检查
- `python3 scripts/health/report_kahoot_funnel.py --strict`：当前失败（32 issues）。
- 关键现象：
  - Active SubTopics: `202`
  - Sellable: `186/202`
  - Invalid status ids: `16`
  - Non-sellable ids: `16`
- 根因：有 16 条记录状态为 `free_sample_live`（不在 strict 模式允许集 `presale/live` 内）。
- 对应报告文件：
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-funnel-health.md`

## 4) 工作区风险（必须先读）
- 当前工作区是“重度脏树”（大量已修改/删除/未跟踪文件，跨多个子项目）。
- 严禁直接使用：
  - `git add .`
  - `git commit -a`
- 建议采用白名单提交：
  - `git add <exact-file-path-1> <exact-file-path-2> ...`

## 5) 新 Codex 账号接力步骤（最短路径）

### Step 1: 对齐分支
```bash
cd /Users/zhuxingzhe/Project/ExamBoard/25maths-website
git fetch origin
git checkout codex/gemini-exercise-loop
git pull --ff-only origin codex/gemini-exercise-loop
```

### Step 2: 本地基线验证
```bash
bundle exec jekyll build --trace
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/report_kahoot_funnel.py --strict
```

### Step 3: Payhip 上架执行（你当前最优先）
```bash
python3 scripts/payhip/generate_kahoot_payhip_listing_matrix.py
python3 scripts/payhip/generate_l3_payhip_copy_templates.py
python3 scripts/payhip/generate_l4_payhip_copy_templates.py
python3 scripts/payhip/generate_l2_payhip_copy_templates.py
python3 scripts/payhip/generate_l1_payhip_copy_templates.py
```

## 6) 明天上线动作（按收入优先）
1. 先完成 L3（15 个）上架，再做 L4（2 个）。
2. 每个 Payhip 商品固定 9 张图（见睡前清单）。
3. 每批上架后立即回填真实 Payhip URL 到数据文件。
4. 每批回填后跑健康检查 + build，再继续下一批。

## 7) 关键文档入口（新账号先看这 5 个）
1. `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/PAYHIP-SLEEP-HANDOFF-2026-02-16.md`
2. `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/payhip/presale/kahoot-payhip-listing-upload-plan.md`
3. `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/plan/CODEX-HANDOFF-2026-02-17.md`
4. `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/plan/CODEX-ACCOUNT-HANDOFF-2026-02-17.md`
5. `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/admin/changelog.html`

## 8) 需你做的唯一决策（给新账号）
- 是否将 `free_sample_live` 视为 strict 合法状态：
  - 方案 A：把这 16 条改为 `presale`（立即通过 strict）
  - 方案 B：修改 `report_kahoot_funnel.py` 的 strict 合法状态集合，纳入 `free_sample_live`

> 建议：若 free sample 是长期产品状态，选方案 B 更语义化；若只是临时态，选方案 A 更快上线。

