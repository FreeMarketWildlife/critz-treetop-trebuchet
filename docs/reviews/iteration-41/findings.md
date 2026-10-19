# Iteration 41 — mechanism contact coverage, with adoption still deferred

The previously denied normal push was retried once after the parent supplied the later direct user authorization. It succeeded; remote main was verified at `8995a93`. No alternate route, force push, deployment, permission change or image export was used.

Ordinary game source remains unchanged from that checkpoint. The experimental loading correction remains absent/false by default. All mechanism corrections in this iteration are explicit research helpers/preloads, never imported by ordinary game entry points. This is an evaluated numerical correction, not a claim that the gameplay gap is finished.

## Cause and controlled reproduction

The mechanism-contact coverage gap is present in the existing code: flight refinement observes animal arrivals, not every fast movable frame, beam, pouch and release bead. The severe combined-snake/.75 event, however, is triggered by the experimental loading posture in this trial. With fresh identical actual winding and the original physical grip recipe, the default trial stays below 0.02293 m hinge separation over 30 s; the loading-candidate trial reaches 0.71436 m hinge separation and 0.73068 m rope excess after the entire movable trebuchet falls to ground. This does not establish that the default solver is safe for every possible human input.

The retained iteration40 incoming snapshot is already damaged: maximum initial revolute-anchor mismatch is 0.15070 m. Applying finer steps only after restoring that state cannot fairly be credited with preventing the original error. A new earlier state was recorded at elapsed 21.10167 s, with maximum initial anchor mismatch 0.00006577 m. Same-restored-state and fresh uninterrupted trials are reported separately. Restoring contact state is not exact warm-start continuation: the earlier restored original run peaks at 0.30031 m anchor error, whereas the fresh uninterrupted candidate peaks at 0.71436 m. No pose, mass, velocity or constraint was assigned to make them match.

## Physically justified research correction

`rig-policy41.js` finds moving non-animal/non-encounter mechanism bodies and predicts their real filter-compatible fixture arrivals. The complete version also respects Planck's `Body.shouldCollide` rule, excluding connected body pairs that cannot collide while retaining actual pouch/frame, rail/bead and ground contacts. It changes integration resolution only. At the standard 1/600 s outer tick, the evaluated policy uses at most eight local steps; existing animal collision refinement remains active. No velocity clamp, hidden launch force, teleport, frozen frame, eligibility relaxation or warning suppression was added.

Ground/external-only refinement is insufficient: the fresh loading-candidate trial still reaches 0.15844 m anchor separation at 4× and 0.05999 m at 8× over 30 s. Including permitted contacts within the mechanism reduces the 8× trial to 0.00761 m anchor separation and 0.02507 m rope excess; maximum angular overrun is 0.05357 rad. The 4× complete policy reaches 0.04842 m anchor separation, and a 16× research reference reaches 0.00445 m. These are finite-resolution comparisons, not calibrated real-world accuracy guarantees or monotonic convergence proof.

From the identical earlier restored state, the 8× policy reduces the 1 s peak anchor/rope errors from 0.30031/0.21213 m to 0.03231/0.00738 m. Its maximum angular overrun remains 0.08676 rad, above the existing 0.08 review threshold; it is not hidden or relabelled. At the same browser replay time of 0.10 s, actual displayed anchor separation is 0.1431 m original versus 0.0018 m corrected. The inspection camera follows the real frame COM; no body follows the camera.

All narrow trial states stay finite and cumulative work-corrected energy residual stays nonpositive. Individual inner-step residuals are not all nonpositive: the fresh corrected 30 s candidate has a positive peak of 0.64028 J-like. This is retained, and cumulative dissipation is not a proof that every contact integration conserves energy. Fresh release states are set before the mechanism policy runs, so the policy supplies no additional winding or launch work.

## Broad checks and limitations

Both 264-case matrices were repeated with all inner joint maxima explicitly retained. The first runs measured inner values but their output aggregator discarded the flight-stage maxima; those outer-statistics files remain in `default-outer/` and `candidate-outer/`. Final outputs in `default/` and `candidate/` retain inner and outer values and flags separately. `summary.json` checks that repeated outer physical results are identical, verifies exact release/winding parity against their appropriate baseline, and reports any inner rope/anchor error cases. All matrix runs use actual catalog purchases/equips in isolated memory; no user save is read or written. Body finite checks in the broad matrix are outer-step checks; the narrow rig study additionally checks every dynamic body after every inner step.

