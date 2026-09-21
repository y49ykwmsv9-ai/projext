import type {MapEntity,WorldState,Terrain} from '../engine/types';

export type StrategicRegion={
 id:string; countryId:string; name:string; terrain:Terrain; populationShare:number; development:number; infrastructure:number; resources:Record<string,number>; cities:string[];
};

const T=['plains','forest','hills','mountains','desert','coast'] as Terrain[];

export function makeStrategicRegions(countryId:string,countryName:string,population:number,development:number,resourcePotential:number,cities:string[]):StrategicRegion[]{
 const names=cities.length>=5?cities.slice(0,5):['Northern Core','Southern Core','Eastern Frontier','Western Corridor','Capital District'];
 return names.map((name,i)=>({
  id:countryId+'-region-'+i,countryId,name:name+(cities.length<5?' Region':''),
  terrain:T[(Number(countryId)||i)%T.length],
  populationShare:i===4?.28:.18,
  development:Math.max(5,development*(.72+i*.07)),
  infrastructure:Math.max(10,45+i*5),
  resources:{food:Math.round(resourcePotential*(.65+i*.08)),iron:Math.round(resourcePotential*(.35+i*.05)),coal:Math.round(resourcePotential*(.3+(4-i)*.06)),oil:Math.round(resourcePotential*(.18+i*.03))},
  cities:cities.slice(i,i+2)
 }));
}

export function addStrategicRegions(state:WorldState,countryId:string,countryName:string,population:number,development:number,resourcePotential:number,cities:string[]){
 const regions=makeStrategicRegions(countryId,countryName,population,development,resourcePotential,cities);
 const country=state.mapEntities[countryId]; if(!country)return;
 for(const r of regions){
  const entity:MapEntity={id:r.id,name:r.name,category:'region',parentId:countryId,countryId,controller:country.controller,owner:country.owner,areaKm2:Math.max(1,country.areaKm2/r.id.length),population:population*1e6*r.populationShare,mapSource:'bundled-strategic-region-data',sourceCode:r.id,centroid:country.centroid,geometryKey:country.geometryKey,children:[],adjacency:[],development:r.development,infrastructure:r.infrastructure,ratios:{childrenPerParent:0,populationShare:r.populationShare,areaShare:r.populationShare,urbanization:.25,density:0}};
  state.mapEntities[r.id]=entity;
  country.children.push(r.id);
 }
}
