# Current catalogue audit · October 22, 2026

All **48 persisted parts in 12 slots** were rechecked against the current source, using the **0.6 m axle starter** and the unchanged **18 cm / 25 g mouse**. The old 1.2 m starter trajectories are historical evidence, not the expected answer for this new rig. No production source, personal save, inventory, currency, map or release was edited by this audit.

The [complete measurements](catalogue-measurements.json) include every part, exact compatible comparison build, purchase/equip/in-memory persistence checks, capacity settings versus limits, relevant mechanic measurements, phone/desktop renderer signatures and source fingerprints. The measurement source remained stable during the run. Started from repository HEAD `28e4f3aea7adcc6e526237cb2c322839cc78d008` plus the local changes identified by those fingerprints.

## Current results

- All 48 explicit purchase/owned-fit/in-memory save proofs pass. Every compatible intended recipe releases without a failure.
- All 48 reach distinct actual non-colour mechanism drawing commands at 390 × 844 and 1726 × 875. Coordinates remain finite, Canvas state is balanced and painting leaves the simulation unchanged.
- Frame and ballast IDs preserve configured geometry/fill. Expanded settings are measured at 80% of each selected part’s limits; the previous tier rejects those settings. This is capacity evidence, not a certified tuned launch at the capacity limit.
- Crank tiers change heavy-load winding power. Bearings retain their separate preparation comfort benefit and small physical friction effect. Cloth and cord add moving mass; their larger compatible rigs are tested separately from the tiny starter.
- The automatic-purchase guard now keeps oversized moving hardware in inventory rather than replacing the working mouse rig. The final measurement has no unsafe automatic-fitting findings.

## Release fingers: the failing assertion was stale

The old test required more than 2° between every tier at the previous starter geometry. On the current starter the polished-to-roller difference is **1.3657°**, with release **1.0417 ms earlier** and speed about **0.0956% higher**. The finger is connected; this is a small arc/timing choice, not a large power upgrade. The revised test checks measured timing and arc at three fixed compatible geometries rather than requiring the old arbitrary 2° number.

| Profile | Finger | Release time | Release angle | Speed |
| --- | --- | ---: | ---: | ---: |
| starter | nail | 418.75 ms | 27.4244° | 11.5287 m/s |
| starter | polished | 413.5417 ms | 34.5601° | 11.5834 m/s |
| starter | rollerPin | 412.5 ms | 35.9258° | 11.5945 m/s |
| ground-loaded | nail | 2,831.4219 ms | 22.7795° | 10.2873 m/s |
| ground-loaded | polished | 2,626.9437 ms | 42.9908° | 10.67 m/s |
| ground-loaded | rollerPin | 2,583.6425 ms | 47.5768° | 10.7655 m/s |
| rabbit | nail | 1,081.25 ms | 34.3541° | 20.0707 m/s |
| rabbit | polished | 1,062.5 ms | 40.4064° | 20.1631 m/s |
| rabbit | rollerPin | 1,058.3333 ms | 41.6858° | 20.1795 m/s |

The ground-loaded rig and Rabbit comparisons also distinguish all three tiers. Whether a new player notices the smaller starter roller effect remains a playtest question; code-level difference is not a perception certificate.

## Actual losses and mass tradeoffs

The waxed rail reduces estimated contact work from **0.2908 J** to **0.1515 J** (47.8805% lower) in the ground-loaded sliding recipe. Tangential impulse is 0.2012 versus 0.1137 N·s. This estimates work from actual contact impulses and average tangential speeds; it is not a whole-rig conservation certificate. The tiny starter barely slides, so no general range bonus is promised.

The supported mechanical comparisons include all frame, ballast, beam and sling capacities; three materials at matched fill mass; all bearing tiers at fixed Mouse/Bear/Whale scales; and all four crank tiers at matched light/heavy loads. Exact masses, dimensions and outcomes are in the JSON.

## Oversized purchase finding and resolution

Before the production owner’s inventory guard, five valid hardware purchases could silently replace the working starter with a bad configuration: Cradle overloaded the beam, while Great hammock, Elephant harness, Whale hammock and Titan cable stalled without release. `buildFacts` had no static warning because the heavy cloth/cord mass was not part of that warning. These are working parts on larger supported rigs, not inert upgrades.

The production fix is an honest conservative purchase policy: if moving cloth/cord becomes heavier than the critter and increases relative to the current build, retain the current rig and acquire inventory for explicit fitting/balancing. It does not pretend to predict dynamic overload. Canvas pouch, Hemp cord and Steel cable are also inventory-only on the mouse starter even though their controlled full throws work; they remain manually selectable and are not described as impossible.

