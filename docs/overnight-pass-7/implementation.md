# Overnight pass 7 — organic destinations and material identity

October 21, 2026. Started clean at `613949b7643aa3207fbf5bdef5784b3cbea681aa` on `codex/custom-trebuchet-workshop`. This is a bounded checkpoint in the continuing overnight improvement. No Sites operation was attempted; publication remains pending parent/user approval.

## Art direction and concrete changes

The prior full-screen phone and desktop captures exposed a manufactured vocabulary: seed heads were concentric targets with regular ticks, leaf mats were thinly hatched planks, and broad wood faces had little large-scale structure. The new original canvas illustration uses amber blossoms and unfurling seedpods, broad overlapping leaf folds, and open flowing bark grain. Canvas is appropriate here because these forms must follow editable world geometry at arbitrary zoom; no external bitmap or downloaded artwork was added.

`grove-botanical-art.js` replaces circular bumper illustration. Stable object IDs select irregular overlapping petals with offset seed hearts or a curled crozier with broad sepals. Decorative noncolliding heads have no enclosing disc or circular rim. Actual colliding circular bumpers retain the exact full circle. Interior art is clipped to the supplied radius and the collidable outline is inset so its outside remains inside that radius. Tiny views have a bounded broad-form LOD. This also improves circles drawn by the existing editor, using the same renderer.

Leaf mats now have rounded light, broad botanical folds and a sinuous midrib. The warm first seed-garden face has tighter veins; the cooler waxleaf has wider, sparse veins and a different sheen; fern and exit mats retain the same visual grammar with different fold treatments. Exact polygon boundaries and highlighted contact edges remain. Wood has lower-chroma rounded light, metre-anchored open fissures and irregular old knots instead of a uniform orange band. Canopy exit logs have a moss-colored contact shoulder. New features follow edited geometry; no parallel world, map metadata or hidden collider was introduced. Runtime module cache is revision 24.

An independent fresh-view reviewer rejected two intermediate choices: a concentric dark bark knot looked like an eye, and the leaf faces were too dark/heavy. The retained knot has no black centre or closed iris ring; its grain is open and smaller. Leaf values were lifted and the darkest areas reduced. The reviewer then found the corrected bark recognizable as wood, warm/cool destinations visibly distinct, and the actual phone contact rim clear enough to retain. Decorative heads were also revised after a first screenshot still read as buttons.

## Before/after evidence

`art-study.html` renders the canonical map with the same world and critter drawing functions. Four fixed cameras and poses make the matched comparisons reproducible. Its visible label states that it is a renderer study, not gameplay. Resize repaints the canvas and CSS/backing sizes were verified.

- `opening-before.jpg` / `opening-after.jpg`: matched 390×844 seed-garden study.
- `exit-before.jpg` / `exit-after.jpg`: matched 390×844 wood study.
- `exit-desktop-before.jpg` / `exit-desktop-after.jpg`: matched 1726×819 wood study.
- `waxleaf-after.jpg`: second destination at actual phone size.
- `phone-before.jpg` / `phone-after.jpg`, `desktop-before.jpg` / `desktop-after.jpg`: actual native-input gameplay. These are different flight moments and loose loading states, so they are not matched distance or timing comparisons.
- `phone-landing-notice.jpg`, `phone-boost.jpg`, result captures and `editor-after.jpg`: actual interactions with the final source.

A malformed intermediate responsive screenshot from a long-lived tab was excluded and replaced by a verified 390×844 full-page capture. All committed phone/desktop images have the stated dimensions; screenshots are unedited browser captures. After these captures, final diff review found the midrib was interpolated between viewport-dependent endpoints. It now uses fixed world cubic segments (with one fewer maximum secondary rib to retain the existing drawing budget), covered by a camera-motion regression. Native re-render of that small final anchoring correction is pending the Mac unlock; the screenshots show the reviewed botanical forms before that correction.

## Regression and performance evidence

Final integrated `npm test`: **488/488 pass** (Node 24.21.0, about 14 seconds locally). New botanical tests verify exact circle bounds, clipping, state balance, deterministic identities, broad LOD, invalid input and decorative silhouettes. Existing shared world/material tests verify finite bounded drawing, unchanged object data, exact polygon fill and fixed world grain. All launcher, loading, bounce, camera, weapon, map persistence and editor tests remain in the integrated suite.

