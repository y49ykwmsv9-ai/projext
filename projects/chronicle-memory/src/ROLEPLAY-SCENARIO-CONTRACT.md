# Roleplay Scenario Isolation and Historical Continuity Contract

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

## Historical baseline

Every scenario must resolve a factual historical baseline appropriate to its date and geography before simulation actions are processed.

The baseline should include, where available:
- polities and territorial control;
- settlements and important locations;
- offices and constitutional/institutional structures;
- historically significant people;
- known factions, families, alliances, rivalries, and organizations;
- military, economic, demographic, technological, and cultural conditions;
- historically attested events already completed by the scenario start date.

The Historix / CLIOPATRA / CLIOPATRIA data layer is a primary reference for this historical context where its records are available. Other validated historical sources may supplement it without silently contradicting established records.

## Alternate-history boundary

The simulation is allowed to diverge from recorded history, including through player action and autonomous AI action.

Divergence must occur **from the historical baseline**, not by rewriting the baseline itself.

Therefore:
- historical facts that precede the current round remain facts unless the scenario explicitly establishes a counterfactual premise;
- historically plausible institutions remain the available institutional framework unless a simulation event actually changes them;
- real historical figures remain the relevant actors when they would historically be alive, present, or otherwise connected to the situation;
- fictional developments must have a plausible chain of events and cannot be inserted solely because they produce a desired outcome.

## Historical-person continuity

Historical people are persistent world entities.

For every significant historical figure used by the simulation, maintain an identity record sufficient to prevent accidental replacement. At minimum, preserve:
- canonical identity;
- lifespan;
- historically attested offices/titles;
- known locations and periods of activity;
- relevant faction/family affiliations;
- relationships supported by the historical data layer;
- current simulation status;
- the source or evidence basis for the historical identity.

If a previous round states that a specific person holds an office, commands a force, governs a place, leads a faction, or otherwise occupies a defined role, the next round must retain that person unless one of these conditions is satisfied:
1. the person historically died, departed, or ceased to hold the role during the intervening period;
2. the simulation records a concrete event that plausibly removes or replaces the person;
3. a documented institutional process produces a new officeholder;
4. the scenario's explicit counterfactual premise establishes a different succession.

No unexplained leader swapping is permitted.

The engine must not invent elections, appointments, successions, constitutional changes, or offices simply to facilitate gameplay. When a political transition is possible, the simulation must model the actual or historically plausible process that produces it.

## Player political agency

The player character is a participant in the historical system, not an automatically elevated ruler.

A character may begin outside formal politics and later pursue political influence. Advancement must be earned through actions and consequences appropriate to the period, including where applicable:
- patronage and client networks;
- wealth and property;
- military service and command;
- alliances and marriages where historically appropriate;
- legal or civic standing;
- factional support;
- reputation, trust, and legitimacy;
- elections, appointments, assemblies, senatorial or court processes, or other institutions only where those institutions actually existed and were accessible to the character.

A player cannot simply adopt a later or incompatible title because it sounds authoritative. For example, a character in a republican system does not become an emperor merely because the player declares themselves one. The simulation must represent the intermediate political, military, legal, social, and institutional processes required for such a transformation, if it is even historically possible.

## Historical figures as interactive actors

Significant historical figures should be represented as actors the player can actually interact with when the geography, chronology, social position, and information pathways make that interaction plausible.

The player may build relationships with, negotiate with, oppose, assist, compete with, or become dependent upon historical figures. These relationships should persist and affect later events.

The engine should distinguish:
- **known relationship:** supported by established history or prior simulation events;
- **emerging relationship:** created through player/AI interaction;
- **rivalry/conflict:** created by opposing interests or concrete events;
- **trust/legitimacy:** accumulated through observable actions and consequences.

Historical figures should not exist merely as names attached to news articles. When they are relevant actors, their decisions should have independent consequences and they should be capable of reacting to the player's actions when they could plausibly know about them.

## Player impact propagation

A player action must be evaluated for its plausible reach.

The engine should propagate meaningful effects through connected:
- people and patronage networks;
- places and routes;
- factions and institutions;
- military formations;
- markets and trade;
- neighboring settlements and polities;
- diplomatic relationships.

