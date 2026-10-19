# Iteration 25 — downhill physical traversal and fixed-obstacle notice

Starting checkpoint: bc8d496. The most substantial observed gap was a canopy that could stop the run before the ground phase. The new branches were flat shelves: the natural high-winding starter mouse stayed on the first one for 29.885 seconds of the 40-second study. Six earned-equipment cases also ended stationary in the canopy in iteration24's 15-second soak.

## Selected gameplay change

The seven short route branches now slope downhill at -0.35 (about19.3 degrees). Their left endpoints, spans and gaps remain authored and fixed. Convex static polygon fixtures give a falling critter a forward component through the contact normal; gravity also carries a resting critter downhill. Existing restitution/friction, masses, hand force, release mechanics and controls remain. No velocity assignment, launch multiplier, hidden impulse, pose repair or forced successful throw. The existing long branch and launch branch remain as authored; poor throws may still land back at the launcher.

Shared terrain helpers define endpoint heights, convex contact vertices, surface classification and swept crossing. The physical solver, conservative refinement region, rendered branch line/trim and both preview paths use this same slope definition. The point reference model resolves passive normal/tangent impact components for sloped segments; the real game continues using articulated Planck contacts.

Fixed branches, wooden bumpers and ground now participate in the existing bounded edge-cue system. For branches, the advisory points at the possible contact section rather than the midpoint of a long offscreen surface. Moving encounters and fixed geometry share at most four grouped arrows, actual pose bounds and HUD/rim clearance. Grouped guidance says nearby obstacles rather than incorrectly calling static terrain moving encounters. These are linear advisory estimates, not promises of collision or reaction time; no spawn or body motion changes.

## Paired natural traversal study

`measure-traversal25.js` performs actual motor winding, finite hand loading, observed supporting contact and physical release for all11 species at .2/.6/.9 winding, starter hardware and a seeded encounter sequence, with40 seconds after release and no steering/save/reward writes. It does not manufacture release velocities or move critters into branches. Baseline and final source hashes stayed stable within their runs; all33 release records match exactly.

| Observation | Flat branches | Downhill branches |
|---|---:|---:|
| Attempts / releases |33 /24 |33 /24 |
| Reached ground within40 seconds |20 |21 |
| Canopy stillness over3 seconds, COM speed below.05m/s |1 |0 |
| Maximum canopy contact events per run |4 |2 |
| Median horizontal travel after ground-phase entry (COM<2m) |20.87m |35.40m |

Ground-phase timing/travel in this paired study begins when COM falls below2m, not at the exact contact instant; groundSeconds counts time below2m. The formerly trapped mouse enters that near-floor phase13.163s after release, spends26.837s below2m and travels203.074m horizontally after entry, ending379.543m worldX. It contacts the approach branch once; this comes from a passive change of collision normal and the subsequent fall. Two squirrels are still gliding above the canopy at40 seconds. One high-winding armadillo still rests on the launch branch after its physical poor/backward throw. Nine low-winding seating misses in this particular torso-load protocol are unchanged. The separate35/132 protocols use different grip/settling histories; do not combine their miss rates.

`traversal-sloped.json` is an exploratory run during a point-reference helper edit and correctly flags changed sources. It is preserved but is not the authoritative final comparison; use `traversal-final.json`.

## Regression, extended progression and runtime

