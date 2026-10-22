# Front crank and critter loading — October 20, 2026

Earlier implementation record. The later [loose loading and smooth tumbling revision](../loose-tumbling/implementation.md) supersedes descriptions of centered seating, a locked payload, and permanent basket highlights below.

The person beside the launch rail is removed. The front pedestal supports an open-spoke winding wheel with a rope drum, axle quadrant, brass crank marker and ratchet pawl. Holding winds counterclockwise. Releasing opens the pawl; wheel angle follows actual arm travel, so the gravity-driven fall pays the rope out clockwise. Once the winding cable is paid out it droops. The empty sling continues moving after the critter leaves its release finger.

The existing `winch` slot and IDs survive saves: `hand` = Acorn crank wheel (free, 100 W); `geared` = Brass geared wheel (100 Bells, 2,500 W); `capstan` = Iron capstan wheel (700 Bells, 500,000 W); `engine` = Gantry winding wheel (3,000 Bells, 500,000,000 W). All tiers scale with frame height and footprint; wider tiers have more spokes and different gearing. The three upgrades remain in the shop stock/parcel pool. A new game uses the free wheel. Existing purchased gear, tuned builds and saved blueprints remain intact.

Preparation remains quasi-static and power-limited. The winding transmission is massless and kinematically coupled to beam travel; it is not a second rigid-body winch model. Release adds no velocity or spring impulse. Existing rigid-body counterweight, arm, tension-only sling, failure and release physics drive the result. The shaded ballast and retaining bindings use its actual material density, mass, radius and body orientation.

The volunteer starts on a loading spot. Drag to the glowing empty pouch and drop to seat it; missing returns the critter to the spot. It tilts during dragging without changing authored character art. Pointer cancel, Escape, blur and opening dialogs cancel a held drag. No pointer velocity is carried into launch. Enter seats the volunteer for keyboard users. The current lumped payload remains the flight collision body; this change does not claim articulated ragdoll physics.

New and migrated Adventure saves grant mouse, frog and chipmunk, all at or below the 150 g starter cutoff. The 150 g pouch and tuned starter geometry support them. Larger volunteers need appropriate pouch/cord/frame capacity. These are balance decisions.

## Lore evidence

Phil explicitly confirmed on October 20, 2026 that humans do not exist in this game's period and that no one should visibly man the trebuchet. `README.md` places Treetop in early Fourth Age, Arcane, at the Grandfather Tree in Grimroot Grove. The neighboring Dragex repository's `canon/author-confirmed.md` (Ages and Humans) and `timeline/seven-ages.md` introduce humans in Sixth Age, Man, following the judgement at the end of Fifth Age. Fey animals are critters with Fey blood and humanlike qualities, not humans. This is recorded in root `AGENTS.md` so future mechanism and art changes inherit the boundary. No Dragex source was modified and no new lore is inferred for invisible player input.
