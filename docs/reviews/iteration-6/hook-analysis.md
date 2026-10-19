# Stopped shallow-V pouch: prototype physical release

Run `node scripts/measure-hook.js --stopped` to regenerate `hook-stopped-pouch.json`. Earlier iteration evidence is left intact.

## Construction and passive stop

`stoppedSplitPouch: true` creates two contact panels sharing their floor-center hinge. Their half-angle defaults to 20 degrees (`splitHalfAngle`, tested domain 5–35 degrees). The hinge's reference angle is twice that angle. Its permanent joint limits are −π to 0: the upper stop prevents gravity deepening/collapsing the supported V, while the lower range lets the unsupported right panel fold clockwise outward. No limit, fixture or strap changes at release.

With both outer ends supported, the payload's downward load tends to deepen the V and increase right-minus-left panel angle, pressing against the upper stop. After the right end loses support, gravity produces a clockwise moment about the center hinge and decreases that angle, so the panel opens within the permitted range. Acceleration and slack can also remove support before bead exit; this must be measured rather than assumed.

The construction solves both hinge/body positions together. A small initial assembly tilt matches the support-height difference to the outer-anchor-height difference. The lower intersection of two equal-radius circles sets the whole assembly's position. Both strand distances equal their maximum lengths before any simulation step, and the hinge anchors coincide. Fixture bounds reject an intersection with the support branch. This avoids starting the simulation with a geometry-correction impulse.

Both strands use the nominal hardware length `hypot(sling, 0.65)`. The legacy free strand was instead measured from its shifted hardware anchor; the new mode is therefore an explicit equal-strand design, not literal preservation of both legacy lengths. `sling` alone is not the exact strand length.

## Explicit panel mass

Legacy fixture density 1 yields approximately **0.0826 kg per panel**. It remains the constructor default for historical comparisons; the prototype UI explicitly selects 0.5 kg. `pouchPanelMass` explicitly specifies each panel's mass, with validated domain 0.05–2 kg. Construction retains fixture-derived center of mass and scales rotational inertia in proportion to mass. Saved worlds preserve that mass data. There is no launch-time mass change or supplied force.

The rigid-panel interpretation makes 0.5 kg per panel a meaningful alternative physical design. It is not numerical damping or a velocity modifier. However, changing mass also changes the loading history, so comparing it with legacy mass cannot by itself isolate solver conditioning.

## Bounded results

The legacy heavy-panel case is unreliable. Across timesteps and solver iteration counts, throws change between upward and downward; energy can rise materially without explicit work. Increasing iterations from 20/12 to 40/30 or 80/60 does not establish convergence. Exact identical-snapshot results are retained, including failures. At 80/60 and 1200 Hz, the peak gain above initial mechanical energy reaches about 20 J.

Using **0.5 kg for each panel** with the explicit hardware matrix below gives a more promising bounded result:

| Class | Counterweight | Long beam / sling | Channel angle / length | Velocity at 600 Hz |
|---|---:|---:|---:|---:|
| Lizard, 0.65 kg | 100 kg | 3 m / 2.5 m | 3.4 rad / 0.22 m | (4.23, 10.93) m/s |
| Turtle, 2.4 kg | 200 kg | 3 m / 2.5 m | 3.55 rad / 0.12 m | (4.86, 15.17) m/s |
| Armadillo, 5 kg | 200 kg | 2.2 m / 2.2 m | 3.7 rad / 0.22 m | (4.17, 13.48) m/s |

For each class, one actual motor-wound, force-loaded snapshot is reconstructed identically at 300, 600 and 1200 Hz. All nine throws travel forward/upward and clear the launch branch; first subsequent world impact is ground. The bead exits before panel opening exceeds 0.2 radians in every case, and is still outside when that opening is observed. No net or single-step mechanical energy gain is observed during these nine launches. Fine-step release-velocity differences are about 0.43, 0.35 and 0.38 m/s, respectively.

The loading observer still allows moving pendulums and articulated postures. Contact/COM-relative quiet is not whole-ragdoll equilibrium; full motion diagnostics are retained. Head-first grip and additional waiting/sway stress are separate evidence files owned by the main task. The earlier matrix's successful snapshots did not establish loading robustness, and this revision is held to that distinction.

## Remaining limits

The panels approximate a fabric pouch using rigid bodies and a hard hinge stop. The solver permits angular slop and has mass-ratio/contact sensitivity. Energy loss remains a mixture of physical contact/friction and numerical residual; loss totals vary across timestep even in successful cases. The useful hardware windows can be narrow, and no automatic species or shot-specific tuning is applied. The channel remains a planar clevis approximation, not a closed three-dimensional ring/pin. The prototype UI selects this explicit 0.5 kg stopped-pouch design after the separate posture and waiting stress checks; the geometric model remains a rollback option and constructor defaults remain unchanged. This bounded prototype choice does not establish calibrated accuracy or robustness across arbitrary hardware and loading histories.
