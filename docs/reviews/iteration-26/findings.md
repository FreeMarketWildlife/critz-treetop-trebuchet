# Iteration 26 checkpoint — portrait grip visibility and view recovery

Starting HEAD50f4e21. This checkpoint changes interaction/presentation only; the physical solver, mechanical parameters, collision geometry and economy/save implementation are unchanged.

## Changes

- Show the existing hand's real body anchor and spring target with a bounded tether and target marker. Amber reflects the existing force-cap flag. No new force, pose, enlarged collider or snapping.
- Add a nearby **Let go** button and grip status. It calls the same grip reset/drop path, including pointer ownership cleanup. Enter activates it. Supporting-contact gating for Unlatch remains.
- A resize during a grip, or immediately following cancellation, releases the grip as before and reveals the canvas after responsive layout. Deferred recovery is coalesced and cancelled by a setup reset. Ordinary idle/flight resizes do not request scrolling.
- Reserve grip-status and hidden release-button space to prevent feedback from moving targets. Disable document scroll anchoring for changing coaching/retry rows. Explicit bank and resize-recovery scrolling remains.
- Update help to describe the real target/tether and fixed-terrain approach cues. Version the stylesheet to avoid stale cached layout.

## Completed evidence

**206 tests pass**, zero failures. Input ownership, deferred view recovery/reset, actual held-body/hand render immutability, CSS-size mapping, physics/prediction, rewards and save coordination checks pass. git diff --check passes.

The44-case numerical portrait study uses actual winding, UI pointer mapping/grip controller and finite hand forces: all11species×starter/longhardware×low/medium winding. Every pickup and force target is inside the374CSSpx canvas; all44pickups succeed.39/44 have both supporting contact and a loaded state at the final observation. Five long/low cases do not meet both conditions: turtle,snake,squirrel,armadillo,marmoset. **Every physical row is exactly equal before/after the UI change**. This slow two-stage recipe differs from the live single-diagonal trials below; do not combine success rates or force the misses to pass.

Full35-case regression:32releases/three low-winding seating misses; **all non-timing row data exactly equals iteration25**, including32exact prediction results with no live mutation. Nine angular flags remain, max.153852rad. Every consecutive threshold excursion lasts at most one1/600s outer sample; final errors recover below threshold. No positive unexplained energy residual.

All nine actual worst poses were captured as read-only fixture vertices/circles and transforms, then inspected in the browser at4×, with mouse also at game scale. No torn bodies or large separation observed in those frozen poses. Conservative single-affected-body angle-only chord estimates are.479–.795CSSpx at374px portraitcanvas; adding the independent whole-case maximum anchor gap gives.531–1.475CSSpx. These are geometric bounds, not measured image differences, downstream-chain bounds, or continuous-motion/video evidence. No solver/limit tuning selected.

The first diagnostic capture attempted the launch-snapshot API while a hand was held; that API correctly rejected it. `regression-capture-rejected.json` is historical diagnostic failure evidence, not a production regression. The final capture uses read-only static geometry and preserves held state, rather than dropping the hand or bypassing the launch-snapshot contract.

Both132attempt progression soaks complete:126releases/six seating misses,132save/reloads,132stale writer rejections,zero discarded worlds retained at twelve GC checkpoints. Both complete physical row sets **exactly equal iteration25**, including the40second version. Engine ten-tick batch p95/max:15s2.698/8.996ms;40s3.722/11.095ms. These shared-host measurements are not device FPS. Audio lifecycle uses a double; no audible claim.

## Actual browser review

All11species were actually picked up and keyboard-released at390portrait with long hardware and physical low winding. No automatic placement. Supporting contact was observed for squirrel/possum; the other single-diagonal trials exposed lost-contact/fall recovery guidance. This varied-duration, deliberately simple route is pickup/coaching coverage, not proof of universal loading success or a calibrated trial of the recommended lift-then-across path. The numerical study separately covers that slower path. See manual-session.json.

Real held-grip rotation was checked390×844→844×390→390×844. The old view lost most of the canvas above the viewport; the repaired handler reveals the full canvas, clears the hand and permits real re-gripping. Final320portrait→landscape check leaves grip inactive and canvas top.172/bottom320.172 in the390px-high viewport, with nearby controls reachable.

Grip feedback initially introduced a scroll-anchor shift; reserved space fixes pickup movement. Verified actual held pickup rectangles/scroll positions stay exactly unchanged at390 and320 widths. The last CSS rule also disables document anchoring for retry rows. A direct coordinate click on Let go in final CSS leaves canvas top72.367px and scroll506.5 unchanged while releasing correctly.

**Remaining UI question:** locator-based Enter can scroll to its focused button (observed top72.367→−19.133px,scroll506.5→598). Direct pointer release does not. Keyboard activation itself releases correctly, but automation focus scrolling versus browser keyboard behavior is not fully isolated. Do not claim every keyboard release preserves viewport position. A final-CSS all-roster release-layout pass is partial; all11JavaScript pickup/release coverage preceded that last generic CSS rule. No browser step is stalled or permission-blocked.

A final interaction playthrough used a real starter Chipmunk, meter.54 (physical fraction.605), native drag, visible target, Let go, actual contact and nearby Unlatch: **318m/12bounces,60.7degrees/16.6m/s**, bank3,477points/29bells. Retry preserved wallet. SaveOFF. This earned session remains tab1219045195. The later zero-wallet CSS test is idle Salamander in tab1219045203. Earlier4684/32 and1724/19 QA wallets remain intact in tabs1219045172/1219045169. All four viewports were verified restored (logical960/CSS1096). No stored earned save writes, export attempts, native unlock, deployment or push.

## Provenance and next boundary

The numerical checks finished with stable sources. Afterwards **only** mobile.css's body overflow-anchor rule and index.html's stylesheet cache key changed. `summarize26.js` reconstructs those pre-change files and verifies their exact recorded hashes; every simulation/interaction JavaScript hash still matches. It also asserts complete physical-row parity for35regression and both132soaks and exact44loading parity. This late CSS subset was browser-checked; physics tests were not wastefully repeated solely for it. Earlier pre-layout artifacts are retained and labeled.

Next useful work: isolate native keyboard focus scrolling, finish the final-style pointer-release layout sample across the roster, and judge phone readability/held-target feedback on a real device. Nine mathematical transients do not currently justify a physics rewrite. Human reaction,audible quality,actual-device GPU/touch behavior and screen-reader listening remain unverified.
