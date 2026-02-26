# Implementation Transfer

## 关键实现能力（已完成）
1. 生成器加固
- 文件：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py`
- 能力：
- board-aware（CIE/Edexcel）
- domain-aware 映射
- tier-aware 映射
- 关键数学模板修复（分数约分、联立方程、四舍五入、不等式模板）

2. 结构与内容门禁加固
- 文件：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/scripts/validate_worksheet.py`
- 文件：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/scripts/quality_check_worksheet.py`
- 文件：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/scripts/quality_check_topic_pack.py`
- 能力：
- board 一致性校验
- worksheet 数学一致性与答案质量校验
- Kahoot + listing 全包质量校验

3. 版式与 PDF 渲染修复
- 文件：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/scripts/build_worksheet_pdf.sh`
- 能力：
- 保证 3 页打包策略
- 公式中等号渲染收紧（`\!=\!`），保留 `>=`/`<=`

4. 运行框架与命令体系
- 文件：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/RUN-COMMANDS.md`
- 能力：
- build queue / gate / serial batch / full regression 一套命令闭环

## 快照证据
- `snapshot/CODEX-ACCOUNT-HANDOFF-2026-02-17.md`
- `snapshot/pdf-correctness-audit-2026-02-18-fix-verification.md`
- `snapshot/pdf-correctness-audit-2026-02-18-rerun.md`
- `snapshot/equals-spacing-audit-2026-02-18.md`
