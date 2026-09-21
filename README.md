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

The repository contains the data-pipeline specification for transforming public-domain geographic sources into bundled application assets. Runtime gameplay is intended to require no external GeoJSON download.

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
