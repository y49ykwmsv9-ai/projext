import {WorldState} from './types';
export function advanceWorld(state:WorldState,days=1):WorldState{
 const next:WorldState=structuredClone(state); next.tick+=1;
 const d=new Date(next.date+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+days); next.date=d.toISOString().slice(0,10);
 for(const nation of Object.values(next.nations)){
  const growth=nation.population*.00002*days;
  nation.population=Math.max(0,nation.population+growth);
  nation.gdp=Math.max(0,nation.gdp*(1+0.00005*days*(nation.stability/100)));
  nation.stability=Math.max(0,Math.min(100,nation.stability+(nation.legitimacy-50)*0.0002*days));
  nation.treasury+=nation.gdp*0.00002*days-nation.debt*0.00001*days;
 }
 return next;
}
export function changeRelation(state:WorldState,a:string,b:string,delta:number){const n=state.nations[a];if(!n)return;const v=n.relations[b]??0;n.relations[b]=Math.max(-100,Math.min(100,v+delta));}
