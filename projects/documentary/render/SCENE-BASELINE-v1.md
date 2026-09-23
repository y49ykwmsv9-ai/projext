# Documentary Scene Baseline v1

This document defines a **scene** for the Reconquista documentary renderer. The previous 711 SVG mockup is no longer the visual baseline. Every new scene must be generated from the layered model below.

## Scene definition

A scene is a temporally bounded, geographically anchored audiovisual composition in which historical data, spatial relationships, uncertainty, camera choreography, narration, and visual layers are synchronized.

A scene is not a single image, map, or SVG.

## Required scene layers

1. **Atmosphere**: sky/sea/seasonal light, haze, film grain, depth cues.
2. **Terrain**: coastline, elevation, mountain systems, valleys and relief.
3. **Hydrology**: rivers, lakes, crossings and navigable water.
4. **Temporal political geography**: historically appropriate political entities and boundaries for the scene date.
5. **Settlement hierarchy**: capitals, major cities, fortresses, ports and relevant settlements.
6. **Infrastructure**: roads, passes, bridges, ports and other causally relevant infrastructure when supported.
7. **Military/naval entities**: formations, fleets, concentrations, movement and staging.
8. **Event geography**: battles, sieges, crossings, negotiations and other spatial events.
9. **Campaign routes**: animated paths with explicit provenance and reconstruction status.
10. **Camera choreography**: establishing shot, geographic transition, tracking movement, focal event and exit/transition.
11. **Documentary information layer**: date rail, title, concise contextual text, visual key and provenance.
12. **Uncertainty/provenance layer**: approximate, contested, reconstructed and illustrative claims must be visually distinguished.
13. **Continuity layer**: persistent geographic anchors, labels, colors, symbols and entity IDs shared across scenes.

## Data authority

- **CLIOPATRIA/CLIOPATRA** is the primary historical/geographic reference layer.
- **HISTORIX** is the reconciliation and provenance layer.
- Conflicting claims are retained with attribution and uncertainty.
- Generated imagery is never treated as evidence.
- Reconstructed routes and approximate event locations must remain explicitly marked.

## Visual standard

The target is a cinematic historical atlas, not a flat infographic. Terrain must have visible depth; geographic features must form a coherent landscape; movement must occur through geography; settlements and fortifications must have hierarchy; labels must avoid collisions; and the camera must communicate spatial causality.

## 711 CE sample requirements

The baseline sample scene must depict the North Africa-to-Iberia crossing and subsequent inland campaign context, including:

- Strait of Gibraltar and surrounding coast
- Iberian terrain and major relief systems
- rivers
- Gibraltar, Córdoba, Toledo and relevant settlement hierarchy
- military/naval staging
- reconstructed campaign route
- Guadalete event marker with approximate/debated status
- temporal political geography
- HISTORIX reconciliation and CLIOPATRIA provenance
- animated movement and documentary overlays

## Renderer contract

A renderer should consume a structured scene manifest rather than hand-authoring a one-off illustration. The long-form documentary is composed by chaining scenes that share entity IDs, geographic anchors, visual vocabulary and provenance metadata.
