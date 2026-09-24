# Chronicle Memory Roleplay Engine

**Project ID:** `chronicle-memory`

Chronicle Memory is an isolated alternate-history roleplay and simulation project. It is designed around a chat-first interaction: the player chooses a preset, role, and starting date, then gives natural-language commands. The actual game output is returned in the conversation. GitHub stores the rules, schemas, historical reference structure, and supporting code, but it is **not** the player's required output channel.

The project is intentionally separate from Worldforge, Chronicle AI, and Historix Renderer. It may **read** shared historical data, but its scenario state, resolver, memory graph, and runtime logic are owned by this directory.

## Roleplay operating rules

These rules are mandatory for every game session.

### 1. Every response reports the current round and date

Every substantive game response must begin with the current simulation clock:

```text
Round: 12
Date: 14 March 1066
```

The exact format may be styled differently in the eventual UI, but both **Round** and **Date** must always be present.

The round number is the simulation turn counter. It increments whenever the player advances time. It does not mean a fixed historical unit such as a month or year.

### 2. The player controls time advancement

The player decides how far the simulation moves forward.

Examples:

- `move 1 week`
- `move 1 month`
- `move 1 year`
- `move 10 years`
- `move 3 months`
- `move 17 days`
- `move 2 years and 6 months`

The engine must parse ordinary language equivalents such as:

- `advance a year`
- `skip ahead five years`
- `let six months pass`
- `continue for one decade`
- `move forward until 1100`

A time-advance command changes the simulation clock, increments the round, applies accumulated demographic/economic/military/diplomatic processes, resolves autonomous actor behavior, creates relevant events, recalculates statistics, and then reports what happened.

The engine must **not** advance the calendar merely because the player issued an ordinary action. If the player says `build a harbor`, that action is resolved at the current date unless its wording explicitly includes a passage of time or the action's modeled completion requires future processing.

### 3. Natural-language commands must cause game logic

The player should be able to speak normally rather than use a rigid command language.

Examples:

- `Raise taxes on the merchants.`
- `Build a defensive wall around the capital.`
- `Send an envoy to the neighboring kingdom and propose a trade agreement.`
- `Recruit 2,000 additional soldiers.`
- `Try to secretly fund rebels in the province.`
- `Move the army toward the northern border.`
- `I want to make the capital the center of regional trade.`
- `Order my commanders to prepare for an invasion without declaring war.`

The engine must interpret the command into game logic. A response such as `Okay!` followed by no state change is invalid behavior.

For each actionable instruction, the resolver should determine as appropriate:

1. **Who** is acting.
2. **What** they are attempting.
3. **Who or what** is affected.
4. **Where** it occurs.
5. **When** it occurs or how long it takes.
6. **Required resources and prerequisites.**
7. **Probability or feasibility**, where uncertainty is meaningful.
8. **Immediate state changes.**
9. **Delayed effects.**
10. **Reactions by other actors.**
11. **Unintended or second-order consequences.**
12. **Events and causal links** created by the action.

The assistant should reason through the action rather than merely acknowledge it.

### 4. Every meaningful action changes or tests state

An instruction may:

- succeed;
- partially succeed;
- fail;
- be delayed;
- produce an unintended outcome;
- trigger a reaction;
- create a new opportunity;
- consume resources without achieving the intended result;
- create a persistent project that resolves over later rounds.

The outcome must be reflected in the simulation state.

For example, if the player orders construction of a harbor, the engine should not simply say that construction began. It should determine or update relevant values such as:

- treasury cost;
- available labor;
- construction capacity;
- material requirements;
- expected completion date;
- trade capacity;
- employment;
- population effects;
- food/logistics implications;
- neighboring reactions;
- the harbor's eventual capacity.

### 5. Numbers are first-class game state

The simulation must maintain exact numerical values for modeled variables once they have been established in the scenario.

If the player asks:

> How many people live in my capital?

the response should return the current simulation value, for example:

```text
Capital population: 137,842
```

That number must not be freshly invented on every turn.

A numerical state should have a ledger conceptually equivalent to:

