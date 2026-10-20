# Current crown revision

See `../crown-workshop/implementation.md` for the 800 m / 280 m tree, 600 m launch, current starter, foliage/sap physics, new editing tools and zoom controls. The earlier 400 m / 300 m notes below describe the previous v2 world.

# Grove workshop implementation

The browser map editor now edits the custom trebuchet game through a shared v2 document. Original v1 mechanism-lab maps remain separate. Launch coordinates are local metres: (0, 0) is 300 m above the forest floor, 75% of the initial 400 m Grandfather Tree. Five connected altitude areas extend to 1,500 m. These are game-design dimensions, not a biological or lore claim.

The camera preserves geometry at setup and changes zoom after physical sling release. A 0.18 m mouse cannot occupy 5% of a viewport while a 3 m mechanism occupies 20% at the same physical scale. The setup prioritizes the rig; flight prioritizes the animal and locks its position while zoom interpolates. No magnifying-glass inset or hidden launch impulse.

Map drawing supports concave polygons, freehand paths, circles, individual vertices, materials, depth layers, and independent collision flags. A branch drawn behind or in front of play can be decorative; the collision overlay identifies what actually touches the animal. Deeper backdrop layers move more slowly than world geometry. Geometry validation rejects malformed imports before replacing the document.

A little caretaker turns the visible winch during preparation. This depicts the existing supported ratchet operation; it is not another playable character or a dynamic rope-drive simulation. The physical trough and released sling remain visible. Enemy bumpers use explicitly arcade impulses; hardware launch physics stays gravitational. The global gravity is 8.825985 m/s², exactly 90% of the former Earth reference. Payload gravity transitions to 14% of that lowered baseline in space (1.2356379 m/s²). Hardware, bearing loads, winch energy and visual rope sag all use the lowered baseline.

Creative shop purchases, parcels and rerolls use a disposable ledger. Adventure saving is disabled inside an editor playtest. Equipment feedback is anchored at the changed part, with bounded particles, purchase sparkle/chime cues, mechanical ratchet clicks and distinct contact timbres. Audio starts after interaction and obeys mute/volume settings.

The public editor works without local project files. Autosave is browser-local; exported JSON and portable map URLs transfer a validated layout to another browser. A shared layout is a snapshot, not collaborative cloud storage. Publishing the default world is separate from saving a personal map.

Visual reference: original bold outlines, cartoon shading and readable silhouettes remain the direction. Toss the Turtle (https://www.newgrounds.com/portal/view/508440) informs the close projectile-follow framing; original game art and effects are retained. The Acorn Exchange preserves the established Balatro-inspired randomized deal, paid Adventure rerolls, vouchers and choose-one parcels.

Validation on October 20, 2026: all 363 automated tests pass. The focused custom-mechanism suite passes 31 tests (14 build-system, 8 starter-flight, 9 Grove physics), including concave-notch collision, open paths, circles, decorative gaps, deep-floor completion, low gravity, save validation, and tiny-detail protection for giant rigs. All 11 animal presets finish the default Grove without non-finite states or failures. A 419-object Node physics check observed p95 0.211 ms and maximum 0.726 ms per simulated 1/60-second frame; these figures do not establish real-phone rendering performance. A separate geometry exercise tested 150 simple concave polygons on alternating starter and whale scales.

## Fixed encounters and slapstick cels

Each of 14 named encounters owns one canonical diameter. The standard beetle is 16 cm and hopper is 14 cm, beside an 18 cm starter mouse. Four separately named larger relatives have their own distinctive crowns/markings. Existing v2 maps normalize per-copy radii to each type's canonical value on load/import; coordinates, geometry and collision flags stay authored. The inspector locks enemy dimensions and removes radius handles; generic circle bumpers can still be any size. Shared snapshots, saves, rendering and actual physics use the same canonical sizes. Artwork is redrawn with vector paths at the current camera scale and pixel ratio.

All eleven animals have ready, flying, two alternating impact, seeing-stars and dazed cels. A 230 ms impact hold and 390 ms star recovery make a hit legible; three and five meaningful hits introduce progressively more exaggerated cosmetic bruises, bandages and gap-toothed grins. Pose orientation changes in held 8 fps steps while world position remains smooth. Cosmetic reactions use simulation time and pause correctly; the collider/forces remain independent of these visual cels. Low-speed resting contacts and repeated capsule callbacks cannot stack injuries. Each launch starts fresh. A bounded impact starburst, BONK/OOF lettering and synthesized rubbery bonk support the existing contact sounds.

Validation for this update: 370/370 automated tests, all eleven default volunteer presets complete with no simulation failures. The lowered-gravity mouse release is 38.40° at 24.07 m/s; its current default Grove journey travels 30.7 m with five meaningful slapstick hits. Browser review includes the full pose sheet for mouse and whale, actual gameplay injury progression, locked 16 cm beetle duplication and the separate 60 cm elder beetle.
