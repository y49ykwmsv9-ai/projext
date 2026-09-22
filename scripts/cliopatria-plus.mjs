import fs from "node:fs";
import path from "node:path";

const atlasPath = path.join(process.cwd(), "projects/documentary/data/cliopatria-plus/reconquista-atlas.json");

export function loadReconquistaAtlas() {
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  const entities = new Map();
  for (const group of ["polities","places","events","routes","people"]) {
    for (const entity of atlas[group] ?? []) entities.set(entity.id, entity);
  }
  return { ...atlas, entities };
}

export function resolveSceneEntities(atlas, sceneNumber) {
  const anchor = atlas.sceneAnchors?.find(a => a.sceneNumber === sceneNumber);
  if (!anchor) throw new Error(`No Cliopatria+ atlas anchor for scene ${sceneNumber}`);
  return anchor.entityIds.map(id => {
    const entity = atlas.entities.get(id);
    if (!entity) throw new Error(`Scene ${sceneNumber} references missing atlas entity ${id}`);
    return entity;
  });
}
