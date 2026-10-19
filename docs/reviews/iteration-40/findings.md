# Iteration 40 — loading accuracy improves, broader adoption deferred

Baseline `364d7ea`. Ordinary gameplay remains on that reviewed integration policy. The new `loadingConstraintSubsteps` option is false/absent by default. Research scripts explicitly enable it; no shop, live input, save, force, mass, collider, readiness rule, pose or launch boost changed. The historical two seating failures remain documented and their frozen-state tests still pass.

## Reproduction and diagnosis

The earlier “17 loading flags” counted cases whose **worst whole-case** angular error occurred during loading. Eighteen cases had any loading angular error above 0.08 rad: beam-long snake/.75 had a worse flight error that masked its loading event. The table below includes all eighteen. Each baseline excursion lasted one outer 1/600 s tick; these are real numerical stop overruns, not modeled joint compliance. The threshold is a diagnostic review level, not calibrated realism.

All variants start from freshly integrated identical winding histories, asserted by SHA-256 of the full post-winding snapshot. The baseline world-space grab/force-target tape and waiting duration are replayed unchanged for each variant. Every inner integration is inspected, so substeps cannot hide an intermediate error. Stock chipmunk/.6 reproduces 0.134623 rad at torso/rear leg; combined chipmunk/.75 reproduces 0.166686 rad at torso/front leg. Browser review shows actual articulated grip, gravity seating and pouch contact with no assist work. These short excursions had a previously estimated small instantaneous silhouette bound, but that is neither a measured pixel displacement nor evidence that changed downstream trajectories are imperceptible.

| Case | Worst loading joint | Baseline overrun rad | Longest >0.08 ms |
|---|---|---:|---:|
| counterweight-heavy-chipmunk-0.45 | part:torso->part:tail | 0.086119 | 1.667 |
| sling-long-chipmunk-0.45 | part:torso->part:rear-leg | 0.080743 | 1.667 |
| frame-heavy-chipmunk-0.45 | part:torso->part:tail | 0.084996 | 1.667 |
| stock-chipmunk-0.6 | part:torso->part:rear-leg | 0.134623 | 1.667 |
| counterweight-heavy-chipmunk-0.6 | part:torso->part:rear-leg | 0.138868 | 1.667 |
| beam-long-salamander-0.6 | part:torso->part:front-leg | 0.104690 | 1.667 |
| beam-light-chipmunk-0.6 | part:torso->part:rear-leg | 0.134845 | 1.667 |
| frame-heavy-chipmunk-0.6 | part:torso->part:rear-leg | 0.143222 | 1.667 |
| frame-grip-chipmunk-0.6 | part:torso->part:rear-leg | 0.135028 | 1.667 |
| combined-snake-0.6 | part:head->part:segment-1 | 0.087824 | 1.667 |
| counterweight-heavy-snake-0.75 | part:segment-5->part:segment-6 | 0.080264 | 1.667 |
| beam-long-salamander-0.75 | part:torso->part:rear-leg | 0.085954 | 1.667 |
| beam-long-mouse-0.75 | part:torso->part:rear-leg | 0.091853 | 1.667 |
| beam-long-snake-0.75 | part:head->part:segment-1 | 0.092511 | 1.667 |
| sling-long-frog-0.75 | part:rear-thigh->part:rear-shin | 0.080770 | 1.667 |
| combined-snake-0.75 | part:segment-3->part:segment-4 | 0.115770 | 1.667 |
| combined-chipmunk-0.75 | part:torso->part:front-leg | 0.166686 | 1.667 |
| combined-small-marsupial-0.75 | part:torso->part:front-leg | 0.083275 | 1.667 |

## Evaluated correction

External-contact-only refinement leaves 4/18 flagged at 2×, 2/18 at 4×, and 3/18 at 8×. Doubling solver iterations leaves 11/18. Those are not monotonic accuracy/success guarantees. Fast articulated stop arrivals also occur away from external contact. A read-only predictor checks real enabled revolute limits and speed, plus filter-compatible fixture proximity with linear/angular sweep. Two loading integrations at those moments reduce the eighteen-case maximum to 0.054278 rad, with zero >0.08 cases; four/eight give maxima 0.035586/0.035788 with higher resolution. The minimal two-step policy was evaluated broadly, rather than selected by launch distance. Real force laws, limits and contact constraints are unchanged.

Full candidate matrix: 264 actual catalog/species/winding cases, all inner loading states checked, maximum 0.064688 rad and zero loading excursions above 0.08. 263 releases versus baseline 262; the former frame-heavy snake/.75 recipe now seats physically. This does not erase the historical genuine failed snake state or make its readiness rejection wrong. Combined frog/.75 remains an actual miss. All 263 candidate prediction/live releases match exactly; no nonfinite state, suspected missing surface contact, or positive cumulative work-corrected energy residual was flagged. These checks do not prove universal stability or prohibit individual step energy errors.

