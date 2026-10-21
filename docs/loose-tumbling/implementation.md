# Loose basket loading and smooth illustrated tumbling

Author direction, October 20, 2026: drop the critter loosely into the basket; no center lock or always-on basket highlight. Keep the whole illustrated character, with a unique hitbox and weight distribution for each species, smooth circular momentum, ragdoll feel where compatible, exaggerated impact reactions, and a launcher button with a meter. The reference supplied by Phil is [Toss the Turtle on Newgrounds](https://www.newgrounds.com/portal/view/508440); its author-listed control is hold for power and release to fire.

## Current behavior

Preparation keeps the three jointed bodies alive on basket contacts after settling, including while cranking. `loaded` observes support and does not create a joint, move a body, force a zero angle, or freeze the preparation world. Picking up an already supported critter preserves its joint poses. A held animal can enter from the foreground plane; basket collision becomes active on drop. The deeper drawn basket matches the physical rim and base. Cancel/blur/interrupt releases the grab without teleporting the animal or launching it. Explicit Rebuild resets it to the stand. Enter assists by dropping it from above the basket, rather than marking it loaded.

Preparation uses a three-second maximum winding rate so the loose critter can follow the descending basket. At launch, the observed torso pose, velocity and spin transfer into the flight body. No artificial launch impulse is added. This transfer is an approximation between the preparation and flight models; full articulated rigid-body flight is not claimed.

`src/critter-body.js` defines a distinct compound polygon silhouette and region mass fractions for all eleven volunteers. The solver calculates center of mass and inertia from the distributed density. These fractions are balance approximations, not biological measurements. Gravity, contacts, off-center sling tension, material friction and existing environment/weapon effects drive the rigid core. Free flight retains angular momentum in the absence of torque. Ballistic assertions observe the center of mass because a rotating body's illustrated origin follows a curved path around it.

The illustration follows the actual physical angle on every render; it no longer rounds to 15-degree angles or holds rotation at 8 Hz. Damped head/tail springs and impact squash provide secondary ragdoll motion without changing the collision core or resetting spin. Impact expressions remain exaggerated; dizzy-star orbits are continuous. Simulation time controls these effects, so Pause freezes them. Release no longer inserts a cosmetic freeze into free flight; the short collision hit-stop remains for exaggerated impact reactions.

The launcher button has a live draw meter, supports pointer or held Space/Enter, and releases through the same single-owner hold controller as the clearing. Cancellation never fires. The basket ring and animated placement cue render only while the accessible Suggestion popup is visible. There is no ring during ordinary dragging or resting.

## Validation

- Unit/regression checks cover all eleven physical silhouettes, mass and inertia, torque-free angular momentum, smooth render angles across hits, active/resting joint poses, keyboard drops, cancellation, all three starter launches, and existing mechanism/shop/save behavior.
- The shared working folder passed 414 tests. Browser verification: a manually dropped, crooked mouse stayed loose, the dedicated button reached 100%, and the resulting throw completed at 28.4 m with seven bounces. The initial basket had no highlight or popup.
- Concurrent weapon and map/art work is preserved separately.
