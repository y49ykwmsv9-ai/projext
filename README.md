# Worldforge

Worldforge is a browser-based grand-strategy world simulator built as a persistent TypeScript/Next.js application.

## Current engine

- Deterministic world clock and simulation ticks
- Four-tier geography: **country → region → county → city**
- Data-driven parent/child geography and dynamic ratios
- Separate legal ownership and current control
- Population, density, manpower and demographic growth
- GDP, taxation, treasury, debt, inflation and industry
- Military readiness, mobilization, supply and war support
- Diplomatic relations, treaties, trade access and sanctions framework
- Technology, laws and research state
- Army-unit state model
- Event state model for alternate-history systems
- Natural-language command console
- Browser save/load
- World country map and bundled U.S. county map
- Historical 1936, historical 1939 and sandbox scenario foundations

## Geography

The intended hierarchy is:

Country → Region → County → City

The engine does not assume a fixed number of children. Child counts, population shares, area shares, density and urbanization are calculated from the loaded map hierarchy.

Builds now bundle Natural Earth Admin-1 provinces/states and populated-place city data into `public/data/`. The browser reads only these local static assets; there is no runtime request to an external GeoJSON service. Countries without a first-order polygon receive a local fallback region so every mapped country remains interactable.

The separate `lib/historical-polities.ts` registry stores historical and unrecognized polities independently of simulation participation, so encyclopedia coverage can grow without inflating the active world-state. The registry is intentionally separate from playable nations and can represent extinct states, empires, breakaway governments, colonial administrations, and other historically attested polities.

## Development

```bash
npm install
npm run build
npm run start
```

The GitHub Actions workflow builds the Next.js application on pushes and pull requests to main.

## Architecture

- engine/ — deterministic simulation and commands
- data/ — scenarios and geographic-data specifications
- components/ — interactive game interface
- app/ — Next.js application shell
- docs/ — architecture and data-pipeline documentation
