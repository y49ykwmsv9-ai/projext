export type EntityId=string;
export type DateKey=string;

/** The four playable geographic entity categories. */
export type RegionCategory='city'|'county'|'region'|'country';
export type GovernmentType='democracy'|'monarchy'|'republic'|'dictatorship'|'communist'|'theocracy'|'colonial'|'occupied';
export type Terrain='plains'|'forest'|'hills'|'mountains'|'desert'|'tundra'|'jungle'|'urban'|'coast';

export interface MapEntity{
 id:EntityId; name:string; category:RegionCategory; parentId?:EntityId; countryId?:EntityId; controller:EntityId; owner:EntityId;
 areaKm2:number; population:number; mapSource:string; sourceCode?:string; centroid:[number,number]; geometryKey:string; children:EntityId[]; adjacency:EntityId[]; ratios:RegionRatios; development:number; infrastructure:number;
}
export interface RegionRatios{childrenPerParent:number;populationShare:number;areaShare:number;urbanization:number;density:number;}
export interface Nation{
 id:EntityId; name:string; government:GovernmentType; capital?:EntityId; population:number; gdp:number; treasury:number; debt:number; stability:number; legitimacy:number;
 industrialCapacity:number; civilianFactories:number; militaryFactories:number; dockyards:number; manpower:number; research:number; technology:string[]; laws:string[]; relations:Record<EntityId,number>; alliances:EntityId[]; wars:EntityId[];
}
export interface ArmyUnit{id:EntityId;nation:EntityId;name:string;kind:string;strength:number;organization:number;equipment:number;experience:number;manpower:number;territory?:EntityId;target?:EntityId;}
export interface Treaty{id:EntityId;type:string;members:EntityId[];terms:string[];start:DateKey;end?:DateKey;}
export interface EconomicState{taxRate:number;inflation:number;tradeBalance:number;consumerDemand:number;construction:number;}
export interface MilitaryState{readiness:number;mobilization:number;supply:number;warSupport:number;casualties:number;}
export interface DiplomaticState{relations:Record<EntityId,number>;treaties:EntityId[];tradeAccess:EntityId[];sanctions:EntityId[];}
export type EventEffect={kind:string;target?:EntityId;value?:number;name?:string;data?:Record<string,string|number|boolean>};
export interface EventState{id:EntityId;date:DateKey;title:string;description:string;severity:number;options:string[];resolved:boolean;effects?:EventEffect[];historicalOnly?:boolean;trigger?:EventTrigger;}
export interface WorldState{
 date:DateKey; tick:number; playerNation?:EntityId; nations:Record<EntityId,Nation>; mapEntities:Record<EntityId,MapEntity>; units:Record<EntityId,ArmyUnit>; treaties:Record<EntityId,Treaty>; events:EventState[]; political:PoliticalVisualState; seed:number;
 economy:Record<EntityId,EconomicState>; military:Record<EntityId,MilitaryState>; diplomacy:Record<EntityId,DiplomaticState>;
}
export interface EventTrigger{dateFrom?:DateKey;dateTo?:DateKey;requiredNation?:EntityId;minStability?:number;maxStability?:number;requiresWar?:boolean;requiresControlOf?:EntityId;}
export interface PoliticalIdentity{entityId:EntityId;name:string;flagKey:string;colorKey:string;capital?:EntityId;government?:GovernmentType;}
export interface PoliticalVisualState{identities:Record<EntityId,PoliticalIdentity>;borderHistory:BorderChange[];mapRevision:number;}
export interface BorderChange{entityId:EntityId;owner:EntityId;controller:EntityId;from?:EntityId;reason:string;date:DateKey;}
