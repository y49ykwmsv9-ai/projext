# Roleplay Scenario Isolation Contract

## Identity
A simulation instance is identified by a stable scenario_id. The identity is based on character, starting date/context, preset/custom scenario identity, and a unique suffix. It must not be inferred solely from the character name.

## Automatic separation
When a new roleplay is submitted:
- If the active scenario identity matches an existing campaign, continue it.
- If the character, starting context, preset, or scenario is new, create a new scenario identity.
- Never append a new character or scenario to an unrelated campaign.
- Never use an example/test roleplay as live campaign state.
- Browser persistence keys include scenario_id.
- JSON exports/imports include scenario_id and reject mismatched campaign state unless explicitly imported as a new copy.

## Repository representation
Each committed campaign uses:
roleplays/<scenario_id>/scenario.json
roleplays/<scenario_id>/state.json
roleplays/<scenario_id>/rounds/round-NNN.json
roleplays/<scenario_id>/news/round-NNN.json

The registry at roleplays/index.json records the latest committed round and date.

## Round continuity
A new round starts from the previous round's committed state. The fixed metric schema remains attached to the scenario and is not silently changed between rounds.

## News separation
News is scenario-scoped and uses only information available within that scenario's timeline and visibility model.

## Commitment boundary
A completed round is persisted only when its round state and news files are committed together.
