# Iteration 19 — real shelf arrivals and portrait motion

## Selected changes

`collisionRegion` now recognizes the existing loading shelf, with the same centre/half-extents used by its physical fixture. Previously, a backward armadillo throw struck this shelf without triggering collision refinement. No mass, inertia, forces, friction, joint limits, CCD, release logic or collision geometry changed. Existing speed/spin eligibility and bounded2400/4800Hz refinement remain.

From the identical pre-impact state, selected production reduces internal peak angular excess0.169084→0.021529rad and payload anchor gap19.6915→0.01895mm. Maximum observed touching-contact penetration7.194→0.789mm. Zero positive unaccounted energy. The initial backward release vx−0.563m/s and subsequent poor result are retained. Selected production uses801integrations over the one-second fixture; the separate research variant that always refines shelf proximity uses1926 and has0.346mm penetration. Do not confuse those two protocols. See `selected-shelf-impact.json`, `armadillo-impact-review.md` and the regression test.

Portrait live readout now reserves three lines, with accessible scrolling for overflow. Distance/speed wrapping previously shifted the canvas between sampled flight views. Browser-loaded CSS was stale during first verification; the stylesheet URL is versioned and fresh DOM inspection confirms54.594px reserved height. Absolute document positions for readout474.680px/canvas578.867px are unchanged between fresh and loading states. An apparent intermediate53px difference was browser automatic scrolling, not a second layout defect.

## Selected-runtime checks

-162tests pass, including the new saved armadillo shelf impact test covering every internal integration's articulation, contact separation and energy.
-35-case full regression:32release/3low-seating misses;10angular-warning rows versus11 previously. Only the armadillo high-winding row changes physically, excluding timing fields. Release state remains identical; prediction/live parity exact. Remaining overall maximum angular0.174853rad and anchor0.025552m remain recorded.
-Selected132-attempt soak:126releases/6seating misses/0retained payloads,44m56.63s simulated,125.33s wall.258worlds tracked, zero retained at12GC checkpoints; post-warm heap−550440bytes.161797ten-tick batches: p952.556ms/max8.165ms; first/last quarter2.740/2.420ms. No source changes during run. Engine only, shared host, not browserFPS or a strict4ms guarantee.
-Audio double: one context, maximum4voices/30connected nodes, final zero voices/nodes. Duplicate rewards and queue progression checks pass.

## Joint-motion experiment remains experimental

The research-only Node preload adds flight-only integrations when relative part-joint angular advance would exceed0.05rad, capped8. Never imported by game code. Full35cases with shelf fix: angular flags10→4,32release/3miss, all release states identical, no newly introduced flags. The remaining four flags include loading phases untouched by this experiment. The earlier no-shelf experimental35case and132soak are preserved separately.

Alternating-order identical-fixture timing after two warm-up rounds: head lizard ten-tick p951.538→1.731ms; light beam0.643→0.889ms; armadillo1.204→1.204ms. Worst paired light-beam batch4.098→4.459ms. Total one-second median process CPU does not worsen consistently, because changed impact settling can reduce later integrations; these are not isolated cost-per-step comparisons. Accuracy benefit is promising, but this does not establish a robust strict4ms runtime budget or internal contact accuracy across every species. Keep experimental rather than selecting a global refinement rule yet.

The initial exploratory132soak loaded7ac9318 modules before the production edit; its end-of-run source hash was therefore not a valid loaded-source hash. Its evidence explicitly records that provenance problem and overlapping early jobs. Selected-runtime soak and paired timing supersede it for runtime decisions.

## Motion and accessibility review

Chrome390×844, save-off isolated session, actual finite-grip loading of flying squirrel at winding target0.54. Unpaused flight was sampled through Grandfather Tree281m high, open sky220m, jungle canopy59m, and forest floor0m; range12→168→619→805m, final3bounces, release63.4°/15.90m/s. Camera followed the silhouette into the long canopy and ground clamp. The squirrel remained readable at its real scale; distant crowns/trunks remained soft behind collider strokes. No pose repair or scale inflation. Final8127points/11bells collected once and retry preserved balance/queue. Sticky grip on, Sound35%, owned equipment none; original user save untouched. Browser console warnings/errors empty; viewport restored.

This was an uninterrupted live run observed in sequential screenshots, not exported video or a frame-by-frame jitter study. Three ground bounces are recorded by physics; every individual bounce was not visually sampled. Existing continuous camera tests cover fast reversals and both viewport geometries. The fresh current-style layout was checked separately, after that run.

Encounter birth review: current director rejects births inside the player's relative0.4s arrival corridor plus physical-overlap checks. Portrait horizontal view is narrower at high speed, so this does not guarantee a long visual warning for every already-existing encounter or fixed hazard. Seven encounter bodies were active in the observed floor window, but sampled screenshots did not capture a close approach. No claim that telegraphing is fully validated; an edge warning or controlled actual approach review remains a sensible next UI task. Avoid adding collider-like distant decoration to imply safe platforms.

## Original sound audit

Four bounded pitch variants; material-specific impact timbres; mass affects pitch, not amplitude. Existing cooldowns: impact90ms, wind350ms, zone2s, other cues60ms. Quiet zone cue gain0.045 versus launch0.15. Analytic sum of authored linear component gains peaks0.161per voice; master1/sqrt(voice limit) gives conservative0.644bound with16simultaneous worst cues at full volume,0.178at default10voices and35%volume. This is coefficient analysis, not rendered-waveform or perceived-loudness measurement. Existing envelope/lifecycle tests pass. No audible-quality claim or new audio tuning.

## Remaining limits

No native Mac unlock, hidden-tab end-to-end claim, blocked screenshot/clip export retry, push, deployment or paid assets. Snapshot observations were not exported. Continue controlled encounter telegraphing review and broader internal joint/contact sampling before selecting experimental stepping.
