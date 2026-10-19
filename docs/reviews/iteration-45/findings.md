# Iteration45 — full catalog and prediction validation

Research only. Ordinary gameplay source and earned saves are unchanged. Public sync remains paused by parent direction; no push retry, process-inventory workaround, new server or blocked image export was attempted.

## Scope

The reserve-one contact policy is exercised on the entire eight-equipment-set, eleven-species, three-winding-fraction catalog in both original and experimental loading modes. The physical input recipe, canonical launch reconstruction, integration cap and diagnostic thresholds match iteration43. Inner joint measurements observe every actual integration before the research dispatcher. Full release objects and winding work are compared exactly against iteration43. Failed seating, budget exhaustion, angular and speed flags remain visible.

Prediction validation separately physically prepares the same complete catalog in both modes. Explicit research-only clone overrides install the same disabled reserve-one kernel in synchronous and budgeted production prediction algorithms. Every common outer snapshot SHA and full release record is compared to canonical live continuation. The two existing prediction algorithms retain their distinct clipping rules; equal final point-list length is not assumed. Preparation rejections are retained and cannot count as prediction successes. No prediction algorithm or app kernel is edited.

## Targeted query experiment

The only narrower activation tested skips actual-shape contact queries for fixture/child pairs already handled during the current outer tick. This preserves the contact decision by construction; it does not select favorable species, equipment, phases or encounters. Stable fixture/child identities handle pooled Contact reuse. Eight retained actual impact states are continued for one second under both implementations, comparing every actual integration duration and full snapshot SHA. All are exact. This verifies those eight continuations, not an independent optimized full-catalog run.

Clean runtime measurements followed completion of all catalog and prediction jobs. Reconstruction occurs outside timing, paired initial states and alternating policy order are used, and the only timed observer counts actual integrations. Node CPU timings are not device FPS.

## Default-catalog result

All264 default cases completed:262 releases and the same2 seating misses. All full release records are unchanged. Inner angular flags20→18, with both post-load flags removed and all18 loading flags preserved. Maximum post-load angular error0.0792923936rad, actual work cap16, zero contact-budget misses, zero nonfinite bodies and zero positive outer cumulative energy residual. Maximum inner anchor error0.01182124m, rope stretch0.01174944m.

Twenty default cases exhaust the angular budget versus sixteen previously. Twelve newly exhaust it, while eight prior exhaustion cases no longer do. A bounded fallback is not silently reported as full resolution, even when its measured error remains below threshold. Full case lists, the second loading mode and prediction results are recorded in summary.json.

## Final results and regression

Both264-case runs completed with no source changes during either run. Full release records and winding work are exact against iteration43 for all528 attempts. Original loading retains262 releases/2 seating misses; experimental loading retains263/1. The original mode removes both prior post-load angular flags and retains18 loading flags. Experimental mode removes all three old angular flags but introduces one NEW inner angular failure: beam-light-lizard-0.6 at0.1640623475rad. Therefore the policy is not ready to enable.

Fresh physical reconstruction reproduces this new peak exactly, at elapsed16.7979166667s with an actual203.9449μs integration. The torso/front-leg joint crosses during the same outer tick as one angular-budget fallback. No current approaching contact meets the detector threshold immediately before that interval. The worst outer observation is only0.0414447rad; relying on outer samples would hide the inner failure. Before/after diagnostic snapshots and contact audit are retained in new-lizard-regression.json. These snapshots omit solver warm caches and are not represented as exact restore points.

Maximum actual integrations remain16 in both full matrices. Angular-budget exhaustion occurs in20 default and16 experimental cases; all identities/counts are listed in summary.json. No contact-budget misses occur. Maximum inner anchor error0.0118212/0.0125247m and rope stretch0.0117494/0.0223086m remain below0.05m. Outer nonfinite and positive cumulative energy residual remain zero; this does not establish per-inner-step energy monotonicity. High-spin diagnostic flags remain3/4 cases, with maxima1097.21/1032.31rad/s; all identities are preserved. No suspected surface crossings are flagged by this protocol.

## Full prediction result

All528 catalog/loading-mode preparations were attempted:525 successful preparations match synchronous prediction, budgeted prediction and canonical live continuation exactly at every common outer snapshot and full release object. The remaining3 are the actual seating failures, retained as preparation rejections. All loaded source states remain unchanged; actual integration cap16 holds. This validates a shared research kernel through the existing algorithms, not production adoption or natural encounter prediction.

## Conservative motion gate and clean cost

An additional gate bounds closing speed by relative COM speed plus each body's absolute angular speed times its fixture's radius about COM. Proxy vertices and shape radius bound each witness; midpoint displacement along the query normal contributes zero normal rotational velocity. A1e-7m allowance covers coincident-witness ambiguity; unknown geometry conservatively keeps the exact query. No fixture, speed threshold or integration count changes. Two thousand deterministic translated, offset, rotated convex fixture pairs omit no actual query trigger, including a separate long rotating fixture regression. All eight retained impact continuations remain bit-exact at every inner snapshot and duration under both gates.

Five clean alternating rounds after warmup, identical restored states, no concurrent catalog/prediction jobs. Median Node milliseconds per simulated second, original / prior boundary / contact / repeated-pair skip / conservative motion gate:

| Workload | Original | Prior boundary | Contact | Pair skip | Motion gate |
|---|---:|---:|---:|---:|---:|
| Falling rig |40.14|192.81|238.97|239.69|204.99|
| Ordinary rig impact |63.34|151.46|167.71|167.51|167.10|
| Canopy impact |55.93|64.95|66.12|66.17|66.43|

Repeated-pair skipping alone gives no useful saving. The motion gate saves14.2% of contact-policy cost in the falling-rig fixture (61,089 geometry queries reduced to zero, same2,925 integrations), but no meaningful rig/canopy saving. Total cost there still exceeds unrefined original by5.1x. This optimization has eight-scene exact trajectory coverage, NOT a second optimized full-catalog run; do not claim that validation. No browser/device FPS, new natural encounter cohort, audio or human reaction testing was performed.

## Checkpoint

All278 Node tests pass. Ordinary source and earned saves are untouched. No new server/tab, process-inventory retry, image export, push, deployment, install or permission change occurred. Public sync remains pending the parent's authorization clarification. All known validation jobs completed.

Keep every refinement disabled. Next work should diagnose scheduling around the new lizard peak and budget-exhaustion cases within the existing sixteen-integration cap, then repeat broad validation before considering promotion. Faster queries do not resolve this fidelity regression.
