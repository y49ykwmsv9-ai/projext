# Project Lineage

This file records ancestry and intentional reuse between projects. It is not a replacement for Git history. It exists so future development can understand where mechanics, schemas, research, and design ideas came from.

## Worldforge

**ID:** `worldforge`  
**Location:** repository root

Worldforge is the primary browser grand-strategy simulation and the current reusable foundation for world state, geography, historical data, economics, military systems, diplomacy, events, and natural-language commands.

## Chronicle AI

**ID:** `chronicle-ai`  
**Location:** `projects/chronicle-ai/`

Chronicle AI is a separate standalone prototype descended conceptually from the earlier Chronicle work and the reusable ideas developed in Worldforge.

### Reused concepts

- persistent browser campaign saves
- scenario/preset model
- world clock
- event history
- diplomatic relations
- deterministic state validation
- natural-language order parsing

### Intentionally isolated

- UI and visual presentation
- deployment entrypoint
- game-specific resolver
- preset definitions
- local state schema
- project assets

## Future projects

Every new project should document the project IDs it references, which systems/data are reused, which systems are forked or rewritten, and its independent deployment path.

The goal is cumulative development without turning the repository into one giant application where changing Game B accidentally breaks Game A. Humanity has enough software archaeology already.
