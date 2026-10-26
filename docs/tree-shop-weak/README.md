# Hollow-tree shop and free weak swings

Baseline: accepted c5a5088 (v67). No saved-map keys, progress schema, active-map authority, creature queue, equipment economy or launch forces are replaced. Development is isolated; original checkout/tab/maps remain untouched until accepted integration.

## Genuine weak swings

Known recipes previously rejected supported releases below a calibrated draw (the starter required 70%). The UI also silently reset holds shorter than 90 ms. Both filters are removed. Finite valid draw and actual basket support remain required. Releasing at any supported 0–100% draw opens the same physical latch with the actual geometry and loose critter pose/momentum. There is no minimum-power clamp, velocity boost or new launch impulse. Scale-guide calibration values are now explicitly reference throws, not release restrictions.

A real baseline keyboard hold at 37% was refused with “Keep cranking to at least 70%”. In the candidate a real 20% hold was accepted at exactly 0.20. Solver tests cover 0/2/10/25/40/60/69/70/71/100%. Weak success is allowed: the normal pocket can release even at very low draw. With a −50° pin, a 10% throw naturally ends with the existing no-release failure while a 40% throw succeeds. Existing gravity, ring, stress, overload and contact calculations remain unchanged.

## Failure feedback and recovery

The large original FAIL! stamp is keyed only to a non-empty actual simulation failure. A per-throw latch displays/announces it once. Unsupported preparation, pause, cancel and editor entry create no failure. Explicit rebuild/retry clears it. Reduced motion removes its entrance animation.

A terminal failed throw now stays on its result instead of immediately auto-opening the shop. Collect & retry banks at most once using the existing reward rules and returns directly to preparation; Collect & visit shop retains the ordinary route. The existing bounded no-release timeout (max(8,12×similarity-time) simulation seconds) and released-flight safety bound remain; Pause → Rebuild is also available. No arbitrary low-draw failure condition or forced success was added.

Actual browser evidence: a 20% throw with the purchased heavier canvas pouch naturally overloaded the beam, showed FAIL!, and Collect & retry returned to ready with the stamp hidden. This was solver outcome, not a percentage rule.

## Reference-led shop

Both user-provided screenshots were materialized locally through Library and their actual pixels inspected. No screenshot bytes, Balatro logos or extracted art are included. The original tree interior uses curved wood/growth-ring walls, warm lighting and a counter. Layout follows the reference rhythm: left SHOP/wallet rail, compact Next/Reroll controls, three portrait cards with price tabs above, lower-left Upgrade Door voucher. It occupies the usable viewport and adapts to a real 390px document.

Each visible Bells tab is the actual native purchase button, with the existing authoritative affordability/ownership/persistence reducers. Disabled prices still show cost and required funds; sold slots remain OWNED. A live status message confirms fitting. The persistent right detail pane is removed. Hover/focus or a separate i-button opens advanced fit/stat details; touch price buys and touch info inspects. The nonmodal popover is viewport-clamped away from its selected price, scrollable, has a sticky close control, dismisses on Escape/outside/scroll/resize, and closes with the shop. There is no duplicate purchase button inside it.

Exactly three compatible seeded equipment offers, door rules, valid visitor promise, legacy paid parcel recovery, Next and launch-area Craft stay intact. Keyboard and pointer purchases use the same transaction. Actual price double-click charged 1200→1140 once; real phone keyboard purchase and info-without-spending were inspected.

## Validation

Full Node regression: 1131/1131 PASS, `/tmp/treetop-v69-final-suite.log`. Focused low-power/input/physics checks: 60/60; current popover/space/keyboard checks: 45/45. New tests cover real low-draw geometry/pose/velocity, natural weak success/failure, input cancellation, once-only FAIL feedback, direct visible buy controls, separate info, stale double-click safety and popover edge placement. Browser evidence and independent QA results are retained separately by the integration lead.

Physical touch hardware is not claimed; touch event paths are tested synthetically and the real 390px iframe is inspected. Prior uncertain file-download/import work is not retried. The previously disclosed extreme whale door/basket staging overlap remains outside this bounded fix.

Independent review found that native popover dismissal could restore focus to its info opener and reopen details on Escape. v70 suppresses inspection during synchronous native focus restoration; a regression models that browser behavior. Real keyboard Escape now closes details while keeping the shop open and the info control focused. Layout and transaction behavior are unchanged.

Final v70 full regression: 1132/1132 PASS (68.3 seconds), `/tmp/treetop-v70-final-suite.log`; no skipped tests.

v71 also suppresses hover reopening after Escape/Close until fresh mouse movement. Native top-layer removal can send pointerenter to a card under a stationary cursor; that event now leaves details closed. Deliberate info activation and actual mouse motion remain available. Focused 50/50 checks pass including stationary reentry, zero-motion pointermove and explicit inspection.

Final v71 full regression: 1133/1133 PASS (71.6 seconds), `/tmp/treetop-v71-full.txt`; no skipped tests. Actual pointer inspection and repeated native Escape verified locally.
