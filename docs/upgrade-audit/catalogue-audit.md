> Historical October 21 snapshot: its trajectory equality and 1.2 m starter measurements apply to that checkpoint. See the [October 22 current-source audit](current-2026-10-22/assessment.md) for the 0.6 m starter. Original measurement JSON remains unchanged.

# Complete equipment audit — baseline checkpoint 2c7d127

This is the mechanical audit of all **48 persisted parts in 12 slots**, not a sample. It records the pre-fix behavior separately from the UI/visual changes being integrated alongside it. Measurements are [available in full](catalogue-measurements.json). No source physics, catalogue values, actual browser storage, owned parts, currency, or user saves were changed by this audit.

## What already works, what looks inert, and what remains unresolved

- Every entry can be purchased/owned, equipped, validated and round-tripped through an in-memory save. All paid entries also pass the listed-shop purchase path. All 48 have a compatible intended example that physically releases without a reported failure. These are conditional pieces of an engineered rig, not 48 unconditional range multipliers.
- Frames and counterweight baskets are **capacity unlocks**. At unchanged geometry/fill, higher tier IDs produce exactly the same baseline trajectory. All tiers were tested at expanded height/mass and against the preceding tier's rejecting bounds; their dimensions and actual fixture masses reach the solver. Equipping must keep existing dimensions/fill under the user's control. The pre-fix render does not distinguish these IDs at unchanged settings.
- All four crank tiers cap at the same three-second light-load preparation. Under the identical whale load, one-second draw fractions are 0.0000001100, 0.0000027512, 0.0005498991 and 0.3333333333. All power tiers are connected and differentiated; at identical final draw they deliberately give the same launch, since gravity supplies it. The old UI's 1.65-second preparation estimate disagrees with the actual three-second loose-loading governor; the integrated UI now estimates the actual loaded governor and power curve.
- Arm density/strength, material density/radius, independent versus fixed weight joints, pouch/cord moving mass, release friction and trough friction all reach physics. Higher cloth/cord tiers can overload a tiny starter unless paired with suitable supporting parts. For example cradle/cable/titan cable overload the baseline beam; hammock/elephant/whale pouch snap its twine. Their intended supported examples succeed. This calls for compatibility information, not hidden refill/resizing or a launch impulse.
- **Bearing balance is genuinely subtle and remains unresolved as a balance decision.** Bronze→precision changes baseline release speed 22.00489→22.01414 m/s (+0.0420%). At fixed bear geometry (0.075 m axle) it is +0.0775%; fixed whale geometry (0.8 m axle), +0.0696%. Even a deliberately ten-times-wider starter axle gives only +0.303%. The selected coefficient does change torque; there is no disconnected parameter. Lowering already tiny high-tier friction cannot produce a large improvement without changing the good bronze baseline or adding another explicitly designed benefit. This audit does not certify them as perceptibly useful purchases. Range after collision chains is nonmonotonic, so a single larger observed distance is not proof of a bearing benefit.
- Pre-fix visual trace: arm color, chassis constraints/wheels, material basket and crank geometry are differentiated. Bearing, release, rope, sling, trough, frame and basket tier IDs mostly share their generic treatment. The integrated renderer adds tier-specific fittings and finishes; see visuals.md. Passing this mechanical audit does not certify every fitting as readable at phone size.

## Trace and test method

`PARTS` and `SLOTS` in `src/build-catalog.js` are the inventory authority. `build-shop.js` validates currently listed offers, computes price, immutably debits Bells and adds ownership. Direct `buy` is also covered. `canBuild` checks ownership; `fitEquipment` sets the part ID and only clamps dimensions that exceed the selected capacity. `build-app.js` uses that path for selections and instantiates `BuildSimulation` from the fitted recipe. `validateProgress`/`saveProgress`/`loadProgress` round-trip IDs, dimensions and ownership. All storage here is a fresh in-memory Map, never browser data.

