# Space escape checkpoint

The approved arcade success state begins on an upward released crossing of the actual world boundary. It is 3,000 m on the canonical map (forest floor 0 m, tree centre 400 m, crown 800 m, launch branch 600 m). Custom/legacy maps use a validated descriptor and the same policy as the height strip. The upper sky is explicitly compressed; this is an altitude rule, not physically accurate lunar escape velocity.

The released critter then drifts continuously at its crossing velocity with zero gravity, no further encounters, contacts or ordinary settling timeout. Ordinary low-altitude launch journeys retain their pre-change numerical values at four draw strengths. Reward inputs freeze exactly at the crossing rather than increasing while floating.

## Achievement and reward semantics

Adventure immediately unlocks **Beyond the Moon** once, with an uncollected completion stored in the normal progress save. **Collect & retry** adds seven times this run’s normal rounded Bells and points. It does not multiply the existing wallet, lifetime points, best distance, or seven additional multiples. Each later legitimate space run may earn the same multiplier; claiming one run repeatedly cannot repay. Physical cord/beam failures that still reach space retain the existing economy’s eligibility. Invalid/numerical runs and Creative cannot earn Adventure rewards or achievement.

A saved pending result takes precedence over the Creative URL flag on reload, restores the completed build/volunteer and original world descriptor, and remains collectible after an editor-map change. Reset/mode/build changes cannot silently abandon it. Pause, blur, retry, storage failure and duplicate collection are covered by state tests. A failed space collection write leaves the card and pending completion available. Saving disabled or unavailable cannot promise durable reload recovery; export remains available.

Updated clients reject stale writes that erase an unclaimed completion/achievement or resurrect a claimed packet. They do not merge wallets. This is a narrow browser-local guard, not transactional storage: tabs already running older source must refresh to receive it. Deliberately older imports that would erase durable space progress are rejected with a reload message.

## Reachability evidence

Two catalogue-valid endgame builds are included as blueprints. They require owned equipment and the Elephant volunteer in Adventure, or may be tried free in Creative. No user-owned equipment, currency, saves or map was changed for these tests. The recommended −15° recipe releases at 207.329543 m/s and 41.557071°, crossing 3,000 m at 20.583313 physical seconds. No weapon, enemy or map contact contributes. Its frozen distance is 2,532.160191 m, height 2,400 m above the launch branch, normal reward 376 Bells / 30,122 points, and multiplied reward **2,632 Bells / 210,854 points**.

The physical keyboard-loading helper loads the Elephant, powered winding takes about 8.9 seconds, and the loose volunteer loses support during the giant wind. The ratchet retains full draw after an unsupported release is refused. Re-drop using Enter at full draw, allow about two seconds of settling, then make a fresh supported release. Node verified both that sequence and re-dropping while the crank stays held; no injected forces or arbitrary flight-body placement were used. This is an endgame test recipe, not a tuned novice recommendation.

Exact bounded investigation results are in [space-endgame-successes.json](space-endgame-successes.json); [release/refusal/re-drop evidence](treetop-space-release-retry-evidence.json) records the ordinary-controller-compatible path. Investigation stopped after 21 of 24 allowed candidates. Timings in that file are single Node observations, not certified performance benchmarks.

## Automated validation

Final local `npm test`: **664/664 passing**, 0 failed/skipped, 15.35 s. Includes all 48 catalogue entries / 96 archived full-draw results, ten space physics cases with a natural endgame loading/winding path, 25 reward/persistence cases, 11 actual UI-handler cases, restored-space renderer framing across desktop/phone/landscape, and exact mini-map/policy boundary agreement. Source syntax and `git diff --check` pass. These checks do not certify browser appearance, audio audition, novice comprehension, or full physical fidelity.

## Native acceptance status

The preceding catalogue checkpoint d8acb27 passed native Mac Chrome desktop/390×844 checks: precision one-second draw changed 33%→50%, frame/basket preview preserved actual settings until Apply, invalid capacity inputs rejected, and buying a capacity part revealed its adjustment controls. Screenshots and exact observations are in [the catalogue checkpoint](../upgrade-usefulness/checkpoint.md).

For this space checkpoint, native Chrome opened a fresh isolated `treetop-space-task3.localhost:8080` origin and showed the actual free-drift boundary in the height strip. It entered Pause. The connection closed during opening Options; subsequent state read and runtime reset both failed because transport was closed. No synthetic progress import or native space launch occurred. The synthetic import fixture remains in /tmp, not the user’s personal origin. The prior QA phone override was reset before opening this new tab. No alternate browser route was used.

**Pending after browser reconnection:** import synthetic all-owned progress on the isolated origin; perform actual loading/full wind/re-drop/release to space on desktop and phone; inspect zero-gravity screen/height marker, pause/resume and resize; reload before Collect and verify restored framing/unchanged wallet; Collect once and reload to check no duplicate, ordinary retry and persistent achievement; verify Creative is reward-free; capture page-only screenshots. Restore temporary viewport and leave unrelated Chrome/Baa’d Math tabs, servers and settings alone.

No public Sites package, source save or deployment was performed. Publication still requires the separate user approval recorded by the parent task.
