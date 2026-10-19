# Iteration 15 — fast-impact resolution and first-player recovery

Continues local implementation from fdc3435823efc7521d30b80581f0d2c9d6134b52. No push, deployment, paid assets, unlock bypass or blocked export retry. The earlier lore documentation task is complete and is not the current work.

## Physical leg transient

The saved iteration-14 heavy-frame lizard arrival reproduces 0.272689 rad rear-leg angular excess. Inspection of pinned Planck 1.5.1 `src/dynamics/Solver.ts` shows the time-of-impact island includes contacting bodies and contacts, but omits connected joints. This supports the explanation that a small limb can rotate during that contact-only pass before ordinary joint solving resumes. It does not prove every remaining transient has the same cause.

Production now opts into 4800 Hz integration in the existing flight collision region when any volunteer part exceeds 40 m/s or 100 rad/s. Other nearby flight uses the existing 2400 Hz; ordinary flight/loading keeps its prior resolution. At most eight internal integrations per engine call. Constructor behavior remains opt-in. No mass, inertia, geometry, material, angular limits, hand force, motor or pose/velocity correction changed.

Controlled saved arrival: 0.037841 rad angular excess and 0.0000699 m anchor error, positive energy residual zero. Shape/material/bullet alternatives did not consistently solve the problem; moving anchors changed constraints at the incoming pose and is not an equivalent comparison. The turtle fixture remains below 0.05 rad with current mass distribution. See leg-study.json and turtle-refinement.json.

Across 99 synthetic arrivals (11 species, three velocity/spin conditions, three resolutions), 4800 Hz reduces angular warnings from 11 to three and maximum from 0.21723 to 0.11430 rad. All eleven high-speed, zero-initial-spin arrivals stay below 0.08 rad. Spinning snake, armadillo and possum still warn: this is a bounded improvement, not a universal fix. No positive energy residual observed. See leg-cross-species.json.

The natural 35-case regression has 32 releases and three low-winding seating failures, matching iteration 14. Canonical prediction/live parity remains exact and prediction does not mutate live state. Angular-warning cases fall from 18 to 11, maximum 0.272689 to 0.174853 rad; maximum anchor error remains 0.033266 m. Five launch-branch impacts and one backward/vertical launch remain. No nonfinite, explosive-energy, rope or suspected surface-penetration flags. Loading warnings are unaffected. Lowering the fast threshold or refining every nearby flight contact leaves the three reviewed residual cases unchanged, so broader work was rejected. See regression.json and threshold-summary.json.

## Five soak nonreleases and coaching

Independent replay identifies four missed/failed seats and one snake contact window that the soak's deliberate first-60-tick delay misses. All use 0.2 winding. Keeping the same species/equipment at 0.6 winding produces ready contact within 0.252 s after drop in all five. This establishes a recovery window, not guaranteed good launch quality. Detailed outcomes are in recovery-review.md and recovery-cases.json.

Coach now detects fallen/far volunteers even when they never touched the cradle, preserves escaped-bead priority, offers same-volunteer medium retry at any winding, distinguishes off-center contact, and prints the faster of COM/part relative speed. It does not claim an invented hand reach limit. Held guidance says to wait for the real spring-driven volunteer to catch up before dropping.

## First-player controls and rewards

The winding instructions explicitly require button focus for Space/Enter; the meter has a quiet middle target marker. Collection shows the earned bell amount, credits points and bells once, opens the shop, and freezes the completed flight without changing a body state. Steering and Pause are disabled for completed runs. Purchases explain that hardware applies to the next setup; automatic collection during Reset/Next does not force shop scrolling.

Current-source native browser review started from zero wallet/no equipment with save consent off on localhost. Pointer and focused Space holds both yielded meter 0.49. Two gravity-seated frog launches released forward at 60.5 degrees / 15.9 m/s and 61.3 degrees / 15.8 m/s. First run collected 1011 points/23 bells at 79 m/nine bounces; second collected 1073 points/19 bells at 90 m/seven bounces. The shop correctly disabled unaffordable gear after run one. Buying the 30-bell counterweight then showed equipped 180 kg and wallet 2084 points/12 bells. A repeated Frog in the queue advanced correctly, then Pygmy possum followed. Collecting while manually paused retained Resume on the next volunteer; Resume enabled winding again. No currency injection, save edits or unlock shortcut.

The equipped Pygmy possum relaunch was poor: -162.7 degrees / 0.4 m/s, zero forward distance, launch-branch collision and nine bounces. This is retained evidence that owned hardware and a contact-ready pose do not guarantee useful release. The branch-return recovery message appeared. Collect & retry paid 225 points/23 bells once; a second Reset preserved 2309 points/35 bells. The final localhost tab 1219045088 is an idle possum setup, counterweight owned/equipped, save consent off, sticky grip on, Sound on35%, normal viewport. It is kept open for review; this wallet is session-only. No browser warnings/errors were captured. The previous iteration's saved 127.0.0.1-origin wallet (18117points/89bells) remains separate and untouched. No persisted screenshot/export is claimed.

## Soak, budget and limits

Final 132-attempt soak: 127 releases/five low-winding nonreleases, 2629.34 simulated seconds (43m49s), 133.80 wall seconds. At 12 explicit-GC checkpoints, all 259 original/canonical worlds were collectable (zero retained); post-warm heap increase 604912 bytes includes intentional ledger/metrics growth. Audio lifecycle double: one context, maximum four voices/30 connected nodes, final zero voices/nodes. This does not verify audible quality or browser mixing.

157760 ten-tick Node engine batches: p95 2.603 ms, maximum 46.403 ms; first/last-quarter p95 2.428/2.630 ms. The large isolated maximum remains a performance concern; these measurements cannot establish browser/device FPS or a strict 4 ms budget. Controlled warm fixture trials have fast-resolution p95 1.599 ms (leg), 1.370 ms (turtle), maximum 2.534/2.180 ms, no samples over 4 ms; they are a narrower workload. See soak.json and leg-budget.json.

154 tests pass, including saved-leg recovery, all-species high-speed arrivals, bounded opt-in refinement, never-contact falls, off-center support and honest moving-part coaching. `git diff --check` passes.

Actual hidden-tab end-to-end remains unverified: automation previously reported the game visible with another tab selected, and native Mac access is locked. No unlock bypass attempted. Manual pause, focused winding and completed-run pause were observed; frame-clock/visibility behavior has automated coverage. Audible quality and real-device FPS remain unverified.
