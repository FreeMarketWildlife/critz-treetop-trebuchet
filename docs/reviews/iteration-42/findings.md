# Iteration 42 — selective contact resolution and inactive angular stops

**Research gains only: no ordinary-play improvement is delivered in this checkpoint.** Game source remains unchanged from `43768c5`; the loading option remains absent/false in ordinary play and all new contact/stop policies are explicit research imports only. Saved progress and every historical baseline/failure file remain intact. The corrected selector reduces waste in retained falling-rig/canopy trials and improves some real constraint errors, but costs more where it adds previously missing collision coverage. Inner angular errors and high-spin diagnostics still prevent a clean promotion claim.

## Actual geometry and relative motion

`rig-policy42.js` uses pinned Planck GJK distance between actual fixtures, after the existing body/joint and fixture collision filters. It retains the previous 0.15 m guard. The kinematic approach bound adds relative COM translation and **both** fixtures' angular sweeps, rather than treating their common world translation as closing motion or considering only one rotating fixture. It checks all qualifying pairs until a real distance candidate is found; a distant first AABB pair cannot hide another imminent pair. Sensors are excluded from this collision-resolution selector.

Five physical coverage tests establish: two rotating rods can approach with stationary COMs; a rotating animal can approach a stationary mechanism; common translation preserves an isolated gap; overlapping diagonal AABBs need not mean imminent fixture contact; and real-scene observation leaves the full serialized state unchanged. The new complete motion check deliberately covers fast counterpart bodies even when the mechanism is nearly stationary. A separate old selected-body-motion-gate variant isolates that coverage difference; it is an analytical control, not a proposed way to regain speed by omitting the newly covered contacts. The bound is conservative under the sampled current twist, not a proof against every future contact impulse.

## Cost at identical initial and instantaneous states

The final clean timing study contains every policy in one session: five alternating paired rounds after warmup, same retained actual initial states,1s simulation, no inner diagnostic scans except an integration counter. Corrected trajectories can diverge after that identical start, so the separate pure-query study holds every **instantaneous** baseline-evolving state fixed for all selectors.

| Recorded trial | Original ms | Prior AABB8 ms | Distance8, old motion gate ms | Complete distance8 ms | Distance + stop8 ms |
|---|---:|---:|---:|---:|---:|
| falling rig | 39.70 | 226.80 | 153.69 | 153.46 | 199.95 |
| ordinary rig impact | 63.76 | 89.55 | 54.68 | 146.81 | 148.59 |
| ordinary canopy impact | 56.53 | 76.28 | 57.23 | 59.11 | 62.26 |

Complete actual-distance selection makes the falling-rig trial about 32% cheaper than prior AABB refinement, while peak anchor/rope errors improve from0.03231/0.00738m to 0.02205/0.00195 m. It removes unnecessary mechanism refinement in the canopy trial. In the ordinary rig-contact trial complete coverage costs more but improves peak anchor/rope error to0.000049/0.000011m, versus0.01354/0.00761m with AABB8. This is extra physical coverage and solver work, not a pure speed optimization. Two distance-triggered steps fail the falling-rig review levels; four pass that trial but worsen a selected snake angular peak to0.316rad and extend its excursion to13.33ms. Eight was retained for the broad study; lower fidelity was not chosen merely to improve timing.

Pure query observation on 1800 identical instantaneous states records zero serialized-state mutations. Distance queries themselves cost more: across 600 ticks, AABB selection costs about0.62–2.56ms, complete distance selection4.11–6.46ms, and the joint-stop predicate0.05–0.09ms. The net simulation gains come from avoiding unnecessary integrations, not from claiming GJK is cheaper than AABB testing. On those exact same baseline paths the complete selector selects409,141,0ticks versus AABB555,24,42; the extra ordinary-rig selections reflect the newly covered counterpart motion. All costs are Node wall times, not browser/device FPS. The first query-cost artifact is retained separately; the final query study ran sequentially after the other numerical studies.

## Angular stops away from external arrivals

The six cases were selected in advance as the top three retained inner angular errors for each of the default and experimental loading matrices. Fresh real winding/finite-force grip histories and post-loading snapshot hashes are identical per variant. Every launch and15s flight integration is inspected, including time after ground arrival. This horizon is intentionally longer than the previous stop-at-ground+0.5s matrix in some cases.

Large prior AABB peaks often occur on1/600s steps when connected critter segments are rotating hundreds of radians per second and the contact-only selector has stopped refining. `joint-policy42.js` predicts actual enabled angular-stop arrivals from angle and relative joint speed. Contact and stop requests share a **single maximum eight-step budget** at the standard600Hz tick; refinements are not nested. It changes timestep resolution only, with no force, pose, limit or mass assignment.

The selected mouse peak falls0.46150→0.06461rad with the distance/stop union. Other selected peaks remain: snake/.75 reaches0.08195rad, frog/.6 reaches0.11036rad, snake/.45 reaches0.08816rad, each for brief inner intervals. Uniformly increasing resolution is not monotonic across corrected trajectories. The duration and every remaining threshold crossing are retained in `angular-top-six*.json`, not relabelled as successful. These are targeted cases, not a statistical population or evidence of natural gameplay success.

## Broad validation of the union, with all failures retained

The two 264-case matrices use the real catalog/species/winding protocols, default 20 velocity / 12 position iterations and the research distance/stop union. The extra-iteration experiments below are separate narrow studies and are **not** part of these broad results.

