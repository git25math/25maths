# /test-setup — 创建或重置测试用户

## 你的角色
你是 25maths.com 的测试工程师。你要创建和管理测试用户数据。

## 前置步骤（每次执行前必做）
1. 读取 `.env` 确认环境变量存在
2. 读取 `functions/_lib/release_registry.js` 获取所有 release_id
3. 读取 `functions/_lib/supabase_server.js` 确认表结构
4. `ls _data/exercises/` 获取所有练习 slug
5. 查询 Supabase `achievement_definitions` 表获取成就 ID 列表

## 测试用户配置文件
位置：`scripts/test-users/users.json`

如果不存在，先创建它。结构：

```json
{
  "email_base": "${TEST_EMAIL_BASE}",
  "users": [
    {
      "id": "T01",
      "alias": "alice",
      "display_name": "Alice Chen",
      "group": "A",
      "membership": {
        "status": "active",
        "product": "cie_term_pass",
        "days_since_start": 30,
        "days_until_end": 54
      },
      "entitlements": {
        "release_ids": "ALL_CIE"
      },
      "activity": {
        "sessions_count": 25,
        "days_active": 14,
        "active_window_days": 30,
        "avg_score_pct": 75,
        "correct_rate": 0.70,
        "exercises_filter": "cie0580"
      },
      "streaks": { "current": 7, "longest": 12, "freeze": 1 },
      "xp": { "total": 2400, "level": 8 },
      "achievements_count": 5,
      "lang": "en"
    }
  ]
}
```

## 16 个测试用户定义

### A 组：门控与授权
| ID | alias | status | product | entitlements | 特殊设置 |
|----|-------|--------|---------|-------------|---------|
| T01 | alice | active | cie_term_pass | ALL_CIE | 基准线，高活跃 |
| T02 | bob | active | cie_term_pass | CIE week1-10 | period_end = 明天 |
| T03 | charlie | cancelled | cie_term_pass | CIE week1-8, expired | period_end = 6天前 |
| T04 | diana | — | — | 无 | 从未购买，低活跃 |
| T05 | eve | active | edx_term_pass | ALL_EDX | Edexcel 侧 |
| T06 | frank | active | both | ALL_CIE + ALL_EDX | 双授权 |
| T07 | grace | paused | cie_term_pass | CIE week1-6 | status=paused |

### B 组：数据边界
| ID | alias | status | 特殊设置 |
|----|-------|--------|---------|
| T08 | henry | active | 0 条 session，零数据状态 |
| T09 | ivy | active | 1 条 session，只做了 1 题就退出，session 未 complete |
| T10 | jack | expired | 50+ sessions，大数据量 |

### C 组：Tier 与内容
| ID | alias | 考试局 | tier | 活跃度 |
|----|-------|--------|------|--------|
| T11 | kate | CIE | core_only | 中 |
| T12 | leo | CIE | extended_only | 中 |
| T13 | mia | Edexcel | foundation_only | 中 |

### D 组：语言与特殊场景
| ID | alias | 特殊设置 |
|----|-------|---------|
| T14 | nina | lang=zh-cn，CIE active |
| T15 | oscar | CIE active，entitlements 只有 week 1,2,3,5,7（不连续）|

T16 为纯游客，不需要创建。

## 脚本实现要求

### 文件：`scripts/test-users/setup.js`

```
用法：
  node scripts/test-users/setup.js                    # 创建全部缺失用户
  node scripts/test-users/setup.js --user T01          # 只创建/重置 T01
  node scripts/test-users/setup.js --group A           # 只创建/重置 A 组
  node scripts/test-users/setup.js --reset             # 删除全部测试用户后重建
  node scripts/test-users/setup.js --reset --user T01  # 删除 T01 后重建
  node scripts/test-users/setup.js --links             # 只打印所有用户的 magic link
```

### 核心逻辑

1. **创建用户**
   - `supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: { display_name } })`
   - 邮箱格式：`{email_base}` 中 `@` 前面加 `+{alias}`
   - 例：`yourname+alice@gmail.com`

2. **写入 membership_status**
   - 根据 `days_since_start` 和 `days_until_end` 计算 period_start 和 period_end
   - status 直接用配置值
   - 无 membership 配置的用户（T04）跳过

3. **写入 entitlements**
   - `ALL_CIE` → 从 release_registry.js 解析所有 CIE release_id
   - `ALL_EDX` → 同上，Edexcel
   - 指定 week 列表的 → 只写对应 release_id
   - expired 用户 → expires_at 设为 period_end
   - active 用户 → expires_at 设为 period_end 或 null

4. **生成 exercise_sessions**
   - 从 `_data/exercises/` 筛选对应考试局和 tier 的练习 slug
   - 随机选择 slug，在 active_window_days 内随机分布时间戳
   - score 在 avg_score_pct ±15 范围内随机
   - T09 特殊：1 条 session，completed_at = null

5. **生成 question_attempts**
   - 每个 session 生成 8-15 条 attempts
   - is_correct 按 correct_rate 概率分布
   - skill_tag 从对应练习 JSON 的题目数据中提取

6. **写入 user_streaks / user_xp / user_achievements**
   - 按配置值直接写入
   - achievements 从 achievement_definitions 表按 tier 升序取前 N 个
   - T08 特殊：这些表不写入任何记录（测试 null 处理）

7. **生成 user_daily_activity**
   - 根据 days_active 和 active_window_days 在时间窗口内随机选日期

8. **打印摘要**
   ```
   ✅ T01 Alice Chen (alice+yourname@gmail.com)
      Status: active | Entitlements: 12 | Sessions: 25 | XP: 2400 | Achievements: 5
      Magic Link: https://xxx...
   
   ✅ T04 Diana Zhang (diana+yourname@gmail.com)
      Status: free user | Entitlements: 0 | Sessions: 3 | XP: 100 | Achievements: 0
      Magic Link: https://xxx...
   ```

### 安全要求
- 脚本开头检测 SUPABASE_URL 是否包含 "prod"，如果是则拒绝执行并提示
- `--reset` 执行前打印警告，等待 5 秒
- 所有数据库操作用 upsert，脚本可重复运行
- 错误不中断：单个用户失败不影响其他用户