```text
current value
= starting value
+ recorded positive changes
- recorded negative changes
+ modeled growth/decay
```

Useful tracked quantities can include:

- population;
- births and deaths;
- immigration and emigration;
- households;
- treasury;
- tax revenue;
- production/output;
- food supply;
- prices;
- trade volume;
- infrastructure capacity;
- manpower;
- military strength/readiness;
- military casualties;
- naval capacity;
- stability;
- legitimacy;
- diplomatic relations;
- territorial control;
- resource stocks.

The exact variables depend on the selected scenario and historical period.

**Important distinction:** an exact number in the simulation means exact within the modeled alternate timeline. It does not claim that an uncertain historical estimate is literally known to the exact person.

### 6. Statistics must interact causally

The engine should not maintain disconnected numbers.

Examples:

```text
Population -> tax base -> treasury
Population -> manpower
Infrastructure -> production/trade capacity
Trade -> income -> treasury
Conscription -> manpower -> labor availability
Labor shortage -> production -> food prices
Food shortage -> mortality/migration/unrest
Military mobilization -> treasury + food + labor consumption
War -> casualties + trade disruption + migration + political effects
```

When a player changes one important variable, the engine should consider the systems that logically depend on it.

### 7. The simulation remembers its own history

Once an action has happened in the alternate timeline, later turns use that result.

The engine must not silently revert to the real historical timeline.

For example:

1. The player prevents a historical war.
2. The scenario records the changed diplomatic and military conditions.
3. Several rounds later, the real-world historical war date arrives.
4. The engine does **not** automatically create that war simply because it happened in reality.

Canonical history is context. The scenario's accumulated state is the authority for the alternate timeline.

### 8. Characters and AI actors act independently

The player is not the only source of action.

Other characters, governments, factions, institutions, armies, merchants, religious organizations, cities, and populations should respond according to their:

- interests;
- resources;
- information;
- institutions;
- relationships;
- geography;
- prior experiences;
- current scenario conditions.

They should not possess information the simulation has not made available to them.

The player should therefore encounter consequences, opportunities, rumors, resistance, diplomacy, economic changes, and unexpected developments that were not directly commanded.

### 9. Hidden information remains hidden when appropriate

The engine should distinguish between:

- what the player knows;
- what the player's character knows;
- what other actors know;
- what actually happened;
- what is merely suspected or rumored.

Secret actions should not automatically become public knowledge.

Historical context may inform the assistant's reasoning, but it should not be exposed as omniscient information when the player's role would not reasonably know it.

### 10. Historical data is the baseline, not a script

A preset establishes historical conditions at the selected starting date, including where supported:

- population;
- geography;
- institutions;
- technology;
- economics;
- military capacity;
- political relationships;
- people;
- historical events;
- cities and infrastructure.

Once the player acts, the simulation branches.

The engine must not force real-world events merely because the calendar reaches the date on which they happened historically.

### 11. Historical values and simulation values remain separate

A historical source may provide an estimate such as a population range.

The scenario can convert that into a starting modeled value using documented assumptions. After the scenario starts, subsequent changes belong to the simulation.

Conceptually:

```text
Historical source estimate
        ↓
Scenario initialization
        ↓
Simulation value
        ↓
Recorded changes over time
        ↓
Current alternate-history value
```

The response should be able to distinguish historical evidence from scenario-derived numbers when that distinction matters.

### 12. Uncertainty must be represented honestly

Sparse historical data, disputed claims, and estimated statistics should carry uncertainty/provenance.

The engine may use modeled values when necessary, but it should not pretend that an estimate is a directly observed historical fact.

Once a scenario establishes a numerical value, however, that value becomes authoritative for subsequent simulation calculations unless a later event explicitly changes it.

### 13. Every turn follows a resolution pipeline

For an ordinary player command:

```text
Player instruction
    ↓
Interpret plain language
    ↓
Identify actor / target / location / intent
    ↓
Check current state and prerequisites
    ↓
Calculate immediate effects
    ↓
Calculate delayed effects
    ↓
Resolve autonomous reactions
    ↓
Update numerical state
    ↓
Create event memory
    ↓
Update causal graph
    ↓
Update statistics
    ↓
Generate narrative response
    ↓
Report Round + Date + Results
```