A player can therefore change the course of the surrounding world, but the magnitude of that influence must follow from their actual resources, position, reputation, relationships, and accumulated legitimacy.

The simulation must not reduce player agency to isolated stat adjustments. Numerical ledgers are state accounting; they do not replace the underlying social, political, military, and economic causality.

## Repository representation

Each committed campaign uses:

roleplays/<scenario_id>/scenario.json
roleplays/<scenario_id>/state.json
roleplays/<scenario_id>/rounds/round-NNN.json
roleplays/<scenario_id>/news/round-NNN.json

The registry at roleplays/index.json records the latest committed round and date.

## Round continuity

A new round starts from the previous round's committed state.

The fixed metric schema remains attached to the scenario and is not silently changed between rounds.

Historical identity, office, relationship, location, faction, and institutional continuity are also inherited from the previous committed state unless a documented historical transition or concrete simulation event changes them.

## News separation

News is scenario-scoped and uses only information available within that scenario's timeline and visibility model.

## Commitment boundary

A completed round is persisted only when its round state and news files are committed together.

## Personal Holdings Land-Area Metric

The scenario state must carry land_area_sq_miles alongside the existing fixed metrics from Round 33 onward. It represents the estimated total area of the player's personal estates and holdings already accumulated through simulation events.

Rules:
- Round 33 establishes the initial measured value for GMV-62BCE-001 at 4.00 square miles.
- The measurement does not itself acquire land and has a zero round delta.
- The metric is expressed in square miles in state and round records, with acreage and approximate Roman iugera retained as supporting conversions.
- The metric must be carried forward unchanged unless a concrete event explicitly acquires, loses, transfers, abandons, sells, confiscates, or otherwise changes land.
- Historical precedent informs the baseline measurement, but the engine must not use historical precedent to manufacture a new acquisition.
- Future land changes must be attributable to a specific event and included in that event's ledger/state mutation.
- The metric applies specifically to the player's personal estates and holdings, not all territory visited, occupied, patrolled, influenced, or militarily controlled by the player's expedition.

## Monthly Estate Audit and End-of-Month Verification

Every active roleplay that contains player-owned estates, holdings, properties, or estate-linked operations must perform a formal end-of-month audit at the close of every simulation month. This audit is a persistent contract requirement and is separate from the roleplay's narrative events.

The audit must run even when no estate-related event occurred during the month. It must review each estate or holding individually and then reconcile the estate-level results against the scenario's committed state.

For each estate, the monthly audit must check, where applicable:
- recorded ownership and land-area continuity;
- population and labor records;
- agricultural production and sustainability;
- stored supplies, inventories, and physical reserves;
- income, expenses, receipts, maintenance, and other estate-linked financial activity;
- infrastructure condition and construction activity;
- trade and commercial activity;
- security incidents, losses, damage, theft, or disruption;
- technology or operational improvements;
- events attributed to the estate during the month;
- whether each event's ledger effects were actually reflected in the estate and scenario state;
- whether any resource movement, transfer, acquisition, loss, or disposal is accounted for exactly once;
- whether the estate's records reconcile with the campaign's fixed metric schema and wealth-accounting rules.

The audit must identify discrepancies, duplicate accounting, missing effects, impossible state transitions, unsupported land changes, and other continuity errors before the month's committed state is treated as authoritative. Corrections must preserve the fixed metric schema and must be traceable to the underlying event or accounting record. The audit must never silently manufacture an event to explain a discrepancy.

The audit is an accounting and verification layer, not a public news event. It must not be inserted into the roleplay's narrative as an event unless a separate, meaningful in-world development results from the audit itself. Its results should be persisted as structured verification data associated with the completed month so later rounds can rely on the verified estate state.

At minimum, the completed monthly audit must record:
- audit period and completion date;
- estates/holdings reviewed;
- event records reviewed for each estate;
- reconciliation status for each estate;
- discrepancies found;
- corrections applied, if any;
- final verified estate totals and their reconciliation to scenario state;
- audit status indicating whether the month's estate records passed verification.

A new simulation month may proceed from the prior month's committed state only after the end-of-month estate audit has been completed and persisted. This requirement applies to all future rounds and is independent of the player's narrative instructions.

