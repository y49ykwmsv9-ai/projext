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

## GMV roleplay persistence

The canonical GMV campaign is stored at `roleplays/GMV-62BCE-001/`.

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
10. Ensure event variety: a round should not become six differently worded versions of the same development. Events may cover distinct military, political, economic, social, logistical, diplomatic, intelligence, personal, geographic, and local developments when supported by the state and context. Do not manufacture events merely to satisfy variety; instead vary the *kind of news* that naturally emerges from the active situation.
11. Keep recurring-character continuity and event-variety checks as hard requirements alongside the metric and special-event checks.
12. Only then output the player-facing round.

The GMV special-event system uses a standard 1–10 magnitude scale plus the separately randomized Magnitude-11 extension. Every round records its special-event resolution and three independent Magnitude-11 checks.

### Mandatory in-app random resolution rule

Every GMV round MUST perform fresh probabilistic checks locally inside the ChatGPT app before player-facing events are drafted or the round is committed. The Special-event draw uses the current campaign Special probability (12% unless the canonical campaign state changes it); success creates exactly one Special event and failure creates none. The independently randomized Magnitude-11 system uses the current canonical probability (currently 4.7283%) and three fresh independent checks per round. Special and Magnitude-11 are separate systems. Random values from earlier rounds, drafts, or prior scenario attempts must never be reused. Random resolution occurs before semantic-state validation so any resulting event is included in the same validation pass. The committed round must preserve the fresh draws, probability, and outcomes in its resolution record.

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