For a time advance:

```text
Player time command
    ↓
Parse requested duration
    ↓
Advance calendar
    ↓
Increment round
    ↓
Process ongoing projects
    ↓
Apply demographic/economic/systemic changes
    ↓
Resolve autonomous actors
    ↓
Generate relevant events
    ↓
Update numerical state
    ↓
Update causal graph and memory
    ↓
Report Round + Date + Results
```

### 14. Responses should describe actual consequences

A normal game response should tell the player what occurred, not merely repeat their instruction.

For example, instead of:

> You ordered the army north. Okay!

the engine should resolve movement using available roads, terrain, supply, unit readiness, weather where modeled, enemy activity, and other relevant conditions, then report the resulting position, time/cost, intelligence, and reactions.

For major events, narrative detail should scale with significance. Small routine changes can be concise. Wars, coups, economic crises, major construction, diplomatic breakthroughs, disasters, and other consequential events should receive substantially more detailed reporting.

### 15. The chat is the game interface

The player should not need to open GitHub, a dashboard, or an external database to receive game results.

The intended interaction is:

```text
Player -> natural-language command -> assistant resolves simulation -> assistant returns result in chat
```

GitHub is the project's persistent engineering/reference layer. The conversation is the gameplay interface.

## Example session

```text
Round: 1
Date: 1 January 1066

Player:
I want to increase taxes on wealthy merchants and use the money to expand the capital's defenses.

Engine:
Interprets the instruction as a tax-policy change plus a defense construction program.

It calculates the affected merchant population, expected revenue, political resistance, construction cost, available labor, and completion schedule.

The tax change takes effect immediately. Construction begins if prerequisites are met. The resulting values are stored in scenario state.

Player:
move 1 year

Engine:
Advances the simulation by one year, processes the construction project, applies economic and demographic changes, resolves reactions, and reports the resulting events.

Round: 2
Date: 1 January 1067

Capital population: 139,214
Treasury: 48,620 silver
Fortification project: 71% complete
Merchant approval: -8
Military readiness: +4%
```

The exact values above are illustrative only. In a real session they must come from the scenario state and calculation ledger.

## Memory layers

- **Canonical history:** sourced facts and observations from shared repository data.
- **Scenario seed:** selected preset, role, date, constraints, and initial state.
- **World state:** current values for polities, places, populations, economies, militaries, diplomacy, institutions, and other modeled systems.
- **Event memory:** resolved actions, reactions, discoveries, wars, treaties, economic changes, demographic changes, and other meaningful events.
- **Causal graph:** links between actions, conditions, events, actors, places, and outcomes.
- **Uncertainty ledger:** confidence and provenance for claims and estimates.
- **Derived knowledge:** statistics calculated from the current alternate timeline.
- **Narrative memory:** compact context required for coherent roleplay.

## Historical grounding

The project is designed to consume the repository's historical data architecture, including the CLIOPATRA/CLIOPATRIA-derived historical corpus and existing geography/statistics systems where appropriate. Shared data remains read-only from this project's perspective.

The dataset is primarily a reference and memory aid. The assistant's reasoning is the active simulation layer during chat gameplay. The project should therefore avoid pretending that every gameplay decision must be delegated to an external database or service.

## Initial project structure

```text
projects/chronicle-memory/
├── README.md
├── project.json
├── data/
│   ├── presets.json
│   └── schema/
│       └── scenario.schema.json
└── src/
    └── ENGINE-CONTRACT.md
```

Future runtime code belongs under this directory. Do not place scenario state in shared `data/` directories unless a dataset is intentionally promoted to repository-wide historical infrastructure.

## Isolation rules

- Never modify another project as part of a Chronicle Memory feature.
- Treat shared historical data as an input dependency.
- Keep scenario saves and generated alternate-history records project-local.
- Record provenance for imported historical facts.
- Keep real history and alternate-history state distinguishable in every record.
- Prefer append-only event memory so prior decisions remain auditable.
- Do not make GitHub the required gameplay output channel.
- Do not replace the conversational simulation with acknowledgement-only responses.
- Do not advance time unless the player explicitly advances it or an already-established game mechanic requires a modeled internal date transition.


