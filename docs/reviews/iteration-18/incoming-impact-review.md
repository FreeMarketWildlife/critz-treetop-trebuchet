# Identical incoming impact review

Two real canonical incoming fixtures are present: head-loaded lizard and light-beam lizard. **No incoming armadillo fixture exists** in iteration18; its full natural-regression result is not substituted for an identical-state comparison.

Each fixture was replayed for one second with unchanged forces, material, mass, inertia, geometry, joint limits and CCD. Measurements inspect every articulated joint and enabled touching payload contact **after every internal integration**, not merely outer600Hz samples. Current stepping is compared with research-only finer collision-region stepping and bounded relative-joint-motion stepping. Production source is untouched.

| Fixture / integration | Max angular excess rad | Max part-anchor gap mm | Max contact penetration mm | Integrations |
|---|---:|---:|---:|---:|
| Head / current | .170628 | .775 | .807 | 995 |
| Head / near9600 | .192699 | .783 | 1.123 | 1845 |
| Head / near19200 | .196178 | .782 | 2.363 | 3607 |
| Head / joint motion .05rad, cap8 | .056807 | .532 | .967 | 928 |
| Head / joint motion .025rad, cap16 | .014916 | .207 | 2.158 | 1202 |
| Light beam / current | .175077 | .240 | 5.168 | 691 |
| Light beam / near9600 | .038247 | .142 | 4.332 | 810 |
| Light beam / near19200 | .024188 | .136 | 2.790 | 1623 |
| Light beam / joint motion .05rad, cap8 | .077122 | .240 | 5.168 | 723 |
| Light beam / joint motion .025rad, cap16 | .034788 | .149 | .855 | 828 |

## Actual peak behavior

Both current angular maxima occur **after the first ground bounce, during a free600Hz integration with zero touching payload contacts**. Head: incoming+0.038333s, about8.54ms after first contact; torso/front-leg anchor gap at that exact maximum is0.00356mm, relative joint speed−128.93rad/s. Light beam: incoming+0.051667s, about20.83ms after first contact; torso/rear-leg anchor gap0.03267mm, relative speed132.90rad/s. The head peak therefore is not a simultaneous torn anchor or deep-contact event.

A relative speed around130rad/s can move a joint about0.217rad in one600Hz step. Pinned Planck1.5.1 selects the revolute limit state from the angle at the start of its velocity solve; a joint inside its range has an inactive limit (RevoluteJoint.ts lines515–539). Position correction then repairs the crossing, subject to its iterative constraints/correction limits. These facts and the controlled motion-refinement result support a discrete free-motion limit-crossing error following impact. They do not prove every remaining game warning has the same cause. Contact-only TOI can influence the preceding bounce but does not explain why increasing only contact frequency fails the head case.

Both current peaks exceed0.08rad for one recorded1/600s integration interval, then recover. After one second both angular maxima across current joints are zero; anchor endpoints are0.0354mm and0.000707mm respectively. Positive work-adjusted energy residual is zero in every trial. The incoming snapshot restore generates a fresh contact continuation: light-beam internal peak .175077 differs slightly from its historical whole-natural-run .174853; this comparison always uses the same saved incoming state within each trial.

Contact penetrations come from current world-manifold signed separation, including shape radii/skin. Pinned Settings.linearSlop is0.005m; current light-beam5.168mm lies near that solver tolerance, while head penetration remains below1mm. These are not remotely comparable to the former marmoset’s76–78mm through-panel penetration. Enabled-contact inspection cannot prove absence of ungenerated contacts or complete tunneling; all relevant peak contacts/points are retained in the JSON rather than silently called correct.

## Narrow recommendation

Do not select a global9600/19200Hz increase: it costs more work and worsens the head result. If visible motion or severity warrants a fix, evaluate **flight-only bounded relative-joint-motion refinement** while retaining existing collision refinement. The .05rad/cap8 research rule eliminates>.08 samples in both fixtures without changing physical parameters, but light beam .077rad is close to the diagnostic threshold. The .025/cap16 rule is more accurate here and more expensive. Neither is accepted production behavior or proof of convergence.

Full natural-launch, cross-species, prediction-parity, internal-peak and warm CPU checks are required before selecting either. Integration counts above cover changed one-second outcomes and are not a direct per-frame performance benchmark; fewer total steps in the head cap8 trial reflects changed settling/contact occupancy. Existing forces/masses/limits must remain intact. The current two cases show small brief numerical limb rotation with recovered anchors, not a prolonged trapped or exploded volunteer.

Evidence: incoming-impact-severity.json and scripts/measure-incoming-impact-severity.js. Original fixtures preserved; no production edits, commits or browser work.
