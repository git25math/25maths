# 25Maths Website — Bug 根因分析与防范规则

> **目的**: 记录所有重大 Bug 的根因、修复方案和防范规则，避免重蹈覆辙。
> **维护**: 每次修复重大 Bug 后更新此文档。
> **开发规范**: `docs/CONTRIBUTING.md` 第九节为防范速查表。

---

## Bug 索引

| # | Bug | 严重性 | 发现日期 | 状态 |
|---|-----|--------|---------|------|
| B1 | [Cloudflare Pages 构建失败](#b1-cloudflare-pages-构建失败) | CRITICAL | 2026-03-01 | ✅ 已修复 |
| B2 | [profiles PK 字段不匹配](#b2-profiles-pk-字段不匹配) | HIGH | 2026-03-01 | ✅ 已修复 |
| B3 | [target_board 约束值错误](#b3-target_board-约束值错误) | HIGH | 2026-03-01 | ✅ 已修复 |
| B4 | [KaTeX 批量转换三类系统性缺陷](#b4-katex-批量转换三类系统性缺陷) | HIGH | 2026-03-01 | ✅ 已修复 |
| B5 | [成就定义数据错误](#b5-成就定义数据错误) | MEDIUM | 2026-03-01 | ✅ 已修复 |
| B6 | [Jekyll utime 竞态条件](#b6-jekyll-utime-竞态条件) | LOW | 2026-02 | ⚠️ Workaround |
| B7 | [Hero 颜色覆盖缺失](#b7-hero-颜色覆盖缺失) | LOW | 2026-02-28 | ✅ 已修复 |

---

## B1: Cloudflare Pages 构建失败

**发现**: 2026-03-01 | **严重性**: CRITICAL | **Commit**: `1482e30`

### 症状
Cloudflare Pages 构建在 `npm install` 阶段报错，找不到 `lightningcss-darwin-arm64` 等 macOS 专有二进制包。

### 根因
根目录存在 `package.json` 和 `package-lock.json`，其中锁定了 macOS ARM64 专有的 optional dependencies。Cloudflare Pages 构建环境是 Linux x64，无法安装这些包。

### 修复
- 删除根目录 `package.json` 和 `package-lock.json`
- 将测试脚本依赖迁移到 `scripts/test-users/package.json`（不影响部署构建）
- 重新创建仅含 Tailwind CSS 依赖的最小 `package.json`

### 防范规则
```
✅ 根目录 package.json 只能包含 Tailwind CSS 依赖
✅ 不要在根目录添加含 native addon 的 npm 包
✅ 需要额外 npm 包的脚本 → 放到 scripts/ 子目录并独立 package.json
✅ 部署前在 CI 环境验证（非本地 macOS）
```

---

## B2: profiles PK 字段不匹配

**发现**: 2026-03-01 | **严重性**: HIGH | **Commit**: `b554b2b`

### 症状
`fetchProfile()` 和 `upsertProfile()` 使用 `.eq('id', userId)` 查询，但 Supabase `profiles` 表的主键是 `user_id`，导致查询始终返回空。

### 根因
代码编写时假设 profiles 表的 PK 是 `id`，但实际迁移脚本创建的是 `user_id`。代码与 schema 不一致。

### 修复
`functions/_lib/supabase_server.js` 中将 `.eq('id', userId)` 改为 `.eq('user_id', userId)`。

### 防范规则
```
✅ 新增 DB 操作前，先检查 supabase_server.js 中对应表的查询字段
✅ PK 字段统一为 user_id（用户表）或 id（其他表）
✅ supabase_server.js 是 DB 操作的唯一入口——不在其他文件直接拼 SQL
```

---

## B3: target_board 约束值错误

**发现**: 2026-03-01 | **严重性**: HIGH | **Commit**: `ede8b3f`

### 症状
用户在 Settings 页面选择考试局后保存失败。API 返回 400 错误。

### 根因
前端 `<option>` 的 value 是人类可读的 `"CIE 0580"`，但后端 `VALID_BOARDS` 白名单和 DB 存储使用 `"cie0580"`。

### 修复
1. `membership/settings.html` — `<option value="cie0580">` 改为机器码
2. `functions/api/v1/user/profile.js` — `VALID_BOARDS` 统一为 `['cie0580', 'edx4ma1']`

### 防范规则
```
✅ 前端 <option value> 必须与 DB 存储值完全一致
✅ 新增 board 时同步更新: _config.yml modules.key + profile.js VALID_BOARDS + settings.html options
✅ API 验证层必须有白名单，不信任前端传值
```

---

## B4: KaTeX 批量转换三类系统性缺陷

**发现**: 2026-03-01 | **严重性**: HIGH | **Commit**: `121ccd9`

### 症状
Phase 3 批量转换后，大量练习题 LaTeX 渲染异常：公式断裂、双重包裹、伪影字符。

### 根因
`splitByLatex()` 分段 + 合并逻辑存在三类缺陷：
1. **合并伪影** (547 处): 相邻 `$...$` 合并时产生 `${DIGIT...}` 模式
2. **嵌套定界符** (329 处): 双重包裹 `${$...$}$`
3. **断裂表达式** (218 处): `$` 定界符位置错误

### 修复
三层自动化修复管道（顺序执行）：
1. `scripts/katex-merge-fix.js` (5 pass) → 547 fixes / 66 files
2. `scripts/katex-fix-broken.js` → 218 fixes / 39 files
3. `scripts/katex-fix-nested.js` (3 pass) → 329 fixes / 29 files
4. 人工审查 9 个文件 → 18 处修复
5. `scripts/katex-verify.js` 最终验证 → 0 错误

### 防范规则
```
✅ 任何批量 LaTeX 转换必须经过 katex-verify.js 验证
✅ 转换脚本必须先 dry-run（统计变更数），确认合理再写入
✅ 联立方程等复杂结构 → 手动处理，不走自动管道
✅ 验证时忽略货币 $ 符号（如 $42 是价格不是 LaTeX）
```

---

## B5: 成就定义数据错误

**发现**: 2026-03-01 | **严重性**: MEDIUM | **Commit**: `b554b2b`

### 症状
用户达到条件后成就未解锁。4 条成就定义的 criteria JSON 或 titleCn 不一致。

### 根因
`achievement_definitions` 表中 4 条记录的 `criteria` 字段与 `achievement_evaluator.js` 的评估逻辑不匹配。

### 修复
直接 UPDATE Supabase 中 4 条记录：`explorer-all`, `streak-7`, `streak-60`, `accuracy-100-5`。

### 防范规则
```
✅ 成就定义修改必须同步: Supabase 表 + achievement_evaluator.js + 前端展示
✅ titleCn 必须与 streak_widget.js 和 zh-cn/ 页面中的硬编码一致
```

---

## B6: Jekyll utime 竞态条件

**发现**: 2026-02 | **严重性**: LOW | **状态**: Workaround

### 症状
`bundle exec jekyll build` 偶尔报 `utime` 错误，位于 `projects/kahoot-channel/` 目录。

### 根因
该目录包含大文件（Kahoot worksheet PDF），Jekyll 在并发处理文件时触发文件系统竞态。

### Workaround
CI 中重试即可。此目录已在 `_config.yml` 的 `exclude` 列表中排除，但偶尔仍触发。

---

## B7: Hero 颜色覆盖缺失

**发现**: 2026-02-28 | **严重性**: LOW | **Commit**: `47bc9b9`

### 症状
首页 Hero 区域文本颜色不正确，Tailwind 默认色覆盖了品牌色。

### 根因
`text-gray-300` 和 `text-blue-300` 未被品牌色覆盖，Tailwind 默认值生效。

### 修复
在 `styles/site.tailwind.css` 中添加品牌色覆盖规则。

### 防范规则
```
✅ 新增 Hero/Banner 时，检查 Tailwind 默认色是否需要覆盖
✅ 使用 CSS 变量 (--color-primary 等) 而非硬编码色值
```
