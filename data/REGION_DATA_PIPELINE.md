# Geographic data pipeline

The repository will store processed geographic data as application assets so the running game does not need to download GeoJSON.

## Pipeline

1. Acquire a licensed/public-domain source dataset.
2. Normalize every source feature into one of the four categories: country, region, county, city.
3. Generate stable IDs from source + source code.
4. Build parent/child relationships.
5. Calculate area, population and dynamic ratios.
6. Simplify geometry at multiple zoom levels.
7. Emit compact JSON/typed arrays into the repository.
8. Keep a manifest containing source, vintage, license/provenance and transformation version.

## Detail behavior

- World zoom: country polygons and major labels.
- Regional zoom: country + region polygons.
- County zoom: region + county polygons.
- Local zoom: county + city points/footprints.
- Selection always resolves to the underlying entity, regardless of zoom.

Natural Earth's 10m Admin-1 source contains 4,500+ first-order internal divisions, while its Admin-2 counties dataset is limited to the United States and its populated-places dataset supplies city/town points. citeturn0search0turn0search1

The source is processed at build time; runtime gameplay reads only the bundled output.


## Global county-view requirement

Every country in the game must expose a county-level gameplay view. The data pipeline therefore treats the four categories as gameplay abstractions, not as a claim that every country legally calls its second-level divisions “counties.” For each country, source administrative subdivisions are normalized into the **County** category while preserving their real local names and source administrative level/type in metadata.

The hierarchy is therefore:
Country → Region (first-level subdivision) → County (second-level subdivision) → City (populated place)

Where a source has no second administrative level, the pipeline creates a data-backed county-equivalent layer from the finest authoritative subdivision available rather than inventing arbitrary polygons. Where a country has multiple administrative tiers, the source level used for County is recorded in the manifest so the game can preserve the real terminology in the UI.

Natural Earth 10m Admin-1 covers over 4,500 first-order divisions across countries, but its Admin-2 product is U.S.-only. A truly global county-equivalent layer therefore requires a global administrative source such as geoBoundaries, which publishes global ADM1 and ADM2 datasets and individual-country files. citeturn0search0turn0search7
