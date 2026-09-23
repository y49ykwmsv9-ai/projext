# Documentary Scene Baseline v2

This is the **global visual and production baseline for every scene in the Reconquista documentary and every future historical documentary scene built by this renderer**. It is not a specification for the 711 CE sample only.

The 711 CE scene is a QA reference scene, not the definition of the system.

## Quality bar

The target is polished animated historical-documentary mapping: cinematic camera motion, strong geographic readability, layered terrain, restrained typography, purposeful route animation, clear temporal change, and one consistent visual language across the film.

A scene must feel like documentary footage, not a static SVG with animated decorations.

## Non-negotiable rules

1. Scene-first, not illustration-first. Every scene is timed with keyframes, camera state, visual layers, narration timing, and provenance.
2. Geography carries the shot. Coastlines, relief, valleys, rivers, passes, islands, and settlement relationships remain coherent during camera movement.
3. Terrain has depth. Shaded relief, elevation treatment, atmospheric perspective, coastline separation, water depth cues, and lighting variation are required. Flat country polygons alone fail.
4. Camera motion is cinematic. Use eased pans, pushes, pulls, tracking moves, and controlled zooms. No linear motion, abrupt jumps, arbitrary shaking, or constant motion.
5. Motion has narrative purpose. Routes move because something moves. Borders change because territory changes. Camera movement reveals geographic causality.
6. One dominant visual idea at a time. Secondary geography holds while the narrated event changes.
7. Labels are editorial. Only narratively relevant labels are visible, with collision avoidance, priority, decluttering, consistent typography, and camera-aware scaling.
8. Military graphics have hierarchy. Armies, fleets, fortifications, and battle markers have recognizable silhouettes/symbols, scale, direction, staging, and movement.
9. Temporal geography is explicit. Political boundaries and control states correspond to the scene date and source record.
10. Uncertainty is visible but quiet. Approximate, contested, reconstructed, and illustrative claims use the provenance vocabulary below.
11. Transitions are motivated. Scene-to-scene continuity preserves anchors, palette, label grammar, entity IDs, and camera logic.
12. No giant HUD by default. Documentary UI must not compete with the geography.
13. Render at production resolution. Browser preview is a preview, not the final visual target.
14. Generated imagery is never historical evidence. Historical facts remain data-driven.
15. Every scene passes the visual QA gate before production status.

## Canonical layer stack

1. Atmosphere, sky, sea, haze and seasonal lighting
2. Base geographic surface
3. Shaded relief / elevation
4. Terrain features and mountain systems
5. Hydrology
6. Temporal political geography
7. Roads, passes, bridges and ports where supported
8. Settlements and fortifications
9. Military/naval formations
10. Events and battle/siege geography
11. Campaign, migration, trade or communication routes
12. Camera-relative highlights and focus treatment
13. Editorial labels and dates
14. Provenance/uncertainty marks
15. Minimal title/lower-third treatment
16. Film grain, vignette and final color grade

## Motion grammar

### Camera
- Keyframe-based interpolation.
- Smooth easing by default.
- Establishing shot before dense action.
- Slow push/pan during exposition.
- Faster but readable movement during transitions.
- Geographic focus changes synchronized to narration.
- Start and end on held frames.

### Routes
- Draw-on or reveal animation with directional flow.
- Speed tied to narrative timescale.
- Route geometry follows plausible geography rather than straight lines through terrain unless supported.
- Troop, fleet, migration, or messenger movement may travel along the route.

### Borders
- Do not animate every boundary simultaneously.
- Reveal only the political change being explained.
- Hold the previous arrangement long enough to be understood.

### Events
- Build spatially: approach -> concentration -> event -> aftermath.
- Battle/siege markers maintain real relationships to rivers, cities, passes, coasts, and fortifications.
- Event markers do not obscure the geography that explains the event.

## Geographic authority

CLIOPATRIA/CLIOPATRA is the primary historical/geographic reference layer.

HISTORIX is the reconciliation and provenance layer. It must not silently overwrite CLIOPATRIA geometry or historical claims.

Conflicting claims remain attributable and uncertainty is preserved instead of being collapsed into an unsupported single fact.

## Provenance vocabulary

- HIGH CONFIDENCE: solid geometry/marker.
- APPROXIMATE: softened/dashed route or marker and small APPROXIMATE treatment when needed.
- CONTESTED: outlined marker with concise CONTESTED treatment.
- RECONSTRUCTED: distinct but restrained reconstruction treatment.
- ILLUSTRATIVE: explicitly marked as illustrative and never presented as source-derived evidence.

## Continuity

The same entity keeps a stable:
- entity ID
- color family
- label treatment
- symbol family
- geographic anchor
- uncertainty state unless the source record changes

The viewer should be able to understand a later scene using visual knowledge learned earlier.

## Rendering architecture

The renderer is a layered compositing system, not a collection of hand-authored one-off SVG illustrations.

Required capabilities:
- high-resolution raster/vector compositing
- real geographic geometry
- precomputed or procedural shaded relief
- camera transforms
- keyframe interpolation
- animated routes and entities
- label collision management
- temporal boundary states
- deterministic scene manifests
- frame-by-frame rendering
- video assembly
- automated visual QA
- reproducible renders

SVG can remain an input/output layer for clean vector elements, but an SVG-only scene is not sufficient for the production target.

## Global QA fail conditions

A scene fails when:
- terrain reads as flat infographic geometry
- camera movement is linear, abrupt, or purposeless
- route animation looks like a glowing line pasted onto a static map
- labels collide, stack, or dominate
- political boundaries are temporally wrong or unexplained
- military/naval entities lack geographic relationships
- too many elements animate simultaneously
- visual hierarchy is unclear
- geography disappears during camera movement
- required provenance is missing
- there is no clean opening or closing hold
- the result looks like an SVG mockup rather than documentary footage
- browser preview is treated as final broadcast output

## 711 CE QA reference

The first validation sequence must demonstrate the Strait of Gibraltar, surrounding coasts, Iberian relief, rivers/crossings, Gibraltar, Córdoba, Toledo, Seville, military/naval staging, historically grounded political geography, reconstructed campaign route, the approximate/debated Guadalete event, synchronized camera and movement, restrained overlays, and HISTORIX/CLIOPATRIA provenance.

Passing 711 CE does not exempt any later scene from this baseline.

## Future-scene contract

Every new scene uses the same manifest schema, layer stack, motion grammar, provenance system, continuity rules, and QA gate.

No one-off visual system may be introduced merely to make an individual shot look finished.

The documentary must read as **one coherent animated historical atlas**, not a collection of unrelated maps.
