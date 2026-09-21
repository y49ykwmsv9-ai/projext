import {WorldState,MapEntity} from './types';
import {ensureNationSystems} from './state';

function clamp(v:number,min=0,max=100){return Math.max(min,Math.min(max,v));}

/** Historical logic is pressure, not destiny. A preset supplies conditions and likely pressures; it never overwrites a divergent world. */
function runHistoricalLogic(state:WorldState):void{
 const y=Number(state.date.slice(0,4)); const s=state.scenario;
 const has=(id:string)=>s.historyLog.includes(id);
 const trigger=(id:string,condition:boolean,title:string,description:string,options:string[],effects:any[])=>{if(!condition||has(id))return;state.events.push({id,date:state.date,title,description,severity:3,options,resolved:false,effects});s.historyLog.push(id);};
 if(s.presetDate==='1936-01-01'){
  trigger('hist-1936-rearmament',y>=1936&&y<=1939&&!!state.nations['276'],'European rearmament pressure', 'The international balance is under pressure from rearmament, alliances and economic competition. The historical pattern may emerge, but current decisions can redirect it.', ['Maintain restraint','Accelerate preparations'],[{kind:'mobilization',target:'276',value:8,data:{option:1}},{kind:'industry',target:'276',value:1,data:{option:1}}]);
  trigger('hist-1938-crisis',y>=1938&&y<=1939&&!!state.nations['276']&&!!state.nations['203'],'Central European Crisis','A major Central European confrontation is becoming plausible. Its outcome depends on diplomacy, military readiness and choices already made.', ['Seek settlement','Escalate deterrence'],[{kind:'relation',target:'276',value:10,data:{option:0}},{kind:'mobilization',target:'203',value:8,data:{option:1}}]);
  trigger('hist-1939-war-window',y>=1939&&y<=1941&&!!state.nations['276'],'General European War Window','A general European war is historically plausible in this period, but it is not scripted. Existing alliances, borders, deterrence and player decisions determine whether it materializes.', ['Pursue diplomacy','Prepare for war'],[{kind:'relation',target:'276',value:6,data:{option:0}},{kind:'mobilization',target:'276',value:5,data:{option:1}}]);
 }
 if(s.presetDate==='1939-09-01'||s.presetDate==='1941-06-22'||s.presetDate==='1941-11-13'){
  trigger('hist-war-trajectory',y>=1939&&y<=1945,'World War trajectory','The preset begins during an existing historical crisis. The simulation will preserve the starting conditions, but subsequent wars, occupations and alliances remain emergent.', ['Exploit the opening','Seek a different settlement'],[{kind:'warSupport',target:state.playerNation,value:4,data:{option:0}},{kind:'relation',target:'276',value:8,data:{option:1}}]);
 }
}


export function runDemographics(state:WorldState,days:number):void{
 for(const e of Object.values(state.mapEntities)){
  const growth=(e.category==='city' ? 0.00003 : 0.000018)*days;
  e.population=Math.max(0,e.population*(1+growth));
  e.ratios.density=e.areaKm2>0?e.population/e.areaKm2:0;
  e.ratios.populationShare=e.parentId&&state.mapEntities[e.parentId]?.population?e.population/state.mapEntities[e.parentId].population:1;
 }
 for(const n of Object.values(state.nations)){
  const countryEntity=state.mapEntities[n.id];
  if(countryEntity){n.population=Math.max(.01,countryEntity.population/1e6);}
  const manpowerRatio=n.population>0?Math.min(.35,Math.max(.05,n.manpower/n.population)):0;
  n.manpower=Math.max(0,n.manpower*(1+days*.00008));
  if(!Number.isFinite(manpowerRatio))n.manpower=n.population*.22;
 }
}

export function runEconomy(state:WorldState,days:number):void{
 for(const n of Object.values(state.nations)){
  ensureNationSystems(state,n);
  const e=state.economy[n.id];
  const instability=(100-n.stability)/100;
  const industrial=Object.values(state.mapEntities).filter(x=>x.owner===n.id).reduce((s,x)=>s+x.development*x.infrastructure/100,0);
  n.industrialCapacity=Math.max(0,n.industrialCapacity+industrial*.00001*days-instability*.002*days);
  n.gdp=Math.max(0,n.gdp*(1+(n.stability/1000)*days/30)+n.industrialCapacity*.0002*days);
  e.inflation=clamp(e.inflation+(e.taxRate-.2)*.03*days+n.gdp*.000001*days,0,100);
  n.treasury+=n.gdp*e.taxRate*.00005*days-n.debt*.00001*days;
 }
}

