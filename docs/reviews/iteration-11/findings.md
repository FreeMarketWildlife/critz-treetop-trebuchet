# Current-runtime loop, recoverable controls and biome feedback

## Verified behavior and UI defects fixed

Audio mute/volume previously reset on reload. They now use a small separate device-preference record, written only when a control changes. Unsupported storage and malformed values fall back safely. Loading preferences does not create an AudioContext or start playback. The UI states that these preferences are independent of opt-in game progress.

The game-progress opt-in choice previously vanished on reload, requiring another checkbox click to recover an existing save. An explicit consent flag now restores both the checked state and validated economy automatically. Opting out stops automatic reads/writes but retains the recoverable save. Invalid saved data produces a recoverable message. No network storage or account is involved.

Banking is now explicit: before physical release the bank button is disabled; after payout it reads **Run banked** and is disabled. The run can keep moving, but guidance says later impacts do not change that payout. Retry/next still bank an unbanked released shot exactly once. This fixes the confusing combination of continuing bounce counts and a still-active Bank button.

Left/Right flight keys previously intercepted range and number inputs. `isFlightControlKey` now leaves input/select/textarea/contenteditable targets and browser shortcuts alone, while permitting steering after clicking the launch button. A native browser keyboard check changed Volume **15% → 20%**, and a real reload retained **Muted / 20%**. The input test covers editing targets, modifiers and ordinary game targets.

Guidance text also changed the canvas position during a drag when warnings wrapped. A stable **three-line guidance region** now lives in the page's critical base styles; longer combinations scroll internally. Head/heavy messages are shorter. Measured desktop canvas top was **291.6796875 px before and after grip feedback**, with guidance height **54.59375 px**. This preserves the pointer-to-world mapping while a player is loading. The critical style was verified in the rendered page rather than inferred from the stylesheet file.

## More readable traversal and original feedback

The flight view uses readable **Grandfather Tree / Open sky / Jungle canopy / Forest floor** names. A presentation-only journey tracker announces transitions with a two-metre boundary buffer. A quiet original two-tone cue plays only on first visits; returning across a boundary does not repeatedly play it. No terrain, motion or rewards are changed by the tracker.

Two fixed passive bumpers at **(32, 255)** and **(48, 165)** make authored obstacles accessible to more ordinary launch paths. They remain part of one deterministic map, not per-player materializations or assisted trajectories. Five regression cases now first hit a bumper; the measurement helper identifies circles as bumpers rather than mislabeling them as the loading shelf. One old mechanism test now accepts a real bumper or ground as its first world contact, while retaining forward/upward release, energy and launch-branch-clearance assertions.

Dynamic encounter bodies retain **kind and biome** through snapshots. Existing biome-specific recipes keep their own size, mass, restitution and friction. Original round-bird beak/wing and beetle/vine-bug antenna/shell markings distinguish those creatures within their circular collision silhouettes. This is encounter-creature presentation, not new player-species-specific AI or story canon. Rendering tests cover all eight recipe kinds with bounded draw calls.

Impact rings now reflect normalized impulse strength. Original sound timbres still depend on material and player mass, with a bounded four-step pitch variation. Impact chatter is limited to one cue per 90 ms, encounter arrivals remain separately limited, and the ten-voice cap/quiet envelopes remain. Zone notes have lower gain and a two-second event guard. No assets, music loop, physics force or injury state is added by sound.

## Joint warnings: bounded transients versus sustained divergence

The diagnostic now observes **half a second after first contact**, then follows obstacle/branch shots toward ground within the 15-second flight bound and observes another half-second recovery when reached. It records per-phase counts and consecutive runs above the existing 0.05 m anchor / 0.08 rad angular thresholds. Measurements sample the **600 Hz outer ticks**, not every internal substep peak; durations are sampled estimates.

The 35 cases produce **33 releases and two seating failures**, with exact canonical prediction parity, unchanged live state and exact restored joint coordinates. Twenty-six reach ground in the observation window; ground contact was not observed for the remaining seven within the bound. No nonfinite, excessive-rope, explosive-energy or suspected surface-crossing candidates are observed, and maximum work-adjusted positive energy residual is zero. The surface detector is bounded evidence, not proof against every possible tunneling event.

The expanded window exposes **one anchor warning and seventeen angular warnings**, maximum **0.0573 m / 0.7649 rad**. These counts are not comparable to iteration 10's first-impact stop. Most angular excursions last one or two sampled ticks and recover. The important exception is **turtle head-grip → torso/tail joint at ground impact**: approximately **0.765 rad** excess with **22 consecutive bad samples (~36.7 ms)**. Half a second later its anchor gap is **0.000020 m**, angular excess **0.0116 rad**. This is a significant visual solver artifact that recovers, not a harmless diagnostic and not sustained numerical divergence. No limit was widened and no pose/velocity repair hides it.

