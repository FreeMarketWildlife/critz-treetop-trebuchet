# Prototype economy and physical equipment review

All prices and reward rates below are prototype balance choices, not story canon. Points and bells remain independent: 10 points per metre plus 25 per impact; bells are 5 per launch plus 2 per impact. Distance contributes no bells. Awards cap distance at 10,000 metres and impacts at 50 to bound input. Currency does not modify velocity.

## Early affordability

With no impacts, the first 30-bell counterweight costs six launches; one-impact launches reach it after five. The 35-bell sling takes five one-impact launches, frame options six, long beam seven, light beam eight. This is accessible but may feel slow if a launch takes substantial time. No price reduction was justified without human play evidence. A repeat-cycle integration test winds, physically loads, observes release and first world contact, banks seven bells, purchases/equips at launch five, and launches the actual heavier mechanism on launch six. It serializes/restores state between launches and checks duplicate banking before and after restore. This test deliberately excludes later impacts and enemy awards; it does not claim to measure a full human run or subjective fun.

## Physical hardware observations

Protocol: current PhysicalHookScene, lizard, channel release, stopped split pouch with 0.5 kg panels, torque-limited mechanical winding requested at 0.6 height fraction, standard force-driven loading helper, observed quiet contact, 600 Hz launch. Each configuration is independently loaded; differences include physically different settling histories, not isolated efficiency measurements. No post-release control or encounter forces.

| Equipment | Release COM vx / vy (m/s) | First world impact | x (m) |
| --- | --- | --- | --- |
| Base | 4.23 / 10.93 | Ground | 36.67 |
| Heavy counterweight | 4.12 / 13.66 | Ground | 36.01 |
| Long beam | 3.93 / 10.57 | Ground | 32.75 |
| Light beam | 2.80 / 13.01 | Ground | 22.99 |
| Long sling | 3.67 / 9.88 | Ground | 30.50 |
| Heavy frame | 2.09 / 10.63 | Launch branch | 3.38 |
| Grippy feet | 2.73 / 11.51 | Ground | 22.48 |
| Long beam + long sling | 2.51 / 9.10 | Ground | 28.79 |

All tested configurations completed winding, loading and release. The combined geometry's requested lift is clamped by the existing reachable-clearance calculation; the combination did not intersect the support branch at construction. Heavy frame is a material balance/usability concern: this loading recipe sends it into the launch branch. Equipment currently offers physical alternatives rather than guaranteed range improvements. Do not advertise purchases as universally stronger launches. No parameter tuning here: hiding this result with velocity scaling would violate the physical model. More hardware/rig/loading-history trials are warranted before recommending a linear upgrade progression.

## State and persistence

Reducer actions return new containers without modifying input. Catalog/effects are frozen. Purchases reject unknown items, duplicate ownership and insufficient funds; equipped items must be owned and occupy their defined slot. Shot IDs prevent duplicate awards. Opt-in storage performs no read/write until explicitly enabled; parsing and validation reject corrupted JSON, invalid balances, duplicate IDs and unowned equipment. Safe-integer overflow is rejected. Storage failures propagate to the caller, which should show a recoverable message. This is local prototype integrity, not tamper-proof security.

Completed shot IDs are retained indefinitely to preserve idempotence. Long-running saves grow linearly; compacting IDs needs a deliberate session/sequence scheme and migration before production. No network or automatic persistence is introduced.
