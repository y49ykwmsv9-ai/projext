'use client';
import {useEffect,useMemo,useState} from 'react';
import {geoNaturalEarth1,geoPath,geoAlbersUsa} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import usCounties from 'us-atlas/counties-10m.json';
import {makeNation,NationState,START_DATE} from '../lib/game-data';
import {createWorldState,advanceWorld,issueCommand,ensureNationSystems,syncPoliticalMap,applyEventEffects} from '../engine';
import type {WorldState} from '../engine';

const countries:any[]=(((feature(world as any,(world as any).objects.countries) as any).features??[]) as any[]);
const counties:any[]=(((feature(usCounties as any,(usCounties as any).objects.counties) as any).features??[]) as any[]);
const tabs=['Overview','Politics','Economy','Diplomacy','Military','Intelligence','Production','Technology','Population','Territory'];
const speeds=[1,2,5,10,20];

function seedWorld():WorldState{
 const state=createWorldState(START_DATE);
 for(const f of countries){
  const id=String(f.id??'0'); const n=makeNation(id,f.properties?.name??'Unknown');
  state.nations[id]={id:n.id,name:n.name,government:'republic',population:n.population,gdp:n.gdp,treasury:n.gdp*.15,debt:0,stability:n.stability,legitimacy:65,industrialCapacity:n.industry,civilianFactories:20,militaryFactories:10,dockyards:5,manpower:n.population*.22,research:1,technology:[],laws:[],relations:{},alliances:[],wars:[]};
  state.mapEntities[id]={id,name:n.name,category:'country',controller:id,owner:id,areaKm2:1,population:n.population*1e6,mapSource:'world-atlas',centroid:[0,0],geometryKey:id,children:[],adjacency:[],development:n.industry,infrastructure:50,ratios:{childrenPerParent:0,populationShare:1,areaShare:1,urbanization:.5,density:0}};
  ensureNationSystems(state,state.nations[id]);
 }
 syncPoliticalMap(state); return state;
}
function identityColor(key:string){let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;return 'hsl('+h%360+' 38% 42%)'}
function pct(v:number){return Math.round(v*100)+'%'}