## Why it is not enabled in ordinary play

The changed physically loaded posture changes real energy transfer. Backward/vertical releases rise 18→28, downward 10→16, launch-branch impacts 60→57, and whole-run angular-flag cases 51→64. Three high-spin cases remain. More seriously, combined snake/.75 exposes a mechanism-only ground collision after the entire movable trebuchet falls from its branch. At elapsed 21.21 s the falling cradle has 0.730679 m rope stretch and 0.714363 m stopped-hinge separation; anchor error lasts 35 ms. Before impact the real frame is around (−24.90,3.12), arm (−22.25,6.39), cradle (−28.56,2.55), right panel (−29.52,2.34); cradle is descending about 80.3 m/s. This is a substantial constraint defect, not an acceptable diagnostic threshold crossing.

The existing flight resolution watches the animal's fast contacts. It misses a falling mechanism's independent ground arrival when the animal has already landed far away. Browser review used the actual frame COM to locate this rig/ground geometry; no world body moved to the inspection camera. The retained incoming snapshot is real recorded state, but reconstructing it is not an assertion of exact uninterrupted warm-start continuation. Next: reproduce the mechanism's contact island and refine connected mechanism constraints for its own real collisions, without freezing the frame, removing mass, clamping velocity, fixing poses, or discarding the failed trial.

## Energy, outcomes and cost

`energy-264.json` has 528 fresh baseline/candidate trials. All 264 post-winding snapshot hashes and motor-work values are identical; assist work is zero. Candidate/baseline release centres exactly match their respective 264-case diagnostic matrices (candidate maximum component difference zero). Across matched cases, loading mechanical-energy delta spans −9.969 to +19.720 J-like; median +0.0101. External hand-work delta spans −35.864 to +26.204, median −0.1655. Release payload kinetic-energy median is 129.731→130.301, maximum 366.534→513.437; matched kinetic delta spans −202.316 to +263.870, median +0.442. Full world release-energy delta spans −405.324 to +428.790. These are intentional changed physical states, not a promise of a free boost or equal trajectories. The fixed-input eighteen-case study separately isolates changes from adaptive target following and wait duration.

Five alternating paired clean Node loading rounds after warmup, no diagnostic scans: stock chipmunk median 170.03→204.35 ms (1.20×), combined chipmunk 181.67→240.68 ms (1.32×). Their inner loading integration counts rise 3017→3585 and 3060→4163. Winding/flight are outside the timed window. These are Node elapsed costs, not actual-device FPS.

Existing full 60 s natural encounter cohorts rerun with candidate: original 33 retains 24 releases, matched medium holdout retains 11/11, expanded long-sling retains 22/22. Meaningful backward episodes change 4/24→8/24, 2/11→4/11, 10/22→7/22. Maximum moving-qualified active gaps change 6.467→2.033 s, 3.250→1.633 s, 7.243→4.245 s. Both original and candidate rows remain available; targets are still unmet, and ordinary gameplay was not switched to the candidate.

## Validation and reproduction

249 tests pass, including two recorded-input inner-step correction regressions and an explicit default-policy regression preserving the exact baseline ordinary loading overrun. All pre-existing tests, including both historical failed-seat states, remain passing without changing their expectations. One save-free owned browser tab is paused on the falling rig, reduced decorative motion, ordinary viewport. No image export was attempted, no existing saves were accessed, no duplicate servers started. Actual-device performance, audio listening and human reaction testing remain unverified.

Baseline research setup: make an unchanged git archive of `364d7ea` outside the repository, link the existing pinned `node_modules`, and set `CRITZ_BASELINE_MODULE` to that archive's `src/hook-experiment.js`. `measure-loading40.js --all-loading --joint`, `measure-energy40.js`, and `benchmark-loading40.js` require that explicit baseline. `measure-practical40.js` explicitly opts in. For the older cohort runners use `node --import ./scripts/research-loading40.js scripts/measure-natural29.js <new-output-path>` and the same saved seed/duration options; similarly for `measure-expanded33.js`. Always choose new output paths. Raw run fields named “current” or “after” mean this experimental candidate. Their source hashes describe the evaluated candidate before it was placed behind the disabled-by-default flag; numerical evidence has not been rewritten to imply final default behaviour.

## Synchronization blocker

Implementation committed locally as `0c2637b`. Automatic approval review denied `git push origin main` to the existing GitHub origin, citing the original no-push restriction and no verified later trusted authorization. The command did not execute. No retry, indirect route, permission change or workaround attempted. A new explicit authorization/review resolution is required before retry. All work and evidence remain local.
