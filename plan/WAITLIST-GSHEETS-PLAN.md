# Waitlist + Google Sheets Optimization Plan

> Date: 2026-02-13
> Scope: CIE 0580 product waitlist forms + support contact form + free gift survey funnel

## Goal

Use one waitlist submission endpoint for all topics, keep topic-level intent data, and deduplicate by email without adding a backend server.

## Decision

- One unified form endpoint: Google Apps Script Web App URL
- One primary subscriber record per email
- Topic interest tracked as tags (Algebra / Functions / Number)
- Event log kept for every submission for audit and attribution

## Why this model

- Keeps implementation simple for a static Jekyll site
- Preserves cross-topic buying intent data
- Supports topic-specific launch campaigns and full-list fallback sends
- Avoids fragmented operations across multiple form providers

## Data model (Google Sheets)

### Sheet 1: `waitlist_subscribers` (deduplicated)

Columns:
- `email` (normalized, unique key)
- `first_seen_at`
- `last_seen_at`
- `topics_csv`
- `topics_count`
- `last_topic`
- `last_lang`
- `last_source_page`
- `last_entry_point`
- `submit_count`
- `status`

### Sheet 2: `waitlist_events` (all submissions)

Columns:
- `submitted_at`
- `email`
- `name`
- `topic`
- `module`
- `lang`
- `source_page`
- `entry_point`
- `product`
- `ticket_subject`
- `message`
- `subject`
- `is_new_email`
- `is_new_topic`
- `redirect_url`
- `user_agent`

## Deduplication rules

- Normalize email: lowercase + trim
- Subscriber uniqueness: `email`
- Topic intent uniqueness: `email + topic`
- If repeated submit on same topic: update `last_seen_at` and `submit_count`, keep one subscriber row
- If new topic by existing email: add topic into `topics_csv`

## Site implementation

- All CIE 0580 product waitlist forms post to `site.waitlist.endpoint`
- Hidden fields added: `topic`, `module`, `lang`, `source_page`, `redirect_url`
- Topic-specific differentiation remains in `_subject`
- `support.html` contact form also posts to same endpoint with `entry_point=support_contact_form`
- New free gift pages (`/free-gift.html`, `/en/free-gift.html`, `/zh-cn/free-gift.html`) post to the same endpoint with `entry_point=free_gift_survey`
- Free gift survey adds fields: `persona`, `exam_board_interest`, `target_exam_session`, `consent_updates`

## Verification checklist

- [x] All product waitlist forms use one endpoint
- [x] No Formspree placeholder remains in product waitlist pages
- [x] Each form carries topic and language metadata
- [ ] GAS endpoint writes both sheets correctly (requires live deployment test)
- [ ] Duplicate same email/topic does not create duplicate subscriber row (requires live deployment test)
- [ ] Same email different topic updates topic tags (requires live deployment test)
- [ ] Support contact captures `name`, `ticket_subject`, `message` in `waitlist_events`
- [ ] Free gift survey captures `persona`, `exam_board_interest`, `target_exam_session`, `consent_updates` in `waitlist_events`

## Rollout steps

1. Create Google Sheet and Apps Script project
2. Set Script Property: `SPREADSHEET_ID`
3. Deploy as Web App (`Anyone` can access)
4. Copy web app URL into `_config.yml` `waitlist.endpoint`
5. Submit test cases and verify dedupe behavior
6. Start topic-segmented launch emails

## How many collection links to prepare?

Only **1 link** is required:
- One Google Apps Script Web App URL for all waitlist forms

Topic separation is handled by hidden field `topic`, not separate form endpoints.