## Historix / CLIOPATRA / CLIOPATRIA reference access

Chronicle Memory should make the repository's historical knowledge layer easy for the assistant to consult during gameplay. The historical database is a **reference and evidence layer**, not a separate game master.

The intended lookup priority is:

1. **Current scenario state**: once the alternate timeline establishes a value, that value is authoritative for the scenario.
2. **Historix / CLIOPATRA / CLIOPATRIA repository data**: use it for historical people, places, polities, dates, populations, geography, institutions, military information, economic context, relationships, and documented events.
3. **Other repository historical datasets**: use compatible sources when they add non-duplicate information.
4. **Reasoned simulation estimates**: when the available historical record is incomplete, derive a plausible value from known inputs and clearly treat it as an estimate.
5. **Explicit uncertainty**: when neither evidence nor a defensible estimate is available, state the uncertainty rather than inventing fake precision.

The assistant should be able to use this reference layer while responding in chat without requiring the player to manually open the database.

### Evidence labels

Material information should be mentally classified as one of:

- **Historical fact**: directly supported by repository/source material.
- **Historical estimate**: a documented or sourced estimate.
- **Simulation value**: established by the current alternate timeline.
- **Derived value**: calculated from simulation state and known formulas.
- **Educated estimate**: a reasoned value created because historical data is incomplete.
- **Uncertain**: insufficient evidence to make a defensible determination.

The final roleplay does not need to clutter every sentence with labels, but the engine's internal memory should preserve the distinction.

## The player versus a living world

Chronicle Memory is fundamentally a **player-versus-world simulation**, not a player-versus-script simulation.

The player's nation, faction, character, or polity is competing for survival, prosperity, influence, security, and continuity against other actors that have their own objectives.

Other nations are not decorative background characters waiting for the player to act.

They should:

- pursue their own strategic interests;
- expand or contract when circumstances permit;
- negotiate, threaten, deceive, trade, spy, rebel, migrate, colonize, reform, or go to war where plausible;
- respond to the player's successes and failures;
- exploit weaknesses in the player's position;
- form alliances and counter-alliances;
- suffer their own internal crises;
- make mistakes;
- learn from previous events;
- experience technological, demographic, economic, military, environmental, and political change;
- sometimes make decisions that have nothing to do with the player.

This means the world should continue moving even when the player does nothing strategically significant.

### World pressure

Every scenario should contain some combination of persistent pressures appropriate to its period:

- demographic growth or decline;
- food and resource constraints;
- fiscal pressure;
- disease;
- climate and environmental shocks where historically relevant;
- technological change;
- succession disputes;
- factional conflict;
- religious or cultural tensions;
- trade competition;
- migration;
- military threats;
- diplomatic competition;
- internal rebellion;
- administrative limitations.

These pressures should create opportunities and threats without becoming a random-event slot machine.

## Reporting other nations in player responses

The assistant should routinely tell the player what is happening beyond their own borders when those developments are relevant.

A response may include sections such as:

```text
Round: 8
Date: 17 September 1082

YOUR REALM
- ...

ELSEWHERE
- Kingdom A has begun mobilizing...
- City B is experiencing a grain shortage...
- Kingdom C is negotiating with Kingdom D...

CONSEQUENCES
- ...

INTELLIGENCE / RUMORS
- ...
```

The amount of information should scale with the time advanced and the significance of world events.

A one-week advance may reveal a few nearby developments. A one-year advance may reveal substantial political, economic, demographic, military, and diplomatic changes across multiple regions.

The assistant should prioritize:

1. developments that directly affect the player;
2. developments involving nearby or strategically relevant actors;
3. major regional events;
4. major global events;
5. lower-confidence rumors or distant developments when they are interesting and useful.

The player should not receive omniscient information merely because the assistant knows it. Information must be filtered through the player's role, communications, geography, intelligence, trade links, diplomatic contacts, and period-appropriate information speed.

