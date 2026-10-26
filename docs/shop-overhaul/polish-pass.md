# Bounded readability and encounter review

Baseline: `12460e79`. Original checkout was clean at that hash before work.
Development stayed in the isolated `codex/shop-polish` branch on port 8796.

Concrete issue: unchanged physical-stat rows obscured the buying decision, and
an inventory-only pouch warning said “Owned” before the player bought it.

Changes:
- Put a clear fit/collection outcome before the comparison.
- Show only changed physical stats first; keep all eight behind an accessible native disclosure.
- Correct the pre-purchase wording without changing fit policy or transactions.
- State Creative's actual all-part access rather than its sandbox's starter ownership count.
- Use action-neutral fitting copy for purchases, free Creative trials and paid parcel choices.

Desktop and 390 × 844 browser review verified the two-row pouch comparison,
keyboard disclosure open/close, and explicit portrait purchase (1,200 → 1,140
Bells; ownership grows but the working 150 g pocket remains fitted). Selection
pinning and existing fit/purchase handlers remain the same.

Encounter review: observed the current six animated illustrations and reran
the existing gesture/route harness. Movement, directional/zero-strength powers,
real contacts, pause-without-step, deterministic reset and saved route behavior
were checked by the existing six focused simulation tests. No demonstrated
balance or motion defect justified a solver/content change, so none was made.
No new creature, obstacle or progression system was added.

Validation: existing full suite 1,093/1,093 passes; final focused shop and
encounter suite 25/25 passes, including two new UI-outcome/disclosure checks.
The full run started before those two new tests were added; they pass in the
final focused run. Prior export/download uncertainty remains unmodified.

Before/after screenshots are in the task evidence directory:
`polish-before.jpg`, `polish-after-desktop.jpg`, `polish-after-mobile.jpg`.
Physical touchscreen hardware remains outside this pass. Original map data
and the user's active editor tab have not been touched.
