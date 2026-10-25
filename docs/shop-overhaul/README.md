# Acorn Exchange and physical sizing candidate

Local development only. The original checkout and editor origin remain separate:
- Original repository: `/Users/tanoshi/Documents/ChatGPT/Critz-Treetop-Trebuchet`.
- Original map editor: `http://127.0.0.1:8080/editor.html`.
- Candidate: `http://127.0.0.1:8796/`.
- Disposable empty-save QA: `http://127.0.0.1:8796/?qa=1`.
- Disposable funded shop QA: `http://127.0.0.1:8796/?qa=1&fixture=shop` (1,200 Bells; cannot save).
- Baseline: `e441cb0`; rollback tag: `rollback-shop-e441cb0`.

## Shop contract

Equipment, voucher, and parcel shelves appear together. Price tabs stay visible. Hover gives desktop comparison; click or keyboard focus pins the selected item so crossing another card cannot replace a purchase target. Enter/Space inspect a card; the explicit action purchases it. On portrait screens, selecting a card scrolls to its detail panel. Back returns to the card, and Escape/Close returns through the existing pause flow. The detail panel stays inside the scrolling dialog rather than placing tooltips beyond viewport edges.

A permanent collection has no storage limit; ten visible equipment slots are fitted at once. Cargo capacity is separate. The shop states all three. Larger cloth and cord add moving mass; a risky purchase becomes owned without silently replacing a working rig. Buying a frame or counterweight preserves actual dimensions/fill. Build exposes explicit frame, fill, pouch-opening and cord-length adjustments. The cargo planner previews complete species recipes and lists missing parts; it fits only an owned, accessible recipe in Adventure. Creative allows all recipes.

Existing price tables, acquisition, door progression, paid reroll escalation, voucher perks, parcel choices, persistence and banked-run mechanics remain authoritative. Rerolls preserve vouchers/parcels. Repeated/stale actions cannot charge twice. Save failure rolls back before fitting. Shop purchases stay in the shop; explicit fitting from Build still reveals relevant controls.

## Real smaller starter

The new default has a 0.48 m axle (formerly 0.60 m), 0.416/0.104 m long/short arms, 0.384 m cords, 0.14 m pocket opening (formerly 0.20 m), 1,600 g counterweight and 300 g frame. The unchanged mouse is 25 g with a 9 cm body/head plus 9 cm tail. These are solver-world dimensions, not a camera magnification adjustment. The existing camera, rigid-body engine, gravity, loose loading ragdoll, rotational transfer and creature model remain.

The 150 g starter hardware limit remains. A chipmunk explicitly needs a 0.19 m opening, adjustable under Build → Sling; its recipe uses that width. Higher creature recipes require larger pouch/cord/beam/frame/counterweight capacities and real dimensions. Comparison shows capacity, geometry, moving mass, beam inertia, counterweight torque and energy reference scales. It does not promise a simulated range. Torque/energy scales are not instantaneous torque or complete mechanism energy.

Save revision 7 migrates only exact untouched older default geometry; names, compatible wheels, earned resources, ownership, blueprints and custom dimensions survive. A legacy chipmunk default receives its appropriate opening. Archived geometry regression tests explicitly retain the historical 60 cm fixture. Preparation snapshot velocity now reports the actual ragdoll motion that fire already transfers; this changes reporting, not the solver or launch energy.

## References reviewed

- Publisher description and original visual gallery: https://www.playstack.com/games/balatro/
- Actual shop screenshot: https://images.nintendolife.com/screenshots/145771/large.jpg
- Actual shop screenshot with separate lower voucher/pack shelf: https://images.steamusercontent.com/ugc/5933000025527553594/9816EF9320DCE2E8A5E78A785306AB71C7CD24FA/
- Existing detailed mechanical research remains in `docs/custom-workshop/research.html`.

Observed visual cues are felt table contrast, separate shelves, raised outlined cards, attached price labels, a strong reroll control and a focused effect panel. Artwork remains this game's original canvas illustrations. No Balatro assets were copied. This is an adaptation to persistent physical equipment, rather than an exact reproduction of Balatro's poker rules.

## Verification and limits

Baseline full suite: 1,087 passing. Revised suite after replacing obsolete capped-page tests and adding physical/selection regressions: 1,085 passing. Tests cover transaction duplication, insufficient funds, save rollback/conflicts, extra shelf, voucher/parcel persistence, one door upgrade per round, fitting failure, ownership, empty/partial loading, all species and mechanism families, momentum/energy and custom-save preservation.

Actual browser QA used Chrome at desktop and 390 × 844 portrait: mouse keyboard loading, full draw and completed banked runs; paid frame/pouch/voucher/reroll/parcel actions; exclusive keyboard parcel choice; inventory-only heavy pouch; owned equipment fitting; rabbit recipe fitting plus geared wheel; rabbit loose loading and accepted full-draw launch; insufficient-funds state; scrolling detail edges; Back/Close. Portrait page width stayed 390 px with a 322 px detail panel. Touch pointer entry is separately tested not to select/buy; physical touchscreen hardware remains an independent QA check.

Reproducible numerical loading/winding checks are in the task evidence directory. Flat-world runs with actual loose loading: mouse 9.42 m/s at 33.87°, widened chipmunk 3.83 m/s at 60.15°, rabbit 20.36 m/s at 41.02°, elephant 32.52 m/s at 42.33°; all finish without failure. These are test-build results, not range guarantees in the authored Grove.

The interrupted old disposable QA tab became inaccessible after a connection loss; no uncertain purchase was retried there. Subsequent transactions were tested in a new funded QA fixture with saving disabled. Browser storage on the original 8080 origin was never changed by these tests. A real saved Adventure launch on the isolated 8796 origin banked 31 Bells; after reload, both Bells and exact shop stock were preserved. Touchscreen hardware and subjective hover feel remain useful independent review targets.

## Screenshot Library identities

- Before shop: `libfile_162f30ba3c108191aa1a81289dd96284` (`file_0000000006b081f8a8ac817734f0e3bf`).
- Desktop after: `libfile_3401cc76caf48191b7072bf79d09ab3d` (`file_00000000ddac8230995aeab976ffe429`).
- Portrait after: `libfile_bb061ab0eaf08191bd8a29956a917ec7` (`file_00000000183082308d4c974b7d1c49b5`).
- Smaller starter: `libfile_9ae468e4fdb88191b6fd8c105fff83a4` (`file_000000000ffc81fd94d208985f7bb6f1`).

## Combined editor integration

The shop commit is `8826693`. Editor/enemy commits were integrated separately as `f23c8db` and `a0312ae`, preserving both solver changes and resolving import URL differences. The combined runtime uses cache version 62, including the editor stylesheet. The combined full suite passes 1,093/1,093. `docs/woodland-workshop/qa.html` additionally passes 16 browser checks, including synthetic touch freehand closure, pinch cancellation, concave filled outlines, crossing rejection, undo/redo, route endpoint dragging and JSON/link round trips. A moth placement and 1.2 m/s / 3 m route edit were also verified through the actual integrated editor UI.

New authored encounters are opt-in placements. Existing saved custom maps retain their geometry and stationary encounters. No map was added to the original editor or default map by these tests. No public deployment was made. The original editor stays on 8080, while combined acceptance ran solely on 8796 with QA session storage.
