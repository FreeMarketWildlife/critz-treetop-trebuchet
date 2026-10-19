# Bounded physical-default regression

Reproduce the full 35-case run with `node scripts/measure-regression.js`. Focus one case with `--case default-snake-torso`; benchmark three prediction jobs with `--bench-prediction`. No account, save, core physics or repository settings are changed by this script.

## Coverage and result

The matrix includes every species with torso/root and head grips, offset loading at winding fractions 0.2 and 0.9 for light/medium/heavy representatives, each owned catalog item, and the long-beam/long-sling/heavy-counter combination. Equipment is purchased/equipped through the actual reducers in isolated memory. Snake has no torso; its root/head fallback is explicitly recorded, so those two rows repeat the same grip.

The model is the physical channel with stopped split pouch and explicit 0.5 kg panels. Every run uses actual motor winding and finite-force loading. Readiness, full dynamic-body/joint state, energy/work accounting, authored-surface crossings and canonical prediction are observed. Diagnostic thresholds are recorded in JSON and flag review candidates rather than asserting calibrated tolerances.

The final run takes **13.89 seconds of Node wall time**, including diagnostic scanning and prediction. It produces 32 launches and three seating failures, all at the low winding fraction 0.2 with the offset-loading recipe. Those failures do not establish that arbitrary manual loading is impossible.

Across all 35 cases there are no nonfinite bodies, explosive speed/energy flags, excessive rope-extension flags, or suspected authored-surface penetration candidates. All seated launches separate within five seconds. All 32 predictions match the equivalent canonical live launch exactly, preserve the live snapshot, and have zero restored-joint angle discontinuity. No source file changed during the run.

## Concrete serializer bug found and fixed by the main task

Before the complete fix, the snake head/first-segment joint is −1.0543441284 radians in the actual loaded scene, but **5.2288411788 radians** immediately after snapshot restoration: exactly +2π. The geometry initially looks equivalent, but the joint limit coordinate is wrong and the solver then applies artificial corrections.

Planck's body serialization wraps the transform angle, and its constructor also recreates the angular sweep from the wrapped rotation. Preserving the serialized angle alone therefore does not fix restoration. The main task now preserves the unwrapped angle and restores both sweep angles before constructing joints, using an explicit version-pinned adapter to Planck 1.5.1 internals. The final matrix verifies original/restored joint coordinates directly.

Evidence before the fix remains in `regression-before-angle-fix.json` and `regression-before-angle-fix-snake.json`. The incomplete serialize-only stage remains in `regression-after-serialize-angle-only.json`. The final result is `regression.json`, with a focused corrected snake run in `regression-default-snake-torso.json`.

Before versus after the complete fix: maximum angular-limit error drops from about **5.06 to 0.52 radians**, launch-branch impacts drop from **15 to 11**, and maximum work-adjusted positive energy residual drops from **1.54 J to zero**. Earlier mechanism/solver diagnoses based on corrupted snapshots remain historical evidence, not isolated proof of a mass-ratio cause.

## Remaining quality limits

Twelve cases exceed the 0.05 m revolute-anchor diagnostic threshold. The largest is about **0.155 m** in the mouse torso/head joint at the first ground impact; salamander and snake ground impacts also show material deformation. These are solver/contact limitations that remain after correct snapshot restoration.

Thirteen cases exceed the 0.08 rad angular-limit diagnostic threshold. The largest remaining error is **0.516 rad** in the tiny primate's torso/head joint at ground impact. Chipmunk head-grip loading reaches about **0.146 rad**. The now-disabled arm latch is excluded from angular-limit checks. Worst-joint body IDs, phase and time are retained in every row.

Maximum observed rope extension is about **0.020 m**, below the script's 0.05 m review threshold. Eleven launches hit the launch branch and one high-winding heavy shot goes backward. These are poor physical outcomes with those configurations/load histories, distinct from nonfinite states or prediction failure. The COM/sustained-contact observer does not imply the whole articulated load or pendulum is at rest.

The surface detector checks swept COM crossings through authored material with recent per-part impulse evidence. Zero candidates is a bounded diagnostic result, not proof against every possible tunneling case. Whole-world scans include the frame, arm, bead, panels and articulated parts.

## Budgeted prediction benchmark

The three-job benchmark runs on the same ready snapshots and reproduces synchronous release exactly without mutating live state:

| Case | Synchronous wall time | Job CPU including clone | Clone time | Maximum advance slice |
|---|---:|---:|---:|---:|
| Lizard | 66.00 ms | 57.08 ms | 0.64 ms | 2.61 ms |
| Turtle | 51.80 ms | 50.45 ms | 0.39 ms | 2.55 ms |
| Armadillo | 58.73 ms | 58.86 ms | 0.38 ms | 2.60 ms |

Jobs use 20–24 slices. This demonstrates bounded blocking work in this Node run; it is not browser FPS or a CPU-speedup claim. Order, JIT and scheduling affect wall timings. The main benefit is spreading a roughly 50–60 ms computation across small advances. Raw details are in `regression-prediction-benchmark.json`.
