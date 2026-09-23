# Chronicle Memory Roleplay Engine

**Project ID:** `chronicle-memory`

Chronicle Memory is an isolated alternate-history roleplay and simulation project. It is designed around the interaction pattern:

1. choose a historical or sandbox preset;
2. choose a character, polity, office, or other role;
3. choose the starting date/time;
4. issue natural-language instructions;
5. resolve those instructions against historical/statistical evidence and the current simulated state;
6. advance time;
7. record the resulting world changes as persistent scenario memory;
8. generate the next response from the accumulated alternate timeline rather than resetting to real history.

The project is intentionally separate from Worldforge, Chronicle AI, and Historix Renderer. It may **read** shared historical data, but its scenario state, resolver, memory graph, and UI are owned by this directory.

## Core principle

Historical data is the baseline, not a script.

A preset can establish what is historically known at the selected date, including populations, institutions, geography, technology, economics, military capacity, relationships, people, and events. Once the player acts, the engine creates a new scenario branch. Later responses use the branch's recorded state and causal history.

The engine must not silently force real-world events just because the calendar reaches the historical date on which they happened.

## Memory layers

- **Canonical history:** sourced facts and observations from the shared repository data.
- **Scenario seed:** the selected preset, role, date, constraints, and initial state.
- **World state:** current values for polities, places, populations, economies, militaries, diplomacy, institutions, and other modeled systems.
- **Event memory:** resolved actions, reactions, discoveries, wars, treaties, economic changes, demographic changes, and other meaningful events.
- **Causal graph:** links between actions, conditions, events, actors, places, and outcomes.
- **Uncertainty ledger:** confidence/provenance for claims and estimates.
- **Derived knowledge:** statistics calculated from the current alternate timeline.
- **Narrative memory:** the compact context needed to produce coherent roleplay responses.

## Resolution contract

Every player instruction should produce a structured result before narrative text is generated:

```text
instruction
  -> intent + actors + targets + time horizon
  -> feasibility/resource checks
  -> state mutations
  -> autonomous reactions
  -> event creation
  -> statistics recalculation
  -> causal links
  -> narrative response
```

Narrative text is therefore a presentation layer over a persistent simulation state, not the source of truth.

## Historical grounding

The project is designed to consume the repository's historical data architecture, including the CLIOPATRA/CLIOPATRIA-derived historical corpus and the existing geography/statistics systems where appropriate. Shared data remains read-only from this project's perspective.

For disputed, sparse, or estimated historical values, the engine should preserve uncertainty and provenance instead of manufacturing false precision.

## Initial project structure

```text
projects/chronicle-memory/
├── README.md
├── project.json
├── data/
│   ├── presets.json
│   └── schema/
│       └── scenario.schema.json
└── src/
    └── ENGINE-CONTRACT.md
```

Future runtime code belongs under this directory. Do not place scenario state in shared `data/` directories unless a dataset is intentionally promoted to repository-wide historical infrastructure.

## Isolation rules

- Never modify another project as part of a Chronicle Memory feature.
- Treat shared historical data as an input dependency.
- Keep scenario saves and generated alternate-history records project-local.
- Record provenance for imported historical facts.
- Keep real history and alternate-history state distinguishable in every record.
- Prefer append-only event memory so prior decisions remain auditable.
