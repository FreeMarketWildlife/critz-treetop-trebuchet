# Public game

https://critz-treetop-trebuchet.freemarketwildlife.chatgpt.site

Sites project identity is retained in `.openai/hosting.json`. Public access allows anyone with the URL. Progress is local to each browser; Settings offers export/import to transfer a save.

The current isolated Sites source checkout is `sites/crown-workshop` (ignored by the main repository). The older `sites/treetop-trebuchet` checkout is preserved with its local work. This keeps the game repository origin intact. To update, copy current root HTML/CSS, `src/`, `vendor/`, and `docs/custom-workshop/research.html` into its `dist/`, retain the existing project ID, and use the Sites skill source-helper packaging and public saved-version deployment workflow. Never create a replacement Site or store credentials in files.

Initial publication: version 1, source ee1ccee0ef03c5633ef770413cec23ef60541d35. Verified anonymous HTTP 200 and a complete hosted mouse launch: 23.3 m, release 38.9 degrees, 41 Bells.

Grove Workshop publication: version 2, source `b0cac3d16187aa8c9a651fa3a05a0d300e6bdb81`, deployment `appgdep_6ad7ecace37c8191a1d41ea3e3fd1620`. Public editor: https://critz-treetop-trebuchet.freemarketwildlife.chatgpt.site/editor.html. The host canonicalizes it to `/editor`. Anonymous HTTP 200, exact map-module parity, hosted 19-piece Creative bridge, mouse launch/follow camera and free equipment fit verified. Full suite: 363/363. Phone viewport checks at 390×844 and 320×667 passed; no physical-device performance claim.

For repeat publication, `node scripts/package-public.mjs sites/crown-workshop` copies current runtime into the retained isolated checkout before the Sites helper commits, pushes and packages. Personal map saves remain browser-local; Share map creates a portable snapshot, and JSON export/import provides a backup.


Grandfather crown publication: **version 4**, source `4debd28d39ad590101f7e898ee909355e120095d`, deployment `appgdep_6ad7fb2b3c008191a46256597493371f`, succeeded October 20, 2026. Same retained public Site. Runtime includes the front crank/drag-loading change plus held slapstick cels and the 800 m crown editor. Anonymous Node HTTP requests returned 200 and exact byte parity for eight key map, foliage, art, editor, physics, app and crank modules; hosting adds markup to HTML. The public editor opened the new 267-piece map at 600 m and loaded it into Creative. The live mouse completed at 38.4 degrees, 25.3 m and four bounces; shop auto-fit and reroll also worked. No new browser errors after publication. Local full suite 388/388; portrait viewport checks recorded in docs/crown-workshop.


Close-up loading release: **version 6**, source `7394726e0b8375555e25fd3356e1cc3dae42f1a0`, deployment `appgdep_6ad8040337b881919655c4bb35b32141`. Public live manual loading/throw verified; normal save migrated to the compact kit while retaining the older geared wheel and earned progress. Final suite 395/395, focused 35/35. Four final runtime module checks returned 200 and exact parity. See docs/loading-workshop/implementation.md for model boundaries and evidence. Local game remains running at port 8080.


Slower swing release: **version 7**, source `53db1df9bec0eb543d844e686a6fa8e6b72726e8`, deployment `appgdep_6ad822d332408191bed16420f65c38af`. The public game verified a 1.375-second swing, exact physical release parity and new release/audio feedback. Five key module fetches returned 200 with exact parity; no new hosted errors. Full suite 401/401. All implementation and prior local game work were committed and pushed to `origin/codex/custom-trebuchet-workshop` (implementation `abb600b`). Evidence and model limits: docs/swing-workshop/implementation.md.


Ancient tree / jungle / leaf-scale release: **version 8**, source `87c20586ed7d1616e0b09522cf149cb2a97a8a80`, deployment `appgdep_6ad83f0fb5908191b2049572403f42e2`. Retained public project/audience. Ten key world/editor/app module hashes match local source. Public 487-piece Creative bridge completed a 39.1° mouse throw, 28.6 m and five bounces; no reported browser errors. Full suite 405/405, final focused 7/7. Saved edited maps remain intact; untouched crown starters upgrade. Evidence and model limits: docs/ancient-tree/implementation.md.
