import fs from "node:fs";
import path from "node:path";
import { buildVisualPrompt } from "./visual-intelligence.mjs";
import { generateRunwayShot } from "./runway.mjs";

const input=path.resolve(process.argv[2]||new URL("../documentary.json",import.meta.url).pathname);
const out=path.resolve(process.argv[3]||"./dist/runway");
const doc=JSON.parse(fs.readFileSync(input,"utf8"));fs.mkdirSync(out,{recursive:true});
for(const scene of doc.scenes){
  const spec=buildVisualPrompt(scene);
  const result=await generateRunwayShot({promptText:spec.prompt,ratio:"16:9",duration:Math.min(15,Math.max(5,scene.durationSeconds>10?10:scene.durationSeconds)),model:process.env.RUNWAY_MODEL||"gen4.5"});
  fs.writeFileSync(path.join(out,scene.id+".json"),JSON.stringify({scene,result},null,2));
  console.log(scene.id,result.output?.[0]||result.taskId);
}
