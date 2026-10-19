# Iteration 18: angular warning severity review

All eleven raw angular warning rows remain recorded. The retained diagnostics show brief sampled limit violations, not a prolonged stretched-body state like the former marmoset construction failure. Every flagged row launched; every final diagnostic endpoint is below0.08rad. No nonfinite or positive energy residual is recorded. These facts do not establish correct contact geometry or make a warning harmless.

| Case | Peak joint / phase | Excess rad | Bad outer samples | Tip offset42px/m | Whole-run max anchor |
|---|---|---:|---:|---:|---|
| default-turtle-torso | torso/head / flight | 0.0983 | 1 | 1.01px | 4.32mm cradle/right-panel |
| default-snake-torso | head/segment-1 / ground_recovery | 0.1069 | 2 | 1.01px | 8.03mm cradle/right-panel |
| default-lizard-head | torso/front-leg / impact_recovery | 0.1706 | 1 | 1.15px | 14.14mm cradle/right-panel |
| default-snake-head | head/segment-1 / ground_recovery | 0.1069 | 2 | 1.01px | 8.03mm cradle/right-panel |
| default-chipmunk-head | torso/rear-leg / loading | 0.1346 | 1 | 0.95px | 19.56mm cradle/right-panel |
| default-frog-head | torso/rear-thigh / loading | 0.0850 | 1 | 0.95px | 18.86mm cradle/right-panel |
| winding-armadillo-0.9 | torso/rear-leg / impact_recovery | 0.1691 | 1 | 1.61px | 19.69mm torso/tail |
| owned-counterweight-heavy | torso/rear-leg / impact_recovery | 0.1389 | 1 | 0.94px | 13.61mm cradle/right-panel |
| owned-beam-long | torso/rear-leg / flight | 0.0909 | 1 | 0.61px | 1.61mm cradle/right-panel |
| owned-beam-light | torso/rear-leg / impact_recovery | 0.1749 | 1 | 1.18px | 17.24mm cradle/right-panel |
| owned-long-beam-sling-heavy-counter | torso/rear-leg / loading | 0.0930 | 1 | 0.63px | 16.55mm cradle/right-panel |

The two snake rows follow the same fallback head grip and identical trajectory; they represent one distinct impact pattern. Each has two separated bad samples. Every other row has one bad sample. Longest recorded consecutive occupancy is1/600s (1.67ms) in every case. This is sampled occupancy, not an exact continuous violation duration: diagnostics run at600Hz outside internal substeps, and phase aggregation does not retain each joint’s complete trace. Shorter internal peaks or multiple crossings between samples can be missed.

## What is visually material

Angular-only tip offset is estimated using the actual farthest extent of bodyB around its joint anchor and chord2Rsin(excess/2). It holds bodyA/anchor fixed; it is not a measured screenshot displacement, joint translation or whole-rig error. At the actual42px/m flight scale, the largest estimate is armadillo rear leg1.61px, then light-beam lizard1.18px and head-loaded lizard1.15px. Numerical ranking alone would put light beam first; geometric size puts armadillo first.

The three loading warnings can appear in the actual100px/m setup close-up: frog rear thigh2.27px, chipmunk rear leg2.25px, combined-equipment lizard1.50px. The100px/m figures for flight cases in the JSON are comparison numbers only: the renderer does not use that close-up during flight. No browser visual claim is made by this review.

Whole-run anchor maxima are independent maxima at different joints/times. Ten rows’ largest anchor gap belongs to the hardware cradle/right-panel hinge, not the flagged volunteer joint. Armadillo’s largest0.01969m gap is torso/tail. The aggregate cannot establish the flagged limb’s simultaneous anchor gap. The hardware gap can matter during launch, although the final endpoint recovers; retain it as a separate observable.

## Priorities and remaining limits

1. Inspect the three original incoming fixtures already being captured by the main worker (lizard head, light beam, high-winding armadillo) at internal substeps, with simultaneous body joint gaps and contact separations. Armadillo has the largest estimated game-scale limb displacement and an independent tail anchor gap; its backward/vertical outcome also needs distinct usability classification.
2. Review frog/chipmunk head-loading contacts if an actual close-up shows broken motion, because their peaks occur where the volunteer is magnified. All three loading endpoints recover far below threshold before launch in the retained recipes.
3. Retain snake and turtle diagnostics. Turtle’s last flight sample is the warning itself, but its following0.5s impact-recovery endpoint has zero angular excess; do not call that unrecovered based only on the flight endpoint. Snake’s final ground-recovery excess is0.02159rad, below threshold.

No row in this retained dataset establishes prolonged deformation, nonrelease, a nonfinite state or an unrecoverable volunteer. The dataset does not retain penetration geometry at each angular maximum, so impossible collisions cannot be excluded from it. Remaining solver errors are real; a targeted fix should show lower geometry error from the identical incoming state without new penetration, extra energy, launch changes or excessive CPU. Do not increase work globally solely to erase the0.08rad diagnostic flag.

Evidence: angular-severity.json and scripts/measure-angular-severity.js; source species hash matches the original regression. No production changes, new incoming captures, browser work or commits.
