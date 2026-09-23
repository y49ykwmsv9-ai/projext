import fs from "node:fs";
import path from "node:path";
const root=path.resolve(process.cwd());
const cfg=JSON.parse(fs.readFileSync(path.join(root,"config/documentary.json"),"utf8"));
const out=path.join(root,"dist/scene-manifest.json");
fs.mkdirSync(path.dirname(out),{recursive:true});
const scenes=[
{id:"opening",seconds:30,title:cfg.title,narration:"A chronological opening establishes Iberia as a connected political, geographic, and cultural system before the main timeline begins.",visual:"Animated relief map of Iberia with a chronological date marker and major geographic regions."},
{id:"timeline",seconds:Math.max(60,cfg.targetDurationMinutes*60-90),title:"Chronological Timeline",narration:"The main sequence is generated from repository historical records and expanded into dated scenes.",visual:"Animated historical map, event markers, place labels, and source cards."},
{id:"closing",seconds:60,title:"Closing Synthesis",narration:"The documentary closes by connecting the places, people, conflicts, institutions, and long-term changes established by the timeline.",visual:"Iberian map receding into a chronological network of places and events."}
];
fs.writeFileSync(out,JSON.stringify({generatedAt:new Date().toISOString(),title:cfg.title,targetDurationMinutes:cfg.targetDurationMinutes,scenes},null,2));
console.log(out);
