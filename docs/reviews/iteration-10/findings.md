# First-run hardware, bounded impacts and manual play

## Visible starter hardware selected from measurements

The UI now starts with a **140 kg counterweight**, the existing **3 / 0.8 m beam and 2.5 m sling**, **3.55 rad rail mounting**, **0.18 m rail length**, and unchanged **0.5 kg split panels**. `src/starter.js` is the shared frozen hardware record. The HTML, lab controls and first-run regression agree. The shop's heavier counterweight is now **180 kg** at the unchanged 30-bell price, so equipping it actually changes the new starter. Prices/rewards remain prototype balance, not lore. Existing owned IDs remain valid; the current prototype catalog supplies their current physical effects.

The screening evidence contains **198 measured trials** across all eleven species: twelve visible hardware candidates using the torso/root lift recipe, plus head/left/right placements for the old and selected setups. Every trial uses actual motor winding at fraction 0.6, finite hand loading, an unheld contact observer, canonical release and authored-world contact. These screens use iteration-9 collision refinement at 1200 Hz; production's subsequent 2400 Hz refinement is checked separately below. Independent loading histories mean these are practical configurations, not isolated release-efficiency comparisons.

For torso/root loading, the previous setup has **three launch-branch returns in eleven shots**; the selected setup has **zero in eleven**, with all eleven positive forward releases. Ten reach ground within the bounded observation; the passive flying squirrel remains airborne. No hidden assistance or per-species hardware selection is used. A 3.65 or 3.8 rad rail produces many backward/branch throws, and compact geometry is worse for some species; these poor settings remain available and their evidence is retained.

Combining the torso/root and three added poses gives **14 branch returns among 43 seated old shots** (one snake placement fails seating), versus **four among 44 seated selected shots**. All selected releases point forward. The remaining returns are the flying squirrel with head grip and the heavy armadillo with head/offset poses. These are bounded observed frequencies, not probabilities for arbitrary player input. The newer 22-case torso/head production regression below likewise has two head-grip branch returns. Heavy loads still require attention; do not advertise guaranteed success.

Reproduce a candidate with `node scripts/measure-starter.js --setup balanced-140`; add `--poses` for head/left/right. With no filter, the current script reruns all twelve candidates. The original initial six-candidate screen remains in `starter.json`; later screens have specific filenames. Earlier JSON retains its measured source hashes rather than being rewritten to imply it used the latest source.

## More accurate fast contacts within the CPU budget

The UI now requests **2400 Hz only inside the existing fast collision regions**, capped at four internal integrations per outer tick. Open air, slow rest, loading, winding and release keep their prior stepping. `collisionStepHz` accepts only 1200 or 2400 and survives canonical snapshots; prediction uses exactly the same rule. Historical experiments retain 1200 Hz unless configured otherwise.

The controlled `node scripts/measure-impact.js` study uses identical incoming snapshots and compares fixed stepping, 1200 Hz refinement and 2400 Hz refinement. In the mouse/salamander/tiny-primate cases, refined anchor maxima change from **0.061/0.068/0.00075 m** to **0.00060/0.00061/0.00078 m**. Angular excess changes from **0.262/0.062/0.108 rad** to **0.082/0.091/0.072 rad**: salamander angular response worsens slightly despite much better anchor preservation. No case becomes nonfinite or has positive work-adjusted energy residual.

The offline budget remains **4 ms per 60 Hz physics batch**, not a mobile guarantee. Observed 2400 Hz batch p95 is **0.74–1.40 ms**, maximum **1.62 ms**, with zero 4 ms overruns in these samples. Integration counts over one second are 744, 690 and 1230 rather than 600: sustained contacts can cost more than full 1200 Hz in a particular rig. This is not a blanket CPU savings claim. Browser rendering, device scheduling and actual mobile hardware are excluded.

## Current production regression

The 35-case starter/equipment/winding regression produces **33 launches and two seating failures**. Every seated shot matches the canonical predictor exactly, without modifying live state or restoring wrong joint angles. There are no nonfinite bodies, excessive-rope, explosive-energy or suspected surface-penetration candidates; zero candidates is not proof against all tunneling. Maximum work-adjusted positive energy residual is zero.

Compared with iteration 9, anchor warnings fall **eight → one**, worst anchor error **0.093 → 0.056 m**; angular warnings fall **eleven → five**, worst excess **0.448 → 0.266 rad**. Both starter hardware and collision refinement changed, so this broad comparison does not isolate their causes. The one anchor warning occurs during mouse loading, not ground impact. Worst remaining angular error is a small-marsupial rear leg in flight. Low winding still loses lizard/armadillo loads; low-winding turtle now launches but goes backward/downward. High-winding and long-beam configurations still produce branch returns. These failures remain visible.

Three budgeted prediction jobs preserve exact release parity; individual advances remain around 2.6 ms, while total work remains about 55 ms. Raw source hashes, timings and diagnostic details are in `regression.json` and `regression-prediction-benchmark.json`. **127 tests pass**, including the actual repeated shop/save/physical-launch sequence using the new 140→180 kg counterweight progression. Syntax and diff checks pass.

## Clear mechanical advice and recovery

The short predictor now reports its actual release direction/speed and names the authored obstacle where its hint is clipped. Slow/backward releases suggest comparing visible counterweight/rail/sling or loading choices; it does not reveal later bounce outcomes or calculate an invented full-flight score. The hint expires against its own moving pose as before. The first-run tip explains the middle of the winding meter. A **Restore starter dimensions & mass** button resets visible lab values, explicitly retaining owned equipment precedence. Unaffordable shop buttons are disabled and show the number of bells still needed. Main status uses plain phase labels and moves the queue seed into the hardware diagnostics. Rewards and Bank & retry behavior remain intact.

## Manual browser play and visual checks

Using permitted native browser controls, with tap-to-hold enabled, three lizard loads were physically dragged above the cradle, dropped into observed contact and unlatched. No hidden scene calls, position assignments or test currency were used.

- The first shot used old hardware, returned into the branch, then reached the forest floor. Banking nine impacts awarded **23 bells**, wallet **480 points / 23 bells**.
- Visible lab controls were changed to the selected 140 kg / 3.55 rad / 0.18 m candidate. The second shot reached **229 m** when observed, with nine impacts. Banking left **2992 points / 46 bells**.
- **Grippier feet** were purchased/equipped for **40 earned bells**, leaving six. Next volunteer retained the equipment. A third physical wind/load/release reached **88 m / six impacts** when observed. This completes actual launch → flight → bank → purchase/equip → next launch, including queue progression and the physical-grip workflow.

That continuous manual session began on the preceding checkpoint's loaded page, with candidate values entered visibly. It therefore validates that browser loop with iteration-9 physics, not a manually replayed loop on every final source change. The final page was separately opened/reloaded: new starter values, affordability labels, reset-to-starter behavior and compact feedback were verified. Viewports **390×844 portrait** and **844×390 landscape** were inspected; the landscape stage and lower controls fit together after scrolling. The viewport override was reset and the updated local page kept open. No warnings/errors were captured on that updated page.

Mute was visibly toggled during the manual flight. The volume slider accepted focus/pointer interaction, but its native accessibility result did not expose a changed numeric value; precise gain and audible quality remain unverified. Controls have explicit accessible labels, with existing 44 px minimum control heights. Viewport emulation is not touch-device or mobile-performance validation. No screenshot/clip export, unlock, push or deployment was attempted.
