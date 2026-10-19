# Bounded trebuchet foundation — October 19, 2026

## Confirmed direction

Launch from a **VERY high branch of the Grandfather Tree** into a **fixed authored world that never randomizes**. Multiple maps are planned; work currently concerns one map only. Travel has three main regions:

1. Grandfather Tree branches and leaves, followed by open-air freefall.
2. Entry into the jungle canopy, with a long fall through it.
3. Ground travel continuing if horizontal momentum remains.

Post-launch enemies/hazards and action use **Toss the Turtle** as a gameplay/art reference, with original assets. **Latest correction:** Players configure critter mass, counterweight mass and wooden beam geometry; launch angle and speed emerge from dynamics and release. There is no direct desired-angle input or angle auto-solving. A timed power-slider minigame remains planned, with its mechanical mapping unresolved. Satisfying first-launch trebuchet physics and eventual upgrades/customization have priority. No particular upgrades, enemy roster, art treatment or slider-to-mechanism mapping are approved by this prototype.

## Run and boundaries

Run `npm start`, then open `http://localhost:8080`; run `npm test` for numerical checks. No dependencies or build step. This is a schematic mechanism lab, not a finished game. The world module fixes region order; 300 m launch height and 120 m canopy top are temporary test values, not canon. Original one-way branch surfaces, passive bounce and ground sliding now exercise post-launch motion. Leaves are represented only by the region scaffold; leaf-volume collisions, enemies/hazards, shop and scoring are not implemented. No copied game assets are used.

## Physical model

`src/physics.js` isolates SI-unit physics from rendering, world layout and input. It models a fixed pivot, uniform rigid wooden beam whose mass and inertia update with length, counterweight fixed to the short arm, point-mass critter and massless sling while taut. The arm is latched during drag loading, then uses the retained sling angle and angular motion after a short pendulum settling phase. The default numerical tests still use a suspended resting baseline; there is no loading trough. This is deliberately smaller than a hinged-counterweight machine; hinge and trough constraints would need additional states. Optional viscous axle damping and quadratic critter air drag are modeled, defaulting to zero. Elasticity, hook contact geometry, distributed arm aerodynamics and machine/support collisions remain absent.

Angles theta and phi are absolute counterclockwise angles from +x; y is up. With long arm a, short arm b, sling l, beam linear density rho, arm mass mb=rho*(a+b), counterweight M, projectile m, c=(a-b)/2, arm inertia I=mb*((a+b)^2/12+c^2):

- Kinetic energy: `T = (I+M*b²+m*a²)*thetaDot²/2 + m*l²*phiDot²/2 + m*a*l*cos(theta-phi)*thetaDot*phiDot`.
- Potential energy relative to pivot: `U = g*((m*a+mb*c-M*b)*sin(theta)+m*l*sin(phi))`.
- Lagrange equations form a coupled 2×2 mass-matrix solve; RK4 advances the state at 1 ms.
- Release position and velocity are computed by differentiating the sling endpoint. Flight continues from those values under gravity; there is no arbitrary projectile speed assignment.
- The first zero-tension crossing ends the taut constraint and releases the projectile; the solver never carries a compressive rope state forward. An initially negative tension returns an invalid starting-pose result, not a successful launch. This is a simplified separation policy, not a physical hook simulation. Both pin and zero-tension events are bracketed and refined within the integration step; the earliest event wins.

## Provisional input decisions

The fixed idealized pin opens when the sling/beam relative angle crosses 1.45 radians on its descending crossing. This is a **geometric mechanical event**, not a requested projectile direction. Actual ring sliding, friction and hook contact are not simulated; the fixed threshold is an uncalibrated test parameter. Slack can separate first. Neither trajectory auto-solving nor velocity rotation/multipliers are present.

The timed slider animates and can be stopped, but **does not modify energy or velocity**. Choose its mechanically justified meaning with Phil before wiring it in; no arbitrary energy boosts are authorized. Fixed counterweight, latched-arm/taut-sling loading approximation, beam density and pin geometry are prototype assumptions, not finalized equipment design.

## Verification and limits

Twenty-two automated tests cover conservative energy drift (<0.00001 J over the first 0.9 s), release/ballistic continuity, timestep and release-event convergence, sling length and positive tension, deterministic replay/parameter effects, gravity scaling, negative-tension rejection, geometry/mass validity, dissipative energy behavior, swept collisions, passive impacts, ground sliding, deterministic world traversal, dry-run/live-flight agreement, varied reproducible loading states, settling energy, seating work and speed-cap accounting. These validate the idealized implementation, not historical machine accuracy or satisfying game feel. Human play feedback and real-machine calibration remain necessary before claiming realism.

Configurations outside the explicitly checked prototype length/mass domain reject with a descriptive error. Within that domain, nonfinite state or increasing mechanical energy beyond the numerical tolerance terminates visibly with no launch. The light-counterweight/heavy-critter extreme can hit this guard; it is not repaired using a velocity boost. Smaller timesteps or a more suitable constraint solver would be needed to extend the tested domain. Frame rendering holds the last valid mechanism pose after release; residual arm movement is not yet simulated.

## Primary physics references

