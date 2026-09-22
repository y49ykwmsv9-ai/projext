import fs from 'node:fs';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const dir=path.join(root,'projects/documentary/data');
fs.mkdirSync(dir,{recursive:true});
const version='v0.2.0';
const zip=path.join(dir,'cliopatria-'+version+'.zip');
const geo=path.join(dir,'cliopatria.geojson');
const url='https://github.com/Seshat-Global-History-Databank/cliopatria/raw/refs/tags/'+version+'/cliopatria.geojson.zip';

if(!fs.existsSync(zip))execFileSync('curl',['-L','--fail','--retry','3','-o',zip,url],{stdio:'inherit'});
if(!fs.existsSync(geo)){
 const data=fs.readFileSync(zip); const eocd=data.lastIndexOf(Buffer.from([0x50,0x4b,0x05,0x06]));
 const count=data.readUInt16LE(eocd+10), central=data.readUInt32LE(eocd+16); let cur=central, chosen=null;
 for(let i=0;i<count;i++){
  const compression=data.readUInt16LE(cur+10), csize=data.readUInt32LE(cur+20), usize=data.readUInt32LE(cur+24), nl=data.readUInt16LE(cur+28), el=data.readUInt16LE(cur+30), cl=data.readUInt16LE(cur+32), lo=data.readUInt32LE(cur+42);
  const name=data.subarray(cur+46,cur+46+nl).toString();
  if(name.endsWith('.geojson')){chosen={compression,csize,usize,lo};break}
  cur+=46+nl+el+cl;
 }
 if(!chosen)throw new Error('GeoJSON not found in Cliopatria archive');
 const ln=data.readUInt16LE(chosen.lo+26), le=data.readUInt16LE(chosen.lo+28), start=chosen.lo+30+ln+le;
 const compressed=data.subarray(start,start+chosen.csize);
 const json=chosen.compression===8?inflateRawSync(compressed):compressed;
 fs.writeFileSync(geo,json);
}
const source=JSON.parse(fs.readFileSync(geo,'utf8'));
const features=source.features||[];
const norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const active=(f,y)=>{const p=f.properties||{};return Number(p.FromYear)<=y&&y<=Number(p.ToYear)};
const entityName=f=>{const p=f.properties||{};return p.Name||p.name||p.PolityName};
const find=(year,cands)=>{
 const cs=cands.map(norm);
 return features.filter(f=>active(f,year)).map(f=>({f,n:norm(entityName(f))})).filter(x=>cs.some(c=>x.n===c||x.n.includes(c)||c.includes(x.n))).sort((a,b)=>Number((b.f.properties||{}).Area||0)-Number((a.f.properties||{}).Area||0))[0]?.f;
};
const wanted=[
 {key:'umayyad-caliphate',candidates:['Umayyad Caliphate']},
 {key:'asturias',candidates:['Kingdom of Asturias','Asturias']}
];
const references=wanted.map(x=>{
 const f=find(750,x.candidates);
 return {key:x.key,source:'Cliopatria',resolved:Boolean(f),record:f?f.properties:null,geometry:f?.geometry||null};
});
const result={dataset:'Cliopatria',version,year:750,sourceUrl:'https://github.com/Seshat-Global-History-Databank/cliopatria/tree/'+version,recordCount:features.length,references,geographicPoints:[
 {key:'gibraltar',label:'Gibraltar',lon:-5.35,lat:36.14,source:'auxiliary geographic point'},
 {key:'guadalete',label:'Guadalete',lon:-5.86,lat:36.52,source:'auxiliary event point'},
 {key:'cordoba',label:'Córdoba',lon:-4.78,lat:37.89,source:'auxiliary city point'},
 {key:'toledo',label:'Toledo',lon:-4.03,lat:39.86,source:'auxiliary city point'}
],provenance:'Territorial polygons are taken directly from Cliopatria records active in 750 CE. Auxiliary city/event points are explicitly not presented as Cliopatria polygons.'};
fs.writeFileSync(path.join(dir,'sample-750-cliopatria.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({version,recordCount:features.length,references:references.map(r=>({key:r.key,resolved:r.resolved,name:r.record?.Name}))},null,2));