export function runWars(state:WorldState,days:number):void{
 for(const n of Object.values(state.nations)) for(const enemyId of n.wars){
  if(n.id>enemyId)continue; const enemy=state.nations[enemyId]; if(!enemy)continue;
  const a=state.military[n.id],b=state.military[enemy.id]; const ap=a.readiness*a.supply*(1+a.mobilization/100),bp=b.readiness*b.supply*(1+b.mobilization/100);
  const ac=Math.max(0,Math.round((bp/(ap+bp+1))*.02*n.population*days)); const bc=Math.max(0,Math.round((ap/(ap+bp+1))*.02*enemy.population*days));
  a.casualties+=ac;b.casualties+=bc;n.manpower=Math.max(0,n.manpower-ac/1e6);enemy.manpower=Math.max(0,enemy.manpower-bc/1e6);
  a.warSupport=clamp(a.warSupport+(ap>bp?1:-1)*days*.1);b.warSupport=clamp(b.warSupport+(bp>ap?1:-1)*days*.1);
 }
}

export function runMilitary(state:WorldState,days:number):void{
 for(const n of Object.values(state.nations)){
  ensureNationSystems(state,n); const m=state.military[n.id];
  const units=Object.values(state.units).filter(u=>u.nation===n.id);
  const avgOrg=units.length?units.reduce((s,u)=>s+u.organization,0)/units.length:100;
  m.supply=clamp(m.supply+(1-m.supply)*.02*days-(units.length*.0001)*days,0,1);
  m.readiness=clamp(m.readiness+(avgOrg-m.readiness)*.01*days+m.mobilization*.02*days);
  n.manpower=Math.max(0,n.manpower-casualtyDrain(units)*days);
 }
}
function casualtyDrain(units:{strength:number}[]){return units.reduce((s,u)=>s+u.strength*.000001,0);}

function aiDiplomacy(state:WorldState):void{
 for(const n of Object.values(state.nations)){
  if(!n.relations||!n.politicalGoals)continue;
  const candidates=Object.values(state.nations).filter(x=>x.id!==n.id);
  const target=candidates[(state.tick+Number(n.id.replace(/\D/g,'')))%Math.max(1,candidates.length)];
  if(!target)continue;
  const current=n.relations[target.id]??0;
  const strategicGap=target.industrialCapacity>n.industrialCapacity?1:-1;
  const drift=(n.wars.includes(target.id)?-2:strategicGap)+(n.alliances.includes(target.id)?1:0);
  n.relations[target.id]=clamp(current+drift,-100,100);
  if(current>45&&!n.alliances.includes(target.id)&&n.stability>60&&target.stability>55&&((state.tick+Number(n.id))%17===0)){n.alliances.push(target.id);if(!target.alliances.includes(n.id))target.alliances.push(n.id);}
 }
}

export function runDiplomacy(state:WorldState):void{
 for(const n of Object.values(state.nations)){
  ensureNationSystems(state,n);
  for(const [id,value] of Object.entries(n.relations)) n.relations[id]=clamp(value,-100,100);
  state.diplomacy[n.id].relations={...n.relations};
 }
}

export function runWorldSystems(state:WorldState,days:number):void{
 runDemographics(state,days); runEconomy(state,days); runMilitary(state,days); runWars(state,days); runDiplomacy(state); aiDiplomacy(state); runHistoricalLogic(state);
}

export function generateDynamicEvents(state:WorldState):void{
 const existing=new Set(state.events.map(e=>e.id));
 for(const nation of Object.values(state.nations)){
  const military=state.military[nation.id];
  if(nation.stability<35&&!existing.has('unrest-'+nation.id+'-'+state.date)){
   state.events.push({id:'unrest-'+nation.id+'-'+state.date,date:state.date,title:'Domestic Unrest',description:nation.name+' faces escalating internal unrest.',severity:3,options:['Concessions','Emergency mobilization'],resolved:false,effects:[{kind:'stability',target:nation.id,value:4,data:{option:0}},{kind:'stability',target:nation.id,value:-3,data:{option:1}},{kind:'mobilization',target:nation.id,value:10,data:{option:1}}]});
  }
  if(military&&military.mobilization>80&&nation.stability>55&&!existing.has('industrial-'+nation.id+'-'+state.date)){
   state.events.push({id:'industrial-'+nation.id+'-'+state.date,date:state.date,title:'War Production Drive',description:nation.name+' can redirect resources toward wartime industry.',severity:2,options:['Expand industry','Preserve civilian economy'],resolved:false,effects:[{kind:'industry',target:nation.id,value:2,data:{option:0}},{kind:'gdp',target:nation.id,value:-1,data:{option:0}},{kind:'stability',target:nation.id,value:1,data:{option:1}}]});
  }
  if(nation.gdp>50&&nation.stability>70&&!existing.has('diplomatic-summit-'+nation.id+'-'+state.date))state.events.push({id:'diplomatic-summit-'+nation.id+'-'+state.date,date:state.date,title:'Diplomatic Summit',description:nation.name+' has an opportunity to deepen a major foreign relationship.',severity:2,options:['Offer trade concessions','Seek a security pact'],resolved:false,effects:[{kind:'gdp',target:nation.id,value:1,data:{option:0}},{kind:'relation',target:Object.keys(state.nations).find(id=>id!==nation.id),value:8,data:{option:0}},{kind:'relation',target:Object.keys(state.nations).find(id=>id!==nation.id),value:15,data:{option:1}}]});
 }
}
