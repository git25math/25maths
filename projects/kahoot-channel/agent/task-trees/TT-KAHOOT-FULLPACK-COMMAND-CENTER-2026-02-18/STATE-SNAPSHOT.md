# State Snapshot (as transferred)

## 全量结果
- CIE full-pack gate：`124/124` PASS
- Edexcel full-pack gate：`78/78` PASS
- Queue：
- `cie-pending-fullpack.txt = 0`
- `edexcel-pending.txt = 0`

## 质量稳定性
- 结构校验失败：`0`
- worksheet 质量校验失败：`0`
- topic-pack 质量校验失败：`0`
- PDF 页数异常：`0`

## 等号专项
- 根因：LaTeX 关系符默认间距导致视觉偏大，不是文本多空格。
- 修复：math mode 独立 `=` 收紧为 `\!=\!`。
- 全量回归后：CIE `124/124`、Edexcel `78/78` 仍全通过。
