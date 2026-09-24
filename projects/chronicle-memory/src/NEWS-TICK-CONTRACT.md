# News-driven world tick contract

## Purpose

Every explicit time leap produces a living-news turn. News is not decoration. Each article is a structured simulation event whose actors, causes, locations, relationships, and state changes are written into world memory and used by later turns.

## Historical grounding

Alternate-history scenarios must remain historically grounded.

The engine should use the Historix / CLIOPATRA / CLIOPATRIA reference layer to resolve the factual world appropriate to the scenario date and location, including significant historical figures, offices, factions, places, institutions, and known relationships.

A divergence from recorded history is valid when it is caused by a player or autonomous simulation event. It is not valid to silently replace a historical fact, leader, office, institution, or person simply because a different outcome is convenient.

## Action -> event -> ledger separation

Player input must be preserved as a canonical structured action before event generation. Each action has a stable action_id, scenario_id, round, actor, original action_text, and structured components. Events derive from that action but must not expose engine reasoning in their public article text.

Each event has two presentation layers:

1. **News article:** period-authentic reporting containing only information plausibly available to contemporary observers.
2. **AI ledger box:** a small numerical block attached beneath the article containing only that event's applicable state changes.

The numerical ledger uses the scenario's fixed metric schema. Event ledgers accumulate into the round total, and the round total is applied to the next committed state. Never change metric definitions or scales between rounds without an explicit schema-version migration.

## Historical actors and continuity

Historical figures are active simulation actors when relevant, not decorative names.

When an event identifies a historical person as holding an office, commanding a force, governing a place, leading a faction, or otherwise occupying a defined role, that identity becomes part of the scenario's persistent state.

Later news must preserve that identity unless:
- the person historically died, departed, or ceased to hold the role during the intervening period;
- a concrete simulation event changes the person's position;
- a documented institutional process changes the officeholder;
- an explicit counterfactual premise establishes a different outcome.

The engine must not invent an election, appointment, succession, office, title, or political institution merely to create a more dramatic story.

When multiple historical figures could plausibly be involved, selection should be based on date, geography, office, faction, and historical connections, not on narrative convenience.

## Player and historical-figure interaction

The player is an actor within the same world as historical figures.

When the player's social position, location, resources, and information make contact plausible, the engine should allow the player to interact with significant historical figures through appropriate period mechanisms: patronage, correspondence, trade, military service, political alliance, legal proceedings, diplomacy, factional activity, religious institutions, civic bodies, or other historically valid channels.

Relationships should persist. Trust, favor, reputation, hostility, debt, and political connection can develop through actual events and should influence later opportunities and reactions.

A historical figure should be capable of independently helping, opposing, ignoring, negotiating with, recruiting, threatening, or competing with the player where plausible.

## Player agency and political progression

The player does not receive political authority merely because the narrative needs a powerful protagonist.

A private character can pursue political influence, but the simulation must represent the actual path by which influence is acquired. Where relevant this may include wealth, patronage, military service, factional support, civic standing, elections, appointments, assemblies, senatorial processes, courts, family alliances, or other institutions appropriate to the period.

The engine must not give a republican character an imperial title or equivalent authority without modeling the political, legal, military, and social developments that would make such a transformation possible.

## Player-world causality

Player actions should create observable changes in the surrounding world when their reach makes those changes plausible.

Examples:
- a local military recruitment effort can affect nearby labor, security, landowner relationships, supply markets, and perceptions of the player's household;
- a successful relationship with an influential figure can create access to people, information, protection, contracts, or political opportunities;
- an insult or failed negotiation can create a durable rival, lost access, retaliation, or factional opposition;
- sustained investment can change local production and strengthen the player's economic base.

The player should become a real causal actor in the alternate timeline. However, influence must scale with actual position and accumulated relationships rather than being granted automatically.

## Required output volume