| Hardware | Moving cloth + cord on mouse rig | Direct starter outcome | Purchase action now |
| --- | ---: | --- | --- |
| Canvas pouch (`pouch`) | 46.52 g | Clean controlled release | Acquire inventory; retain current rig |
| Deep cradle (`cradle`) | 261.52 g | Beam overloaded | Acquire inventory; retain current rig |
| Great hammock (`hammock`) | 5,011.52 g | No release — try the pin, arm ratio, or counterweight | Acquire inventory; retain current rig |
| Elephant harness (`elephant`) | 80,011.52 g | No release — try the pin, arm ratio, or counterweight | Acquire inventory; retain current rig |
| Whale hammock (`whale`) | 1,000,011.52 g | No release — try the pin, arm ratio, or counterweight | Acquire inventory; retain current rig |
| Hemp cord (`hemp`) | 45.2 g | Clean controlled release | Acquire inventory; retain current rig |
| Steel cable (`cable`) | 338 g | Clean controlled release | Acquire inventory; retain current rig |
| Titan cable (`titanCable`) | 2,402 g | No release — try the pin, arm ratio, or counterweight | Acquire inventory; retain current rig |

## Complete current inventory

Each entry below has a clean intended compatible release and passes explicit purchase/equip/persistence. “Capacity” means the user chooses a supported larger configuration; unchanged energy at unchanged dimensions is expected. Physical drawing variants are distinct for every entry in both measured viewport sizes.

| Slot | Part | Price | Positive mechanical role | Compatible critter | Release at full draw |
| --- | --- | ---: | --- | --- | --- |
| chassis | Root anchors (`anchored`) | 0 | Fixed axle; no recoil | mouse | 11.5834 m/s · 34.5601° |
| chassis | Timber skids (`skids`) | 45 | Real sliding frame contacts | mouse | 11.5267 m/s · 35.8585° |
| chassis | Rolling chassis (`wheels`) | 110 | Rolling recoil and brake | mouse | 11.9564 m/s · 39.8354° |
| chassis | Walking triangle (`walking`) | 240 | Rocking toe support | mouse | 12.0589 m/s · 34.4263° |
| chassis | Floating axle rails (`floating`) | 420 | Sliding axle and guided counterweight | mouse | 12.3242 m/s · 37.0603° |
| arm | Willow beam (`twig`) | 0 | 2.2 m beam limit; 500 kg/m³; 32 MPa | mouse | 11.8084 m/s · 35.0553° |
| arm | Oak beam (`oak`) | 65 | 7 m beam limit; 700 kg/m³; 55 MPa | mouse | 11.5834 m/s · 34.5601° |
| arm | Laminated beam (`laminated`) | 260 | 20 m beam limit; 580 kg/m³; 90 MPa | mouse | 11.7243 m/s · 35.142° |
| arm | Ironwood beam (`ironwood`) | 1100 | 65 m beam limit; 850 kg/m³; 160 MPa | bear | 14.7765 m/s · 43.1606° |
| arm | Colossus truss (`colossus`) | 4800 | 160 m beam limit; 450 kg/m³; 260 MPa | whale | 71.7039 m/s · 40.1448° |
| frame | Sapling A-frame (`sapling`) | 0 | 3 m axle / 10 kg frame capacity | mouse | 11.5834 m/s · 34.5601° |
| frame | Timber tower (`timber`) | 80 | 10 m axle / 100 kg frame capacity | rabbit | 20.1631 m/s · 40.4064° |
| frame | Braced tower (`braced`) | 300 | 30 m axle / 3,000 kg frame capacity | bear | 14.7765 m/s · 43.1606° |
| frame | Giant gantry (`giant`) | 1400 | 100 m axle / 100,000 kg frame capacity | elephant | 32.7457 m/s · 41.8353° |
| frame | Leviathan gantry (`leviathan`) | 5000 | 220 m axle / 2,000,000 kg frame capacity | whale | 71.7039 m/s · 40.1448° |
| ballast | Pebble basket (`pebble`) | 0 | 5 kg chosen fill capacity | mouse | 11.5834 m/s · 34.5601° |
| ballast | Boulder basket (`boulder`) | 55 | 100 kg chosen fill capacity | mouse | 11.5834 m/s · 34.5601° |
| ballast | Quarry basket (`quarry`) | 220 | 2,000 kg chosen fill capacity | rabbit | 20.1631 m/s · 40.4064° |
| ballast | Mountain ballast (`mountain`) | 950 | 100,000 kg chosen fill capacity | bear | 14.7765 m/s · 43.1606° |
| ballast | Continental ballast (`continental`) | 4200 | 15,000,000 kg chosen fill capacity | whale | 71.7039 m/s · 40.1448° |
| material | River stone (`stone`) | 0 | 2,700 kg/m³; radius/inertia at matched mass | mouse | 11.5834 m/s · 34.5601° |
| material | Sand basket (`sand`) | 35 | 1,600 kg/m³; radius/inertia at matched mass | mouse | 11.7401 m/s · 31.8968° |
| material | Steel plates (`steel`) | 150 | 7,850 kg/m³; radius/inertia at matched mass | mouse | 11.2945 m/s · 38.4564° |
| trough | Timber launch rail (`runway`) | 0 | Rail friction 0.24; measured sliding loss | mouse | 11.5834 m/s · 34.5601° |
| trough | Waxed launch rail (`waxedRunway`) | 85 | Rail friction 0.06; measured sliding loss | mouse | 11.5813 m/s · 34.4383° |
| mount | Fixed weight (`fixed`) | 0 | Rigid counterweight inertia | mouse | 11.5573 m/s · 24.7203° |
| mount | Swinging hanger (`hinged`) | 90 | Independent swinging counterweight | mouse | 11.5834 m/s · 34.5601° |
| sling | Leaf pocket (`pocket`) | 0 | 0.15 kg cargo; 0.22 m opening; 2 g cloth | mouse | 11.5834 m/s · 34.5601° |
| sling | Canvas pouch (`pouch`) | 60 | 3 kg cargo; 0.75 m opening; 35 g cloth | rabbit | 20.1631 m/s · 40.4064° |
| sling | Deep cradle (`cradle`) | 200 | 20 kg cargo; 1.7 m opening; 250 g cloth | fox | 15.1343 m/s · 43.6514° |
| sling | Great hammock (`hammock`) | 650 | 500 kg cargo; 4 m opening; 5,000 g cloth | bear | 14.7765 m/s · 43.1606° |
| sling | Elephant harness (`elephant`) | 2200 | 8,000 kg cargo; 9 m opening; 80,000 g cloth | elephant | 32.7457 m/s · 41.8353° |
| sling | Whale hammock (`whale`) | 6500 | 150,000 kg cargo; 32 m opening; 1,000,000 g cloth | whale | 71.7039 m/s · 40.1448° |
| rope | Braided twine (`twine`) | 0 | 150 N break load; 12 g/m per cord | mouse | 11.5834 m/s · 34.5601° |
| rope | Hemp cord (`hemp`) | 70 | 12,000 N break load; 45 g/m per cord | rabbit | 20.1631 m/s · 40.4064° |
| rope | Steel cable (`cable`) | 500 | 2,500,000 N break load; 350 g/m per cord | fox | 15.1343 m/s · 43.6514° |
| rope | Titan cable (`titanCable`) | 2500 | 1,500,000,000 N break load; 2,500 g/m per cord | whale | 71.7039 m/s · 40.1448° |
| bearing | Wooden axle (`woodAxle`) | 0 | Friction 0.022; loaded minimum 3.6 s | mouse | 11.5784 m/s · 34.6704° |
| bearing | Bronze bushings (`bronze`) | 70 | Friction 0.009; loaded minimum 3 s | mouse | 11.5834 m/s · 34.5601° |
| bearing | Roller bearings (`bearings`) | 350 | Friction 0.002; loaded minimum 2.4 s | mouse | 11.586 m/s · 34.5038° |
| bearing | Precision bearings (`precision`) | 1500 | Friction 0.0005; loaded minimum 2 s | mouse | 11.5866 m/s · 34.4917° |
| release | Bent release nail (`nail`) | 0 | Ring friction 0.16; measured earlier/later release | mouse | 11.5287 m/s · 27.4244° |
| release | Polished release pin (`polished`) | 75 | Ring friction 0.04; measured earlier/later release | mouse | 11.5834 m/s · 34.5601° |
| release | Roller release finger (`rollerPin`) | 360 | Ring friction 0.008; measured earlier/later release | mouse | 11.5945 m/s · 35.9258° |
| winch | Acorn crank wheel (`hand`) | 0 | 100 W preparation power; no added launch energy | mouse | 11.5834 m/s · 34.5601° |
| winch | Brass geared wheel (`geared`) | 100 | 2,500 W preparation power; no added launch energy | mouse | 11.5834 m/s · 34.5601° |
| winch | Iron capstan wheel (`capstan`) | 700 | 500,000 W preparation power; no added launch energy | mouse | 11.5834 m/s · 34.5601° |
| winch | Gantry winding wheel (`engine`) | 3000 | 500,000,000 W preparation power; no added launch energy | mouse | 11.5834 m/s · 34.5601° |

