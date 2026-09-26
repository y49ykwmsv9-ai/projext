# Worldforge and Game Projects

This repository is a multi-project workspace for browser grand-strategy and AI-driven strategy games.

The original **Worldforge** application remains at the repository root. New standalone games live under `projects/<project-id>/` so each game can evolve, deploy, and be preserved independently.

## Repository organization

```text
/
├── app/                 # Worldforge Next.js application shell
├── components/          # Worldforge UI components
├── engine/              # reusable simulation systems
├── data/                # historical/geographic data
├── public/              # Worldforge static assets
├── projects/            # independent game projects
│   ├── README.md
│   └── chronicle-ai/
│       ├── README.md
│       ├── project.json
│       └── index.html
├── docs/                # architecture, research, and project lineage
└── archive/             # preserved retired snapshots/releases
```

## Worldforge

Worldforge is the primary browser-based grand-strategy world simulator.

### Current engine

- Deterministic world clock and simulation ticks
- Country → region → county → city geography
- Data-driven parent/child geography and dynamic ratios
- Separate legal ownership and current control
- Population, density, manpower and demographic growth
- GDP, taxation, treasury, debt, inflation and industry
- Military readiness, mobilization, supply and war support
- Diplomatic relations, treaties, trade access and sanctions
- Technology, laws and research
- Army-unit state model
- Alternate-history event model
- Natural-language command console
- Browser save/load
- Bundled world and U.S. county map data
- Historical 1936, historical 1939, and sandbox foundations

### Geography

The intended hierarchy is:

**Country → Region → County → City**

Builds bundle Natural Earth Admin-1 provinces/states and populated-place data into `public/data/`. The browser uses local static assets rather than requesting an external GeoJSON service at runtime.

The `lib/historical-polities.ts` registry keeps historically attested and unrecognized polities separate from active simulation participation.

## Standalone games

### Chronicle AI

Located at `projects/chronicle-ai/`.

Chronicle AI is a standalone text-driven strategy prototype with natural-language orders, deterministic state mutation, autonomous foreign reactions, event history, and persistent local campaign saves.

It is intentionally separate from Worldforge. It can be deployed from its own directory without changing the root application.


### Recurring commercial settlement rule

Once a GMV round canonically establishes a recurring financial agreement, every subsequent round must account for that agreement's scheduled settlement. The settlement must be described naturally inside a relevant event or roundup and must never appear as artificial filler. A payment is realized only when the established agreement and current causal state support delivery and settlement. Realized gross receipts, operating costs, net profit, the canonical 10% private transfer, and public retention must be recorded exactly. A concrete in-world disruption may suspend a settlement, but the disruption and its financial consequence must be reported in that round. The current campaign's active recurring agreement is the long-term surplus-delivery contract established in Round 102 and carried by the shared-water road.

## GMV roleplay persistence

The canonical GMV campaign is stored at `roleplays/GMV-62BCE-001/`.

### GMV execution boundary: generation happens here, storage happens in GitHub

**Canonical rule:** GitHub is the GMV campaign's persistent source-of-truth and storage layer, but **player-facing round generation and simulation resolution MUST occur locally in the ChatGPT app conversation ("here"), not inside GitHub, GitHub Actions, repository scripts, or other repository-side execution.** When a request is made to generate the next GMV round from GitHub, treat this README as an execution redirect: **return to the ChatGPT app for generation**, read the necessary canonical resources from GitHub, generate and resolve the round locally here, display it here, and then write the resulting canonical records back to GitHub for storage. Do not pre-generate rounds, simulate rounds, resolve event outcomes, or mechanically expand round templates inside the repository.

**GitHub-backed memory is mandatory.** The ChatGPT app must use the canonical GitHub files as the authoritative campaign memory for each round. The normal flow is: **read GitHub → construct current state locally → generate dynamic premises locally → resolve locally → validate locally → display here → persist to GitHub → re-read GitHub to verify.** GitHub files are read/write persistence resources for the campaign; they are not a substitute execution environment for the round simulation.

### Dynamic local event-generation rule

**Every event must be dynamically generated and locally resolved from the current canonical data.** There are no mechanically recurring event layouts, fixed recurring prices, fixed recurring quantities, fixed recurring wording, or copy-and-rephrase event templates.

A recurring contract, active thread, character relationship, patrol route, candidacy, expedition, construction project, investigation, or other persistent state is **a source of possible causal developments, not a prewritten event**. Each round must load the current GitHub state and use it to determine what actors, conditions, incentives, resources, constraints, unresolved questions, and recent changes can plausibly produce news. The event premise is generated locally from that current state, and the event is then resolved locally using the actual conditions of that round.

