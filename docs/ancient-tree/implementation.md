# Ancient tree and layered jungle — October 20, 2026

User direction: replace the flat log/oval tree with the branching ancient tree in the supplied reference; replace the sparse jungle with the final illustrated rainforest reference; individual leaves should be approximately mouse length, not 1.5 metres long.

The Grandfather Tree retains its 800 m height, 280 m base width and 600 m launch altitude. New original vector scenery has a tapering, forked trunk, curved scaffold limbs, buttress roots, overlapping scalloped foliage and three distant forest depths. Background parallax fades out for whole-tree views. The doorway remains anchored beside the original launch branch; no humans or operators were added.

`grove-nature.js` defines ordinary leaf lengths of approximately 10–18 cm beside the 18 cm mouse. Close sprigs, field leaf glyphs, fern leaflets and twigs use world dimensions. Screen-edge leaf stickers, oversized close leaf fans and gameplay field wireframes were removed. Wide foliage masses represent clusters, not single giant leaves. Subpixel leaves merge into foliage masses instead of being enlarged to a minimum icon size. Editor collision boundaries remain visible.

New starter revision 4 contains 487 editable pieces: 188 canonical-size encounters, 115 foliage fields, six sap patches and 27 collidable liana paths. Four botanical strata have 18 springy bough routes apiece: emergent (340–480 m), canopy (230–340 m), understory (70–230 m), and roots/floor (0–70 m). The lower route adds fallen logs, fern beds, leaf litter, small fungi and established mushroom springs. Leaf mats are supporting stems/foliage clusters, while pass-through leaf fields retain the existing density-dependent drag. Vines are static collision paths, not simulated swinging ropes. Decorative distant plants do not become invisible collision. The active starter route is concentrated around the tree; the full 20 km editor remains available to author extensions.

A fresh map receives organic sampled bough polygons and the jungle routes. An exact untouched revision-3 starter upgrades on read; any changed name, point, bounce or other saved object preserves the edited layout. No saved map was erased during QA. Imported/shared layouts still use the existing schema. New layer navigation shortcuts and live region labels expose the four strata without changing gravity bands or biome mechanics.

Validation:

- Full Node suite: 405/405 passing. Final focused art, scale, migration and stratum collision suite: 7/7 after the final trunk contour adjustment.
- Tests drop a payload onto each stratum's actual polygon and require an upward physical rebound. Existing gravity, release, loading and equipment tests remain intact.
- Rendering tests cover actual floor, understory, canopy, emergent, home and crown altitudes, five zoom scales, finite coordinates, no geometry mutation and fewer than 10,000 canvas commands per sampled frame. Sprig/fern budgets and coarse distant silhouettes bound detail work. This is not a physical phone FPS measurement.
- Local native browser: manual pointer loading, wind/release, editor navigation, whole-tree view and original enemy models reviewed. Desktop-sized canvas review captured through the browser's supported full-page screenshot; narrow live game/editor reviewed at 319×738.
- Public editor loaded all 487 pieces. Creative bridge loaded the mouse, launched at 39.1°, completed at 28.6 m with five bounces, and returned to the editor. No browser errors reported. Ordinary leaves visibly stay near mouse length in the launch view.

Published to the existing public Site as version 8. Source `87c20586ed7d1616e0b09522cf149cb2a97a8a80`; deployment `appgdep_6ad83f0fb5908191b2049572403f42e2`. Ten anonymous runtime requests returned HTTP 200 with exact local hash parity (public-parity.json). Same public URL and audience. The public editor is left open; localhost:8080 remains running.
