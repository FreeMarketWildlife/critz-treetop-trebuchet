# Public game

https://critz-treetop-trebuchet.freemarketwildlife.chatgpt.site

Sites project identity is retained in `.openai/hosting.json`. Public access allows anyone with the URL. Progress is local to each browser; Settings offers export/import to transfer a save.

The isolated Sites source checkout is `sites/treetop-trebuchet` (ignored by the main repository). This keeps the game repository origin intact. To update, copy current root HTML/CSS, `src/`, `vendor/`, and `docs/custom-workshop/research.html` into its `dist/`, retain the existing project ID, and use the Sites skill source-helper packaging and public saved-version deployment workflow. Never create a replacement Site or store credentials in files.

Initial publication: version 1, source ee1ccee0ef03c5633ef770413cec23ef60541d35. Verified anonymous HTTP 200 and a complete hosted mouse launch: 23.3 m, release 38.9 degrees, 41 Bells.

Grove Workshop publication: version 2, source `b0cac3d16187aa8c9a651fa3a05a0d300e6bdb81`, deployment `appgdep_6ad7ecace37c8191a1d41ea3e3fd1620`. Public editor: https://critz-treetop-trebuchet.freemarketwildlife.chatgpt.site/editor.html. The host canonicalizes it to `/editor`. Anonymous HTTP 200, exact map-module parity, hosted 19-piece Creative bridge, mouse launch/follow camera and free equipment fit verified. Full suite: 363/363. Phone viewport checks at 390×844 and 320×667 passed; no physical-device performance claim.

For repeat publication, `node scripts/package-public.mjs` copies current runtime into the retained isolated checkout before the Sites helper commits, pushes and packages. Personal map saves remain browser-local; Share map creates a portable snapshot, and JSON export/import provides a backup.
