'use client';
import {useEffect,useMemo,useState} from 'react';
import {geoNaturalEarth1,geoPath,geoAlbersUsa} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import usCounties from 'us-atlas/counties-10m.json';
import {makeNation,NationState,START_DATE} from '../lib/game-data';
import {createWorldState,advanceWorld,issueCommand,ensureNationSystems,syncPoliticalMap,applyEventEffects} from '../engine';
import type {WorldState} from '../engine';

const countries:any[]=feature(world as any,(world as any).objects.countries).features;
const counties:any[]=feature(usCounties as any,(usCounties as any).objects.counties).features;
const tabs=['Overview','Politics','Economy','Diplomacy','Military','Intelligence','Production','Technology','Population','Territory'];
const speeds=[1,2,5,10,20];

function seedWorld():WorldState{
 const state=createWorldState(START_DATE);
 for(const f of countries){
  const id=String(f.id??'0'); const n=makeNation(id,f.properties?.name??'Unknown');
  state.nations[id]={id:n.id,name:n.name,government:'republic',population:n.population,gdp:n.gdp,treasury:n.gdp*.15,debt:0,stability:n.stability,legitimacy:65,industrialCapacity:n.industry,civilianFactories:20,militaryFactories:10,dockyards:5,manpower:n.population*.22,research:1,technology:[],laws:[],relations:{} ,alliances:[],wars:[]};
  state.mapEntities[id]={id,name:n.name,category:'country',controller:id,owner:id,areaKm2:1,population:n.population*1e6,mapSource:'world-atlas',centroid:[0,0],geometryKey:id,children:[],adjacency:[],development:50,infrastructure:50,ratios:{childrenPerParent:0,populationShare:1,areaShare:1,urbanization:.5,density:0}};
  ensureNationSystems(state,state.nations[id]);
 }
 syncPoliticalMap(state);
 return state;
}


function identityColor(key:string){let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;const hue=h%360;return 'hsl('+hue+' 38% 42%)'}