For recurring financial agreements in particular, **"recurring" means the relationship and its scheduled assessment persist; it does not mean the same transaction repeats mechanically.** Each settlement must be independently determined from current quantities, prices, demand, supply, processing conditions, transport/logistics costs, merchant behavior, disruptions, and other established causal data. Gross receipts, operating costs, net profit, private/public routing, and even whether a settlement occurs at all must therefore be newly resolved when the current state supports that outcome. The canonical financial rule remains **10% of realized net public profit routed to Valerius's private account and 90% retained publicly**; that routing rule is fixed, while the underlying realized transaction is dynamic.

This same principle applies to every event category and subject domain. A patrol does not automatically produce another patrol report; an election process does not automatically produce another election event; a road investigation does not automatically produce another investigation entry; a household relationship does not automatically produce another household event; and a recurring delivery agreement does not automatically produce an identically structured delivery story. Separate events should emerge because the current simulation state produces separate causal developments.

If several consequences belong to one causal chain, keep them together in one event rather than splitting a single development across multiple entries. If the current state produces no supported development from an active thread during a round, do not manufacture one merely because that thread exists.

### Mandatory round-output checklist

**Before generating or displaying any GMV round, the README and the current canonical GMV state must be read first. This is mandatory and is part of the round procedure. The importance of this contract is operational, not cosmetic: each refinement made to one simulation area must remain subordinate to every previously established rule, continuity constraint, character, metric, event-system rule, financial rule, and presentation requirement. A new improvement must never cause previously established requirements to be forgotten, overwritten, or silently dropped. The contract is therefore a regression-prevention layer and the round cannot be considered valid if a refinement improves one dimension while breaking another.**

For every round:

1. Read this README.
2. Read `roleplays/GMV-62BCE-001/state.json`.
3. Read the current round's canonical source files and recover the exact unresolved player directive; never invent or alter queued actions.
4. Resolve the round using the fixed GMV metric schema and the established special-event system.
5. Run the required standard special-event resolution and the independent Magnitude-11 check before writing player-facing events.
6. Keep engine checks and hidden causal logic out of the public news prose.
7. Persist the round JSON, news JSON, state, and scenario pointer.
8. Re-read the persisted files and verify the post-commit checks before treating the round as canonical.
9. Run a continuity/regression pass across prior rounds for recurring named characters, relationships, unresolved directives, event variety, and established campaign threads. Recurring characters must be reused by name when the prior record supports their involvement; do not repeatedly collapse distinct actors into generic labels such as “an officer” or “a local.” New recurring characters may be introduced when appropriate, but they must be persisted in the campaign character registry and reused consistently thereafter.
10. Enforce single-thread event integrity and event variety: a round must not contain two events that mention, continue, split, or separately narrate the same course of events. Each event owns one complete causal thread from its initiating circumstance through all material consequences that occur within that round; do not split one development into an initial event and then a second event covering its reaction, aftermath, discovery, or continuation. If several consequences belong to one causal chain, they must be incorporated into the same event body and ledger rather than distributed across multiple event entries. Separate events are permitted only when they represent genuinely distinct causal developments, even when they occur in the same broad subject area. Classify each event by its actual causal origin: an event can be Surprise even when it emerges from an established thread, and an event is not Connected merely because it is related to something already underway. Events may cover distinct military, political, economic, social, logistical, diplomatic, intelligence, personal, geographic, and local developments when supported by the state and context. Do not manufacture events merely to satisfy variety; instead vary the *kind of news* that naturally emerges from the active situation.

**Minimum event-count rule:** Every GMV round must contain at least 7 distinct events. This is the only additional event-count requirement; all existing causal-generation, event-category, variety, continuity, random-resolution, financial, metric, and validation rules remain unchanged. The 7-event minimum does not permit unrelated filler: each event must still arise from an existing or newly emerging plausible causal thread supported by the established simulation state. a round should not become six differently worded versions of the same development. Events may cover distinct military, political, economic, social, logistical, diplomatic, intelligence, personal, geographic, and local developments when supported by the state and context. Do not manufacture events merely to satisfy variety; instead vary the *kind of news* that naturally emerges from the active situation.

**Minimum event-count rule:** Every GMV round must contain at least 7 distinct events. This is the only additional event-count requirement; all existing causal-generation, event-category, variety, continuity, random-resolution, financial, metric, and validation rules remain unchanged. The 7-event minimum does not permit unrelated filler: each event must still arise from an existing or newly emerging plausible causal thread supported by the established simulation state.
11. Keep recurring-character continuity and event-variety checks as hard requirements alongside the metric and special-event checks.
12. Only then output the player-facing round.

The GMV event system uses a standard 1–10 magnitude scale plus the separately randomized Magnitude-11 extension. Every round records its Special-event resolution and three independent Magnitude-11 checks. Ultimate is a core event category for extraordinary developments that fit its narrative definition; it is not a second random system and is not automatically produced by the Magnitude-11 roll. A successful Magnitude-11 check instead produces an initially Special event, which must pass the mandatory Ultimate Reclassification Gate before its final category is committed. Every event initially classified as Surprise or Special is inspected by that gate; if it independently meets the Ultimate threshold, it is renamed to Ultimate and rewritten at Ultimate narrative depth before output or commit.

