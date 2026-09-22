# Chronicle AI

Separate text-driven grand-strategy project.

## Project contract
- Standalone game under `games/chronicle-ai/`
- Local persistent campaign saves
- Natural-language order parsing
- Deterministic validation/state mutation
- Autonomous foreign reactions
- Designed for a future server-side AI resolver without exposing API keys

## Preservation
This project is intentionally isolated from the existing Worldforge engine. Future games get their own directory and manifest, while shared research, schemas, save formats and engine components remain reusable.

Run locally by opening `index.html`, or deploy this directory as a static site.
