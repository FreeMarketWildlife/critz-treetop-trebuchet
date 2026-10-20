# Critz: Treetop Trebuchet

**We're going places.**

The current local game fills the screen. **Hold the clearing to wind; release to throw** (mouse, touch or Space). Build, Shop and Blueprints open from the game dock. Creative unlocks the whole collection. Adventure earns Bells for permanent parts, randomized Acorn Exchange offers, parcels and shop perks. The full-screen shell also supports portrait play; settings include sound, fullscreen and rendering quality. Run `npm start -- --bind 127.0.0.1`, then open [the game](http://127.0.0.1:8080/). Mechanics, model limits and the Balatro shop study are in [the research notes](docs/custom-workshop/research.html).

Earliest game ideas approved by Phil, recorded October 19, 2026. The approved concept remains documented here; a bounded mechanism prototype now accompanies it.

## Premise and setting

The player is a **critter attending a school/academy at the Grandfather Tree**, hidden deep within **Grimroot Grove**. The institution's formal name is undecided. The game occurs in the **early Fourth Age, the Age of Arcane**.

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

The home page now opens the playable custom workshop: Adventure progression with Bells and a separate Creative mode. It includes 46 equipment items in 11 slots, 21 physical tuning controls, five foundation mechanisms (anchored, skids, wheels, walking triangle and floating axle), and eleven volunteers from a 25 g mouse to a 100,000,000 g blue whale. The original game remains at `mechanism-lab.html`, with its existing saves, map editor, articulated rigs and encounters intact.

Run `npm start -- --bind 127.0.0.1`, then open `http://127.0.0.1:8080/`. **Hold the clearing to wind and release to throw**, collect a landed throw’s Bells, buy parts in **Shop**, and fit owned equipment under **Build**. In **Creative → Blueprints**, select a volunteer and mechanism to load a proportioned example. You can then change every available part and tuning control. **Parts** shows physical labels and a release-finger close-up; slow motion and disabling **Follow** let you inspect the mechanism.

Adventure uses its own browser key, `treetop-custom-workshop-v1`, with opt-out saving and JSON backups. Creative builds and launches never award Adventure Bells or bypass owned-equipment checks. Saved blueprints can be reused after buying their parts. The `?qa=1` URL isolates UI testing from saved progress. The new workshop uses a fixed launch clearing; the existing map editor still edits the original mechanism lab, not this clearing.

`src/build-physics.js` uses vendored Planck, Earth gravity (9.80665 m/s²), distributed rigid-body inertia, tension-only sling constraints, an idealized tension/friction release ring, wheel/ground contacts, a separate hinged counterweight, aerodynamic drag, cord failure and an approximate beam-overload failure. All player-facing masses use grams. Geometry/time/mass normalization preserves physical units across sizes. A calm-air energy guard rejects unstable configurations.

The model does **not** claim complete real-world fidelity: rope/cloth are simplified, beam flex and 3D effects are absent, and winch preparation is supported quasi-static ratchet rigging with a lifting-power cap. See the [mechanics and primary research sources](docs/custom-workshop/research.html). `test/build-system.test.js` covers real velocities, Earth-gravity free flight, energy bounds, all mechanism families, every volunteer, failure cases, purchases and save isolation. `test/game-shell.test.js` covers hold cancellation, partial draws, shop stock, rerolls, parcels, vouchers, save migration and the sound palette. Run the full suite with `npm test`.

## Original articulated mechanism prototype

Run `npm ci`, `npm start`, then open `http://localhost:8080`. Run `npm test` for numerical, articulated-body and game-system checks. See [requirements, physical assumptions and current limits](docs/prototype.md).

The prototype now has a physical finite-mass frame, beam/counterweight, tension-only sling straps, contact cradle and eleven articulated volunteer rigs. Drag a critter over the cradle and let gravity seat it; no radial snap or fixed settling timer. A torque-limited motor physically winds to the selected counterweight height and records its work. The default physical release uses an equal-strand, stopped split pouch with explicit 0.5 kg panels and a sliding bead: bead escape and panel opening happen through contacts and gravity. A short dotted prediction observes the same model. The geometric opening model remains available as a rollback; contact losses and the rigid-panel approximation remain documented limits.

The map now has five altitude bands centered on the Grandfather Tree, with storm sky and low-gravity space above it. Lore-inspired encounters lift, brake, swirl or pull the critter. Deep space at 600 gameplay metres kills the critter and ends its run. See [altitude design and lore sources](docs/altitude-map.md) or open `atlas.html` for the visual guide. Arrows/touch controls provide separate post-release arcade nudges; flying squirrels use lift/drag for dive/climb controls. The queue shows the next three. Separate points/bells, owned physical equipment, original synthesized sounds, mute/volume, reduced decorative motion and opt-in local saves are scaffolded into the loop. All tuneable values and test shapes remain development choices, not new story canon. Public release includes the pinned Planck 1.5.1 runtime in `vendor/planck`, with its license.

## Grandfather Tree map editor

Open `http://localhost:8080/editor.html` (also linked beside the game title). Grandfather Tree is the only map, with five existing 120 m altitude levels in one continuous **20,000 × 600 m** world. Level buttons focus the camera; the horizontal slider, coordinate jump and clickable overview navigate the long map. Wheel zooms; Space-drag pans.

Choose Branch or Platform and drag to draw; click to place a short default surface. Choose an enemy portrait and click to place it. Select objects to move them, drag the right endpoint to resize a surface, or edit exact coordinates, slope, bounce and enemy size in the inspector. V/B/P/E/H/X select tools; Delete removes; Ctrl/Command D duplicates; Ctrl/Command Z undoes; Shift Z redoes. The launch branch and ground remain protected. Original fixed deflectors become editable branches in the editor layout.

Edits autosave in this browser under `treetop-grandfather-map-v1`. **Save & play** reloads the game with the authored contact geometry and placed enemies. Placed enemies materialize near their saved positions with arrival clearance, then use the same dynamic bodies and passive effects as existing encounters; at most eight are active. Procedural encounters can be toggled separately. Editing another open tab does not change a launch already in progress; reload the game to use the new layout. The editor's vertical limits are authoring bounds; the existing 600 m deep-space death rule remains in gameplay.

Export JSON for a portable backup; import validates the entire map before replacing anything. Undo can recover an import or original-map restoration during the current editor session. Browser storage is local to the same origin and may be cleared; exports are the durable backup. The public build is a prototype; saves and editor layouts remain local to each browser origin.

## Release validation runtime

The numerical archive includes exact floating-point hashes recorded on Apple Silicon with Node 24.21.0. CI uses macOS 14 / Node 24.21.0 to validate those archived results. Linux / Node 22 produced six historical exact-value mismatches; cross-platform bitwise reproducibility is not claimed. Browser physics remains a prototype.
