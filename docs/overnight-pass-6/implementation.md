# Overnight pass 6 — earlier, tentative landing notice without changing flight

October 21, 2026. Started clean at 53385c77b0ee479c95bcd12f7f26430d6fc0e88a on codex/custom-trebuchet-workshop. This is another bounded checkpoint in the ongoing overnight work. No Sites operations were attempted.

## Player-facing changes

One optional, hollow mark gives notice of an incoming solid surface on a clear descent. If the region is offscreen, a small chevron approaching a surface-like cap sits inside the view edge; when it enters view, three short broken strokes sit on the surface. There is no trajectory line, ETA, countdown, pulse, zoom change or automatic slowdown. It is a tentative region, not a guaranteed hit or steering instruction. It stays clear of the stats, weapon tray, pause button and volunteer. Foreground art draws over it; uncertain paths produce no mark. Overview, detailed parts view, preparation, finished runs and pause show no mark. Pause → Options contains the session-only Landing marks switch and its uncertainty description.

The first 12 px glyph was too quiet in actual phone screenshots. An independent review found it looked like a twig even when its location was known. The final roughly 24 px hollow chevron uses a dark outer/pale inner stroke, a short landing cap and .85 maximum opacity. It stabilizes on one current surface ID for .08 s, fades in briefly, and disappears immediately on target loss. It never reuses the camera's held target.

Fire retains its selected weapon, ammo and physical effects. Its small caption reports actual motion: Rising · speed, Level · lift, or Falling · lift. Level is used instead of claiming to know the apex from one velocity sample; slow/rest states keep Lift + speed. Empty, Wait and Cooling states take precedence. The caption explains the available effect without recommending an optimal firing instant or promising more distance. A successful weapon hit explicitly clears the landing mark, then fresh physical velocity determines whether a new one is appropriate.

## Conservative forecast and independent review

The existing .65 s ballistic camera forecast remains unchanged. Extending it naively to 1.2 s produced up to roughly 1.34 m point error in the sampled defaults, so it was not used for the visible mark. The new pure landing-opportunity helper looks at most .9 s ahead, reconstructs COM from the actual body origin, and models current drag, wind-relative airspeed, altitude air density and gravity. Nested rotational envelopes must agree on one upward face within bounded uncertainty. It suppresses current contacts, launcher returns, intervening foliage, sap, enemies, side/underside faces, corners, ambiguous bodies and budget-exceeding maps. No live environment history or body is stepped by the helper.

Independent review found an initial gap between outer-envelope first touch and inner-envelope later touch. A second full outer-corridor check through the later ETA now rejects hazards inside that interval; dedicated enemy/field/sidewall regressions cover it. No force, body pose, terrain, enemy behavior or weapon coefficient changed.

Two bounded natural-state measurements are preserved separately: the owner's per-frame sampling emitted 646 opportunities across weak/medium/full runs; the independent roughly .04 s sampling checked 260. Neither found a wrong next solid face in those default mouse trajectories. Independent actual contact points stayed inside the advisory spread plus 3 cm; observed max point/ETA errors were .081 m / .023 s. These are observations from that sample, not a numerical guarantee for other volunteers, maps or interventions.

## Visible notice, physics parity and tests

Final integrated suite: **483/483 tests passed**, Node 24.21.0 on this Mac. New coverage includes drag/wind/rotation, apex/current contacts, side/corner/field/enemy occlusion, late intervening hazards, malformed/index budgets, HUD/body occlusion, cue stability/loss/boost/retry/pause and motion captions. Art tests cover fixed silhouette variation, exact geometry and bounded drawing.

`scripts/measure-landing-cues.mjs` runs 48 controlled cases: cue off/on × weak/medium/full × no actions/Slingshot/Staff/Air × 390×844/1726×819. Actions trigger at fixed physical ticks. All finish within 17.633 presentation seconds. Recorded physical duration, range and camera zoom variation agree across every paired cue-off/on case. The camera and launch-feel algorithms are unchanged. The helper's map index and render state cannot impart momentum or alter stepping.

