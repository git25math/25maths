# 对话任务总结（Kahoot 封面生成专用任务树）

## 目标
将本次对话涉及的 Kahoot 封面/课程包/Free Sample 相关成果，沉淀为可持续迭代的独立任务树，避免与其它并行任务相互干扰。

## 本次已完成范围
1. 4MA1 考纲核对与小标题抽取（官方 PDF 对齐）
2. Edexcel 4MA1 微专题封面重建（按新目录）
3. CIE + Edexcel Free Sample 选题、文案、标签、封面输出
4. Free Sample 胶囊标签多轮修复（可见性、居中、颜色协调）
5. Coming Soon 占位封面模板（2320x1520）
6. CIE 0580 课程包封面（C1-C9 + E1-E9）
7. Edexcel 4MA1 课程包封面（F1-F6 + H1-H6）
8. 所有课程包名称 + 英文介绍 + 标签批量生成

## 关键决策
- Free Sample 使用同一题库，仅更换封面与文案定位（免费试玩）
- Free Sample 标记颜色按版本（C/E/F/H）匹配主视觉色系
- 保留两个对比版本：
  - balanced（当前认可）
  - contrast10（对比更强 10%）

## 任务树说明
- 根目录：
  - `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/task-trees/kahoot-cover-generation`
- 快照目录：
  - `snapshot/`（可直接继续工作）
- 同步脚本：
  - `scripts/sync_from_live.sh`
  - `scripts/sync_to_live.sh`

## 建议后续工作方式
1. 先在 `snapshot/` 内编辑和验证。
2. 完成后用 `sync_to_live.sh` 回写到实际目录。
3. 所有提交只做最小范围 add，避免混入其它任务改动。
