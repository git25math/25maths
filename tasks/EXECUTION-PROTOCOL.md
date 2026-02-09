# AI Agent Execution Protocol (SOP)

> Every AI agent MUST follow this protocol for every task. No exceptions.
> This document is the law. Task docs provide the "what"; this doc provides the "how".

---

## Phase 0: Identity Check (Before ANY Work)

Before writing a single character of code, the AI must:

```
□ Read PROJECT-PLAN.md completely
□ Read tasks/EXECUTION-PROTOCOL.md (this file)
□ Read MY task doc (tasks/AGENT-{X}-*.md)
□ Confirm: "I am Agent {X}. My files are: {list}. I will NOT touch: {everything else}."
```

**Output a declaration like this:**

```
=== AGENT IDENTITY DECLARATION ===
Agent: {A/B/C/D/E/F}
AI Tool: {Codex/Gemini CLI/Claude Code}
My files (WRITE): {list of files I will create or modify}
My files (READ-ONLY): {list of reference files}
Off-limits: All other files
Timestamp: {current time}
=================================
```

**If you are uncertain about file ownership, STOP and re-read PROJECT-PLAN.md.**

---

## Phase 1: Plan Decomposition (Break Down Before Build)

Before writing code, decompose your task doc into numbered micro-steps.

### Format

Create a step list in this format:

```
=== EXECUTION PLAN: Agent {X} ===

Step 1: {action verb} {specific target}
  - Input: {what I need to read/reference}
  - Output: {what this step produces}
  - Acceptance: {how to verify this step succeeded}

Step 2: ...
...

Total steps: {N}
Estimated files affected: {list}
==============================
```

### Rules for decomposition

