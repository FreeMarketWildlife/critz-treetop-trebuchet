# Overnight pass 8 — truthful impact sources and weapon states

October 21, 2026. Started clean at `7102a90df8f97fcd292b7cfaed589b86d22ff422` on `codex/custom-trebuchet-workshop`. Scope is repository work, existing screenshots and supported automated tests while the Mac remains locked. No browser, native-app, alternate control route, Sites operation or unlock attempt was made in this pass. New visual behavior is **not natively verified or release-ready**.

## Impact-source diagnosis and change

The pass-7 actual phone screenshot put BONK! over decorative seed heads after a real leaf-mat collision. The source records were correct: `BuildSimulation.observeImpact/recordImpact` store manifold contact points, normals and closing speeds. Existing `flight-art.js` rays already used those fixed contact points. The misleading duplicate came from `build-art.js` placing a second burst and BONK/OOF text at the current moving critter position. The word moved away from the struck surface as the body rebounded.

The duplicate body-follow burst/word is removed. Body silhouettes, expressions, continuous angle, secondary animation and physical rotation remain. A new pure `impact-feedback.js` selects one meaningful contact in the newest solver timestamp, with strength then sequence deciding simultaneous contacts. One short word sits a fixed 24 pixels along that recorded surface normal, beside the existing contact rays. The position follows world projection, never the current body. Full text bounds that would leave the viewport or overlap fixed controls are suppressed rather than clamped somewhere else. Its short fade uses physical simulation time; pause holds age, a new throw has no old source, and finished/pre-release runs show no word.

Known noncolliding decoration, pass-through foliage/sap, unknown sources and malformed/future/stale events produce no external word. The source map is indexed once per immutable simulation map. Elastic leaf/bumper contacts say BOING!, passive hard contacts BONK!, a recorded positive authored power POP!, and a recorded snare SNAG!. An authored `power:true` flag alone does not imply a positive boost. A physical enemy contact that precedes and suppresses a separate power record remains a physical-impact word. This is deliberately conservative about what happened.

Independent review also reproduced sap becoming a cosmetic injury/bonk sound despite being a pass-through field. `critter-performance.js` now excludes foliage and sap from its injury counter, aligning it with the existing launch-feel/flight-accent field filters. Sap/rustle feedback remains. The body angle and every physical event remain unchanged.

## Weapon and landing-mark review

A separate read-only review reproduced three factual UI issues:

- At 0.0005 s of cooldown remaining the old HUD enabled Fire, while the weapon model rejected the action.
- At vx=45 / vy=35, the old Rising · speed caption accompanied a spent shot with exactly zero impulse. A Slingshot fired while travelling left at vx=-20 / vy=5 reduced scalar speed while that caption promised speed.
- Paused locked staff said Heat falling even though physical time and heat correctly stayed frozen.

The pure `weaponActionState` now uses the same exact positive-cooldown predicate and released-flight guards as the unchanged model. Available impulse directions are described as Right + up, Up, Right, or At limit. These are component directions, not a promise of more scalar speed, a guaranteed longer run or a recommended firing instant. Visible caption, title and accessibility name share the same state. Paused cooldown says Paused; blocked/non-running locked heat says Heat paused. Existing accepted shots at both velocity caps still consume ammo; no new disabling rule, cap, impulse or spending behavior was added.

Landing marks were reviewed and left unchanged. Successful hits clear acquisition, misses retain an unchanged path, paused/modal frames hide the mark, resume recomputes from fresh state, and target loss/new throw reset it. Stability is keyed by object ID rather than exact face/point; that heuristic and first-time comprehension remain usability limitations, not a newly found stale-destination bug. Existing stills establish count/state visibility, not novice understanding. Weapon names and aim/key instructions are hidden by main-play CSS; do not add HUD until observing whether the Fire auto-hit versus aimed-click-can-miss distinction is understood.

## Validation and evidence

**503/503 integrated tests passed** locally, Node 24.21.0, about 13.58 s. The independent contact reviewer passed 21 focused tests and confirmed core anchoring/selection/power behavior. Their null-event robustness finding was fixed and regressed before the integrated run. The HUD owner passed 29 focused tests; root inspected the diff and added paused-cooldown copy coverage.

New tests cover fixed contact coordinates while the body/camera move, newest-tick strongest selection, decorative/field exclusion, positive power versus snare/passive enemy contact, full-word bounds, reduced motion/state balance, pause/retry/finished clearing, malformed input and a real starter leaf contact without physical mutation. Weapon state tests compare actual model acceptance at the exact deadline and final half millisecond, each directional cap/both caps, backward motion, misses, ammo, blocked/missing-release states, selection-shared cooldown, heat and resets.

The existing 48-case landing matrix is exactly equal to pass 7, including physical duration, range, action count, camera metric and advisory notice. All finish; maximum presentation duration 17.633 s. Cases cover weak/medium/full, no actions/Slingshot/Staff/Air, cue on/off, and phone/desktop projections. The canonical revision-7 map remains 499 objects. No launcher, loading, physical collision/power, camera or timing algorithm changed; runtime cache is version 25. Original experimental guards remain disabled.

`source-anchoring-example.json` records the natural first-mat contact: x=23.76446, y=-4.68051. Across 55 samples the body travelled 1.80216 m while every feedback source stayed exactly at that recorded point. This is numerical/source evidence, not a native screenshot or comprehension test. Existing prior captures remain in pass 7. `independent-ui-review.md` and `ui-state-reproductions.json` preserve the pre-fix reproductions and review limits; the latter used a synthetic DOM/faithful impulse adapter, not a native rendering engine. `cue-matrix.json` preserves the final regression rows.

## Pending unlock-dependent checks

The previous blocked action was native Google Chrome access to select the continuing QA game tab for viewport cleanup. The tool reported that the Mac was locked and automatic unlock could not unlock it. No retry or alternate route was used here. Manual unlock and new relevant evidence are required before resuming that native action.

After unlock:

1. Recheck the pass-7 fixed-world midrib correction in desktop/phone play, which was made after the last native captures.
2. Recheck these new contact words at real mat/wood/enemy/snare contacts, both viewport sizes, camera movement, pause/retry and screen edges. Confirm that the removed moving burst and new source word improve the reading without covering the critter or feeling too quiet.
3. Verify capability caption wrapping/accessibility and actual Fire/aim, cooldown, heat and cap states in native Chrome. Audition field feedback to confirm no extra bonk over sap/rustle.
4. Restore the continuing game QA tab's 390×844 phone override to its default viewport. The editor override was reset in pass 7. Preserve unrelated tabs/settings. A final read-only process/port check found the previous localhost:8080 server PID 32791 and port listener absent. This pass did not start, stop or restart it; restoring the local game preview server for native QA is also pending unlock.

Personal saves and legacy 18,117 points / 89 Bells were untouched. No public publication was attempted; Sites remains pending parent/user approval. The current code can be committed as a tested checkpoint, with native visual/gameplay acceptance explicitly outstanding.

## Remaining high-value independent work

A bounded, source-level reproduction of the one immediate partial-draw loading refusal observed in pass 7 can be prepared from physical load/wind/settle sequences; do not retune physics from one observation. Review editor-runtime same-source and save migration invariants if map content changes. Once unlocked, the highest-value design work is actual first-time explanation/observation of what was hit, when Fire would be used, and what a landing mark means. Current automated evidence proves source/state correctness, not novice comprehension or a funness claim.
