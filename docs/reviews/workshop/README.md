# Workshop and trigger release — local implementation

Open http://127.0.0.1:8080/ and reload to get the Workshop button.

- Workshop: fixed rock, stone basket or iron counterweight, 20–300 kg; 0–3 sling extensions; oak/pine/heavy timber; adjustable long/short arms; 0–3 physical foundation cross braces.
- Counterweights have solid polygon fixtures. Density is set from polygon area to preserve the chosen mass. Material-specific bulk changes rotational inertia; mass changes gravity torque. The visible outline is the fixture outline. The original release used fixed counterweights; the video follow-up below adds a freely hinged option.
- Each extension adds .15 m of sling and .06 kg to each pouch panel, with visible strap bands. Braces add collision geometry, 15 kg frame mass each without changing foot material or friction. No fracture or wood-strength simulation.
- Workshop choices apply on explicit rebuild and persist through resets/volunteers for this session. They override corresponding shop/lab parameters. Restore starter clears them. Earned progress storage is unchanged.
- Choose winding height, press Wind counterweight, physically load, hold Aim, release to launch. Pointer or Space/Enter release immediately disables the physical pivot latch in the existing live world. No reconstructed snapshot, velocity assignment, extra energy or queued winding precedes firing. Cancel, lost capture, pause, blur and resize cancel the trigger. Direct Unlatch remains available.
- Trigger cord/pin drawing follows the actual frame/arm and latch phase. The existing planar channel/bead prototype controls sling opening; it is an approximation, not a calibrated three-dimensional historical mechanism. Flight steering remains an arcade feature.

Mechanism reference: [Pitsco trebuchet demonstrator instructions](https://asset.pitsco.com/sharedimages/resources/userguide/lg_trebuchet_demo_ug_35230.pdf) describes pulling a trigger pin, the falling counterweight driving the arm, and the hook releasing the sling. The trigger releases the arm; it does not cut a load-bearing sling rope.

Validation: all 285 Node tests passed, including physical winding/loading/release for starter rock and a customized 180 kg stone-basket build, fixture mass/inertia/bracing checks, and pointer/touch/keyboard release/cancel ownership. Browser menu, applying construction, winding, visible hardware and loading were checked separately. No public deployment.


## Video study follow-up — 2026-10-19

Source: [Art of Engineering — Medieval Engineering | How Trebuchets Work](https://www.youtube.com/watch?v=jTBDc19eW2o), using its [indexed transcript mirror](https://filmot.com/sidebyside/jTBDc19eW2o/en/en/English/English/Medieval%2BEngineering%2B%7C%2BHow%2BTrebuchets%2BWork/Art%2Bof%2BEngineering). The local browser could not play the video and its transcript exporter reported no transcript. This review used the mirror, not verified audio or sampled video frames.

The explanation distinguishes a freely hinged counterweight, a fixed/free pair of sling cords, an adjustable release finger, and winching before trigger release. It also describes a guide chute and geometry-dependent energy transfer. We use these as design references, not universal optimization guarantees.

Primary physics cross-check: [E. Horsdal, The swinging counterweight trebuchet: On internal forces](https://arxiv.org/html/2510.18789v1), especially sections 1–2. It models a separate swinging counterweight, notes trough/lift-off/free-flight phases, and discusses frame loading and friction. Our tree launch and articulated passengers remain a game approximation.

Implemented:

- Optional freely hinged counterweight with a separate massive rigid body, a free revolute joint and a massless rigid hanger (.3–1 m). Fixed remains the default. Geometry, gravity and joint forces determine its swing; there is no counterweight animation driver or release impulse.
- A heavier joint chain required 40 velocity iterations to finish physical winding within existing latch tolerances. This applies only to hinged Workshop builds; existing fixed/research configurations are unchanged. No pose snapping or tolerance relaxation.
- Workshop release-guide mounting control in degrees, plus arm/sling/payload ratios. Guide angle changes the physical contact rail, not a forced launch direction. The channel/bead and split pouch remain approximations of historical cord and release-finger hardware.
- Counterweight markers and height readouts now use its actual physical center, including asymmetric fixed rocks and swinging baskets.
- Braces add frame geometry/mass without automatically increasing friction. Equipped foot friction is retained.
- Updated dependency versions prevent old cached modules from breaking startup alongside the current altitude-map changes.

Validation: all 293 Node tests pass. New checks cover hinged winding/loading/release, free joint and chosen mass, sub-5-mm hinge-anchor error during winding, snapshot restoration, read-only prediction, unchanged energy/time at trigger release, material-independent brace friction, and actual weight-center measurements. Browser verified menu options, applying a hinged basket, winding to loading, hardware rendering and startup recovery. No public deployment.

Ideas to explore next (not implemented): a loading trough with visible lift-off; a winch/drum that disconnects after cocking; a beam with a reinforced short end and a lighter/tapered throwing end; and a comparison bench that repeats matched loads and records launch speed, angle, drop energy and frame recoil. Compare configurations at our actual tree height rather than enforcing a universal 45-degree throw or guaranteed mass ratio.
