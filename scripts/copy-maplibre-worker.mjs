import {copyFileSync,mkdirSync} from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";
const root=process.cwd(), req=createRequire(import.meta.url);
const dist=path.join(path.dirname(req.resolve("maplibre-gl/package.json")),"dist");
const out=path.join(root,"public","maplibre"); mkdirSync(out,{recursive:true});
for(const f of ["maplibre-gl-worker.mjs","maplibre-gl-shared.mjs"]) copyFileSync(path.join(dist,f),path.join(out,f));