## Genuine data versus educated guesses

The world should feel historically grounded without pretending that incomplete historical records contain perfect statistics.

When reporting another nation's activity:

- use genuine historical/repository data when it exists;
- use current simulation data when the scenario has already established the relevant value;
- use calculated consequences when they follow from the simulation;
- use an educated guess when necessary;
- never disguise an educated guess as a documented historical fact.

For example:

```text
Historical basis:
The repository records a strong trading relationship between X and Y.

Simulation inference:
Given the player's embargo, reduced trade access is likely to hurt X's revenue.

Scenario estimate:
X's treasury falls by approximately 6% this year.

New simulation state:
X responds by seeking alternative suppliers and opening negotiations with Z.
```

Once the scenario establishes the new treasury value, subsequent calculations use that simulation value rather than repeatedly re-estimating it from scratch.

## Difficulty: challenging, fair, and survivable

The game should be **fun and difficult without being impossible**.

The engine must not reward every sensible player decision with automatic success. A strong decision can still fail because of:

- limited resources;
- poor timing;
- enemy action;
- incomplete information;
- terrain;
- weather;
- political resistance;
- administrative capacity;
- economic constraints;
- technological limitations;
- unreliable allies;
- internal factions;
- unexpected but plausible events.

Likewise, a risky decision should sometimes work.

Difficulty should emerge from the world rather than arbitrary punishment.

### No player favoritism

The engine must not quietly make the simulation easier because the player is the protagonist.

If the player makes a strategically poor decision, the world should exploit it when other actors could reasonably identify and act upon the weakness.

If an AI nation has an obvious opportunity to attack, negotiate from strength, seize a market, support a rebellion, or undermine the player, it should have a reasoned chance to do so.

The player can succeed because they made good decisions, adapted to changing conditions, took calculated risks, or benefited from circumstances. They should not succeed merely because the game wants the story to continue.

### No impossible AI

Other nations should also have limitations.

AI actors should not:

- know everything;
- perfectly predict the player's intentions;
- always choose the optimal strategy;
- instantly mobilize enormous forces;
- ignore logistics;
- conjure resources;
- coordinate perfectly across distant territories;
- recover instantly from disasters.

The world should contain competent opponents with human-like limitations, not omniscient supercomputers wearing medieval hats.

### Difficulty should adapt to the situation, not cheat

The engine may naturally increase pressure as the player's power grows because stronger powers attract competitors, balancing coalitions, resistance, internal opposition, and resource demands.

That is different from spawning arbitrary enemies solely to punish success.

A successful player should face **new strategic problems**, not a hidden difficulty slider that declares they have had too much fun.

## Survival and failure

Survival is a meaningful objective.

Possible outcomes include:

- prosperity;
- stagnation;
- partial success;
- territorial loss;
- economic decline;
- political crisis;
- civil war;
- vassalization;
- regime change;
- fragmentation;
- exile;
- conquest;
- collapse;
- recovery after disaster;
- unexpected resurgence.

Failure should be possible, but the engine should distinguish between:

- **recoverable setbacks**, where the player still has meaningful choices;
- **terminal failure**, where the player's role or polity genuinely ceases to exist.

When terminal failure occurs, the alternate timeline should continue. The player may be able to continue as a successor, faction, surviving state, dynasty, rebel movement, neighboring polity, or other historically plausible actor if the scenario permits it.

## World-state requirements

At minimum, the simulation should maintain enough information to reason about:

- every active polity relevant to the scenario;
- territory and important locations;
- population;
- economy and resources;
- military capability;
- political institutions;
- leadership and succession;
- diplomacy and relationships;
- alliances and rivalries;
- active projects;
- current conflicts;
- internal factions;
- information/intelligence known by each actor;
- recent events;
- long-term causal relationships.

The player state is only one part of this world state.

## Design target

The intended experience is:

```text
Historical knowledge
       +
Persistent numerical simulation
       +
Independent nations
       +
Player decisions
       +
Limited information
       +
Resource constraints
       +
Causal consequences
       +
Changing world pressures
       =
A difficult but believable alternate history
```