- Erik Horsdal, [The swinging counterweight trebuchet: On scaling and optimization](https://arxiv.org/html/2303.01306v1), 2023, especially section 2 and appendix A. Establishes the coupled arm/counterweight/sling treatment, energy formulation, phase boundaries and spigot-controlled release. This prototype derives the simpler fixed-counterweight, already-suspended case rather than claiming to implement that paper's full three-pendulum model.
- Horsdal, Johansen and Rasmussen, [Experiments on inner movement and ranges](https://arxiv.org/abs/2502.19442), 2025. A primary experimental reference for later validation; its measured results have not yet been used to calibrate this prototype.

## General trajectory guidance — later October 19 input

Phil approves a **short dotted trajectory preview fading out before the first obstacles**. `predict()` dry-runs the same solver with current mechanical parameters without mutating them or live launch state. The lab refreshes a short fading dotted free-flight arc when settings change. The short dotted/fading behavior is approved; its current 0.8 s numerical extent is a test value. The dry run stops before a swept intersection with the same fixed placeholder surfaces used by live flight. It does not forecast obstacles, canopy collisions or bounces; the unresolved power-slider mapping may alter how much uncertainty a final hint should show. Prediction does not select an angle or tune equipment. A test checks input/live-state preservation and agreement with an equivalent launch.


## Dissipation and world test bed — bounded follow-up

- Axle loss is `Qtheta=-c*thetaDot`, coefficient c in N·m·s/rad. Critter drag is `F=-k*|v|*v`, k in kg/m; its generalized forces are applied through the projectile position Jacobian while in the sling and the same force law is used after release. No torque is added at the massless sling joint. Defaults c=k=0 preserve the validation mode. These are simplified uncalibrated loss laws, not material measurements.
- `src/world.js` stores a fixed launch branch, canopy branch and ground surface. There is no randomization. Placeholder coordinates, restitution, horizontal retention and ground deceleration are test parameters, not lore or finalized gameplay. The three approved regions remain the world structure.
- A point projectile sweeps downward across one-way horizontal segments. Time of impact is refined, then restitution reverses only the normal component and horizontal retention removes momentum. Very small ground bounces settle into constant-deceleration sliding. These contact rules are phenomenological placeholders; projectile shape, rotating contact, Coulomb friction, branch flex and dense canopy geometry are not modeled.
- The world integrator resolves at most one surface per 1 ms default step, with a chord used to identify candidate intersections. Closely stacked surfaces, edge-grazing trajectories and extreme velocities require a more general continuous collision solver. The fixed test layout has widely separated surfaces.
- Live flight owns its frame/history objects; prediction performs its own mechanism dry run and flight stepping. Neither modifies input parameters or an active shot. The lab regenerates the short hint on configuration edits. Its fade and clipping precede obstacles without exposing bounce outcomes. Power-slider input remains disconnected.


## Drag-to-load requirement and incremental model — latest October 19 input

Phil requests a purely physical launch, including the falling counterweight, with mouse/touch dragging of the critter into the sling. Loading differences should contribute to variation. **Identical initial conditions repeat**; the simulator makes no guarantee of unique runs and adds no hidden random force.

`src/loading.js` is a separate latched-arm phase: the player places the critter near the sling’s lower arc, and its angular position and measured tangential motion are retained. A 0.25 s gravity-driven pendulum solve follows, with the arm held by the latch; unlatching transfers this actual state into the coupled arm/sling equations. Settling does not reset to a common pose. Pointer Events and pointer capture support mouse/touch through the same path. Configuration edits require reloading; an active shot’s stored parameters/history remain separate from preview state.

**Disclosed input approximations and safety limits:**

- The pouch is idealized as a point on a taut sling. Placement is accepted within 0.35 m of its radius and the lower angular arc [-2.3,-0.8] rad. Radial projection is a seating assist, not a full physical contact solve. Radial kinetic energy is discarded; the signed potential-energy change caused by projection is reported as seating work.
- Pointer motion is estimated from a recent 40–120 ms sample interval. A stationary hold of at least 100 ms, or insufficient history, starts with zero measured motion. This is an input approximation; it is not a simulation of a hand letting go.
- Retained tangential speed is capped at 2 m/s; its discarded kinetic energy is reported. Raw pointer speed above 50 m/s or nonfinite input is rejected. These are numerical/input safeguards, not physical limits on creatures. They cannot add energy. The rest of the launch uses the accepted physical state with no velocity boost.
- The readout reports remaining critter energy above the hanging-rest reference after settling, radial kinetic loss, speed-cap loss and signed seating work. Counterweight potential energy is separate and enters through the coupled mechanism.
- This model **does not yet represent a loose pouch, slack-rope pickup, finite critter contact, loading trough, flexible wooden beam or the user’s actual hand forces**. A more complete loading constraint/contact model is needed before calling the interaction fully realistic. Do not silently replace it with a pre-scripted identical load.

Browser verification covered a rejected placement, an accepted drag, visible energy accounting and successful unlatching into a changed trajectory. Both desktop pointer and touch use Pointer Events; a physical touch-device interaction has not been independently tested. The power slider remains disconnected and unresolved.
