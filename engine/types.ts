export type EntityId=string;
export type DateKey=string;
export type GovernmentType='democracy'|'monarchy'|'republic'|'dictatorship'|'communist'|'theocracy'|'colonial'|'occupied';
export type TerritoryKind='country'|'dependency'|'constituent'|'province'|'strategic-region'|'city'|'disputed';
export type Terrain='plains'|'forest'|'hills'|'mountains'|'desert'|'tundra'|'jungle'|'urban'|'coast';
export interface Territory{ id:EntityId; name:string; kind:TerritoryKind; controller:EntityId; owner:EntityId; parent?:EntityId; terrain:Terrain; population:number; development:number; infrastructure:number; resources:Record<string,number>; adjacency:EntityId[]; }
export interface Nation{ id:EntityId; name:string; government:GovernmentType; capital?:EntityId; population:number; gdp:number; treasury:number; debt:number; stability:number; legitimacy:number; industrialCapacity:number; civilianFactories:number; militaryFactories:number; dockyards:number; manpower:number; research:number; technology:string[]; laws:string[]; relations:Record<EntityId,number>; alliances:EntityId[]; wars:EntityId[]; }
export interface ArmyUnit{ id:EntityId; nation:EntityId; name:string; kind:string; strength:number; organization:number; equipment:number; experience:number; manpower:number; territory?:EntityId; target?:EntityId; }
export interface Treaty{ id:EntityId; type:string; members:EntityId[]; terms:string[]; start:DateKey; end?:DateKey; }
export interface WorldState{ date:DateKey; tick:number; playerNation?:EntityId; nations:Record<EntityId,Nation>; territories:Record<EntityId,Territory>; units:Record<EntityId,ArmyUnit>; treaties:Record<EntityId,Treaty>; events:string[]; seed:number; }