export default function GameShell(){
 const [worldState,setWorldState]=useState<WorldState>(()=>seedWorld());
 const [selected,setSelected]=useState<NationState|null>(null);
 const [selectedCounty,setSelectedCounty]=useState<string|null>(null);
 const [paused,setPaused]=useState(true),[speed,setSpeed]=useState(1),[tab,setTab]=useState('Overview');
 const [view,setView]=useState<'world'|'country'>('world'),[countryView,setCountryView]=useState('840'),[command,setCommand]=useState(''),[log,setLog]=useState<string[]>([]);
 const [saveReady,setSaveReady]=useState(false);
 const W=1100,H=560;
 const countryFeatures=countryView==='840'?counties:[]; const projection=useMemo(()=>view==='country'?geoAlbersUsa().fitSize([W,H],{type:'FeatureCollection',features:countryFeatures} as any):geoNaturalEarth1().fitSize([W,H],{type:'FeatureCollection',features:countries} as any),[view,countryView]);
 const path=useMemo(()=>geoPath(projection),[projection]);

 useEffect(()=>{if(paused)return;const id=setInterval(()=>setWorldState(s=>advanceWorld(s,speed)),650);return()=>clearInterval(id)},[paused,speed]);

 function selectCountry(id:string,name:string){const live=worldState.nations[id];setSelected(live?{id:live.id,name:live.name,population:live.population,gdp:live.gdp,industry:live.industrialCapacity,stability:live.stability,military:live.manpower,relations:0}:makeNation(id,name));setSelectedCounty(null);setCountryView(id);setView('country');}
 function runCommand(e:React.FormEvent){e.preventDefault();if(!command.trim())return;const s=structuredClone(worldState);const player=selected?.id??'840';const r=issueCommand(s,command,player);setWorldState(s);setLog(x=>[r.message,...x].slice(0,8));setCommand('');}
 function save(){localStorage.setItem('worldforge-save',JSON.stringify(worldState));setSaveReady(true);setLog(x=>['Game saved locally.',...x])}
 function load(){const raw=localStorage.getItem('worldforge-save');if(!raw)return;try{setWorldState(JSON.parse(raw));setSaveReady(true);setLog(x=>['Save loaded.',...x])}catch{setLog(x=>['Save file could not be loaded.',...x])}}

 return <main className='shell'>
  <header className='topbar'><div><div className='eyebrow'>GRAND STRATEGY WORLD SIMULATOR</div><h1>WORLDFORGE</h1></div><div className='clock'><b>{worldState.date}</b><button onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button><select value={speed} onChange={e=>setSpeed(+e.target.value)}>{speeds.map(x=><option key={x} value={x}>{x}×</option>)}</select><button onClick={save}>Save</button><button onClick={load}>Load</button></div></header>
  <nav className='tabs'>{tabs.map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</nav>
  <section className='workspace'>
   <div className='map-panel'>
    <div className='map-toolbar'><b>{view==='country'?(worldState.nations[countryView]?.name??makeNation(countryView,'').name).toUpperCase()+' · COUNTY MAP':'WORLD · COUNTRY MAP'}</b><span>{view==='country'?countryFeatures.length+' county-equivalent features loaded':countries.length+' countries loaded'} · TICK {worldState.tick.toLocaleString()}</span><button onClick={()=>setView('world')}>World</button></div>
    <svg viewBox={'0 0 '+W+' '+H} className='worldmap'>
     <rect width={W} height={H} className='ocean'/>
     {view==='world'?countries.map((f,i)=>{const id=String(f.id??i),n=makeNation(id,f.properties?.name??'Unknown');return <path key={id} d={path(f)||''} style={{fill:identityColor(worldState.political.identities[id]?.colorKey??id)}} className={'country '+(selected?.id===id?'selected':'')} onClick={()=>selectCountry(id,n.name)}><title>{n.name}</title></path>}):
      counties.map((f,i)=>{const id=String(f.id??i),name=f.properties?.name??('County '+id);return <path key={id} d={path(f)||''} className={'county '+(selectedCounty===id?'selected':'')} onClick={()=>setSelectedCounty(id)}><title>{name}</title></path>})}
    </svg>
    <div className='map-legend'>{view==='country'?'Every subdivision is independently selectable. Political ownership and controller changes are reflected by map identity.':'Select any country to enter its county-level world view.'}</div>
   </div>
   <aside className='side'>
    <div className='panel-head'><div><div className='eyebrow'>{selectedCounty?'COUNTY':'POLITY / TERRITORY'}</div><h2>{selectedCounty?('County '+selectedCounty):(selected?.name??tab)}</h2></div></div>
    {selected&&!selectedCounty&&<><div className='stats'>{[['Population',selected.population.toFixed(1)+'M'],['GDP',selected.gdp.toFixed(1)+'B'],['Industry',selected.industry.toFixed(0)],['Military',selected.military.toFixed(0)],['Stability',selected.stability.toFixed(0)],['Relations',String(selected.relations)]].map(([a,b])=><div className='stat' key={a}><span>{a}</span><strong>{b}</strong></div>)}</div><div className='section'><div className='section-title'>SYSTEMS</div><div className='action-grid'>{['Diplomacy','Production','Military Orders','Infrastructure','Research','National Law'].map(x=><button key={x} onClick={()=>setLog(l=>[x+' panel opened.',...l])}>{x}</button>)}</div></div></>}

    {worldState.events.some(e=>!e.resolved)&&<div className='section'><div className='section-title'>ACTIVE EVENTS</div>{worldState.events.filter(e=>!e.resolved).slice(0,4).map(e=><div className='event-card' key={e.id}><strong>{e.title}</strong><p>{e.description}</p><div className='event-options'>{e.options.map((o,i)=><button key={o} onClick={()=>{const s=structuredClone(worldState);const r=applyEventEffects(s,e.id,i);setWorldState(s);setLog(l=>[r.message,...l].slice(0,8));}}>{o}</button>)}</div></div>)}</div>}
    {!selected&&!selectedCounty&&<div className='feature-list'>{['Four-tier geography: country → region → county → city','Population and demographic simulation','Economy, taxation, GDP and industry','Military readiness, mobilization and supply','Diplomacy, treaties and relations','Technology, production and infrastructure','Events and alternate-history framework','Save/load and deterministic simulation'].map(x=><div key={x}>◆ {x}</div>)}</div>}
    <div className='section'><div className='section-title'>COMMAND CONSOLE</div><form onSubmit={runCommand} className='command'><input value={command} onChange={e=>setCommand(e.target.value)} placeholder='e.g. mobilize / build industry / tax 25'/><button>Issue</button></form><div className='log'>{log.map((x,i)=><div key={i}>{x}</div>)}</div></div>
    <div className='muted'>{saveReady?'Local save available.':'Simulation state is active in memory.'}</div>
   </aside>
  </section>
  <footer>WORLDFORGE · SIMULATION ENGINE · {tab.toUpperCase()}</footer>
 </main>
}
