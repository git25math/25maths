# Interactive Exercises Issues And Fixes

| Date | Issue ID | Symptom | Root Cause | Fix | Verification |
| --- | --- | --- | --- | --- | --- |
| 2026-02-17 | IE-I-001 | exercises 卡片仅见 2 个按钮，顶部 Start 按钮“消失” | 使用了未打包的 `bg-blue-600/700/800` class，白字白底导致视觉不可见 | 统一替换为已打包语义类 `bg-secondary` + `hover:bg-gray-800` | `jekyll build` + 线上 HTML 抽样检查 |
| 2026-02-17 | IE-I-002 | 用户筛选后误以为页面无数据 | 无结果场景缺少快速恢复 | 新增 `Show All Exercises / 显示全部练习` reset 操作 | EN/ZH hub 交互验证 |
| 2026-02-17 | IE-I-003 | 用户认为缺失 `C2-03` | 数据模型中 C2 序列本身无 `C2-03` | 明确解释映射规则并保留现状 | 数据源与生成页双向核验 |
