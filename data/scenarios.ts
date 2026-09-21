import {WorldState} from '../engine/types';
export const SCENARIOS={historical1936:{name:'World Crisis — 1936',date:'1936-01-01'},historical1939:{name:'World at War — 1939',date:'1939-09-01'},sandbox:{name:'Sandbox — 1936',date:'1936-01-01'}} as const;
export function emptyScenario(date:string):WorldState{return{date,tick:0,playerNation:undefined,nations:{},territories:{},units:{},treaties:{},events:[],seed:19360101};}