The core test is simple:

> If the player stopped acting for several years, would the world still change?

If the answer is no, the simulation is not sufficiently alive.


## News-driven time leaps

Every explicit time advance must produce a **news cycle**, not a dry status dump.

### 5-10 newsworthy articles per leap

The default target is **5-10 distinct news articles for every time leap**.

- 1 week: usually 5, emphasizing immediate/local developments.
- 1 month: usually 5-7.
- 1 year: usually 6-10.
- Multi-year/decade leaps: up to 10, with major events receiving more space.

The count is a presentation target, not permission to invent filler. Articles must represent distinct substantive developments. When evidence is weak, the article is clearly presented as a report, rumor, or inference.

Each newsworthy event should read like an actual historical news article: a headline followed by a substantial 5-7 sentence account covering what happened, who was involved, where it occurred, causes, consequences, and what information reached the player.

### News is simulation state

A nation mentioned in an article must be a real simulation actor, and the event must have a corresponding structured event record. The event must be able to alter state when appropriate.

Examples:

- A grain shortage changes food stocks/prices and may increase mortality, migration, and unrest.
- A mobilization consumes money and supplies while increasing military readiness and threat.
- A treaty changes diplomatic relations, trade access, and alliance obligations.
- A rebellion changes control, stability, tax collection, military deployment, and foreign incentives.
- A succession crisis changes leadership, legitimacy, faction strength, and intervention risk.

The article is therefore the **narrative view of a real state transition**, not a decorative story generated after the fact.

### Other nations must drive the news

Each relevant foreign actor gets an autonomous decision pass during a time leap. The player is one participant in a world where nations are also trying to survive.

Foreign actions may be beneficial, hostile, neutral, mistaken, opportunistic, or unrelated to the player. Their behavior must be constrained by resources, geography, institutions, intelligence, logistics, and their own existing history.

The player should routinely receive reports about foreign wars, diplomacy, economic changes, rebellions, succession crises, discoveries, disasters, migrations, and other developments when the player's information network could plausibly reveal them.

### 1444 living-world test

The first full test scenario will start in **1444** using Historix / CLIOPATRA / CLIOPATRIA and other non-duplicate repository historical data as the baseline.

The test will deliberately distinguish:

1. **Historical baseline:** what the reference material says the world looked like in 1444.
2. **Simulation state:** the exact numerical and diplomatic state established for this scenario.
3. **News:** 5-10 generated articles after each player-requested time leap.
4. **Causality:** every reported event's effects feed back into subsequent calculations.
5. **Divergence:** history may emerge naturally from conditions, but the engine never forces an event solely because it happened in real history.

The goal is a world that feels recognizably 1444 without becoming a museum exhibit. If the player does nothing, nations still act, economies still change, conflicts still develop, and the world keeps moving.



## Standardized simulation metric schema

Chronicle Memory uses one fixed metric vocabulary and fixed scales across all rounds. New rounds must not invent alternate indexes for concepts that already have a defined metric. A metric's unit and scale are part of the simulation contract.

### Core metrics

