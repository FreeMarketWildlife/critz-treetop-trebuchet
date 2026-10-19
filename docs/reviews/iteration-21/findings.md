# Iteration 21 — continuous approach notice and deliberate save recovery

## Changes

Approach cues remain until the entire encounter circle clears the eight-pixel viewport rim and 72-pixel HUD band. Nearby edge cues group into a counted arrow, with up to four spatial groups. Warning radius expands to include current articulated fixture bounds; glyphs scale for narrow CSS views, with layout read once per resize. These are advisory relative-linear near-pass estimates, not guaranteed collision forecasts or reaction time. Physics, spawn geography and stepping selection are unchanged.

Malformed/unsupported startup saves disable saving and retain the original. Explicit replacement first preserves exact unreadable primary/backup bytes; displaced valid backup envelopes are archived before replacement. A valid backup is reachable even with corrupt primary, with its candidate balance shown. Failed archive writes block replacement. Save warnings survive reset until actual success. Current launch and volunteer queue remain session-only. Older opaque archives are preserved for manual/future repair, while one ordinary alternate remains directly swappable. No invented migrations or reward merges.

Cartoon encounter sheen stays within collision silhouettes. Ground impact rings are flattened ripples behind actors; reduced motion suppresses impact animation. No camera shake, physical boosts or collision bypasses.

## Verification

- Final `npm test`: **183 passed, zero failures**; twelve recovery helper tests cover malformed/future saves, exact-byte archives, interrupted writes, third alternatives, quota failures and bank idempotence. `git diff --check` passes.
- `approach-matrix.json`: 2,880 synthetic linear cases, five CSS view sizes, sixteen directions, six relative speeds (10–200 m/s), two payload bounds and three motion modes. Old helper had 2,594 cases with post-notice coverage gaps (maximum .433333 s); revised helper has zero under this protocol. Minimum first lead .818333 s. This is kinematic coverage, not actual contact or human fairness proof.
- `soak.json` / `approaches.json`: 132 actual physics attempts, 126 releases, six low-seat misses, no retained payload; 44m56.63s simulated. 258 worlds, zero retained at twelve GC checkpoints. 161,797 ten-tick batches p95 2.444542 ms, max 8.476959 ms; no source drift. Audio double ends at zero voices/nodes, not listening evidence.
- Real natural encounter observation covers 113,410 flight frames and seventeen distinct contacts across all four biomes, at up to 80.72 m/s. Minimum **continuous** warning-or-readable-silhouette interval: portrait .342917 s, landscape .292917 s. Earlier gaps remain on some approaches before those final intervals. None of these seventeen samples fell below .25 s. Iteration 20's .4096 s was FIRST notice, so it is not a directly comparable continuous metric or a guarantee.
- `approach-equipment.json` matches all 258 world identities to actual earned equipment schedules: fourteen contacts with 180 kg counter, two high winding; long/light beams, long slings and heavy/grippy frames represented. High fall speed does not establish high launch speed.
- `regression.json`: all 35 numerical rows equal iteration 20 excluding timing: 32 releases, three low-seat misses, ten angular flags. Joint stepping remains experimental.
- Final no-op canvas stress draw p95 .0549–.0995 ms, maximum .4933 ms, up to 1,701 calls. This excludes rasterization/GPU and is not browser/device FPS.

## Browser observations and preserved progress

The explicit synthetic approach fixture at 320×568 showed one readable counted arrow for eight incoming enemies, then a paused .72 s sky approach with the moth obscured by the HUD and its amber cue still visible beneath it. Critter remained foreground and unobstructed. This fixture uses actual physics and synthetic initial poses, quarter-speed playback; it does not earn money or access saves. Viewport override reset afterward. Screenshots were observed, not exported.

Separate **synthetic** localhost:8081 recovery examples verified malformed startup → Save off → reset/Next preserve bytes → explicit valid backup restore; unsupported version 99 → deliberate Keep session → exact raw archive → restore named candidate. Synthetic balances are not earned gameplay. The isolated real earned 127.0.0.1:8081 save reloaded unchanged at **1,723 points / 8 bells**, with owned 180 kg counter retained; no browser warning/error logs. Prior QA/user tabs and origins remain preserved.

## Remaining limits / next work

Human reaction, screen-reader listening, actual device GPU/audio and uninterrupted visual motion need direct testing. Acceleration, rotation and densely simultaneous threats can exceed this advisory cue model. Cross-tab ordinary autosaves have no locking; archives and paid-shot ledgers can grow; interrupted physics sessions do not resume. Prototype has six shop items. Preserve physical poor outcomes; do not select global joint refinement without broader evidence. Local commits only: no push, deployment, native unlock or blocked export retry.
