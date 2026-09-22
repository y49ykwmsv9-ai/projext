import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const atlasPath = path.join(root, "projects/documentary/data/cliopatria-plus/reconquista-atlas.json");
const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));

const byId = new Map();
for (const group of ["polities","places","events","routes","people"]) {
  for (const item of atlas[group] ?? []) {
    if (byId.has(item.id)) throw new Error(`Duplicate atlas id: ${item.id}`);
    byId.set(item.id, item);
  }
}

const errors = [];
for (const p of atlas.polities ?? []) {
  if (!p.cliopatria?.candidates?.length) errors.push(`Polity ${p.id} has no Cliopatria candidates`);
}
for (const place of atlas.places ?? []) {
  const c = place.geometry?.coordinates;
  if (!Array.isArray(c) || c.length !== 2 || !Number.isFinite(c[0]) || !Number.isFinite(c[1])) errors.push(`Invalid coordinates: ${place.id}`);
}
for (const route of atlas.routes ?? []) {
  for (const [placeId] of route.points ?? []) {
    if (!byId.has(placeId)) errors.push(`Route ${route.id} references missing place ${placeId}`);
  }
}
for (const event of atlas.events ?? []) {
  if (!byId.has(event.placeId)) errors.push(`Event ${event.id} references missing place ${event.placeId}`);
  for (const participant of event.participants ?? []) {
    if (!byId.has(participant)) errors.push(`Event ${event.id} references missing participant ${participant}`);
  }
}
for (const anchor of atlas.sceneAnchors ?? []) {
  for (const id of anchor.entityIds ?? []) {
    if (!byId.has(id)) errors.push(`Scene ${anchor.sceneNumber} references missing entity ${id}`);
  }
}

if (atlas.sceneAnchors?.length !== 40) errors.push(`Expected 40 scene anchors, found ${atlas.sceneAnchors?.length ?? 0}`);

const report = {
  dataset: atlas.datasetId,
  schemaVersion: atlas.schemaVersion,
  counts: Object.fromEntries(["polities","places","events","routes","people","sceneAnchors"].map(k => [k, atlas[k]?.length ?? 0])),
  validatedAt: new Date().toISOString(),
  errors
};

const out = path.join(root, "projects/documentary/data/cliopatria-plus/reconquista-atlas.validation.json");
fs.writeFileSync(out, JSON.stringify(report, null, 2));
if (errors.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