1. Each step should be **one atomic action** (e.g., "Replace nav in about.html" not "Fix about.html")
2. Each step must have a **verifiable output** (you can check if it's done)
3. Steps that depend on each other must be marked: `Step 3 (depends on Step 2)`
4. Steps that are independent can be parallelized

### Example

```
Step 1: Read current about.html and note exact line numbers for nav, footer, tailwind config
  - Input: about.html
  - Output: Line number map noted
  - Acceptance: Can state exact line ranges for each target

Step 2: Replace Tailwind config (line 8) with full 4-color config
  - Input: about.html, AGENT-E task doc Change 1.1
  - Output: about.html has 4 colors in config
  - Acceptance: grep for "secondary" in file returns a match

Step 3: Replace Google Fonts (line 9) with full import + preconnect
  - Input: about.html, AGENT-E task doc Change 1.2
  - Output: about.html has preconnect + 5 font weights
  - Acceptance: grep for "wght@400;500;600;700;800" returns a match
```

---

## Phase 2: Pre-Execution Verification

Before making any changes, verify the current state matches what you expect.

### Checklist

```
□ Files I need to modify exist at expected paths
□ Files I need to create do NOT already exist (to avoid overwriting)
□ Reference files (algebra.html, PROJECT-PLAN.md) are readable
□ Line numbers in my task doc match actual file content
  - If they DON'T match: STOP, note the discrepancy, recalculate correct lines
□ No other agent has already modified my files (check git status if available)
```

### Output

```
=== PRE-EXECUTION CHECK: Agent {X} ===
✓ about.html exists, 86 lines, last modified {date}
✓ support.html exists, 100 lines, last modified {date}
✓ free/ directory does not exist yet (will create)
✓ Line 8 of about.html is: <script>tailwind.config=... ← matches task doc
✓ Line 13-23 of about.html is nav block ← matches task doc
✗ DISCREPANCY: Line 9 is "..." but task doc says "..." → Recalculated: use line 9
==========================================
```

---

## Phase 3: Step-by-Step Execution

Execute each step from Phase 1, one at a time. After EACH step:

### 3a. Execute the step

Make the change as specified.

### 3b. Immediately verify

Check that the change was applied correctly:

```
=== STEP {N} RESULT ===
Action: {what was done}
File: {which file}
Lines affected: {old range} → {new range}
Verification:
  - Expected: {what should now be true}
  - Actual: {what IS true after the change}
  - Status: ✓ PASS / ✗ FAIL
========================
```

### 3c. If FAIL: Fix immediately

- Identify what went wrong
- Fix it
- Re-verify
- Log the fix:

```
=== FIX APPLIED ===
Step: {N}
Problem: {what went wrong}
Root cause: {why}
Fix: {what was changed}
Re-verification: ✓ PASS
Lesson learned: {what to watch for in future steps}
====================
```

### 3d. Move to next step

Only proceed to Step N+1 after Step N is verified ✓ PASS.

---

## Phase 4: Post-Task Verification (Per-File)

After all steps for a file are complete, verify the WHOLE file against acceptance criteria.

### Procedure

1. Re-read the entire modified/created file
2. Check every item in the task doc's Verification Checklist
3. Log results:

```
=== FILE VERIFICATION: {filename} ===

Task Doc Checklist:
[✓] Item 1: description — PASS
[✓] Item 2: description — PASS
[✗] Item 3: description — FAIL: {what's wrong}
[✓] Item 4: description — PASS

Additional checks (self-discovered):
[✓] HTML is valid (all tags closed)
[✓] No typos in URLs
[✓] No leftover placeholder text

Result: {PASS / FAIL — N issues}
==========================================
```

### If any item FAILS

1. Fix the issue
2. Re-verify that specific item
3. Re-verify the WHOLE checklist (a fix might break something else)
4. Log the fix and what was learned

---

## Phase 5: Cross-Reference Check

After all files are done, verify consistency ACROSS files.

```
=== CROSS-REFERENCE CHECK: Agent {X} ===

1. Internal consistency:
   □ All files I created/modified use the same nav structure
   □ All files I created/modified use the same footer
   □ All files I created/modified use the same Tailwind config
   □ All files I created/modified use the same Google Fonts

2. External consistency:
   □ Links in my files point to pages that exist (or will be created by other agents)
   □ My files match the design system in PROJECT-PLAN.md
   □ My files don't conflict with other agents' expected outputs

Result: {PASS / N issues found}
==========================================
```

---

## Phase 6: Acceptance Report

Generate a final report summarizing everything done.

### Format

```
=== AGENT {X} COMPLETION REPORT ===

## Summary
- Files created: {list}
- Files modified: {list}
- Files NOT touched: {confirm}
- Total steps executed: {N}
- Fixes applied during execution: {N}

## Step-by-Step Log
| Step | Action | File | Status | Notes |
|------|--------|------|--------|-------|
| 1 | Replaced Tailwind config | about.html:8 | ✓ PASS | |
| 2 | Updated Google Fonts | about.html:9 | ✓ PASS | Had to adjust for preconnect being 3 lines |
| 3 | Replaced nav | about.html:13-23 | ✓ PASS | Now 13-87 (nav is longer with mobile menu) |
| ... | ... | ... | ... | ... |

## Verification Results
| File | Checklist Items | Passed | Failed | Status |
|------|----------------|--------|--------|--------|
| about.html | 6 | 6 | 0 | ✓ ALL PASS |
| support.html | 5 | 5 | 0 | ✓ ALL PASS |
| free/index.html | 8 | 8 | 0 | ✓ ALL PASS |

## Issues Found & Fixed
| # | Issue | File | Fix Applied | New Learning |
|---|-------|------|-------------|--------------|
| 1 | Nav indent was wrong | about.html | Re-indented | Check indentation after paste |

## Acceptance Criteria Updates
If any NEW checks should be added to the verification checklist:
| New Check | Reason | Added To |
|-----------|--------|----------|
| Check preconnect has crossorigin attr | Forgot in original spec | AGENT-E checklist |

## Files Changed (for git commit)
```
git add about.html support.html free/
```

## Status: COMPLETE / INCOMPLETE
Blockers (if incomplete): {list}
==========================================
```

---

## Phase 7: Update Project Files

After generating the completion report:

1. **Update task doc status**: Change `pending` → `completed` in your AGENT-{X} task doc header
2. **Update PROJECT-PLAN.md**: Change your row in the Progress Tracking table to `completed`
3. **Save your completion report**: Write it to `tasks/reports/AGENT-{X}-report.md`
4. **Update acceptance criteria**: If Phase 6 identified new checks, add them to your task doc's Verification Checklist

---

## Anti-Patterns (What NOT To Do)

| DO NOT | DO INSTEAD |
|--------|-----------|
| Make changes without reading the file first | Always read → verify → change → verify |
| Skip verification ("it should be fine") | Verify EVERY step, no exceptions |
| Fix a bug without logging it | Log every fix with root cause |
| Touch files outside your scope | STOP and flag if you think another file needs changes |
| Assume line numbers are correct | Always verify line numbers against actual content |
| Copy code from memory | Always copy from task doc or reference file |
| Continue after a FAIL | Fix the FAIL before proceeding |
| Skip the completion report | The report IS the deliverable, not just the code |

---

## Quick Reference: Protocol Phases

```
Phase 0: Identity Check     → "I am Agent X, my files are..."
Phase 1: Plan Decomposition  → Break task into numbered micro-steps
Phase 2: Pre-Execution Check → Verify current state matches expectations
Phase 3: Step Execution      → Execute → Verify → Fix → Next
Phase 4: File Verification   → Check each file against full checklist
Phase 5: Cross-Reference     → Check consistency across all my files
Phase 6: Acceptance Report   → Generate full report with logs
Phase 7: Update Files        → Update status in task doc + PROJECT-PLAN.md
```

**Total estimated overhead: ~10% of execution time. ROI: eliminates rework.**