For each explicit time advance, generate 5-10 newsworthy articles by default.
- Short leaps may produce 5 articles when fewer events are plausible.
- Typical monthly/yearly leaps should target 6-8.
- Long leaps may reach 10 when the world genuinely changed substantially.
- Never fill the quota with meaningless filler. If fewer than 5 genuinely newsworthy developments occurred, use distinct substantive developments and mark low-confidence reports rather than inventing facts.

## Article format

Each event is presented as a numbered newspaper-style story with a headline and a clearly displayed event number immediately alongside the date, followed by place/actors and a 5-7 sentence minimum article. The machine-readable event_number must be sequential within the round and must appear in every news event record.

Major wars, regime changes, major economic shocks, disasters, treaties, rebellions, and comparable events may be substantially longer or split into related articles.

Every article identifies, where known: what happened; who is involved; where it happened; why it happened; immediate consequences; likely or already observed follow-on consequences; and what the player can actually know about it.

## Period-authentic reporting

News must read as something a contemporary publication could plausibly print, not as a simulation log.

- Write from the information position of the period and place.
- Use contemporary vocabulary, institutions, titles, customs, and geographic references appropriate to the scenario.
- Report observable developments and attributed reports. Do not state hidden simulation causes as facts.
- Do not mention metrics, state deltas, hidden variables, event graphs, causal scores, engine reasoning, or "the simulation" in article prose.
- Do not turn the article into an after-the-fact explanation of why the engine changed a number.
- A player's private action can only appear in news when a contemporary observer could plausibly know about it.
- Rumor, uncertainty, and conflicting reports should be written as reporting when appropriate rather than resolved by omniscient narration.

## Final article of each round

The final article is a local-reader round summary. It should resemble the closing local item or local-news roundup a resident might encounter at the end of the period.

It summarizes the notable events that actually occurred during the round, prioritizing local and nearby developments and adding relevant wider news that plausibly reached the locality. It is a story, not a ledger. It must not list metrics, explain hidden mechanics, or narrate the engine's internal logic.

## Event -> simulation rule

An article is valid only if it corresponds to a structured event in simulation memory.

At minimum it has:
- event id;
- sequential event number;
- date/round;
- actors;
- locations;
- causes;
- effects;
- information visibility/confidence;
- historical-source references where historical facts or figures are used;
- numerical state changes where applicable.

The article text and AI ledger are separate fields/layers.

## Historical consistency validation

Before committing a round, validate:
1. every named historical figure against the scenario date and location;
2. every office/title against the political system active at that date;
3. every stated officeholder against the previous round and known succession chronology;
4. every historical institution against the period;
5. every major historical event referenced against its actual date;
6. every player interaction with a historical figure against plausible geography, social position, and information access;
7. every claimed political advancement against the actual mechanisms required to obtain it.

If a fact is uncertain, report it as uncertain or omit it. Do not resolve uncertainty by invention.

## Cross-turn causality

News must alter the world when the event logically does so.

- Grain shortage -> food stocks, prices, migration risk, urban stability.
- Military mobilization -> treasury, supplies, readiness, manpower availability, diplomatic threat.
- Treaty -> diplomatic relations, trade access, alliance obligations, future decision probabilities.
- Rebellion -> territorial control, stability, tax collection, military deployment, foreign incentives.
- Succession crisis -> leadership, legitimacy, faction strength, foreign intervention opportunities.
- Player relationship with a significant figure -> access, trust, hostility, information, protection, obligations, or political opportunity as appropriate.

Later events must read the resulting state rather than restarting from historical baseline.

## Other nations act independently

Each relevant polity receives an autonomous decision pass during a time leap. The player is one actor among many.

AI nations may trade, mobilize, negotiate, threaten, raid, declare/end wars, support rebels, reform, build, change taxes, migrate/colonize, suffer crises, make mistakes, and pursue plausible but imperfect strategies.

AI actors cannot know hidden player actions unless information reaches them.

Historical figures likewise retain independent agency. They are not puppets whose decisions exist only to validate the player's chosen path.

