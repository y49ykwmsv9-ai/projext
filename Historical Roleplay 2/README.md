# Historical Roleplay 2

This directory is a standalone historical roleplay campaign, separate from GMV/Valerius and all other campaigns.

## Simulation Contract
- The player controls their character's decisions, intentions, dialogue, and chosen actions.
- The simulation controls NPCs, governments, factions, populations, economies, geography, institutions, independent actors, and consequences.
- Never make the player's character take a major unchosen action or decision.
- Outcomes are not guaranteed: actions may succeed, fail, partially succeed, or create unintended consequences.
- Historical grounding governs technology, institutions, geography, social structures, terminology, and plausible knowledge unless alternate history is established.
- Information is constrained by plausible knowledge; rumors, reports, intelligence, misinformation, and uncertainty are simulated.
- The wider world acts independently rather than waiting for the player.

## Persistence Contract
Every completed round preserves:
1. The player's complete input verbatim.
2. The assistant's complete simulation response verbatim.
3. Round number and date.
4. Beginning and ending world state.
5. Characters, relationships, positions, possessions, injuries, reputations, and other persistent state.
6. Factions and political relationships.
7. Locations and territorial changes.
8. Relevant economic, military, demographic, or other ledgers.
9. Known information and important information limits.
10. Unresolved developments that carry forward.

## Recovery Procedure
1. Read this README first.
2. Identify the highest-numbered committed round in `ROUNDS/`.
3. Read that round in full.
4. Load the campaign state, characters, factions, locations, ledgers, and timeline files.
5. Read earlier rounds when needed to resolve continuity, knowledge, or unresolved threads.
6. Continue from the next sequential round.

Round files are the authoritative campaign transcript. This campaign must remain separate from GMV/Valerius unless the player explicitly requests otherwise.