### Mandatory in-app random resolution rule

Every GMV round MUST perform fresh probabilistic checks locally inside the ChatGPT app before player-facing events are drafted or the round is committed. The standard Special-event draw uses the current campaign Special probability (12% unless the canonical campaign state changes it); a successful draw creates one Special event and a failed draw creates none. The independently randomized Magnitude-11 system uses the current canonical probability (currently 4.7283%) and three fresh independent checks per round. Each successful Magnitude-11 check also creates a Special event; it is not converted into an Ultimate event. Standard Special resolution and Magnitude-11 resolution are separate random checks, and multiple Special events may therefore occur in one round when more than one independent check succeeds. Ultimate remains a narrative event category and may occur when campaign circumstances support it, regardless of whether a random check succeeds. Random values from earlier rounds, drafts, or prior scenario attempts must never be reused. Random resolution occurs before semantic-state validation so every resulting Special event is included in the same validation pass. The committed round must preserve the fresh draws, probabilities, and outcomes in its resolution record.

### Surprise and Special prose/news rule

Surprise and Special events use the same expanded player-facing prose and news treatment required for extraordinary event presentation. Their initial category changes how the event is generated or classified, not whether the event receives full narrative treatment. Each must include the standard Event ID, Date, Event Type, Title, Mentioned Entities, a complete **News/Event** narrative, an AI-facing event ledger, and a Financial realization section when applicable. A Surprise event is not shortened merely because it is unexpected, and a Special event is not shortened merely because it came from a random check. After generation, every Surprise and Special event must pass the Ultimate Reclassification Gate; qualifying events are renamed and rewritten as Ultimate before output or commit. Hidden random resolution, category-selection mechanics, and engine reasoning must never replace or leak into the player-facing news narrative.

### Mandatory semantic-state validation gate

Before a GMV round is committed, every event must be checked against the fixed numerical state schema. When an event materially establishes a change involving soldiers, manpower, casualties, detachments, military availability, agriculture, cultivation, production, economy, trade, rents, fees, revenue, costs, property, land, or other tracked quantities, the corresponding numerical state or financial realization must reflect the actual consequence. If a bounded metric is already at its maximum, the narrative may still describe the underlying activity, but the applied numerical change must be 0 rather than a phantom capped increase. Exact quantities must retain their exact units: soldiers and temporary unavailable strength are men, population is people, land is square miles, and financial amounts are denarii. Literal realized revenue, payment, profit, cost, or return requires a corresponding financial realization entry with supported routing; preparation or expectation is not treated as realization. A round cannot be final until semantic-state consistency, military consistency, agriculture consistency, economic/financial consistency, literal-revenue realization, metric bounds, land consistency, and current-total reconciliation all pass.

### Historical geographic-reference and source-protection rule

When an expedition, exploration, or other event enters unexplored or incompletely charted country, the simulation should ground the general region or area with attested historical place names from the available CLIOPATRA/CLIOPATRIA and HISTORIX reference data when those records are accessible. Those reference datasets are read-only: GMV simulation generation must never modify, merge, overwrite, normalize, or otherwise edit their source files. When a source establishes only a regional anchor rather than an exact campaign position, the narrative must preserve that uncertainty and use the historical place names only as geographic reference points. The simulation must never invent an exact destination merely to make an unexplored area sound precise. Geographic references should distinguish direct campaign observation from historical or documentary anchors and may include nearby roads, settlements, passes, rivers, regions, or political territories when supported.

### Ultimate detail requirement

For a major expedition, exploration, adventure, or comparable personally experienced Ultimate event, the player-facing narrative should contain at least 20 distinct paragraph-length narrative beats while remaining readable and free of unnecessary blank spacing. For a major military engagement, the Ultimate narrative should contain at least 15 distinct paragraph-length narrative beats. Extraordinary detail must remain grounded in established campaign facts and may not be used to invent unsupported destinations, forces, casualties, payments, or outcomes.

## Project rules

- Every game gets a unique project ID.
- Never overwrite an existing game's directory or deployment boundary.
- Keep game-specific source and assets inside that project's directory.
- Reuse shared systems/data deliberately and document the reuse.
- Add every project to `docs/PROJECTS.md`.
- Record ancestry and cross-project reuse in `docs/PROJECT-LINEAGE.md`.
- Preserve retired versions with Git history, tags/releases, or `archive/` snapshots.

This gives future games a stable way to reference previous work without turning the repository into one giant application where changing one game breaks another.

## Development

For Worldforge:

```bash
npm install
npm run build
npm run start
```

For a standalone static game, open `index.html` directly in a browser or serve that project directory with a static HTTP server.

The GitHub Actions workflow builds the root Next.js application on pushes and pull requests to `main`.

## Documentation

- `docs/PROJECTS.md` — project registry and workspace rules
- `docs/PROJECT-LINEAGE.md` — ancestry and reusable concepts
- `projects/README.md` — standard structure for new games