Ran the existing 48-case landing matrix against both the frozen prior checkpoint and final source. Every complete JSON row is identical, including physical duration, range, action count, camera metric and notice. All finish; maximum presentation duration 17.633 s. Cases cover weak/medium/full draw, no actions/Slingshot/Staff/Air, cue on/off and 390×844/1726×819. Canonical maps are deeply equal, revision 7 with **499 objects**. Tracked JavaScript changes beyond cache versions are restricted to `grove-art.js` and `grove-material-art.js`, plus the new botanical helper. No camera, physics, weapon, launcher or time-stepping algorithm changed. Experimental guards remain disabled.

The study's Measure drawing button used 120 animation frames across four fixed scenes on this Mac's Chrome, before the final midrib anchoring correction. It measures isolated shared world/critter drawing, including state reset and canvas work; it excludes full gameplay stepping, audio, display presentation and physical phone hardware. Observed milliseconds:

| View | Before p50 / p95 / max | After p50 / p95 / max |
| --- | --- | --- |
| 390×844 | 1.0 / 1.9 / 2.6 | 1.1 / 2.5 / 4.7 |
| 1726×819 | 1.6 / 3.5 / 7.8 | 1.5 / 2.5 / 3.2 |

These single-run measurements show bounded drawing cost, not an FPS guarantee or a statistically established speed improvement. JSON samples and the portable fixture are included.

## Actual play and editor checks

Mac Chrome QA used `?qa=1`, saving OFF and session-only editor map storage. Phone full throws reached result/collection; recorded examples were 41.8 m / 53 Bells unaided, and 41.9 m / 53 Bells after Air. These loose native-input samples are not evidence that Air improves distance at that timing. On a marked first descent at 19.9 m, the Fire caption said Falling · lift; clicking Air spent 1→0, cleared the old landing mark, and kept playback at 1.000. The reviewer infers that counts, tool selection and Fire are visible, but stills cannot establish deliberate novice understanding.

A fresh, settled 50% phone throw finished 16.2 m / 36 Bells and collected back to ready. One immediate earlier half-draw after loading remained ready at 50%; a second winding accumulated the ratchet draw to 100%. A fresh settled check succeeded at exactly 50%. This isolated loading observation was not diagnosed or altered during the art pass; preserve it for a focused input/loading follow-up if reproduced.

Desktop 75% was verified from the UI at 1726×819. It paused at 24.4 m; presentation clock remained exactly 5.808 across the art/performance checks, then resumed, finished 44.7 m / 54 Bells and collected back to ready. Game/study/editor console warning/error reads were empty before the final midrib correction. Editor QA Save map now → reload kept 499 pieces; camera controls showed the same new flowers and material rendering. Save/import/default regression tests pass; the canonical map data is unchanged.

## Critical assessment and next pass

The seed-head silhouettes and leaf construction have materially changed, and distinct landings are more recognizable. Large physical branch polygons still make broad bands in some compositions; their geometry and straight contact lines deliberately remain honest. Tiny volunteers still need their trail and contour to read in busy impact moments. This is not a claim that the whole game's art direction is finished.

The independent reviewer found a remaining ambiguity in the actual phone frame: BONK! appears over a decorative flower while the physical rim is lower. That can suggest the flower caused the hit. This is an inference from a still, not evidence of faulty collisions or an observed novice error. Highest-value next pass: a first-time-player explanation/observation of what they hit, when they would use Fire, and what the landing marks mean. If decorative-head confusion reproduces, first de-emphasize or reposition those existing noncolliding landmarks away from the impact read, preserving the real rim and bounce behavior. Avoid more HUD or unmeasured physics tuning.

## Preservation and remaining cleanup

Personal progress and legacy 18,117 points / 89 Bells were untouched. All QA progress is disposable session state. Original localhost:8080 server PID 32791 remains. The five temporary comparison/game tabs and this pass's localhost:8097 server were closed. Continuing game/editor QA tabs remain for the next pass.

The Mac locked during final native browser cleanup. Opening native Google Chrome to select the continuing game QA tab was blocked because automatic unlock could not unlock the Mac. No retry or unlock workaround was attempted. The game QA tab still reports a 390×844 responsive override; returning that tab to its default viewport is pending manual unlock. The selected editor tab's override was reset. Native visual verification of the final midrib anchoring correction is also pending that unlock. Source verification, commit/push and CI remain available; no unrelated tab/server/settings were intentionally changed.
