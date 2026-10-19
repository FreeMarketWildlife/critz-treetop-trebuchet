# Treetop Trebuchet — local playable physics checkpoint

Author decisions recorded October 19, 2026. This is a developing test bed, not a calibrated simulation or finalized game balance. Run `npm ci`, `npm start`, then open `http://localhost:8080`; `npm test` runs the checks. No public deployment.

## Current authorized direction

- Early Fourth Age / Arcane, academy project at the Grandfather Tree. Launch from a **VERY high branch** into a **fixed authored map**; future multiple maps are confirmed, current work concerns one.
- Travel through Grandfather Tree branches/leaves, open-sky freefall, a long jungle-canopy descent, then forest-floor bouncing/sliding while horizontal momentum remains. The 300 m launch pivot, canopy height, platforms and bumpers are test dimensions, not world lore.
- **The whole launcher is physical:** beam, counterweight, sling/cradle, payload and finite-mass frame with branch contact. Player configures hardware and loads the critter; angle/speed emerge. No desired-angle control, auto-aim, random launch force or velocity multiplier.
- Power timing selects a mechanically reachable **cocked counterweight height**, hence actual gravitational potential energy. Highest allowed lift stores the most counterweight potential energy; it does not guarantee greatest range in every configuration.
- Short dotted trajectory guidance fades out before obstacles. It observes the same physical simulation; it does not tune the shot or reveal bounce outcomes.
- Eleven articulated volunteers: lizard (light/grippy), salamander (slippery), mouse, turtle (carapace-heavy), flexible snake, chipmunk, very rare flying squirrel, very heavy armadillo, **pygmy possum** and **pygmy marmoset** (now approved), frog. All sizes/masses/frictions are tunable gameplay proportions, not biological measurements.
- A volunteer queue reveals only the current and roughly next three; seedable stochastic selection is allowed. **Terrain never randomizes.** Enemy encounters vary from biome-specific pools in the tree, sky, canopy and forest floor.
- **Infinite health, harmless cartoon slapstick.** No injury/death mechanic. Pure physical launching is distinct from approved arcade post-release nudges. Flying squirrel: right dives, left climbs with lift/drag; no free infinite ascent.
- Exact core loop: launch critter / watch bounces / earn points → see bells and shop → customize with owned equipment and decide on special items. Points and bells remain separate; numerical awards/prices are explicitly prototype balance, not canon conversion.
- Continued local iteration, original procedural sounds/art and independent reviews are authorized. No paid assets, copied franchise/game assets or public deployment. No new story canon is inferred from test equipment or enemies.

## Main implementation

`src/articulated.js` uses pinned **Planck 1.5.1** from npm, with velocity/position iteration counts 20/12 and a fixed 1/600 s tick. The engine handles rigid body contacts, revolute hinges with limits, and **tension-only maximum-length rope joints**. It is not an exact or experimentally calibrated mechanics solver.

The A-frame is a dynamic 30 kg prototype body with feet and struts touching the fixed branch. It can slide, recoil, rotate or tip. Its axle is a physical revolute joint to the arm. A latch locks only the arm-to-frame angle while loading, without fixing the frame to the world. The uniform wooden beam's density, geometry and inertia change together; the counterweight is a finite circular fixture rigidly attached to its short end. Hinged counterweights remain a later hardware option.

The cradle is an original U-shaped rigid contact body suspended by two maximum-length straps. Individual critter parts have physical shapes and mass fractions; limited revolute joints connect them. Parts collide with cradle, frame/terrain and enemies; self-collision within one critter is disabled for stability. Snake is a seven-part chain, not an animated single projectile. Geometry and joints are simple original placeholders.

### Loading

A finite spring-damper **hand force**, capped at 80 N, pulls the grabbed body point toward the pointer. It does not set position or derive an impulse from raw pointer velocity. Mouse and touch use Pointer Events; optional tap-to-hold keeps the same physical grip until a second tap. A small hit-target pad helps select tiny bodies without moving them.

Lift the critter over the cradle and release the grip. Gravity, actual body contacts and strap constraints determine seating and settling. There is **no radial seating projection, automatic identical pose, velocity cap or forced settling duration** in the main UI. The prior `src/loading.js` shortcut was removed. Different drag histories and waiting times can produce different poses, spins and shots; identical complete initial states reproduce. Unloaded critters can fall onto the branch and be picked up again; Reset restores the initial test shelf.

### Release and power — explicit approximations

The release pin is currently an **idealized geometric switch**: a descending relative cradle/beam angle crossing, with positive strap tension, removes the straps and disables cradle collisions. Critter positions, part velocities and spins are not reassigned. This instantly opens the support model; an actual articulated hook, flexible fabric pouch and opening motion are **not** simulated. There is no claim that this is the final full-physics release mechanism.

The meter chooses a starting angle on the reachable cocking branch `theta=-pi+asin(f)`, with `f in [0.2,min(0.95,(6-sling-0.3)/longArm)]`, so the counterweight center begins at `pivotY + shortArm*f`. Its initial gravitational potential is physical. Changing it currently rebuilds the setup before loading: winch motor/work and winding animation are not yet implemented. No projectile speed bonus is applied. The cocking setup clamps lift to keep the cradle above the support branch and rejects impossible beam/sling combinations. Other contacts, frame stability and clearance during motion still need broader testing.

