# Overnight pass 5 — readable volunteers, woodland depth and deliberate flight actions

October 21, 2026. Started clean at 24ba554630559366763589183e599dbfe4f7481a on codex/custom-trebuchet-workshop. This is a bounded checkpoint in the ongoing overnight work. No public Sites packaging, save or deployment was attempted.

## Visible changes and decisions

The previous nominal 20.28 px critter length included a thin tail; its opaque body was smaller and only about six pixels high. Added a simpler original phone-scale flight drawing for the three starter species. Round ears/curved tail distinguish mouse, eye pair/folded haunch distinguishes frog, and upright striped tail/back distinguish chipmunk. Pale rims, dark contours and larger eye/mouth marks survive the small scale better than fine painted detail. The drawing retains the exact physical length, height and first body rotation; no independent enlarged sprite, pose reset or hitbox change. Jointed preparation still uses the existing articulated illustration. The phone detail variant is used at 40 px and below; larger illustrations remain intact.

Camera framing now uses a coherent 6.7% context floor, 8.5% fast travel and 10% slow travel, preserving .55 s release acquisition and the pass-4 lens hold. At 390 px width the minimum nominal length is 26.13 px, with approximately 22.7 px of opaque mouse torso/head. Physical spin still makes a thin body look narrower at some angles. This improves tracking and species cues, not readable facial detail in every frame.

Broad wood faces now have rounded shoulder/depth bands, overlapping tapered bark scales and sparse curved fissures instead of parallel plank grain. Contact silhouettes remain exact. Distant forked trunks/crowns use true smaller parallax projection, with bases extending to the world floor. Close ancient-tree fill recedes while the whole-tree silhouette remains intact. The initial art experiment still produced enormous flat facets because only position used parallax; actual phone screenshots exposed that mistake, and it was corrected before this checkpoint. A hard light wedge was removed. No objects or terrain coefficients changed: canonical revision 7 remains 499 editable pieces.

## First-time agency without a tutorial overlay

The existing Fire control now says **Lift + speed**, explaining the effect on the volunteer. It names the selected weapon accessibly and shows explicit **Wait / Ready soon**, **Empty / Choose gear**, or **Cooling / Heat falling** states. Button/F targeting, pointer aiming, ammo, kick, cooldown and heat constants remain. The button reflects actual cooldown availability instead of looking ready while silently rejecting input. Hit bursts have hollow centers so they no longer cover the tiny body; the feedback still follows the moving critter.

Staff cooling now consumes physical elapsed time, matching the existing physical-time cooldown. Visual feedback ages in active presentation time, and both pause when the game pauses. This prevents presentation timing or the existing speed control from changing the relationship between heat and cooldown. No directional steering was added.

## Automatic landing slowdown was removed

Compared the pass-4 repeated .62 rate, a shallower .84 experiment, and ordinary flight. The deep version added about .39 / 1.41 / 2.20 presentation seconds to weak / medium / full natural runs. A .24 s global-budget experiment reduced that, but added only about 50 ms of contact emphasis. More importantly, a retained frame-cadence weak Slingshot case took 39.73 s with the experiment versus 18.23 s with it off: fire ticks shifted by roughly 4–5 ms and selected a different terrain path. This was real foliage travel/descent, with only 1.08 s quiet aftermath, not pathological settling. No catchers or physics constants were tuned to fit that case.

Final production has **no automatic landing anticipation** and no hidden comparison option. Original counterweight swing timing, release ramp, impact punctuation and explicit speed control remain. Natural weak / medium / full wall durations are 5.375 / 12.017 / 17.625 s; six natural/Staff comparisons exactly match the archived anticipation-off release, end state and duration. Experimental and final measurements are retained separately. The failed experiment is not a released benchmark result.

## Comparisons and regressions

Final integrated suite: **470/470 tests passed** on Node 24.21.0. Coverage includes physical rendering transforms, small starter silhouettes, camera acquisition/hold/pause, finite bounded art drawing, stable distant projections, map immutability, launch timing, physical-clock weapons and the retained difficult full-run input schedules. Phone/desktop drawing remains under the existing 10,000-command frame budget; this is not device FPS certification.

`scripts/measure-playability-pass5.mjs` runs 48 cases: 390×844 / 1726×819, weak / medium / full, no action / Slingshot / Staff / Air, prior checkpoint versus current. Prepared inputs trigger at fixed physical ticks. All finish; current cases finish within 17.633 presentation seconds, with matching recorded physical duration and range across before/after pairs. Archived prior camera/tempo modules make the comparison reproducible against the same unchanged map. Old HUD cooling uses presentation time in the baseline; current cooling uses physical elapsed time, intentionally correcting that mismatch.

Tradeoff: the current full phone first-four contact previews are .367 / .400 / .417 / .400 s, and the first exit preview is .300 s. Pass 4 had .750 / .783 / .867 / .800 s partly by slowing time. With natural tempo held constant, the closer camera costs roughly a tenth of a second of preview. This is sufficient only to support an already-prepared single Fire action; it does not prove that a new player can select, understand and aim from scratch. The choice here favors a recognizable volunteer and responsive rebounds. Destination timing remains the next interaction problem.

## Actual Mac Chrome review

Used the previous checkpoint as a temporary localhost-only playable baseline and the current game in Chrome. Reviewed identical fixed-camera phone-width art sheets plus real launch/flight/landing/retry. Current phone full unaided runs included 40.4 m and 73.1 m, reflecting loose physical loading/timing rather than deterministic fixtures. An Air-assisted full phone run finished 67.7 m / 65 Bells. Air spent 1→0, immediately displayed Empty / Choose gear, and its hollow WHOOSH kept the mouse visible. Selected/action captions fit the existing tray without adding guidance overlays. Desktop Staff fire displayed Wait / Ready soon and approximately 37% heat; pausing held heat at 36% and presentation clock 28.051 across observations, then resumed normally. The full desktop Staff run finished 39.7 m / 52 Bells; a 50% unaided desktop retry finished 11.9 m / 32 Bells. Both were collected and returned to ready.

All QA used saving OFF and session maps. Personal saves and legacy 18,117 points / 89 Bells remain untouched. No map migration or coefficients changed. Temporary viewport, tabs and baseline server are cleaned up at handoff; the original localhost:8080 server and continuing game/editor QA tabs remain. No warning/error logs were observed in the final game checks. Audio event/pause/envelope coherence was inspected in code and regression tests, and browser audio context was active; sound was not independently auditioned.

## Honest remaining issues and next pass

The woodland background now reads as trees instead of sage slabs, but repeated fork/crown forms are still visible. Bark depth helps, yet very wide near branches remain large compositional bands because their physical geometry is genuinely large. Starter species are easier to distinguish at phone size; expressions still cannot carry identity at every spin angle, and other species retain their existing detailed art. Native phone-browser hardware/Safari and unfamiliar-player comprehension have not been certified.

Next bounded pass should address intentional weapon timing and destination identity earlier in the arc using the existing controls and authored world, while protecting the new readable critter size and calm lens. Do not restore hidden time dilation or add filler bumpers to fit a narrow fixture. A deliberate upgrade to a few major botanical silhouettes would be more valuable than extra particles. Preserve launcher, saves, canonical map and disabled experimental guards. Public Sites release remains pending parent/user approval.
