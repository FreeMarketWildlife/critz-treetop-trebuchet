# Overnight pass 1 — release continuity and first bounce route

October 21, 2026. Continue on `codex/custom-trebuchet-workshop`, not the older main snapshot. Start was 7afd463, one commit beyond origin. The current Sites publication is version 8, source 87c20586ed7d1616e0b09522cf149cb2a97a8a80; the delegation’s version-6 source was already superseded. Public project remains appgprj_6ad7e6e45d248191be8711c7e74d9c3b, public audience unchanged. This pass is not published to Sites yet.

## Changes

- Preserved pre-existing clean-playfield, return-to-pedestal and original weapon work in its own reviewed checkpoint. Its starting suite had 416 passing tests. No user changes discarded.
- Release camera retains the volunteer’s release-frame screen offset, eases into exact follow in 0.55 active seconds and smooths zoom. Mouse-to-whale, pauses, reduced motion and frame-rate tests cover it. The renderer no longer refits to the rig on resize. Follow size is now 7% of the shorter viewport dimension (27.3 px mouse length at 390 px width). This gives less look-ahead; speed-aware framing is future work.
- Shared default Grove is revision 5: 475 editable pieces in the existing editor/runtime model. Four visible .87-restitution mossy stem mats and an airy opening replace overlapping braking leaf fields. No global restitution, launch force or release change. Exact untouched revision-4 maps migrate; named/geometry/density/bounce edits remain intact and map reads never write saves.
- The natural starter fixture passively rebounds from the four mats at about 3.60/5.28/7.21/9.36 s and finishes around 74.25 m/15.83 s. The old default had about 26 m of forward progress and a prolonged foliage descent. The fixture’s launch record remains unchanged within 1e-10. These are controlled fixture results, not guaranteed manual outcomes.
- Impact observation measures actual contact point, normal closing speed and resolved impulse. Quiet support, grazing and compound-fixture seams no longer spam bonks/bounce counts. Events expose outward normal, normalSpeed and velocityChange. Exact per-step observation-on/off comparison confirms unchanged physical motion and angular momentum. Existing authored encounter arcade powers remain explicit and unchanged.
- Original cream/ochre impact rays, leaf debris, restrained air streaks, darker critter ink, readable moss lips and canopy light improve separation. Effects follow simulation time and respect reduced motion. Existing continuous body rotation remains physical. This is a first art pass; the world is still visually too uniform.
- `editor.html?qa=1` stores only session-scoped QA maps, enabling edit/reload/default tests without reading or overwriting personal maps. Public ordinary storage is unchanged. Packaging now includes existing clean-play/weapon styles and original SVG assets.

Final validation: **430/430 tests passed** with Node 24.21.0 on this Mac.

## Actual Mac Chrome checks

Used a separate save-free QA game. Desktop manual point drag into the sling, gravity seating, crank hold/release, flight, bounces and collection/retry worked. A weaker 67% manual throw reached 28.4 m; a full manual phone throw reached 69.9 m. After the final 7% framing change, another 390x844 manual drag/full draw released at 39.4 degrees, reached 69.1 m and collected 66 Bells; retry returned to ready and retained 66 Bells, with saving OFF. No weapon boosts were used in these throws. Bodies and rotations were not reset to force success. The camera stayed on the payload after viewport changes. Original legacy 18117/89 and newer normal-play saves were not modified by QA.

Editor QA started from the same 475-piece default. Selected First skip, renamed it, applied/autosaved, reloaded and saw the renamed object. Load starter restored the canonical First skip name. Embedded Creative playtest confirmed 475 pieces loaded. Test edits used session storage, not personal map storage. Original localhost editor and public browser tabs were preserved. Existing localhost:8080 server remains running. Final QA game/editor tabs retained for the next pass; temporary viewport override reset. No new browser warnings/errors.

Screenshots: phone-flight.jpg and phone-result.jpg are final 390x844 checks; desktop-result.jpg records the earlier full draw at 69.9 m; editor-default.jpg shows the selected canonical rebound surface after reset.

## Reference and next pass

Studied the existing Mac browser’s original Newgrounds Toss the Turtle page, tutorial and a launch/flight/ground-bounce sequence. Observed clear foreground silhouettes, muted distant scenery, active airborne intervention and concise reward feedback. No source or artwork copied, and no frame-by-frame quantitative reference measurement claimed.

Highest-value next pass: reduce empty monochrome flight time and establish stronger distinct woodland material/encounter silhouettes, then evaluate speed-aware look-ahead/zoom and weak/medium/full manually loaded launch coverage. Preserve the successful gravity-driven trebuchet. The 7% phone critter is better but still small beside the weapon controls. Do not return to lengthy experimental constraint research; those guards remain disabled.

Existing Sites publication needs a separate source-helper package/save/deploy action, using the retained project and current public audience. No source credential was created or access/security setting changed in this pass. Read Sites skill and PUBLISHING.md before release. No software-engineering skill was available in this environment or the repository’s `.agents`; AGENTS.md and relevant test/run docs were read.
