# Codex 交接记录（2026-02-17）

## 1) 当前接力基线
- 仓库：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website`
- 分支：`codex/gemini-exercise-loop`
- 远端：`origin/codex/gemini-exercise-loop`
- 最新交接提交：`56c369c`
  - message: `feat(exercises): improve convenience flow and zh-cn hub access`

## 2) 本轮已完成（可视化入口与便利性）

### A. 导航与首页入口
- 全局导航新增并稳定接入 `Interactive Exercises / 互动练习`
  - `_includes/global-nav.html`
- 中英文首页及根首页都已加入互动练习 CTA 与快速入口
  - `index.html`
  - `en/index.html`
  - `zh-cn/index.html`

### B. 模块页直达入口
- CIE 与 Edexcel 模块页 Hero 区都增加一键进入互动练习
  - `cie0580/index.html`
  - `en/cie0580/index.html`
  - `zh-cn/cie0580/index.html`
  - `edx4ma1/index.html`

### C. 中文练习中心
- 新增中文练习中心页面（非英文页跳转）
  - `zh-cn/exercises/index.html`
- 英文练习中心补齐语言切换信息
  - `exercises/index.html`

### D. 练习页“下一考点”连续练机制
- 在互动练习页增加 `Next in Syllabus` 自动接力（同 board + 同 tier）
- 顺序基于 `syllabus_code` 解析排序（如 `C1-16 -> C2-01`）
- 入口位置：
  - 题目下方资源区
  - 练习完成后的完成卡片
- 涉及文件：
  - `_layouts/interactive_exercise.html`
  - `assets/js/exercise_engine.js`

### E. Footer 兜底入口
- Footer 增加 `Interactive Exercises / 互动练习`
  - `_includes/footer.html`

## 3) 本轮功能验证结果
- 构建验证：`bundle exec jekyll build` 通过。
- JS 语法验证：`node --check assets/js/exercise_engine.js` 通过。
- 关键行为验证：
  - 中文入口统一指向 `/zh-cn/exercises/`
  - 单页 next 示例：`C1-16` 自动指向 `C2-01`。

## 4) Gemini 可调用状态（已验证）
- Gemini CLI 可用：`gemini --version` -> `0.28.2`
- CLI 调用验证通过：
  - `gemini -m gemini-2.5-flash -p "Reply with OK only." --output-format text` -> `OK`
- REST key 验证通过（HTTP 200）：
  - `gemini-2.0-flash:generateContent`
  - `gemini-2.5-flash:generateContent`

## 5) 新账号接力步骤（最短路径）

### Step 1: 同步到交接提交
```bash
git fetch origin
git checkout codex/gemini-exercise-loop
git pull --ff-only origin codex/gemini-exercise-loop
```

### Step 2: 本地运行确认
```bash
bundle exec jekyll build
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

### Step 3: 快速人工验收页面
- `/`
- `/en/`
- `/zh-cn/`
- `/exercises/`
- `/zh-cn/exercises/`
- `/exercises/cie0580-number-c1-c1-16-money/`（检查 Next in Syllabus）

## 6) 下一阶段建议（按优先级）

### P0（优先做）
1. `/exercises/` 与 `/zh-cn/exercises/` 增加「清空筛选」按钮（减少回退成本）。
2. 移动端筛选栏吸顶（长列表时保持可控）。
3. 首页加「继续上次练习」卡片（localStorage 记录最后练习 topic + filter）。

### P1（随后）
1. 练习页文案本地化（zh-CN 练习页模板与按钮文案）。
2. 空结果状态加入「推荐题组」与「一键恢复默认筛选」。
3. 为 Next in Syllabus 增加“同 section 优先”或“严格 syllabus map”策略可配置。

## 7) 生成脚本接力命令

### 单题生成（Gemini）
```bash
python3 scripts/exercises/orchestrate_gemini_exercise.py \
  --subtopic-id "cie0580:number-c1:c1-16-money" \
  --model "gemini-2.5-pro" \
  --lang en \
  --question-count 12
```

### 批量生成 + 审核
```bash
python3 scripts/exercises/batch_generate_and_audit.py \
  --board cie0580 \
  --section-key number-c1 \
  --start-code C1-01 \
  --end-code C1-16 \
  --gen-model gemini-2.5-pro \
  --audit-model gemini-2.5-flash
```

## 8) 风险与注意事项
- 当前工作区存在大量“与本次交接无关”的已修改/未跟踪文件（历史累计）。
- 新账号操作时务必：
  - 仅按文件白名单提交
  - 禁止 `git add .` / `git commit -a`
- 建议尽快清理文档中的明文 API key（改为环境变量引用）。

## 9) 交接提交清单（近期）
- `56c369c` feat(exercises): improve convenience flow and zh-cn hub access
- `6ad26e3` feat(nav): surface interactive exercise entries across homepages
- `30791c1` feat(exercises): optimize hub filters and interactive practice UX
- `d10f548` feat(kahoot): complete L0-L3 interactive closed-loop integration
- `93914d1` feat(exercises): add full Edexcel 4MA1 foundation+higher interactive sets
- `1cdecfc` feat(exercises): generate cie0580 extended interactive coverage
- `cc15a3d` feat(exercises): ship cie0580 core interactive generation pipeline
- `4185ba6` Add Gemini-driven interactive exercise pipeline with closed-loop links

