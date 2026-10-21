# Overnight pass 2 — woodland materials, expressive motion and ordinary-ground rebounds

October 21, 2026. Started from clean 56977a70819bf30ed28aac2f80ed0caf1133d876 on codex/custom-trebuchet-workshop. This is a bounded checkpoint for the continuing overnight work. No Sites package, save or deployment was performed. Existing public version 8 remains separate from this source checkpoint.

## Changes and evidence

- Speed-aware follow preserves the .55-second release acquisition and physical orientation. Its eased lead is bounded to 17% of viewport width / 10% of height. Slow travel grows the critter to 9% of the shorter dimension, easing to the existing 7% readability floor at high speed. Rebounds and direction changes ease the lead rather than chasing a lagging body position. Pause, resize, reduced motion and mouse-to-whale coverage pass.
- Original canvas art now uses warm chestnut/honey wood, moss lips, cool slate facets and stronger dark outlines. Bounded grain follows the actual sloping editable faces; thick bough grain stays near the visible surface. Knots, facets and tufts decorate existing geometry without changing it. The immense crown and distant forest are cooler and quieter, with sparse curved lianas and four botanical spray families replacing dense repeated leaves. The ordinary ground has an opaque moss/peat contact edge exactly at its physical height.
- Volunteers have stronger outlines, hard body shading, muzzle patches and more readable eyes. Paws, gaze and damped head/tail motion respond to rising/diving/floating travel. After a hit the expression recovers from stars to flight after .62 simulation seconds; accumulated bruises and bandages remain until retry. No rotation, angular momentum, launch force or loading pose is reset for illustration. All eleven species' finite draw-command and animation checks pass. Species silhouettes still need more individual character.
- Ordinary built-in ground, only after release, now resolves critter contact with .58 restitution and .16 friction. Launcher hardware, pre-release contact and per-object authored bounce coefficients are unchanged. The change is passive contact balance, not an upward or forward boost. Controlled comparisons at 4/12/24 m/s forward and 3/7/12 m/s downward from .6 m above ground give first rebound heights of .45/1.44/2.96 m versus .36/.77/.92 m before. All settle, total payload energy does not increase, and subsequent impact energy declines. See ground-feel.json and scripts/measure-ground-feel.mjs. These are bounded simulation comparisons, not real-material certification or device benchmarks.
- Canonical editor/runtime default remains revision 5 with the same 475 pieces and four authored mats. No parallel default world or map migration was added. Runtime entry/import cache versions advance to 19.

Final complete suite: **437/437 passed**, Node 24.21.0 on this Mac. Original experimental guards remain disabled. Two existing checks were updated for intentional behavior: expression recovery now expects flying with injury tier retained; the 600 m no-drag fall gets 50 seconds to settle (observed 43.985 s), rather than the old 36-second bound. Floating constructor-vs-redraw parity now directly checks release time/position/velocity/speed/angle/energy within 1e-8, completion and bounce count. Its pre-existing release roundoff (~3.26e-10 m/s, 1.72e-9 degrees) is identical with old/new ground policies; six rotating rebounds amplify final range difference to .00245 m. A separate 1 cm final-range bound remains.

## Actual Mac Chrome playtests

Separate save-free QA tabs, desktop 1726x819 and verified phone viewport 390x844. Native direct mouse drag and keyboard physical-drop loading, crank holds and natural release were exercised; no weapons or boosts were used. Manual loading gives different bodily approach/spin, so these are observed outcomes, not deterministic balance targets:

| Viewport | Draw | Distance | Result |
| --- | ---: | ---: | --- |
| Desktop | 48% | 10.0 m | 2 meaningful hits, collected/retried |
| Desktop | 73% | 32.3 m | completed, collected/retried |
| Desktop | 100% | 51.7 m | 6 meaningful hits, completed |
| Phone | 48% | 11.3 m | 2 meaningful hits, collected/retried |
| Phone | 73% | 58.7 m | 4+ meaningful hits, completed/collected |
| Phone | 100% | 37.9 m | 5 meaningful hits, completed/collected/retried |

Follow acquisition stayed .55, the payload remained inside the view, and visible mat contact led to rebound and recovery poses. Final full phone shot released at 38.9 degrees; retry returned to ready / zero draw with saving OFF. These canonical-route throws land on authored boughs/mats. Ordinary-floor gains above were tested separately in controlled simulations, not claimed as a manual 600 m free-fall playtest.

Editor QA manually saved, restored starter, reloaded and retained 475 pieces. Embedded Creative playtest loaded those same 475 pieces with Creative true. Prior pass's renamed-object save/reload coverage remains in the regression suite; personal map storage was never used. No warning/error logs appeared in game, phone, editor or art-review tabs. Temporary viewport override was reset. Existing localhost:8080 server, unrelated tabs, normal saves, legacy 18117 points / 89 Bells and other projects were untouched.

Screenshots: phone-flight.jpg / phone-result.jpg, desktop-result.jpg, editor-default.jpg. art-review.jpg renders the actual current art functions and canonical map at inspectable scales; art-review.html is a local inspection sheet, not a second game.

## Remaining issues and next pass

At 7% critter size, a small mouse still shows only a few metres across portrait width. Eased camera lead helps immediate landing visibility, but upcoming targets often enter late; this is not solved. Flight can still feel empty/monochrome between nearby surfaces. Strong manual throws are not guaranteed to outdistance medium ones because pose, spin and exact contact matter. Very weak quarter-draw can still snap the cord under the unchanged mechanism. The bouncier floor prolongs extreme descents; a 600 m zero-drag fall settles around 44 seconds. No phone hardware FPS, frame-by-frame reference tuning or incomplete experimental benchmark is certified.

Highest-value next bounded pass: author clearer landing landmarks and richer local silhouettes through the existing map model, especially around the first two impacts, and improve small-species silhouette identity. Evaluate a landing-aware framing/composition solution that exposes the next target while keeping phone critters readable, without weakening release continuity or adding intrusive guidance. Keep assessing the repeated bounce loop against actual screenshots. Public Sites publication is explicitly deferred to parent/user confirmation; do not deploy this checkpoint automatically.
