# Contact channel: bounded hardware matrix

These are explicit, visible configurations for a physics test bed, not species-based automatic tuning or recommended default promotion. Run `node scripts/measure-hook.js --matrix` to regenerate `hook-matrix.json`.

| Class | Critter mass | Counterweight | Long beam | Sling | Channel angle relative beam | Channel length |
|---|---:|---:|---:|---:|---:|---:|
| Light / lizard | 0.65 kg | 100 kg | 3 m | 2.5 m | 3.4 rad | 0.22 m |
| Medium / turtle | 2.4 kg | 200 kg | 3 m | 2.5 m | 3.6 rad | 0.12 m |
| Heavy / armadillo | 5 kg | 150 kg | 2.2 m | 2.2 m | 3.8 rad | 0.22 m |

The short beam remains 0.8 m. Bead mass/radius, rail width/friction and all other parameters remain shared. Initial contact settling in the measurement protocol means observing contact and relative speed below 0.35 m/s continuously for 0.1 seconds, for at most three seconds. It adds no force, pose reset, or game timer. The actual UI allows the user to launch with moving contact.

All three reference setups throw forward and upward and miss the launch branch at 300, 600 and 1200 Hz. Their first subsequent actual world contact is ground, not the launch branch. Separate end-to-end tests wind from initial arm angle −3 rad using the real torque-limited motor to the 0.6 counterweight-height setting, then drag/load, observe contact settling and launch. These also clear the launch branch. Motor and reference loading histories give different launches, as expected.

## Mechanical interpretation

Let the channel base be O, its outward unit axis e, arm angular speed ω, and bead axial coordinate s. Ignoring small lateral clearance, differentiation of bead position O+s e gives the axial equation

`m (s̈ − s ω²) = (T + m g)·e − m a_O·e + F_friction·e`.

Here T is the strap force on the bead, the opposite of the rope-joint reaction on its pouch body. The rails constrain transverse motion; the heel prevents inward escape. Transverse acceleration includes `2 ṡ ω + s ω̇`, affecting normal load and friction. Consequently, strap direction alone does not determine escape: base acceleration and channel rotation also matter. This is a planar contact abstraction, not a closed ring sliding axially off a three-dimensional pin.

The payload is not attached to the bead. Contact with the U-shaped cradle accelerates it, and it can eject over a rim before the bead exits. All three successful reference throws do so. Detecting actual support loss independently of bead escape is therefore essential. The observer waits for no cradle contact, separation beyond 0.7 m, and 0.01 seconds of continued separation; this delays its reported release slightly but applies no impulse and changes no fixture or strap.

The default heavy setup throws slightly backward at all three timesteps with closely agreeing velocities. That sign is consistent with its configuration/loading and early rim ejection, rather than a sign-changing numerical instability. The compact beam/sling and later channel orientation give the heavy payload a different supported trajectory before ejection. No artificial projectile velocity or per-shot calibration is used.

## Limits

Energy falls during the measured launches without positive explicit work. The reported loss combines physical contacts and numerical effects; it is not calibrated friction. Small per-step energy gains may still occur, and are recorded. At the selected reference snapshots, 600-to-1200 Hz release-velocity differences are below 0.65 m/s, but coarse-step heavy results show larger sensitivity. This is bounded evidence, not proof of convergence for arbitrary settings or loading histories.

The useful configurations depend on both geometry and actual loading. Earlier rejected settings include a too-vertical medium throw that hits the launch branch, late downward throws, and unstable split-floor loading. No default promotion is justified by this matrix alone. The baseline idealized release remains a distinct comparison model.