## News selection

Select articles in this order:
1. events directly altering the player's strategic situation;
2. interactions with significant historical figures and nearby institutions;
3. nearby/strategically connected foreign events;
4. major regional events;
5. major world events;
6. lower-confidence intelligence and rumors.

Avoid omniscient reporting. World state may contain facts the player does not know.

## Historical 1444 test mode

Initialize a 1444 world from the Historix / CLIOPATRA / CLIOPATRIA reference layer where available, then process the first explicit time leap using autonomous logic.

Historical events may occur because initialized conditions make them plausible, but the engine must not force them merely because a real historical date matches.

Record both historical baseline evidence and simulation-generated events/state changes. The test succeeds only if news articles, named actors, historical offices, relationships, and numerical consequences agree.


## Persistent World Memory and Longitudinal References

The roleplay must feel like a persistent lived timeline rather than a sequence of disconnected monthly episodes. Every future news tick must deliberately carry forward relevant memory from prior rounds when the facts remain active.

### Required continuity references

For each monthly or longer time advance, event generation must inspect prior committed rounds and scenario state for relevant:
- people and persistent relationships;
- settlements, estates, forts, roads, rivers, passes, camps, ports, markets, and other named places;
- previous battles, raids, discoveries, construction, negotiations, investigations, and unresolved incidents;
- institutions, factions, households, military units, merchants, local communities, and other persistent actors;
- previously discovered intelligence, routes, documents, stores, resources, debts, obligations, threats, and opportunities;
- consequences that remain active even when they are not the immediate subject of an event.

Where a prior person, place, institution, or unresolved development is relevant to the new event, the article should identify it by name and connect the present development to its known history. References should be natural to the period's reporting rather than artificial reminders inserted solely for continuity.

### Persistence requirement

A later round must be capable of referring to an event several rounds or months earlier when that event still matters. Recent events should not automatically displace older developments from world memory. Long-running developments should accumulate stages, consequences, relationships, and locations across multiple rounds.

Examples of valid continuity include:
- a new movement using a road first discovered several rounds earlier;
- an estate audit discovering a consequence of construction or trade recorded in a previous month;
- a later military event referring to an earlier battle, fortress, surviving garrison, captured document, or established patrol route;
- a relationship with a historical or fictional actor affecting later negotiations or information flow;
- a settlement previously encountered becoming relevant again because of trade, intelligence, migration, military movement, or political change;
- a historical figure previously mentioned appearing again when their real-world role and the campaign's geography make continued relevance plausible.

### Historical-person continuity in prose

When a previously established historical figure is relevant, later articles should preserve the person's established identity, office, location, faction, and relationship history. Do not repeatedly introduce the same figure as though the reader has never heard of them. Conversely, do not force historical figures into unrelated events merely to satisfy a continuity quota.

### Place continuity in prose

Previously established places should retain their names and known functions. If the campaign has established a winter position, ravine fortress, road, storehouse, pass, settlement, river crossing, estate, or other location, later articles should use those established names or clearly identify the same place rather than silently replacing it with generic labels such as "the camp" or "the area."

### Event-memory linkage

Each generated event must retain machine-readable references to materially relevant prior events, places, people, and institutions where applicable. These references are part of persistent simulation memory and are not required to be exposed in the public article as technical identifiers.

Before committing each round, perform a continuity check confirming that the new events have incorporated relevant prior-world context and that no established person, place, relationship, institution, or unresolved development has been accidentally reset or forgotten.



## Vigilant Watcher for Unresolved Developments

Every unresolved event or open consequential thread must carry a persistent **massive-priority continuity flag** in simulation memory. The flag is an AI-facing vigilance mechanism. It is not a public metric, narrative label, or probability guarantee.

### Definition

An event is **UNRESOLVED** when a consequential question, threat, investigation, relationship, transaction, military objective, disappearance, discovery, dispute, negotiation, missing asset, unidentified actor, or other material development remains without a definite outcome.

