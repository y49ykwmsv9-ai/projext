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
