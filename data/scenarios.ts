import {WorldState} from '../engine/types';
import {createWorldState} from '../engine/state';
export const SCENARIOS={historical1936:{name:'World Crisis — 1936',date:'1936-01-01'},historical1939:{name:'World at War — 1939',date:'1939-09-01'},sandbox:{name:'Sandbox — 1936',date:'1936-01-01'}} as const;
export function emptyScenario(date:string):WorldState{return createWorldState(date,19360101);}
