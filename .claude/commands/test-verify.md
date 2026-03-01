# /test-verify — 运行测试用户验证检查

## 你的角色
你是 25maths.com 的 QA 工程师。你要验证测试用户的数据和功能是否符合预期。

## 前置步骤
1. 读取 `scripts/test-users/users.json` 获取用户配置
2. 确认 `.env` 中 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`API_BASE_URL` 存在
3. 如果 `scripts/test-users/setup.js` 未执行过（数据库中无测试用户），提示先运行 `/test-setup`

## 脚本：`scripts/test-users/verify.js`

```
用法：
  node scripts/test-users/verify.js                   # 验证全部用户
  node scripts/test-users/verify.js --user T01        # 只验证 T01
  node scripts/test-users/verify.js --group A         # 只验证 A 组
  node scripts/test-users/verify.js --layer db        # 只跑数据库层检查
  node scripts/test-users/verify.js --layer api       # 只跑 API 层检查
  node scripts/test-users/verify.js --layer page      # 只跑页面层检查
  node scripts/test-users/verify.js --verbose         # 失败项显示详细 expected vs actual
```

## 三层检查定义

### Layer 1: Database（直接查 Supabase）

每个用户都检查（根据配置动态判断 expected）：

```
DB-001: auth.users 存在且 email_confirmed = true
DB-002: membership_status.status 与配置一致（无配置的用户应无记录）
DB-003: membership_status.period_start 在合理范围（±1天）
DB-004: membership_status.period_end 在合理范围（±1天）
DB-005: entitlements 数量与配置一致
DB-006: entitlements 的 release_id 全部合法（存在于 release_registry）
DB-007: entitlements.expires_at 对 expired 用户应已过期，对 active 用户应未过期
DB-008: exercise_sessions 数量与配置一致（±2 容差）
DB-009: exercise_sessions.score 在合理范围
DB-010: question_attempts 数量 > 0（有 session 的用户）
DB-011: question_attempts 正确率在配置的 ±10% 范围
DB-012: user_streaks.current_streak 与配置一致
DB-013: user_xp.total_xp 与配置一致
DB-014: user_achievements 数量与配置一致
DB-015: user_daily_activity 天数与配置的 days_active 一致（±1）
```

特殊检查：
```
DB-T08-001: T08 Henry — exercise_sessions 为 0
DB-T08-002: T08 Henry — user_xp 记录不存在或 total_xp = 0
DB-T08-003: T08 Henry — user_streaks 记录不存在
DB-T08-004: T08 Henry — user_achievements 为 0
DB-T09-001: T09 Ivy — 存在 completed_at = null 的 session
DB-T15-001: T15 Oscar — entitlements 只有 week 1,2,3,5,7（不连续）
```

### Layer 2: API（HTTP 请求）

获取每个用户的 access_token：
```javascript
const { data } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: userEmail
});
// 用返回的 token 构造 Bearer header
```

每个用户的 API 检查（根据状态动态判断 expected）：

```
API-001: GET /api/v1/membership/benefits
  - active 用户 → 200 + 非空权益列表
  - expired/cancelled 用户 → 200 + 空权益或标记过期
  - free 用户 → 200 + 空权益
  - paused 用户 → 200 + 检查 paused 状态标识

API-002: GET /api/v1/download/{first_entitled_release_id}
  - 有该 entitlement 的用户 → 200 + 返回含 signed URL
  - 无该 entitlement 的用户 → 403
  - expired entitlement 的用户 → 403

API-003: GET /api/v1/download/{non_entitled_release_id}
  - 所有用户 → 403（测试越权访问）

API-004: POST /api/v1/exercise/session/ — 创建新 session
  - 已认证用户 → 200/201
  - 检查返回的 session_id 有效

API-005: GET /api/v1/engagement/ — streak 和 XP 数据
  - 返回的数据与数据库一致
  - T08 零数据用户 → 不返回 500
```

特殊检查：
```
API-T02-001: T02 Bob（明天过期）→ benefits 应仍返回权益
API-T03-001: T03 Charlie（已过期）→ download 应返回 403
API-T06-001: T06 Frank → benefits 应返回 CIE + Edexcel 两套权益
API-T07-001: T07 Grace (paused) → benefits 的 status 字段应为 paused
API-T15-001: T15 Oscar → download week04 应返回 403，download week05 应返回 200
```

