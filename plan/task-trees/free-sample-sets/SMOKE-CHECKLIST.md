# Free Sample Sets Smoke Checklist

Use this checklist before commit/push for `/kahoot/` Free Sample Sets changes.

## A. Layout and Content
- [ ] Open `/kahoot/#free-sample-live` and confirm section renders without console errors.
- [ ] Verify each board card shows expected title, badge, and CTA buttons.
- [ ] Verify free sample cards show compact thumbnail with full image visible (no crop).

## B. Filter Behaviour
- [ ] Default state is `Batch 1`, `All Boards`, empty search.
- [ ] Batch filter toggles correctly: `Batch 1/2/3/All Batches`.
- [ ] Board filter toggles correctly: `All Boards/CIE 0580/Edexcel 4MA1`.
- [ ] Search matches by code/title/tier and updates visible cards.
- [ ] Reset returns all controls to default state.
- [ ] Empty-state message appears when no card matches.

## C. URL State (Free Sample)
- [ ] Changing free-sample controls updates URL params:
  - `fs_batch`
  - `fs_board`
  - `fs_q`
- [ ] Reloading page restores free-sample controls from URL.
- [ ] Default state removes free-sample params from URL.

## D. URL Coexistence (Explorer + Free Sample)
- [ ] Explorer controls still use `board/tier/subtopic/q` params.
- [ ] Free-sample param updates do not erase explorer params.
- [ ] Explorer param updates do not erase `fs_*` params.

## E. Responsive Checks
- [ ] Desktop (`>=1024px`): card content aligns and buttons are readable.
- [ ] Tablet (`~768px`): grid wraps correctly without overflow.
- [ ] Mobile (`<=390px`): no horizontal scroll; filters and cards remain usable.

## F. Build Gate
- [ ] Run local build when environment is ready:
  - `bundle exec jekyll build`
- [ ] If build cannot run, record reason in commit/PR notes.
