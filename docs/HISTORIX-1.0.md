# HISTORIX 1.0

HISTORIX is the historical knowledge layer for the Chronicle/History Crawler projects.

## 1.0 release definition

HISTORIX 1.0 is a **production baseline**, not a claim that every fact about every human society has already been digitized. Its hard completeness guarantee is the pinned Cliopatria polity baseline.

### Verified baseline

- **1,583 / 1,583 unique Cliopatria POLITY entities imported**
- **2,216 polity resources generated** including the existing seed/expansion corpus
- collision-safe deterministic resource IDs
- temporal/spatial records preserved
- provenance-aware schema
- automated completeness validation
- lazy resource access
- GitHub Actions build and artifact generation

## Data model

HISTORIX treats the historical world as a graph of:

- polities
- events
- people
- places
- observations
- relations
- territorial snapshots

Numerical observations are date-scoped and can carry lower/upper bounds, units, confidence and source identifiers.

## Source policy

The primary geographic/political baseline is Cliopatria. The repository also registers Seshat, Maddison Project Database, Clio-Infra and Correlates of War sources for later adapters. Redistribution follows each upstream dataset's license.

## Runtime principle

The application must never import the entire library into the browser merely to answer one historical query. Resources are fetched by stable ID and cached locally.

## 1.1 expansion path

1. event graph
2. people and rulers
3. historical places
4. predecessor/successor and interaction relations
5. population/economic/military observations
6. source reconciliation and uncertainty propagation
7. spatial/temporal simulation integration
8. documentary timeline/map generation

The core schema is deliberately stable so these layers can be added without replacing the polity foundation.
