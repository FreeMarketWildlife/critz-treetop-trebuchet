# Iteration 14 — physical recovery, input ownership and sustained play

Current local game implementation after04efa2b. No push, deployment, paid asset, unlock shortcut or blocked export retry.

## Changes

Winding now follows press/hold/release on pointer or Space/Enter. Release samples elapsed hold time once; repeats, foreign pointers, cancel, capture loss and blur cannot commit an extra wind. The accessible range also permits a direct target, including keyboard adjustments; assistive button activation uses its chosen target. The selected meter stays visible while the real torque-limited motor moves. No payload/arm snap, hidden velocity change or stable-contact timer was added.

A loading coach reports current contact, relative load motion, cradle speed, bead escape, motor stall and observed contact loss. A ready moving load can still be unlatched; a warning does not invent a stable state. A low-winding or slipped setup offers **Retry this volunteer at medium winding**. This constructs a fresh finite mechanism and physically winds it to the explicit middle target; it preserves the volunteer and queue, and banks an already released shot once. Reset/Next validate a replacement scene before discarding the current one; failed hardware cannot consume the next volunteer. Existing heavy/head-grip advice remains.

Manual Pause and visibility/focus lifecycle handling freeze simulation time, clear pending grip/steering/winding input and cancel preview work. A frame clock discards long wall-clock gaps on resume. Audio voices are stopped/disconnected and an existing context can suspend/resume through a gesture. Reset clears transient effects; the renderer releases its previous flight-scene reference on an idle draw. A bounded240-frame CPU sample window and public lab counts expose current simulation time, bodies/joints, encounters, audio voices and an optional browser heap estimate.

## Sustained soak

`node --expose-gc scripts/measure-soak.js` completed132 natural finite-force attempts across all11species, low/middle/high targets and head/torso grips. Upgrades were bought only with the soak's earned in-memory rewards; user saves were untouched. There were127releases and5seating failures over2629.34simulated seconds (43m49s),140.13seconds wall time. Every released shot continued15seconds with seeded encounters. End-of-cycle parts stayed finite, active encounter/event collections stayed bounded, repeated bank IDs paid nothing extra, retry observations preserved the queue, and Next shifted one volunteer. These are bounded soak checks, not proof against every possible exploit or transient defect.

All259 original/canonical-cloned worlds were tracked by WeakRef. At12event-loop/explicit-GC checkpoints, zero old worlds remained. Post-warm heap changed from8.853MB at22cycles to9.487MB at132 (+0.634MB), including accumulated measurements, JIT state and the persistent reward ledger. This is evidence against retained simulation worlds, not a claim of zero allocation or an indefinitely flat browser heap. The ledger intentionally retains127completed IDs; very long-term ledger scaling remains unmeasured and is not solved by unsafe ID eviction.

157760ten-tick (~60Hz) engine batches: p95 **2.687ms**, first-quarter p95 **2.584ms**, last-quarter p95 **2.649ms**. Maximum **13.371ms** is retained, so the4ms budget was not met in every batch. This measures Node engine work, not mobile/browserFPS. No sustained upward p95 trend appeared in this run.

A deterministic WebAudio double scheduled the actual cues and ended scheduled sources while simulated time advanced: one context, maximum4voices/30connected nodes, zero final voices/nodes after disposal. Periodic pause/resume used that same context. Actual browser audio showed voices returning to zero; audible mix/quality remains unverified.

See `soak.json` for rows, counters, heap checkpoints, timings and source hashes. A first successful132-cycle computation hit a diagnostic-only spread-argument limit while aggregating its157kbatch samples; the script now uses a reduction. The fully repeated run above produced the retained evidence and tracks canonical worlds as well.

## Material joint warning

`incoming-owned-frame-heavy.json` freezes the natural heavy-frame lizard's ground arrival. The reproducible rear-leg angular excess is0.272689rad, above0.08rad for **one outer600Hz sample** (~1.67ms); articulated anchor gap in this response is0.000589m, and positive energy residual is0. At one second it has recovered below the diagnostic angular threshold.

The controlled iteration study in `joint-recovery.json` keeps positions/velocities/geometry/mass/material/limits identical. Doubling position iterations12→24 does not reduce the peak. Raising velocity iterations20→40 yields0.271792rad, still the same warning. These are rejected cost increases; production solver settings are preserved. Timing comparisons in this small cold/warm study are noisy, especially alongside other work. A regression now guards finite recovery, unchanged limits and energy without pretending the defect is fixed.

The35-case natural-launch diagnostic remains32releases/3low-winding seating failures. All canonical predictions exactly match live continuation without mutation. No nonfinite, rope, surface or positive-energy fault. The remaining18angular warnings,5branch impacts and1backward/vertical shot persist; whole-run maxima0.272689rad/.033266m. The dedicated turtle-tail regression remains green.

## Browser review and limits

**150tests pass**, including hold/release ownership, pause clock gaps, bounded metrics, loading reasons, audio pause/resume, real-world render/resize immutability and saved-joint recovery. `git diff --check` passes.

Native Chrome checks: a real1000ms pointer hold and1000ms Space hold both selected normalized meter0.49 and began motor motion on release. Direct keyboard minimum selection exposed low-winding guidance; the medium retry kept the Lizard and wallet16352/74 with the same preview queue. Invalid long-arm0 followed by Next reported the construction error while preserving that queue/wallet; restoring valid hardware allowed retry.

On the final runtime, a live sticky grip was dragged over the cradle, then a390×844resize released it with explicit guidance. The load settled through gravity/contact and enabled Unlatch. A real launch was resized to844×390 during flight and manually paused. Its public elapsed-time reading stayed **97.36s** across a later observation, with zero audio voices; resuming restored live flight without wall-time catch-up. The normal viewport was restored. The flight later showed164m/five impacts,18bodies/seven encounters, zero audio voices and recent frame CPU p95 around2.40ms (a short Mac sample, not sustained deviceFPS).

Bank→retry→second Reset retained **18117points/89bells**. Next-three remained **Turtle→Turtle→Snake**; valid repeats remain intentional. Owned180kg counterweight/long sling/grippy feet remain. Tap-to-hold was restored off; Sound on35% was retained. No browser warning/error entries. The final local tab is idle/open.

The automation browser continued reporting the game document **visible** even when its temporary blank tab was selected, so genuine hidden-tab transition behavior was not verified end-to-end there. Manual pause, clock-gap tests and lifecycle source handling are verified; real browser/device hidden/focus behavior is still a direct-device check. No blocked exports were retried or screenshot files persisted.

Next: investigate the remaining brief leg-contact angular violations from the frozen fixture with a physically defensible geometry/inertia experiment; keep low-winding recovery honest. Longer browser/device soaks, hidden-tab behavior, audible mix and very long-term reward-ledger growth remain limits. Do not substitute old lore completion for current game progress.
