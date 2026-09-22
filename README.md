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

For a standalone static game, open its `index.html` or serve that project directory with a static HTTP server.

The GitHub Actions workflow builds the root Next.js application on pushes and pull requests to `main`.

## Documentation

- `docs/PROJECTS.md` — project registry and workspace rules
- `docs/PROJECT-LINEAGE.md` — ancestry and reusable concepts
- `projects/README.md` — standard structure for new games