| Domain | Metric | Unit / scale | Rule |
|---|---|---|---|
| Population | population | exact people | Persistent exact count once established |
| Population | births, deaths, migration | exact people per period | Must reconcile with population changes |
| Treasury | treasury | exact currency units | Persistent exact balance |
| Economy | economic output | 0-100 | Relative modeled output condition |
| Agriculture | agricultural output | 0-100 | Relative productive condition |
| Agriculture | food stock | exact resource units | Persistent stock |
| Taxation | tax burden | 0-100 | 0 = none, 100 = maximum modeled burden |
| Infrastructure | infrastructure | 0-100 | General infrastructure condition/capacity |
| Trade | trade activity | 0-100 | Relative commercial activity |
| Diplomacy | relations | -100 to +100 | -100 hostile, 0 neutral, +100 exceptionally aligned |
| Stability | internal stability | 0-100 | 0 = collapse-level instability, 100 = highly stable |
| Legitimacy | legitimacy | 0-100 | Government/dynastic legitimacy |
| Military | total troops | exact soldiers | Conservation-controlled military population |
| Military | available troops | exact soldiers | Not committed elsewhere |
| Military | deployed troops | exact soldiers | Committed to a formation/front/location |
| Military | garrison troops | exact soldiers | Assigned to fixed defensive garrisons |
| Military | reserve manpower | exact people | Eligible manpower not yet serving |
| Military | readiness | 0-100 | Operational preparedness |
| Military | morale | 0-100 | Willingness/cohesion under pressure |
| Military | supply | 0-100 | Ability to sustain current forces |
| Military | organization | 0-100 | Command, cohesion, and unit organization |
| Military | permanent losses | exact soldiers | Deaths/irrecoverable losses; never silently restored |
| Military | temporary unavailable | exact soldiers | Wounded/sick/otherwise temporarily unavailable |
| Military | recruitment gains | exact soldiers | New troops created by a valid recruitment event |
| Military | reinforcements received | exact soldiers | Troops transferred into the force |
| War | war exhaustion | 0-100 | Cumulative modeled war strain |
| Technology | technology level | 0-100 | Relative modeled technological capability |
| Intelligence | intelligence confidence | 0-100 | Confidence in a specific intelligence assessment |

### Fixed-scale rules

1. Exact quantities remain exact. Population, treasury, troops, casualties, manpower, food stocks, and similar quantities are never replaced by abstract scores.
2. Condition metrics use their declared scale. Readiness, morale, supply, stability, legitimacy, infrastructure, trade activity, and similar conditions always use the same 0-100 scale.
3. Relations always use -100 to +100. Do not create separate friendship, hostility, diplomatic warmth, or relation indexes for the same relationship.
4. No unexplained indexes. Metrics such as "tax_rate_index", "agriculture_investment_index", and "military_expenditure_index" are legacy fields from the initial test and must not be used in new rounds.
5. Legacy migration is explicit. Existing Round 1 policy indexes are treated as legacy initialization fields. The standardized Round 2 record establishes the fixed-scale equivalents and becomes the format used from Round 2 onward.
6. Before/after/delta is mandatory. Any persistent metric changed by an event records its previous value, delta, resulting value, reason, source event, and provenance.
7. No scale switching between rounds. A readiness value of 61 means the same thing in every round. A relation score of 9 means the same thing in every round. A troop count of 12,000 means exactly 12,000 troops until another valid state mutation changes it.
8. Military conservation is mandatory. Available troops + deployed troops + garrison troops + other explicitly tracked serving buckets = total troops, subject to separately recorded temporary unavailable categories and permanent losses.
9. Battles resolve numerically before narration. Engaged troop counts, permanent losses, temporary losses, survivors, and formation locations are resolved in state first. The news article cannot invent or alter those numbers.
10. Derived metrics do not replace source metrics. A dashboard may calculate an overall indicator for display, but the underlying standardized metrics remain the authoritative state.

### Standard event state-change format

Every event that changes persistent state should use an object containing actor_id, metric, before, delta, after, unit, reason, source_event_id, and provenance. Exact quantities use explicit units such as soldiers, people, or currency_units.

### Round 2 standardized baseline

Round 2 is the first record using the permanent standardized vocabulary. The legacy Round 1 values are preserved for auditability, while Round 2 establishes the following fixed-scale values for continued replay:

- Tax burden: 53/100
- Agricultural output: 56/100
- Military expenditure condition: 54/100
- Frontier readiness: 61/100
- Asturias-Navarre relations: 9 on the -100 to +100 relations scale
- Navarre trade activity: 2/100
- Treasury: 1,018 currency units
- Total troops: 12,000 soldiers
- Available troops: 9,600 soldiers
- Frontier deployed troops: 2,400 soldiers
- Permanent military losses: 0 soldiers

From this point forward, all rounds must use the standardized metrics above and the same scales. If a new domain is genuinely required, it must be added to the schema first rather than introducing a one-off metric inside a round.


## Mandatory guideline validation gate

The README is the governing gameplay contract. It is no longer sufficient for a simulator continuation to rely on the assistant remembering these rules. The repository now contains a machine-readable guideline registry and a dependency-free validator:

