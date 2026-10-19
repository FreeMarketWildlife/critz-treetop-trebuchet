# Iteration 43 — real stop-crossing correction, still research-only

The authorized normal push retry succeeded. Remote main was verified at `4722fba` before this work. **No ordinary-play improvement is claimed in this checkpoint:** game source is unchanged; loading and all contact/boundary research corrections remain disabled in ordinary play. The narrow boundary correction now works on real retained states and substantially reduces errors in uninterrupted/broad studies, but budget fallbacks and five contact-generated peaks remain. Saved progress, historical baselines, failed trials and the previously blocked image-export restriction are preserved.

## Exact live capture before the defect

Six full worlds were captured immediately before the retained iteration42 live integration peaks. Fresh real winding, finite-force grip and canonical launch histories were replayed, asserting loaded-state hashes, complete release records and the resulting live peaks. `crossings.json` indexes the before and live-after snapshots. No body was reposed to make the case reproducible.

All local variants begin from identical canonical reconstructions of each recorded world; their complete initial hashes and target joint kinematics match. Five restored uniform controls reproduce the live peak exactly. The mouse control differs: live0.064611rad versus restored0.041848rad. Reconstruction does not retain every warm-start detail, and this is not presented as an exact uninterrupted continuation. The separate fresh-history live studies avoid that assumption.

## A narrowly tested forward-integration correction

`boundary-policy43.js` predicts enabled angular-stop arrivals using public joint angle/speed/limits. It advances the unchanged world to a point just across the real boundary, within a fraction of Planck's existing angular slop, then lets the ordinary solver enforce the stop. It never edits a joint limit, impulse, private solver flag, mass, body pose or velocity. Total simulated time is identical. Already active stops remain the solver's responsibility; they are not snapped into bounds.

In the real retained frog/.6 interval, one uniform208.333µs integration gives0.110356rad overrun;48position iterations give the same result. Two boundary-aligned integrations reduce it to0.002399rad. All actual inner joints, body finite states, mechanical energy and recorded work are inspected, followed by the same96integrations at1/4800s (20ms) for every variant. All48initial local trials remain finite and all sampled step/cumulative work-corrected energy changes are nonpositive.

An arbitrarily tiny margin is not a safe optimization: in the coupled snake/.45 case it consumes all eight local slots and still leaves0.085464rad overrun. A margin tied to the existing angular tolerance avoids this asymptotic arrival problem. Budget exhaustion is explicitly recorded, never hidden. The same-duration uniform4/8/16/32/64references remain available; these are local accuracy comparisons, not a full-world converged solution or proposed nested game work budgets.

## Coupled motion matters, not just the selected angle

The simple two-integration frog repair initially leaves a20.705mm maximum dynamic-body position difference against the64-step local reference after the common20ms continuation. Splitting the post-stop remainder into two resolution steps reduces that difference to0.887mm with three total local integrations. A short real lead-in integration before forecasting the boundary reduces it to0.208mm with four integrations. All of these preserve the physical model and time; no corrective body assignment is made.

This is not universal reference equivalence. For snake/.75 the lead-in variant still differs by7.782mm after20ms, versus4.826mm for the8-step uniform reference. Already active-stop controls are deliberately unchanged by arrival-only scheduling. A smaller margin helps some cases and worsens others; no species-specific numerical tuning was added. Energy loss is retained in the traces: for the retained frog the simple boundary step loses about400.308J-like locally, versus400.268/400.299for8/64uniform references. After the common continuation the lead-in variant differs from the64-step reference by−0.141J-like. Passivity alone is not an accuracy proof.

The browser comparison shows actual fixture shapes and hinge anchors. The retained frog's original uniform interval ends at1.010356rad; lead-in/boundary/post-stop resolution ends at0.904071rad against its0.900limit, using four actual integrations with no budget fallback and zero assist work. The page is save-free and is a local diagnostic, not a new throw or live game policy.

## Whole-step composition with a real work cap

A local eight-step budget must not be multiplied by every existing collision subdivision. `boundary-union43.js` preserves the baseline contact/stop subdivisions and allows at most eight **additional** integrations per ordinary600Hz tick: at most16total. Every actual added integration is observed because instrumentation is installed before dispatch. Budget fallback remains visible and leaves the original base interval available, rather than relaxing constraints or inventing a successful outcome. A zero-extra-budget regression produces the exact original serialized result and reports the declined refinement.

In six fresh-history uninterrupted15s trials, the previous research union has three angular-flag cases, worst0.110356rad. Boundary scheduling without a lead-in still leaves a snake peak0.104933rad. The lead-in/post-stop composition has no selected-case angular flags, worst0.078334rad, maximum14integrations per tick, and no budget fallbacks. No body becomes nonfinite; cumulative work-corrected energy remains unflagged. Positive individual step residuals still occur (maximum0.001885J-like) and are retained. Every loaded hash and complete release record equals the iteration42 reference.

An isolated boundary-only overlay on original physics is not a drop-in cure: it introduces a mouse peak0.092285rad and one budget fallback in this selected study. That rejected alternative is retained in `live-six-isolated.json`; it is not used to claim an independent ordinary-game fix.

## Broad validation, with remaining errors retained

Two264-case catalog/species/winding matrices use the composed candidate. Default loading remains unchanged; the other matrix explicitly enables the prior loading experiment in memory. These are research runs, not the live ordinary game.

