# Chronicle Documentary Generator

Project ID: chronicle-documentary

This project turns Chronicle/Worldforge historical data into a documentary production manifest: chapters, narration, map/graph cues, archival-visual prompts, and a machine-readable edit decision list.

The first production is "The World at War: 1936–1945", a historically grounded overview of the European and global war. The generator is deliberately separate from the game so documentary work cannot destabilize the game deployment.

## Generate

From the repository root:

    node scripts/generate-documentary.mjs

Outputs:

- projects/documentary/build/documentary-manifest.json
- projects/documentary/build/documentary-script.md
- projects/documentary/build/documentary-shotlist.csv

The generator reads data/historical-polities-expansion-v2.csv when available and records active historical polities by chapter year. It does not silently invent polity dates.

## Visual language

The renderer uses original documentary graphics: clean historical maps, restrained archival textures, animated arrows, timelines, statistical graphs, and generated establishing plates. It does not reproduce another publisher's exact branding, title cards, graphics package, or trademarked visual identity.

## Historical basis

The chronology is cross-checked against the United States Holocaust Memorial Museum's World War II chronology and related historical reference material. The generator stores source notes in the manifest so each chapter can be audited before final rendering.
