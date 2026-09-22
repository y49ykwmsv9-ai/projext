# Worldforge → AnimateMyMap MCP Connector

This connector turns a structured historical/video concept into an AnimateMyMap timeline and drives the AnimateMyMap browser studio.

AnimateMyMap currently advertises country/region highlighting, cinematic camera modes, annotations, bulk JSON configuration, and MP4 rendering. The connector therefore keeps a stable MCP interface and isolates browser-specific automation in `src/automation.ts`.

## What it does

- Opens AnimateMyMap in a persistent Playwright browser profile.
- Keeps the AnimateMyMap login session between runs.
- Accepts a structured timeline containing clips, locations, highlights, arrows, labels, camera moves, theme, resolution and FPS.
- Writes the exact generated plan to JSON for inspection.
- Attempts to import that JSON through AnimateMyMap's bulk import UI.
- Triggers the site's render/export control.
- Reports when a UI change requires the adapter to be updated instead of pretending a video was rendered.

## Important architecture choice

AnimateMyMap is a browser application. This repository does **not** invent a nonexistent public API or scrape private endpoints. The integration is an explicit browser adapter using Playwright.

That means AnimateMyMap UI changes can require selector/interaction updates. The MCP contract remains stable.

## Install

```bash
cd tools/animatemymap-connector
npm install
npx playwright install chromium
npm run build
```

Copy `.env.example` to `.env` if desired.

## First run

```bash
npm start
```

The browser opens visibly by default. Complete AnimateMyMap login once. The session is stored in `.browser-profile/`.

Then use the MCP tools:

- `animatemymap_open`
- `animatemymap_create_plan`
- `animatemymap_render`
- `animatemymap_health`

## Example timeline

```json
{
  "title": "Reconquista",
  "aspectRatio": "16:9",
  "fps": 30,
  "resolution": "720p",
  "theme": "dark",
  "clips": [
    {
      "title": "The invasion of 711",
      "location": "Gibraltar, Spain",
      "durationSeconds": 8,
      "camera": "fly-to",
      "highlightedCountries": ["Spain"],
      "arrows": [
        {"from": "Tangier, Morocco", "to": "Gibraltar, Spain", "label": "Umayyad crossing"}
      ],
      "labels": [
        {"text": "711", "location": "Gibraltar, Spain"}
      ]
    },
    {
      "title": "The final campaign",
      "location": "Granada, Spain",
      "durationSeconds": 10,
      "camera": "orbit",
      "highlightedRegions": ["Andalusia"],
      "labels": [
        {"text": "Granada, 1492", "location": "Granada, Spain"}
      ]
    }
  ]
}
```

## From a natural-language concept

The intended higher-level workflow is:

1. An AI research layer converts the concept into a historically checked chronology.
2. The chronology is converted into the MCP timeline schema above.
3. `animatemymap_create_plan` opens/imports the map sequence.
4. `animatemymap_render` triggers MP4 rendering.
5. A separate video compositor can combine the map footage with narration, music and other visuals.

The connector deliberately separates historical reasoning from browser automation so a future Worldforge/Chronicle AI video generator can feed it directly.

## Current limitation

AnimateMyMap's public site documents the bulk JSON workflow, but does not expose a documented public rendering API in the material inspected for this connector. The adapter therefore uses browser automation rather than pretending there is an HTTP API.

If the site's import/export controls change, update only `src/automation.ts`.
