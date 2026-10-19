# Iteration 20 — visible approaches, readable impacts, safe progression choices

## Implementation

Added render-only amber edge arrows for up to three approaching off-screen physical enemies. A conservative relative-velocity estimate looks1.2s ahead and rejects visible, receding, distant and cross-track bodies. It can warn about near misses; acceleration/rotation mean it is not a collision prediction. It does not spawn, move or resize anything. A direction/kind notice is also supplied to the existing polite live guidance region. Arrows are static geometry with no pulse or new sound.

Enemy circles now have clear outlines showing their actual collision bounds. Small original moth wing markings flap inside an explicit circle clip; reduced motion uses a fixed wing pose. Impact rings/sparks draw behind enemies and then the articulated volunteer, keeping the volunteer foremost. Reduced motion immediately suppresses existing effects as well as new ones, including while paused. Fixed authored geography, biome birth pools, encounter physics, camera, physical species shapes, reward rules and experimental joint stepping are unchanged.

Shop actions now distinguish `Buy & equip`, `Owned · Equip` and `Equipped · Remove`. Owned items retain their price as secondary information; the next-setup summary includes beam mass to make light/long material choices clearer. Existing gear can be removed/switched free; purchases still affect the next setup and do not guarantee greater distance.

Save opt-in previously silently loaded older stored progress over a nonempty current session. It now leaves both unchanged until an explicit inline choice. Before replacing the primary save, a recovery envelope stores both versions; Restore backup swaps versions and can swap back. Failed writes leave the in-memory economy intact. Interrupted primary writes expose the intended active version through the normal recovery API after reload. Invalid data/version/null storage fail conservatively; saving is visibly off on failure. Startup restore policy remains unchanged. This is one recoverable alternate version, not an unlimited save history.

## Natural approach measurements

`measure-soak20.js` uses unchanged natural132-attempt earned-upgrade physics and adds read-only observation at60Hz for portrait480×600 and landscape960×480 camera geometries. It observes113410flight frames, up to80.72m/s,17distinct moving-enemy contact events, across all four biomes and seven encounter kinds. Springy pod has no natural contact in this bounded run and was reviewed in a controlled fixture instead.

Portrait body visibility alone first appears as little as0.0767s before contact. Warning-or-visible first observation is at least0.4096s for every observed portrait contact; arrows improve initial notice for11of17. Landscape corresponding minimum0.3596s; arrows improve6of17. Five portrait contacts and nine landscape contacts need no off-screen arrow because visible-body notice suffices. These are first-observed leads, not proof of uninterrupted visibility, reaction time or universal fairness. The1.5m conservative payload margin may miss unusual extended postures/accelerating arrivals; false-positive near-pass notices are intentional. Existing0.4s fresh-birth corridor and physical overlap checks remain.

## Physical, lifecycle and performance checks

-173tests pass, zero failures. New tests cover fast portrait warnings, harmless/receding rejection, bounded deterministic output, effect layering/reduced motion, invariant wing clip, and six save-choice/failure/reload recovery cases.
-35regression rows exactly equal iteration19 after removing timing fields:32release/3low-seating misses/10angular warnings. Exact prediction/live parity remains. Recorded sources stable.
-132attempt soak:126release/6seating misses/0retained payloads;44m56.63s simulated,123.54s wall.258worlds tracked, zero retained at12GC checkpoints. Post-warm heap+192720bytes includes intentionally retained observation/ledger data, not solely application runtime. No source changes during run.
-161797ten-tick engine batches: p952.525ms/max7.454ms, first/last quarter2.688/2.394ms. Observation work runs outside this engine timer. Shared Node host; no strict4ms or deviceFPS claim.
-Audio lifecycle double: one context, maximum4voices/30connected nodes, final zero voices/nodes. No new audio cues or level changes. Existing cooldown, mute and pause tests pass; listening quality remains unverified.
-Worst8enemy/20effect no-op canvas fixture:500warm frames in each size/motion mode, JS frame p95about0.057–0.095ms, up to1653recorded method/property calls. This excludes actual canvas rasterization/GPU/compositor cost.

## Browser verification

Controlled physical fixtures use the actual rig, enemy radius/mass/material/collision filters, fixed world and current renderer. Initialization sets test velocities/poses only in the isolated fixture; it never touches the game economy or saves. Quarter-speed playback changes the clock, while actual world speed remains50/100m/s. Portrait sky50m/s and canopy100m/s showed an edge arrow before the body entered view. At first contact (about0.88–0.89s), the lizard remained visible in front of the outlined moth/pod. Current moth art was inspected on a fresh origin; a reduced-motion fungus contact was inspected in landscape. The ground-labelled fixture rises from3m into canopy height before contact under unchanged gravity; this is a spawned species drifting physically, not an altered biome band. No claim of frame-by-frame video inspection or audible QA. Screenshots observed, not exported/persisted.

Current source was loaded on isolated loopback127.0.0.1:8081 to avoid stale cached assets and preserve older QA/user origins. First natural frog flight:59.2°/16.6m/s→88m/7bounces,1058points/19bells. Saved initial0state, disabled saving, earned/banked, then Save displayed conflict19versus0without replacing current. Keep session→Restore backup0→swap back1058/19verified through actual controls; reload restored earnings.

Second frog chosen with visible lab selector, default140kg hardware, mute/reduced motion enabled:60.1°/15.86m/s→49m/7bounces,665points/19bells. Audio status muted, zero voices; no impact flashes observed. Warm public240frame CPU p95/max2.7/3.1ms, engine2.5ms, draw0.3ms, RAF interval9.8/10.4ms; later2.6/3.4ms. Loading prediction windows can exceed4ms and are not presented as fixed-budget proof. Combined1723points/38bells→purchased180kgcounterweight for30→8bells. Actual Remove/Owned Equip/Equipped states retained the8bell balance; Reset and reload retained1723/8/ownership, with180kg shown as next setup. Other five purchases are verified numerically, not claimed as manually played this turn.

Final current tab1219045114idle, Turtle; saveON on the isolated origin, counterweight owned/equipped,1723points/8bells, backup0retained. Sound restored on35%, reduced motion off, sticky off after reload; viewport normal, console warnings/errors empty. Older saved/QA origins untouched. Local loopback server only; no publication.

## Progression review and limits

Independent earned-ledger replay reproduces130485points/2379bells/126completed shots; all six items purchased by launch16.126duplicate-bank checks,132save roundtrips and742free owned-equipment swaps pass. Gear changes real masses/inertia/leverage/sling/grip. Low seating misses cost no bells and have existing medium-winding recovery. There is a finite six-item prototype shop ceiling; no arbitrary new sink or balance changes were invented. Points still use distance at collection, not peak range, and completed-shot IDs intentionally grow to preserve idempotence. See the historical audit and resolution note in `progression-review.md`.

Remaining: broader controlled high-speed/extended-pose approaches, actual reaction/readability playtesting, screen-reader listening, real-device rendering/audio QA, and longer progression content/balance. Numerical samples do not establish universal fairness. Native Mac remains locked; no unlock, hidden-tab end-to-end claim, blocked export retry, push, deployment or paid assets. Joint-motion refinement stays research-only.
