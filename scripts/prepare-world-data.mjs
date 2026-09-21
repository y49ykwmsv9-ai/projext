import {mkdir,writeFile,access} from 'node:fs/promises';
import {dirname} from 'node:path';
const root=new URL('../',import.meta.url);
const publicDir=new URL('../public/data/',import.meta.url);
const sources={
 admin1:'https://raw.githubusercontent.com/datasets/geo-ne-admin1/main/data/admin1.geojson',
 cities:'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_populated_places.json'
};
await mkdir(publicDir,{recursive:true});
for(const [name,url] of Object.entries(sources)){
 const target=new URL(name+'.json',publicDir);
 try{await access(target);const existing=await import('node:fs/promises').then(fs=>fs.stat(target));if(existing.size>1000){console.log('[worldforge-data] cached',name,existing.size);continue;}}catch{}
 console.log('[worldforge-data] downloading',name);
 const res=await fetch(url);if(!res.ok)throw new Error('Failed to download '+url+' '+res.status);
 const text=await res.text();
 await writeFile(target,text,'utf8');
 console.log('[worldforge-data] wrote',name,text.length);
}
