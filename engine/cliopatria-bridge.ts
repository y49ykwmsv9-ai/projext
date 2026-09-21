import type {WorldState,HistoricalSyncState} from './types';
import {queryCliopatriaYear} from '../lib/cliopatria';

const normalize=(v:unknown)=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const first=(p:Record<string,unknown>,keys:string[])=>{for(const k of keys){if(p[k]!==undefined&&p[k]!==null&&String(p[k]).trim())return String(p[k]);}return '';};

function featureIdentity(feature:any){
 const p=(feature.properties??{}) as Record<string,unknown>;
 return {id:String(feature.id??first(p,['ID','Id','id','PolityID','PolityId'])??''),name:first(p,['Name','name','Polity','polity','Entity','entity']),wikidata:first(p,['Wikidata','WikidataID','WikidataId','wikidataId']),seshat:first(p,['Seshat','SeshatID','SeshatId','seshatId'])};
}

function matchNation(state:WorldState,feature:any):string|undefined{
 const x=featureIdentity(feature), xn=normalize(x.name);
 if(xn){for(const n of Object.values(state.nations))if(normalize(n.name)===xn)return n.id;}
 const p=feature.properties??{};
 for(const n of Object.values(state.nations)){
  const aliases=[n.name,...(n.politicalGoals??[])].map(normalize);
  const hay=normalize(first(p,['Name','name','Polity','polity']));
  if(hay&&aliases.includes(hay))return n.id;
 }
 return undefined;
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
