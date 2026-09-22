# Project Lineage

## Worldforge
The existing main project and reusable simulation foundation.

## Chronicle AI
A separate prototype derived conceptually from the previous Chronicle/Worldforge work. It introduces a focused natural-language command loop while preserving local campaign persistence.

### Reusable concepts
- persistent browser saves
- scenario/preset model
- world clock
- event history
- diplomatic relations
- deterministic state validation

### Deliberately isolated
- UI
- deployment entrypoint
- game-specific command resolver
- preset definitions

Future projects should record their lineage here and in their own `project.json`.
