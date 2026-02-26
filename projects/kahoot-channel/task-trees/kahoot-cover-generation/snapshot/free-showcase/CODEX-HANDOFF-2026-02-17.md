# Codex 账号接力交接（Kahoot Free Sample）

更新时间：2026-02-17 20:03 CST  
仓库：`/Users/zhuxingzhe/Project/ExamBoard/25maths-website`

---

## 1. 本轮目标

你要求优先上线 Kahoot 的 `Free Sample` 题组，并为后续账号接力提供可执行交接。

---

## 2. 本轮已完成（业务结果）

1. 已将 16 个指定题组从 `presale` 标记为 `free_sample_live`。  
2. 已写入 Free Sample 专用数据清单（用于 Hub 展示与入口聚合）。  
3. 已补齐中文 Kahoot 入口页面（`/zh-cn/kahoot/`），用于中文用户先进入 Free Sample 路径。  
4. 本地构建已通过：`bundle exec jekyll build` 成功。

---

## 3. 当前工作区“未提交”变更（新账号需接手）

> 仅这 3 个文件目前是未提交状态（基于当前 `git status`）。

1. `/_data/kahoot_subtopic_links.json`  
2. `/_data/kahoot_free_samples.json`（新文件）  
3. `/zh-cn/kahoot/index.html`（新文件）

---

## 4. 16 个已切换为 `free_sample_live` 的题组 ID

### CIE 0580（8）

1. `cie0580:number-c1:c1-04-fractions-decimals-percentages`（Batch 1）  
2. `cie0580:number-c1:c1-13-percentages`（Batch 1）  
3. `cie0580:algebra-c2:c2-05-equations`（Batch 1）  
4. `cie0580:probability-c8:c8-01-introduction-to-probability`（Batch 1）  
5. `cie0580:coordinate-c3:c3-03-gradient-of-linear-graphs`（Batch 2）  
6. `cie0580:mensuration-c5:c5-02-area-and-perimeter`（Batch 2）  
7. `cie0580:geometry-e4:e4-07-circle-theorems-i`（Batch 3）  
8. `cie0580:trigonometry-e6:e6-02-right-angled-triangles`（Batch 3）

### Edexcel 4MA1（8）

1. `edexcel-4ma1:number-f1:f1-02-fractions`（Batch 1）  
2. `edexcel-4ma1:number-f1:f1-06-percentages`（Batch 1）  
3. `edexcel-4ma1:equations-f2:f2-04-linear-equations`（Batch 1）  
4. `edexcel-4ma1:statistics-f6:f6-03-probability`（Batch 1）  
5. `edexcel-4ma1:geometry-f4:f4-01-angles-lines-and-triangles`（Batch 2）  
6. `edexcel-4ma1:sequences-h3:h3-03-graphs`（Batch 2）  
7. `edexcel-4ma1:equations-h2:h2-07-quadratic-equations`（Batch 3）  
8. `edexcel-4ma1:vectors-h5:h5-01-vectors`（Batch 3）

---

## 5. 快速验证命令（新账号接力第一步）

```bash
cd /Users/zhuxingzhe/Project/ExamBoard/25maths-website

# 只看本次接力文件
git status --short -- _data/kahoot_subtopic_links.json _data/kahoot_free_samples.json zh-cn/kahoot/index.html

# 确认 free_sample_live 数量（应为 16）
python3 - <<'PY'
import json
from pathlib import Path
links=json.loads(Path('_data/kahoot_subtopic_links.json').read_text())
print(sum(1 for v in links.values() if v.get('status')=='free_sample_live'))
PY

# 构建验证
bundle exec jekyll build
```

---

## 6. 建议的提交方式（避免污染已有大工作区）

当前仓库有大量与本任务无关的改动（历史遗留/并行开发）。  
建议新账号只提交本次目标文件：

```bash
git add _data/kahoot_subtopic_links.json _data/kahoot_free_samples.json zh-cn/kahoot/index.html
git commit -m "feat(kahoot): launch free sample statuses and zh-cn entry page"
```

如需推送：

```bash
git push
```

---

## 7. 下一步建议（优先级）

1. 在生产站点实测入口路径：`/kahoot/#free-sample-live` 与 `/zh-cn/kahoot/`。  
2. 在 Kahoot 后台按 Batch 1 优先上架并核对标签：`FreeSample` + board + tier + topic。  
3. 上架后把 `notes` 从 `free_sample:batch_x` 继续扩展为运营追踪值（如发布时间、链接状态）。

