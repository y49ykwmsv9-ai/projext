import {WorldState} from './types';
import {runWorldSystems} from './systems';

export function advanceWorld(state:WorldState,days=1):WorldState{
 const next:WorldState=structuredClone(state);
 next.tick+=1;
 const d=new Date(next.date+'T00:00:00Z');
 d.setUTCDate(d.getUTCDate()+days);
 next.date=d.toISOString().slice(0,10);
 runWorldSystems(next,days);
 return next;
}

export function changeRelation(state:WorldState,a:string,b:string,delta:number){
 const n=state.nations[a]; if(!n)return;
 const v=n.relations[b]??0;
 n.relations[b]=Math.max(-100,Math.min(100,v+delta));
}
