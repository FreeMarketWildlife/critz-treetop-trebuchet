# Overnight pass 11 — default-world authority, session isolation and audio lifecycle

October 21, 2026. Started clean at `06f09243970dffc638529558e52aa7d88287870b` on `codex/custom-trebuchet-workshop`. This consolidation pass used source, in-memory stores, actual extracted application handlers, Node CPU/no-op Canvas measurements and a WebAudio double. No native app/browser, alternate UI route, unlock attempt, preview-server restoration or Sites operation occurred. No actual personal browser storage was read or written.

## Default world and saved-map authority

Fresh game/editor selection uses the same `createGroveMap` fallback: revision 7, 499 objects. The bounded audit confirms untouched revisions 2–6 upgrade in memory with zero writes, while 60 semantic edits across revisions 2–7 remain authoritative. Nine malformed/unsupported values remain byte-for-byte intact on read and after rejected invalid saves; inaccessible storage falls back without a write. Custom maps with missing or supported future revision metadata remain custom. Validation deliberately normalizes fields and locks enemy radii to their existing recipes.

Actual extracted editor handlers verify Cancel writes nothing; confirmed reset selects the canonical map; Undo/Redo restore prior/default maps; shared snapshots block Save/reset/Undo writes; removing a shared hash restores the prior local map or unsaved draft; Edit a copy is an explicit write with Undo available. Delayed snapshot decoding respects the latest navigation, including removal of a pending hash. A missing QA binding in the initial audit stub was corrected, and successful-save completion was asserted before retaining this evidence. No product map-selection defect was found. `map-authority.mjs` reproduces `map-authority.json` using only synthetic stores and element records.

Limit: intentional Save, autosaved editing, confirmed reset or Edit a copy can replace malformed stored bytes; there is no recovery backup. Startup reads themselves do not replace them. Ordinary gameplay autosaves and explicit editor actions retain their intended authority; QA must not acquire that authority.

## Demonstrated isolation fixes

Three handler regressions failed before the fix and now pass:

- A QA editor's Play/Restart iframe omitted `qa=1`. The child could read personal game/map state and follow normal audio-preference persistence. Both entry paths now retain QA; normal editor play URLs remain unchanged.
- The QA Save checkbox wrote the real `treetop-custom-save-enabled` preference even though progress persistence was separately blocked. QA and embedded-editor controls are now disabled and guarded against handler invocation. Normal saving consent and progress writes still work.
- Audio startup called the same saving helper as user changes, rewriting valid or malformed preference bytes without an action. Bootstrap now only renders the loaded/default preference. Normal mute/volume changes continue saving; QA changes remain in memory.

The tests use actual registered source handlers with DOM/storage stubs, not a native initialization or browser storage inspection. These were demonstrated permission/isolation paths; no historical personal-data alteration is inferred from the source alone.

## Structural audio audit and narrow fixes

A delayed-suspend double reproduced: Pause begins suspending, Resume sees a still-running context and returns true, then the older suspend completes and sound stays suspended. The latest desired running/paused state now controls one asynchronous transition. Context identity and generation checks isolate disposed work; a later explicit unlock can still create a fresh context. First initialization/resume starts directly in the gesture call. Rejections and partial initialization fail safely without poisoning later attempts. Seven new tests cover both orderings, repeated unlock, disposal/recreation, failures and material routing; four failed against the baseline. Independent review found no blocker.

The Grove labels ordinary floor/stone contacts `stone`, but the existing timbre table recognized only `ground`, falling back to wood. Stone now aliases the already-defined ground timbre. No new sound envelope, gain, impact schedule, voice limit or rate setting was designed.

Six half/three-quarter/full starter runs, with no weapon or three Staff hits, retained identical scheduling counters: 13–32 accepted cues per run, maximum two accepted cues in one frame, maximum three active voices. Fifty pause/resume cycles reused one context and left zero voices after pause. Mixed-family bursts respect limits 1/2/10/16 and clamp an excessive request to 16; pools return to zero after natural ends. Existing per-event throttles and gain headroom remain. A component-envelope estimate assumes unit source/filter peaks; **no PCM clipping test or listening/audition occurred**. `audio-audit.json` preserves compact before/after evidence. The native audio checklist remains necessary.

## Render/performance consolidation

No optimization was justified. At the pass-10 baseline, twelve viewport/camera scenes used 1,583–9,628 no-op Canvas commands. Two world passes measured roughly 0.15–0.21 ms in close views and 0.63–0.75 ms in whole-tree views. The contact-body correction adds six calls per visible detailed enemy; whole-tree increases were 166/172 calls. Warm landing advisories averaged about 0.022 ms across 365 frozen sampled states; cold index plus first forecast was about 0.95 ms, and the older camera forecast about 0.0022 ms. Immutable-map caches, culling and unchanged drawing budgets remain effective. These are local JavaScript/proxy measurements with noisy small deltas, **not native FPS, GPU, raster, battery or phone benchmarks**. No render or physics code changed in this pass. See `hotpath-profile.json`.

## Checkpoint and next boundary

**524/524 integrated tests passed**, Node 24.21.0, about 13.40 s. Independent session review passed all three new isolation tests; independent audio review passed 28 focused tests including all seven new lifecycle tests. The map reviewer passed 25 existing focused tests. Only demonstrated session/audio defects and affected entry/import cache URLs (version 28) changed. The canonical map, launcher, camera, art, collision response, weapons, saves and disabled experimental guards were not retuned.

[The cumulative morning handoff](morning-handoff.md) separates implemented changes from subjective/unverified outcomes and lists the exact native acceptance sequence. The previous Mac-lock denial still blocks Chrome access; no retry or alternate route was used. Preview restoration and viewport cleanup remain pending unlock. Sites packaging/save/publication remains prohibited pending parent/user approval. Continue with evidence-led acceptance after unlock rather than accumulating arbitrary tweaks.
