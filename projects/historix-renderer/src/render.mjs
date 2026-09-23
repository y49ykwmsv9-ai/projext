import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
const root=path.resolve(process.cwd());
const cfg=JSON.parse(fs.readFileSync(path.join(root,"config/documentary.json"),"utf8"));
const manifestPath=path.join(root,"dist/scene-manifest.json");
if(!fs.existsSync(manifestPath)) spawnSync(process.execPath,[path.join(root,"src/build-manifest.mjs")],{stdio:"inherit"});
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const dist=path.join(root,"dist"); fs.mkdirSync(dist,{recursive:true});
const ffmpeg=process.env.FFMPEG||"ffmpeg";
const duration=manifest.scenes.reduce((s,x)=>s+x.seconds,0);
const output=path.join(root,cfg.output);
const safeTitle=cfg.title.replace(/[:']/g," ");
const filter=[
"color=c=black:s="+cfg.resolution.width+"x"+cfg.resolution.height+":r="+cfg.fps,
"drawtext=fontcolor=white:fontsize=54:x=(w-text_w)/2:y=(h-text_h)/2:text='Historix Documentary Renderer'",
"drawtext=fontcolor=white:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2+90:text='"+safeTitle+"'",
"drawtext=fontcolor=gray:fontsize=22:x=(w-text_w)/2:y=h-80:text='Repository-rendered master'",
"format=yuv420p"].join(",");
const args=["-y","-f","lavfi","-i",filter,"-t",String(duration),"-c:v","libx264","-preset",process.env.FFMPEG_PRESET||"veryfast","-crf",process.env.FFMPEG_CRF||"23","-pix_fmt","yuv420p",output];
console.log("Rendering",manifest.title,"for",duration,"seconds");
const r=spawnSync(ffmpeg,args,{stdio:"inherit"});
if(r.status!==0) process.exit(r.status??1);
fs.writeFileSync(path.join(dist,"render-report.json"),JSON.stringify({title:manifest.title,targetDurationMinutes:manifest.targetDurationMinutes,renderedDurationSeconds:duration,output:path.relative(root,output),renderer:"ffmpeg",status:"complete"},null,2));
console.log("Rendered:",output);