| Loading mode + composed research candidate | Releases /264 | Inner angular cases:42→43 | Loading flags | Post-load flags | Max inner angular rad | Cases with budget fallback |
|---|---:|---:|---:|---:|---:|---:|
| default | 262 | 103 → 20 | 18 | 2 | 0.180411 | 16 |
| candidate | 263 | 69 → 3 | 0 | 3 | 0.158178 | 10 |

All264complete release records (including failed loads) and all264winding-work values match the appropriate previous reference in each matrix. Prediction/live release records match, and no source changed during either run. Maximum inner anchor errors are0.015355/0.017206m and rope excess0.011749/0.022309m, below the existing0.05m review levels. Maximum actual whole-step work is16in both matrices. Outer finite/cumulative-energy checks stay unflagged. High-spin flags remain3/2. The18default loading excursions are intentionally unaffected by a flight-only correction.

The original genuine failed-seat records remain: default loading misses heavy-frame snake/.75 and combined frog/.75; experimental loading still misses combined frog/.75. No readiness or release gate, reward calculation, world layout, camera rule or earned save was changed. These release comparisons do not establish new full flight-hint parity: the research flight kernel is not yet installed in the ordinary prediction clone. That shared-kernel integration is a promotion requirement, not an already delivered behavior.

## The five residual flight cases are regular contact shocks, not TOI

Read-only onset reproductions exactly match all five remaining post-load peak values. Scalar contact impulses, pre/post joint motion, the pinned Planck1.5.1limit state and sanitized call stacks are retained in `onsets-default/` and `onsets-candidate/`. Private fields are diagnostic only, guarded to that dependency version, and never control the simulation.

The remaining cases are default counterweight-heavy mouse/.45(0.091696rad), default long-sling salamander/.45(0.180411rad), experimental stock mouse/.6(0.132692rad), heavy-frame mouse/.75(0.158178rad), and heavy-frame possum/.6(0.112570rad). All peaks are observed on1/4800s integrations with an inactive stop. Large head/torso material-contact impulses in the same integration change the coupled angular motion after the pre-step forecast. Stacks go through `Solver2.solveIsland`/`solveWorld`, with TOI count0: **do not attribute these five peaks to the contact-only TOI solver**. The torso/front-leg joint can be moving away from a stop before the regular collision reverses its relative motion.

Only the counterweight-mouse peak shares an outer tick with a recorded work-cap fallback. Heavy-frame mouse has a fallback elsewhere, while its peak does not coincide. The other cases have unused work capacity at the peak. Raising the cap indiscriminately therefore does not address the common cause. The26fallback cases across both broad matrices are retained as an additional limitation, not discarded because most stay within the angular review level.

Next targeted experiment: reproduce each residual with an identical uninterrupted prefix, intervene only in the actual pre-impact interval, and test a short contact-triggered resolution step before reforecasting angular stops. Use real contact candidates/geometry and actual motion, preserve total time and the global cap, and compare all joints/energy. Avoid private solver-flag edits, body projection, disabled CCD, altered masses or hidden velocity clamps. Preserve the original collision samples as controls.

## Cost and promotion limits

Clean same-initial-state Node timing uses five alternating paired1s trials after warmup, with reconstruction outside the timer and an actual-integration counter only.

| Retained trial | Original ms | Isolated boundary ms | Previous research union ms | Composed boundary candidate ms |
|---|---:|---:|---:|---:|
| falling rig | 40.26 | 44.34 | 203.09 | 193.27 |
| ordinary rig impact | 64.25 | 55.01 | 150.94 | 151.12 |
| ordinary canopy impact | 56.52 | 56.40 | 63.28 | 64.54 |

The small correction adds little cost relative to the already expensive research union in these trials; changed physical trajectories can reduce later baseline subdivision work. This is not a claim that the full research union is as cheap as the original engine. Local interval microbenchmarks and all refinement references are retained separately. Node timings are not device FPS. No new natural encounter cohort, audio listening or human reaction study was completed. Full ordinary prediction parity, encounter outcomes, remaining contact-generated crossings and device performance remain unverified for promotion. All corrections stay disabled.

270tests pass, including actual crossing/error controls, unchanged shapes/masses/limits, passive-energy checks, explicit tiny-margin and insufficient-budget failures, coupled-pose accuracy, exact whole-step time/work bounds, zero-budget original-physics parity, all ordinary regressions and both historical genuine failed seats. One QA tab is retained at the local lead-in frog interval, no extra servers or tabs created. No image export, deployment, installation, permission change or user-save access occurred.

Reproduce captures with `capture-crossings43.js` only into a fresh evidence directory; existing captures are protected against overwrites. Local studies use `measure-boundaries43.js` with `--references`, `--settle` and `--lead`. Whole trajectories use `measure-live-boundaries43.js` and `--isolated`. Costs use the two `benchmark-*43.js` scripts. Broad runs use `measure-practical43.js`, optional `--loading-candidate`, and a fresh `--output-dir`. Onset copies use `measure-onset43.js --case ...` plus the loading flag when applicable. `summarize-boundaries43.js` generates the cross-check summary. Preserve all existing evidence when repeating narrow runners.

## New checkpoint synchronization blocker

The initial authorized normal retry succeeded to `4722fba`. Implementation43is committed locally as `a88066e`. Automatic approval review denied the subsequent normal `git push origin main` for this new checkpoint, treating the authorization as limited to the earlier retry and citing the original no-push restriction. The new command did not execute. No retry or workaround was attempted; fresh direct authorization/review resolution is required. All research is retained locally and no validation jobs remain running.
