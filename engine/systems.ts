import {WorldState,MapEntity} from './types';
import {ensureNationSystems} from './state';

function clamp(v:number,min=0,max=100){return Math.max(min,Math.min(max,v));}

export function runDemographics(state:WorldState,days:number):void{
 for(const e of Object.values(state.mapEntities)){
  const density=e.areaKm2>0?e.population/e.areaKm2:0;
  const growth=(e.category==='city'?0.00003:0.000018)*days;
  e.population=Math.max(0,e.population*(1+growth));
  e.ratios.density=density;
  e.ratios.populationShare=e.parentId&&state.mapEntities[e.parentId]?.population?e.population/state.mapEntities[e.parentId].population:1;
 }
 for(const n of Object.values(state.nations)){
  n.population=Object.values(state.mapEntities).filter(e=>e.owner===n.id).reduce((s,e)=>s+e.population,0)||n.population;
  n.manpower=Math.max(0,n.population*.22);
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
 runDemographics(state,days); runEconomy(state,days); runMilitary(state,days); runDiplomacy(state); aiDiplomacy(state);
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
 }
}
