# Public game

https://critz-treetop-trebuchet.freemarketwildlife.chatgpt.site

Sites project identity is retained in `.openai/hosting.json`. Public access allows anyone with the URL. Progress is local to each browser; Settings offers export/import to transfer a save.

The isolated Sites source checkout is `sites/treetop-trebuchet` (ignored by the main repository). This keeps the game repository origin intact. To update, copy current root HTML/CSS, `src/`, `vendor/`, and `docs/custom-workshop/research.html` into its `dist/`, retain the existing project ID, and use the Sites skill source-helper packaging and public saved-version deployment workflow. Never create a replacement Site or store credentials in files.

Initial publication: version 1, source ee1ccee0ef03c5633ef770413cec23ef60541d35. Verified anonymous HTTP 200 and a complete hosted mouse launch: 23.3 m, release 38.9 degrees, 41 Bells.
