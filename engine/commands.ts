import {WorldState} from './types';
import {ensureNationSystems} from './state';
export type CommandResult={ok:boolean;message:string};
export function issueCommand(state:WorldState,raw:string,player:string):CommandResult{
 const parts=raw.trim().toLowerCase().split(/\s+/); if(!parts[0]) return {ok:false,message:'Empty command'};
 const n=state.nations[player]; if(!n) return {ok:false,message:'Player nation is not defined'};
 ensureNationSystems(state,n);
 if(parts[0]==='build'&&parts[1]==='industry'){n.industrialCapacity+=1;n.treasury-=5;return{ok:true,message:'Industrial capacity project commissioned.'}}
 if(parts[0]==='mobilize'){state.military[n.id].mobilization=Math.min(100,state.military[n.id].mobilization+10);return{ok:true,message:'Mobilization order issued.'}}
 if(parts[0]==='demobilize'){state.military[n.id].mobilization=Math.max(0,state.military[n.id].mobilization-10);return{ok:true,message:'Demobilization order issued.'}}
 if(parts[0]==='research'){n.research+=1;return{ok:true,message:'Research funding increased.'}}
 if(parts[0]==='tax'&&parts[1]){const rate=Number(parts[1])/100;if(!Number.isFinite(rate))return{ok:false,message:'Tax rate must be numeric.'};state.economy[n.id].taxRate=Math.max(0,Math.min(.8,rate));return{ok:true,message:'Tax policy updated.'}}
 if(parts[0]==='improve'&&parts[1]==='relations'&&parts[2]){
  const target=Object.values(state.nations).find(x=>x.name.toLowerCase()===parts.slice(2).join(' '));
  if(!target)return{ok:false,message:'Nation not found.'}; n.relations[target.id]=Math.min(100,(n.relations[target.id]??0)+5);return{ok:true,message:'Diplomatic effort initiated.'}
 }
 return{ok:false,message:'Unknown command.'};
}
