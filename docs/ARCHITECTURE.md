# Worldforge architecture

The simulation state is separate from the rendering layer. UI components dispatch commands; the engine mutates a serializable WorldState; the map renders territory geometry plus controller state.

## Territory layers
1. Country and map unit
2. Dependencies and constituent countries
3. Provinces
4. Strategic regions
5. Cities and industrial nodes
6. Disputed and occupied overlays

Controller and legal owner are separate so territorial control can change without rewriting geography.

## Simulation domains
- demographics: births, deaths, migration, urbanization, literacy
- economy: GDP, treasury, debt, taxation, inflation, trade
- industry: civilian and military factories, construction queues, resources
- infrastructure: roads, rail, ports, supply hubs, power
- politics: government, parties, laws, legitimacy, stability, unrest
- diplomacy: relations, treaties, trade agreements, guarantees, access
- intelligence: networks, reconnaissance, counterintelligence, deception
- military: formations, equipment, commanders, fronts, combat, supply, occupation
- air and naval operations
- technology and doctrines
- events and alternate-history branches
- AI strategic goals and operational planning

## Map data
Map geometry is a build-time dependency and should be bundled into the application. Natural Earth publishes public-domain country and administrative datasets; its 10m admin-1 dataset contains more than 4,500 internal divisions. The game will transform that source into compact application data and preserve provenance in a data manifest.
