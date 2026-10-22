> Historical October 21 snapshot: its trajectory equality and 1.2 m starter measurements apply to that checkpoint. See the [October 22 current-source audit](../upgrade-audit/current-2026-10-22/assessment.md) for the 0.6 m starter. Original measurement JSON remains unchanged.

# Meaningful equipment benefits — follow-up to 764ebdf

The full 48-part audit was rerun after the targeted preparation change. All 48 direct full-draw results **and all 48 supported full-draw results match the archived audit exactly**. The good bronze starter's three-second preparation, mass, geometry and full-draw launch remain unchanged. All in-memory purchase/equip/save tests pass; the user's browser saves and currency were never used.

Updated evidence: [all-part measurements and relevant mechanics](catalogue-measurements.json). The [original complete inventory](../upgrade-audit/catalogue-audit.md) retains the before-state, all persisted IDs, specifications, actual settings versus capacity and the original bearing limitation.

## Targeted change: useful bearings without a range multiplier

Bearing friction was connected but its energy benefit was too small to sell as a satisfying upgrade. The follow-up gives the existing bearing tiers an explicit **arcade preparation-comfort** distinction, separate from their existing friction coefficients:

| Bearing | Light-load minimum | Measured draw after one second | Time saved versus bronze |
| --- | ---: | ---: | ---: |
| Wooden axle | 3.6 s | 27.78% | −0.6 s |
| Bronze bushings | 3.0 s | 33.33% | baseline |
| Roller bearings | 2.4 s | 41.67% | 0.6 s / 20% |
| Precision bearings | 2.0 s | 50.00% | 1.0 s / 33% |

The actual `BuildSimulation.wind` method was measured with the real loading controller present. The heavy-load power cap can still dominate; better bearings do not replace a sufficiently powerful winch. The old solver/lab API without loading retains its 1.65-second governor. Releasing the same rig at the same draw gives the same full-draw trajectory. Part IDs, ownership, friction, prices, masses and tuning values retain their prior meanings. This is intentionally game balance, not a claim that real rolling bearings necessarily permit exactly these crank speeds.

## Other small effects: measured at the mechanic they promise

**Waxed rail:** In the established long ground-loaded recipe (`PREVIOUS_STARTER`, 4 m long arm, .65 m short arm, 80° draw, 3 m cords), actual trough contacts produced 0.23665 N·s total tangential impulse for timber versus 0.11755 N·s for wax. Estimated tangential contact work fell from 0.28492 J to 0.14815 J, about 48%. Wax released 16.84 ms earlier at 9.8288 versus 9.7623 m/s, with a .730° angle difference. Thus the rail has a real sliding-loss benefit when a rig actually slides on it. The compact starter barely slides and gets no useful speed improvement; no unconditional range claim or further rail retune is justified.

The work estimate integrates actual contact impulses against average pre/post tangential relative speeds. It is an instrumented contact comparison, not an exact whole-rig energy or conservation certificate. Contact time is accumulated across contacts and can include simultaneous fixtures.

**Release fingers:** At identical starter geometry, the nail, polished pin and roller finger release at 32.316°, 38.945° and 41.096°, respectively. Times are .533586, .526226 and .523772 seconds. The polished→roller change gives about 2.15° more arc at the same physical pin setting, a useful timing/arc choice despite only a small speed difference. The catalogue's old claim that rollerPin has a “wider tuning range” is unsupported: all fingers share the same numeric bounds. The description now states the actual earlier ring release; no retroactive tuning restrictions were added to saved configurations.

**Counterweight materials:** At the same 6 kg fill, stone/sand/steel physical fixture radii are .08095/.09638/.05672 m; counter-body inertias are .02194/.02908/.01534 kg·m². Steel is about 29.94% smaller in radius and 30.09% lower in inertia than stone; sand is about 19.06% larger and 32.56% higher. Bulk/clearance and inertia are meaningful choices even though a tuned release's speed does not improve monotonically. Existing material behavior is preserved.

## Every entry's positive mechanical role

All entries below pass memory-only purchase/equip/persistence checks and have a supported recipe that releases without a failure. “Capacity” means the selected part unlocks a larger chosen setting; the audit does not silently enlarge or fill a user's existing configuration.

| Slot | Every persisted part ID | Verified role |
| --- | --- | --- |
| Foundation | anchored, skids, wheels, walking, floating | Distinct contacts, recoil or guided axle constraints. |
| Arm | twig, oak, laminated, ironwood, colossus | Different mass/density and strength; larger geometry limits reach actual solver geometry. |
| Frame | sapling, timber, braced, giant, leviathan | Each expanded height/mass passes its own limit and fails the preceding tier; actual axle height and body mass follow the chosen settings. |
| Basket capacity | pebble, boulder, quarry, mountain, continental | Each tier permits a heavier chosen fill; actual counter-body mass follows it. |
| Material | stone, sand, steel | Physical counterweight radius and inertia differ at identical mass. |
| Mount | fixed, hinged | Rigid arm mass versus an independent pendulum on ordinary chassis; floating rails necessarily use their guided counterweight. |
| Pouch | pocket, pouch, cradle, hammock, elephant, whale | Capacity and width/length limits support larger volunteers; moving cloth mass is a real tradeoff. |
| Cords | twine, hemp, cable, titanCable | Breaking strength and moving mass support different load ranges; heavier is not automatically better for a tiny rig. |
| Bearing | woodAxle, bronze, bearings, precision | Existing friction reduction plus a clearly measured, tiered preparation-time benefit. |
| Release | nail, polished, rollerPin | Measurably different release-ring timing and outgoing angle at the same settings. |
| Crank | hand, geared, capstan, engine | Increasing power produces strictly increasing preparation under the same large load; no extra launch impulse. |
| Rail | runway, waxedRunway | Wax approximately halves tangential contact loss in the genuinely sliding reference case. |

## Verification and limits

`node --test test/catalogue-audit.test.js`: **58/58 passing**. This includes complete catalogue coverage, all supported recipes failure-free, positive preparation benefits, contact-loss/timing/bulk comparisons and exact comparisons against all 96 archived full-draw result objects. `node scripts/audit-catalogue.mjs docs/upgrade-usefulness` regenerates the evidence without accessing browser data.

Native phone/desktop acceptance, catalogue visual readability, the capacity helper UI and the final combined suite/CI belong to the coordinating pass. These Node results alone do not certify player comprehension or prove every possible custom rig is useful or stable.
