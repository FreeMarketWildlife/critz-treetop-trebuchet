# Iteration 27 — preparation beside the play view

The portrait review exposed a practical break in the loading loop: winding remained above the canvas and scrolled away while the player handled the volunteer. A second hold/release button and a read-only meter now sit below the release controls. Both buttons use the same winding gesture owner, elapsed-time meter, reachable target and torque-limited motor. Pointer capture follows the button that owns the gesture. There is no extra winding implementation, target override or launch force.

The adjacent preparation cue follows the existing loading coach and actual phase. It explains winding before loading, then lift/across/release or contact/retry status. It is described by the near button but does not duplicate live announcements from the existing guidance output. Controls stay gated while held/paused and the preparation panel hides after launch.

Final-CSS roster coverage now includes Frog, completing eleven species with stable real pickup and direct Let go at 390×844, long hardware and low winding. Ten records were retained from the prior review; Frog was completed in this session. One earlier rapid squirrel preset miss remains disclosed; its inspected re-grip succeeded. These checks measure layout and grip ownership, not loading success rates.

Ordinary Tab focused Let go and Return released Frog without changing canvas bounds or scroll. The earlier locator.press focus jump did not occur with ordinary keyboard navigation. No game focus workaround was added.

Browser checks exercised real 1-second pointer and ordinary keyboard holds on the near button: both read .49 on both meters (physical fraction .5675), physically wound, and reached loading. Winding was disabled on both controls during a held marmoset grip. Canvas/release layout remained stable. Layout inspections at 320 and 390 portrait and 844 landscape found no horizontal overflow; temporary viewport override was reset. Console warnings/errors were empty. QA used separate port 8082 with zero wallet and saving off; the earned-save origin was not manipulated.

All 206 tests pass. Physics, loading contacts, predictor, economy and save implementations are unchanged. The previous long numerical studies remain the relevant physical baseline; they were not repeated for this UI change. Actual-device performance, audible quality, a human two-stage loading benchmark and human reaction testing remain unverified. No screenshot/video export or blocked operation was retried.
