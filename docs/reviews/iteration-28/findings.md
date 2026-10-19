# Iteration 28 — passive skids among springy encounters

## Pool review and change

The four pools previously held two mostly round, similarly rebounding contacts each. Tree beetles/hoppers and sky moths/birds retain their lightweight round roles. Canopy pods and floor fungi provide stronger rebounds. Two new original contacts add a different pinball choice: a green **waxleaf skid** in the canopy and a tan **seed-husk skid** on the floor. Both have a broad, low-friction capsule back, low restitution, finite mass and a visible pair of slide chevrons. A poor angle may still slow, tumble or deflect the volunteer; there is no outcome guarantee.

Their fixture geometry is a box plus two end circles. Density accounts for all three fixtures so total mass stays 4/6 kg. Drawing follows that same capsule silhouette. The warning uses its full conservative radius, including rotated ends, rather than mistakenly using only the first small cap fixture. Existing amber edge warnings receive a small ↔ badge for an individual skid; crowded warnings retain their grouped count and four-cue maximum.

Fresh encounter schedules now leave a radius-plus-motion margin within the birth biome. After activation these are ordinary dynamic bodies, so gravity/contact may naturally carry them across altitude bands. Fixed authored terrain is unchanged. The seeded schedule deliberately changes with the expanded catalog and margin; the old schedule golden failed as expected and was replaced with the reviewed iteration-28 baseline. Rewind/snapshot/caching/fresh-birth tests continue to pass.

## Evidence

213 tests pass. New tests cover capsule mass/material/bounds, non-increasing contact energy, distinct slide/bounce outcomes, birth-biome constraints, full-radius slide warnings, two actual repeated contacts and idempotent rewards, forty rapid synthetic contact pulses respecting the 80ms cooldown, and exact capsule snapshot continuation. Existing tests cover regional kind visibility, arrival clearance/audio cooldown, active-body/event bounds and energy accounting. No scoring formula, health or save policy changed.

A controlled 0.1kg projectile starting at (3,-8)m/s leaves the seed-husk contact at about (2.391,.617)m/s, versus (3.887,4.315)m/s from the round fungus. Both lose total energy. This is an isolated material/shape test, not gameplay range or success evidence. Three real loading/release cases (lizard, turtle, armadillo) exactly match the untouched recovery build; all have zero assistWork. See launch-parity.json.

The save-free contact-review.html uses the real game renderer and solver with explicitly labelled synthetic mouse incoming poses. At 390×844, canopy and floor capsule silhouettes/chevrons and the round fungus were visually inspected at game size. The waxleaf edge case showed “Nearby: waxleaf skid (right).” with the ↔ badge while its outer silhouette was still clipped. The first synthetic edge pose at +4.8m was already inside the camera lookahead and correctly had no warning; the actual outside-view case is +6.8m. Canopy contact counted one impact over 2 seconds; floor contact/ground continuation counted seven over about 2.01 seconds. Reduced motion was checked; console warnings/errors were empty and the temporary viewport override was reset.

The obsolete preparation QA tab was closed only after confirming zero wallet, Save off, no held grip and idle mechanism. One paused encounter review remains useful for continuation. User/older tabs and earned-save origins were not manipulated. Recovery copy remains untouched.

Natural encounter density, human reaction fairness, full-game long soak behavior with the expanded catalog, actual-device performance and audible quality remain unverified. There was no screenshot/video export, deployment, install, unlock or blocked-operation retry.
