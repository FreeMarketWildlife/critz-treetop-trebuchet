# Flight weapons

Three immediately available weapons are mounted in the left HUD. Click/tap the airborne critter; 1–3 select a weapon and F fires an assisted hit for keyboard play. Ammunition resets with each rebuilt throw. Clicks outside the weapon’s hit radius consume a shot. The staff uses heat instead of finite ammo, locks at full heat, and unlocks after cooling below 15%.

The existing Planck payload receives an impulse only in released flight. Velocity is converted through the simulation’s mass, length and time normalization; no winding or release impulse is introduced. Horizontal and upward boosts taper to caps. Impacts are instant aimed shots, not simulated ballistic projectiles. This set boosts the volunteer; it does not add enemy health or combat damage.

Paused, hidden, modal, ready, swinging and finished states reject fire. Heat and visual effects freeze during pauses. All runtime state is per throw; existing saves and shop inventory are unchanged.

Sources and visual requirements are in [the art bible](art-bible.md). SVG weapon illustrations are original vector drawings based on the three inspected deck thumbnails. No source-game sprites were extracted.

## Verification

- New weapon behavior and existing game-shell tests: 16/16 pass.
- Full suite: 408/409 pass at this checkout snapshot. Remaining failure: `every volunteer can be picked by body or head and has stable physical drop seating` in `test/payload-loading.test.js`. Loading and body-model files have concurrent edits and were not changed for weapons.
- Isolated Chrome session with `?qa=1`: launch with Enter/Space, reach released flight, fire F, confirm 3→2 ammunition, pause and verify F does not consume another shot; no browser errors.
- Fresh desktop and portrait screenshots checked. Weapon tray moved below distance panel after initial overlap was found.