Here “default” means default **loading** plus the research mechanism policy; “candidate” means experimental loading plus the research mechanism policy. Neither means the live ordinary game was changed. The same genuine failed-seat states remain documented and tested. The fixed-world matrix does not activate encounter actors; the separate natural cohorts do.

Natural encounter cohorts retain 24/33, 11/11 and 22/22 releases, but meaningful backward cases become 9/24, 3/11 and 11/22 versus baseline 4/24, 2/11 and 10/22. Maximum moving-qualified active gaps become 4.650, 9.717 and 7.200 s versus 6.467, 3.250 and 7.243 s. Release parity is not a requirement that later corrected trajectories stay identical; these changed outcomes are reported because they matter to the user. The backward-flight and activity targets remain unmet. This is not a consistent gameplay improvement and neither correction is promoted.

## Cost and next correction

Five alternating paired Node rounds after warmup, 1 s simulation each, no diagnostic scans except integration counter: falling-rig median 41.01→231.23 ms (5.64×), retained ordinary rig impact 63.79→90.34 ms (1.42×), ordinary canopy impact 56.54→77.72 ms (1.37×). Integration counts are 600→3414, 777→1102, 733→1013. These are local Node costs, not device FPS or evidence that browser performance is acceptable.

The falling-rig selector refines 402/600 outer ticks. Its first selected fixture pair is currently touching on 16 ticks, and any fixture in that body pair touches on 61. Predicted contact properly needs lead time, so the remainder is not automatically wasted work. Pinned Planck GJK observations of the first selected pair show 234 separations above 0.15 m, 84 above 0.5 m, and a maximum of 3.517 m. Another pair may still require refinement, so rejecting the first pair alone would be wrong. The initial AABB-centre velocity proxy artifact is retained separately; its far-away sample point is not used to infer actual contact closing speeds.

Next: a selective conservative arrival test using actual fixture distance and relative contact motion, with both fixtures' angular sweeps included, checked against all possible qualifying pairs. The current research detector does not fully sum both moving fixtures' angular sweeps; that limitation and the cost must be resolved before promotion. Preserve the physical mechanism and its failures rather than freezing the rig or reducing its mass to avoid the event. Keep loading refinement disabled while evaluating this independently.

## Validation and handoff

250 tests pass, including the earlier-state physical separation reproduction, a read-only risk observation check, bounded inner-step counting, the opt-in loading regressions, unchanged ordinary loading, and both historical genuine failed-seat states. The one save-free QA tab is paused on the corrected same-state mechanism comparison at 0.10 s, reduced decorative motion, ordinary viewport. Actual-device performance, audible quality and human reactions remain unverified.

Reproduce narrow trials with `node scripts/measure-rig41.js` and `--complete`; add `--early-only` to isolate the identical earlier restored state. Full matrices use `node scripts/measure-practical41.js`, with `--loading-candidate` for the experimental load. Supply `--output-dir <new-directory>` for fresh matrix evidence; existing regression outputs are rejected. For natural cohorts explicitly preload `scripts/research-rig41.js` and supply a new output path plus the retained seeds/durations to the existing cohort scripts. `benchmark-rig41.js`, `observe-rig41.js` and `summarize-rig41.js` retain timing, cost diagnosis and cross-checks. Choose fresh output directories when repeating evidence; do not overwrite historical results.

## Final retained inner-step matrix results

| Research run | Releases /264 | Max inner rope excess | Max inner anchor separation | Inner angular flags >0.08 | Outer angular flags >0.08 | Max inner angular overrun |
|---|---:|---:|---:|---:|---:|---:|
| Default load + mechanism refinement | 262 | 0.01175 m | 0.01326 m | 118 | 58 | 0.27585 rad |
| Experimental load + mechanism refinement | 263 | 0.02231 m | 0.02040 m | 108 | 55 | 0.46150 rad |

Neither run has an inner rope/anchor crossing above the existing0.05m review levels. Both still have numerous brief inner angular excursions; the outer sampler alone understates them. The historical matrices did not retain the corresponding inner statistics, so these counts cannot be presented as a before/after improvement. They are a real remaining numerical limitation, not clean solver certification. Both retain zero outer nonfinite flags and zero positive cumulative work-corrected energy residual. High-spin outer flags are2 and1. All264 full release records (including misses), all264 winding-work values and all264 repeated outer diagnostic results match the appropriate reference exactly. Source hashes stayed unchanged during each final run.

After the final runs, the runner received an output-directory option and overwrite guard only; the physical policy and diagnostic calculations did not change. A selected-case reproduction verifies the guarded runner. All raw original, first outer-only and final inner-retained evidence remains available.
