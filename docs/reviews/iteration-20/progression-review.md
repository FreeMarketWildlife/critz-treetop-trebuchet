# Iteration 20 progression source and earned-ledger review

**Historical audit at0a84af19.** The owner subsequently fixed issues1and2 in this iteration: explicit recoverable save choices, Owned/Equipped labels/prices, and beam mass preview. See [current findings](findings.md). The replay data remains unchanged; the source-issue list below records the pre-fix diagnosis.

Scope: independent source/numerical review at local HEAD `0a84af19`; no browser interaction, production edits, physics rerun, user-save writes or new wallet grants. Run `node docs/reviews/iteration-20/progression-review.mjs` from the repository to reproduce. The companion JSON records hashes, all 132 balances/equipment states and purchase timing.

## Earned progression

Replaying the selected iteration-19 132-attempt soak through the current reducers exactly reproduces its final **130,485 points, 2,379 bells, 126 completed shots and six owned items**. Six non-released seating failures award nothing. Existing impact/distance observations are evidence inputs; this replay does not independently validate their physics or human fun.

| Purchase | Before launch | Earned wallet before | Cost | Wallet after |
| --- | ---: | ---: | ---: | ---: |
| Heavier counterweight | 3 | 40 | 30 | 10 |
| Longer beam | 6 | 64 | 45 | 19 |
| Lighter beam | 8 | 63 | 55 | 8 |
| Longer sling | 10 | 81 | 35 | 46 |
| Heavier frame | 13 | 99 | 40 | 59 |
| Grippier feet | 16 | 104 | 40 | 64 |

This actual earned ledger is considerably faster than iteration-7's one-impact example: every item is affordable/owned by launch 16. Continued play then has no remaining purchases and accumulates 2,379 unspent bells. That is a finite-prototype progression ceiling, not an insolvency dead end. Do not add arbitrary expensive items merely to consume this balance. Later expansion needs new physical alternatives and play-informed prices. The soak purchases on a scheduled catalog rotation rather than a human optimizing purchases, and includes retries/poor trajectories.

Checks passed: 126 repeat-bank attempts with inflated duplicate reward inputs make no additional award; 132 opt-in in-memory save/load roundtrips; 742 owned-item equip/unequip probes preserve wallet/ownership and do not mutate the source state. Each recorded equipment state exactly matches the original ledger. Physical configuration has no velocity/boost keys. Same-slot alternatives remain owned, can be switched freely and require no rebuy. Reset/retry itself has no reducer action or fee; UI bank guards protect repeated Collect/reset/Next once a released shot has an ID.

## Physical choices and recovery

Catalog consequences are mass, inertia, leverage, sling geometry and frame contact grip; no scalar launch boost. Current heavier counterweight is 180 kg versus starter 140 kg. Long/light beams share a slot; heavy/grippy frames share a slot. Unequip restores current lab/base parameters, which may differ from original defaults after the player edits sliders. Equipped parameters override those sliders, and Next setup displays the resulting main dimensions. Beam linear density is not in that preview, making the light-beam effect harder to compare numerically.

This review does not interpret an upgrade as guaranteed farther travel: changed balance/recoil/clearance and loading history can worsen a shot. Existing heavier-frame copy explicitly admits reduced range. A poor outcome can be collected, equipment removed or switched, and retried without losing owned gear. The six seating failures are not an economy trap because winding/loading/retry has no bell cost. Prototype experimental sliders can bypass the acquisition progression; therefore this is not yet a closed progression economy suitable for claiming a balanced full game.

## Concrete source issues

1. **Save opt-in can replace current earned progress.** `lab.js` Save-change handler reads a previously stored economy into `economy` when enabling Save. If a player earns while Save is OFF and an older save exists, enabling Save silently replaces the current session's wallet, ownership and ledger, then writes that old state back. Startup restore is appropriate; opting in during an active session should preserve the session or explicitly choose restore. No reducer failure is needed to trigger this. This is the clearest focused correctness/UX fix for the owner.
2. **Ownership and prices are partially implicit.** Unowned buttons display price and missing bells; owned alternatives say `equip`, equipped says `equipped: remove`. Once purchased, price disappears and the word Owned never appears. Suggested concise copy: `Owned · Equip`, `Equipped · Remove`; retain `Cost 45 bells` as secondary detail if explicit historical prices are wanted. Purchasing auto-equips, so unowned action copy could say `Buy & equip · 45 bells`.
3. **Reward amount can shrink before collection.** Banking uses current horizontal displacement from release, not maximum attained displacement. A backward bounce can reduce points while waiting; bells depend independently on impacts. That is current prototype policy rather than an arithmetic error, but should be deliberate. Copy such as `Points use current distance when collected` would be truthful if retained. Do not silently replace it without a gameplay decision.
4. **All-items-owned ceiling and save growth.** No further shop sink exists after the six items; completed-shot IDs grow forever to retain exact idempotence. These are future capacity/progression considerations, not immediate transaction dead ends. No compaction or arbitrary spending sink was introduced.

No source fixes, balance changes or commits were made by this review. Browser price/readability/touch behavior remains the owner's separate verification.
