# Marketing Closed-Loop SOP (Placeholder Product Phase)

## Goal
Build a working marketing loop before paid products are fully live.

## Working Loop
1. Acquire traffic: homepage, blog, free gift, support, module pages.
2. Capture leads: all key forms submit to `site.waitlist.endpoint` (Google Apps Script).
3. Segment leads: use `entry_point`, `topic`, `module`, `lang`, `source_page`, `product`.
4. Nurture by email: send sequence using templates under `emails/`.
5. Convert on launch: send product/payment links to segmented lead groups.
6. Measure and iterate: monitor per-entry-point submissions and conversion rates.

## Current Form Entry Points
- `free_gift_survey`
- `support_contact_form`
- `waitlist_form` (product placeholder pages)
- `membership_waitlist`
- `blog_question_form`

## Weekly Operating Rhythm
1. Monday: export new leads from `waitlist_events`, grouped by `entry_point` and `topic`.
2. Tuesday: send educational email (topic/value content).
3. Thursday: send product-related warm-up email (problem-solution framing).
4. Launch day: send segmented launch emails with direct checkout links.
5. Friday: review conversion and reply to support/blog questions.

## Data Quality Rules
- Keep `entry_point`, `topic`, `module`, `lang`, and `source_page` populated for every form.
- Do not create new forms without hidden metadata fields.
- Keep redirect targets on `25maths.com` only.

## KPI Minimum Set
- Lead capture count by `entry_point` (weekly)
- New emails vs repeat emails (`is_new_email`)
- Launch email open and click rate
- Conversion count by source (`source_page`)

## Pre-Launch Checklist
- Replace `{SUBSCRIPTION_ID}` placeholders only when checkout is ready.
- Confirm email templates for launch and reminder are finalized.
- Verify each CTA has either checkout (live product) or waitlist form (placeholder product).