- **201 tests pass**, zero failures. New tests physically place an initially resting mouse above a real branch and verify contact followed by gravity-driven departure, independently check passive normal response, slope-aligned trim, and84 combinations of actual branch geometry, viewport, speed and payload bounds. These constructed unit fixtures are distinct from the natural paired study.
- Full35-case regression:32 releases/three low-winding seating misses. All35 release objects exactly equal iteration24. All32 measured predictions have zero difference and no live-scene mutation. Source hashes match the final implementation; source changes during run: none. No nonfinite values or positive unexplained energy residual.
- Nine angular diagnostic cases remain, versus eleven in24. Maximum.153852rad; each consecutive threshold excursion lasts at most one1/600s outer sample and final errors return below the diagnostic threshold. These are solver limitations, not a general articulation fix. Experimental global stepping remains unselected.
- Final15-second earned-equipment132 soak:126release/sixmiss,43canopy-contact attempts,101ground-contact attempts, **zero stationary canopy endpoints** versus six in24. Equipment choices/outcomes match the prior protocol. Engine batch p952.581ms/max8.600ms.
- Extended40-second earned-equipment132 soak:126release/sixmiss,43canopy-contact attempts,106ground-contact attempts, **zero stationary canopy endpoints**. 97m26.645s simulated /506.04s wall. Both soaks pass132save/reloads and132stale-writer rejections, with no duplicate rewards or queue mutation; all twelve GC checkpoints retain zero discarded worlds. User storage is never used. The long run's post-warm heap growth1.94MB includes intentionally retained ledger, metrics and outlier evidence; no bounded-ledger claim.
- Long engine ten-tick batch p953.505ms, max50.632ms; first/last quarter3.614/3.573ms. Largest recorded individual step48.146ms wall/5.025ms CPU overlaps47.766ms GC. A separate34.366ms wall step consumed.595ms CPU. Browser/test activity shared this host. No strict frame bound or actual-device FPS claim.
- Long audio lifecycle double: one context, max four voices/30 connected nodes, final zero voices/nodes. This is not audible evaluation.
- Shared fixed/moving cue observation records68 distinct moving-enemy contacts in each viewport in the long soak, with no zero continuous-notice interval at the sampled contacts. Minimum observed continuous notice.1671s portrait/.1171s landscape. Different routes/contacts mean these minima do not measure fairness improvement versus24, and human reaction is unverified.
- No-op render stress p95.0695–.1128ms, maximum1,876 context calls across390×844/1000×875 with/without reduced motion. Excludes rasterization/GPU. git diff --check passes.

`summary.json` and `summarize-traversal25.js` assert current source hashes, unchanged release records, exact measured prediction parity and study provenance.

## Actual browser and physical visual review

The retained recovery24 tab1219045169 was inspected and preserved, including its1,724points/19bells. A fresh latest-source tab1219045172 preserves the new earned session; reloading the old memory-only page would have discarded its rewards. Existing failed-session tabs were untouched.

Interpretation clarified in iteration26: manual .6/.9 winding labels below refer to raw slider values; physical fraction is .2+.75×value (.65/.875). The numerical paired studies use their explicitly stated physical fractions.

At390×844, real UI winding, finite drag, supporting contact, nearby Unlatch, flight, bank, earned equipment purchase and retry were exercised:

- Mouse, starter, .9 winding: physical poor result, approximately0m and12bounces shown; bank300points/29bells. It was not forced into a successful throw.
- Queued frog, starter, .6 winding:352m/11bounces,63.1degrees/15.8m/s; bank3,794points/27bells. Actual ground silhouette/travel observed.
- Purchased the longer beam with45 earned bells. Queued chipmunk, .6 winding: real3.6/.9m arms and9.9kg beam; release69.2degrees/15.6m/s. A ground-below cue appeared before ground visibility at about8m altitude. Later shown39m/seven bounces, with a final590points/21bells payout after another contact. A stronger upgrade did not guarantee a farther run.

Final wallet **4,684points/32bells**, owned/equipped longer beam. Retry preserves wallet, Chipmunk and next Salamander → Frog → Salamander. Saving confirmed **OFF**, sticky grip OFF, sound on35%, reduced motion OFF, console warnings/errors empty. Main latest tab returned to normal viewport. The older recovery tab remains390×844 to preserve its in-memory session; the available browser viewport control targets the latest live automation tab, so do not claim all old tabs were restored. The user's previously active native tab was restored after viewport cleanup. No save migration or earned stored-save writes.

`route-preview.html` replays `natural-mouse-incoming.json`, captured from the actual high-winding starter mouse trajectory before canopy contact. No synthetic translation or injected reward/body velocity. At390×844 the paused incoming state shows an amber branch-below arrow before branch visibility. At.627 simulated seconds, one real canopy-approach contact is recorded with the mouse just above the drawn downhill line and leaves below it. At2.785s, reduced motion on, the mouse is already103m forward/94.8m high with no further branch contact. This slow QA playback corroborates shape/contact alignment; it is not a human reaction test or a new earned game run. The temporary replay tab was closed; the saved fixture can be reopened through the local server. No screenshot/video export was attempted.

## Remaining useful work

Human touch/keyboard reaction, audible quality, real-device GPU behavior and screen-reader listening remain unverified. Broader natural portrait loading across all species and grip histories, especially low winding and long hardware, remains useful before changing launch balance. Keep genuine poor throws and the rare squirrel's continued glide. The original long branch can still support a rest; neither study establishes that every possible trajectory must reach ground. Local only: no push, deployment, native unlock, permissions changes, installation or blocked export retry.
