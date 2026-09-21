import {WorldState} from './types';
import {ensureNationSystems} from './state';
import {runWorldSystems,generateDynamicEvents,processCommandCatalysts} from './systems';
import {receiveCliopatriaSnapshot,transmitHistoricalPressure} from './cliopatria-bridge';

export function syncPoliticalMap(state:WorldState):void{
 const propagate=(parentId:string,owner:string,controller:string)=>{
  const parent=state.mapEntities[parentId];if(!parent)return;
  for(const childId of parent.children){
   const child=state.mapEntities[childId];if(!child)continue;
   if(child.owner===parentId||child.owner===parent.owner)child.owner=owner;
   if(child.controller===parentId||child.controller===parent.controller)child.controller=controller;
   propagate(child.id,child.owner,child.controller);
  }
 };
 for(const nation of Object.values(state.nations)){
  const old=state.political.identities[nation.id];
  if(!old)state.political.identities[nation.id]={entityId:nation.id,name:nation.name,flagKey:'generated-'+nation.id,colorKey:'nation-'+nation.id,capital:nation.capital,government:nation.government};
  else {old.name=nation.name;old.capital=nation.capital;old.government=nation.government;}
  const root=state.mapEntities[nation.id];
  if(root)propagate(root.id,root.owner,root.controller);
  ensureNationSystems(state,nation);
 }
 state.political.mapRevision+=1;
}

export function advanceWorld(state:WorldState,days=1):WorldState{
 const next:WorldState=structuredClone(state);
 next.tick+=1;
 next.scenario.divergence=Math.max(0,Math.min(100,next.scenario.divergence));
 next.scenario.lastAdvanceDays=days;
 const d=new Date(next.date+'T00:00:00Z');
 d.setUTCDate(d.getUTCDate()+days);
 next.date=d.toISOString().slice(0,10);
 runWorldSystems(next,days);
 syncPoliticalMap(next);
 generateDynamicEvents(next,days);
 return next;
}

export function issueCommandWithCatalyst(state:WorldState,command:string,player:string){processCommandCatalysts(state,command,player);}

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
  if(e.kind==='transfer'&&e.target&&state.mapEntities[e.target]&&e.name){const nextOwner=String(e.data?.ownerId??e.name); const nextController=String(e.data?.controllerId??e.data?.ownerId??e.name); const previousOwner=state.mapEntities[e.target].owner; state.mapEntities[e.target].owner=nextOwner; state.mapEntities[e.target].controller=nextController; state.political.borderHistory.push({entityId:e.target,owner:nextOwner,controller:nextController,from:previousOwner,reason:'Event transfer',date:state.date}); state.political.mapRevision+=1;}
  if(e.kind==='mobilization'&&e.target&&state.military[e.target])state.military[e.target].mobilization=Math.max(0,Math.min(100,state.military[e.target].mobilization+(e.value??0)));
  if(e.kind==='warSupport'&&e.target&&state.military[e.target])state.military[e.target].warSupport=Math.max(0,Math.min(100,state.military[e.target].warSupport+(e.value??0)));
  if(e.kind==='industry'&&e.target&&state.nations[e.target])state.nations[e.target].industrialCapacity=Math.max(0,state.nations[e.target].industrialCapacity+(e.value??0));
  if(e.kind==='manpower'&&e.target&&state.nations[e.target])state.nations[e.target].manpower=Math.max(0,state.nations[e.target].manpower+(e.value??0));
  if(e.kind==='rename'&&e.target&&state.nations[e.target]&&e.name)state.nations[e.target].name=e.name;
  if(e.kind==='flag'&&e.target&&state.political.identities[e.target]&&e.name)state.political.identities[e.target].flagKey=e.name;
  if(e.kind==='color'&&e.target&&state.political.identities[e.target]&&e.name)state.political.identities[e.target].colorKey=e.name;
  if(e.kind==='historicalPressure'&&e.target){
   const recordId=String(e.data?.recordId??event.historicalRecordId??event.id);
   state.scenario.historicalTrackers[recordId]=(state.scenario.historicalTrackers[recordId]??0)+(e.value??0);
   const target=state.nations[e.target];
   if(target){
    target.legitimacy=Math.max(0,Math.min(100,target.legitimacy+(option===0?.25:-.25)));
    target.stability=Math.max(0,Math.min(100,target.stability+(option===0?.1:-.2)));
   }
  }
 }
 event.resolved=true; pushNewsForResolution(state,event,option); syncPoliticalMap(state); return {ok:true,message:event.title+' resolved.'};
}

function pushNewsForResolution(state:WorldState,event:any,option:number){state.news.unshift({id:'news-resolution-'+event.id+'-'+option,date:state.date,title:'Decision recorded: '+event.title,summary:'The player resolved '+event.title+' using option '+(option+1)+'. The consequences will feed back into future simulation logic.',category:event.category??'political',importance:Math.min(8,(event.importance??event.severity??2)+1),relatedEvent:event.id,source:'player'});state.news=state.news.slice(0,80);}

/** Async simulation entry point that synchronizes the historical spatial dataset before each tick. */
export async function advanceWorldWithData(state:WorldState,days=1):Promise<WorldState>{
 const prepared=structuredClone(state);
 const targetDate=new Date(prepared.date+'T00:00:00Z');
 targetDate.setUTCDate(targetDate.getUTCDate()+Math.min(3650,Math.max(1,Math.round(days))));
 const targetYear=Number(targetDate.toISOString().slice(0,4));
 try{await receiveCliopatriaSnapshot(prepared,targetYear);transmitHistoricalPressure(prepared);}catch(error){console.warn('Cliopatria synchronization unavailable; continuing with local world data.',error);}
 return advanceWorld(prepared,days);
}
