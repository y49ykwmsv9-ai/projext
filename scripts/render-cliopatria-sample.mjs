import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const data=JSON.parse(fs.readFileSync(path.join(root,'projects/documentary/data/sample-711-cliopatria.json'),'utf8'));
const outDir=path.join(root,'projects/documentary/build/sample');
fs.mkdirSync(outDir,{recursive:true});
const svg=path.join(outDir,'reconquista-711-cliopatria-sample.svg');
const png=path.join(outDir,'reconquista-711-cliopatria-sample.png');
const mp4=path.join(outDir,'reconquista-711-cliopatria-sample.mp4');
const W=1280,H=720,mapX=70,mapY=105,mapW=1140,mapH=545;
const lon0=-10.8,lon1=4.7,lat0=35.0,lat1=44.5;
const project=(lon,lat)=>[mapX+(lon-lon0)/(lon1-lon0)*mapW,mapY+(lat1-lat)/(lat1-lat0)*mapH];
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function geometryPath(g){
 if(!g)return '';
 const rings=g.type==='Polygon'?g.coordinates:(g.type==='MultiPolygon'?g.coordinates.flat():[]);
 return rings.map(r=>r.map(([lon,lat],i)=>{const [x,y]=project(lon,lat);return (i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)}).join(' ')+' Z').join(' ');
}
const palette=['#80633c','#3f6b4f','#5b7741'];
const territory=data.references.map((r,i)=>r.geometry?'<path d="'+geometryPath(r.geometry)+'" fill="'+palette[i%palette.length]+'" fill-opacity=".72" stroke="#211c15" stroke-width="2.2"/>':'').join('');
const point=(lon,lat,label)=>{const [x,y]=project(lon,lat);return {x,y,label}};
const pts=[point(-5.35,36.14,'GIBRALTAR'),point(-5.86,36.52,'GUADALETE'),point(-4.78,37.89,'CÓRDOBA'),point(-4.03,39.86,'TOLEDO')];
const [a,b,c,d]=pts;
const route='M '+a.x+' '+a.y+' C '+(b.x-30)+' '+(b.y+5)+' '+(b.x+40)+' '+(b.y-40)+' '+b.x+' '+b.y+' S '+(c.x+20)+' '+(c.y-15)+' '+c.x+' '+c.y+' S '+d.x+' '+(d.y+15)+' '+d.x+' '+d.y;
const labels=pts.map(p=>'<g><circle cx="'+p.x+'" cy="'+p.y+'" r="6" fill="#f4ead4" stroke="#201b16" stroke-width="2"/><text x="'+(p.x+11)+'" y="'+(p.y-10)+'" font-family="DejaVu Sans" font-size="18" font-weight="700" fill="#f4ead4" stroke="#201b16" stroke-width="4" paint-order="stroke">'+p.label+'</text></g>').join('');
const polLabels=data.references.map(r=>{if(!r.geometry)return '';const coords=r.geometry.type==='Polygon'?r.geometry.coordinates[0]:r.geometry.coordinates?.[0]?.[0];if(!coords?.length)return '';const c0=coords.reduce((a,p)=>[a[0]+p[0],a[1]+p[1]],[0,0]).map(v=>v/coords.length);const [x,y]=project(c0[0],c0[1]);return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="DejaVu Sans" font-size="22" font-weight="700" fill="#f4ead4" stroke="#201b16" stroke-width="5" paint-order="stroke">'+esc(r.record?.name||r.key)+'</text>';}).join('');
const svgText='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><defs><marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#c88a3a"/></marker></defs><rect width="1280" height="720" fill="#7f9caf"/><rect x="0" y="0" width="1280" height="95" fill="#17130f" opacity=".92"/><text x="45" y="42" fill="#f4ead4" font-family="DejaVu Sans" font-size="31" font-weight="700">711  •  THE CONQUEST OF IBERIA</text><text x="45" y="70" fill="#d7c39a" font-family="DejaVu Sans" font-size="15">CLIOPATRIA-GROUNDED POLITICAL GEOGRAPHY • ANIMATED CAMPAIGN LAYER</text>'+territory+polLabels+'<path d="'+route+'" fill="none" stroke="#c88a3a" stroke-width="7" stroke-linecap="round" marker-end="url(#arrow)"/>'+labels+'<circle cx="'+b.x+'" cy="'+b.y+'" r="12" fill="none" stroke="#b33b2f" stroke-width="5"><animate attributeName="r" values="9;23;9" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.15;.9" dur="1.6s" repeatCount="indefinite"/></circle><circle r="10" fill="#c88a3a"><animateMotion dur="8s" repeatCount="indefinite" path="'+route+'"/></circle><g transform="translate(900 530)"><rect width="320" height="140" rx="10" fill="#17130f" opacity=".88" stroke="#d7c39a" stroke-width="2"/><text x="20" y="28" fill="#f4ead4" font-family="DejaVu Sans" font-size="16" font-weight="700">DATA PROVENANCE</text><text x="20" y="55" fill="#d7c39a" font-family="DejaVu Sans" font-size="13">Political polygons: Cliopatria</text><text x="20" y="77" fill="#d7c39a" font-family="DejaVu Sans" font-size="13">Year slice: 711 CE</text><text x="20" y="99" fill="#d7c39a" font-family="DejaVu Sans" font-size="13">Routes: documentary overlay</text><text x="20" y="121" fill="#d7c39a" font-family="DejaVu Sans" font-size="12">Auxiliary city/event points are explicit.</text></g><text x="44" y="700" fill="#f4ead4" font-family="DejaVu Sans" font-size="12">Cliopatria • Seshat Global History Databank • database geometry + original animation</text></svg>';
fs.writeFileSync(svg,svgText);
execFileSync('rsvg-convert',['-w','1280','-h','720','-o',png,svg],{stdio:'inherit'});
const narration='In 711, forces crossing from North Africa entered the Iberian Peninsula. This reconstruction uses Cliopatria historical geography for the political territories active at the selected date. The campaign route is deliberately separate: it is an animated documentary layer, not a claim that the database itself records an exact marching path. From Gibraltar, the route moves toward the Guadalete battlefield, then north toward Córdoba and Toledo. The result is a map that is data-driven where the database can support it, and explicit about what is reconstructed where it cannot.';
fs.writeFileSync(path.join(outDir,'narration.txt'),narration);
execFileSync('piper',['--data-dir',path.join(root,'voices'),'--model','en_US-lessac-medium','--input_file',path.join(outDir,'narration.txt'),'--output_file',path.join(outDir,'narration.wav')],{stdio:'inherit'});
const filter="[0:v]scale=1280:720,zoompan=z='1.02+0.018*sin(on/55)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24,format=yuv420p[v]";
execFileSync('ffmpeg',['-y','-loop','1','-i',png,'-i',path.join(outDir,'narration.wav'),'-t','20','-filter_complex',filter+';[1:a]apad[a]','-map','[v]','-map','[a]','-r','24','-c:v','libx264','-preset','veryfast','-b:v','1600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',mp4],{stdio:'inherit'});
execFileSync('ffprobe',['-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',mp4],{stdio:'inherit'});
fs.writeFileSync(path.join(outDir,'sample-provenance.json'),JSON.stringify(data,null,2));
console.log(mp4);
