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