Unresolved status must persist independently of how recently the event appeared in the news.

Each unresolved record must retain, where applicable:
- origin event and round;
- unresolved question or open consequence;
- current status;
- involved people and factions;
- involved places and institutions;
- known consequences;
- last known state;
- information available to the player;
- information known elsewhere in the world;
- plausible conditions that could reactivate or resolve it;
- links to later events that advance, complicate, reactivate, or resolve the thread.

### Massive red-flag behavior

The AI equivalent of a massive red flag means:

1. **Never silently discard it.**
2. **Never treat it as resolved merely because it has not been mentioned recently.**
3. **Check it during every monthly or longer continuity pass.**
4. **Keep it eligible for causal reactivation indefinitely while the underlying matter remains unresolved.**
5. **Give it substantially elevated consideration when a later event, location, person, institution, intelligence report, resource movement, relationship, or other development creates a plausible connection.**
6. **Preserve its accumulated history when it reappears.**
7. **Do not manufacture a resolution merely to clear the flag.**
8. **Do not force it into an article when no credible causal connection exists.**

This is a vigilance rule, not a recurrence rule. An unresolved event may remain dormant for many rounds while still carrying the highest continuity attention.

### Dormancy and reactivation

Unresolved developments use the following conceptual lifecycle:

**ACTIVE → DORMANT → REACTIVATED → RESOLVED → HISTORICAL**

- **ACTIVE:** currently developing or immediately relevant.
- **DORMANT:** unresolved but presently lacking a credible reason to surface in public reporting.
- **REACTIVATED:** a new development has created a plausible causal connection.
- **RESOLVED:** the underlying question or consequence has reached a supported outcome.
- **HISTORICAL:** the resolved matter remains part of the permanent world history and may still be referenced when relevant.

Dormancy does not reduce historical importance. It only means that the current circumstances do not justify public reappearance.

### Importance-based vigilance

The watcher must prioritize unresolved developments according to their underlying significance, not recency alone.

A recent minor unresolved dispute must not automatically outrank an older unresolved matter that could materially affect:
- the player's safety or military position;
- a major relationship;
- an established estate, fort, road, settlement, port, market, or trade route;
- reputation or social standing;
- wealth or a major commercial undertaking;
- an important faction or institution;
- regional security;
- accumulated intelligence;
- an important enemy or ally;
- a major discovery;
- a prior battle or campaign;
- a continuing political, diplomatic, or legal matter.

Major unresolved developments remain high-priority even after many rounds without mention.

### Continuity-pass behavior

Before each round is committed, the continuity pass must inspect the unresolved-event registry and determine for each item whether:
- it remains unresolved;
- it should remain dormant;
- new evidence advances it;
- a current event plausibly reactivates it;
- the world state has changed in a way that affects it;
- it has actually been resolved by a supported event.

If an unresolved matter becomes relevant, later news should surface it naturally through period-authentic channels such as correspondence, merchants, soldiers, officials, inspections, records, travelers, intelligence, rumors, negotiations, or direct observation.

The public article must never say that an unresolved event was surfaced because of a continuity flag, watcher process, AI rule, audit mechanism, or simulation system.

### No false closure

An unresolved record is removed from the unresolved registry only when a concrete event or sufficiently reliable information establishes its outcome.

A later event that merely provides another clue does not resolve the original matter. It should instead update the same persistent unresolved thread and preserve its prior history.

A contradictory report should increase uncertainty rather than silently overwrite established information. Where appropriate, the world should retain competing reports until later evidence supports a resolution.

### Audit integration

The monthly estate and world continuity audit must verify that unresolved developments have not been lost, reset, duplicated, or incorrectly marked resolved.

The audit may generate an in-world news event when it discovers a meaningful old consequence, new evidence, discrepancy, or development. Routine verification remains internal. The player-facing manifestation must always be an ordinary in-world event rather than a reference to auditing or engine mechanics.

