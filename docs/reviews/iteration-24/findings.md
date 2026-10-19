# Iteration 24 — a physical canopy route, recovered and verified

Recovered from interrupted implementation at HEAD ef57c6f. All partial source, tests, scripts and earlier diagnostic files were preserved. No AGENTS.md exists in this checkout or its ancestors; no .agents folder exists here. Current task notes and iteration 23 findings governed recovery.

## Gameplay change

Seven fixed short branches now give ordinary throws physical landing opportunities through the canopy: approach (42–51 m, height 112 m), fork (65–75, 88), crossing (88–99, 61), lower (112–124, 32), plus outer fork/crossing/lower routes. Gaps permit continued descent; these are passive static colliders, with existing branch contact materials and render trim. The existing long canopy branch, launch branch and ground remain.

Distant branch fixtures are constructed once after physical release. This keeps additional broadphase proxies out of winding/loading and preserves their contact order. Snapshot restoration detects the serialized static terrain body to prevent duplicate fixtures. No launch force, angle assignment, mass change, pose repair, guaranteed throw or save schema change was added.

## Verification

- Fresh recovery run: **196 tests pass**, zero failures; git diff --check passes. Tests cover serialized once-only route construction, unchanged body state/energy at construction and physical hardware/contact/economy behavior with authored canopy surfaces.
- Fresh full 35-case regression rerun during recovery: see regression.json. Recovered source hashes match the implementation; final comparisons are recorded in recovery-summary.json. The recorded 35 release objects exactly match iteration 23. Eleven angular-limit diagnostic flags and three low-winding seating failures remain; global joint refinement stays experimental.
- Recovered complete 132-attempt soak matches every tracked current source hash and reports no source changes during the run: 126 releases, six seating misses; 43 attempts contacted canopy surfaces. Twelve GC checkpoints retain zero old worlds. 132 save/reload checks and 132 stale writer blocks use doubles, not user storage. Engine ten-tick batches p95 2.551 ms, max 8.547 ms; no actual-device FPS claim.
- Earlier *-eager.json files have different articulated/world hashes and are historical candidate evidence, not evidence for the selected implementation.
- Fresh no-op render stress: 390×844 and 1000×875, with/without reduced motion; p95 .0615–.1203 ms, max 1,876 context calls. This measures bounded JS work, excluding rasterization/GPU.

The changed route removes two old angular flags and introduces three (mouse torso, salamander head, grippy-frame lizard), net ten → eleven. New maxima .1171/.1512/.08915 rad each last at most one 1/600-second outer sample consecutively, recover below the diagnostic threshold, and report zero positive energy residual. These are solver limitations, not corrected by widening limits or forcing poses.

## Fresh actual browser run

Old iteration24 tab 1219045163 could not be claimed because it remains assigned to the failed implementation session. It was left untouched. Process inspection initially hit sandbox denial; approved read-only inspection then found no port8080/8081 game server or old measurement process. Restarted one loopback-only Python server at 127.0.0.1:8080; no duplicate server or deployment.

Fresh tab 1219045169 at http://localhost:8080/?review=recovery24: actual Pygmy possum, starter hardware, target .6 winding, finite-force drag from shelf to above cradle, supporting contact, Unlatch. Observed natural flight in canopy at approximately 138 m forward/14 m high; final UI 155 m, seven bounces, 61.1 degrees /17.4 m/s. Banked **1,724 points /19 bells**, then retry retained wallet, current possum and next Frog → Snake → Snake. Actual collision identities were not instrumented in this run, so it does not independently prove which canopy branch was hit. Saving confirmed OFF; no earned stored saves changed. Browser warning/error logs empty. Sound active at35%, not audibly evaluated. Normal viewport unchanged. Tab retained as handoff, idle ready to wind. Screenshots inspected in-session only; no export attempted.

## Remaining work

Direct human reaction, real touch-device performance, audible quality and screen-reader listening remain unverified. Broader portrait all-species and natural canopy landing review remains useful; gaps can still yield ground arrivals or branch rests, deliberately. Six physical upgrades remain the current progression scope. Local commits only; no push, deployment, permission changes, software installation, native unlock or blocked export retry.
