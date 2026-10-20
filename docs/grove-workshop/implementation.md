# Grove workshop implementation

The browser map editor now edits the custom trebuchet game through a shared v2 document. Original v1 mechanism-lab maps remain separate. Launch coordinates are local metres: (0, 0) is 300 m above the forest floor, 75% of the initial 400 m Grandfather Tree. Five connected altitude areas extend to 1,500 m. These are game-design dimensions, not a biological or lore claim.

The camera preserves geometry at setup and changes zoom after physical sling release. A 0.18 m mouse cannot occupy 5% of a viewport while a 3 m mechanism occupies 20% at the same physical scale. The setup prioritizes the rig; flight prioritizes the animal and locks its position while zoom interpolates. No magnifying-glass inset or hidden launch impulse.

Map drawing supports concave polygons, freehand paths, circles, individual vertices, materials, depth layers, and independent collision flags. A branch drawn behind or in front of play can be decorative; the collision overlay identifies what actually touches the animal. Deeper backdrop layers move more slowly than world geometry. Geometry validation rejects malformed imports before replacing the document.

A little caretaker turns the visible winch during preparation. This depicts the existing supported ratchet operation; it is not another playable character or a dynamic rope-drive simulation. The physical trough and released sling remain visible. Enemy bumpers use explicitly arcade impulses; hardware launch physics stays gravitational. Payload gravity transitions to 14% in space.

Creative shop purchases, parcels and rerolls use a disposable ledger. Adventure saving is disabled inside an editor playtest. Equipment feedback is anchored at the changed part, with bounded particles, purchase sparkle/chime cues, mechanical ratchet clicks and distinct contact timbres. Audio starts after interaction and obeys mute/volume settings.

The public editor works without local project files. Autosave is browser-local; exported JSON and portable map URLs transfer a validated layout to another browser. A shared layout is a snapshot, not collaborative cloud storage. Publishing the default world is separate from saving a personal map.

Visual reference: original bold outlines, cartoon shading and readable silhouettes remain the direction. Toss the Turtle (https://www.newgrounds.com/portal/view/508440) informs the close projectile-follow framing; original game art and effects are retained. The Acorn Exchange preserves the established Balatro-inspired randomized deal, paid Adventure rerolls, vouchers and choose-one parcels.

Validation on October 20, 2026: all 363 automated tests pass. The focused custom-mechanism suite passes 31 tests (14 build-system, 8 starter-flight, 9 Grove physics), including concave-notch collision, open paths, circles, decorative gaps, deep-floor completion, low gravity, save validation, and tiny-detail protection for giant rigs. All 11 animal presets finish the default Grove without non-finite states or failures. A 419-object Node physics check observed p95 0.211 ms and maximum 0.726 ms per simulated 1/60-second frame; these figures do not establish real-phone rendering performance. A separate geometry exercise tested 150 simple concave polygons on alternating starter and whale scales.
