# Roleplay Scenario Store

This directory contains player-owned historical simulation instances. A scenario may diverge from recorded history, but it must remain grounded in documented history, geography, institutions, people, and material conditions.

## Core historical rule

**Alternate history changes outcomes, not the factual foundations of the world.**

The engine must begin from the best-supported historical baseline available for the scenario date and location. This includes:
- historically attested polities, settlements, territories, offices, institutions, laws, customs, economies, technologies, military practices, and significant historical figures;
- historically appropriate names, titles, political structures, geography, and chronology;
- the Historix / CLIOPATRA / CLIOPATRIA reference layer and other approved historical data available to the engine.

The simulation may produce a different future when player actions or autonomous world actions create a plausible divergence. It must not rewrite the starting historical facts merely to make an event convenient.

## Historical-person continuity

Historical figures are real actors in the simulation, not decorative names.

When a historically significant person is relevant to the scenario, the engine should use that person as an actual actor with historically appropriate:
- identity and lifespan;
- position, office, authority, faction, family, alliances, and known relationships;
- geographic presence;
- interests and constraints;
- ability to receive, conceal, support, oppose, negotiate, or respond to information.

Once a person is established as holding an office or leading a place in an earlier round, later rounds must preserve that identity unless there is a documented historical succession, a plausible death/absence, or a simulation event that genuinely causes a change. The engine must never silently replace a leader between rounds.

The engine must not invent elections, successions, appointments, titles, constitutional changes, or political offices simply to move a character into a more convenient position. If the player wants political authority, the player must actually pursue the historically available process for obtaining it.

## Player agency and political progression

The player character is an actor inside the historical political and social system, not an omnipotent ruler.

A character such as Gaius Maximus Valerius may begin as a private landowner or other historically plausible social figure. He can attempt to become politically influential, but the transition must happen through actions and consequences appropriate to the period: building patronage, gaining allies, establishing military connections, acquiring wealth, obtaining legitimacy, entering offices, winning support, securing appointments where applicable, or otherwise using institutions that actually existed.

Historical figures are therefore people the player may:
- cooperate with;
- oppose;
- negotiate with;
- build trust with;
- offend or alienate;
- owe favors to;
- recruit or persuade where plausible;
- compete against;
- encounter through military, commercial, legal, religious, or political activity.

Relationships are persistent world state. Trust and connections must be earned through events and should affect what opportunities, information, protection, opposition, and political pathways become available.

## Player impact on the wider world

Player actions must be capable of producing world consequences beyond the player's immediate estate or unit when the action plausibly does so.

The engine should propagate meaningful consequences through historically connected people, places, institutions, markets, military networks, factions, and neighboring polities. A player should be able to become an identifiable historical force within the alternate timeline, rather than merely receiving isolated numerical bonuses.

Player influence must still be proportional to actual reach. A local landowner does not automatically control a province, command a republic, or become an emperor. Wider authority must emerge through documented or historically plausible mechanisms.

## Scenario isolation

Every new character + starting context, preset, or entirely new scenario receives a unique scenario_id and its own directory:

roleplays/<scenario_id>/

A round, event, state change, relationship, metric history, and news article belongs to exactly one scenario. Never merge events from one scenario into another merely because the character, year, location, or preset is similar.

## Scenario lifecycle

1. Detect the incoming scenario identity.
2. Generate a stable unique scenario_id.
3. Create a scenario directory if it does not exist.
4. Initialize scenario.json, state.json, rounds/, and news/.
5. Resolve the historical baseline for the starting date and location.
6. Resolve historically relevant people, institutions, offices, factions, and places.
7. Commit each completed round under that scenario only.
8. Continue future rounds from that scenario's latest committed state.
9. Preserve established identities and relationships across rounds unless a documented or simulation-caused transition occurs.
10. Treat examples/test runs as separate scenarios and never use them as campaign state.

The browser runtime namespaces local saves by scenario_id. Repository commits use the same ID.

## Current player scenario

GMV-62BCE-001 is the first committed scenario in this store.


## Automatic Round Commitment
Every completed roleplay round is committed to GitHub immediately after resolution. The committed round file, news file, updated state, and continuity information are the authoritative campaign record for all subsequent rounds. Future rounds must inherit prior committed relationships, historical actors, events, knowledge, locations, institutions, and consequences rather than regenerating the campaign from scratch.
