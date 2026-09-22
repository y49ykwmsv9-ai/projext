# Chronicle AI

**Project ID:** `chronicle-ai`  
**Version:** `0.1.0`  
**Type:** Standalone static browser game  
**Status:** Prototype

Chronicle AI is a text-driven grand-strategy prototype inspired by Pax Historia-style natural-language orders and other AI-assisted strategy systems.

## Core loop

1. Select a historical or sandbox preset.
2. Issue a natural-language order.
3. The local game engine classifies the order and identifies likely targets.
4. Deterministic rules validate and apply state changes.
5. The world produces an event describing the result.
6. Other countries can generate autonomous reactions.
7. Advance time and continue the campaign.

The current resolver is intentionally local and deterministic. A future server-side AI resolver can replace or augment the interpretation layer without putting an API key in the browser.

## Persistence

Campaign state is stored locally in the browser. Named saves and automatic saves use browser storage, and the game supports JSON export/import so a campaign can be preserved as a file.

The project is also designed to recognize compatible legacy save keys from earlier Chronicle/Worldforge prototypes.

## Current features

- 1936 Europe, 1939 Crisis, and Sandbox presets
- Natural-language order parsing
- Diplomacy, military, economy, intelligence, law, research, and infrastructure orders
- Target recognition for major countries/regions
- Deterministic resource and relationship changes
- Multi-sentence historical event feed
- Autonomous foreign reactions
- Month and six-month time advancement
- Region selection
- Named saves and automatic persistence
- JSON save export/import
- Mobile-responsive interface

## Run locally

Open `index.html` directly in a browser, or serve the directory with any static HTTP server.

## Deployment

Deploy `projects/chronicle-ai/` as its own static site. It does not depend on the root Worldforge Next.js application.

## Lineage and reuse

Chronicle AI is conceptually descended from the earlier Chronicle and Worldforge work. It reuses ideas such as persistent browser saves, scenario presets, a world clock, event history, diplomacy, and deterministic validation while keeping its UI, resolver, presets, and deployment boundary separate.

See `docs/PROJECT-LINEAGE.md` for the cross-project record.
