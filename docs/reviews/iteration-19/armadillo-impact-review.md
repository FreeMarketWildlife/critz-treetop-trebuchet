# Armadillo first-obstacle inspection

The missing fixture is now captured from the exact natural high-winding armadillo regression. The first obstacle is **the existing loading shelf**, at(-3.50281,295.54877), elapsed10.186667s. The saved state is immediately before the outer600Hz step containing that first positive payload/static impulse. It preserves the original backward release(vx−0.56268,vy8.92797m/s); no ground-impact assumption or launch change was introduced.

## Root cause and simultaneous measurements

The loading shelf is a real static collider constructed separately in articulated.js. Current collisionRegion checks authored layout.surfaces, bumpers and enemies, but the shelf is absent from layout.surfaces. Thus all600 integrations in the current one-second incoming replay remain600Hz, including this impact.

The exact replay reproduces the original19.6915mm torso/tail gap atincoming+3.333ms. That same joint has zero angular-limit excess, relative speed44.40rad/s; simultaneous torso/shelf and tail/shelf penetrations are4.086/3.555mm. Anchor error exceeds5mm for two consecutive600Hz samples (3.333ms sampled occupancy). Rear-leg angular excess peaks separately at0.169084rad,+10ms, with0.10769mm same-joint gap and tail/shelf contact. Its>.08rad sampled occupancy is1.667ms. These are distinct translation and rotation errors, not one simultaneous19.7mm torn rear leg.

Current one-second endpoints recover to0.00510rad maximum angular excess and0.0000341mm articulated anchor gap. Maximum contact penetration over the whole response is7.194mm. Work-adjusted positive energy residual is zero. This is a short numerical impact defect, not evidence of sustained exploded anatomy; the original poor backward throw remains a separate outcome.

## Identical-state counterfactuals

| Stepping | Max angular rad | Max anchor mm | Max contact penetration mm | Internal integrations |
|---|---:|---:|---:|---:|
| Current | .169084 | 19.6915 | 7.1940 | 600 |
| Relative-joint motion .05rad/cap8 | .022277 | 16.1010 | 6.0362 | 619 |
| Relative-joint motion .025rad/cap16 | .015938 | 16.1010 | 6.2487 | 702 |
| Existing collision refinement + shelf coverage | .021529 | .01895 | .3456 | 1926 |
| Shelf coverage + joint motion cap8 | .021529 | .01895 | .3456 | 1926 |

Relative-joint-motion refinement helps the later rotation but cannot anticipate the very first impulsive tail contact;16.101mm anchor error remains on that first unrefined600Hz step. Adding the actual shelf AABB to the existing collision-region predicate resolves this contact before the impulse. The research predicate uses x[-5.1,-3.5],y[pivotHeight−4.54,pivotHeight−4.46] and the existing .15+speed×dt padding. It retains the existing2400/fast4800Hz policy and changes no world geometry, CCD, forces, mass, inertia, articulation, limits or poses.

This supports correcting collision-region **coverage** rather than globally increasing solver frequency. Production must derive/share the shelf bounds to avoid drifting duplicated constants; the research uses the exact present collider dimensions. The refined paths differ after the collision: current armadillo is resting over the shelf atone second, while the refined armadillo has moved off its left edge and is descending. An identical incoming state isolates the integration choice, but changed collision trajectories are expected; final trajectory differences are not evidence of a hidden boost.

## Remaining checks

Shelf coverage is a research override, not a production edit. Its1926 versus600 integrations over this response can affect CPU and the natural trajectory. The main worker should run full natural regression, canonical prediction parity and warm frame-budget tests before selecting it. Joint-motion refinement requires its own broader tests. Contact penetrations are signed world-manifold separations from enabled touching contacts, including shape radii/skins; absence of a large recorded separation cannot establish every possible noncontact tunneling case. All joint/contact peaks and recoveries remain in armadillo-impact.json.

Original iteration18 evidence is untouched. New capture script measure-armadillo-capture.js and replay script measure-armadillo-impact.js write only iteration19 research files. No production edits, commits, browser or push.

## Provenance correction and production regression test

During exploratory reruns the main worker added shelf coverage to production. Those transient outputs were superseded. The final research script pins old step/collisionRegion from Git9d490a7 (physics identical to7ac9318) while recording working-tree body/force integration hashes and checking for changes during the run. The shelf bounds above are corrected to the actual collider center±.04; an earlier message had shifted the vertical bounds downward. The combined cap8 variant is also corrected to use the actual .05rad/cap8 rule. Baseline, standalone joint-motion and shelf-only conclusions remain as shown in the final table.

A separate test/armadillo-shelf-impact.test.js checks CURRENT production against this frozen original incoming state at every internal integration: angular<.04rad, anchor<1mm, contact penetration<3mm and unaccounted energy<.01J. It retains the backward launch. The focused test passes. Production uses actual shape AABBs including skin, so its precise integration count/contact peak can differ from the conservative research rectangle; the test measures the selected implementation directly. No production files were edited by this reviewer.