export default function GameShell(){
 const [worldState,setWorldState]=useState<WorldState>(()=>seedWorld());
 const [selected,setSelected]=useState<NationState|null>(null);
 const [selectedCounty,setSelectedCounty]=useState<string|null>(null);
 const [paused,setPaused]=useState(true),[speed,setSpeed]=useState(1),[tab,setTab]=useState('Overview');
 const [view,setView]=useState<'world'|'country'>('world'),[countryView,setCountryView]=useState('840'),[command,setCommand]=useState(''),[log,setLog]=useState<string[]>([]);
 const [saveReady,setSaveReady]=useState(false);
 const W=1100,H=560;
 const countryFeatures=countryView==='840'?counties:[];
 const projection=useMemo(()=>view==='country'?geoAlbersUsa1().fitSize([W,H],{type:'FeatureCollection',features:countryFeatures} as any):geoNaturalEarth1().fitSize([W,H],{type:'FeatureCollection',features:countries} as any),[view,countryView]);
 const path=useMemo(()=>geoPath(projection),[projection]);
 useEffect(()=>{if(paused)return;const id=setInterval(()=>setWorldState(s=>advanceWorld(s,speed)),650);return()=>clearInterval(id)},[paused,speed]);

 function selectCountry(id:string,name:string){
  const live=worldState.nations[id]??(()=>{const x=makeNation(id,name);return {id:x.id,name:x.name,population:x.population,gdp:x.gdp,industry:x.industry,stability:x.stability,military:x.military,relations:x.relations}})();
  setSelected(live);setSelectedCounty(null);setCountryView(id);setView('country');
  setWorldState(s=>({...s,playerNation:id}));
 }
 function runCommand(e:React.FormEvent){e.preventDefault();if(!command.trim())return;const s=structuredClone(worldState);const player=worldState.playerNation??selected?.id??'840';const r=issueCommand(s,command,player);setWorldState(s);setLog(x=>[r.message,...x].slice(0,10));setCommand('');}
 function save(){localStorage.setItem('worldforge-save',JSON.stringify(worldState));setSaveReady(true);setLog(x=>['Game saved locally.',...x])}
 function load(){const raw=localStorage.getItem('worldforge-save');if(!raw)return;try{setWorldState(JSON.parse(raw));setSaveReady(true);setLog(x=>['Save loaded.',...x])}catch{setLog(x=>['Save file could not be loaded.',...x])}}
 const nation=worldState.playerNation?worldState.nations[worldState.playerNation]:undefined;
 const activeEvents=worldState.events.filter(e=>!e.resolved);
 const relRows=nation?Object.entries(nation.relations).map(([id,v])=>({name:worldState.nations[id]?.name??id,value:v})).sort((a,b)=>b.value-a.value).slice(0,8):[];

 function panel(){
  if(!nation)return <div className='feature-list'>{['Select any country on the world map to play as it.','Pause, resume and accelerate the simulation.','Manage taxation, industry, infrastructure and research.','Raise armies, mobilize, form alliances and declare wars.','Resolve dynamic events with branching effects.','Save and load a complete deterministic world state.','Country borders are bundled into the application; no runtime map download is required.'].map(x=><div key={x}>◆ {x}</div>)}</div>;
  if(tab==='Economy'||tab==='Production')return <div className='detail-grid'><Metric title='GDP' value={nation.gdp.toFixed(1)+' B'}/><Metric title='Treasury' value={nation.treasury.toFixed(1)+' B'}/><Metric title='Tax rate' value={pct(worldState.economy[nation.id].taxRate)}/><Metric title='Inflation' value={worldState.economy[nation.id].inflation.toFixed(1)+'%'}/><Metric title='Industry' value={nation.industrialCapacity.toFixed(0)}/><Metric title='Construction' value={worldState.economy[nation.id].construction.toFixed(0)}/><div className='wide action-grid'><button onClick={()=>quick('build industry')}>Build Industry</button><button onClick={()=>quick('build infrastructure')}>Build Infrastructure</button><button onClick={()=>quick('tax 15')}>Tax 15%</button><button onClick={()=>quick('tax 30')}>Tax 30%</button></div></div>;
  if(tab==='Diplomacy')return <><div className='detail-title'>Foreign Relations</div>{relRows.length?relRows.map(r=><div className='relation' key={r.name}><span>{r.name}</span><b>{r.value}</b></div>):<div className='muted'>No diplomatic actions recorded yet.</div>}<div className='section'><div className='section-title'>QUICK DIPLOMACY</div><div className='action-grid'><button onClick={()=>quick('relations France')}>Improve France</button><button onClick={()=>quick('relations Germany')}>Improve Germany</button><button onClick={()=>quick('ally France')}>Alliance: France</button><button onClick={()=>quick('peace Germany')}>Peace: Germany</button></div></div></>;
  if(tab==='Military')return <><div className='detail-grid'><Metric title='Readiness' value={worldState.military[nation.id].readiness.toFixed(0)}/><Metric title='Mobilization' value={worldState.military[nation.id].mobilization.toFixed(0)}/><Metric title='Supply' value={pct(worldState.military[nation.id].supply)}/><Metric title='War support' value={worldState.military[nation.id].warSupport.toFixed(0)}/><Metric title='Manpower' value={nation.manpower.toFixed(2)+' M'}/><Metric title='Active formations' value={String(Object.values(worldState.units).filter(u=>u.nation===nation.id).length)}/></div><div className='action-grid'><button onClick={()=>quick('mobilize')}>Mobilize</button><button onClick={()=>quick('demobilize')}>Demobilize</button><button onClick={()=>quick('recruit 5000')}>Raise 5,000</button><button onClick={()=>quick('war Germany')}>Declare War: Germany</button></div></>;
  if(tab==='Technology')return <><div className='detail-title'>Research Portfolio</div><div className='tech-list'>{(nation.technology.length?nation.technology:['Industrial Methods','Logistics','Communications','Combined Arms']).map((t,i)=><div key={t} className='tech'><span>{t}</span><b>{i<nation.research?'ACTIVE':'PLANNED'}</b></div>)}</div><button className='wide-button' onClick={()=>quick('research '+(nation.technology.length+1))}>Fund Research</button></>;
  if(tab==='Politics')return <div className='detail-grid'><Metric title='Government' value={nation.government}/><Metric title='Stability' value={nation.stability.toFixed(0)}/><Metric title='Legitimacy' value={nation.legitimacy.toFixed(0)}/><Metric title='Laws' value={String(nation.laws.length)}/><div className='wide muted'>Domestic policy affects growth, revenue, unrest and military readiness over time.</div></div>;
  if(tab==='Population')return <div className='detail-grid'><Metric title='Population' value={nation.population.toFixed(1)+' M'}/><Metric title='Manpower pool' value={nation.manpower.toFixed(2)+' M'}/><Metric title='Urbanization' value='50%'/><Metric title='Growth' value='Dynamic'/></div>;
  if(tab==='Territory')return <div className='muted'>Worldforge keeps legal ownership separate from military control. Select a country to open its available administrative map view. The bundled U.S. county atlas provides individually clickable county-equivalents.</div>;
  if(tab==='Intelligence')return <div className='detail-grid'><Metric title='Counterintelligence' value='50'/><Metric title='Reconnaissance' value='50'/><Metric title='Network coverage' value='25%'/><Metric title='Deception' value='20'/><div className='wide muted'>Intelligence systems are represented as persistent state and will expand with future operational orders.</div></div>;
  return <><div className='detail-title'>Strategic Situation</div><div className='muted'>You control <b>{nation.name}</b>. The simulation advances daily and recalculates demographics, economy, military readiness and diplomacy. Use the console or quick actions to change the world.</div><div className='section'><div className='section-title'>CURRENT WARS</div><div>{nation.wars.length?nation.wars.map(id=><div className='relation' key={id}><span>{worldState.nations[id]?.name??id}</span><b>WAR</b></div>):<span className='muted'>No active wars.</span>}</div></div></>;
 }
 function quick(c:string){const s=structuredClone(worldState);const r=issueCommand(s,c,worldState.playerNation??'');setWorldState(s);setLog(x=>[r.message,...x].slice(0,10));}
 return <main className='shell'>
  <header className='topbar'><div><div className='eyebrow'>GRAND STRATEGY WORLD SIMULATOR · 1.0</div><h1>WORLDFORGE</h1></div><div className='clock'><b>{worldState.date}</b><button onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button><select value={speed} onChange={e=>setSpeed(+e.target.value)}>{speeds.map(x=><option key={x} value={x}>{x}×</option>)}</select><button onClick={save}>Save</button><button onClick={load}>Load</button></div></header>
  <nav className='tabs'>{tabs.map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</nav>
  <section className='workspace'>
   <div className='map-panel'><div className='map-toolbar'><b>{view==='country'?(nation?.name??'COUNTRY').toUpperCase()+' · ADMINISTRATIVE VIEW':'WORLD · POLITICAL MAP'}</b><span>{view==='country'?countryFeatures.length+' bundled county features':countries.length+' sovereign map features'} · TICK {worldState.tick.toLocaleString()}</span><button onClick={()=>setView('world')}>World</button></div>
    <svg viewBox={'0 0 '+W+' '+H} className='worldmap'><rect width={W} height={H} className='ocean'/>
     {view==='world'?countries.map((f,i)=>{const id=String(f.id??i),n=makeNation(id,f.properties?.name??'Unknown');return <path key={id} d={path(f)||''} style={{fill:identityColor(worldState.political.identities[id]?.colorKey??id)}} className={'country '+(worldState.playerNation===id?'selected':'')} onClick={()=>selectCountry(id,n.name)}><title>{n.name}</title></path>}):
     counties.map((f,i)=>{const id=String(f.id??i),name=f.properties?.name??('County '+id);return <path key={id} d={path(f)||''} className={'county '+(selectedCounty===id?'selected':'')} onClick={()=>setSelectedCounty(id)}><title>{name}</title></path>})}</svg>
    <div className='map-legend'>{view==='country'?(selectedCounty?'Selected administrative unit: '+selectedCounty:'Click an individual county-equivalent to inspect it.'):'Click any country to select it and enter its government view.'}</div>
   </div>
   <aside className='side'><div className='panel-head'><div><div className='eyebrow'>{selectedCounty?'ADMINISTRATIVE UNIT':nation?'PLAYER POLITY':'WORLDFORGE'}</div><h2>{selectedCounty?('County '+selectedCounty):(nation?.name??tab)}</h2></div></div>
    {nation&&!selectedCounty&&<div className='stats'>{[['Population',nation.population.toFixed(1)+'M'],['GDP',nation.gdp.toFixed(1)+'B'],['Industry',nation.industrialCapacity.toFixed(0)],['Military',nation.manpower.toFixed(2)+'M'],['Stability',nation.stability.toFixed(0)],['Relations',String(Object.values(nation.relations).length)]].map(([a,b])=><div className='stat' key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>}
    {!selectedCounty&&panel()}
    {selectedCounty&&<div className='detail-grid'><Metric title='Unit' value={selectedCounty}/><Metric title='Map layer' value='County-equivalent'/><Metric title='Status' value='Selectable'/><div className='wide muted'>This administrative feature is independently clickable and can be used as a territory selection target.</div></div>}
    {activeEvents.length>0&&<div className='section'><div className='section-title'>ACTIVE EVENTS</div>{activeEvents.slice(0,3).map(e=><div className='event-card' key={e.id}><strong>{e.title}</strong><p>{e.description}</p><div className='event-options'>{e.options.map((o,i)=><button key={o} onClick={()=>{const s=structuredClone(worldState);const r=applyEventEffects(s,e.id,i);setWorldState(s);setLog(l=>[r.message,...l].slice(0,10));}}>{o}</button>)}</div></div>)}</div>}
    <div className='section'><div className='section-title'>COMMAND CONSOLE</div><form onSubmit={runCommand} className='command'><input value={command} onChange={e=>setCommand(e.target.value)} placeholder='build industry · mobilize · recruit 5000 · war Germany'/><button>Issue</button></form><div className='log'>{log.map((x,i)=><div key={i}>{x}</div>)}</div></div>
    <div className='muted'>{saveReady?'Local save available.':'Simulation state active in memory.'}</div>
   </aside>
  </section><footer>WORLDFORGE · 1.0 · {tab.toUpperCase()} · {paused?'PAUSED':'RUNNING'}</footer>
 </main>
}
function Metric({title,value}:{title:string;value:string}){return <div className='stat'><span>{title}</span><strong>{value}</strong></div>}