# Chronicle Documentary Engine

A reproducible historical-documentary pipeline for Chronicle AI. It converts a structured chronology into narrated scenes using repository geography, the existing Cliopatria preparation pipeline, procedural maps/graphs, optional Runway-generated illustrative media, and FFmpeg assembly.

The pipeline separates historical evidence, simulation output, and illustrative generated media. It does not copy the branding or distinctive graphics package of any specific documentary channel.

Run: `node src/generate-documentary.mjs --input documentary.json --output dist`

With AI visual planning: `RUNWAY_API_KEY=... node src/generate-documentary.mjs --input documentary.json --output dist --ai`

The full one-hour MP4 is generated as a build artifact rather than committed to Git. Git is excellent at source control and terrible at pretending binary video files are source code.