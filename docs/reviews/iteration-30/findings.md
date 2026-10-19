# Iteration30 — trace reversals, change real contact faces, focus sky spacing

## Definitions and unchanged sample

The original cohort remains33 stock attempts:11 species × winding fractions.2/.6/.9, seeds29000+case,60seconds after actual release, no steering. It still has24 releases and9 seating misses. Every attempt outcome and every complete release object, including all part velocities, exactly equals iteration29. The separate39000+case holdout contains all11 medium species for60seconds; its11 complete release records also exactly equal the matched old-circle baseline.

The ordinary reference is the balanced11-species medium-winding stock cohort at fraction.6. It includes the heavy armadillo and rare squirrel; this is species coverage, not a frequency-weighted estimate of the live queue. Low/high fractions are valid exploratory stock configurations, not silently discarded or declared broken. Counts below use released-run denominators. The backward definition remains COM vx<−0.5m/s continuously≥0.5seconds and≥1m leftward. Small reversals remain in the existing actual-displacement tracker. The under5% target remains unmet.

## What caused the original8 reversals

A read-only post-solve trace includes impulses too small to become scored impacts, preserving the preceding50ms. First threshold crossings identify:

|Case|Reference|Physical source|
|---|---|---|
|1 Salamander .2|Exploratory|Pouch recoil near release; later a waxleaf contact also reverses it|
|11 Lizard .6|Ordinary|Normal impulse from fixed circle at32,255|
|14 Turtle .6|Ordinary|Waxleaf normal impulse|
|15 Snake .6|Ordinary|Normal/tangent impulses from fixed circle at32,255|
|18 Armadillo .6|Ordinary|Ground friction transfers angular motion into leftward COM motion|
|23 Salamander .9|Exploratory|Fixed circle at230,18|
|29 Armadillo .9|Exploratory|Pouch contact after a weak release; it later rests on the launch branch|
|31 Marmoset .9|Exploratory|Ground friction during rebound|

Thus the four ordinary first-family cases began at later world contacts, rather than negative launch velocity. Two exploratory cases involve the mechanism after observed physical separation. They remain failures in the results; phase/release timing was not changed to hide them.

The normal/tangent reports are source diagnostics, not a fully reconciled momentum ledger: TOI/joint cases have nonzero residuals between post-solve reports and measured COM momentum change. Ground cases reconcile at the sampled onset. No solver tuning was justified from those residuals alone. See reversal-diagnosis.json.

## Rejected experiments and accepted geometry

Isolated archived copies tested eleven medium cases for30seconds each. Softer circles(restitution.25), lower ground friction(.008 versus the existing.12), and the combination each still had4/11 reversals; some failures moved to other contacts. None of those material changes ships. study-manifest.json retains reproducible material patches and source-hash verification.

A descending wooden face at each existing fixed obstacle center reduced the same medium cohort to2/11. The seven centers remain32/255,48/165,75/260,110/215,145/165,180/90,230/18. Each actual polygon fits inside its previous circular radius envelope. The face has slope−.65, half-width.8×radius and.08m thickness, friction.08 and passive restitution.3 matching the wooden contact role. This is a physical shape/material recipe, not merely a graphic over a circle. The surface normal redirects downward momentum forward; total translational+rotational energy decreases in the isolated contact test. No velocity clamp, steering change or launch impulse was added.

Rendering and fixed-obstacle advice now read actual saved fixtures. New tagged polygons draw the actual wooden face; historical saved circles still draw and describe circles. Clone/geometry tests cover both. The physical regression observer now recognizes tagged authored faces rather than misclassifying them as an unknown loading shelf; the test still requires an identified authored obstacle, positive launch and passive energy.

## Natural validation and density tradeoffs

Geometry-only60second validation produced2/11 ordinary reversals on the original seeds, versus4/11 before. The matched holdout produced4/11 versus8/11 before. Softer contact materials alone did not produce that improvement.

