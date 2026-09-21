'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {geoNaturalEarth1,geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {makeNation,NationState,START_DATE} from '../lib/game-data';
import {createWorldState,advanceWorld,issueCommand,ensureNationSystems,syncPoliticalMap,applyEventEffects} from '../engine';
import type {WorldState} from '../engine';

const countries:any[]=(((feature(world as any,(world as any).objects.countries) as any).features??[]) as any[]);
const speeds=[1,2,5,10,20];
const tabs=['Overview','Politics','Economy','Diplomacy','Military','Intelligence','Production','Technology','Population','Territory'];
type Preset={id:string;name:string;description:string;date:string;playerNation:string;state:WorldState};

function seedWorld(date=START_DATE,playerNation?:string):WorldState{
 const state=createWorldState(date);
 const regionNames=['Northern Core','Southern Core','Eastern Frontier','Western Corridor','Capital District'];
 for(const f of countries){
  const id=String(f.id??'0'), n=makeNation(id,f.properties?.name??'Unknown');
  state.nations[id]={id:n.id,name:n.name,government:n.government,population:n.population,gdp:n.gdp,treasury:n.gdp*.15,debt:0,stability:n.stability,legitimacy:65,industrialCapacity:n.industry,civilianFactories:Math.max(5,Math.round(n.industry*.45)),militaryFactories:Math.max(2,Math.round(n.industry*.14)),dockyards:Math.max(1,Math.round(n.industry*.05)),manpower:n.population*n.manpowerRate,research:1,technology:['Agriculture','Basic Industry'],laws:[],relations:{},alliances:[],wars:[],ideology:n.ideology,politicalGoals:n.politicalGoals,resources:n.resources,strategicRegions:n.strategicRegions,majorCities:n.majorCities,historicalNotes:n.historicalNotes};
  const baseCentroid=(path.centroid(f) as [number,number]);
  state.mapEntities[id]={id,name:n.name,category:'country',controller:id,owner:id,areaKm2:1,population:n.population*1e6,mapSource:'bundled-world-atlas',centroid:baseCentroid,geometryKey:id,children:[],adjacency:[],development:n.industry,infrastructure:50,ratios:{childrenPerParent:0,populationShare:1,areaShare:1,urbanization:n.urbanization/100,density:n.population}};
  ensureNationSystems(state,state.nations[id]);
 }
 syncPoliticalMap(state); state.playerNation=playerNation??'840'; return state;
}
function pct(v:number){return Math.round(v*100)+'%'}
function identityColor(key:string){let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;return 'hsl('+h%360+' 38% 42%)'}
function formatBig(v:number){return v>=100?v.toFixed(0):v.toFixed(1)}

