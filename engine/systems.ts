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
  n.manpower=Math.max(0,n.manpower-m.casualtyDrain(units)*days);
 }
}
function casualtyDrain(units:{strength:number}[]){return units.reduce((s,u)=>s+u.strength*.000001,0);}

export function runDiplomacy(state:WorldState):void{
 for(const n of Object.values(state.nations)){
  ensureNationSystems(state,n);
  for(const [id,value] of Object.entries(n.relations)) n.relations[id]=clamp(value,-100,100);
  state.diplomacy[n.id].relations={...n.relations};
 }
}

export function runWorldSystems(state:WorldState,days:number):void{
 runDemographics(state,days); runEconomy(state,days); runMilitary(state,days); runDiplomacy(state);
}
