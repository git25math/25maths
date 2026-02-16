# Payhip 上架睡前交接清单（2026-02-16）

适用范围：Kahoot 预售体系 L1/L2/L3/L4（共 249 个 SKU）。

核心新增约束：**每个 Payhip 商品需要 9 张图片**。

---

## A. 明天先做（P0）

- [ ] 确认统一的 9 图模板（尺寸、字体、配色、文案区块）
- [ ] 先完成 `L3`（15 个单元合集）图片与上架，再做 `L4`（2 个总合集）
- [ ] 每上完一批，立刻回填真实 Payhip 链接到数据文件
- [ ] 每批回填后运行健康检查（数据 + 漏斗 + Jekyll 构建）

---

## B. 每个商品固定 9 图结构（必须一致）

1. 封面图（标题 + Exam Board + Tier + Early Bird）
2. 适用人群与考试目标（Core/Extended 或 Foundation/Higher）
3. 你将收到什么（Presale 阶段：占位 + 权益确认 + 更新通知）
4. 上线后交付什么（Worksheet + Answers + Kahoot 对应）
5. 课程/考纲映射（本商品覆盖的 Unit/Section/SubTopic）
6. 内容样例 1（Worksheet 页面预览）
7. 内容样例 2（Kahoot 页面预览或题型预览）
8. 升级路径（L1 -> L2 -> L3 -> L4）
9. 预售时间与条款（Early Bird 截止日、Release 日期、条款说明）

---

## C. 批次顺序（收入优先）

1. `L3`：15 个（先上）
2. `L4`：2 个
3. `L2`：30 个
4. `L1`：202 个（最后批量化）

说明：先高客单价，再补低客单价，保证现金流与漏斗完整。

---

## D. 你明天的执行命令（复制即用）

```bash
cd /Users/zhuxingzhe/Project/ExamBoard/25maths-website

# 1) 重新生成所有上架清单/文案（如有改价或改文案）
python3 scripts/payhip/generate_kahoot_payhip_listing_matrix.py
python3 scripts/payhip/generate_l3_payhip_copy_templates.py
python3 scripts/payhip/generate_l4_payhip_copy_templates.py
python3 scripts/payhip/generate_l2_payhip_copy_templates.py
python3 scripts/payhip/generate_l1_payhip_copy_templates.py

# 2) 每批上架并回填链接后执行检查
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/report_kahoot_funnel.py --strict
bundle exec jekyll build --trace
```

---

## E. 图片生产现实配额（避免失控）

- `L3` 需要 15 × 9 = **135 张**
- `L4` 需要 2 × 9 = **18 张**
- `L2` 需要 30 × 9 = **270 张**
- `L1` 需要 202 × 9 = **1818 张**

建议：
- 先把 L3/L4 的 153 张做完并上架，形成首轮完整销售闭环。
- L2/L1 采用模板批量替换（标题、代码、层级、日期、价格）自动化出图。

---

## F. 本次交接已完成状态

- [x] L1/L2/L3/L4 Payhip 文案模板脚本已就位
- [x] L1/L2/L3/L4 CSV + MD 文案产物已生成
- [x] 数据健康检查已通过（Failures: 0）
- [x] 站点构建已通过

---

## G. 明早第一件事（30 分钟冲刺版）

- [ ] 选定 1 个 L3 商品，先做 9 图样板（定版）
- [ ] 用样板复制到全部 L3（15 个）
- [ ] 完成 L3 上架 + 回填 + 检查
- [ ] 再开始 L4（2 个）同流程