export default function GameShell(){
 const [screen,setScreen]=useState<'launcher'|'game'>('launcher');
 const [worldState,setWorldState]=useState<WorldState>(()=>seedWorld());
 const [selected,setSelected]=useState<NationState|null>(null);
 const [paused,setPaused]=useState(true),[speed,setSpeed]=useState(1),[tab,setTab]=useState('Overview');
 const [command,setCommand]=useState(''),[log,setLog]=useState<string[]>([]);
 const [saves,setSaves]=useState<{name:string;date:string;state:WorldState}[]>([]);
 const [presetName,setPresetName]=useState(''),[presetDate,setPresetDate]=useState(START_DATE),[presetNation,setPresetNation]=useState('840');
 const [showMenu,setShowMenu]=useState(false),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[mapMode,setMapMode]=useState<'political'|'economy'|'military'|'resources'>('political');
 const svgRef=useRef<SVGSVGElement|null>(null);
 const drag=useRef<{id:number;x:number;y:number;px:number;py:number}|null>(null);
 const pinch=useRef<{distance:number;zoom:number}|null>(null);
 const W=1200,H=650;
 const projection=useMemo(()=>geoNaturalEarth1().fitSize([W,H],{type:'FeatureCollection',features:countries} as any),[]);
 const path=useMemo(()=>geoPath(projection),[projection]);
 const nation=worldState.playerNation?worldState.nations[worldState.playerNation]:undefined;
 const activeEvents=worldState.events.filter(e=>!e.resolved);

 useEffect(()=>{try{const raw=localStorage.getItem('worldforge-saves');if(raw)setSaves(JSON.parse(raw));}catch{}},[]);
 useEffect(()=>{if(screen!=='game'||paused)return;const id=setInterval(()=>setWorldState(s=>advanceWorld(s,speed)),650);return()=>clearInterval(id)},[screen,paused,speed]);
 useEffect(()=>{if(screen==='game'){try{localStorage.setItem('worldforge-autosave',JSON.stringify(worldState));}catch{}}},[worldState,screen]);

 function enter(state:WorldState){setWorldState(state);const p=state.playerNation??'840';setSelected(makeNation(p,state.nations[p]?.name??'United States'));setScreen('game');setTab('Overview');setPaused(true);setPan({x:0,y:0});setZoom(1)}
 function newGame(){enter(seedWorld(presetDate,presetNation));setLog(['New simulation initialized.'])}
 function resume(){try{const raw=localStorage.getItem('worldforge-save');if(raw){enter(JSON.parse(raw));setLog(['Saved campaign resumed.']);return}}catch{} setLog(['No manual save found.']);}
 function quick(c:string){const s=structuredClone(worldState);const r=issueCommand(s,c,worldState.playerNation??'');setWorldState(s);setLog(x=>[r.message,...x].slice(0,12))}
 function selectCountry(id:string,name:string){const live=worldState.nations[id];const n=live?makeNation(id,live.name):makeNation(id,name);setWorldState(s=>({...s,playerNation:id}));setSelected(n);setTab('Overview');setShowMenu(true)}
 function save(){try{localStorage.setItem('worldforge-save',JSON.stringify(worldState));localStorage.setItem('worldforge-save-version','2.0');const entry={name:(worldState.nations[worldState.playerNation??'840']?.name??'Campaign')+' Campaign',date:worldState.date,state:worldState};const next=[entry,...saves.filter(s=>!(s.date===entry.date&&s.name===entry.name))].slice(0,8);localStorage.setItem('worldforge-saves',JSON.stringify(next));setSaves(next);setLog(x=>['Campaign saved on this device.',...x])}catch{setLog(x=>['Save failed.',...x])}}
 function createPreset(){const p:Preset={id:crypto.randomUUID(),name:presetName.trim()||'Custom Scenario',description:'Player-created Worldforge preset',date:presetDate,playerNation:presetNation,state:seedWorld(presetDate,presetNation)};try{const raw=localStorage.getItem('worldforge-presets');const list:Preset[]=raw?JSON.parse(raw):[];list.unshift(p);localStorage.setItem('worldforge-presets',JSON.stringify(list));setLog(['Preset created: '+p.name]);setPresetName('')}catch{}}
 function loadPresets():Preset[]{try{return JSON.parse(localStorage.getItem('worldforge-presets')||'[]')}catch{return[]}}
 const builtInPresets:Preset[]=[{id:'builtin-1936',name:'The World · 1936',description:'Baseline pre-war campaign',date:'1936-01-01',playerNation:'840',state:seedWorld('1936-01-01','840')},{id:'builtin-1939',name:'The World · 1939',description:'Late pre-war campaign',date:'1939-09-01',playerNation:'826',state:seedWorld('1939-09-01','826')},{id:'builtin-1941',name:'The World · 1941',description:'Global-war campaign',date:'1941-06-22',playerNation:'643',state:seedWorld('1941-06-22','643')},{id:'builtin-czech',name:'Czechoslovakia · 1941',description:'Alternate-history Central European campaign',date:'1941-11-13',playerNation:'203',state:seedWorld('1941-11-13','203')}];
 function startPreset(p:Preset){enter(structuredClone(p.state))}
 function onWheel(e:React.WheelEvent){e.preventDefault();const next=Math.max(.7,Math.min(5,zoom*(e.deltaY<0?1.12:.89)));setZoom(next)}
 const pointers=useRef<Map<number,{x:number;y:number}>>(new Map());
 function onPointerDown(e:React.PointerEvent<SVGSVGElement>){e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===1)drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};if(pointers.current.size===2){const p=[...pointers.current.values()];pinch.current={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom}}
 function onPointerMove(e:React.PointerEvent<SVGSVGElement>){pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===2&&pinch.current){const p=[...pointers.current.values()];const d=Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y));setZoom(Math.max(.7,Math.min(5,pinch.current.zoom*d/pinch.current.distance)));return}if(!drag.current||drag.current.id!==e.pointerId)return;setPan({x:drag.current.px+e.clientX-drag.current.x,y:drag.current.py+e.clientY-drag.current.y})}
 function onPointerUp(e?:React.PointerEvent<SVGSVGElement>){if(e)pointers.current.delete(e.pointerId);if(pointers.current.size<2)pinch.current=null;if(pointers.current.size===0)drag.current=null}
 function distance(a:PointerEvent,b:PointerEvent){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
 function detail(){
  if(!nation)return <div className='empty-panel'>Select a country directly on the map.</div>;
  if(tab==='Diplomacy')return <><h3>Foreign Relations</h3>{Object.entries(nation.relations).slice(0,8).map(([id,v])=><div className='row' key={id}><span>{worldState.nations[id]?.name??id}</span><b>{v}</b></div>)}<div className='actions'><button onClick={()=>quick('relations France')}>Improve France</button><button onClick={()=>quick('relations Germany')}>Improve Germany</button><button onClick={()=>quick('ally France')}>Alliance France</button></div></>;
  if(tab==='Economy'||tab==='Production')return <><h3>Economic Command</h3><div className='mini-grid'><Metric title='GDP' value={formatBig(nation.gdp)+' B'}/><Metric title='Treasury' value={formatBig(nation.treasury)+' B'}/><Metric title='Industry' value={String(nation.industrialCapacity)}/><Metric title='Tax' value={pct(worldState.economy[nation.id]?.taxRate??.2)}/></div><div className='actions'><button onClick={()=>quick('build industry')}>Build Industry</button><button onClick={()=>quick('build infrastructure')}>Infrastructure</button><button onClick={()=>quick('tax 15')}>Tax 15%</button><button onClick={()=>quick('tax 30')}>Tax 30%</button></div></>;
  if(tab==='Military')return <><h3>Armed Forces</h3><div className='mini-grid'><Metric title='Manpower' value={formatBig(nation.manpower)+' M'}/><Metric title='Readiness' value={String(Math.round(worldState.military[nation.id]?.readiness??50))}/><Metric title='Supply' value={pct(worldState.military[nation.id]?.supply??1)}/><Metric title='War Support' value={String(Math.round(worldState.military[nation.id]?.warSupport??50))}/></div><div className='actions'><button onClick={()=>quick('mobilize')}>Mobilize</button><button onClick={()=>quick('recruit 5000')}>Recruit</button><button onClick={()=>quick('demobilize')}>Demobilize</button><button onClick={()=>quick('war Germany')}>War: Germany</button></div></>;
  if(tab==='Politics')return <><h3>Political State</h3><div className='row'><span>Ideology</span><b>{nation.ideology}</b></div><div className='row'><span>Strategic goals</span><b>{nation.politicalGoals.join(' · ')}</b></div><div className='mini-grid'><Metric title='Government' value={nation.government}/><Metric title='Stability' value={String(Math.round(nation.stability))}/><Metric title='Legitimacy' value={String(Math.round(nation.legitimacy))}/><Metric title='Laws' value={String(nation.laws.length)}/></div></>;
  if(tab==='Population')return <><h3>Population</h3><div className='mini-grid'><Metric title='Population' value={formatBig(nation.population)+' M'}/><Metric title='Manpower rate' value={pct(nation.manpowerRate)}/><Metric title='Urbanization' value={String(Math.round((worldState.mapEntities[nation.id]?.ratios.urbanization??.3)*100))+'%'}/><Metric title='Literacy' value={String(Math.round(makeNation(nation.id,nation.name).literacy))+'%'}/></div></>;
  if(tab==='Technology')return <><h3>Research Portfolio</h3>{(nation.technology.length?nation.technology:['Agriculture','Basic Industry','Logistics','Communications']).map(t=><div className='row' key={t}><span>{t}</span><b>ACTIVE</b></div>)}<button className='full-button' onClick={()=>quick('research '+(nation.technology.length+1))}>Fund Research</button></>;
  if(tab==='Territory')return <><h3>Strategic Geography</h3><div className='row'><span>Capital</span><b>{nation.capital}</b></div><div className='row'><span>Major cities</span><b>{nation.majorCities.join(' · ')}</b></div><div className='row'><span>Regions</span><b>{nation.strategicRegions.join(' · ')}</b></div><h3>Resource Base</h3>{Object.entries(nation.resources).map(([k,v])=><div className='row' key={k}><span>{k}</span><b>{Math.round(v)}</b></div>)}</>;
  if(tab==='Intelligence')return <><h3>Intelligence</h3><div className='mini-grid'><Metric title='Recon' value='50'/><Metric title='Counterintel' value='50'/><Metric title='Network' value='25%'/><Metric title='Deception' value='20'/></div></>;
  return <><h3>{nation.name}</h3><p className='muted'>The map is the primary interface. Tap another country to change the player polity, then use the floating command panel for government, economy, diplomacy and military actions.</p><div className='mini-grid'><Metric title='Population' value={formatBig(nation.population)+' M'}/><Metric title='GDP' value={formatBig(nation.gdp)+' B'}/><Metric title='Industry' value={String(nation.industrialCapacity)}/><Metric title='Stability' value={String(Math.round(nation.stability))}/></div></>;
 }
 if(screen==='launcher'){
  const presets=loadPresets();
  return <main className='launcher'><div className='launcher-card'><div className='eyebrow'>GRAND STRATEGY WORLD SIMULATOR</div><h1>WORLDFORGE</h1><p className='muted'>Choose a campaign before entering the simulation. Saved campaigns and custom presets stay on this device.</p><div className='preset-section'><h2>Built-in Presets</h2><div className='save-list'>{builtInPresets.map(p=><button key={p.id} onClick={()=>startPreset(p)}><b>{p.name}</b><span>{p.date} · {p.description}</span></button>)}</div></div><div className='launch-grid'><section><h2>Resume</h2><button className='hero-button' onClick={resume}>Resume Saved Campaign</button><div className='save-list'>{saves.length?saves.map((s,i)=><button key={i} onClick={()=>enter(s.state)}><b>{s.name}</b><span>{s.date}</span></button>):<div className='muted'>No manual saves yet.</div>}</div></section><section><h2>New Preset</h2><label>Scenario name<input value={presetName} onChange={e=>setPresetName(e.target.value)} placeholder='My World'/></label><label>Start date<input type='date' value={presetDate} onChange={e=>setPresetDate(e.target.value)}/></label><label>Player nation<select value={presetNation} onChange={e=>setPresetNation(e.target.value)}>{countries.map(f=>{const id=String(f.id);return <option key={id} value={id}>{makeNation(id,f.properties?.name??'Unknown').name}</option>})}</select></label><div className='actions'><button className='hero-button' onClick={newGame}>Start New Simulation</button><button onClick={createPreset}>Save Preset</button></div></section></div>{presets.length>0&&<section className='preset-section'><h2>Saved Presets</h2><div className='save-list'>{presets.map(p=><button key={p.id} onClick={()=>startPreset(p)}><b>{p.name}</b><span>{p.date} · {p.state.nations[p.playerNation]?.name??p.playerNation}</span></button>)}</div></section>}<div className='muted'>Built-in world geography is bundled with the game; country profiles are initialized for every mapped country feature.</div></div></main>;
 }
 return <main className='game-shell'>
  <svg ref={svgRef} viewBox={'0 0 '+W+' '+H} className='map-stage' onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
   <rect width={W} height={H} className='ocean'/>
   <g transform={'translate('+pan.x+' '+pan.y+') translate('+W/2+' '+H/2+') scale('+zoom+') translate('+(-W/2)+' '+(-H/2)+')'}>
    {countries.map((f,i)=>{const id=String(f.id??i),n=makeNation(id,f.properties?.name??'Unknown'),cent=path.centroid(f);return <g key={id} onClick={(e)=>{e.stopPropagation();selectCountry(id,n.name)}}><path d={path(f)||''} style={{fill:identityColor(worldState.political.identities[id]?.colorKey??id)}} className={'country '+(worldState.playerNation===id?'selected':'')}><title>{n.name}</title></path>{zoom>1.15&&Number.isFinite(cent[0])&&Number.isFinite(cent[1])&&<><text x={cent[0]} y={cent[1]} className='nation-label'>{n.name}</text><text x={cent[0]} y={cent[1]-10} className='capital-marker'>★</text></>}</g>})}
   </g>
  </svg>
  <header className='floating top-controls'><button onClick={()=>setShowMenu(!showMenu)}>☰</button><div><div className='eyebrow'>WORLDFORGE · {tab.toUpperCase()}</div><strong>{worldState.date}</strong></div><div className='time-controls'><button onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button><select value={speed} onChange={e=>setSpeed(+e.target.value)}>{speeds.map(x=><option key={x} value={x}>{x}×</option>)}</select><button onClick={save}>Save</button></div></header>
  <div className='floating map-hint'>Pinch / scroll to zoom · drag to pan · tap a country or region</div><div className='floating map-modes'>{(['political','economy','military','resources'] as const).map(m=><button className={mapMode===m?'active':''} onClick={()=>setMapMode(m)} key={m}>{m}</button>)}</div>
  <nav className='floating tab-dock'>{tabs.map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</nav>
  {showMenu&&<div className='floating menu-pop'><button onClick={()=>setScreen('launcher')}>Campaign / Presets</button><button onClick={save}>Save Campaign</button><button onClick={()=>setShowMenu(false)}>Close</button></div>}
  {selected&&<aside className='floating info-panel'><div className='panel-title'><div><div className='eyebrow'>PLAYER POLITY</div><h2>{nation?.name}</h2></div><button onClick={()=>setSelected(null)}>×</button></div>{detail()}</aside>}
  {activeEvents.length>0&&<div className='floating event-stack'>{activeEvents.slice(0,2).map(e=><div className='event-card' key={e.id}><b>{e.title}</b><p>{e.description}</p><div className='actions'>{e.options.map((o,i)=><button key={o} onClick={()=>{const s=structuredClone(worldState);const r=applyEventEffects(s,e.id,i);setWorldState(s);setLog(l=>[r.message,...l].slice(0,12))}}>{o}</button>)}</div></div>)}</div>}
  <form className='floating command-bar' onSubmit={e=>{e.preventDefault();if(command.trim())quick(command);setCommand('')}}><input value={command} onChange={e=>setCommand(e.target.value)} placeholder='Issue command…'/><button>Issue</button></form>
  <div className='floating zoom-dock'><button onClick={()=>setZoom(z=>Math.min(5,z*1.2))}>+</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.max(.7,z/1.2))}>−</button><button onClick={()=>{setZoom(1);setPan({x:0,y:0})}}>Reset</button></div>
  {log.length>0&&<div className='floating log-dock'>{log.slice(0,4).map((x,i)=><div key={i}>{x}</div>)}</div>}
 </main>
}
function Metric({title,value}:{title:string;value:string}){return <div className='metric'><span>{title}</span><b>{value}</b></div>}
