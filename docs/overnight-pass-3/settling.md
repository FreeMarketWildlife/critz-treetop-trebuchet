# Pass 3 settling diagnosis

Start: clean HEAD 6860df8. No physics source change warranted.

The nominal 600 m / zero-drag fall starts at y=-1 above a floor y=-600, downward 5 m/s. First impact 11.097353 s. Final rest 43.984622 s. Last centre speed above 1 m/s 42.903958 s; aftermath 1.080664 s. Last speed above .16 m/s 43.182404 s; final quiet tail 0.802218 s, including existing .8 s rest dwell.

Genuine rebound apex heights after successive impacts:
- Impact 1: 11.100 s, approach normal 102.945 m/s, next apex 201.971 m
- Impact 2: 24.628 s, approach normal 59.705 m/s, next apex 67.956 m
- Impact 3: 32.474 s, approach normal 34.626 m/s, next apex 22.867 m
- Impact 4: 37.025 s, approach normal 20.082 m/s, next apex 7.710 m
- Impact 5: 39.666 s, approach normal 11.650 m/s, next apex 2.611 m
- Impact 6: 41.199 s, approach normal 6.754 m/s, next apex 0.897 m
- Impact 7: 42.087 s, approach normal 3.926 m/s, next apex 0.319 m
- Impact 8: 42.607 s, approach normal 2.275 m/s, next apex 0.125 m
- Impact 9: 42.908 s, approach normal 1.316 m/s, next apex 0.060 m
- Impact 10: 43.083 s, approach normal 0.768 m/s, next apex 0.038 m

Other bounded scenes:
- tiny-drop: finished 0.809578 s; final quiet tail 0.802218 s; slow-centre/high-spin time 0.000000 s.
- recoverable-hop: finished 2.189541 s; final quiet tail 0.802218 s; slow-centre/high-spin time 0.000000 s.
- slow-center-spinning-whale: finished 2.336896 s; final quiet tail 0.800908 s; slow-centre/high-spin time 0.645833 s.
- hard-spinning-whale: finished 11.673509 s; final quiet tail 0.800908 s; slow-centre/high-spin time 0.679167 s.

No substantial flight or angular motion was truncated. There is no demonstrated pathological chatter tail to fix: tiny contact noise ends in .81 s and all quiet tails are the existing .8 s confirmation dwell. Changing ground restitution or terminating earlier would discard valid rebound motion. No saves, launcher/loading state, material coefficients or experimental guards changed.

Added scripts/measure-settling.mjs for reproducibility and test/settling.test.js with four behavioral regressions: tiny chatter, recoverable low hop, slow-translation spinning whale and high-fall true rebound. Parent will combine full-suite tests and browser QA. No browser or Sites actions were taken by this agent.