The first density candidate narrowed horizontal cells to10m in every biome. In the30second medium study it shortened the squirrel/armadillo gap examples to.80/.95s but increased reversals from2/11 to3/11. It was rejected. The targeted candidate narrows only open-sky horizontal spacing from18m to10m, retaining8m vertical rows, .5second slots, all arrival/fixture-clearance rules and the8-body cap. Tree, canopy and floor spacing remain18m. Seeded recipes are immutable; activated bodies remain dynamic. The intentional sky schedule change has a reviewed deterministic baseline.

Final60second results:

|Cohort|Before|Final|
|---|---:|---:|
|Original medium reference,11 releases|4/11|2/11|
|Separate medium holdout,11 releases|8/11|4/11|
|Original full low/medium/high cohort,24 releases|8/24|6/24|

The combined medium references therefore have6/22 reversals, versus12/22 before. This is27.3%, still far from5%, and two balanced seed families are not a population estimate. Meaningful leftward distance over the original full cohort changed from272.37m to86.36m; holdout changed from298.27m to60.84m. Backward travel remains physically possible and tracked. Original low/high cases, all seating misses and introduced/moved failures remain in the JSON.

The remaining original medium failures are the turtle/waxleaf and armadillo/ground interactions. The holdout retains four cases; those were not all subjected to the detailed50ms source trace, so nearest preceding scored events are context, not complete causal proof. The exploratory high salamander now has a short later ground reversal rather than the old large circular-bumper reversal. Do not claim all unwanted reversals are solved.

## What the long gaps meant

The original iteration29 activity definition is retained:60Hz projected enemy conservative-radius intersection below the72px HUD with relative speed>0.5m/s, or a scored impulse in the previous1/60second. Active end remains the last COM speed>0.15m/s inside60seconds. This can include long stationary plateaus before a later enemy wakes the body. Full60second/rest-inclusive gaps are still retained.

Additional unchanged-baseline traces use actual fixture AABBs at.1second observation intervals. The8.82s turtle gap had median speed effectively0, maximum.0055m/s, and visible enemies in88/88 samples with8 active bodies. The3.88s possum and3.22s frog intervals were also effectively stationary with visible enemies in every sample. These are not empty-air gaps; they are not relabelled as successful passing activity either. The armadillo's2.30s fast airborne gap was real: median COM speed30.09m/s and zero visible enemies. This justified a sky-specific placement study instead of simply adding ground actors.

Final portrait median maximum active gap is1.292s, with worst8.817s under the retained definition. Landscape median is.892s, worst5.383s. In the original medium examples, squirrel and armadillo maximum gaps changed from1.167/2.300s with geometry alone to about1.000/1.983s with sky-only spacing. The holdout armadillo improves4.150→3.217s; holdout squirrel remains2.633s. The at-most1second target remains unmet. The fixture traces, conservative-radius original metric, stationary/passing distinction and sampling uncertainty are all explicit; none is a universal human-perception claim.

## Browser, tests and limits

One existing save-free QA tab was reused; no new pile of tabs was created. At390×844 the matched natural snake approach showed original-circle vx−1.99 near0.50s and wooden-face vx+16.54 near0.51s, with exact horizontal camera centering. The two saved approach snapshots have identical payload dictionaries, release and elapsed time. The comparison viewer deliberately limits these two cases to the matched first.8seconds, before either reaches the changed sky pool. A separate current natural squirrel/bird replay verified final sky density and real contact/post state at game size. No body poses or forces were reset after release. Preparation is numerical force-driven loading, not new manual native loading.

223 tests pass, including four new fixed-obstacle tests for centers/envelopes, passive energy including rotation, actual saved geometry/clone state and old-circle compatibility. Existing camera, physics, prediction, cooldown, rewards and save checks pass. The complete natural and holdout physical source hashes remained stable. Temporary viewport overrides were reset, reduced motion was checked and browser warnings/errors were empty. One paused QA tab remains. Earned saves, recovery copy and user/client tabs were untouched; no deployment, install, permission change or blocked export retry occurred.

Next work should trace remaining ground/skid reversals and test physically justified spin/contact response. Global slick-ground tuning was already unsuccessful; do not reintroduce it as an unmeasured fix. Preserve original denominators, all low/high failures, actual leftward distance and X-centered backward tracking. Device performance, audible quality, native human loading and reaction fairness remain unverified.