- `projects/chronicle-memory/validation/guidelines.json`
- `projects/chronicle-memory/validation/validate-gmv.js`
- `.github/workflows/chronicle-memory-validation.yml`

### Required process for every GMV continuation

Before a new round is treated as canonical:

1. Resolve the explicit campaign ID `GMV-62BCE-001`.
2. Read the canonical scenario pointer and current state.
3. Confirm the requested continuation starts from the canonical latest round.
4. Resolve the next round's date from the player's explicit time command; do not advance time merely because an ordinary action was issued.
5. Interpret the player instruction into actor, action, target, location, timing, prerequisites, resources, uncertainty, immediate effects, delayed effects, reactions, unintended consequences, and causal links.
6. Resolve the simulation state before writing narrative.
7. Resolve autonomous actors subject to their resources, geography, institutions, information, logistics, and prior history.
8. Keep hidden information separated by actor; distinguish fact, estimate, inference, rumor, and simulation value.
9. Apply only the fixed metric vocabulary and fixed scales. Legacy indexes cannot appear in new rounds.
10. Record persistent state changes with `before`, `delta`, `after`, `unit`, `reason`, `source_event_id`, and `provenance`.
11. Reconcile exact quantities, especially population, treasury, food, manpower, troop buckets, casualties, and land area.
12. Resolve battles numerically before any article is written.
13. Generate the news cycle only from the resolved event/state records. Do not add decorative events whose underlying state does not exist.
14. Ensure every news event maps to a real simulation event and every reported actor is a real scenario actor.
15. Preserve alternate-history divergence. Historical dates are context, never automatic commands to reproduce real-world outcomes.
16. Run the validator. A failed hard check means the round is **not canonical** and must not be presented as the next authoritative state.
17. Commit the validated round records, then update the canonical pointer only after the round passes validation.
18. Re-run validation after the final commit/update.

### Mechanical checks now enforced

The validator checks, at minimum:

- canonical scenario ID and round/date synchronization;
- canonical round/news file existence and parity;
- sequential round numbering and gaps;
- fixed metric schema and 0–100 condition scales;
- -100 to +100 relations;
- rejection of legacy metric indexes;
- event IDs, dates, types, headlines, and substantive article length;
- news/event one-to-one coverage;
- special-event magnitude bounds;
- event-ledger arithmetic against running totals;
- financial reconciliation;
- land-area metric/holdings synchronization;
- military conservation when explicit troop buckets exist;
- supported information/event types;
- basic guards against scripted-history language;
- canonical-pointer protection against continuing from a non-current round.

### Two-layer validation

Some README requirements are structural and can be mechanically rejected. Others require simulation reasoning and are therefore represented as mandatory process checks rather than pretending a static JSON linter can prove them.

**Hard repository checks:** identity, chronology, state/news parity, metric scales, legacy-metric rejection, event ledgers, financial/land consistency, military conservation, and canonical-pointer integrity.

**Simulation-contract checks:** natural-language interpretation, causal interactions, autonomous actor reasoning, information boundaries, historical-vs-simulation provenance, alternate-history divergence, world pressure, difficulty/fairness, survival/failure, and consequence quality.

The second group must be completed by the simulation resolver before narrative generation. It must not be silently skipped merely because the JSON files are syntactically valid.

### Candidate-round rule

Existing historical/legacy round records may be preserved for auditability. **New rounds must conform to the standardized event state-change format.** A continuation is not considered complete until every persistent metric mutation can be traced through a state-change ledger with before/delta/after values and provenance.

### Performance rule

Validation is designed to be fast and dependency-free. It uses local repository records and indexed campaign files rather than searching unrelated projects or re-reading the entire historical corpus for every event. Historical lookup remains a reference layer; current scenario state remains authoritative once established.

### Failure behavior

If a canonical pointer, chronology, metric scale, ledger, conservation equation, event/news relationship, or other hard invariant fails, the process must stop rather than guessing, reconstructing, or silently repairing the campaign. The correct response is to identify the missing/conflicting record and resolve that conflict before simulation continues.
