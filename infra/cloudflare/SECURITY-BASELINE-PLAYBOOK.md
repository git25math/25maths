# Cloudflare Security Baseline Playbook (Phase 5)

## Goal

Keep Cloudflare protection enabled while avoiding accidental challenge/403 on normal user traffic and SEO-critical routes.

## Scope

- Host: `www.25maths.com`
- Must keep:
  - DDoS protection enabled
  - Managed WAF protection enabled
  - Legacy language URL redirects working (HTTP 301)
- Must avoid:
  - Broad `Managed Challenge` from `Security Level` on normal requests

## Dashboard Mapping (CN UI)

- `安全性 -> 设置`
- `安全性 -> 安全规则`
- `安全性 -> 分析 -> 事件`
- `安全性 -> Web 资产` (Bot/automation related settings)

## Recommended Baseline

### 1) Security Level and Attack Mode

Under `安全性 -> 设置`:

- `I'm under attack 模式`: `禁用`
- `安全级别`: `低`
  - If challenge still appears on normal traffic, temporarily set to `基本关闭` to unblock and then tune WAF/Bot rules.

### 2) Keep Core Protections On

Under relevant security sections:

- `网络层 DDoS 攻击防护`: `启用`
- `SSL/TLS DDoS 攻击防护`: `启用`
- `HTTP DDoS 攻击防护`: `启用`
- `Cloudflare 托管规则集`: `启用`

### 3) Bot/Automation Controls

- Keep bot controls conservative. Avoid broad global challenge actions for all traffic.
- If overblocking happens:
  - First lower `安全级别`.
  - Then relax bot challenge mode.
  - Do not disable DDoS protection.

### 4) Challenge Passage

- Keep `质询通过期` at `30 分钟` (default acceptable).

## Incident Triage (When 403 Appears)

1. Run check:
   - `scripts/health/check_cloudflare_security_baseline.sh https://www.25maths.com`
2. Open `安全性 -> 分析 -> 事件`.
3. Search by `Ray ID` from response header.
4. Confirm source service and action:
   - `服务 = 安全级别` + `采取的措施 = 托管质询` means security-level overreach.
5. Apply minimal change:
   - Lower security level first.
   - Relax only the rule causing challenge.
   - Re-test immediately.

## Validation Commands

Run both checks after any security change:

```bash
scripts/health/check_cloudflare_security_baseline.sh https://www.25maths.com
scripts/health/check_redirect_301_live.sh https://www.25maths.com
```

Expected:

- Core pages are reachable (no 403/challenge).
- Legacy language URLs return expected 301 targets.

## Rollback

If abnormal risk is detected:

1. Restore previous security level.
2. Re-enable previously disabled bot challenge control.
3. Keep DDoS protections enabled at all times.
4. Re-run validation scripts.
