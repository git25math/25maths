# Rolling Membership SOP

## Policy
- Access model: rolling membership.
- Active members receive all resources released during their active billing period.
- Inactive members stop receiving new release links until reactivation.

## Weekly Operations (Recommended: Monday)
1. Prepare weekly resource pack files.
2. Upload pack files to controlled delivery destination (Payhip or private delivery links).
3. Update `/membership/index.html` "This Week's Releases" cards.
4. Export active members list from subscription platform.
5. Send weekly member update email to active members only.
6. Record delivery batch in tracker (`ROLLING-MEMBERSHIP-TRACKER.csv`).

## Monthly Operations
1. Reconcile active member status and period dates.
2. Archive previous month release links.
3. Review open rate, click rate, and support tickets.

## Data Fields (Minimum)
- email
- status (active / cancelled / paused)
- period_start
- period_end
- board_focus (cie0580 / edx4ma1 / mixed)
- topic_focus
- last_delivery_date
- notes

## Delivery Rules
- Always deliver only to active status members.
- Keep one weekly campaign per member cohort.
- Keep links versioned by week and topic.

## Suggested Naming Convention
- Weekly pack: `YYYY-WW-board-topic-pack-v1.pdf`
- Answer key: `YYYY-WW-board-topic-answers-v1.pdf`
- Solutions: `YYYY-WW-board-topic-solutions-v1.pdf`

## Member-Facing Copy
- "Your membership includes all resources released during your active billing period."
- "If your subscription is inactive, new releases pause until reactivation."

## Risk Controls
- Do not place direct permanent public file links on open pages.
- Use member-only email delivery for weekly links.
- Keep support escalation path: `support@25maths.com`.