After the final fade, HUD/body exclusions and viewport layout, the full phone's first four meaningful contacts have **.737 / .742 / .745 / .736 s** of alpha≥.5 notice. The first canopy exit has .736 s; a later rebound has .481 s and a small later one is omitted. The corresponding terrain itself entered the prior pass's phone view around .37–.42 s before the main contacts. This adds useful preparation context while retaining the 26.13 px nominal critter floor; it is not evidence that an unfamiliar player can learn, choose and aim a new action within that interval.

The Node helper timings in forecast-owner-summary.json are diagnostic only, not phone FPS measurements. Raw independent frozen traces remain in /tmp; summaries and a portable final matrix runner are committed. No incomplete physics benchmark is being certified.

## Woodland composition

Three deterministic crown families, varied lean/proportions and staggered heights replace the repeated fork-and-oval stamp. True smaller distant projection is preserved. Near wood uses smooth contour-aligned cylinder lighting and fewer long bark seams instead of orange angular patches and hard brown bands. Noncolliding back wood eases from .52 opacity in broad views to .20 close up; editor views retain their prior opacity. The decorative bough now reads behind the opaque interactive mats instead of resembling solid terrain through which the critter passes. Exact outlines, physical tree silhouette, collision flags and map data remain intact: canonical revision 7 still has 499 editable pieces.

Independent visual judgment: a modest improvement in coherence and variation. The exit log is calmer but can look uniformly smooth; broad branch bands still follow genuinely large physical geometry. Seedheads still resemble mechanical discs, and background motifs remain recognizable repeats. The opening mat and critter art are inherited from the prior pass; this is not a claim of a new overall art style.

The first comparison pair was invalid because the inspection canvas initialized before the viewport narrowed. That distorted the old screenshot. The sheet now repaints on resize, and both committed screenshots were recaptured with identical CSS/backing sizes of 390×600 per main canvas. That distorted pair was discarded as comparison evidence. Live game resizing already used its renderer resize path.

## Actual browser evidence and continuity

Used the user's Mac Chrome with a temporary localhost-only copy of pass 5 and the current game. The baseline full phone throw finished 71.1 m; an early current unaided throw finished 81.9 m. These loose loading/input samples are not a controlled distance comparison. Final phone full Air run showed the edge mark at opacity .736, then the on-screen surface mark at .85. Fire spent 1→0 and the previous mark immediately cleared to empty/opacity0 while playback remained 1.000. The run finished 71.1 m / 67 Bells. Native sampling also observed Rising, Level and Falling captions. Screenshots show the final glyph and back-branch role contrast.

A 50% phone throw with marks disabled produced no cue in 285 sampled DOM observations and finished 10.7 m / 30 Bells; collection/retry returned to ready. The actual desktop default viewport was 1726×875; the medium 75% run showed a landing mark and paused with the mark hidden. Its presentation clock stayed exactly 44.867 across observations, then resumed. The resumed run finished 74.0 m / 68 Bells and collection returned to ready. This checks responsive gameplay on Chrome viewports, not physical phone hardware/Safari or unfamiliar-player comprehension.

All QA used saving OFF/session maps. Personal progress, legacy 18,117 points/89 Bells, loose loading, launcher hardware and physical rotation are preserved. The original localhost:8080 server and continuing game/editor QA tabs remain. Temporary comparison server/tab/viewport are cleaned up at handoff. No new browser warning/error logs were observed. Experimental physics guards remain disabled. Publication is still pending parent/user approval; no package/save/deploy action was attempted.

## Next bounded priority

Observe whether a first-time player understands the landing-cap mark and chooses a weapon deliberately; the current evidence establishes visibility and honest invalidation, not comprehension or optimal timing. Stronger identity for a few authored destinations and more organic seedhead/branch silhouettes would help more than additional particles or filler bumpers. Preserve responsive flight, current critter size, calm lens, canonical editable world, saves and launcher. Continue the overnight scope with another bounded implementation/playtest checkpoint.
