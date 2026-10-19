# Bounded collision substeps, seating diagnosis and recovery

## Production rule and CPU budget

The UI now opts into `collisionSubsteps:true`; the parameter is serialized and copied unchanged into predictions. Historical constructor experiments retain their prior behavior unless explicitly enabled. Loading, winding and release use the existing 600 Hz path. During flight, a fast part's fixture bounds expanded by a velocity margin are tested against authored surfaces, bumpers and moving encounters. Near those obstacles the outer 600 Hz tick integrates twice at 1200 Hz. Slow resting bodies and open air retain one integration. Larger research ticks are capped at four internal integrations. No positions, velocities, mass or joint limits are corrected. Force/work accounting runs for each actual integration.

The offline budget is **4 ms per 60 Hz physics batch**, leaving room within a 16.7 ms frame for rendering/input. It is a development target, not a mobile guarantee. `node scripts/measure-impact.js` profiles groups of outer steps representing 1/60 second, including diagnostic scans, across identical incoming snapshots. In the three production-versus-adaptive pairs, p95 batch costs are 0.37–0.62 ms before and 0.50–0.78 ms after; maximum adaptive cost is 0.935 ms, with no 4 ms overrun. Each sample covers one second and 60 batches. JIT/order/platform noise matters; rendering, browser scheduling and mobile hardware are excluded.

Adaptive integration counts are 652, 621 and 742 versus 600 fixed steps (mouse, salamander, tiny primate), rather than 1200 for a globally doubled rate. Their maximum part-joint anchor errors fall from 0.117/0.154/0.024 m to 0.061/0.068/0.00075 m. Angular excess falls from 0.783/0.555/0.516 rad to 0.262/0.062/0.108 rad. Every case remains finite with no positive work-adjusted energy residual. Constraint deformation is reduced, not eliminated. See `impact.json`.

## All-species regression and hint scheduling

`node scripts/measure-regression.js` now explicitly tests the UI's adaptive setting and writes iteration-9 evidence. The 35 cases yield 32 launches and three low-winding seating failures. All 32 predictions agree exactly with equivalent canonical live launches; live state is unchanged and restored joint angles remain exact. No nonfinite, excessive-rope, explosive-energy or suspected surface-penetration candidates occur. These bounded checks do not prove absence of tunneling.

Compared with iteration 7, anchor flags fall 12→8 and worst anchor error 0.155→0.093 m; angular flags fall 13→11 and worst angular excess 0.516→0.448 rad. Eleven shots still return into the launch branch. Release behavior is unchanged because refinement begins only after release. Full diagnostic wall time is 14.55 s versus 13.89 s previously; this is not an isolated CPU benchmark.

`--bench-prediction` preserves exact release parity across lizard/turtle/armadillo. Total prediction CPU is 53.1–59.6 ms, spread over advances with observed maxima 2.58–2.60 ms. The scheduler checks its 2.5 ms target between bounded outer steps; one step can exceed that target. See `regression-prediction-benchmark.json`. Full suite: **126 passing tests**, including adaptive snapshots, all species, actual repeated purchase loops, audio and energy accounting.

## Why the three low-winding recipes fail

`node scripts/measure-seating.js` repeats actual winding at fraction 0.2, then tries three horizontal offsets and two holding heights for each light/medium/heavy rig from identical per-species canonical snapshots. It observes all contacts for 3.5 seconds after dropping. None of 18 variants remains seated at the end; some lose the release bead, others lose the critter while hardware remains. This is poor retention under these histories, not evidence that the configuration is geometrically invalid or that the user must move faster.

The original offset +0.2 / height +0.85 recipe has no 0.1-second quiet contact window for any of the three. But four alternatives provide 0.192–0.338 seconds of quiet contact: lizard/turtle at +0.2/+0.45 and armadillo at 0/+0.45 or 0/+0.85. Launching a canonical snapshot at the first 0.1-second quiet window succeeds in all four. Thus these are legitimate, difficult transient loads; the original waits miss available opportunities. Do not solve them by snapping or insisting on a longer settling timer. Exact durations, finite hand work and early release results are in `seating.json`.

The UI now explains the short seating window when low winding has actual ready contact, and recommends a higher winding target or a different placement after the load slips. Existing near-but-not-contacting and capped-grip guidance remain separate. Unlatch readiness still depends on actual contact plus the existing COM envelope; no hidden launch timing or automatic rescue.

## Understandable failed-shot recovery

Impact events now identify authored surfaces from actual contact points. A launch-branch return shows a specific explanation and directs the player to retry with a different load/hardware. During any released shot the lower reset button says **Bank & retry setup**. Reset banks the shot idempotently before rebuilding, preserving bells/points for a poor throw. Next volunteer already banks and consumes the queue normally. No additional reward formula or currency conversion.

Browser visual checks observed portrait 390×844 and landscape 844×390. The landscape 640×320 canvas and lower controls fit together after scrolling to the stage. No browser warnings/errors were captured. Viewport override was reset and the local page left open. A new complete manual launch/shop loop and audible QA remain unverified. No blocked export, push or deployment was attempted.