## Provenance and verification

Run `node --test test/catalogue-audit.test.js test/catalogue-art.test.js`: **64/64 passing**. Current tests retain the complete catalogue, meaningful capacity/mass/friction/release/preparation comparisons, safe inventory behavior, all-part visual commands and clean compatible outcomes. The two old failures were the obsolete starter trajectory equality and the old 2° release threshold.

Both original JSON archives remain byte-for-byte unchanged:

- `docs/upgrade-audit/catalogue-measurements.json` · SHA-256 `9a86d653e9fb391354f5919e16f688d8e28e1a6696e55de1cc51e526ea932868`
- `docs/upgrade-usefulness/catalogue-measurements.json` · SHA-256 `6c1b71b712b58e494ab5a2f37120ccf0ae02512377828b02790a61cda3074468`

No browser was used. These checks exclude loose loading variation, door/walkout progression, the authored world, weapons, perceptual art quality, mobile interaction and native gameplay acceptance. Shots use direct full-draw mechanism placement and finite time cutoffs; reported cutoff distances are not complete or certified range benchmarks. The production owner handles shared source fixes and integration acceptance.

The production owner also corrected the four crank descriptions to match the actual mechanism, AGENTS and README: counterclockwise winding and clockwise payout. The final snapshot includes that corrected copy. No wheel power, mass or launch energy was changed by the wording fix.
