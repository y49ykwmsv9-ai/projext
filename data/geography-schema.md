# Worldforge four-tier geography

Worldforge uses exactly four gameplay geography categories:

1. **Country** — sovereign states, constituent countries, dependencies, or scenario-defined political countries.
2. **Region** — first-level internal divisions such as Indiana, Bavaria, England, or a scenario's equivalent.
3. **County** — the next administrative layer below a region. Where a country does not use counties, the source's closest second-level administrative unit is mapped to this category.
4. **City** — cities, towns, and other populated places that the scenario chooses to make individually interactable.

The hierarchy is data-driven:

country -> region -> county -> city

Every entity stores its parent, children, geometry key, area, population, source code, controller and owner. The engine calculates ratios from those real child entities rather than assuming a fixed number of counties or cities.

## Dynamic ratios

For each entity the engine derives:
- children per parent
- population share of its parent
- area share of its parent
- population density
- an urbanization proxy

These ratios drive economic capacity, infrastructure demand, recruitment, construction, logistics, and UI detail.

## Example: Indiana

Indiana is represented as one **Region** belonging to the United States **Country**. Its source hierarchy supplies its counties as **County** entities and its mapped populated places as **City** entities beneath the appropriate county. The game therefore does not invent a generic “20 counties / 100 cities” rule; it renders whatever the selected map vintage actually contains.

For the United States, Natural Earth provides Admin-1 state geometry, while its 10m Admin-2 dataset supplies U.S. counties and its populated-places dataset supplies city/town points. citeturn0search1

For example, the Census Bureau's Indiana reference material documents 92 counties and 681 places for its 2010 geography vintage, illustrating why the game needs a source-vintage-aware hierarchy rather than a universal ratio. citeturn0search24