### Layer 3: Page（HTTP fetch 检查 HTML）

注意：这里不是浏览器渲染，而是 fetch HTML 源码检查关键标记。
由于前端依赖 JS 动态渲染，部分检查需要改用 API 层代替。
这里只检查 **服务端渲染或静态存在** 的内容。

```
PAGE-001: GET / (首页) → 200，包含 "Start Here"
PAGE-002: GET /membership/ → 200，HTML 中包含必要的 JS 脚本引用
PAGE-003: GET /exercises/ → 200，HTML 中包含练习筛选器结构
PAGE-004: GET /zh-cn/ → 200，包含中文内容（T14 Nina 语言测试）
PAGE-005: GET /start/ → 200，包含 6 张路径卡片的 HTML 结构
```

## 输出格式

### 终端输出

```
╔════════════════════════════════════════════════════════════╗
║  25maths.com Test Verification Report                      ║
║  Run: 2026-02-28T14:30:00Z                                ║
╠════════════════════════════════════════════════════════════╣

─── T01 Alice (active, CIE) ────────────────────────────────
  ✅ DB-001  auth.users exists
  ✅ DB-002  membership_status = active
  ✅ DB-005  entitlements count: 12 (expected: 12)
  ✅ API-001 benefits: 12 releases returned
  ✅ API-002 download week01: 200 + signed URL
  ❌ API-005 engagement: 500 Internal Server Error
             Expected: 200 with streak data
             Actual: {"error":"column user_id does not exist"}
  ⚠️ DB-011  correct_rate: 0.58 (expected: 0.70 ±0.10) — borderline

─── T08 Henry (active, zero data) ──────────────────────────
  ✅ DB-001  auth.users exists
  ✅ DB-T08-001 exercise_sessions = 0
  ❌ API-005 engagement: 500 Internal Server Error
             Expected: 200 with defaults (streak=0, xp=0)
             Actual: {"error":"Cannot read property 'current_streak' of null"}

═══════════════════════════════════════════════════════════
SUMMARY
  Total checks: 142
  ✅ Passed:   128 (90.1%)
  ❌ Failed:   11  (7.7%)
  ⚠️ Warning:  3   (2.1%)
═══════════════════════════════════════════════════════════

TOP ISSUES (by frequency):
  1. API-005 engagement endpoint — 8 failures (null handling)
  2. DB-011 correct_rate drift — 3 warnings (randomness)
```

### JSON 报告

保存到 `scripts/test-users/reports/verify-{timestamp}.json`：

```json
{
  "run_at": "2026-02-28T14:30:00Z",
  "summary": {
    "total": 142,
    "passed": 128,
    "failed": 11,
    "warning": 3
  },
  "results": [
    {
      "user_id": "T01",
      "check_id": "API-005",
      "layer": "api",
      "status": "FAIL",
      "expected": "200 with streak data",
      "actual": "500: column user_id does not exist",
      "severity": "high"
    }
  ],
  "issues": [
    {
      "pattern": "API-005 null handling",
      "affected_users": ["T01","T02","T03","T04","T05","T06","T07","T08"],
      "root_cause_hint": "engagement endpoint crashes when user_streaks row is null",
      "fix_location": "functions/api/v1/engagement/"
    }
  ]
}
```

## 严重度分类
- **FAIL (high)**: API 返回 500、门控逻辑错误（该拦没拦/不该拦却拦了）
- **FAIL (medium)**: 数据不一致但不影响核心功能
- **WARNING**: 在容差范围边缘（如 correct_rate 偏差大但未超限）
- **PASS**: 符合预期

## 实现注意事项
- 每个检查独立 try/catch，一个失败不中断其他
- API 调用之间加 200ms 延迟，避免 rate limit
- generateLink 获取的 token 缓存复用，不要每个检查都重新获取
- 如果某个 API endpoint 不存在（404），标记为 SKIP 而不是 FAIL，并在报告中注明"endpoint 未实现"
