import {WorldState,NewsItem,EventState} from './types';
import {ensureNationSystems} from './state';
import {historicalRecords} from '../lib/historical-records';

function clamp(v:number,min=0,max=100){return Math.max(min,Math.min(max,v));}
function dateAdd(date:string,days:number){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function hash(s:string){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;}
function rng(state:WorldState,key:string){const x=hash(state.seed+'|'+state.tick+'|'+state.date+'|'+key);return x/4294967296;}
function pushNews(state:WorldState,item:Omit<NewsItem,'id'>){
 const mentioned=new Set(item.mentionedNations??[]);
 const corpus=(item.title+' '+item.summary).toLowerCase();
 for(const n of Object.values(state.nations))if(corpus.includes(n.name.toLowerCase()))mentioned.add(n.id);
 const id='news-'+hash(item.date+'|'+item.title+'|'+item.summary+'|'+item.source);
 if(state.news.some(n=>n.id===id))return;
 state.news.unshift({...item,id,mentionedNations:Array.from(mentioned)});
 state.news=state.news.slice(0,80);
}
function pushEvent(state:WorldState,event:EventState){
 if(state.events.some(e=>e.id===event.id))return;
 const affected=Array.from(new Set((event.effects??[]).map(e=>e.target).filter(Boolean) as string[]));
 const importance=Math.max(1,Math.min(8,event.importance??event.severity??2));
 state.events.push({...event,importance});
 pushNews(state,{date:event.date,title:event.title,summary:event.description,category:event.category??'political',importance,relatedNation:affected[0],mentionedNations:affected,relatedEvent:event.id,source:event.source??'system'});
}

function runHistoricalRecordPass(state:WorldState,days:number):void{
 const currentYear=Number(state.date.slice(0,4));
 const previousDate=dateAdd(state.date,-Math.max(1,days));
 const previousYear=Number(previousDate.slice(0,4));
 const activeRecords=historicalRecords.filter(r=>r.kind==='event'&&r.start!==undefined&&r.start>previousYear&&r.start<=currentYear);
 for(const record of activeRecords){
  const key='record-'+record.id+'-'+record.start;
  if(state.scenario.historyLog.includes(key))continue;
  const related=(record.relatedPolities??[]).filter(id=>!!state.nations[id]);
  const player=state.playerNation?state.nations[state.playerNation]:undefined;
  const locallyRelevant=related.length>0||record.region.toLowerCase().includes((player?.name??'').toLowerCase());
  const importance=Math.max(3,Math.min(10,record.significance??5));
  pushNews(state,{
   date:state.date,
   title:'Historical context · '+record.name,
   summary:record.description+' Worldforge treats this record as historical context and a catalyst for simulation conditions, not as a command to reproduce the historical outcome.',
   category:'historical',
   importance,
   relatedNation:related[0],
   mentionedNations:related,
   source:'historical'
  });
  if(locallyRelevant||importance>=9){
   const eventId='historical-record-event-'+record.id+'-'+record.start;
   pushEvent(state,{id:eventId,date:state.date,title:record.name,description:record.description+' Historical context may influence actors, institutions and strategic expectations, while the actual outcome remains emergent.',severity:Math.max(2,Math.ceil(importance/3)),importance:Math.min(8,importance),category:'historical',source:'historical',options:['Study the historical context','Respond to current conditions'],resolved:false,effects:related.map(target=>({kind:'historicalPressure',target,value:Math.max(1,importance-4),data:{recordId:record.id}}))});
  }
  state.scenario.historyLog.push(key);
 }
}
function runHistoricalLogic(state:WorldState):void{
 const y=Number(state.date.slice(0,4)),s=state.scenario,has=(id:string)=>s.historyLog.includes(id);
 const trigger=(id:string,condition:boolean,title:string,description:string,options:string[],effects:any[])=>{
  if(!condition||has(id))return;
  pushEvent(state,{id,date:state.date,title,description,severity:3,importance:4,category:'historical',source:'historical',options,resolved:false,effects});
  s.historyLog.push(id);
 };
 if(s.presetDate==='1936-01-01'){
  trigger('hist-1936-rearmament',y>=1936&&y<=1939&&!!state.nations['276'],'European rearmament pressure','The international balance is under pressure from rearmament, alliances and economic competition. Existing choices—not the calendar—determine what follows.',['Maintain restraint','Accelerate preparations'],[{kind:'mobilization',target:'276',value:8,data:{option:1}},{kind:'industry',target:'276',value:1,data:{option:1}}]);
  trigger('hist-1938-crisis',y>=1938&&y<=1939&&!!state.nations['276']&&!!state.nations['203'],'Central European Crisis','A major confrontation is becoming plausible. Its outcome depends on diplomacy, military readiness and prior decisions.',['Seek settlement','Escalate deterrence'],[{kind:'relation',target:'276',value:10,data:{option:0}},{kind:'mobilization',target:'203',value:8,data:{option:1}}]);
  trigger('hist-1939-war-window',y>=1939&&y<=1941&&!!state.nations['276'],'General European War Window','A general European war is historically plausible in this period, but it is not scripted. Alliances, borders, deterrence and choices determine whether it materializes.',['Pursue diplomacy','Prepare for war'],[{kind:'relation',target:'276',value:6,data:{option:0}},{kind:'mobilization',target:'276',value:5,data:{option:1}}]);
 }
 if(s.presetDate==='1939-09-01'||s.presetDate==='1941-06-22'||s.presetDate==='1941-11-13'){
  trigger('hist-war-trajectory',y>=1939&&y<=1945,'World War trajectory','The preset begins during an existing historical crisis. Starting conditions are preserved, while subsequent wars, occupations and alliances remain emergent.',['Exploit the opening','Seek a different settlement'],[{kind:'warSupport',target:state.playerNation,value:4,data:{option:0}},{kind:'relation',target:'276',value:8,data:{option:1}}]);
 }
}

export function runDemographics(state:WorldState,days:number):void{
 for(const e of Object.values(state.mapEntities)){const growth=(e.category==='city'?0.00003:0.000018)*days;e.population=Math.max(0,e.population*(1+growth));e.ratios.density=e.areaKm2>0?e.population/e.areaKm2:0;e.ratios.populationShare=e.parentId&&state.mapEntities[e.parentId]?.population?e.population/state.mapEntities[e.parentId].population:1;}
 for(const n of Object.values(state.nations)){const ce=state.mapEntities[n.id];if(ce)n.population=Math.max(.01,ce.population/1e6);n.manpower=Math.max(0,n.manpower*(1+days*.00008));}
}
export function runEconomy(state:WorldState,days:number):void{
 for(const n of Object.values(state.nations)){ensureNationSystems(state,n);const e=state.economy[n.id],instability=(100-n.stability)/100,industrial=Object.values(state.mapEntities).filter(x=>x.owner===n.id).reduce((s,x)=>s+x.development*x.infrastructure/100,0);n.industrialCapacity=Math.max(0,n.industrialCapacity+industrial*.00001*days-instability*.002*days);n.gdp=Math.max(0,n.gdp*(1+(n.stability/1000)*days/30)+n.industrialCapacity*.0002*days);e.inflation=clamp(e.inflation+(e.taxRate-.2)*.03*days+n.gdp*.000001*days,0,100);n.treasury+=n.gdp*e.taxRate*.00005*days-n.debt*.00001*days;}
}
export function runWars(state:WorldState,days:number):void{
 for(const n of Object.values(state.nations))for(const enemyId of n.wars){
  if(n.id>enemyId)continue;
  const enemy=state.nations[enemyId];if(!enemy)continue;
  const a=state.military[n.id],b=state.military[enemy.id];
  const ap=a.readiness*a.supply*(1+a.mobilization/100),bp=b.readiness*b.supply*(1+b.mobilization/100);
  const ac=Math.max(0,Math.round((bp/(ap+bp+1))*.02*n.population*days)),bc=Math.max(0,Math.round((ap/(ap+bp+1))*.02*enemy.population*days));
  a.casualties+=ac;b.casualties+=bc;n.manpower=Math.max(0,n.manpower-ac/1e6);enemy.manpower=Math.max(0,enemy.manpower-bc/1e6);
  a.warSupport=clamp(a.warSupport+(ap>bp?1:-1)*days*.1);b.warSupport=clamp(b.warSupport+(bp>ap?1:-1)*days*.1);

  // Wars now have a geographic consequence. Sustained local superiority can move a real
  // Admin-1 region between controllers instead of leaving the war as two numbers fighting.
  if(days>=7 || state.tick%4===0){
   const margin=ap-bp;
   if(Math.abs(margin)>25){
    const attacker=margin>0?n:enemy;
    const defender=margin>0?enemy:n;
    const defenderRegions=Object.values(state.mapEntities).filter(e=>e.category==='region'&&e.parentId===defender.id&&e.owner===defender.id);
    if(defenderRegions.length){
     const candidate=defenderRegions[Math.abs(hash(state.seed+'|capture|'+state.tick+'|'+attacker.id+'|'+defender.id))%defenderRegions.length];
     const chance=Math.min(.65,.08+Math.abs(margin)/500+days/3650);
     if(rng(state,'territory-'+attacker.id+'-'+defender.id)<chance){
      const oldOwner=candidate.owner;
      candidate.owner=attacker.id;candidate.controller=attacker.id;
      state.political.borderHistory.push({entityId:candidate.id,owner:attacker.id,controller:attacker.id,from:oldOwner,reason:'Wartime regional capture',date:state.date});
      state.political.mapRevision+=1;
      pushNews(state,{date:state.date,title:'Front line shift · '+candidate.name,summary:attacker.name+' has established control over '+candidate.name+' after sustained battlefield pressure. The territorial situation remains contested.',category:'military',importance:6,relatedNation:attacker.id,mentionedNations:[attacker.id,defender.id],source:'ai'});
     }
    }
   }
  }
 }
}
export function runMilitary(state:WorldState,days:number):void{
 for(const n of Object.values(state.nations)){
  ensureNationSystems(state,n);
  const m=state.military[n.id];
  const units=Object.values(state.units).filter(u=>u.nation===n.id);
  const avgOrg=units.length?units.reduce((s,u)=>s+u.organization,0)/units.length:100;
  const ownedRegions=Object.values(state.mapEntities).filter(e=>e.owner===n.id);
  const infra=ownedRegions.length?ownedRegions.reduce((s,e)=>s+e.infrastructure,0)/ownedRegions.length:40;
  m.logistics=clamp(m.logistics+(infra-m.logistics)*.015*days-(units.length*.015)*days,0,100);
  m.fuel=clamp(m.fuel-(units.filter(u=>u.order==='attack'||u.order==='move').length*.15*days)+m.logistics*.01*days,0,100);
  m.equipmentStock=clamp(m.equipmentStock+(n.militaryFactories*.12*days)-units.reduce((s,u)=>s+u.strength*.000002,0)*days,0,100);
  m.commandCapacity=clamp(100-units.length*.8+(n.research*.4),20,100);
  const baseSupply=clamp((m.logistics/100)*(0.55+infra/200)*(m.fuel/100+.5),0,1);
  m.supply=clamp(m.supply+(baseSupply-m.supply)*.035*days-(units.length*.00005)*days,0,1);
  m.readiness=clamp(m.readiness+(avgOrg-m.readiness)*.01*days+m.mobilization*.015*days-(100-m.logistics)*.004*days,0,100);
  for(const u of units){
   u.supplyNeed??=Math.max(1,u.strength*.00002);
   u.supplyReceived=Math.max(0,u.supplyNeed*m.supply);
   const supplied=u.supplyReceived>=u.supplyNeed*.75;
   u.status=supplied?(u.order==='attack'?'engaged':u.order==='move'?'moving':'supplied'):'undersupplied';
   u.organization=clamp(u.organization+(supplied?1.2:-2.5)*days,0,100);
   u.equipment=clamp(u.equipment+(m.equipmentStock>55?0.15:-0.4)*days,0,100);
   u.morale=clamp((u.morale??60)+(supplied?.15:-.35)*days,0,100);
   if(u.target&&state.nations[u.target]&&u.order==='move'){
    const target=state.nations[u.target];
    if(n.wars.includes(target.id)){u.territory=target.id;u.status='engaged';u.order='attack';}
    else if((n.relations[target.id]??0)>20){u.territory=target.id;u.status='moving';}
   }
   u.strength=Math.max(0,u.strength-(u.status==='undersupplied'?u.strength*.00008:0)*days);
  }
  n.manpower=Math.max(0,n.manpower-units.reduce((s,u)=>s+u.strength*.000001,0)*days);
 }
}
function aiDiplomacy(state:WorldState):void{
 for(const n of Object.values(state.nations)){if(!n.relations)continue;const candidates=Object.values(state.nations).filter(x=>x.id!==n.id);if(!candidates.length)continue;
  const target=candidates[(state.tick+Number(n.id.replace(/\D/g,''))||state.tick)%candidates.length],current=n.relations[target.id]??0;
  const sharedWar=n.wars.some(x=>target.wars.includes(x)),threat=target.wars.includes(n.id)?-4:sharedWar?2:0,allied=n.alliances.includes(target.id)?2:0,economic=target.gdp>n.gdp?1:-1;
  const drift=threat+allied+economic;
  n.relations[target.id]=clamp(current+drift,-100,100);
  if(current>55&&!n.alliances.includes(target.id)&&n.stability>60&&target.stability>55&&rng(state,'ally-'+n.id+'-'+target.id)<.06){n.alliances.push(target.id);if(!target.alliances.includes(n.id))target.alliances.push(n.id);pushNews(state,{date:state.date,title:'Alliance realignment',summary:n.name+' and '+target.name+' have moved toward closer strategic cooperation.',category:'diplomatic',importance:5,relatedNation:n.id,source:'ai'});}
 }
}
export function runDiplomacy(state:WorldState):void{for(const n of Object.values(state.nations)){ensureNationSystems(state,n);for(const [id,value] of Object.entries(n.relations))n.relations[id]=clamp(value,-100,100);state.diplomacy[n.id].relations={...n.relations};}}



type CatalystKind='command'|'war'|'diplomacy'|'economy'|'military'|'social'|'territory';
function emitCatalyst(state:WorldState,kind:CatalystKind,source:string,strength:number,tags:string[]=[],sourceNation?:string,targetNation?:string){
 const scenario=state.scenario.catalysts??{active:[],recent:[]};
 const parent=scenario.active.length?scenario.active[scenario.active.length-1]:undefined;
 const c={id:state.tick+'-'+hash(source+'|'+state.date+'|'+sourceNation+'|'+targetNation),kind,source,sourceNation,targetNation,strength,expires:state.tick+Math.max(2,Math.ceil(120/Math.max(1,strength))),tags,createdDate:state.date,causalDepth:(parent?.causalDepth??0)+1,parentCatalystId:parent?.id};
 scenario.active=[...scenario.active,c].slice(-120);scenario.recent=[...scenario.recent,c].slice(-240);state.scenario.catalysts=scenario;
}
function activeCatalysts(state:WorldState){const cs=state.scenario.catalysts?.active??[];return cs.filter(x=>x.expires>=state.tick);}
function branchEntropy(state:WorldState){return Math.min(1,state.scenario.divergence/100+activeCatalysts(state).reduce((s,c)=>s+c.strength,0)/1000);}
function catalystEventPass(state:WorldState,days:number){
 const p=state.playerNation?state.nations[state.playerNation]:undefined;if(!p)return;
 const cs=activeCatalysts(state);if(!cs.length)return;
 const pressure=cs.reduce((s,c)=>s+c.strength,0),count=Math.min(8,Math.floor(pressure/18));
 for(let i=0;i<count;i++){
  const c=cs[(state.tick+i)%cs.length];if(!c)continue;
  const roll=rng(state,'catalyst-graph-'+c.id+'-'+i);if(roll>.18+branchEntropy(state)*.55+Math.min(.2,days/365))continue;
  const candidates=Object.values(state.nations).filter(n=>n.id!==p.id);
  const target=c.targetNation?state.nations[c.targetNation]:candidates[(i+state.tick)%Math.max(1,candidates.length)];if(!target)continue;
  const family=c.tags[i%Math.max(1,c.tags.length)]??c.kind;
  const title=family==='war'?'Regional military reaction':family==='diplomacy'?'Diplomatic realignment':family==='economy'?'Economic spillover':family==='social'?'Domestic political reaction':family==='territory'?'Territorial dispute':'Strategic policy reaction';
  const category:any=family==='war'?'military':family==='economy'?'economic':family==='diplomacy'?'diplomatic':family==='social'?'social':'political';
  pushNews(state,{date:state.date,title,summary:target.name+' and other actors are reacting to a developing situation created by recent events. The exact outcome remains open to subsequent decisions.',category,importance:4+Math.min(3,c.strength),relatedNation:target.id,mentionedNations:Array.from(new Set([target.id,c.sourceNation].filter(Boolean) as string[])),source:'ai'});
  if(roll<.34){target.stability=clamp(target.stability-(1+c.strength*.03));target.relations[p.id]=clamp((target.relations[p.id]??0)-(c.kind==='war'?3:1),-100,100);}
 }
 state.scenario.catalysts!.active=cs.slice(-120);
}

function catalystChance(state:WorldState,base:number,days:number){const player=state.playerNation?state.nations[state.playerNation]:undefined;const instability=player?(100-player.stability)/100:0;const war=player?player.wars.length/3:0;const divergence=state.scenario.divergence/100;return Math.min(.95,base*(1+Math.log2(Math.max(1,days))/2+instability*.8+war*.5+divergence*.35));}

export function processCommandCatalysts(state:WorldState,command:string,player:string):void{
 emitCatalyst(state,command.startsWith('war ')?'war':command.startsWith('ally ')||command.startsWith('relations ')||command.startsWith('sanction')||command.startsWith('trade')?'diplomacy':command.startsWith('tax ')||command.startsWith('build ')?'economy':command.startsWith('mobilize')||command.startsWith('recruit')||command.startsWith('deploy')||command.startsWith('move ')?'military':'command',command,command.startsWith('war ')?8:4,['war','diplomacy','economy','military','social','territory'],player,Object.keys(state.nations).find(id=>command.toLowerCase().includes(state.nations[id].name.toLowerCase())));
 const n=state.nations[player];if(!n)return;const q=command.toLowerCase();
 const add=(id:string,title:string,description:string,category:any,importance:number,options:string[],effects:any[])=>pushEvent(state,{id,date:state.date,title,description,category,importance,severity:Math.max(1,Math.ceil(importance/2)),source:'ai',options,resolved:false,effects,expires:dateAdd(state.date,45)});
 if(q.startsWith('war ')){const target=q.slice(4);add('catalyst-war-'+state.tick,'Foreign intelligence alert','The declaration has immediately altered threat calculations. Neighboring governments are reassessing readiness, alliances and trade.', 'military',7,['Issue mobilization','Seek diplomatic containment'],[{kind:'mobilization',target:n.id,value:8,data:{option:0}},{kind:'relation',target:Object.keys(state.nations).find(id=>id!==n.id),value:-6,data:{option:0}}]);}
 else if(q.startsWith('ally ')){add('catalyst-alliance-'+state.tick,'Alliance reaction','The new alignment has triggered diplomatic responses and counter-balancing discussions.', 'diplomatic',6,['Reassure neighbors','Publicize the pact'],[{kind:'relation',target:Object.keys(state.nations).find(id=>id!==n.id),value:4,data:{option:0}},{kind:'warSupport',target:n.id,value:3,data:{option:1}}]);}
 else if(q.startsWith('build ')||q.startsWith('tax ')){add('catalyst-economic-'+state.tick,'Domestic policy briefing','Markets, ministries and interest groups are reacting to the newly announced economic policy.', 'economic',4,['Press ahead','Review implementation'],[{kind:'stability',target:n.id,value:-1,data:{option:0}},{kind:'stability',target:n.id,value:1,data:{option:1}}]);}
 else if(q.startsWith('mobilize')||q.startsWith('demobilize')||q.startsWith('recruit')){add('catalyst-military-'+state.tick,'Military reaction report','The armed forces have begun adjusting logistics, readiness and manpower allocations in response to your order.', 'military',5,['Accelerate','Maintain current tempo'],[{kind:'mobilization',target:n.id,value:5,data:{option:0}},{kind:'industry',target:n.id,value:1,data:{option:0}}]);}
 else if(q.startsWith('sanction')||q.startsWith('trade')||q.startsWith('relations')){add('catalyst-diplomacy-'+state.tick,'Foreign ministry response','The foreign ministry reports immediate reactions from affected governments and commercial interests.', 'diplomatic',4,['Follow up','Wait and observe'],[{kind:'relation',target:Object.keys(state.nations).find(id=>id!==n.id),value:5,data:{option:0}},{kind:'relation',target:Object.keys(state.nations).find(id=>id!==n.id),value:-2,data:{option:1}}]);}
 if(rng(state,'command-news-'+command)<catalystChance(state,.45,Math.max(1,state.scenario.lastAdvanceDays??1)))pushNews(state,{date:state.date,title:'Command impact report',summary:'Your latest order is now influencing the political, economic, diplomatic or military environment.',category:q.includes('war')||q.includes('mobil')?'military':'political',importance:3,relatedNation:n.id,source:'player'});
}

function eventPressure(state:WorldState,event:EventState):number{
 const targets=(event.effects??[]).map(e=>e.target).filter(Boolean) as string[];
 let pressure=event.severity*1.5;
 for(const id of targets){const n=state.nations[id];if(!n)continue;pressure+=(100-n.stability)/25;if(n.wars.length)pressure+=2;}
 return pressure;
}
function generateMajorEventAlert(state:WorldState):void{
 const unresolved=state.events.filter(e=>!e.resolved&&!e.expires||!e.resolved&&(!e.expires||e.expires>=state.date));
 const major=unresolved.filter(e=>(e.importance??e.severity)>=6).sort((a,b)=>eventPressure(state,b)-eventPressure(state,a))[0];
 if(!major)return;
 const id='alert-'+major.id+'-'+state.tick;
 if(state.news.some(n=>n.id===id))return;
 const mentioned=Array.from(new Set((major.effects??[]).map(e=>e.target).filter(Boolean) as string[]));
 pushNews(state,{date:state.date,title:'MAJOR EVENT DETECTED · '+major.title,summary:'A high-impact situation is developing. Its consequences depend on the decisions taken now and the surrounding political, economic and military conditions.',category:major.category??'political',importance:8,relatedEvent:major.id,relatedNation:mentioned[0],mentionedNations:mentioned,source:'system'});
}
function generateStatusNews(state:WorldState,days:number):void{
 const p=state.playerNation?state.nations[state.playerNation]:undefined;if(!p)return;
 if(p.stability<35)pushNews(state,{date:state.date,title:'Domestic stability under strain',summary:p.name+' is experiencing elevated internal political and social pressure.',category:'social',importance:6,relatedNation:p.id,source:'system'});
 if(p.wars.length)pushNews(state,{date:state.date,title:'War situation update',summary:p.name+' remains involved in active hostilities; readiness, supply and manpower are being reassessed.',category:'military',importance:7,relatedNation:p.id,source:'system'});
 if(p.treasury<0)pushNews(state,{date:state.date,title:'Fiscal warning',summary:p.name+' is operating under significant treasury pressure.',category:'economic',importance:5,relatedNation:p.id,source:'system'});
 if(p.stability>75&&p.gdp>50)pushNews(state,{date:state.date,title:'Favorable domestic indicators',summary:p.name+' reports comparatively strong stability and economic conditions.',category:'economic',importance:3,relatedNation:p.id,source:'system'});
}

export function generateDynamicEvents(state:WorldState,days=1):void{
 const existing=new Set(state.events.map(e=>e.id)),p=state.playerNation?state.nations[state.playerNation]:undefined;
 if(p){
  if(p.stability<35&&!existing.has('unrest-'+p.id+'-'+state.date))pushEvent(state,{id:'unrest-'+p.id+'-'+state.date,date:state.date,title:'Domestic Unrest',description:p.name+' faces escalating internal unrest.',severity:3,importance:6,category:'social',source:'system',options:['Concessions','Emergency mobilization'],resolved:false,effects:[{kind:'stability',target:p.id,value:4,data:{option:0}},{kind:'stability',target:p.id,value:-3,data:{option:1}},{kind:'mobilization',target:p.id,value:10,data:{option:1}}]});
  if(state.military[p.id]?.mobilization>80&&p.stability>55&&!existing.has('industrial-'+p.id+'-'+state.date))pushEvent(state,{id:'industrial-'+p.id+'-'+state.date,date:state.date,title:'War Production Drive',description:p.name+' can redirect resources toward wartime industry.',severity:2,importance:5,category:'economic',source:'system',options:['Expand industry','Preserve civilian economy'],resolved:false,effects:[{kind:'industry',target:p.id,value:2,data:{option:0}},{kind:'gdp',target:p.id,value:-1,data:{option:0}},{kind:'stability',target:p.id,value:1,data:{option:1}}]});
 }
 const target=Math.min(24,Math.max(2,Math.round(2+Math.sqrt(Math.max(1,days))*1.8+(p?.wars.length??0)*2+(p&&p.stability<40?2:0))));
 const nations=Object.values(state.nations).filter(n=>n.id!==state.playerNation);
 for(let i=0;i<target;i++){const n=nations[(state.tick*13+i*17)%Math.max(1,nations.length)];if(!n)break;if(rng(state,'ambient-'+i)>catalystChance(state,.22,days))continue;const kind=i%4;const title=kind===0?'Government reshuffle':kind===1?'Market and trade movement':kind===2?'Military readiness report':'Diplomatic maneuver';const category:any=kind===0?'political':kind===1?'economic':kind===2?'military':'diplomatic';pushNews(state,{date:state.date,title,summary:n.name+' has generated a new development that may affect the wider balance.',category,importance:2+(i%4),relatedNation:n.id,source:'ai'});}
 generateStatusNews(state,days);
 generateMajorEventAlert(state);
 catalystEventPass(state,days);
}

export function runWorldSystems(state:WorldState,days:number):void{
 runDemographics(state,days);runEconomy(state,days);runMilitary(state,days);runWars(state,days);runDiplomacy(state);aiDiplomacy(state);runHistoricalRecordPass(state,days);runHistoricalLogic(state);
 state.scenario.lastAdvanceDays=days;
}
