# Chronicle Historical Library

A modular, provenance-first historical knowledge library for the Chronicle simulation, map, and documentary systems.

## Goal

Do not ship one giant historical archive to every client. Resources are split into small, independently addressable records: polities, events, people, places, quantitative observations, territorial snapshots, and relationships.

The primary unit is **polity**, not the modern nation-state. This preserves kingdoms, empires, city-states, confederations, dynasties, colonial administrations, indigenous polities, governments, nomadic confederations, and other historical political forms.

## Layout

- `catalog.json` - lightweight lookup index
- `schema.json` - canonical resource schema
- `sources.json` - provenance and licensing registry
- `polities/` - polity resources and the HISTORIX 1.4 referenced-polity layer
- `events/` - event resources
- `people/` - rulers and people
- `places/` - cities, sites, regions and infrastructure
- `observations/` - population, economy, military and other numerical observations
- `relations/` - wars, alliances, trade, succession and diplomatic links
- `snapshots/` - generated simulation-ready state snapshots

The browser loads only the records required for the current simulation date, map viewport, query, or documentary scene.

## Historical scope

The expansion pipeline uses the existing project data plus Cliopatria/Seshat-linked material and other compatible historical datasets. Cliopatria covers worldwide polities, political groups, events and rulers from 3400 BCE to 2024 CE and currently describes more than 1,600 political entities with roughly 14,000 temporal/spatial records.

## HISTORIX 1.4 polity layer

HISTORIX 1.4 materializes every unique polity referenced by the curated HISTORIX graph into `data/history-library/polities/historix-linked.json`. It preserves the existing stable IDs and historical distinctions. The Cliopatria baseline remains a separate broad dataset; exact identity matching is explicitly tracked as unresolved until verified.

To modify one polity, edit its object by stable `id`, add source-backed fields, and run the 1.4 validator.

## Numerical policy

Historical numbers are estimates, not magic constants. Quantitative records should retain value, lower/upper bounds where available, unit, confidence, year and source IDs. Conflicting scholarly estimates remain separate when they cannot be reconciled responsibly.

## Build flow

1. Ingest upstream data.
2. Normalize names, dates, IDs and units.
3. Link aliases and source IDs.
4. Preserve competing identities and uncertainty.
5. Generate small resource files and the catalog.
6. Validate temporal ranges, units and provenance.
7. Publish only what the application needs.

This is a historical library, not a zip bomb wearing a trench coat.
