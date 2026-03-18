# 25Maths Website — 版本历程与开发计划

> **最后更新**: 2026-03-19
> **当前状态**: 会员系统 ~98% 完成 | 202 互动练习 | 16 篇双语博客
> **网站**: https://www.25maths.com
> **开发规范**: `docs/CONTRIBUTING.md`

---

## 版本历程

### Round 10 — 会员系统收尾 + 双语补全 (2026-03-01)

| Commit | 内容 |
|--------|------|
| `c5cf22e` | docs: 更新 PLAN.md — 标记双语 + EDX 对齐完成 |
| `73adf90` | feat: Edexcel 4MA1 页面对齐 CIE 0580 (5 项快速修复) |
| `e8ca831` | i18n: 会员页面双语补全 60 处 |
| `1482e30` | fix: 移除 root package.json 修复 Cloudflare Pages 部署 |
| `ede8b3f` | fix: profiles PK + target_board 约束 + 测试框架 |
| `fdede24` | Phase 1: LEVEL_THRESHOLDS 统一 + P0 双语文案 10 处 |
| `b554b2b` | fix: profiles PK + 成就定义 + 技术债 TD-2/7/8 + Settings 入口 |

**关键成果**:
- 技术债 TD-2/7/8 清理（computeLevel import + streak_utils + date_utils 提取）
- 会员页面 70 处双语补全（P0: 10 + P1.3: 60）
- 测试框架 73/73 PASS
- Edexcel 4MA1 页面与 CIE 0580 对齐

### Round 9 — KaTeX Phase 3-4 (2026-03-01)

| Commit | 内容 |
|--------|------|
| `c40b494` | docs: LaTeX Phase 4 KaTeX 质量保证记录 |
| `121ccd9` | fix: LaTeX Phase 4 — 102 个 JSON 文件 ~1,094 处修复 |
| `3982506` | fix: normalizeInlineMath 跳过简单数学表达式 |
| `f411886` | docs: LaTeX Phase 3 记录同步 |
| `3f1f420` | docs: 6 份项目文档同步至最新进度 |
| `9cb4c59` | feat: 批量转换练习题数学表达式为 KaTeX (161 JSON, 4,574 新表达式) |

**关键成果**:
- Phase 3: 6 大类批量转换（分数/角度/幂次/根号/希腊/代数）
- Phase 4: 三层自动化修复管道（合并伪影 547 + 断裂 218 + 嵌套 329 + 人工 18）
- 最终: 202 个 JSON 文件，8,731 LaTeX 表达式，0 错误

### Round 8 — 会员系统 E2E (2026-02-28)

| Commit | 内容 |
|--------|------|
| `f6bb787` | docs: 会员系统 E2E 完成标记 |
| `ece6c11` | docs: 双语覆盖报告 |
| `c512c31` | docs: 状态报告 |
| `47bc9b9` | fix: Hero 颜色修复 |
| `269fe7f` | feat: 会员中心 + 推荐 + 仪表盘双语 |
| `731ad30` | feat: LaTeX Phase 2 — 分数→`\frac` (170 JSON) |
| `ab48f5e` | feat: 账户设置页 + Profile CRUD API |
| `fb85ac8` | feat: Last-mile delivery — releases.json + member_downloads |
| `7e8b4b1` | feat: E2E 测试通过 — 24 下载 26/26 PASS |
| `339f42a` | fix: 成就系统 3 Bug 修复 |
| `f3739da` | refactor: 提取 achievement_evaluator.js |
| `bd78109` | feat: LaTeX Phase 1 — Unicode→LaTeX (108 JSON) |

**关键成果**:
- Webhook → Entitlements → 签名 URL → PDF 下载全链路通过
- 账户设置页 + Profile CRUD API
- LaTeX Phase 1-2 完成

### Round 1-7 — 基础建设 (2026-02 初)

| 轮次 | 内容 | Commit |
|------|------|--------|
| R1 | Blog 系统 (16 篇 EN+ZH) | `b9f0420` |
| R2 | SEO & 本地化 | `9d45f43` |
| R3 | 设计一致性审计 | `3d7823d` |
| R4 | 交叉链接 & 质量审计 | `20aa975` |
| R5 | 性能 & SEO | `d47cc8a` |
| R6 | 无障碍 & 安全审计 | `eaf4815` |
| R7 | 练习题 LaTeX Phase 1-2 | `731ad30` |

---

## 当前状态 (2026-03-19)

### 完成度

```
Jekyll 架构       ████████████ 100%
互动练习           ████████████ 100%  (202 JSON, 8,731 LaTeX)
博客系统           ████████████ 100%  (8 EN + 8 ZH)
双语支持           ████████████ 100%  (Toggle + 静态 + 70 处会员文案)
会员认证/支付       ████████████ 100%  (Supabase Auth + Payhip Webhook)
下载权限网关       ████████████ 100%  (E2E 26/26 PASS)
Engagement        ███████████░  95%  (Streak + XP + 成就 — 剩余: 阈值审查)
CI/CD             ████████████ 100%  (2 workflows + 视觉回归)
```

### 数据规模

| 维度 | 数量 |
|------|------|
| 练习 JSON | 202 个（CIE 124 + EDX 78） |
| LaTeX 表达式 | 8,731 |
| 博客文章 | 16 (8 EN + 8 ZH) |
| API 端点 | 14 |
| DB 表 | 18 (public) |
| Supabase 迁移 | 18 |
| Health Check 脚本 | 6 |
| 前端 JS 文件 | 14 |

---

## 待完成任务

### P1 — 近期 (2026 Q2)

| # | 任务 | 优先级 | 状态 |
|---|------|--------|------|
| 1 | JS 动态文案 i18n（`member_downloads.js` ~5 处 + `exercise_engine.js` ~3 处） | P1 | 待开发 |
| 2 | KaTeX CSS 预加载优化 | P1 | 待开发 |
| 3 | 成就阈值 + 等级统一最终审查 | P1 | 待开发 |

### P2 — 中期

| # | 任务 | 说明 |
|---|------|------|
| 4 | Edexcel 4MA1 releases.json + release_registry.js 注册 | 无此数据 → EDX 无法触发下载 |
| 5 | sitemap.xml lastmod 自动化 | hook 到 build 流程 |
| 6 | ~86 KaTeX 边缘用例 | 负数上标、嵌套 sqrt |
| 7 | 练习筛选器 `<select>` 无障碍 id | WCAG 合规 |
| 8 | CSP unsafe-inline 迁移 | 需 nonces/hashes |

### P3 — 远期

| # | 任务 | 说明 |
|---|------|------|
| 9 | Edexcel 4MA1 练习补齐 | 当前 78 JSON，CIE 有 124 |
| 10 | EDX Term Practice Pass 产品化 | Payhip + subscription 页 |
| 11 | B2B 教师系统 API | DB schema 已就绪 |
| 12 | GA4 事件追踪 | session_complete, download 等 |
| 13 | Play + ExamHub 入口链接 | 待对应产品正式发布后添加 |
| 14 | Email 周报模板 | weekly_report_enabled 字段已就绪 |

---

## 技术债台账

| # | 项目 | 状态 | 备注 |
|---|------|------|------|
| TD-1 | `payhip_events.js` 函数过长 | 待拆分 | 低优先级 |
| TD-2 | `weekly.js` import `computeLevel` | ✅ R10 | |
| TD-7 | streak 逻辑提取至 `streak_utils.js` | ✅ R10 | |
| TD-8 | 日期函数提取至 `date_utils.js` | ✅ R10 | |
