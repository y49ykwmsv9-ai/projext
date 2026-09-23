# HISTORIX / CLIOPATRIA Documentary Design Pass v2

## Purpose
This pass deepens the Reconquista documentary renderer while preserving a strict distinction between historical evidence and generated visual interpretation.

## Authority stack
1. **Cliopatria**: authoritative baseline for historical polity entities, political geography, and temporal polity slices.
2. **HISTORIX**: provenance/reconciliation layer. It links documentary entities, preserves source metadata, detects conflicts, and carries uncertainty.
3. **Named secondary references**: Wikidata, Encyclopaedia Britannica, and the New Cambridge Medieval History provide identifiers, contextual scholarship, and cross-checks.
4. **Generated imagery**: visual illustration only. It is never promoted to historical evidence.

## Design passes
- Geography and coastline fidelity
- Political-boundary continuity by date
- Terrain relief and natural corridors
- Capital/city/fortress hierarchy
- Animated campaign routes
- Battle and siege markers
- Camera choreography and map transitions
- Atmospheric depth and period texture
- Label collision avoidance
- Date/title continuity
- Source and uncertainty badges

## Historical rendering rules
- A reconstructed route is visibly marked **RECONSTRUCTED**.
- A disputed location is visibly marked **CONTESTED** or **APPROXIMATE**.
- An illustrative contextual route is visibly marked **ILLUSTRATIVE**.
- Conflicting historical claims remain attributed rather than being silently merged.
- Political fills come from the authoritative temporal polity layer, not from AI-generated art.

## Reconquista scene requirements
The 711 opening should establish Gibraltar, the Guadalete area, Córdoba and Toledo with a clear temporal rail and a restrained campaign route. The following scenes should preserve geographic continuity while progressively changing political layers and adding cities, battles, sieges, rulers and routes. The final Granada sequence should distinguish the siege chronology, Santa Fe camp, Granada, and the Alhambra without implying that generated cinematic imagery is archival evidence.

## QA gate
A render passes only when:
- all scene anchors resolve;
- all political entities resolve against the pinned Cliopatria baseline;
- all events have provenance;
- all route certainty states are rendered correctly;
- labels do not collide with major markers;
- chapter-to-chapter geography remains continuous;
- no visual-generation artifact is presented as a sourced historical fact.
