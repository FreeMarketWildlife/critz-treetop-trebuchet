# Iteration 18 — loading route, world scale, warning severity

Production changes are presentation only. Instructions in the tutorial, loading coach, canvas caption and first-run guidance explain lifting beside the cradle before moving across above its solid floor and releasing. The force-driven grip, contact eligibility and recovery remain unchanged. Original distant scenery now includes one immense trunk with world-height bark and separate woodland crowns/trunks in canopy/floor bands. Soft silhouettes remain behind strong collider outlines; no collider, camera, species, biome threshold, reward or save changes.

## Verification

- `npm test`: 161 pass, zero failures. Existing deterministic scenery, reduced-motion and bounded-work checks pass.
- `node scripts/measure-regression.js`: 35 rows exactly equal iteration17 after removing timing fields; 32 releases, three low-winding misses, eleven angular warning rows, no source changes during measurement. Existing exact prediction/live parity retained.
- `node scripts/measure-seating-recovery18.js`: all six current soak misses release at medium winding with identical equipment and the same volunteer. First contact occurs within124ticks (0.207s). Low possum i8 has usable tick0 contact missed by the soak's delayed61tick search; the other low recipes do not find contact. Armadillo medium forward speed0.877m/s remains a poor mechanical throw. No new automatic seating or guaranteed range.
- Independent numerical review: all eleven angular rows recover below0.08rad; longest recorded consecutive warning is one600Hz sample (1.67ms). Approximate angular-only tip displacement is1–2px at42px/m; this excludes internal peaks and other motion. See `review.md` and `angular-severity.json`.
- Two identical incoming lizard fixtures isolate a free600Hz post-bounce limit crossing: head-loaded0.17063rad, light beam0.17508rad; same-joint anchor gaps0.00356/0.03267mm and no touching payload contacts at peak. Maximum observed touching-contact penetration0.807/5.168mm. Finer contact stepping alone worsens the head case. Research relative-joint-motion refinement capped8 improves both to0.05681/0.07712rad with zero positive energy residual; this is not production code and needs cross-species/natural/CPU validation. Armadillo did not produce a ground fixture within the capture bound; do not infer its obstacle impact from the lizard evidence. See `incoming-impact-review.md`.

## Browser observations

Current local source, Chrome normal1728×875, new save-off session; original saved session untouched. Physically wound target0.54, lifted salamander beside the cradle, regripped above and moved across, dropped under gravity, then Unlatch became enabled. Natural release61.4°/17.37m/s; observed canopy and forest-floor play views,119m/8bounces. Collected1385points/21bells once; retry preserved balance and volunteer queue. Hand work16.44J, arcade0, motor456.2J. Sound on35%, sticky grip on, no equipment owned.

Observed warm240frame window CPU p95/max1.8/2.6ms, engine1.0ms, draw0.6ms, RAF interval9.8/10.4ms; later floor window2.6/2.9ms, engine2.3ms, draw0.4ms, RAF9.7/10.3ms. Shared host and browser estimates, not deviceFPS or audible QA. Node no-op context scenery measurements bound method calls73–170, not rasterization cost. No repeated long soak: simulation code unchanged and numerical regression exact.

Actual-size screenshots were inspected in the browser, not exported or persisted. The labeled `scenery-preview.html` is a static decorative fixture comparison at42px/m, not a gameplay capture. Departure, canopy and floor were observed during real UI play; continuous sky traversal and portrait review of these new silhouettes remain unverified. No unlock, blocked-export retry, deployment or push.

## Next

Prioritize the armadillo's actual obstacle incoming state and validate bounded relative-joint-motion integration before any solver change. Keep brief warnings visible in evidence rather than spending unbounded CPU to remove numerical flags. New art can be refined further after continuous sky/portrait inspection.
