# Pass 8 independent HUD and landing-cue review

Revision inspected: 7102a90. Repository remained unmodified. Read-only source/test review and two existing phone JPGs; no native/browser access attempted while Mac is locked.

## Confirmed UI truthfulness issues

1. Small availability mismatch: weapon-hud.js:14 treats cooldown <=0.001 s as ready, while flight-weapons.js:17 rejects any sim.time<next. Synthetic DOM replay at 0.0005 s remaining showed enabled Fire, followed by a rejected action. Use the same exact >0 predicate as model.
2. Caption speed promise is not universally true. A real accepted hit at vx45/vy35 has dvx=dvy=0 but current Fire caption is Rising · speed and one shot is spent. At vx-20/vy5 an accepted Slingshot reduces speed from 20.6155 to 19.5080 m/s while caption says Rising · speed. Preserve bounded impulses/ammo behavior; describe available direction components (Right + up / Up / Right / At limit), or neutral present motion without a claimed benefit. A pure exported HUD state helper is a small testable consolidation. Avoid adding new disabling/gameplay rules.
3. Low-priority paused-copy mismatch: locked staff stays at heat 1 with physicalDt=0 but says Heat falling. Disabled button prevents input correctly; when blocked, use neutral heat/cooling copy or a paused state if revising the state helper.

## Landing cue correctness

Fresh actual simulation state is passed to landingOpportunity each rendered flight frame. Its current blockers/force/shape uncertainty checks remain conservative; this read found no new wrong-destination defect. Successful weapon hits synchronously clear cue acquisition and dirty the renderer (build-app.js:193); misses retain the current unchanged physical path. Paused/modal frames do not forecast or draw a cue. Resume recomputes coordinates; retained ID/age is valid for a physically frozen state and does not retain old target coordinates. New throw/disabled mode/target loss clear acquisition. Current mark is an advisory, not a promised collision or optimal action.

Stability is keyed by object ID, not point/face. A fresh valid point can move along a long object without reacquiring. This is a limitation of the visual stability heuristic, not stale-state prediction, and does not justify more policy without observed jitter.

## Existing screenshots and novice usability

phone-landing-notice.jpg visibly contains one lower-right broken/edge mark, selected Air with 1 SHOT, Fire, and Falling · lift. phone-boost.jpg visibly contains Air 0 SHOTS, disabled Empty / Choose gear, and WHOOSH around the critter. These support count/state visibility only. They cannot establish deliberate novice understanding, hit timing, marker accuracy over time, or increased distance. Main-play CSS hides weapon names, key labels, and aim/F instruction even on desktop. Fire auto-hits while direct playfield aim can miss and still spend ammo; that distinction is correct in code but undiscoverable from these stills. Highest-value later native task is observe a first-time player, not adding more HUD now. The existing landing-mark Options title truthfully says tentative regions/boosts and obstacles can change them.

## Validation and scope

24/24 focused tests passed: landing-opportunity, landing-cue-art, flight-weapons, launch-feel. Existing caption test asserts current strings rather than checking actual component capability; pure state tests should include positive cooldown under 1 ms, reverse motion, each cap/both caps, miss spend, blocked/pause, cooldown shared across selection, heat lock/unlock/reset.

Detailed synthetic states: /tmp/pass8-ui-state-review.json. Harness used a small synthetic DOM and faithful impulse adapter, not a native rendering engine. No changes to source, saves, physics, map, release timing, GitHub, or Sites. No execution denied; live visual QA is intentionally deferred due the locked Mac.
