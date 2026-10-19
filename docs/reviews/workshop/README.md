# Workshop and trigger release — local implementation

Open http://127.0.0.1:8080/ and reload to get the Workshop button.

- Workshop: fixed rock, stone basket or iron counterweight, 20–300 kg; 0–3 sling extensions; oak/pine/heavy timber; adjustable long/short arms; 0–3 physical foundation cross braces.
- Counterweights have solid polygon fixtures. Density is set from polygon area to preserve the chosen mass. Material-specific bulk changes rotational inertia; mass changes gravity torque. The visible outline is the fixture outline. These are fixed counterweights, not hinged weights.
- Each extension adds .15 m of sling and .06 kg to each pouch panel, with visible strap bands. Braces add collision geometry, 15 kg frame mass each and .07 foot friction each. No fracture or wood-strength simulation.
- Workshop choices apply on explicit rebuild and persist through resets/volunteers for this session. They override corresponding shop/lab parameters. Restore starter clears them. Earned progress storage is unchanged.
- Choose winding height, press Wind counterweight, physically load, hold Aim, release to launch. Pointer or Space/Enter release immediately disables the physical pivot latch in the existing live world. No reconstructed snapshot, velocity assignment, extra energy or queued winding precedes firing. Cancel, lost capture, pause, blur and resize cancel the trigger. Direct Unlatch remains available.
- Trigger cord/pin drawing follows the actual frame/arm and latch phase. The existing planar channel/bead prototype controls sling opening; it is an approximation, not a calibrated three-dimensional historical mechanism. Flight steering remains an arcade feature.

Mechanism reference: [Pitsco trebuchet demonstrator instructions](https://asset.pitsco.com/sharedimages/resources/userguide/lg_trebuchet_demo_ug_35230.pdf) describes pulling a trigger pin, the falling counterweight driving the arm, and the hook releasing the sling. The trigger releases the arm; it does not cut a load-bearing sling rope.

Validation: all 285 Node tests passed, including physical winding/loading/release for starter rock and a customized 180 kg stone-basket build, fixture mass/inertia/bracing checks, and pointer/touch/keyboard release/cancel ownership. Browser menu, applying construction, winding, visible hardware and loading were checked separately. No public deployment.
