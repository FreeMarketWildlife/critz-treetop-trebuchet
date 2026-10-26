# Three finds and one world

Candidate based on accepted 679ecbb. Original source and original 8080 editor remain untouched during development and independent QA. No browser map or progress keys are renamed/deleted; private maps are never packaged.

## Shop and visitors

Three stable equipment slots per deal, with sold slots retained until a reroll/new round. No fresh animal, voucher or parcel sales. Previously paid parcel choices remain recoverable; existing voucher discounts remain effective. The extra-shelf legacy perk now broadens the price weighting within three slots. Deterministic LCG state is durable: reopening cannot change stock or reset price. Crafting replaces only newly incompatible slots from durable RNG, for no charge, without resetting reroll prices. Offers exclude owned gear, unsupported geometry and actual capacity/torque warnings. Reserve an affordable choice when available, prefer distinct equipment slots, and avoid prior stock when enough alternatives exist. If fewer than three unowned compatible parts remain, show explicit completed slots rather than sell duplicates or invent items.

Cloth and cord mass are included in the compatibility torque check; heavier-than-animal cloth is not automatically forbidden. The actual solver still handles mass, inertia, contacts and gravitational release. Craft and heavier-cargo planning live beside the launch area. Shop selection/hover compares actual current and proposed stats; touch selection precedes an explicit purchase. Next closes the shop directly to launch. The bottom-left door card uses original CSS artwork.

The durable creature queue has a current visitor and exactly one next-round promise. Random eligibility intersects door height, pouch capacity/opening and physical balance warnings. Collection advances the promise once; reopening, purchases and rerolls do not reroll a valid promised visitor. A newly unsafe custom rig has no eligible queue and is directed to Craft, rather than forcing an impossible payload. Creative retains manual experimentation. A slower eased entrance keeps physical pedestal jumping; intermittent idle hops/waves, delayed bubbles and one short drag hint are suppressed during handling and reduced motion.

## One application

Escape → Options → Map Editor is available in ordinary Play; the Pause button is the mobile equivalent. Tools mount lazily into a scoped panel, sharing the main game's immutable world authority. Committed editor commands replace that authority, save optimistically with stale-tab conflict protection and keep undo/redo in the mounted editor. Returning to Play after an edit rebuilds the existing rigid-body simulation from that exact authority. Switching without an edit retains the simulation/camera. Physics is paused while editing. Custom/read-only maps cannot award Adventure Bells, points or achievements. No destructive migration is added.

Legacy editor.html redirects into index.html?mode=edit, keeping query/hash and the existing origin/storage. Shared map links are selected once by the central app loader. Editing a copy adopts it explicitly; it cannot silently restore a different local map on leaving the shared hash. Public packaging copies code/default assets only.

## Verification

Final frozen v66 full regression: **1111/1111 passed**, log `/tmp/treetop-v66-final-full.log`. Focused transaction/editor/queue suites: 95/95, plus packaging/current UI 26/26. Final frozen-run totals are recorded in the handoff.

Browser acceptance harness: docs/unified-workshop/qa.html. Run transition acceptance (11 checks), reload the harness using browser Reload, then Verify fresh-load persistence. Open the same harness with ?legacy=1 and verify again. These check exact object identity, content changes, Play handoff, reward protection, undo/redo, fresh load and legacy entry. All QA storage is session-isolated. docs/unified-workshop/portrait.html embeds an actual 390 × 844 CSS viewport for responsive inspection, without changing the user's browser window or map.

Actual desktop and 390px browser review confirmed three cards, selection/details, explicit double-click purchase charging once (1200→1140), sold inventory, Next→launch/Craft, and the physically loaded starter mouse. Existing woodland gesture harness covers synthetic touch/cancel/pinch and freehand/encounter settings.

## Limits

No physical touch hardware was used. The earlier interrupted real file download/import remains uncertain and was not retried; in-page JSON/link round trips pass. An exploratory blue-whale staging case shows the giant basket overlapping the door and catching the visitor before the distant stand; mouse/frog/rabbit entrance and launch paths pass. This extreme-scale staging limitation is retained for independent QA; it does not prevent dragging/loading or launch. No public publication of this candidate has occurred. Free Market Wildlife hosting integration is owned by the website worker and remains held until acceptance.

## Screenshot Library evidence

Before redesign: `libfile_690c97e23df88191b5ce3840cad51267` (previous accepted desktop shop).
After desktop: `libfile_ecfeed72c0508191b11f3d2bdfc130d1`.
After 390px portrait: `libfile_aa2c897ea9988191a0af7ea1d7c7dc50`.
Loaded starter mouse: `libfile_68f5e1e14404819181f90de66d2717bb`.

Local candidate: http://127.0.0.1:8796/. Prefix acceptance target: http://127.0.0.1:8796/games/treetop-trebuchet/. Original http://127.0.0.1:8080/editor.html remains on accepted 679ecbb until new independent acceptance and guarded integration.
