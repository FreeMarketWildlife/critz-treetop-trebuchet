# Pass 6 independent landing advisory review

These measurements describe stable helper opportunities before the final fade and screen-layout exclusions. For visible alpha≥0.5 notice, use cue-matrix.json and the implementation report. Final first-four phone notice is .736–.745 s.

Read-only review of current canonical map revision 7. No physics/material/weapon/input/camera/tempo changes made by this reviewer.

## Technical audit

The old ballistic imminentLanding forecast cannot honestly be extended without handling actual drag, wind-relative air velocity, changing air/gravity at altitude, field damping, sap-entry retention, enemy powers, side/underside contacts and rotating compound geometry. real(shot) also mixes body-origin position with COM velocity, requiring explicit COM reconstruction. The new helper addresses the modeled free-flight forces and reconstructs COM from shot.getLocalCenter. It checks nested body envelopes, same upward face, bounded ETA uncertainty, indexed geometry limits, current contacts and launcher returns. It suppresses environmental/enemy/ambiguous corridors and recalculates after fresh input. It never calls the stateful live environment.step function.

Independent review found an initial gap: the outer envelope stopped checking when it first reached the candidate surface, although actual body contact could occur later. A nearby field, enemy or sidewall could intervene between outer/inner contact bounds. The owner added clearUntil() to check the full outer corridor through late ETA, with explicit regressions. Reviewed correction and reran 7/7 helper tests successfully.

## Frozen-state checks

Generated default mouse trajectories at .5/.75/1 draw using ordinary physics. Sampled fresh state every~.04 physical seconds, evaluated the pure helper, and compared advisory regions to the actual next recorded solid contact. Root renderer waits .08 seconds of same-ID confidence, modeled by the stable-lead measurement below.

| Draw | Positive samples | Wrong next faces | Outside advisory spread+3cm | Max ETA error | Max point error |
|---|---:|---:|---:|---:|---:|
| 0.5 | 27 | 0 | 0 | 0.0097s | 0.055m |
| 0.75 | 108 | 0 | 0 | 0.0097s | 0.081m |
| 1 | 125 | 0 | 0 | 0.0229s | 0.068m |

Stable actual leads before meaningful contacts:

- Draw 0.5: launch-bough 0.790s, launch-bough 0.156s.

- Draw 0.75: launch-bough 0.784s, opening-skip-1 0.417s, opening-skip-1 0.443s, opening-rescue-mat 0.801s, opening-rest-terrace 0.802s, opening-rest-terrace 0.367s.

- Draw 1: opening-skip-1 0.783s, opening-skip-2 0.797s, opening-skip-3 0.811s, opening-skip-4 0.794s, canopy-exit-east-log 0.811s, canopy-exit-east-log 0.534s.

The main full-draw skips gain about .78–.81s of honest stable advisory lead without zoom or time dilation. Weak/medium early paths also have useful ~.79s broad-catch opportunities; some later small rebounds naturally have only.16–.53s or are omitted. This supports prepared timing, not a claim that unfamiliar users can select and aim a new action in time.

## Limits

The region is advisory, not a guaranteed landing or formal numerical error certificate. Measured default mouse states and synthetic blocker/wind/drag/boost/rotation cases do not certify every volunteer, custom map, firing instant or device. Body-envelope agreement is conservative but still an approximation; ambiguous inputs should yield no marker. Effects must clear immediately after a weapon intervention, current contact, pause or target loss as root implements. Do not retain a stale world-space target through a boost.

Committed summaries: forecast-review-summary.json and old-ballistic-summary.json. Full frozen-state traces remain preserved locally at /tmp/landing-opportunity-pass6-review.json and /tmp/forecast-pass6-baseline.json. The portable scripts/measure-landing-cues.mjs reproduces the final layout/parity matrix. No commits, browser actions or Sites operations performed by this reviewer.
