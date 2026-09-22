import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { feature as topoFeature } from "topojson-client";

const root=process.cwd();
const dataDir=path.join(root,"public","data","cliopatria");
const outDir=path.join(root,"projects","documentary","build","sample");
fs.mkdirSync(outDir,{recursive:true});
const run=(cmd,args)=>execFileSync(cmd,args,{stdio:"inherit"});

if(!fs.existsSync(path.join(dataDir,"manifest.json"))) run("node",["scripts/prepare-cliopatria.mjs"]);

const manifest=JSON.parse(fs.readFileSync(path.join(dataDir,"manifest.json"),"utf8"));
const timeIndex=JSON.parse(gunzipSync(fs.readFileSync(path.join(dataDir,manifest.indexes.time.file))).toString("utf8"));
const routing=JSON.parse(gunzipSync(fs.readFileSync(path.join(dataDir,manifest.indexes.routing.file))).toString("utf8"));
const shards=new Map();

async function loadShard(id){
  if(shards.has(id))return shards.get(id);
  const meta=manifest.shards.find(s=>s.id===id);
  if(!meta)throw new Error("Missing Cliopatria shard "+id);
  const topology=JSON.parse(gunzipSync(fs.readFileSync(path.join(dataDir,meta.file))).toString("utf8"));
  const features=topoFeature(topology,topology.objects.polities).features;
  shards.set(id,features);
  return features;
}

async function queryYear(year){
  const bucket=String(Math.floor(year/manifest.timeBucketSize)*manifest.timeBucketSize);
  const ids=timeIndex[bucket]??[];
  const grouped=new Map();
  for(const id of ids){
    const shard=routing[id];
    if(shard===undefined)continue;
    const a=grouped.get(shard)??[];
    a.push(id);grouped.set(shard,a);
  }
  const result=[];
  for(const [shard,wanted] of grouped){
    const set=new Set(wanted);
    for(const f of await loadShard(shard)){
      if(!set.has(String(f.id)))continue;
      const p=f.properties??{};
      const from=Number(p.FromYear??p.fromYear??-3400);
      const to=Number(p.ToYear??p.toYear??2024);
      if(from<=year&&year<=to)result.push(f);
    }
  }
  return result;
}

const year=711;
const all=await queryYear(year);
const nameOf=f=>String((f.properties??{}).Name??(f.properties??{}).name??(f.properties??{}).Polity??f.id);
const refs=[];
for(const terms of [["visigoth"],["umayyad"],["asturias"]]){
  const match=all.filter(f=>terms.some(t=>nameOf(f).toLowerCase().includes(t))).sort((a,b)=>nameOf(a).length-nameOf(b).length)[0];
  if(match){
    const p=match.properties??{};
    refs.push({cliopatriaId:String(match.id),name:nameOf(match),fromYear:Number(p.FromYear??p.fromYear),toYear:Number(p.ToYear??p.toYear),wikidata:p.Wikidata??p.WikidataID??null,seshatId:p.SeshatID??null,geometry:match.geometry});
  }
}
if(refs.length<2)throw new Error("Cliopatria sample could not resolve the required 711 Iberian polities.");