### Prediction and reproducibility

Prediction copies the complete engine body/joint state and overridden masses/inertias, then unlatches and advances an isolated world. The UI reconstructs the same canonical snapshot before the actual launch because engine serialization omits contact manifold/TOI history; direct continuation of a preexisting world can differ slightly from a restored one even with warm starting disabled. Tests therefore compare the actual canonical UI path. Snapshotting a live grip is rejected; preview requires hands off and zero post-flight control.

The hint is at most 0.8 s after release, fading before actual clone contact events or conservative authored-surface bounds. New random enemies are excluded from this opening 0.8 s window. It previews neither future enemy interactions nor control input. Loading continues live, so a hint can change until the actual latch release. Preview refresh is bounded to roughly twice a second; the render clock pauses excess time after long inactive frames rather than attempting unbounded catch-up.

### Post-launch systems

- Physics continues for all critter body parts, the frame, arm and cradle. Fixed platforms and original passive restitution bumpers form a small pachinko test layout. Restitution stays below one; collisions themselves are not speed multipliers.
- Normal critters get a small **explicit arcade horizontal force** from arrows/touch controls. Its translational work is reported separately. Squirrel controls use speed-dependent lift perpendicular to COM velocity plus dissipative drag, with a small pitch torque; actuator torque work is also recorded. Aerodynamic coefficients are prototypes, not validated anatomy or a complete sailplane model. Glide balancing needs further playtesting.
- Seeded encounter recipes become **dynamic bodies** on activation. Their positions are not overwritten after collision. Spawned moving bodies bring their own externally supplied initial energy; this is recorded separately. Active body count is capped, and expired distant encounters are removed. Original beetles, moth/bird shapes, pods and fungi are harmless interaction placeholders.
- `src/economy.js` keeps independent prototype point/bell awards, idempotent run banking, shop purchases, owned/equipped hardware and physical parameter effects. Frame mass/foot grip, beam geometry/material mass, counterweight and sling upgrades affect real model parameters. No launch-velocity modifiers. Special items are still a reserved decision slot, not invented items.
- `src/audio.js` synthesizes original short launch/impact/coin/shop/enemy/gust cues. Gesture-only AudioContext start, voice/chatter limits, mute and volume. Subjective sound mix remains to be auditioned/refined; no ripped sounds or music.
- Optional reduced decorative motion follows OS preference initially. Simulation-essential movement remains. Saving progress is explicit opt-in local storage; no external data or site publish.

## Reference models, tests and limitations

`src/physics.js` retains the independently derived fixed-pivot taut-sling Lagrange model as a conservative reference, with RK4 and refined separation events. Its zero-tension separation policy is a **reference-model boundary**, not the current main sling behavior. `src/rope.js` adds an independently tested unilateral Cartesian cable model: slack stays attached; slack-to-taut contact is refined and transfers an inelastic pulling impulse; RATTLE-style position/velocity constraints never push. These are research/verification modules rather than the active articulated scene.

The suite checks analytic energy/scale identities, timestep convergence, rope stretch/force signs, impact energy, input work, varied reproducible loading, all eleven shape/mass/joint profiles, finite frame response, physically driven ragdoll contact loading, snapshot/prediction consistency, physical upgrades, queues, enemies, economy and bounded original audio. **Passing tests do not establish calibrated realism or finished game feel.** Contact losses and engine numerical losses are not yet fully separated. The independent reviewer found noticeable shot differences at 1/300, 1/600 and 1/1200 s; ongoing work should quantify and reduce these before strong accuracy claims.

Remaining high-value work: actual hook/pouch opening, a physical winding motor, all-species end-to-end loading/stability sweeps, tight engine convergence budgets, fuller energy ledgers for contact/spawns/control, better mobile framing and body picking, audio listening/mix, and richer authored collision arrangements. Base motion and loading should stay visible and physical while art improves.

## Research and original-work boundary

- [Horsdal, *The swinging counterweight trebuchet: On scaling and optimization*](https://arxiv.org/html/2303.01306v1): coupled-body energy, inertia and release phases. We do not claim to reproduce the complete hinged-counterweight paper.
- [Horsdal et al., *Experiments on inner movement and ranges*](https://arxiv.org/abs/2502.19442): future experimental calibration reference; its data have not calibrated this test bed.
- [LAMMPS SHAKE/RATTLE documentation](https://docs.lammps.org/fix_shake.html): position/velocity constraint formulation used as a numerical-method reference, not a claim that LAMMPS is installed or used here.
- [Planck rope joints](https://piqnt.com/planck.js/docs/joint/rope-joint.html), [limited revolute joints](https://piqnt.com/planck.js/docs/joint/revolute-joint.html), [mouse-joint discussion](https://piqnt.com/planck.js/docs/joint/mouse-joint.html): engine constraint APIs and finite-force interaction cautions.
- [*Toss the Turtle*, creator-published Newgrounds page](https://www.newgrounds.com/portal/view/508440): author's launch/flight-control/cash-upgrade loop informs pace and feedback. Its cannons, bombs, copyrighted characters, injury presentation and assets are not imported. Our hardware upgrades change mechanics; our slapstick is harmless.