| Loading mode + research union | Releases /264 | Inner angular flag cases: prior41 →42 | Max inner angular rad | Max inner anchor m | Max inner rope m | High-spin/speed flags |
|---|---:|---:|---:|---:|---:|---:|
| default | 262 | 118 → 103 | 0.207678 | 0.016702 | 0.011749 | 3 |
| candidate | 263 | 108 → 69 | 0.179283 | 0.016886 | 0.022309 | 6 |

Both retain all 264 exact full release records (including misses) and all 264 winding-work values versus their appropriate original reference. All prediction/live release comparisons match; no source changed during either run. The two genuine default-load misses remain frame-heavy snake/.75 and combined frog/.75; experimental loading still misses combined frog/.75. No inner rope/anchor error exceeds the existing0.05m review levels, and outer finite/cumulative-work-corrected-energy checks stay unflagged. These do not prove that every inner energy change is passive or that the solver is universally stable. High-spin flags increase to3/6 versus prior research2/1; their finite body/inertia/rotational-energy contexts remain in `summary.json`. They are not suppressed, called proof of instability, or dismissed as harmless accuracy errors.

No new natural encounter cohort was completed for this policy, and no improved player experience, reward behavior under the new policy, audio listening, human reaction, or device FPS is claimed. Prior natural-cohort failures and unmet activity/backward-flight targets remain valid records. The research policy is not enabled in ordinary play.

## Why more iterations do not fix the retained frog crossing

The trace records the joint just inside its upper stop at0.84584rad with relative angular speed825.32rad/s. During one1/4800s step it can advance about0.172rad past an upper limit of0.9rad. Pinned Planck 1.5.1 computes its revolute limit state at velocity-constraint initialization (`planck.mjs` around8208–8227), and position correction skips an inactive limit (`planck.mjs` around8336). A boundary crossed during that integration can therefore remain uncorrected until the following step.

Both outer-triggered and inner-triggered convergence experiments are retained. The focused real frog trace wraps the actual `world.step` call to record its options. At the peak,20/12,20/24 and20/48 all give0.110355699rad overrun and the read-only pinned `RevoluteJoint.m_limitState` value is0(inactive).40/24 gives essentially the same peak. The private field is diagnostic only, guarded to Planck 1.5.1, never used to choose forces, limits or stepping. An earlier full inner-solver artifact's option labels describe settings observed **after restoration**, and are explicitly labelled as such; focused actual-options traces record what the solver really used. Numeric metrics were not altered.

Increasing iterations cannot solve an angular-stop constraint that is inactive in that integration. This is a specific mechanism, not a general conclusion that iteration count never helps. Added iterations help some other trials, and those results remain available. Override settings restore in `finally` on normal and thrown paths; the tests verify both so research options cannot leak into a subsequent scene/save.

## Boundary placement proof and next concrete work

`measure-boundary42.js` isolates a two-body revolute joint using the retained frog's initial angle/speed. It is an **idealized diagnostic, not an implemented game correction**. Equal total simulated time and identical mass/geometry/limits yield angle 1.017780 rad with either 12 or 48 position iterations. Splitting the same duration just across the real boundary (1e-6rad inside the existing angular slop), then allowing the unchanged solver to act, gives 0.900001 rad. Angular momentum is exactly unchanged; mechanical energy falls73.382947→36.691474J-like as the passive stop removes relative rotation. No state is assigned after construction. Assertions verify equal time, passive energy, momentum conservation and the pinned dependency version.

Next: capture the true full-world state immediately before the real frog crossing and compare boundary-aware timestep placement against equal-time uniform stepping. Handle all impending joints, contact interaction, work/energy and a strict total-work budget; do not copy the idealized two-body split into the game or change the dependency's private limit state. Broader neighboring-case, encounter and performance evidence is required before promotion. Both existing research corrections remain disabled.

## Tests and browser handoff

259 tests pass, including the complete ordinary-game suite, both historical genuine failed-seat states, original unchanged loading, actual-shape coverage, read-only observation, bounded joint/contact budget and settings restoration on errors. Full baseline and failure artifacts are retained. One save-free QA tab remains paused on the earlier falling-rig state with the explicit distance/stop research union,0.10s replay, reduced decorative motion and normal viewport. Actual displayed anchor/rope errors are0.0017/0.0009m at that point. No images were exported, earned saves accessed, extra servers started, permissions changed, software installed or deployment attempted.

Reproduce paired studies with `measure-selector42.js --final`, targeted angular studies with `measure-angular42.js` and its `--joint`, `--onset`, `--solver`, `--inner-solver` modes. The focused option trace uses `--inner-solver --record-options --case sling-long-frog-0.6`. Broad matrices use `measure-practical42.js` with optional `--loading-candidate`; pass a fresh `--output-dir` because existing results are rejected. `benchmark-queries42.js`, `measure-boundary42.js` and `summarize-selector42.js` supply exact-state overhead, passive boundary proof and parity summaries. Preserve existing outputs when repeating the other research runners.

## Synchronization blocker

Implementation committed locally as `22bb824`. Automatic approval review denied the normal `git push origin main` to the existing public repository, citing the original no-push restriction despite later syncing authorization in the session. The command did not execute. No retry, indirect route, permission change or workaround was attempted. All evidence is retained locally; materially new direct authorization/review resolution is required before retry.
