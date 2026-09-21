import {WorldState} from './types';
import {ensureNationSystems} from './state';

export type AIOrderResult={ok:boolean;message:string;actions:string[];confidence:number};

function norm(s:string){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,"'");}
function clamp(v:number,min=0,max=100){return Math.max(min,Math.min(max,v));}
function numberFrom(s:string, fallback:number){const m=s.match(/(\d+(?:\.\d+)?)(?:\s*(million|m|billion|b|thousand|k|%))?/i);if(!m)return fallback;const n=Number(m[1]),u=(m[2]||'').toLowerCase();return u==='million'||u==='m'?n*1e6:u==='billion'||u==='b'?n*1e9:u==='thousand'||u==='k'?n*1e3:n;}
function findNation(state:WorldState,text:string){
 const q=norm(text).trim(), all=Object.values(state.nations);
 return all.find(n=>norm(n.name)===q||norm(n.id)===q)??all.find(n=>norm(n.name).startsWith(q))??all.find(n=>norm(n.name).includes(q));
}
function targets(state:WorldState,text:string,player:string){
 const q=norm(text);
 return Object.values(state.nations).filter(n=>n.id!==player && (q.includes(norm(n.name))||q.includes(norm(n.name).replace(/\s+/g,' '))));
}
function mentionTargets(state:WorldState,text:string,player:string){
 const found=targets(state,text,player); return found.length?found:[];
}
function changeRelation(state:WorldState,a:string,b:string,delta:number){const na=state.nations[a],nb=state.nations[b];if(!na||!nb)return;na.relations[b]=clamp((na.relations[b]??0)+delta,-100,100);nb.relations[a]=clamp((nb.relations[a]??0)+Math.round(delta*.5),-100,100);}
function addNews(state:WorldState,title:string,summary:string,category:'political'|'diplomatic'|'economic'|'military'|'social'|'historical',importance:number,mentioned:string[]){
 const names=mentioned.map(id=>state.nations[id]?.name).filter(Boolean) as string[];
 const id='ai-order-'+state.tick+'-'+Math.abs([...title+summary].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))|0,7));
 state.news.unshift({id,date:state.date,title,summary,category,importance,source:'player',mentionedNations:Array.from(new Set(mentioned)),relatedNation:mentioned[0]});
 state.news=state.news.slice(0,80);
}
export function interpretPlayerInstruction(state:WorldState,raw:string,player:string):AIOrderResult{
 const n=state.nations[player]; if(!n)return{ok:false,message:'Select a nation first.',actions:[],confidence:0};
 ensureNationSystems(state,n);
 const text=raw.trim(),q=norm(text),actions:string[]=[],mentioned:string[]=[];
 const ns=mentionTargets(state,text,player); ns.forEach(x=>mentioned.push(x.id));
 let confidence=0;
 const change=(label:string,fn:()=>void,c=.65)=>{fn();actions.push(label);confidence=Math.max(confidence,c);};
 const is=(...words:string[])=>words.some(w=>q.includes(w));
 const target=ns[0];

 if(is('mobiliz','call up','general mobilization'))change('mobilization increased',()=>state.military[n.id].mobilization=clamp(state.military[n.id].mobilization+15));
 if(is('demobiliz','stand down'))change('mobilization reduced',()=>state.military[n.id].mobilization=clamp(state.military[n.id].mobilization-15));
 if(is('recruit','conscription','raise an army','raise troops')){const amount=Math.max(1000,Math.round(numberFrom(q,5000)));change('recruited '+Math.round(amount).toLocaleString()+' personnel',()=>{const id=n.id+'-ai-army-'+state.tick+'-'+Object.keys(state.units).length;state.units[id]={id,nation:n.id,name:'AI-raised Formation',kind:'infantry',strength:amount,organization:55,equipment:65,experience:0,manpower:amount,territory:n.id};n.manpower=Math.max(0,n.manpower-amount/1e6);});}
 if(is('build','construct','expand','industrialize')&&is('factory','industry','industrial','manufactur'))change('industrial capacity expanded',()=>{n.industrialCapacity+=Math.max(1,Math.round(numberFrom(q,1)));n.treasury-=Math.min(n.treasury,Math.max(1,Math.round(numberFrom(q,5))));});
 if(is('infrastructure','railway','railroads','roads','ports'))change('infrastructure program expanded',()=>{Object.values(state.mapEntities).filter(x=>x.owner===n.id).slice(0,12).forEach(x=>x.infrastructure=clamp(x.infrastructure+4));});
 if(is('dockyard','shipyard','naval yard'))change('naval construction capacity expanded',()=>{n.dockyards+=1;n.treasury-=Math.min(n.treasury,8);});
 if(is('research','develop','invent','technology','technolog')){const topic=text.replace(/^(please\s+)?(research|develop|invent)\s*/i,'').trim()||'Strategic Technology';change('research program opened: '+topic,()=>{n.research+=1;if(!n.technology.includes(topic))n.technology.push(topic);});}
 const taxMatch=q.match(/(?:tax|taxes|taxation)\s+(?:rate\s*)?(\d+(?:\.\d+)?)\s*%?/); if(taxMatch){const rate=Math.max(0,Math.min(80,Number(taxMatch[1])));change('tax policy set to '+rate+'%',()=>state.economy[n.id].taxRate=rate/100);}
 if(target&&is('ally','alliance','allied','pact','defense pact','defence pact'))change('alliance formed with '+target.name,()=>{if(!n.alliances.includes(target.id))n.alliances.push(target.id);if(!target.alliances.includes(n.id))target.alliances.push(n.id);changeRelation(state,n.id,target.id,20);},.9);
 if(target&&is('war','invade','attack','hostil'))change('war initiated against '+target.name,()=>{if(!n.wars.includes(target.id))n.wars.push(target.id);if(!target.wars.includes(n.id))target.wars.push(n.id);state.military[n.id].warSupport=clamp(state.military[n.id].warSupport+10);},.95);
 if(target&&is('peace','ceasefire','truce','end the war','make peace'))change('peace pursued with '+target.name,()=>{n.wars=n.wars.filter(x=>x!==target.id);target.wars=target.wars.filter(x=>x!==n.id);changeRelation(state,n.id,target.id,8);},.9);
 if(target&&is('sanction','embargo','block trade'))change('economic pressure applied to '+target.name,()=>{state.diplomacy[n.id].sanctions=Array.from(new Set([...state.diplomacy[n.id].sanctions,target.id]));changeRelation(state,n.id,target.id,-10);},.85);
 if(target&&is('trade','commerce','commercial agreement','export','import'))change('trade ties expanded with '+target.name,()=>{n.gdp+=.2;target.gdp+=.1;changeRelation(state,n.id,target.id,4);},.8);
 if(target&&is('relations','diplomacy','diplomatic','reconcile','reconciliation','friendship','improve ties'))change('relations improved with '+target.name,()=>changeRelation(state,n.id,target.id,8),.8);
 if(is('lower taxes','cut taxes'))change('taxes reduced',()=>state.economy[n.id].taxRate=clamp(state.economy[n.id].taxRate-.1,0,.8));
 if(is('raise taxes','increase taxes'))change('taxes increased',()=>state.economy[n.id].taxRate=clamp(state.economy[n.id].taxRate+.1,0,.8));
 if(is('subsidize','subsidies'))change('domestic subsidies funded',()=>{n.treasury-=Math.min(n.treasury,3);n.stability=clamp(n.stability+1);});
 if(is('nationalize','nationalise'))change('state ownership expanded',()=>{n.laws.push('State ownership expansion');n.stability=clamp(n.stability-1);n.industrialCapacity+=1;});
 if(is('food','agriculture','farms','grain','meat','protein'))change('food-security policy activated',()=>{n.laws.push('Food security program');n.stability=clamp(n.stability+1);n.treasury-=Math.min(n.treasury,2);});
 if(is('intelligence','counterintelligence','counter-intelligence','spies'))change('intelligence effort increased',()=>{n.laws.push('Expanded intelligence program');n.research+=.5;});
 if(is('propaganda','public campaign','public information'))change('public information campaign launched',()=>{n.stability=clamp(n.stability+1);n.legitimacy=clamp(n.legitimacy+1);});
 if(is('reform','constitutional','democrat','liberalize','liberalise'))change('political reform initiated',()=>{n.laws.push('Political reform initiative');n.legitimacy=clamp(n.legitimacy+1);});
 if(is('fortify','fortification','bunker','defenses','defence'))change('defensive construction prioritized',()=>{Object.values(state.mapEntities).filter(x=>x.owner===n.id).slice(0,8).forEach(x=>x.infrastructure=clamp(x.infrastructure+3));state.military[n.id].readiness=clamp(state.military[n.id].readiness+3);});
 if(target&&is('move','deploy','station','send troops','troops to'))change('forces positioned toward '+target.name,()=>{Object.values(state.units).filter(u=>u.nation===n.id).forEach(u=>u.territory=target.id);},.85);

 if(actions.length===0){
   change('strategic directive recorded',()=>{n.laws.push('Player directive: '+text.slice(0,120));n.research+=.1;n.legitimacy=clamp(n.legitimacy+.2);});
   confidence=.35;
 }
 const uniqueMentioned=Array.from(new Set([...mentioned,player]));
 const summary=actions.length===1?('The government has acted on your instruction: '+actions[0]+'.'):('Your instruction has been translated into '+actions.length+' interacting policy effects: '+actions.join('; ')+'.');
 addNews(state,'Government directive enacted',summary,'political',Math.min(8,3+Math.ceil(confidence*4)),uniqueMentioned);
 return{ok:true,message:'AI translated your instruction into '+actions.length+' game-state effect(s).',actions,confidence};
}