const lon0=-10.8,lon1=4.7,lat0=35,lat1=44.5;
const W=1280,H=720,mapX=55,mapY=108,mapW=1170,mapH=565;
const project=(lon,lat)=>[mapX+(lon-lon0)/(lon1-lon0)*mapW,mapY+(lat1-lat)/(lat1-lat0)*mapH];
const pathGeometry=g=>{
  if(!g)return "";
  const rings=g.type==="Polygon"?g.coordinates:(g.type==="MultiPolygon"?g.coordinates.flat():[]);
  return rings.map(r=>r.map((p,i)=>{const [x,y]=project(p[0],p[1]);return (i?"L":"M")+x.toFixed(1)+","+y.toFixed(1)}).join(" ")+" Z").join(" ");
};
const colors=["#9b6b3d","#3e6b4f","#596b45"];
const territories=refs.map((r,i)=>`<path d="${pathGeometry(r.geometry)}" fill="${colors[i%colors.length]}" fill-opacity=".78" stroke="#241e16" stroke-width="1.4"/>`).join("");
const pts=[["GIBRALTAR",-5.35,36.14],["GUADALETE",-5.65,36.65],["CÓRDOBA",-4.78,37.89],["TOLEDO",-4.03,39.86]];
const route=pts.map(([_,lon,lat],i)=>{const [x,y]=project(lon,lat);return `${i?"L":"M"}${x.toFixed(1)} ${y.toFixed(1)}`;}).join(" ");
const labels=pts.map(([name,lon,lat])=>{const [x,y]=project(lon,lat);return `<circle cx="${x}" cy="${y}" r="5" fill="#f5ead3" stroke="#1b1712" stroke-width="2"/><text x="${x+10}" y="${y-9}" fill="#f5ead3" stroke="#1b1712" stroke-width="4" paint-order="stroke" font-family="DejaVu Sans" font-size="17" font-weight="700">${name}</text>`;}).join("");
const [battleX,battleY]=project(-5.65,36.65);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
<rect width="1280" height="720" fill="#7f9caf"/>
<rect x="0" y="0" width="1280" height="96" fill="#17130f" opacity=".94"/>
<text x="45" y="43" fill="#f5ead3" font-family="DejaVu Sans" font-size="31" font-weight="700">711  •  THE CONQUEST OF IBERIA</text>
<text x="45" y="72" fill="#d7c39a" font-family="DejaVu Sans" font-size="14">CLIOPATRIA TIME-SLICE • DATABASE POLYGONS • ORIGINAL CAMPAIGN ANIMATION</text>
<rect x="35" y="105" width="1210" height="580" rx="7" fill="#d8c59d"/>
${territories}
<path d="${route}" fill="none" stroke="#c98a3d" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 9"/>
${labels}
<circle cx="${battleX}" cy="${battleY}" r="11" fill="#9b3d2f" opacity=".82"/>
<text x="70" y="138" fill="#1b1712" font-family="DejaVu Sans" font-size="16" font-weight="700">POLITICAL GEOGRAPHY FROM CLIOPATRIA, 711 CE</text>
<g transform="translate(875 525)"><rect width="340" height="135" rx="10" fill="#17130f" opacity=".88" stroke="#d7c39a" stroke-width="2"/>
<text x="20" y="28" fill="#f5ead3" font-family="DejaVu Sans" font-size="15" font-weight="700">DATABASE-RESOLVED POLITIES</text>
${refs.map((r,i)=>`<circle cx="28" cy="${55+i*27}" r="7" fill="${colors[i%colors.length]}"/><text x="45" y="${60+i*27}" fill="#f5ead3" font-family="DejaVu Sans" font-size="13">${r.name}</text>`).join("")}
</g>
<text x="40" y="708" fill="#f5ead3" font-family="DejaVu Sans" font-size="11">Cliopatria ${manifest.version} • geometry: database • route/city/event markers: explicit documentary reconstruction</text>
</svg>`;
const svgPath=path.join(outDir,"reconquista-711-cliopatria-sample.svg");
const pngPath=path.join(outDir,"reconquista-711-cliopatria-sample.png");
fs.writeFileSync(svgPath,svg);
run("rsvg-convert",["-w","1280","-h","720","-o",pngPath,svgPath]);

const narrationPath=path.join(outDir,"narration.txt");
fs.writeFileSync(narrationPath,"In 711, forces of the Umayyad Caliphate crossed from North Africa into Iberia. The political layer in this reconstruction is not a hand-drawn approximation. It is resolved from the Cliopatria historical geospatial database at the 711 time slice. The campaign line begins at Gibraltar, passes the Guadalete battlefield, and continues toward Córdoba and Toledo. Those route and event markers are explicitly treated as documentary overlays, while the territorial shapes come directly from the historical database. This is the design rule for the larger documentary: database-backed geography first, animation second.");
const wavPath=path.join(outDir,"narration.wav");
run("piper",["--data-dir",path.join(root,"voices"),"--model","en_US-lessac-medium","--input_file",narrationPath,"--output_file",wavPath]);

const [sx,sy]=project(-5.35,36.14);
const [ex,ey]=project(-4.03,39.86);
const dx=ex-sx,dy=ey-sy;
const filter=`[0:v]zoompan=z='1.01+0.02*sin(on/65)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24,drawbox=x='${sx}+(${dx})*mod(t/20\\,1)':y='${sy}+(${dy})*mod(t/20\\,1)':w=16:h=16:color=#c98a3d@0.98:t=fill,drawbox=x='${battleX}-18':y='${battleY}-18':w='36+12*sin(2*PI*t)':h='36+12*sin(2*PI*t)':color=#9b3d2f@0.38:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='CLIOPATRIA • 711 CE':fontcolor=#f5ead3:fontsize=17:box=1:boxcolor=black@0.45:boxborderw=8:x=55:y=115,format=yuv420p[v]`;
const mp4Path=path.join(outDir,"reconquista-711-cliopatria-sample.mp4");
run("ffmpeg",["-y","-loop","1","-i",pngPath,"-i",wavPath,"-t","20","-filter_complex",filter+";[1:a]apad[a]","-map","[v]","-map","[a]","-r","24","-c:v","libx264","-preset","veryfast","-b:v","1600k","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-movflags","+faststart",mp4Path]);
run("ffprobe",["-v","error","-show_entries","format=duration,size","-of","default=noprint_wrappers=1",mp4Path]);

fs.writeFileSync(path.join(outDir,"sample-provenance.json"),JSON.stringify({
  scene:{year,title:"The Conquest of Iberia",sceneNumber:1},
  cliopatria:{version:manifest.version,year,matchedPolities:refs.map(({geometry,...r})=>r)},
  geometrySource:"Cliopatria",
  routeAndEvents:"explicit documentary reconstruction, not database geometry",
  output:mp4Path
},null,2));
console.log(mp4Path);
