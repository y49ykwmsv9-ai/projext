export type EntityId=string;
export type DateKey=string;

/** The four playable geographic entity categories. */
export type RegionCategory='city'|'county'|'region'|'country';
export type GovernmentType='democracy'|'monarchy'|'republic'|'dictatorship'|'communist'|'theocracy'|'colonial'|'occupied';
export type Terrain='plains'|'forest'|'hills'|'mountains'|'desert'|'tundra'|'jungle'|'urban'|'coast';

export interface MapEntity{
 id:EntityId;
 name:string;
 category:RegionCategory;
 parentId?:EntityId;
 countryId?:EntityId;
 controller:EntityId;
 owner:EntityId;
 areaKm2:number;
 population:number;
 mapSource:string;
 sourceCode?:string;
 centroid:[number,number];
 geometryKey:string;
 children:EntityId[];
 adjacency:EntityId[];
 ratios:EntityRatios;
}

export interface RegionRatios{
 childrenPerParent:number;
 populationShare:number;
 areaShare:number;
 urbanization:number;
 density:number;
}

export interface Nation{
 id:EntityId; name:string; government:GovernmentType; capital?:EntityId;
 population:number; gdp:number; treasury:number; debt:number; stability:number; legitimacy:number;
 industrialCapacity:number; civilianFactories:number; militaryFactories:number; dockyards:number;
 manpower:number; research:number; technology:string[]; laws:string[];
 relations:Record<EntityId,number>; alliances:EntityId[]; wars:EntityId[];
}

export interface ArmyUnit{
 id:EntityId; nation:EntityId; name:string; kind:string; strength:number; organization:number;
 equipment:number; experience:number; manpower:number; territory?:EntityId; target?:EntityId;
}

export interface Treaty{
 id:EntityId; type:string; members:EntityId[]; terms:string[]; start:DateKey; end?:DateKey;
}

export interface WorldState{
 date:DateKey;
 tick:number;
 playerNation?:EntityId;
 nations:Record<EntityId,Nation>;
 mapEntities:Record<EntityId,MapEntity>;
 units:Record<EntityId,ArmyUnit>;
 treaties:Record<EntityId,Treaty>;
 events:string[];
 seed:number;
}