For every entry, a matched full-draw starter comparison runs for up to 12 seconds, with no map, weapons or loose UI loading. A supporting recipe runs for up to 30 seconds. No failed supporting recipe was observed. A still-airborne result at the bound is reported as `flight`, not a certified final range. Capacity envelope construction restores the staged body's dynamic type only to inspect configured mass, without stepping or firing that synthetic envelope. The expanded limit cases are not claimed to be tuned playable launches.

`node --test test/catalogue-audit.test.js` adds **53 passing tests**: one inventory check, 48 per-entry checks, and four cross-tier contracts. `node scripts/audit-catalogue.mjs docs/upgrade-audit` regenerates the JSON. Browser appearance, real loading variation, audio and novice comprehension are outside this Node audit.

## Full inventory and observed effects

“Starter speed” is the measured release speed with only this part fitted (and necessary downward capacity clamps). A number accompanied by a failure is an uncontrolled failure release, not a successful throw. “Supported speed” uses the compatible recipe recorded in JSON; these differing recipes are not a ranking.

| Slot / part | Mechanical contract and actual setting → limit | Starter speed (m/s) | Supported speed (m/s) |
| --- | --- | ---: | ---: |
| chassis · **Root anchors** (`anchored`) | distinct physical contacts/constraints/recoil | 22.005 | 22.005 |
| chassis · **Timber skids** (`skids`) | distinct physical contacts/constraints/recoil | 23.065 | 23.065 |
| chassis · **Rolling chassis** (`wheels`) | distinct physical contacts/constraints/recoil | 23.094 | 23.094 |
| chassis · **Walking triangle** (`walking`) | distinct physical contacts/constraints/recoil | 22.436 | 22.436 |
| chassis · **Floating axle rails** (`floating`) | distinct physical contacts/constraints/recoil | 24.155 | 24.155 |
| arm · **Willow beam** (`twig`) | 1.3 → 2.2 m length; 500 kg/m³; 32 MPa | 23.043 | 23.043 |
| arm · **Oak beam** (`oak`) | 1.3 → 7 m length; 700 kg/m³; 55 MPa | 22.005 | 22.005 |
| arm · **Laminated beam** (`laminated`) | 1.3 → 20 m length; 580 kg/m³; 90 MPa | 22.596 | 22.596 |
| arm · **Ironwood beam** (`ironwood`) | 1.3 → 65 m length; 850 kg/m³; 160 MPa | 21.196 | 14.777 |
| arm · **Colossus truss** (`colossus`) | 1.3 → 160 m length; 450 kg/m³; 260 MPa | 23.296 | 71.704 |
| frame · **Sapling A-frame** (`sapling`) | 1.2 → 3 m axle; 1500 → 10000 g mass | 22.005 | 22.005 |
| frame · **Timber tower** (`timber`) | 1.2 → 10 m axle; 1500 → 100000 g mass | 22.005 | 20.163 |
| frame · **Braced tower** (`braced`) | 1.2 → 30 m axle; 1500 → 3e+06 g mass | 22.005 | 14.777 |
| frame · **Giant gantry** (`giant`) | 1.2 → 100 m axle; 1500 → 1e+08 g mass | 22.005 | 32.746 |
| frame · **Leviathan gantry** (`leviathan`) | 1.2 → 220 m axle; 1500 → 2e+09 g mass | 22.005 | 71.704 |
| ballast · **Pebble basket** (`pebble`) | 5000 → 5000 g mass | 19.961 | 19.961 |
| ballast · **Boulder basket** (`boulder`) | 6000 → 100000 g mass | 22.005 | 22.005 |
| ballast · **Quarry basket** (`quarry`) | 6000 → 2e+06 g mass | 22.005 | 20.163 |
| ballast · **Mountain ballast** (`mountain`) | 6000 → 1e+08 g mass | 22.005 | 14.777 |
| ballast · **Continental ballast** (`continental`) | 6000 → 1.5e+10 g mass | 22.005 | 71.704 |
| material · **River stone** (`stone`) | 2700 kg/m³; 0.0810 m counterweight radius at same mass | 22.005 | 22.005 |
| material · **Sand basket** (`sand`) | 1600 kg/m³; 0.0964 m counterweight radius at same mass | 22.120 | 22.120 |
| material · **Steel plates** (`steel`) | 7850 kg/m³; 0.0567 m counterweight radius at same mass | 21.774 | 21.774 |
| trough · **Timber launch rail** (`runway`) | rail fixture friction 0.24 | 22.005 | 22.005 |
| trough · **Waxed launch rail** (`waxedRunway`) | rail fixture friction 0.06 | 22.001 | 22.001 |
| mount · **Fixed weight** (`fixed`) | rigid weight | 19.990 | 19.990 |
| mount · **Swinging hanger** (`hinged`) | independent hinged pendulum | 22.005 | 22.005 |
| sling · **Leaf pocket** (`pocket`) | 25 → 150 g mass; 0.2 → 0.22 m width; 0.96 → 3 m length; 2 g cloth | 22.005 | 22.005 |
| sling · **Canvas pouch** (`pouch`) | 25 → 3000 g mass; 0.2 → 0.75 m width; 0.96 → 10 m length; 35 g cloth | 18.415 | 20.163 |
| sling · **Deep cradle** (`cradle`) | 25 → 20000 g mass; 0.2 → 1.7 m width; 0.96 → 25 m length; 250 g cloth | 0.695 (Beam overloaded) | 15.134 |
| sling · **Great hammock** (`hammock`) | 25 → 500000 g mass; 0.2 → 4 m width; 0.96 → 65 m length; 5000 g cloth | 0.045 (Sling cord snapped) | 14.777 |
| sling · **Elephant harness** (`elephant`) | 25 → 8e+06 g mass; 0.2 → 9 m width; 0.96 → 120 m length; 80000 g cloth | 0.050 (Sling cord snapped) | 32.746 |
| sling · **Whale hammock** (`whale`) | 25 → 1.5e+08 g mass; 0.2 → 32 m width; 0.96 → 230 m length; 1e+06 g cloth | 0.053 (Sling cord snapped) | 71.704 |
| rope · **Braided twine** (`twine`) | 150 N break load; 12 g/m; 25.04 g cloth/cord total | 22.005 | 22.005 |
| rope · **Hemp cord** (`hemp`) | 12000 N break load; 45 g/m; 88.4 g cloth/cord total | 15.868 | 20.163 |
| rope · **Steel cable** (`cable`) | 2.5e+06 N break load; 350 g/m; 674 g cloth/cord total | 0.377 (Beam overloaded) | 15.134 |
| rope · **Titan cable** (`titanCable`) | 1.5e+09 N break load; 2500 g/m; 4802 g cloth/cord total | 0.047 (Beam overloaded) | 71.704 |
| bearing · **Wooden axle** (`woodAxle`) | friction 0.022 × reaction load × axle radius; small measured gain | 21.991 | 21.991 |
| bearing · **Bronze bushings** (`bronze`) | friction 0.009 × reaction load × axle radius; small measured gain | 22.005 | 22.005 |
| bearing · **Roller bearings** (`bearings`) | friction 0.002 × reaction load × axle radius; small measured gain | 22.013 | 22.013 |
| bearing · **Precision bearings** (`precision`) | friction 0.0005 × reaction load × axle radius; small measured gain | 22.014 | 22.014 |
| release · **Bent release nail** (`nail`) | ring friction 0.16 changes release timing/angle | 22.135 | 22.135 |
| release · **Polished release pin** (`polished`) | ring friction 0.04 changes release timing/angle | 22.005 | 22.005 |
| release · **Roller release finger** (`rollerPin`) | ring friction 0.008 changes release timing/angle | 21.950 | 21.950 |
| winch · **Acorn crank wheel** (`hand`) | 100 W; three-second light-load governor | 22.005 | 22.005 |
| winch · **Brass geared wheel** (`geared`) | 2500 W; three-second light-load governor | 22.005 | 22.005 |
| winch · **Iron capstan wheel** (`capstan`) | 500000 W; three-second light-load governor | 22.005 | 22.005 |
| winch · **Gantry winding wheel** (`engine`) | 5e+08 W; three-second light-load governor | 22.005 | 22.005 |
