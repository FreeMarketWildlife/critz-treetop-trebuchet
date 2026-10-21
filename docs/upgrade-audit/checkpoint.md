# Upgrade and altitude checkpoint — October 21, 2026

Started clean at 2c7d12714bfb65d1bf33bfd5909b5bb81967829f. User explicitly confirmed the Mac was unlocked. The prior native Chrome action was retried successfully; no Codex UI inspection or route around the earlier denial occurred. GitHub commit/push are authorized. Sites packaging, saving and publication remain pending approval and were not performed.

## Changes and complete audit

- All 48 persisted parts / 12 slots are inventoried in catalogue-audit.md, with complete deterministic measurements and purchase/equip/in-memory save proofs. Every compatible intended example releases without a failure. Each part reaches distinct actual renderer output at unchanged chosen dimensions. All existing ownership, IDs, currency, dimensions and save schema remain compatible.
- Capacity purchases keep player-chosen dimensions/fill. Numeric specifications now explain limits, actual settings and moving-mass tradeoffs. Fine-tune limits follow the fitted hardware. The old 1.65-second preparation display is replaced by an estimate integrating the real loaded three-second governor and power limit.
- Frame, ballast cage, beam, pouch, cord, bearing, release and trough artwork now identifies equipment tiers. A winding quadrant previously hid the bearing cap; the cap now paints last at the same pivot. Treatments stay clipped to members or attached at real coordinates; no collision geometry, launcher energy, camera or world layout was changed.
- A slim right-edge, height-only strip reuses the actual species portrait and world altitude. Floor, tree centre/crown, starlight and upper map range follow current/custom maps. Its nonlinear upper sky is visibly marked. Below/above-range arrows and accessible numeric readings are bounded; X has no effect. A final independent review found and corrected the accessible gravity reading for a seated volunteer on an unusually tall custom rig: the strip now uses the actual solver factor.
- One native immediate short draw remained ready at 22% after release. A bounded irregular-frame reproduction establishes a plausible cause: transient real basket contact loss. The rejection now explains that the volunteer is settling; actual pose/motion/draw are preserved and reseating cannot auto-launch. Five instrumented native immediate releases accepted afterward. This does not establish the exact original frame history or eliminate legitimate unsupported-release refusals.

## Native evidence and remaining limits

Fresh native Mac Chrome loaded build 28 before changes and build 29 after integration. Desktop view was 1726x819 (initial full window 1726x875); phone override was 390x844.

Before the new changes, actual keyboard weak/medium/full throws, drag loading, weapons, pause/resume and repeated collection worked: medium 32.2 m; full 72.4 m with one Slingshot; unaided drag/full phone 69.9 m. Staff raised heat to 39%; Air consumed 1 to 0 and showed Empty. These are loose native input observations, not matched balance comparisons. A phone landing screenshot identified opening-skip-4 and the corresponding visible leaf mat.

After integration, native Creative selection visibly changed Sapling to Leviathan, Boulder to Continental, and Bronze to Precision without changing the 1.2 m axle or 6,000 g fill. Limits became 220 m and 15,000,000,000 g. The exact 0.0005 bearing coefficient and ~3.0 s estimate render in the workshop. Tiny pins/cord details are still limited by physical display size; render traces alone do not establish novice recognition.

The final full phone throw reached 73.0 m and collection returned to ready at 600.218 m. The marker matched actual altitude (604.023956 m versus rounded stage 604.02) and retained identical height/fraction across a paused phone-to-desktop resize. Pause reported suspended audio; later Resume/weapon action returned running. No user audio audition answer was received, so perceived clipping, loudness and atmosphere remain unaccepted.

In editor.html?qa=1, placing and renaming a large fungus produced 500 pieces, Save/reload retained 500, and Play/Restart retained creative=1&editor=1&qa=1 with 500 runtime pieces. Confirmed reset gave the canonical 499; Undo restored 500 and Redo restored 499. The temporary contact-body capture shows the physical circular body and decorative cap. The editor was left at 499 with playtest closed; the game was left paused/ready in its normal desktop viewport. Task-owned preview server is restored on 127.0.0.1:8080; unrelated tabs and servers remain untouched.

Current screenshots are in screenshots/. They show page content only. Source/Node testing covers extreme/legacy/custom heights, finite rendering, all species, capacities, interruption and save authority; native extreme-space trajectories, every individual upgrade throw, fresh novice comprehension and a full audio audition are not claimed.

Final local regression suite: **595/595 passing** (Node 24.21.0, about 14.0 seconds). The final checkpoint SHA, exact remote verification and CI result are reported with delivery.

## Unresolved decisions

1. Bearing friction works but bronze to precision yields only 0.042–0.078% release speed across tested scales. This remains a balance limitation; the good baseline was preserved rather than inventing a range multiplier.
2. Existing gravity fades to 14%, never zero, and there is no true escape state. The user was asked whether the map top should become a zero-gravity success/drift state with Collect/Retry, or retain reduced-gravity flight. That consequential physics choice is pending. Heights alone never claim escape.
3. Public Sites deployment still requires approval. The existing public URL has not been updated or retested by this checkpoint.
