# Critz: Treetop Trebuchet

**We're going places.**

The current local game fills the screen. **Drag your critter into the sling, hold the launcher button (or clearing) to crank counterclockwise, and release to throw** (mouse, touch or Space). Build, Shop and Blueprints open from the game dock. Creative unlocks the whole collection. Adventure earns Bells for permanent parts, randomized Acorn Exchange offers, parcels and shop perks. The full-screen shell also supports portrait play; settings include sound, fullscreen and rendering quality. Run `npm start -- --bind 127.0.0.1`, then open [the game](http://127.0.0.1:8080/). Mechanics, model limits and the Balatro shop study are in [the research notes](docs/custom-workshop/research.html).

Earliest game ideas approved by Phil, recorded October 19, 2026. The approved concept remains documented here; a bounded mechanism prototype now accompanies it.

## Premise and setting

The player is a **critter attending a school/academy at the Grandfather Tree**, hidden deep within **Grimroot Grove**. The institution's formal name is undecided. The game occurs in the **early Fourth Age, the Age of Arcane**.

**Humans do not exist in this period.** The player operates the trebuchet invisibly; do not draw a human operator or crew. The shared Dragex timeline introduces humans in Age 6 (Man). See [mechanism and lore guardrails](AGENTS.md).

The player's academy project is to develop a trebuchet that launches objects as far as possible. Begin with the most basic trebuchet and progressively upgrade it.

## Core loop

1. **Launch a critter**, watch it bounce around, and earn **points**.
2. See how many **bells** were earned and spend money in the **shop**.
3. **Customize the trebuchet using owned equipment** and decide whether to use **special items** for the next launch.

Points and bells are distinct. Their conversion or relationship is not specified. The later approved volunteer roster and developing physical equipment model are recorded below. Special items remain unspecified; scoring and shop prices are prototype balance.

## The Grandfather Tree and its archive

The massive Grandfather Tree was planted during the **Age of Creation**. During Fey rule, faithful good Fey converted it into an enormous archive of knowledge and recorded knowledge there. It is a museum, massive library and collection of extraordinary artifacts as well as the site of the school/academy.

The archive was nearly destroyed; the cause and exact date remain unspecified. Its former Fey custodians departed under **Allohim's command**. All Fey were commanded to sail to **Zealand**. Rebel Fey stayed and built a very tall **Tower of Babel near Sapporo** to wage war against Allohim. Allohim destroyed and leveled the tower to rubble. Afterward, the Fey had trouble communicating with one another, fought for power, and this led toward the **Battle of Mount Yokai**. That battle devastated Fey civilization; it did **not** kill every Fey everywhere.

Shortly after the battle, **Naboo**, a **first-generation owl who drank from the River of Blood**, took over the archive and runs the library. **Author clarification, October 19, 2026:** A **fey animal** is an animal/critter with humanlike qualities because of the **fey blood inside it**. This describes a Fey-blooded critter, not an original Fey being. The spellings **feysian / feyjian** remain unsettled; neither is selected as canonical. Calling Naboo a **fey owl** is therefore consistent with his being a first-generation owl who drank from the River of Blood. His relationship to the older Lady Wisdom character remains unresolved.

## Creative references

The Jedi archive on Coruscant inspires the immense knowledge archive. A Mirkwood-like confusing, strange forest that affects travelers' minds inspires Grimroot Grove. These are creative references, not literal crossover canon.

## Continuity and open decisions

The shared lore is maintained in [Critz–Dragex](https://github.com/FreeMarketWildlife/Critz-Dragex), especially its [Grandfather Tree record](https://github.com/FreeMarketWildlife/Critz-Dragex/blob/main/world/grandfather-tree.md).

The school's formal name, the spelling feysian / feyjian, Naboo's relationship to Lady Wisdom, and the cause/date of the archive's near destruction remain open. Do not infer a cause or place that damage relative to the departure, tower or battle without further author direction. The earlier proposed acorn helmet and woodland crew are not approved canon.

## Custom trebuchet workshop — October 20, 2026

The home page now opens the playable custom workshop: Adventure progression with Bells and a separate Creative mode. It includes 48 equipment items in 12 slots, 21 physical tuning controls, five foundation mechanisms (anchored, skids, wheels, walking triangle and floating axle), and eleven volunteers from a 25 g mouse to a 100,000,000 g blue whale. The original game remains at `mechanism-lab.html`, with its existing saves, map editor, articulated rigs and encounters intact.

Run `npm start -- --bind 127.0.0.1`, then open `http://127.0.0.1:8080/`. **Hold the clearing to wind and release to throw**, collect a landed throw’s Bells, buy parts in **Shop**, and fit owned equipment under **Build**. In **Creative → Blueprints**, select a volunteer and mechanism to load a proportioned example. You can then change every available part and tuning control. **Parts** shows physical labels and a release-finger close-up; slow motion and disabling **Follow** let you inspect the mechanism.

Adventure uses its own browser key, `treetop-custom-workshop-v1`, with opt-out saving and JSON backups. Creative builds and launches never award Adventure Bells or bypass owned-equipment checks. Saved blueprints can be reused after buying their parts. The `?qa=1` URL isolates UI testing from saved progress. The game and map workshop share the same editor-authored Grove default (V4 revision 10, 75 m oak, 377 objects). Fresh play loads that world; saved custom maps remain user-controlled. The launch clearing stays on its authored home branch.

`src/build-physics.js` uses vendored Planck, Earth gravity (9.80665 m/s²), distributed rigid-body inertia, tension-only sling constraints, an idealized tension/friction release ring, wheel/ground contacts, a separate hinged counterweight, aerodynamic drag, cord failure and an approximate beam-overload failure. All player-facing masses use grams. Geometry/time/mass normalization preserves physical units across sizes. A calm-air energy guard rejects unstable configurations.

The model does **not** claim complete real-world fidelity: rope/cloth are simplified, beam flex and 3D effects are absent, and winch preparation is supported quasi-static ratchet rigging with a lifting-power cap. See the [mechanics and primary research sources](docs/custom-workshop/research.html). `test/build-system.test.js` covers real velocities, Earth-gravity free flight, energy bounds, all mechanism families, every volunteer, failure cases, purchases and save isolation. `test/game-shell.test.js` covers hold cancellation, partial draws, shop stock, rerolls, parcels, vouchers, save migration and the sound palette. Run the full suite with `npm test`.

## Original articulated mechanism prototype

Run `npm ci`, `npm start`, then open `http://localhost:8080`. Run `npm test` for numerical, articulated-body and game-system checks. See [requirements, physical assumptions and current limits](docs/prototype.md).

The prototype now has a physical finite-mass frame, beam/counterweight, tension-only sling straps, contact cradle and eleven articulated volunteer rigs. Drag a critter over the cradle and let gravity seat it; no radial snap or fixed settling timer. A torque-limited motor physically winds to the selected counterweight height and records its work. The default physical release uses an equal-strand, stopped split pouch with explicit 0.5 kg panels and a sliding bead: bead escape and panel opening happen through contacts and gravity. A short dotted prediction observes the same model. The geometric opening model remains available as a rollback; contact losses and the rigid-panel approximation remain documented limits.

The map now has five altitude bands centered on the Grandfather Tree, with storm sky and low-gravity space above it. Lore-inspired encounters lift, brake, swirl or pull the critter. Deep space at 600 gameplay metres kills the critter and ends its run. See [altitude design and lore sources](docs/altitude-map.md) or open `atlas.html` for the visual guide. Arrows/touch controls provide separate post-release arcade nudges; flying squirrels use lift/drag for dive/climb controls. The queue shows the next three. Separate points/bells, owned physical equipment, original synthesized sounds, mute/volume, reduced decorative motion and opt-in local saves are scaffolded into the loop. All tuneable values and test shapes remain development choices, not new story canon. Public release includes the pinned Planck 1.5.1 runtime in `vendor/planck`, with its license.

## Grandfather Tree map editor

The retained original prototype editor described below is historical. The current developer editor is `http://127.0.0.1:8080/editor.html`, which enters the same game at `?author=1&mode=edit`. It shares one current map, physics and camera with Play. The explicit hosted developer entry uses the same route; normal Play has no Edit button. The author query is not authentication, and maps remain browser-local until separately published. The current world is **20,000 × 3,000 m**, with a 75 m oak and 32 m launch deck. See [shared authoring behavior](docs/world-scale/unified-authoring.md).

The historical prototype editor used five120m bands. Level buttons focus the camera; the horizontal slider, coordinate jump and clickable overview navigate the long map. Wheel zooms; Space-drag pans.

Choose Branch or Platform and drag to draw; click to place a short default surface. Choose an enemy portrait and click to place it. Select objects to move them, drag the right endpoint to resize a surface, or edit exact coordinates, slope, bounce and enemy size in the inspector. V/B/P/E/H/X select tools; Delete removes; Ctrl/Command D duplicates; Ctrl/Command Z undoes; Shift Z redoes. The launch branch and ground remain protected. Original fixed deflectors become editable branches in the editor layout.

Edits autosave in this browser under `treetop-grandfather-map-v1`. **Save & play** reloads the game with the authored contact geometry and placed enemies. Placed enemies materialize near their saved positions with arrival clearance, then use the same dynamic bodies and passive effects as existing encounters; at most eight are active. Procedural encounters can be toggled separately. Editing another open tab does not change a launch already in progress; reload the game to use the new layout. The editor's vertical limits are authoring bounds; the existing 600 m deep-space death rule remains in gameplay.

Export JSON for a portable backup; import validates the entire map before replacing anything. Undo can recover an import or original-map restoration during the current editor session. Browser storage is local to the same origin and may be cleared; exports are the durable backup. The public build is a prototype; saves and editor layouts remain local to each browser origin.

## Release validation runtime

The numerical archive includes exact floating-point hashes recorded on Apple Silicon with Node 24.21.0. CI uses macOS 14 / Node 24.21.0 to validate those archived results. Linux / Node 22 produced six historical exact-value mismatches; cross-platform bitwise reproducibility is not claimed. Browser physics remains a prototype.

## Front crank wheel and loading

The front winding wheel replaces the operator. It winds counterclockwise while held and pays out clockwise with the actual gravity-driven arm motion after release. Wheel upgrades are sold in the existing winding-gear shop slot. Drag a volunteer into the physical pouch before winding; Enter assists with a finite-force lift and gravity drop for keyboard play, and Space winds/releases. Mouse, tree frog and chipmunk start unlocked under a 150 g limit. See [implementation and model limits](docs/trebuchet-crank/implementation.md).


The current close-up launch screen uses a compact 0.6 m starter and a left-hand volunteer stand. Drag any body region, drop into the basket, then hold to wind. Preparation stays free of automatic gesture suggestions. The jointed critter stays loose after settling and while winding. Its current pose and motion transfer into a species-specific compound hitbox at launch, with continuous physical spin and flexible illustrated head/tail reactions. See [loading implementation](docs/loading-workshop/implementation.md). The previous 3 m tower is retained for larger presets and existing custom builds.

The launcher button includes a live power meter. Basket highlighting appears only with the suggestion popup. See [loose loading and smooth tumbling](docs/loose-tumbling/implementation.md) for the current collision, momentum and illustration contracts.

## Upgrade catalogue and height map

The full 48-part / 12-slot mechanical and visual audit is in [the catalogue report](docs/upgrade-audit/catalogue-audit.md), with [renderer coverage](docs/upgrade-audit/visuals.md). Frame and basket purchases unlock capacity without silently resizing or filling the rig. Part choices show their actual specifications, and Fine-tune limits follow equipped capacity. Bigger pouches and cords add moving mass and need a compatible whole rig; upgrades are not universal range multipliers. Bearing tiers now give distinct light-load preparation minima of 3.6 / 3 / 2.4 / 2 seconds, preserving the bronze starter at 3 seconds. This arcade comfort benefit is separate from their small physical friction-loss benefit. Frame and basket choices open direct preview-and-apply controls without silently resizing or filling the rig. See the [usefulness follow-up](docs/upgrade-usefulness/assessment.md).

The narrow right-edge map tracks only actual altitude, with a species marker. The Grandfather Tree centre sits in the middle; an explicit sky break compresses the much larger upper range. Current default landmarks are floor 0 m, tree centre 37.5 m, crown 75 m, starlight 960 m and authored map top 3,000 m. Released-flight gravity fades to 14% before the arcade free-drift boundary (3,000 m on the default map). An upward released crossing enters actual zero gravity, unlocks Beyond the Moon in Adventure, and offers Collect & retry. The normal rounded Bells and points for that run are multiplied by seven; existing totals and best distance are not multiplied. The frozen uncollected result survives reload when saving is enabled. Creative never earns Adventure rewards. This is an arcade altitude rule, not physically accurate escape velocity.

See the [current release checklist](docs/world-scale/release-readiness.md), [scale field guide](scale.html), and [forest route comparisons](docs/world-scale/forest-corridor-comparison.json) for the latest source evidence and remaining acceptance limits.

### Tree door progression

Critters are not purchased. Adventure starts with a 10 cm door inset into the Grandfather Tree at the launch branch. A critter can enter whenever its upright compound hitbox fits the door height; length does not gate entry. All smaller critters remain available after each upgrade. Critters walk from the opening to the stand and remain point-draggable during the entrance.

Each completed round automatically banks its rewards and opens a new randomized equipment shop. The next tree-door upgrade is always available separately from random stock: buy doors in order, at most once per completed-round shop cycle. Rerolls, closing the shop, and reloading do not reset that limit. Invalid configurations do not complete a round. Existing saves receive a door large enough to preserve their previously acquired critters. Door sizes and prices are game balance.

### Corrected field mouse and smaller stock rig

The field mouse uses an 18 cm envelope: 9 cm of head/body and 9 cm of thin trailing tail, with a 3.5 cm height envelope. Its 25 g game mass is distributed across torso (19.7 g), head (5 g), ears (0.25 g), and tail (0.05 g). These regional masses are simulation tuning, not measured anatomical data. Lengths use the [Mammal Society wood-mouse reference](https://mammal.org.uk/british-mammals/wood-mouse). Preparation uses matching head/body/tail mass fractions and a finite-force point grab, including the lightweight tail; flight retains the physical body angle.

The stock axle is now 60 cm high, with a 52 cm long arm, 13 cm short arm, and 48 cm cords. Counterweight fill is 2 kg and the beam is 14 mm thick; launch energy still comes from the falling counterweight. Only untouched older stock builds migrate. Custom dimensions and saved blueprints are preserved.

### Current oak and map authority

The editor always opens the active game world. Both fresh entry points use `createGroveMap()`; Play/Edit switches share the same current world session and the equipped rig/door dimensions. Exact untouched older defaults migrate in memory; saved custom maps and their original stored bytes are retained.

The current oak is 75 m tall with a broad 72 m crown spread, a 45 m crown depth, and its existing launch deck at 32 m. Curved collision polygons taper from connected parent limbs; back-layer branches remain explicitly non-solid. The surrounding rooted jungle trees have canopy tops between 25 and 30 m. These are authored proportions based on broad-crowned oak form, not a claim that all real oaks share an exact crown ratio.

### October 22 integration status

The current checkpoint retains the 0.6 m starter, 18 cm / 25 g mouse, door progression, constant compound-hitbox camera framing, text-free height strip, and the natural 75 m oak with 25–30 m jungle canopies. Solid oak branches now clear the real Bear and Elephant swing envelopes. Only exact untouched older defaults migrate; custom maps, builds, inventory and saved progress remain authoritative.

Shop offers share a three-card budget including an available door upgrade. Large cloth/cord purchases remain owned without silently replacing a working small rig. Space escape continues in zero gravity until the player presses Collect & retry; its frozen reward is paid sevenfold once, then the shop opens. Ordinary finished rounds enter the shop automatically.

The [integration report](docs/world-scale/integration-2026-10-22.md) distinguishes tested mechanics from unfinished game-feel acceptance. The current dense-encounter target is **not complete**: the 76-case source-controller census still records a worst 8.35-second forest-band interval. Proposed springcap/receiver batches were rejected for range collapse or longer quiet flight. Native desktop/phone acceptance of the combined source remains pending because this task has no supported browser-control tools.

The current crown uses multi-bend tapered collision limbs with unequal attached forks, plus editable overlapping foliage painted in front of and behind the wood. The jungle backdrop covers the full horizontal world below 25 m with opaque forest, overlapping 25–30 m crowns, rooted trunks, lianas, epiphytes and undergrowth. It remains forest when panning far from the academy; the sky appears above the canopy rather than through the interior. Untouched revision-10 defaults migrate to the revised crown in memory; edited maps retain their geometry.

Compact launchers and their loading stands now sit beside the tree door. All mechanism bodies, wheels, joints and point grabs use that same world origin. The starting camera frames the door and rig as one group on the left at a single metre scale; the 10 cm door and saved equipment dimensions are unchanged. Larger blueprint launch corridors retain their existing positions. The editor Launch view uses the same camera and active runtime origin.
