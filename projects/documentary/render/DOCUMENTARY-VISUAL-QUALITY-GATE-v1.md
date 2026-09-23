# Documentary Visual Quality Gate v1

This gate applies to the **outside/production build and every future scene**, not only the 711 CE sample.

## Reference bar

The production target is polished animated historical-documentary mapping. Public examples and current map-animation workflows emphasize cinematic camera movement, animated routes, controlled labels, temporal clarity, layered geography, and sequences paced to narration. Kings and Generals' long-form medieval-history videos are used as a quality reference for animated historical storytelling, not as a source of branding or copied artwork.

## Pass criteria

A render passes only when all of these are true:

### Geography
- [ ] Real historical geography drives the composition.
- [ ] Relief, coastline, water, rivers, passes, and settlement relationships read immediately.
- [ ] Camera movement preserves spatial continuity.
- [ ] Political geography matches the scene date.
- [ ] Geographic detail increases appropriately when the camera pushes in.

### Geographic geometry integrity
- [ ] Every named major geographic and political object has geometry appropriate to its historical extent and scene date.
- [ ] Political entities are recognizable territorial shapes, not generic polygons or decorative silhouettes.
- [ ] Coastlines, rivers, mountains, straits, islands, and other physical features retain their actual spatial relationships.
- [ ] Routes and event markers remain anchored to the geography they explain.
- [ ] Simplification preserves recognizable shape, adjacency, relative extent, and historically relevant boundaries at the current camera scale.
- [ ] Internal lines represent documented geographic/historical features rather than decorative filler.

### Cinematic rendering
- [ ] Terrain has visible depth and controlled lighting.
- [ ] Atmospheric perspective separates foreground, middle distance, and background.
- [ ] Camera uses eased keyframes rather than linear movement.
- [ ] Opening and closing frames can be held cleanly.
- [ ] No arbitrary shaking or gratuitous motion.
- [ ] Color, typography, symbols, and lighting remain consistent with the global baseline.

### Historical animation
- [ ] Routes follow geography and have directional movement.
- [ ] Military/naval assets have scale, direction, staging, and plausible spatial relationships.
- [ ] Border changes are staged rather than all moving simultaneously.
- [ ] Events build spatially from approach to action to aftermath.
- [ ] Approximate, contested, reconstructed, and illustrative claims are explicitly represented.

### Editorial design
- [ ] Only narratively useful labels are visible.
- [ ] Label collisions are automatically prevented.
- [ ] Titles and dates are compact and consistent.
- [ ] No oversized HUD or dashboard obscures the map.
- [ ] Visual hierarchy makes the narrated subject obvious within seconds.

### Production
- [ ] Scene is generated from a structured manifest.
- [ ] Scene is reproducible.
- [ ] High-resolution frame rendering is available.
- [ ] Video assembly is part of the production path.
- [ ] Browser preview is not treated as the final render.
- [ ] Automated QA reports the scene as PASS.

## Automatic FAIL conditions

Any one of these fails the scene:

- generic or low-complexity placeholder geography used for a major historical place or polity
- flat polygon map with decorative contour lines used as a substitute for terrain
- glowing route pasted over otherwise static geography
- labels overlapping or clustering
- camera jumps, linear camera motion, or meaningless zooming
- arbitrary icons without geographic scale or context
- political territories rendered as generic six-sided/rectangular/circular blobs
- decorative internal lines that do not correspond to real geographic or historical features
- major routes or events floating independently of their underlying geography
- modern borders presented as historical without disclosure
- unsupported historical certainty
- all layers animating simultaneously
- giant interface panels competing with the scene
- no opening/closing hold
- scene looks like an SVG mockup rather than documentary footage

## Build policy

The outside/production build must enforce this gate globally. A sample scene may demonstrate the gate, but it must not be the only scene subject to it.

The renderer must reject or mark non-production any scene that does not reference the global scene baseline and required QA checks.

## Human review

Automated checks cannot judge the entire aesthetic result. A human review frame must additionally answer:

1. Does the geography look like a place rather than a diagram?
2. Does the camera move through the place rather than over a flat picture?
3. Can the viewer understand what changed without reading every label?
4. Does the movement explain the narration?
5. Does the scene look like part of the same documentary as the previous and next scenes?

If the answer to any of these is no, the scene is not production-ready.
