import {WorldState} from './types';
import {ensureNationSystems} from './state';

export type CommandResult={ok:boolean;message:string};

function normalize(s:string){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,"'").trim();}
function findNation(state:WorldState,name:string){
 const q=normalize(name);
 const all=Object.values(state.nations);
 return all.find(x=>normalize(x.name)===q||normalize(x.id)===q)
   ?? all.find(x=>normalize(x.name).startsWith(q))
   ?? all.find(x=>normalize(x.name).includes(q));
}
function ensureRelationPair(state:WorldState,a:string,b:string){
 const na=state.nations[a],nb=state.nations[b]; if(!na||!nb)return;
 if(na.relations[b]===undefined)na.relations[b]=0;
 if(nb.relations[a]===undefined)nb.relations[a]=0;
}

export function issueCommand(state:WorldState,raw:string,player:string):CommandResult{
 const parts=raw.trim().split(/\s+/); const op=(parts.shift()??'').toLowerCase();
 if(!op)return {ok:false,message:'Empty command.'};
 const n=state.nations[player]; if(!n)return {ok:false,message:'Select a nation first.'};
 ensureNationSystems(state,n);

 if(op==='help')return{ok:true,message:'Commands: build industry, build infrastructure, build dockyard, mobilize, demobilize, recruit 5000, deploy <country>, move <country>, research <topic>, tax 25, relations <country>, ally <country>, trade <country>, sanction <country>, lift sanction <country>, war <country>, peace <country>.'};

 if(op==='build'){
  const what=parts[0]?.toLowerCase();
  if(what==='industry'){
   if(n.treasury<5)return{ok:false,message:'Insufficient treasury.'};
   n.industrialCapacity+=1;n.treasury-=5;state.economy[n.id].construction+=1;
   return{ok:true,message:'Industrial capacity project commissioned (-5 treasury).'};
  }
  if(what==='infrastructure'){
   if(n.treasury<3)return{ok:false,message:'Insufficient treasury.'};
   n.treasury-=3;state.economy[n.id].construction+=2;
   Object.values(state.mapEntities).filter(x=>x.owner===n.id).slice(0,8).forEach(x=>x.infrastructure=Math.min(100,x.infrastructure+2));
   return{ok:true,message:'Infrastructure program funded (-3 treasury).'};
  }
  if(what==='dockyard'){
   if(n.treasury<8)return{ok:false,message:'Insufficient treasury.'};
   n.treasury-=8;n.dockyards+=1;return{ok:true,message:'Naval construction yard commissioned (-8 treasury).'};
  }
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
 if((op==='relations'||op==='improve')&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target)return{ok:false,message:'Nation not found.'};
  ensureRelationPair(state,n.id,target.id);
  n.relations[target.id]=Math.min(100,(n.relations[target.id]??0)+5);
  target.relations[n.id]=Math.min(100,(target.relations[n.id]??0)+2);
  state.diplomacy[n.id].relations={...n.relations};state.diplomacy[target.id].relations={...target.relations};
  return{ok:true,message:'Diplomatic outreach improved relations with '+target.name+'.'};
 }
 if(op==='ally'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target||target.id===n.id)return{ok:false,message:'Nation not found.'};
  ensureRelationPair(state,n.id,target.id);
  if(!n.alliances.includes(target.id))n.alliances.push(target.id);
  if(!target.alliances.includes(n.id))target.alliances.push(n.id);
  n.relations[target.id]=Math.max(n.relations[target.id]??0,25);target.relations[n.id]=Math.max(target.relations[n.id]??0,25);
  return{ok:true,message:'Alliance treaty recorded with '+target.name+'.'};
 }
 if(op==='trade'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target||target.id===n.id)return{ok:false,message:'Nation not found.'};
  ensureRelationPair(state,n.id,target.id);
  if(n.treasury<1)return{ok:false,message:'Insufficient treasury for trade mission.'};
  n.treasury-=1;n.gdp+=.15;target.gdp+=.08;n.relations[target.id]=Math.min(100,(n.relations[target.id]??0)+3);target.relations[n.id]=Math.min(100,(target.relations[n.id]??0)+1);
  return{ok:true,message:'Trade agreement opened with '+target.name+' (-1 treasury).'};
 }
 if(op==='sanction'&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target||target.id===n.id)return{ok:false,message:'Nation not found.'};
  state.diplomacy[n.id].sanctions=Array.from(new Set([...state.diplomacy[n.id].sanctions,target.id]));
  n.relations[target.id]=Math.max(-100,(n.relations[target.id]??0)-10);
  return{ok:true,message:'Economic sanctions imposed on '+target.name+'.'};
 }
 if(op==='lift'&&parts[0]?.toLowerCase()==='sanction'&&parts.length>1){
  const target=findNation(state,parts.slice(1).join(' '));if(!target)return{ok:false,message:'Nation not found.'};
  state.diplomacy[n.id].sanctions=state.diplomacy[n.id].sanctions.filter(id=>id!==target.id);
  return{ok:true,message:'Sanctions lifted on '+target.name+'.'};
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
  state.units[id]={id,nation:n.id,name:'Expeditionary Formation',kind:'infantry',strength,organization:55,equipment:70,experience:0,manpower:strength,territory:n.id};
  n.manpower=Math.max(0,n.manpower-strength/1e6); return{ok:true,message:'New army formation raised: '+Math.round(strength).toLocaleString()+' personnel.'};
 }
 if((op==='deploy'||op==='move')&&parts.length){
  const target=findNation(state,parts.join(' '));if(!target)return{ok:false,message:'Deployment target not found.'};
  const units=Object.values(state.units).filter(u=>u.nation===n.id);
  if(!units.length)return{ok:false,message:'No formations available to move.'};
  units.forEach(u=>u.territory=target.id);
  return{ok:true,message:units.length+' formation(s) moved to '+target.name+'.'};
 }
 return{ok:false,message:'Unknown command. Type “help” for the available command list.'};
}
