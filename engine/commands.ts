import {WorldState} from './types';
import {ensureNationSystems} from './state';

export type CommandResult={ok:boolean;message:string};

function findNation(state:WorldState,name:string){
 const q=name.toLowerCase().trim();
 return Object.values(state.nations).find(x=>x.name.toLowerCase()===q||x.id===q);
}

export function issueCommand(state:WorldState,raw:string,player:string):CommandResult{
 const parts=raw.trim().split(/\s+/); const op=(parts.shift()??'').toLowerCase();
 if(!op) return {ok:false,message:'Empty command.'};
 const n=state.nations[player]; if(!n) return {ok:false,message:'Select a nation first.'};
 ensureNationSystems(state,n);

 if(op==='build'&&parts[0]?.toLowerCase()==='industry'){
  if(n.treasury<5)return{ok:false,message:'Insufficient treasury.'};
  n.industrialCapacity+=1;n.treasury-=5;state.economy[n.id].construction+=1;
  return{ok:true,message:'Industrial capacity project commissioned (-5 treasury).'};
 }
 if(op==='build'&&parts[0]?.toLowerCase()==='infrastructure'){
  if(n.treasury<3)return{ok:false,message:'Insufficient treasury.'};
  n.treasury-=3;state.economy[n.id].construction+=2;
  const owned=Object.values(state.mapEntities).filter(x=>x.owner===n.id);
  owned.slice(0,3).forEach(x=>x.infrastructure=Math.min(100,x.infrastructure+2));
  return{ok:true,message:'Infrastructure program funded (-3 treasury).'};
 }
 if(op==='mobilize'){state.military[n.id].mobilization=Math.min(100,state.military[n.id].mobilization+10);state.military[n.id].warSupport=Math.min(100,state.military[n.id].warSupport+2);return{ok:true,message:'Mobilization order issued.'};}
 if(op==='demobilize'){state.military[n.id].mobilization=Math.max(0,state.military[n.id].mobilization-10);return{ok:true,message:'Demobilization order issued.'};}
 if(op==='research'){
  n.research+=1; const tech=parts.join(' ')||'Industrial Methods'; if(!n.technology.includes(tech))n.technology.push(tech);
  return{ok:true,message:'Research program expanded: '+tech+'.'};
 }
 if(op==='tax'&&parts[0]){
  const rate=Number(parts[0].replace('%',''))/100;if(!Number.isFinite(rate))return{ok:false,message:'Tax rate must be numeric.'};
  state.economy[n.id].taxRate=Math.max(0,Math.min(.8,rate));return{ok:true,message:'Tax policy set to '+Math.round(state.economy[n.id].taxRate*100)+'%.'};
 }
 if(op==='relations'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target)return{ok:false,message:'Nation not found.'};
  n.relations[target.id]=Math.min(100,(n.relations[target.id]??0)+5);state.diplomacy[n.id].relations={...n.relations};
  return{ok:true,message:'Diplomatic outreach improved relations with '+target.name+'.'};
 }
 if(op==='ally'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target||target.id===n.id)return{ok:false,message:'Nation not found.'};
  if(!n.alliances.includes(target.id))n.alliances.push(target.id);
  if(!target.alliances.includes(n.id))target.alliances.push(n.id);
  n.relations[target.id]=Math.max(n.relations[target.id]??0,25);target.relations[n.id]=Math.max(target.relations[n.id]??0,25);
  return{ok:true,message:'Alliance treaty proposed and recorded with '+target.name+'.'};
 }
 if(op==='war'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target||target.id===n.id)return{ok:false,message:'Nation not found.'};
  if(!n.wars.includes(target.id))n.wars.push(target.id);if(!target.wars.includes(n.id))target.wars.push(n.id);
  state.military[n.id].warSupport=Math.min(100,state.military[n.id].warSupport+10);
  return{ok:true,message:'State of war declared with '+target.name+'.'};
 }
 if(op==='peace'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target)return{ok:false,message:'Nation not found.'};
  n.wars=n.wars.filter(x=>x!==target.id);target.wars=target.wars.filter(x=>x!==n.id);
  return{ok:true,message:'Peace agreement concluded with '+target.name+'.'};
 }
 if(op==='recruit'){
  const strength=Math.max(1000,Number(parts[0])||5000); const id=n.id+'-army-'+Date.now();
  state.units[id]={id,nation:n.id,name:'Expeditionary Formation',kind:'infantry',strength,organization:55,equipment:70,experience:0,manpower:strength};
  n.manpower=Math.max(0,n.manpower-strength/1e6); return{ok:true,message:'New army formation raised: '+Math.round(strength).toLocaleString()+' personnel.'};
 }
 return{ok:false,message:'Unknown command. Try build industry, build infrastructure, mobilize, recruit 5000, research, tax 25, relations Germany, ally France, war Germany, or peace Germany.'};
}