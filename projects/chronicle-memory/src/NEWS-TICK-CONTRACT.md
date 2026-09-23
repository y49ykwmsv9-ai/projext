# News-driven world tick contract

## Purpose
Every explicit time leap produces a living-news turn. News is not decoration. Each article is a structured simulation event whose actors, causes, locations, and state changes are written into world memory and used by later turns.

## Required output volume
For each explicit time advance, generate 5-10 newsworthy articles by default.
- Short leaps may produce 5 articles when fewer events are plausible.
- Typical monthly/yearly leaps should target 6-8.
- Long leaps may reach 10 when the world genuinely changed substantially.
- Never fill the quota with meaningless filler. If fewer than 5 genuinely newsworthy developments occurred, use distinct substantive developments and mark low-confidence reports rather than inventing facts.

## Article format
Each event is presented as a newspaper-style story with a headline, date/place/actors, and a 5-7 sentence minimum article. Major wars, regime changes, major economic shocks, disasters, treaties, rebellions, and comparable events may be substantially longer or split into related articles.
Every article identifies, where known: what happened; who is involved; where it happened; why it happened; immediate consequences; likely or already observed follow-on consequences; and what the player can actually know about it.

## Period-authentic reporting
News must read as something a contemporary publication could plausibly print, not as a simulation log.
- Write from the information position of the period and place.
- Use contemporary vocabulary, institutions, titles, customs, and geographic references appropriate to the scenario.
- Report observable developments and attributed reports. Do not state hidden simulation causes as facts.
- Do not mention metrics, state deltas, hidden variables, event graphs, causal scores, engine reasoning, or "the simulation".
- Do not turn the article into an after-the-fact explanation of why the engine changed a number.
- A player's private action can only appear in news when a contemporary observer could plausibly know about it.
- Rumor, uncertainty, and conflicting reports should be written as reporting when appropriate rather than resolved by omniscient narration.

## Final article of each round
The final article is a local-reader round summary. It should resemble the closing local item or local-news roundup a resident might encounter at the end of the period.
It summarizes the notable events that actually occurred during the round, prioritizing local and nearby developments and adding relevant wider news that plausibly reached the locality. It is a story, not a ledger. It must not list metrics, explain hidden mechanics, or narrate the engine's internal logic.

## Event -> simulation rule
An article is valid only if it corresponds to a structured event in simulation memory. At minimum it has event id, date/round, actors, locations, causes, effects, information visibility/confidence, and numerical state changes where applicable.
Merely mentioning a nation in prose does not count. That nation must exist in the event graph and its state must be eligible to change.

## Cross-turn causality
News must alter the world when the event logically does so.
- Grain shortage -> food stocks, prices, migration risk, urban stability.
- Military mobilization -> treasury, supplies, readiness, manpower availability, diplomatic threat.
- Treaty -> diplomatic relations, trade access, alliance obligations, future decision probabilities.
- Rebellion -> territorial control, stability, tax collection, military deployment, foreign incentives.
- Succession crisis -> leadership, legitimacy, faction strength, foreign intervention opportunities.
Later events must read the resulting state rather than restarting from historical baseline.

## Other nations act independently
Each relevant polity receives an autonomous decision pass during a time leap. The player is one actor among many. AI nations may trade, mobilize, negotiate, threaten, raid, declare/end wars, support rebels, reform, build, change taxes, migrate/colonize, suffer crises, make mistakes, and pursue plausible but imperfect strategies. AI actors cannot know hidden player actions unless information reaches them.

## News selection
Select articles in this order: 1) events directly altering the player's strategic situation; 2) nearby/strategically connected foreign events; 3) major regional events; 4) major world events; 5) lower-confidence intelligence and rumors. Avoid omniscient reporting. World state may contain facts the player does not know.

## Historical 1444 test mode
Initialize a 1444 world from the Historix / CLIOPATRA / CLIOPATRIA reference layer where available, then process the first explicit time leap using autonomous logic.
Historical events may occur because initialized conditions make them plausible, but the engine must not force them merely because a real historical date matches.
The test asks whether a 1444 starting world naturally produces a historically grounded but divergent living world.
Record both historical baseline evidence and simulation-generated events/state changes. The test succeeds only if news articles, named actors, and numerical consequences agree.
