# Overnight pass 3 — earlier landings, local landmarks and lower-route pacing

October 21, 2026. Start was clean 6860df863888667563d9e783080014edaedd5cc7 on codex/custom-trebuchet-workshop. This is the next bounded overnight checkpoint. Public Sites packaging, save and deployment remain deferred; no such action was attempted.

## What changed

`landing-view.js` makes a short, read-only ballistic presentation forecast of the next upward solid face, with a .65-second horizon. It ignores backdrop collision=false objects, drag fields, sap and future encounters outside that immediate path. A cached broad phase bounds geometry work. The renderer eases lens and position toward that landing region, then returns to travel framing; .55-second release acquisition, the same metre-to-pixel transform, continuous body angle, pause, resize and reduced-motion behavior remain. No arrows, inset or route markers were added. Reduced motion retains centered 7% framing.

The brief context lens can open to 4.5% of the shorter viewport dimension, versus 7% in ordinary fast travel. At 390 px that is a 17.55 px body-length floor. This is a deliberate readability/context tradeoff, not a claim that all targets are always visible. At the beginning of lens opening the contact point can still be outside the view; only a nearby part of the surface is visible until the eased lens catches up. The forecast approximates body contact with a radius and local gravity, so drag fields, tumbling and intervening encounters can change the physical result. It never changes solver state or acts as an aiming solution.

On identical controlled full-draw trajectories at 390x844, visibility of the eventual first contact point grows from .270 to .470 seconds before impact, second .352 to .502, third .331 to .531, fourth .298 to .498. In the medium lower route, rescue-mat visibility grows .326 to .526 and terrace .303 to .519 seconds. Desktop also improves. See `landing-view.json` and `scripts/measure-landing-view.mjs`. These are bounded contact-point visibility comparisons over the last .65 seconds, not reaction-time certification or a device benchmark. `camera-comparison.jpg` / HTML reproduce the same physical pose and world at 3.20 seconds; the mat is inside the new view while below the old one. The comparison is explicitly a renderer fixture, distinct from manual play screenshots.

The canonical editor/runtime map is now revision 6 with 497 editable objects. Twenty small noncolliding amber-pod/fern shapes give the first two landings local silhouettes. A lower optional rescue mat and broad terrace fill a medium throw's empty descent. The home branch and four successful main rebound faces are unchanged. Exact untouched revision-5 maps upgrade; edited names, geometry, bounce or density remain intact. Reads never write saved maps. No parallel default world was created.

Controlled natural draws (no manual loading) before -> after:

| Draw | Distance | Duration | Meaningful-contact pacing |
| --- | --- | --- | --- |
| 50% | 12.10 -> 12.10 m | 4.44 -> 4.44 s | unchanged |
| 75% | 36.63 -> 40.18 m | 11.93 -> 10.90 s | longest gap 5.60 -> 1.79 s |
| 100% | 73.99 -> 73.99 m | 15.83 -> 15.83 s | original four contacts unchanged |

All release fields agree within 1e-8. See `world-comparison.json`. The new lower path settles locally rather than extending the vertical descent.

Species silhouettes are more distinct: fox pointed ears/muzzle, dark paws and cream brush; chipmunk upright striped tail; squirrel curled plume; rabbit cotton tail, haunch and long ears; frog broad face and webbed folded hind feet. Existing physical size, first body rotation and head/tail flex are retained. All eleven species across seven poses stay finite, balanced and within draw budgets; ready silhouettes fit existing display bounds. `art-review.jpg` uses current game drawing functions and the canonical world.

## Settling investigation

No physics retune or early termination was justified. In the 600 m zero-drag test, first contact is 11.097 s. Real rebound apex heights include 202 m, 68 m, 23 m and 7.7 m. Speed remains above 1 m/s until 42.904 s; finish is 43.985 s. Quiet speed-below-.16 aftermath is .802 s, matching the existing .8 s rest dwell. Tiny contact chatter ends in .810 s; recoverable low hops and slow-center spinning whales remain live while motion can affect contact. Four regressions and `scripts/measure-settling.mjs` document this. See `settling.md` and `settling-timeline.json`. The long extreme fall is intentional decaying flight, not a demonstrated pathological rest tail. Ordinary-ground material response remains .58 restitution / .16 friction. Launcher, loading, weapons, guards and body dynamics are unchanged.

## Verification on the connected Mac

Final full suite: **450/450 tests passed**, Node 24.21.0. Native Chrome desktop (1726x819) and an explicitly verified 390x844 viewport exercised direct body drag and keyboard physical-drop loading, hold/release, landings, repeated rebound and collection/retry. No weapon boosts used. Manual bodies are not forced into a repeatable pose, so observed numbers are not deterministic balance targets:

| Viewport | Draw | Distance |
| --- | ---: | ---: |
| Desktop | 48% | 10.1 m |
| Desktop | 75% | 42.4 m |
| Desktop | 100% | 61.8 m |
| Phone | 48% | 14.4 m |
| Phone | 75% | 44.4 m |
| Phone | 100% | 47.3 m |

The desktop medium throw visibly rebounded above the new terrace with the relevant surface and critter in view (`desktop-terrace.jpg`). The phone lens-opening screenshot records the early approach, with surface entering the bottom of the view; it is not mislabeled as a fully framed contact point. Full phone finished at 39.3-degree release / eight meaningful hits, collected 56 Bells and returned to ready / zero draw. QA saving was OFF. Temporary phone override was reset and actual dimensions returned to 1726x819.

Editor QA upgraded the untouched saved test map from 475 to 497 pieces. Selected the new terrace through map navigation, renamed it to `QA pass 3 terrace`, applied/autosaved, reloaded and verified the name. Restored starter, selected again and verified canonical `Low route · mossy landing terrace`. Embedded Creative loaded 497 pieces and Creative=true. All edits used session-scoped `?qa=1`, not personal map storage. Editor screenshot shows the actual canonical selected terrace after restore. No game/editor/phone/comparison warning or error logs appeared. Existing server, unrelated browser tabs, legacy 18117 points / 89 Bells and normal saves were untouched. QA game/editor tabs remain for continuation; temporary review tabs are closed.

## Remaining design issues and next pass

Phone context improves, but the critter becomes smaller near landings, and even .47 seconds of visibility can feel brief at speed. Lens breathing and target switching need more subjective play review, especially around large-body or encounter-driven flights. The short forecast deliberately does not show the whole route and is approximate. Medium pacing improves; full throws still have a 4.56-second gap after the fourth mat before the next substantial surface. Small first-impact landmarks help orientation but do not solve every empty stretch or the overall muted atmosphere. Some volunteers still share torso proportions despite stronger species outlines. No physical-device FPS, certified material model or incomplete constraint benchmark is claimed.

Next bounded pass: improve the full-throw canopy-exit transition through the same editor data model, add a distinct landing/encounter beat without trapping lower throws, and play-review camera breathing and weapon timing at those landings. Preserve the successful launcher and do not cut legitimate high-energy rebounds to shorten a run. Public Sites publication requires the parent/user release confirmation; do not deploy automatically.
