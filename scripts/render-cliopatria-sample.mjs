import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root=process.cwd();
const data=JSON.parse(fs.readFileSync(path.join(root,"projects/documentary/data/sample-750-cliopatria.json"),"utf8"));
const outDir=path.join(root,"projects/documentary/build/sample");
fs.mkdirSync(outDir,{recursive:true});
const run=(cmd,args)=>execFileSync(cmd,args,{stdio:"inherit"});

if(data.year!==750)throw new Error(`Expected Cliopatria sample year 750, got ${data.year}`);
if(data.references.some(r=>!r.resolved))throw new Error("Sample contains unresolved Cliopatria references: "+data.references.filter(r=>!r.resolved).map(r=>r.key).join(", "));

const W=1280,H=720,mapX=55,mapY=108,mapW=1170,mapH=565;
const lon0=-10.8,lon1=4.7,lat0=35,lat1=44.5;
const project=(lon,lat)=>[mapX+(lon-lon0)/(lon1-lon0)*mapW,mapY+(lat1-lat)/(lat1-lat0)*mapH];
const pathGeometry=g=>{
 if(!g)return "";
 const rings=g.type==="Polygon"?g.coordinates:(g.type==="MultiPolygon"?g.coordinates.flat():[]);
 return rings.map(r=>r.map((p,i)=>{const [x,y]=project(p[0],p[1]);return (i?"L":"M")+x.toFixed(1)+","+y.toFixed(1)}).join(" ")+" Z").join(" ");
};
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const colors=["#3e6b4f","#596b45","#80633c"];
const territories=data.references.map((r,i)=>`<path d="${pathGeometry(r.geometry)}" fill="${colors[i%colors.length]}" fill-opacity=".78" stroke="#241e16" stroke-width="1.5"/>`).join("");
const points=[["CÓRDOBA",-4.78,37.89],["TOLEDO",-4.03,39.86],["GIBRALTAR",-5.35,36.14]];
const route=points.map(([_,lon,lat],i)=>{const [x,y]=project(lon,lat);return `${i?"L":"M"}${x.toFixed(1)} ${y.toFixed(1)}`;}).join(" ");
const labels=points.map(([name,lon,lat])=>{const [x,y]=project(lon,lat);return `<circle cx="${x}" cy="${y}" r="5" fill="#f5ead3" stroke="#1b1712" stroke-width="2"/><text x="${x+10}" y="${y-9}" fill="#f5ead3" stroke="#1b1712" stroke-width="4" paint-order="stroke" font-family="DejaVu Sans" font-size="17" font-weight="700">${esc(name)}</text>`;}).join("");
const [bx,by]=project(-4.78,37.89);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#7f9caf"/>
<rect x="0" y="0" width="${W}" height="96" fill="#17130f" opacity=".94"/>
<text x="45" y="43" fill="#f5ead3" font-family="DejaVu Sans" font-size="31" font-weight="700">750  •  IBERIA AT THE UMAYYAD FRONTIER</text>
<text x="45" y="72" fill="#d7c39a" font-family="DejaVu Sans" font-size="14">CLIOPATRIA TIME-SLICE • DATABASE POLITICAL GEOGRAPHY • ORIGINAL ANIMATION</text>
<rect x="35" y="105" width="1210" height="580" rx="7" fill="#d8c59d"/>
${territories}
<path d="${route}" fill="none" stroke="#c98a3d" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 9"/>
${labels}
<circle cx="${bx}" cy="${by}" r="11" fill="#9b3d2f" opacity=".82"/>
<text x="70" y="138" fill="#1b1712" font-family="DejaVu Sans" font-size="16" font-weight="700">POLITICAL GEOGRAPHY FROM CLIOPATRIA, 750 CE</text>
<g transform="translate(850 515)"><rect width="370" height="145" rx="10" fill="#17130f" opacity=".89" stroke="#d7c39a" stroke-width="2"/>
<text x="20" y="28" fill="#f5ead3" font-family="DejaVu Sans" font-size="15" font-weight="700">DATABASE-RESOLVED POLITIES</text>
${data.references.map((r,i)=>`<circle cx="28" cy="${55+i*29}" r="7" fill="${colors[i%colors.length]}"/><text x="45" y="${60+i*29}" fill="#f5ead3" font-family="DejaVu Sans" font-size="13">${esc(r.record?.Name||r.key)}</text>`).join("")}
</g>
<text x="40" y="708" fill="#f5ead3" font-family="DejaVu Sans" font-size="11">Cliopatria ${data.version} • territorial geometry: database • route/city markers: explicit documentary reconstruction</text>
</svg>`;

const svgPath=path.join(outDir,"reconquista-750-cliopatria-sample.svg");
const pngPath=path.join(outDir,"reconquista-750-cliopatria-sample.png");
fs.writeFileSync(svgPath,svg);
run("rsvg-convert",["-w","1280","-h","720","-o",pngPath,svgPath]);

const narrationPath=path.join(outDir,"narration.txt");
fs.writeFileSync(narrationPath,"By 750, the political map of Iberia reflected the western reach of the Umayyad Caliphate and the persistence of the Kingdom of Asturias in the north. The political territories shown here are resolved from Cliopatria at the 750 time slice. The moving campaign line is an explicit documentary reconstruction rather than a claim that Cliopatria records a precise marching route. The design rule is simple: database geometry supplies the historical map, while animation explains movement and chronology.");
const wavPath=path.join(outDir,"narration.wav");
run("piper",["--data-dir",path.join(root,"voices"),"--model","en_US-lessac-medium","--input_file",narrationPath,"--output_file",wavPath]);

const [sx,sy]=project(-5.35,36.14),[ex,ey]=project(-4.03,39.86);
const dx=ex-sx,dy=ey-sy;
const filter=`[0:v]zoompan=z='1.01+0.02*sin(on/65)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24,drawbox=x='${sx}+(${dx})*mod(t/20\\,1)':y='${sy}+(${dy})*mod(t/20\\,1)':w=16:h=16:color=#c98a3d@0.98:t=fill,drawbox=x='${bx}-18':y='${by}-18':w='36+12*sin(2*PI*t)':h='36+12*sin(2*PI*t)':color=#9b3d2f@0.38:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='CLIOPATRIA • 750 CE':fontcolor=#f5ead3:fontsize=17:box=1:boxcolor=black@0.45:boxborderw=8:x=55:y=115,format=yuv420p[v]`;
const mp4Path=path.join(outDir,"reconquista-750-cliopatria-sample.mp4");
run("ffmpeg",["-y","-loop","1","-i",pngPath,"-i",wavPath,"-t","20","-filter_complex",filter+";[1:a]apad[a]","-map","[v]","-map","[a]","-r","24","-c:v","libx264","-preset","veryfast","-b:v","1600k","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-movflags","+faststart",mp4Path]);
run("ffprobe",["-v","error","-show_entries","format=duration,size","-of","default=noprint_wrappers=1",mp4Path]);

fs.writeFileSync(path.join(outDir,"sample-provenance.json"),JSON.stringify({
  scene:{year:750,title:"Iberia at the Umayyad Frontier",sceneNumber:1},
  cliopatria:{version:data.version,year:data.year,matchedPolities:data.references.map(r=>({key:r.key,name:r.record?.Name,polityId:r.record?.SeshatID??null}))},
  geometrySource:"Cliopatria",
  routeAndEvents:"explicit documentary reconstruction, not database geometry",
  output:mp4Path
},null,2));
console.log(mp4Path);
