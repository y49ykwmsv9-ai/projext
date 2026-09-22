import fs from "node:fs";
import path from "node:path";
import { createMapSvg } from "./render-map.mjs";
import { createGraphSvg } from "./render-graph.mjs";
import { buildVisualPrompt } from "./visual-intelligence.mjs";

const args=process.argv.slice(2);
const arg=(n,d)=>{const i=args.indexOf(n);return i>=0&&args[i+1]?args[i+1]:d};
const input=path.resolve(arg("--input",new URL("../documentary.json",import.meta.url).pathname));
const out=path.resolve(arg("--output","./dist")); const ai=args.includes("--ai");
const doc=JSON.parse(fs.readFileSync(input,"utf8")); fs.mkdirSync(out,{recursive:true});
for(const d of ["frames","prompts","ffmpeg"]) fs.mkdirSync(path.join(out,d),{recursive:true});
const manifest={title:doc.title,edition:doc.edition,targetDurationSeconds:doc.targetDurationSeconds,generatedAt:new Date().toISOString(),scenes:[]};
for(const s of doc.scenes){const dir=path.join(out,"frames",s.id);fs.mkdirSync(dir,{recursive:true});let frame;
if(s.type==="map") frame=createMapSvg(s,doc.format); else frame=createGraphSvg(s,doc.format);
const framePath=path.join(dir,"frame.svg");fs.writeFileSync(framePath,frame);
const prompt=buildVisualPrompt(s);fs.writeFileSync(path.join(out,"prompts",s.id+".json"),JSON.stringify(prompt,null,2));
manifest.scenes.push({id:s.id,type:s.type,durationSeconds:s.durationSeconds,frame:framePath,narration:"Scene narration placeholder. Replace with the reviewed script before publication.",sources:s.sources||[],aiVisual:ai});}
fs.writeFileSync(path.join(out,"manifest.json"),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(out,"narration.txt"),manifest.scenes.map(s=>"["+s.id+"]\n"+s.narration).join("\n\n"));
fs.writeFileSync(path.join(out,"ffmpeg","concat.txt"),manifest.scenes.map(s=>"file '"+s.frame.replaceAll("'","'\\''")+"'\nduration "+s.durationSeconds).join("\n")+"\n");
console.log("Generated "+manifest.scenes.length+" scenes for "+doc.title+"; target duration "+doc.targetDurationSeconds+" seconds.");
