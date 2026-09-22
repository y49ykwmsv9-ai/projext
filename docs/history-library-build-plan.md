# History Library Build Plan

## Base target: Cliopatria Complete

The first hard coverage milestone is 100% of unique POLITY entities in the selected Cliopatria release.

A successful build must:
- import every unique Cliopatria POLITY name;
- assign a deterministic Chronicle ID;
- preserve Cliopatria temporal/spatial rows and source identifiers;
- retain Wikidata, Seshat, Wikipedia, area, and source-row references when present;
- record the exact upstream file SHA-256 and build date;
- produce a machine-readable completeness manifest;
- fail CI if source and imported polity counts diverge, invalid rows exist, or an imported resource is missing;
- keep the browser-facing catalog small and load detailed records lazily.

The raw Cliopatria GeoJSON remains an upstream build input. It is not copied into the client bundle.

## Execution order

### Phase 1, source-complete polity layer
1. Build the Cliopatria ingestion pipeline.
2. Generate one resource per Cliopatria polity.
3. Generate manifests/cliopatria-manifest.json.
4. Enforce completeness in GitHub Actions.
5. Inspect the generated counts and missing/invalid report.
6. Lock the first release snapshot and record its provenance.

### Phase 2, historical graph
1. Add events, people, places, and relationships as separate resource classes.
2. Link entities with stable IDs rather than duplicating narrative data.
3. Add predecessor/successor, ruler, conflict, location, and contemporaneous-polity relations.
4. Add temporal validity and source provenance to every relationship.

### Phase 3, numerical substrate
1. Add population observations.
2. Add economic observations and purchasing-power/currency basis.
3. Add agricultural, trade, military, infrastructure, and resource observations.
4. Store estimates with units, bounds, confidence, and source IDs.
5. Reconcile conflicting sources instead of silently choosing one value.

### Phase 4, spatial and temporal engine
1. Keep geometry in separately addressable temporal snapshots.
2. Resolve a polity's territory for a requested year/location.
3. Connect places to nearby polities and historical events.
4. Feed the graph into the simulation's causal systems.

### Phase 5, lazy runtime access
1. Keep catalog.json as an index only.
2. Add cached resource fetches.
3. Add date/location/name lookup indexes.
4. Add browser/device persistence without bundling the entire library.
5. Make documentary generation consume the same source graph.

### Phase 6, expansion beyond Cliopatria
Expand the graph with additional historical datasets and sources, while keeping provenance and licensing metadata attached to every imported record.

## Definition of done for the first milestone

The milestone is complete only when GitHub Actions can build the library from the upstream Cliopatria file and the validator reports:

Cliopatria completeness target: PASS

The exact source count is generated from the selected release. It is never hard-coded.