All sampled post-contact recovery endpoints finish below the diagnostic thresholds; the largest final angular excess is about **0.035 rad**. Head loading can still produce launch-branch returns. The UI now identifies a head grip and a heavy load, recommends a torso grip/gentle movement and preserves reset/earned-reward recovery. A next controlled experiment should isolate the turtle tail's collision geometry and inertia from the same incoming snapshot, retaining the CPU budget and energy checks.

An iteration-10 prose error has also been corrected: its mouse anchor warning was at first ground impact (`worstHinge.phase: flight`), not during loading. Historical raw evidence is unchanged.

## Checks and performance scope

**132 tests pass.** New tests cover journey hysteresis/first visits, audio variants/status, blocked/corrupt preference storage, keyboard editing and five consecutive save/reload duplicate-award attempts. Existing all-species, physical gear/loop, snapshot, work and audio-node tests remain. Syntax and diff checks pass.

Reproduce diagnostics with `node scripts/measure-regression.js`, prediction scheduling with `--bench-prediction`, and controlled CPU batches with `node scripts/measure-impact.js`. Current diagnostic wall time is about **19.1 seconds**, including the longer ground observation and scans; it is not a frame-time benchmark. Three prediction jobs retain exact release parity, with total CPU about **56–58 ms** spread across advances peaking around **2.62 ms**. The 4 ms / 60 Hz offline physics-batch budget still holds in the three controlled 2400 Hz cases: observed maximum **1.77 ms**, no overrun. Raw source hashes and timings are retained in this directory.

The CPU budget excludes browser painting, audio scheduling and actual mobile hardware. Neither native browser automation nor viewport emulation establishes real-device performance. Audio control values/persistence and WebAudio scheduling are checked; audible quality is not verified.

## Browser audit trail

All gameplay uses the public meter/button and native pointer interactions. Meter timing reads its public DOM value, then clicks the normal winding button. No hidden scene commands, position assignments, velocity boosts or test currency are used.

Earlier in this iteration, a real first shot banked **956 points / 23 bells**. Clicking Bank again did not change it. Reload automatically restored that exact wallet, and another bank attempt awarded nothing. A moving load slipped out; launch disabled correctly, and re-gripping it from the support branch recovered a forward flight. Banking then gave **2990 points / 50 bells**; the 180 kg counterweight cost 30, leaving 20. Reload restored both wallet and equipped ownership.

Further earned runs purchased the 35-bell longer sling. A Bank & retry followed by another Reset left **4707 points / 35 bells** unchanged. An actual Armadillo head grip showed both the head and heavy-load warnings; resetting kept that same wallet. This verified failure feedback without forcing a successful heavy throw.

After the final keyboard and stable-guidance fixes were loaded, the complete loop was replayed again on that source. It began with the earned saved wallet **4707 / 35**, equipped counterweight/sling. A native load/release reached **32 m / five impacts** when observed, banked to **5152 points / 50 bells**, then bought/equipped **Grippier feet for 40**, leaving **10 bells**. The next volunteer was consumed and another physical load/release used all three owned items. The final observed flight and ending save follow below.

That final-source equipped relaunch reached **39 m / six impacts** when observed. **Bank & retry** saved **5687 points / 27 bells**; a second Reset left the wallet unchanged. The saved QA inventory contains the 180 kg counterweight, longer sling and grippier feet. The page was left idle rather than continuously emitting encounters/audio. Audio defaults were restored through the controls to **Sound on / 35%**, remembered on this device. This closes the complete launch → flight → bank → earned purchase/equip → next physical launch loop on the final keyboard/bank/HUD source, not only a preceding runtime.

The final page's responsive measurements are **374×467.5 CSS px** for the canvas at **390×844 portrait**, **640×320** at **844×390 landscape**, with **44 px** lower touch controls. The normal viewport was restored, and no warning/error log entries were captured. These are layout observations on Chrome for Mac, not real touch-device or frame-rate results. The updated local tab remains open. No export, unlock, push or deployment was attempted.

**Next concrete improvement:** isolate the turtle torso/tail impact using identical incoming states and vary its physical collision geometry/inertia within plausible prototype bounds. Recheck energy, the 4 ms batch budget and all species before selecting a change; do not raise joint limits or overwrite a pose to hide the warning. A larger visible touch pickup affordance is also worth testing on a real device; the 44 px control check does not establish that the small canvas critter is easy to grab with a finger.
