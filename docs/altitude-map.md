# Current workshop altitude model

The current custom-workshop runtime uses the shared Grove map in src/grove-map.js and src/build-physics.js. Its default is a 3,000 m authored range, 800 m Grandfather Tree and 600 m launch branch. Gravity begins fading at 900 m and reaches 14% at 1,040 m. There is no current zero-gravity escape state and no death ceiling at 600 m. Flight may exceed the authored map range; normal settling and the existing bounded run timer still end runs.

The right-edge height strip uses the actual current or custom map. Floor is near its bottom, tree centre in the middle, and the upper sky is visibly compressed. Marker height is clamped at chart edges with an arrow and honest numeric/accessible reading; horizontal travel does not move it. Heights alone never label a critter as escaped.

The earlier mechanism-lab design below is preserved for historical context. Its 600 m death rule and 300 m launch do **not** describe the current custom-workshop game.

---

# Grimroot to Kronos

The playable vertical map is 0–600 gameplay metres. Five 120 m bands put the Grandfather Tree's center at exactly 300 m, with two areas above and two below. This is deliberately compressed geography, not a claim about Libriam's atmosphere or tree height.

| Height | Area | Interactions |
|---|---|---|
| 480–600 | Space | Wandering yokai pull; Kronos fragments swirl; gravity smoothly reaches 14%; no air or membrane lift above 500 m. |
| 360–480 | Storm sky | Rising clouds lift; storm fronts reduce lift and generate sideways wind; migrating letter birds produce gusts. |
| 240–360 | Grandfather Tree | Archive beetles swirl; Fey-blood leaf hoppers lift. Launch hardware remains at its existing physical coordinates. |
| 120–240 | Jungle canopy | Spring pods lift; vine bugs brake; waxleaf skids produce gusts. |
| 0–120 | Forest floor | Fungi lift; beetles swirl; seed-husk skids produce gusts; fixed deflectors represent wind-worn Grimroot branches. |

At or above 600 m, the critter dies and the run freezes. Rewards remain collectible and the next volunteer/retry controls remain available. A warning appears above 570 m. Death and altitude gravity survive scene cloning. Ambient interactions act within 5 m, use forces, and are intentionally arcade effects. The existing mechanical energy readout does not account for the full atmospheric/encounter field potential: do not use it as a closed-system conservation claim during these encounters. Collision surfaces retain passive contact coefficients.

## Lore sources and boundaries

Read GitHub `FreeMarketWildlife/Critz-Dragex` origin/main at `ed3ec6b` (fetched October 19, 2026), particularly `canon/author-confirmed.md`, `timeline/seven-ages.md`, `world/libriam.md`, `world/grandfather-tree.md`, `books/moanas-tear-frame.md`, and `world/allohim-and-cosmic-creation.md`. The local checkout additionally contains the later Kronos system and Tanoshi records; these were read without modifying the lore repository.

The setting is early Age 4, after the Tear's return and at the beginning of Veratus's reign. Restored rain refers to Moana's Tear; migrating letter birds refer to Archaíos's annual correspondence; the tree/archive and Grove flora refer to Grimroot Grove. Kronos's rings and Moon reflect the author's local cosmic records. There are no Fallout mutants, humans, arcane-war ruins, or visits to Earth.

Wandering yokai, their space habitat, every encounter power, all colors, numerical heights and physical coefficients are this game's design proposals under the user's October 19 request. The generic yokai silhouette is not the approved Tanoshi design. No named historical individual is turned into an enemy. Ring fragments are obstacles, not an assertion that the unresolved millennium ring passage occurred at the start of Age 4.

Open `atlas.html` for a visual field guide rendered by the game's scenery and encounter drawing code.
