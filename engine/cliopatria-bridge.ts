import type {WorldState,HistoricalSyncState} from './types';
import {queryCliopatriaYear} from '../lib/cliopatria';
import {geoContains} from 'd3-geo';
import {recordsNear} from '../lib/historical-records';
import {historicalPolities} from '../lib/historical-polities';

const normalize=(v:unknown)=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const first=(p:Record<string,unknown>,keys:string[])=>{for(const k of keys){if(p[k]!==undefined&&p[k]!==null&&String(p[k]).trim())return String(p[k]);}return '';};

function featureIdentity(feature:any){
 const p=(feature.properties??{}) as Record<string,unknown>;
 return {id:String(feature.id??first(p,['ID','Id','id','PolityID','PolityId'])??''),name:first(p,['Name','name','Polity','polity','Entity','entity']),wikidata:first(p,['Wikidata','WikidataID','WikidataId','wikidataId']),seshat:first(p,['Seshat','SeshatID','SeshatId','seshatId'])};
}

function matchNation(state:WorldState,feature:any):string|undefined{
 const x=featureIdentity(feature), xn=normalize(x.name);
 if(xn){for(const n of Object.values(state.nations))if(normalize(n.name)===xn)return n.id;}
 const registryMatch=Object.values(historicalPolities).find(p=>normalize(p.name)===xn||(p.aliases??[]).some(a=>normalize(a)===xn));
 if(registryMatch){
  const candidates=Object.values(state.nations).filter(n=>normalize(n.name)===normalize(registryMatch.name)||(registryMatch.aliases??[]).some(a=>normalize(a)===normalize(n.name)));
  if(candidates.length===1)return candidates[0].id;
 }
 const p=feature.properties??{};
 for(const n of Object.values(state.nations)){
  const aliases=[n.name,...(n.politicalGoals??[])].map(normalize);
  const hay=normalize(first(p,['Name','name','Polity','polity']));
  if(hay&&aliases.includes(hay))return n.id;
 }
 return undefined;
}


function featureName(feature:any):string{const p=feature.properties??{};return first(p,['Name','name','Polity','polity','Entity','entity'])||String(feature.id??'Historical polity');}
function historicalPointScore(features:any[],lon:number,lat:number){
 const matches=features.filter(f=>!!f.geometry&&geoContains(f as never,[lon,lat]));
 return {matches,score:Math.min(100,matches.length*18)};
}
function applySpatialHistoricalContext(state:WorldState,features:any[]):void{
 const contextByNation:Record<string,number>={};
 for(const entity of Object.values(state.mapEntities)){
  if(!entity.centroid)continue;
  const {matches,score}=historicalPointScore(features,entity.centroid[0],entity.centroid[1]);
  if(!matches.length)continue;
  entity.historicalPolityIds=matches.map(f=>featureIdentity(f).id).filter(Boolean).slice(0,12);
  entity.historicalInfluence=score;
  const names=matches.map(featureName).slice(0,4);
  const nearby=recordsNear(entity.centroid[1],entity.centroid[0],250).slice(0,4).map(r=>r.name);
  entity.historicalContext=[...names,...nearby];
  if(entity.category==='country'){
   contextByNation[entity.id]=(contextByNation[entity.id]??0)+score;
  } else if(entity.parentId){
   const parent=state.mapEntities[entity.parentId];
   if(parent?.category==='country')contextByNation[parent.id]=(contextByNation[parent.id]??0)+score*.25;
  }
 }
 for(const [nationId,score] of Object.entries(contextByNation)){
  const nation=state.nations[nationId];if(!nation)continue;
  nation.historicalPresence=Math.min(100,score);
  const ids=state.mapEntities[nationId]?.historicalPolityIds??[];
  nation.historicalPolityIds=ids;
  state.scenario.historicalTrackers['spatial:'+nationId]=Math.round(score);
 }
}

/**
 * Pulls the compressed Cliopatria spatial dataset into the simulation as a
 * deterministic historical snapshot. The dataset never overwrites player
 * ownership. Instead it supplies historical presence and causal pressure that
 * the normal simulation systems can consume.
 */
export async function receiveCliopatriaSnapshot(state:WorldState,year:number):Promise<HistoricalSyncState>{
 const features=await queryCliopatriaYear(year);
 const nationPresence:Record<string,number>={};
 const activePolityIds:string[]=[];
 let matchedNationCount=0;
 for(const feature of features){
  const x=featureIdentity(feature); if(!x.id)continue;
  activePolityIds.push(x.id);
  const nation=matchNation(state,feature);
  if(nation){nationPresence[nation]=(nationPresence[nation]??0)+1;matchedNationCount++;}
 }
 const snapshot:HistoricalSyncState={year,source:'Cliopatria v0.2.0',activePolityCount:features.length,matchedNationCount,unmatchedPolityCount:Math.max(0,features.length-matchedNationCount),activePolityIds:activePolityIds.slice(0,5000),nationPresence,updatedAt:state.date};
 state.historicalSync=snapshot;
 for(const [nation,count] of Object.entries(nationPresence)){
  state.scenario.historicalTrackers['cliopatria:'+nation]=count;
 }
 return snapshot;
}

/** Apply a small, bounded historical-context signal to simulation systems. */
export function transmitHistoricalPressure(state:WorldState):void{
 const sync=state.historicalSync; if(!sync)return;
 for(const [nationId,count] of Object.entries(sync.nationPresence)){
  const nation=state.nations[nationId]; if(!nation)continue;
  const continuity=Math.min(1,count/12);
  nation.legitimacy=Math.max(0,Math.min(100,nation.legitimacy+continuity*.01));
  const tracker=Number(state.scenario.historicalTrackers['cliopatria:'+nationId]??0);
  if(tracker>0) state.scenario.historicalTrackers['pressure:'+nationId]=Math.min(100,tracker*.25);
 }
}
