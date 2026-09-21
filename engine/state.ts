import {WorldState,Nation,MapEntity,EconomicState,MilitaryState,DiplomaticState} from './types';

export function createWorldState(date='1936-01-01',seed=19360101):WorldState{
 return {date,tick:0,playerNation:undefined,nations:{},mapEntities:{},units:{},treaties:{},events:[],news:[],political:{identities:{},borderHistory:[],mapRevision:0},seed,economy:{},military:{},diplomacy:{},scenario:{presetId:'sandbox',presetDate:date,branchId:'branch-'+seed+'-'+date.replace(/-/g,''),divergence:0,historyLog:[],historicalTrackers:{},lastAdvanceDays:0,catalysts:{active:[],recent:[]}},historicalSync:{year:Number(date.slice(0,4)),source:'Cliopatria v0.2.0',activePolityCount:0,matchedNationCount:0,unmatchedPolityCount:0,activePolityIds:[],nationPresence:{},updatedAt:date}};
}

export function ensureNationSystems(state:WorldState,nation:Nation):void{
 if(!state.economy[nation.id]) state.economy[nation.id]={taxRate:.2,inflation:2,tradeBalance:0,consumerDemand:.6,construction:0};
 if(!state.military[nation.id]) state.military[nation.id]={readiness:50,mobilization:0,supply:1,warSupport:50,casualties:0,logistics:50,fuel:100,equipmentStock:100,commandCapacity:100};
 else {const m=state.military[nation.id] as any;m.logistics??=50;m.fuel??=100;m.equipmentStock??=100;m.commandCapacity??=100;}
 if(!state.diplomacy[nation.id]) state.diplomacy[nation.id]={relations:{...nation.relations},treaties:[],tradeAccess:[],sanctions:[]};
}
export function addMapEntity(state:WorldState,entity:MapEntity):void{
 state.mapEntities[entity.id]=entity;
 if(entity.parentId && state.mapEntities[entity.parentId] && !state.mapEntities[entity.parentId].children.includes(entity.id)) state.mapEntities[entity.parentId].children.push(entity.id);
}
