# Iteration 13 — readable volunteers and fair arrivals

Local game implementation after 9bb1f71. No push, deployment, paid assets, unlock shortcut or blocked export retry.

## Species identity and real response

Original body-following markings now distinguish turtle shell plates, armadillo armor bands, the snake's alternating linked segments, squirrel membrane/tail accents, chipmunk stripes, salamander spots, lizard tail chevrons, mouse/possum fine tails, marmoset limbs and frog folded legs. Every marking is clipped to its body's actual circle/capsule/box silhouette. The static next-three portraits use those same authored shapes and markings; live physics is never replaced with a portrait pose. Current-volunteer text gives a concise handling distinction; the hardware lab exposes each part's actual mass, friction and restitution. These are prototype units, not anatomy measurements.

The mass/shape/contact parameters are preserved from iteration 12. Species share base restitution .32; it would be misleading to claim eleven unique bounce coefficients. Distinct rebound and ground travel arise from articulated geometry, mass distribution and friction. Squirrel alone uses the existing passive membrane/tail aerodynamics after release; its outdated source comment has been corrected. No powered shell roll, automatic frog jump, launch boost or new ability was invented. All volunteers retain infinite health.

`node scripts/measure-species-identity.js` records `species-study.json`: 100 seeds ×1000 draws produce 147 squirrels out of100000 (configured probability .15/100.15, about0.15%). Each common species appears9837–10132 times;10027 immediate repeats are valid. Deterministic next-three shift tests verify current/next advancement and detached previews. This demonstrates seeded diversity, not impossible uniqueness or a guarantee for one short session. The lab selector intentionally allows visual/physics review of every rig; selecting a squirrel there is not evidence of a rare queue draw.

The same explicit synthetic ground arrival (COM50m,4m; velocity8,-12; no input;1second600Hz with adaptive2400Hz contacts) tests all eleven rigs. Post-impact COM peaks range .210–1.034m. All remain finite, maximum angular excess .036693rad, anchor gap .000247m, and maximum positive energy residual0. This measured regression protects the iteration12 turtle fix and adds all-species coverage; it does not erase the more severe natural-launch warnings. Squirrel's negative aerodynamic work is retained, not mistaken for a powered rescue.

## Fair encounters and quiet pinball feedback

New births are rejected when their relative linear motion would intersect the player's padded travel corridor in the next0.4seconds. Existing bodies keep their trajectories and real dynamic contacts. The existing full-fixture overlap rejection, .25second birth window, .8second post-launch quiet period, eight-body cap, seeded schedule and spawn/despawn work accounting remain. The rule is a short linear reaction allowance; it does not predict all curved motion or guarantee every encounter avoidable.

Regional checks sample12seeds over60seconds of moving travel in each biome and observe both kinds in all four pools, including canopy and floor. Static authored terrain is unchanged: bumpers start beyond25m of forward clearance; the finite canopy branch spans x170–230 at105m; the ground is continuous. There is room around obstacles and no newly generated terrain. Long glides can pass beyond the seven fixed bumpers; encounter pacing at those distances remains a tuning opportunity.

Impacts now report the actual contact point for a brief material-colored expanding ring and, on stronger hits, four small sparks. The solver impulse, restitution and force are unchanged. Effects remain bounded to20, last0.4seconds and are disabled by reduced motion. No camera shake, long trails or screen-filling flash was introduced.

## Checks and observed browser play

142 automated tests pass, including all-species arrival energy/joints, weighted queue samples, portrait clipping/state restoration, biome variety and moving/reverse/descending reaction corridors. The final35-case natural-launch diagnostic remains32releases/3low-winding seating failures. Every released canonical prediction equals live continuation and leaves live state untouched. No nonfinite, rope, surface or positive-energy fault. Remaining18angular warnings,5branch impacts and1backward/vertical shot persist (max.272689rad/.033266m). Source hashes and no-mid-run-source-change assertion are in `regression.json`. `git diff --check` passes.

Native Chrome review: turtle plates, armadillo bands, snake segments and squirrel membranes/trait text were inspected in the live close-up and at small setup scale. Next-three portraits correctly displayed repeated mice and then shifted Frog→Turtle→Pygmy possum into the next current/preview after a bank. Portrait390×844 fits three cards without horizontal spill; the main scene remains scrollable, and real finger pickup remains unverified.

A lab-selected squirrel was physically loaded/unlatched with owned180kg counterweight/2.9m sling/grippy feet. The renderer followed its tree, open-sky, long-canopy and forest-floor travel;843m/3impacts was observed before banking. Ground fungus art was visible. The earned saved wallet reached15599points/57bells; Next volunteer advanced to the previously shown Frog and the preview shifted correctly. That long-glide visual run preceded the final reaction-corridor filter; the final filter was then loaded for a separate live lizard check. No claim of audible quality or real-device FPS is made.

Next: isolate the remaining natural-launch joint-limit maxima from identical incoming states and test fair encounter pacing on very long glides. Short low-winding seating remains a usability problem. Preserve finite launch energy and do not widen limits or overwrite poses to remove warnings.

Final reaction-filter runtime browser check completed separately: real lizard load/unlatch,60m/six impacts observed with floor beetle/fungus visible; Bank→retry→second Reset retained16352points/74bells. All three owned items remain. No browser warning/error entries. Sound preference remains35%/on; audible mix unverified. Viewport restored and final local tab idle/open. No screenshot or clip export attempted.
