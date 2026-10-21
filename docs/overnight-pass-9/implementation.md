# Overnight pass 9 — keyboard hold ownership and bounded loading reproduction

October 21, 2026. Started clean at `41e8d45b2b428ee3bcbd100b3158f9baca18b7e0` on `codex/custom-trebuchet-workshop`. Work used repository inspection, Node state/physics tests and an independent code reviewer. No native app, browser, alternate UI route, unlock attempt, local preview server restoration or Sites operation was used.

## Demonstrated input bugs and fix

The baseline launcher button used the same `launcher-key` owner for Space and Enter. Holding Space, then pressing and releasing Enter, fired the Space hold while Space remained down. Holding either key on the launcher, tabbing to another control, and releasing the original key left winding active: the button missed keyup and the document handler ended only the different stage `space` owner. `keyboard-before.json` records these extracted-handler reproductions. They do not establish what caused the earlier native partial-draw refusal.

Each launcher key now owns its own ID. Button focus loss cancels only those keyboard IDs; stage focus loss cancels only its Space ID. Document keyup also ends the matching keyboard owner, making a bubbled or late duplicate release harmless. Numeric pointer owners remain independent. Global window/modal/visibility interruptions still cancel, and `applyBuild` cancels before replacing the simulation, so an old release cannot fire a retry. No launcher geometry, winding, timing, loading support, pose, velocity or launch physics changed. Only the HTML application entry cache changed to version 26; dependency URLs remain at their existing versions.

`test/launcher-keyboard.test.js` runs the actual registered application keyboard handlers with the real hold controller in a Node VM. Its six tests cover normal Space/Enter, foreign release, Tab/blur cancellation, repeats and late release, modal/window/hidden interruption, pointer preservation, and stage Enter loading. Two failed against the baseline and all six pass after the fix. This is a synthetic event/focus harness; it does not certify native browser default actions or OS keyboard ordering.

## Immediate partial-draw refusal: not reproduced

The bounded matrix uses the real current starter, canonical revision-7 default map and jointed loading physics. At 120/60/30 Hz, it begins winding at the first observed physical basket support or after 0.1/0.5/1 second, then releases after nominal 0.6/1.5/2.25/3 seconds. Duration is rounded to whole frames, so the nominal 75% case at 30 Hz reaches 75.56%. All **48/48** releases were accepted, including every immediate first-support case; first support appeared at 0.15–0.167 seconds. Actual loose pose and existing linear/angular motion are preserved on transfer. `loading-matrix.json` stores the measurements; `test/loading-partial-draw.test.js` reproduces them and asserts transfer invariants.

The trace found brief loss of basket contact during the first 0.017–0.067 seconds of winding in some cases. All recovered before 0.1 seconds, below the existing 90 ms tap-cancel threshold. `support-trace.json` records those intervals. This does not reproduce a refusal at half draw and does not justify sticky support, pose snapping, a grace timer, or a physics retune. Variable browser frame cadence and arbitrary pointer-dropped poses are outside this bounded matrix and remain possible sources to observe after unlock.

A second physical regression repeatedly requests assisted drops before landing, then cancels three head-point drags and reloads before a fresh half-draw launch. No interruption launches, an active drag rejects keyboard loading, and a fresh supported release works. No personal storage is involved.

## Validation and review

**511/511 integrated tests passed** locally (Node 24.21.0, about 13.57 seconds). Independent read-only review found no blocking correctness issue and passed 25 focused input/weapon tests. Existing renderer resize tests retain acquisition and motion across desktop-to-phone fitting without changing physical rotation. Existing weapon tests cover blocked winding/pre-release/finished states, shared cooldown, paused physical time, heat, reset and ammo. Pointer cancel/lost capture still cancel the matching owner and loading drag. No additional demonstrated pointer, resize, retry or weapon-transition bug was found; none of those routes was redesigned.

QA map tests use in-memory local/session adapters, with QA edits/reset/reload isolated from personal maps. Game QA selects the canonical default directly; editor QA uses prefixed session storage. Map migration reads do not write storage. Canonical default remains **revision 7, 499 objects**. Personal browser saves, including legacy 18,117 points / 89 Bells, were not accessed or changed. Existing disabled experimental guards remain untouched.

## Blockers and handoff

Native Chrome access remains **denied from pass 7**: selecting the continuing QA game tab for viewport cleanup reported that the Mac was locked and automatic unlock could not unlock it. There was no retry or alternate route in this pass. New manual-unlock evidence is required before resuming that action.

Pending after unlock: restore the project's absent localhost:8080 preview server, verify native desktop/phone loading plus mixed-key/focus/hold/retry behavior, complete pass-7 midrib and pass-8 impact/HUD/audio checks, and reset only the continuing game QA tab's 390×844 override. The editor override was already reset. The absent server was observed at the end of pass 8; this pass made no server changes. Preserve unrelated tabs, servers and settings.

Sites packaging, save and publication remain **prohibited pending parent/user approval**. No new public release is claimed. This is a tested source checkpoint with native gameplay/visual/audio acceptance outstanding.

Further useful independent work is a bounded audit of decorative versus physical hit geometry and the existing landing-prediction limits, using source and preserved screenshots. The highest-value next design step after unlock is observing an actual player distinguish target, contact source and Fire timing; source correctness is not novice-comprehension or funness evidence. Continue the overnight project from this checkpoint rather than treating this pass as the final release.
