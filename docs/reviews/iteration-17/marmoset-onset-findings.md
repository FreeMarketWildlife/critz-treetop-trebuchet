# Marmoset onset: construction overlap precedes loading

Exact corrected UI-start soak i75 recipe reproduces the retained fixture at eligibility time5.5516666667s and neck gap0.1021058791m. The failure begins on the first integration, before any hand exists.

At construction the neck anchors coincide to floating precision. In left-panel local coordinates, its floor spans x[-0.8,0],y[-0.225,-0.155] before polygon skin. The head center is(-0.76087998,-0.16128393), INSIDE that solid rectangle, with head radius0.14m. The torso center(-0.81701624,-0.41455990) lies below. Consequently the engine starts with an invalid penetrating head/floor configuration, despite initially satisfied joints.

The first600Hz step separates head above the panel and torso below while stretching the neck0.15154924m. It stays above0.01m for six consecutive steps, with0.12465524m gap at0.01s. Contact names include cradle/head, cradle/torso and cradle/front-leg. There is no hand force or target at onset. Winding and hand loading later preserve this already threaded configuration.

This narrows the immediate root cause to construction clearance. Contact-only TOI can aggravate violated joints, but changing CCD cannot repair initial material overlap. A production fix should construct the complete critter clear of every initial pouch/frame/branch collider, then use the existing finite hand/motor. Retain the original corrupt fixture as a diagnostic; test candidate natural construction/loading from scratch, with both joint error and material penetration guards.

Research snapshots were captured through a read-only Object.create(scene) view with hand null solely for serialization; original evolution was unchanged. Active-hand metadata is separately recorded where applicable. No production files or tests changed.
