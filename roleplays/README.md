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

## Dynamic World and Event Categories

The world continues to develop whether or not the player acts. Player actions are the main source of events concerning the player's immediate situation, but they are **not the only source of new information or events**. Each round may introduce people, places, political developments, military movements, economic changes, rumors, disasters, opportunities, conflicts, and other information that was not previously known to the player.

The event system uses five concrete primary categories:

### DIRECT
Events caused by, immediately affecting, or directly concerning the player character, their holdings, forces, decisions, relationships, or ongoing operations.

**Applies to:** player actions, direct consequences, immediate reactions, developments at the player's estate, military force, political contacts, resources, or relationships.

### CONNECTED
Events not directly caused by the player, but meaningfully connected to the player's region, relationships, allies, enemies, trade routes, military network, political interests, or developing circumstances.

**Applies to:** neighboring developments, merchants, contacts of contacts, nearby political or military activity, regional consequences, and events that can plausibly enter the player's sphere.

### WORLD
Independent developments occurring outside the player's current sphere of action.

**Applies to:** distant wars, foreign politics, Roman political developments, deaths, appointments, migrations, disasters, economic developments, and actions of historical figures or other actors that do not presently depend on the player.

WORLD events are required because the simulation must remain dynamic rather than functioning as a player-centered event generator.

### SURPRISE
An unexpected development whose occurrence or timing was not reasonably predictable from the player's immediate actions, but which remains historically plausible.

**Applies to:** unexpected raids, sudden deaths, unanticipated meetings, abrupt political reversals, unusual discoveries, sudden movements of people or forces, or other plausible developments that disrupt the expected course of events.

A SURPRISE event may be DIRECT, CONNECTED, or WORLD in origin, but its defining property is that it arrives unexpectedly.

### SPECIAL
A rare, historically plausible event capable of producing unusually large or disproportionate consequences.

**Applies to:** major political shocks, assassinations or assassination attempts, sudden leadership crises, extraordinary military reversals, severe environmental or economic shocks, historically plausible deaths or survivals with major consequences, sudden factional realignment, or other rare turning points.

SPECIAL events are not required to originate from the player's actions and may occur entirely outside the player's current sphere. Their consequences must persist into subsequent rounds.

SURPRISE and SPECIAL are not interchangeable: a SURPRISE event is defined primarily by unexpected timing or occurrence; a SPECIAL event is defined by its rarity and potentially outsized consequences.

The category distribution is dynamic rather than a rigid quota. Most events should ordinarily be DIRECT or CONNECTED, but WORLD events must regularly introduce genuinely new information, and SURPRISE or SPECIAL events may alter the normal distribution when circumstances warrant it.

## Event presentation

Every news event must display a compact outlined metadata box immediately next to the event number/date information. The box must contain:
- event number;
- exact date;
- primary event type;
- entity/party tags for the people, places, institutions, forces, factions, or other named entities actually mentioned.

The box is deliberately compact and must not consume excessive screen space.

Example:

~~~text
┌─────────────────────────────────────────────────────────────┐
│ EVENT 4 · 8 APRIL 62 BCE · DIRECT                         │
│ Gaius Maximus Valerius · Roman Expedition · Bandits       │
└─────────────────────────────────────────────────────────────┘
~~~

Do not use emoji as the event-type indicator. Do not replace the outlined metadata box with a large panel.

Event headlines must use highly readable, distinctive typography. Decorative Unicode characters that reduce legibility are prohibited. Major battles and SPECIAL events may receive stronger headline hierarchy while retaining normal readable characters.

## Information and knowledge

The simulation distinguishes **world state** from **player knowledge**.

A fact can exist in the world without being known to the player. Information reaches the player through historically plausible channels such as travelers, merchants, soldiers, officials, letters, political contacts, rumors, reports, or direct observation. Reports may be incomplete, delayed, mistaken, or disputed.

New information introduced by WORLD, CONNECTED, SURPRISE, SPECIAL, or DIRECT events becomes part of the accumulated campaign knowledge when plausibly learned by the player. It persists into later rounds and may become relevant only much later.

The engine must not regenerate the information environment from scratch at the start of each round.

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
7. Generate a dynamic mix of DIRECT, CONNECTED, WORLD, SURPRISE, and SPECIAL events according to the rules above.
8. Commit each completed round under that scenario only.
9. Preserve established identities and relationships across rounds unless a documented or simulation-caused transition occurs.
10. Treat examples/test runs as separate scenarios and never use them as campaign state.
11. Preserve accumulated player knowledge, world developments, and consequences across rounds.

The browser runtime namespaces local saves by scenario_id. Repository commits use the same ID.

## Current player scenario

GMV-62BCE-001 is the first committed scenario in this store.


## Automatic Round Commitment
Every completed roleplay round is committed to GitHub immediately after resolution. The committed round file, news file, updated state, and continuity information are the authoritative campaign record for all subsequent rounds. Future rounds must inherit prior committed relationships, historical actors, events, knowledge, locations, institutions, and consequences rather than regenerating the campaign from scratch.
