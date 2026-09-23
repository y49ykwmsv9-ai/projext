# Project Registry

The repository is a multi-project workspace. The root application and every game project have separate source and deployment boundaries.

## Repository map

| Area | Purpose |
|---|---|
| `app/` | Worldforge Next.js application shell |
| `components/` | Worldforge UI components |
| `engine/` | Reusable Worldforge simulation systems |
| `data/` | Reusable historical and geographic data |
| `projects/` | Independently runnable game projects |
| `docs/` | Cross-project architecture, lineage, and research |
| `archive/` | Preserved retired snapshots and releases |

## Current projects

| Project ID | Location | Role |
|---|---|---|
| `worldforge` | repository root | Primary grand-strategy engine/application |
| `chronicle-ai` | `projects/chronicle-ai/` | Standalone natural-language strategy prototype |
| `historix-renderer` | `projects/historix-renderer/` | External documentary scene/video renderer using GitHub Actions |

## Project isolation

Each project owns its own entrypoint, UI, presets/scenarios, game state, resolver, assets, deployment configuration, and documentation.

A project may consume shared engine/data/research components, but it must not silently modify another project's implementation.

## Creating a new game

Create:

```text
projects/<unique-project-id>/
├── README.md
├── project.json
└── <project source>
```

Then add the project to this registry, record its ancestry in `docs/PROJECT-LINEAGE.md`, keep its deployment target independent, and preserve completed versions with Git history, tags/releases, or `archive/` snapshots when appropriate.

## Cross-project references

Future games can explicitly reference earlier projects by project ID in `project.json`:

```json
{
  "lineage": ["worldforge", "chronicle-ai"]
}
```

This makes previous mechanics and research discoverable without merging unrelated deployment targets.

## Deployment

Static projects can be deployed directly from their project directory. The Worldforge root remains a separate Next.js application.
