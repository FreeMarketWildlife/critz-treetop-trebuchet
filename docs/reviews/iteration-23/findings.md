# Iteration 23 — portrait loading and cohesive contact readability

Implementation: `1a6a00d296e44783a59c9c2baf87bba008ef4018`.

## Selected improvements

The loading pickup ring now offers a **44 CSS-pixel diameter** across portrait sizes. Ordinary exact/near-part grabs still run first, so deliberate head/limb grips remain available. A missed grab inside the enlarged torso/middle-segment ring attaches at that body's real center. Pointer offset is retained, avoiding an initial target jump. All subsequent motion uses the existing mass-limited hand spring. No body teleport, pose repair, extra launch force, collider widening or geometry change.

An **Unlatch beside view** button calls the existing Unlatch action. Its disabled/contact/held/paused state follows the original button. It sits below the canvas rather than over the critter, so a portrait player can watch the cradle while unlatching. Steering buttons appear during flight rather than taking loading space. The normal top action remains available.

Original static branch/soil trim makes physical contact planes easier to identify. Ground has an earthy underside and small flecks; canopy branches have hanging leaf shapes. All decoration is clipped **below the true contact line**, behind actors, with no more than 24 small details per visible surface. Real collider outlines, foreground critters, existing bounded impact rings and reduced-motion suppression remain intact. No new particles, screen shake or material/physics tuning.

## Actual play and visual review

Two initial baseline runs were played on iteration 22 before changes; that independent memory-only tab remains idle at 2,435 points/32 bells. They are not mixed into the four-run ledger below.

The main new-art/pickup review used real browser winding, grip, drop, supporting contact, unlatch, flight, collection and shop controls at **390×844**. Saving stayed OFF; no stored balances or body state were injected. The final nearby action and segmented-fallback refinement were added after this page loaded, then checked in a separate latest-source session. See `manual-session.json` for exact provenance and visible values.

| Run | Volunteer | Equipment | Distance shown | Bounces | Earned points / bells |
|---|---|---|---:|---:|---:|
| 1 | Salamander | Starter | 137 m | 9 | 1,594 / 23 |
| 2 | Chipmunk | Starter | 112 m | 9 | 1,345 / 23 |
| 3 | Snake | Earned 180 kg counter | 108 m | 8 | 1,282 / 21 |
| 4 | Lizard | Earned counter + 2.9 m sling | 94 m | 7 | 1,111 / 19 |

The counter cost 30 bells after run 2; sling cost 35 after run 3. Final wallet **5,332 points / 21 bells**. Four free owned-gear toggles and two resets preserved wallet, current Lizard and upcoming Snake → Turtle → Pygmy possum. Each next-volunteer action advanced the actual queue once. This small, varied-pose sample does not rank upgrades or prove balance; faster release did not automatically produce more distance.

Striped compact chipmunk, orange salamander, seven linked snake segments and green long-tail lizard remained visually distinct in loading and sampled flight. Canopy descent and ground contact silhouettes were observed. Contact counts and final frames were inspected, not every bounce on continuous video or a human reaction test.

The **latest-source** tab separately tested a tiny Pygmy possum: pickup about 19 CSS pixels above its body succeeded; nearby Unlatch stayed disabled while held, enabled only after supporting contact, and launched without scrolling away. Actual outcome 102 m/7 bounces, 1,199 points/19 bells; collected and reset to idle with Save OFF. The no-torso middle-segment fallback also has a dedicated test matching its visible ring.

`bounce-preview.html` is an explicit QA fixture, with no economy/storage access. It replays a recorded fast incoming lizard against the ground, or translates the free payload as an initial condition above the **real** canopy branch. Both produced one actual impact and paused at .132 simulated seconds, .10 s after contact. Screenshots showed trim below the contact plane and the small ring behind the actor; toggling reduced motion immediately hid the ring. This is controlled physical contact evidence, not a naturally reached canopy landing or earned game run.

The shop's readable descriptions, needed-bells amounts, ownership and free toggles supported this short experimentation session. The two observed interaction defects were the small pickup area and scrolling away to Unlatch; both addressed without another progression system. A wider human playtest is still needed to assess subjective satisfaction and long-term incentives.

## Tests, runtime and preservation

- **195 tests pass**, zero failures. New pickup tests cover CSS-size invariance, invalid/distant/flight rejection and segmented bodies; new art tests constrain trim below the plane and bound work for huge/offscreen surfaces. Existing physics, prediction, queue, rewards, save coordination and reduced-motion tests pass. `git diff --check` passes.
- Fresh **35-case numerical regression exactly matches iteration 22 excluding timing**: 32 launches, three physical seating failures, ten angular flags (plus existing branch/backward flags). Prediction/live parity unchanged. Experimental joint refinement remains unselected.
- Final **132-attempt soak**: all eleven species and earned gear, 126 releases/six seating misses/no retained payload. Its complete physical rows exactly equal iteration 21. 44m56.63s simulated / 127.43s wall; 258 worlds, zero retained at twelve GC checkpoints; post-warm heap −578,008 bytes. 132 save/reload checks and 132 stale-writer rejections still pass with doubles. Tracked engine/renderer/pickup/art hashes unchanged during the run; the later nearby UI button does not change the solver. Actual source checks and browser action check cover that final wiring.
- Engine ten-tick batch p95 **2.5973 ms**, max **8.2480 ms**, first/last quarter 2.8327/2.4324 ms. Audio lifecycle double: one context, max four voices/30 nodes, final zero. No strict frame-time bound or audible claim.
- Actual warm browser chipmunk rest sample: rolling 240-frame CPU p95/max **2.8/3.5 ms**, engine p95 2.5, draw .3; RAF p95/max 9.9/10.4 ms. Host/browser measurements are not physical-device FPS.
- No-op canvas stress draw p95 **.0619–.1126 ms**, max .3809 ms, max 1,813 calls. Extra surface trim is bounded; this excludes GPU/rasterization and device timing.
- Browser warning/error logs empty in main and latest-source tabs. AudioContext was active and cues scheduled through supported playback, but there is no supported listening/capture path here. Audible quality, actual touch-device behavior, screen-reader listening and human reaction remain **unverified**.
- Existing earned stored saves and prior QA origins/tabs were untouched. New sessions stayed memory-only. Main review tab `1219045149` retains its earned two-item wallet; latest-source tab `1219045156` retains the possum result. Older baseline tab `1219045146` also remains. Normal viewport overrides restored. Screenshots observed without export; no native unlock or blocked export retry.

## Next useful work

Human/device playtesting should judge whether the larger pickup and nearby action reduce frustration, and whether small high-speed critters and understated impacts stay satisfying. Natural canopy landings and all species' phone handling deserve broader direct play coverage. Keep the physical poor outcomes and six-item scope; use evidence before changing balance or selecting experimental stepping. Local commits only: no push or deployment.
