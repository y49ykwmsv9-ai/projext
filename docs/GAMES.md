# Game Project Registry

This repository contains multiple game projects without overwriting older work.

## Layout

- `games/<game-id>/` = isolated runnable game
- `games/<game-id>/project.json` = machine-readable project identity and lineage
- `games/<game-id>/README.md` = project-specific documentation
- `engine/` = reusable Worldforge simulation systems
- `data/` = reusable historical/geographic datasets
- `docs/` = cross-project architecture and research
- `archive/` = preserved snapshots when a project is retired

## Current projects

| ID | Location | Role |
|---|---|---|
| worldforge | repository root | existing primary engine/application |
| chronicle-ai | `games/chronicle-ai/` | standalone text-driven AI strategy prototype |

## Cross-reference rule

A new game should never overwrite a prior game. Give it a unique ID, create a directory under `games/`, add `project.json`, and document which earlier project/data it reuses. This lets future work reference prior mechanics without confusing one project's deploy target with another.

## Deployment rule

Each game is deployable independently. A static game can point Vercel at its game directory; a Next.js game can retain its own build configuration. The root Worldforge application remains separate.
