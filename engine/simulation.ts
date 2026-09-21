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

export function applyEventEffects(state:WorldState,eventId:string,option=0):{ok:boolean;message:string}{
 const event=state.events.find(e=>e.id===eventId); if(!event||event.resolved)return {ok:false,message:'Event unavailable.'};
 const effects=(event.effects??[]); const chosen=effects.filter((e:any)=>e.data?.option===option || e.data?.option===undefined);
 for(const e of chosen){
  if(e.kind==='relation'&&e.target&&state.playerNation){const n=state.nations[state.playerNation]; if(n)n.relations[e.target]=Math.max(-100,Math.min(100,(n.relations[e.target]??0)+(e.value??0)));}
  if(e.kind==='stability'&&e.target&&state.nations[e.target])state.nations[e.target].stability=Math.max(0,Math.min(100,state.nations[e.target].stability+(e.value??0)));
  if(e.kind==='treasury'&&e.target&&state.nations[e.target])state.nations[e.target].treasury+=e.value??0;
  if(e.kind==='gdp'&&e.target&&state.nations[e.target])state.nations[e.target].gdp=Math.max(0,state.nations[e.target].gdp+(e.value??0));
  if(e.kind==='transfer'&&e.target&&state.mapEntities[e.target]&&e.name){state.mapEntities[e.target].owner=e.name;state.mapEntities[e.target].controller=e.name;}
 }
 event.resolved=true; return {ok:true,message:event.title+' resolved.'};
}
