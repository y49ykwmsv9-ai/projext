# Roleplay Scenario Store

This directory contains player-owned simulation instances, not reusable examples.

## Isolation rule
Every new character + starting context, preset, or entirely new scenario receives a unique scenario_id and its own directory:

roleplays/<scenario_id>/

A round, event, state change, relationship, metric history, and news article belongs to exactly one scenario. Never merge events from one scenario into another merely because the character, year, location, or preset is similar.

## Scenario lifecycle
1. Detect the incoming scenario identity.
2. Generate a stable unique scenario_id.
3. Create a scenario directory if it does not exist.
4. Initialize scenario.json, state.json, rounds/, and news/.
5. Commit each completed round under that scenario only.
6. Continue future rounds from that scenario's latest committed state.
7. Treat examples/test runs as separate scenarios and never use them as campaign state.

The browser runtime namespaces local saves by scenario_id. Repository commits use the same ID.

## Current player scenario
GMV-62BCE-001 is the first committed scenario in this store.
