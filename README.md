# Critz: Treetop Trebuchet

**We're going places.**

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

## Local playable prototype

Run `npm ci`, `npm start`, then open `http://localhost:8080`. Run `npm test` for numerical, articulated-body and game-system checks. See [requirements, physical assumptions and current limits](docs/prototype.md).

The prototype now has a physical finite-mass frame, beam/counterweight, tension-only sling straps, contact cradle and eleven articulated volunteer rigs. Drag a critter over the cradle and let gravity seat it; no radial snap or fixed settling timer. A torque-limited motor physically winds to the selected counterweight height and records its work. The default physical release uses an equal-strand, stopped split pouch with explicit 0.5 kg panels and a sliding bead: bead escape and panel opening happen through contacts and gravity. A short dotted prediction observes the same model. The geometric opening model remains available as a rollback; contact losses and the rigid-panel approximation remain documented limits.

The map now has five altitude bands centered on the Grandfather Tree, with storm sky and low-gravity space above it. Lore-inspired encounters lift, brake, swirl or pull the critter. Deep space at 600 gameplay metres kills the critter and ends its run. See [altitude design and lore sources](docs/altitude-map.md) or open `atlas.html` for the visual guide. Arrows/touch controls provide separate post-release arcade nudges; flying squirrels use lift/drag for dive/climb controls. The queue shows the next three. Separate points/bells, owned physical equipment, original synthesized sounds, mute/volume, reduced decorative motion and opt-in local saves are scaffolded into the loop. All tuneable values and test shapes remain development choices, not new story canon. No public deployment.
