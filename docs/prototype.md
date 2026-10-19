# Bounded trebuchet foundation — October 19, 2026

## Confirmed direction

Launch from a **VERY high branch of the Grandfather Tree** into a **fixed authored world that never randomizes**. Multiple maps are planned; work currently concerns one map only. Travel has three main regions:

1. Grandfather Tree branches and leaves, followed by open-air freefall.
2. Entry into the jungle canopy, with a long fall through it.
3. Ground travel continuing if horizontal momentum remains.

Post-launch enemies/hazards and action use **Toss the Turtle** as a gameplay/art reference, with original assets. **Latest correction:** Players configure critter mass, counterweight mass and wooden beam geometry; launch angle and speed emerge from dynamics and release. There is no direct desired-angle input or angle auto-solving. A timed power-slider minigame remains planned, with its mechanical mapping unresolved. Satisfying first-launch trebuchet physics and eventual upgrades/customization have priority. No particular upgrades, enemy roster, art treatment or slider-to-mechanism mapping are approved by this prototype.

## Run and boundaries

Run `npm start`, then open `http://localhost:8080`; run `npm test` for numerical checks. No dependencies or build step. This is a schematic mechanism lab, not a finished game. The world module fixes region order; 300 m launch height and 120 m canopy top are temporary test values, not canon. Branch/canopy collisions, bounce, ground continuation, hazards, shop and scoring are not implemented. The current test flight stops at ground level. No copied game assets are used.

## Physical model

`src/physics.js` isolates SI-unit physics from rendering, world layout and input. It models a fixed pivot, uniform rigid wooden beam whose mass and inertia update with length, counterweight fixed to the short arm, point-mass critter and massless sling while taut. The critter starts suspended, without a loading trough. This is deliberately smaller than a hinged-counterweight machine; hinge and trough constraints would need additional states. No friction, aerodynamic drag, elasticity, hook contact geometry or support collision is modeled yet.

Angles theta and phi are absolute counterclockwise angles from +x; y is up. With long arm a, short arm b, sling l, beam linear density rho, arm mass mb=rho*(a+b), counterweight M, projectile m, c=(a-b)/2, arm inertia I=mb*((a+b)^2/12+c^2):

- Kinetic energy: `T = (I+M*b²+m*a²)*thetaDot²/2 + m*l²*phiDot²/2 + m*a*l*cos(theta-phi)*thetaDot*phiDot`.
- Potential energy relative to pivot: `U = g*((m*a+mb*c-M*b)*sin(theta)+m*l*sin(phi))`.
- Lagrange equations form a coupled 2×2 mass-matrix solve; RK4 advances the state at 1 ms.
- Release position and velocity are computed by differentiating the sling endpoint. Flight continues from those values under gravity; there is no arbitrary projectile speed assignment.
- Negative calculated sling tension ends the taut constraint and releases the projectile. This is a simplified separation policy, not a physical hook simulation. Event timing is sampled at timestep resolution.

## Provisional input decisions

The fixed idealized pin opens when the sling/beam relative angle crosses 1.45 radians on its descending crossing. This is a **geometric mechanical event**, not a requested projectile direction. Actual ring sliding, friction and hook contact are not simulated; the fixed threshold is an uncalibrated test parameter. Slack can separate first. Neither trajectory auto-solving nor velocity rotation/multipliers are present.

The timed slider animates and can be stopped, but **does not modify energy or velocity**. Choose its mechanically justified meaning with Phil before wiring it in; no arbitrary energy boosts are authorized. Fixed counterweight, initial suspended loading pose, beam density and pin geometry are prototype assumptions, not finalized equipment design.

## Verification and limits

Eight automated tests cover conservative energy drift (<0.00001 J over the first 0.9 s), release/ballistic continuity, timestep convergence, sling length and positive tension before default release, deterministic replay/parameter effects, and gravity scaling. These validate the idealized implementation, not historical machine accuracy or satisfying game feel. The default test shot reports its emergent release time, angle and speed in the lab; these are not approved balance values. Human play feedback and real-machine calibration remain necessary before claiming realism.

## Primary physics references

- Erik Horsdal, [The swinging counterweight trebuchet: On scaling and optimization](https://arxiv.org/html/2303.01306v1), 2023, especially section 2 and appendix A. Establishes the coupled arm/counterweight/sling treatment, energy formulation, phase boundaries and spigot-controlled release. This prototype derives the simpler fixed-counterweight, already-suspended case rather than claiming to implement that paper's full three-pendulum model.
- Horsdal, Johansen and Rasmussen, [Experiments on inner movement and ranges](https://arxiv.org/abs/2502.19442), 2025. A primary experimental reference for later validation; its measured results have not yet been used to calibrate this prototype.

## General trajectory guidance — later October 19 input

Phil approves a **short dotted trajectory preview fading out before the first obstacles**. `predict()` dry-runs the same solver with current mechanical parameters without mutating them or live launch state. The lab refreshes a short fading dotted free-flight arc when settings change. The short dotted/fading behavior is approved; its current 0.8 s numerical extent is a test value. No obstacles exist in this lab yet; authored obstacle boundaries must cap the hint when added. It does not forecast obstacles, canopy collisions or bounces; the unresolved power-slider mapping may alter how much uncertainty a final hint should show. Prediction does not select an angle or tune equipment. A test checks input/live-state preservation and agreement with an equivalent launch.
