# /test-report — 分析历史测试报告并生成改进建议

## 你的角色
你是 25maths.com 的技术负责人。你要分析测试结果的趋势，找出系统问题，并给出可执行的修复指令。

## 数据来源
`scripts/test-users/reports/verify-*.json` — 历史验证报告

## 脚本：`scripts/test-users/report.js`

```
用法：
  node scripts/test-users/report.js                   # 分析所有历史报告
  node scripts/test-users/report.js --last 5          # 只分析最近 5 次
  node scripts/test-users/report.js --diff             # 对比最近两次的差异
  node scripts/test-users/report.js --export md        # 输出 Markdown（可贴 GitHub Issue）
```

## 分析维度

### 1. 趋势概览
```
Run #  Date        Total  Pass  Fail  Warn  Pass Rate
─────  ──────────  ─────  ────  ────  ────  ─────────
  1    02-28 14:30  142    128   11    3     90.1%
  2    02-28 18:00  142    135    5    2     95.1%  ↑
  3    03-01 10:00  142    138    3    1     97.2%  ↑
  4    03-01 15:00  142    137    4    1     96.5%  ↓ regression!
```

### 2. 问题分类

按 fix_location 聚合失败项：

```
functions/api/v1/engagement/     — 8 failures across 3 runs → PERSISTENT
functions/api/v1/download/       — 3 failures in run #1, 0 in #2 → FIXED ✅
assets/js/member_center.js       — 2 failures in run #4 only → REGRESSION ⚠️
```

### 3. 用户类型覆盖度

```
User Group  Checks  Pass Rate  Status
──────────  ──────  ─────────  ──────
A: 门控      56      95%        ✅ Healthy
B: 数据边界  30      83%        ⚠️ Needs attention (T08 零数据问题)
C: Tier      24      100%       ✅ Healthy
D: 语言特殊  18      72%        ❌ Multiple issues (zh-cn 文案缺失)
```

### 4. 修复建议（关键输出）

对每个未解决的问题，直接生成可执行的 Claude Code 指令：

```markdown
## Issue #1: engagement endpoint null handling (PERSISTENT, 8 users affected)

### 问题
GET /api/v1/engagement/ 在 user_streaks 表无记录时返回 500。
error: Cannot read property 'current_streak' of null

### 受影响用户
T04 Diana（无记录）、T08 Henry（零数据）、以及所有新注册用户

### 修复指令（给 Claude Code）

修改 `functions/api/v1/engagement/` 中的 streak 查询逻辑：

1. 读取 `functions/api/v1/engagement/` 下的相关文件
2. 找到查询 user_streaks 的代码
3. 当查询结果为 null 时，返回默认值而不是直接读取属性：
   ```
   const streaks = queryResult || { current_streak: 0, longest_streak: 0, freeze_remaining: 0 };
   ```
4. 同样处理 user_xp 的 null case
5. 确保返回格式与正常情况一致

验证：运行 `node scripts/test-users/verify.js --user T08 --layer api`
预期：API-005 从 FAIL 变为 PASS

---

## Issue #2: zh-cn membership page missing translations (D 组)

### 问题
/zh-cn/membership/ 页面部分文案仍为英文

### 受影响用户
T14 Nina

### 修复指令（给 Claude Code）
...
```

## 输出文件

### 终端摘要
精简版本，关注变化

### Markdown 报告
`scripts/test-users/reports/analysis-{timestamp}.md`

结构：
```markdown
# 25maths.com 测试分析报告
日期：{date}
基于：最近 {N} 次验证（{date_range}）

## 总体趋势
[趋势表格]

## 已修复 ✅
[列表]

## 持续存在的问题 🔴
[每个问题含 Claude Code 修复指令]

## 新增回归 ⚠️
[每个问题含 Claude Code 修复指令]

## 待实现的功能
[verify 中标记为 SKIP 的 endpoint]

## 下一步建议
[优先级排序的行动项]
```

## 关键原则
- 每个问题必须附带可执行的修复指令，而不只是描述问题
- 修复指令必须指明具体文件路径
- 修复指令必须包含验证方法（哪个 verify 检查应该从 FAIL 变 PASS）
- 回归问题优先于新问题
- 影响多个用户的问题优先于影响单个用户的问题
