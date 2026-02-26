# Member System API Contracts (MVP Freeze)

> Frozen on: 2026-02-18  
> Applies to branch: `codex/member-system-dev`

## 1) Auth Context

- Auth provider: Supabase Auth.
- Client carries access token as bearer JWT for member-protected endpoints.
- Server-side privileged actions use `SUPABASE_SERVICE_ROLE_KEY` only in backend runtime.

## 2) Exercise Telemetry APIs

## `POST /api/v1/exercise/session/start`

Request JSON:

```json
{
  "exercise_slug": "cie0580-number-c1-c1-01-types-of-number",
  "board": "cie0580",
  "tier": "core",
  "syllabus_code": "C1-01"
}
```

Response `201`:

```json
{
  "session_id": "uuid",
  "started_at": "2026-02-18T06:00:00.000Z"
}
```

Errors:
- `401`: missing or invalid auth token
- `422`: invalid payload fields
- `500`: server failure

## `POST /api/v1/exercise/session/:id/attempt`

Request JSON:

```json
{
  "question_index": 0,
  "is_correct": true,
  "selected_answer": 2,
  "correct_answer": 2,
  "skill_tag": "number/types-of-number"
}
```

Response `201`:

```json
{
  "attempt_id": "uuid",
  "recorded_at": "2026-02-18T06:01:00.000Z"
}
```

Errors:
- `401`: missing or invalid auth token
- `403`: session does not belong to authenticated user
- `422`: invalid payload fields
- `500`: server failure

## `POST /api/v1/exercise/session/:id/complete`

Request JSON:

```json
{
  "score": 9,
  "question_count": 12,
  "duration_seconds": 380
}
```

Response `200`:

```json
{
  "session_id": "uuid",
  "completed_at": "2026-02-18T06:08:00.000Z"
}
```

Errors:
- `401`: missing or invalid auth token
- `403`: session does not belong to authenticated user
- `422`: invalid payload fields
- `500`: server failure

## 3) Billing + Membership APIs

## `POST /api/v1/membership/webhook/payhip`

Headers:
- `X-Payhip-Signature` / `X-Payhip-Hmac-Sha256` (preferred): HMAC signature of raw body.
- Legacy fallback: payload `signature = sha256(PAYHIP_API_KEY)`.

Behavior:
- Verify signature.
- Parse event.
- Upsert `membership_status` (subscription-context events only).
- Upsert `entitlements` on payment/sale events when `product_id` maps to releases.
- Revoke (expire) mapped `entitlements` on refund/cancel/delete events.

Response:
- `200`: processed
- `202`: accepted for async processing
- `400`: malformed payload
- `403`: invalid signature
- `422`: unsupported event
- `500`: processing failure

## `POST /api/v1/membership/reconcile`

Headers:
- `Authorization: Bearer <access_token>`

Behavior:
- 查找当前登录用户邮箱对应的 `payhip_event_log` 中 `pending/failed` 事件。
- 重放权益同步逻辑（`membership_status` + `entitlements`）。
- 对退款/取消类事件执行 entitlement 失效（`expires_at = now()`）。
- 成功事件标记 `handled`，失败事件标记 `failed` 并写入错误信息。

Response:
- `200`: 全部重放成功
- `207`: 部分成功部分失败
- `401`: 无效会话
- `500`: 处理失败

## `GET /api/v1/membership/benefits`

Headers:
- `Authorization: Bearer <access_token>`

Behavior:
- 读取当前用户会员状态。
- 仅当会员有效时返回优惠权益。
- 优先读取 `public.member_benefit_offers` 中有效权益（按 `priority`）。
- 当 `metadata.trigger` 存在时，按触发规则筛选权益（支持 `lookback_days`、`min_recent_wrong_attempts`、`min_recent_sessions`、`skill_tag_prefixes`、`min_matching_wrong_attempts`）。
- 当 DB 无可用权益时，回退到 `MEMBER_BENEFITS_JSON` 或 fallback env。

Response:
- `200`: `{ membership_active, offers: [...], offer_count, benefit_source: "database|env|none" }`
- `401`: 无效会话
- `500`: 读取失败

## 4) Download Access API

## `GET /api/v1/download/:release_id`

Behavior:
1. Validate `release_id` exists in `_data/releases.json`.
2. If release channel includes `payhip` and request is public route:
   - return redirect to Payhip URL.
3. If release channel includes `member`:
   - verify bearer token,
   - when `membership_tier=active`: require active `membership_status`,
   - otherwise allow (`active membership` OR `valid entitlement`),
   - enforce `ALLOWED_MEMBER_BUCKETS` allow-list for `asset_key`,
   - return short-lived signed URL.

Response:
- `302`: redirected to Payhip
- `200`: `{ "download_url": "<signed_url>", "expires_in": 600 }`
- `401`: unauthenticated for member route
- `403`: unauthorized (inactive/no entitlement)
- `404`: unknown `release_id`
- `500`: signing or data access failure

## 5) Non-Functional Contract

1. Anonymous exercise mode must continue to work without cloud APIs.
2. Cloud write failures must not block question progression.
3. All member data tables must enforce RLS.
4. Signed download links expire in <= 10 minutes.
