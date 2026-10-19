# Iteration 12 — tail inertia and readable flight

Current implementation checkpoint after 082409f8. This is local game development; the completed lore task is not this iteration's result. No push, deployment, paid assets, unlock or export retry.

## Turtle-tail reproducer

The committed incoming-state fixture preserves the original 2% tail / 78% shell configuration from a natural head-grip launch. The focused test reproduces 0.764870 rad excess and 0.057331 m anchor separation. Assigning the selected construction masses before integration reduces these to 0.030983 rad and 0.0000298 m. Total mass remains 2.4 kg; limits remain ±0.35 rad. No runtime pose/velocity repair or additional energy is applied. Maximum positive energy residual is zero in the controlled study.

The selected profile moves four percentage points of total mass from shell to tail (74% / 6%). This is a prototype mass distribution, not calibrated anatomy. Restitution, friction, rounded hull, longer tail, moved hinge and finer timestep alternatives did not provide the same combination of impact stability and existing launch checks. Four/five percent tail candidates failed the existing medium rigid-hardware clearance check; six percent clears at 300/600/1200 Hz in the recorded legacy sweep. The natural turtle head-grip recipe now hits the launch branch; torso launches remain usable. Do not conceal this tradeoff or claim all joint deformation fixed.

`tail-study.json` and named trial JSON preserve controlled/rejected alternatives. `regression-mass4.json` is a rejected intermediate profile. The two generic `regression-default-turtle-*` files are intermediate longer-tail trials, not final-profile evidence; use `regression.json` for final results. The fixture hash and source hashes are recorded in the evidence.

## Current checks

- `npm test`: 135 passing, zero failures, including the saved-tail regression and fast/reverse/resized camera tests.
- Final 35-case diagnostic: 32 releases, three low-winding seating failures (lizard/turtle/armadillo at 0.2). All released canonical predictions exactly match live continuation and do not mutate live state. No nonfinite or positive energy residual; no rope/surface/explosive flags.
- Remaining warnings: 18 angular-limit cases, five launch-branch impacts, one backward/vertical release. Maximum angular excess 0.272689 rad; maximum anchor error 0.033266 m. This is bounded diagnostics, not universal stability. The result differs from iteration 11's 33/2; current evidence governs.
- Three prediction benchmarks release exactly; cooperative slices measured 2.59–2.67 ms on Node/Mac. This is not browser/mobile FPS and cooperative budgets can overshoot by one integration step. The mass change adds no solver/substep work.
- `git diff --check` passes. Physics fixtures retain finite work/mass accounting; existing economic full-loop tests remain included.

## Original presentation and audio feedback

Desktop setup now shows a larger live volunteer close-up, mass and a visible pickup ring while preserving the actual left-view pointer mapping. Flight uses the whole canvas with consistent actor/collider transforms, bounded velocity lookahead and direct COM following. The floor remains at 75% height. Reduced motion removes lookahead; world-height anchored decorative layers convey descent. A biome badge, distance/height and desktop height ribbon aid orientation. No copied artwork was introduced.

Shop preview displays the effective owned hardware and refreshes on lab reset. Unlatch and actual physical release now have separate original synthesized cues; winding has a quiet gesture-initiated cue. Public audio diagnostics report context/cue state. Concurrent unlock promises return their actual result; tests caught and verified repair of an intermediate diagnostic-edit regression.

Native Chrome review on the final runtime: actual lizard load → unlatch → flight → bank → retry. The enlarged setup close-up, full-width floor framing, bold actor outline and height ribbon were observed. Flight reached 123 m / seven bounces when banked; wallet became 7096 points / 46 bells, unchanged after retry. Shop showed the owned 180 kg counterweight, 2.9 m sling, grippy feet and correct next-setup values. No purchase/unlock shortcut was used. Portrait 390×844 showed usable wrapped shop text and 44 px controls; viewport restored. Browser warning/error log was empty.

AudioContext was running, recent coin/enemy cues reported, Sound on / 35% retained. Audible quality remains unverified. The latest run was observed in setup and at the forest floor; a fresh frame-by-frame sky/canopy transition review and real-device frame timings remain future checks. No screenshot/clip exports were retried or persisted. The local tab is left idle and open.

Next: improve low-winding seating with controlled contact experiments; investigate remaining brief joint-limit violations without widened limits or pose repair, and review continuous sky/canopy descent on a fresh flight. Do not report old lore commits as active progress.
