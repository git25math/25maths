# Interactive Exercises Baseline Freeze

## Baseline Date

- Freeze date: `2026-02-18`

## Functional Baseline

1. Exercises Hub（EN/ZH）支持 board/tier/query 筛选。
2. 无结果场景提供 reset 按钮恢复全部练习。
3. 每个练习卡片提供：
- Start Interactive Exercise
- Back to Board Directory
- Open Matching Kahoot（如有链接）
4. 练习页结果区提供回流 CTA（重试/下一题组/回目录）。

## Data Baseline

- Exercise count: `202`
- `_exercises` 与 `_data/exercises` 一致
- 当前已确认 `C2` 编号序列内无 `C2-03`（并非渲染缺失）
- `algebraic-fractions` 位于 `E2-03`

## Health Baseline

- `python3 scripts/health/check_exercise_data.py` -> `Failures: 0`, `Warnings: 0`
- `bundle exec jekyll build` -> pass

## Release Evidence Baseline

关键提交（按本对话关联顺序）：

1. `91232a3` - fix health checks false negatives in site checks
2. `dae2e20` - exercises coherence hardening and hub behavior alignment
3. `68aeb18` - enforce sitewide exercise entry-point coverage checks
4. `580bfd9` - add no-results reset action in exercises hub
5. `2deceb5` - fix invisible exercise CTA styles
6. `d00bdd4` - board-aware tier dropdown filtering
