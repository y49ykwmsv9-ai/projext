import type {MapEntity,WorldState,Terrain} from '../engine/types';
import {geoArea,geoCentroid,geoContains} from 'd3-geo';

export type StrategicRegion={
 id:string; countryId:string; name:string; terrain:Terrain; populationShare:number; development:number; infrastructure:number; resources:Record<string,number>; cities:string[];
};
export type Admin1Feature={type:'Feature';properties:Record<string,any>;geometry:any};
export type CityFeature={type:'Feature';properties:Record<string,any>;geometry:{type:string;coordinates:[number,number]}};

const terrainByType:Terrain[]=['plains','forest','hills','mountains','desert','coast'];
const aliases:Record<string,string>={
 'united states of america':'United States','russian federation':'Soviet Union','czechia':'Czechoslovakia',
 'iran':'Iran','republic of korea':'South Korea','democratic peoples republic of korea':'North Korea',
 'united kingdom':'United Kingdom','bolivia':'Bolivia','venezuela':'Venezuela'
};
const norm=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

function countryForFeature(state:WorldState,f:Admin1Feature):string|undefined{
 const p=f.properties??{}, admin=norm(String(p.admin??p.sov_a3??'')), iso=String(p.iso_a2??'').toUpperCase();
 const nations=Object.values(state.nations);
 const exact=nations.find(n=>norm(n.name)===admin||norm(aliases[admin]??'')===norm(n.name));
 if(exact)return exact.id;
 const byId=nations.find(n=>String(n.id)===iso);
 if(byId)return byId.id;
 const byToken=nations.find(n=>admin.includes(norm(n.name))||norm(n.name).includes(admin));
 return byToken?.id;
}
function resourceSet(seed:number,terrain:Terrain){
 const m=Math.max(10,seed);
 const multipliers=terrain==='mountains'?[.7,1.5,1.1,.6]:terrain==='desert'?[.4,.5,.25,1.7]:terrain==='coast'?[1.2,.7,.6,1]:[1.3,1,.9,.5];
 return {food:Math.round(m*multipliers[0]),iron:Math.round(m*multipliers[1]),coal:Math.round(m*multipliers[2]),oil:Math.round(m*multipliers[3])};
}
export function makeStrategicRegions(countryId:string,countryName:string,population:number,development:number,resourcePotential:number,cities:string[]):StrategicRegion[]{
 const names=cities.length>=5?cities.slice(0,5):['Northern Core','Southern Core','Eastern Frontier','Western Corridor','Capital District'];
 return names.map((name,i)=>({id:countryId+'-legacy-region-'+i,countryId,name:name+(cities.length<5?' Region':''),terrain:terrainByType[(Number(countryId)||i)%terrainByType.length],populationShare:i===4?.28:.18,development:Math.max(5,development*(.72+i*.07)),infrastructure:Math.max(10,45+i*5),resources:resourceSet(resourcePotential,(terrainByType[(Number(countryId)||i)%terrainByType.length])),cities:cities.slice(i,i+2)}));
}

/** Replace the old synthetic five-region hierarchy with bundled Natural Earth Admin-1 features.
 * Geometry is fetched only by the build step and shipped locally; gameplay never calls an external map API.
 */
export function registerAdmin1Features(state:WorldState,features:Admin1Feature[],cities:CityFeature[]=[]):number{
 const grouped:Record<string,Admin1Feature[]|undefined>={};
 let created=0;
 for(const f of features){
  const countryId=countryForFeature(state,f); if(!countryId||!f.geometry)continue;
  (grouped[countryId]??=[]).push(f);
 }
 for(const [countryId,items] of Object.entries(grouped)){
  const country=state.mapEntities[countryId], nation=state.nations[countryId]; if(!country||!nation)continue;
  const areas=items.map(f=>Math.max(1,geoArea(f as any)*6371*6371)),totalArea=areas.reduce((a,b)=>a+b,0);
  const cityRows=cities.filter(c=>{const p=c.properties??{};return countryForFeature(state,{type:'Feature',properties:p,geometry:c.geometry} as any)===countryId});
  for(let i=0;i<items.length;i++){
   const f=items[i],p=f.properties??{},area=areas[i],share=area/totalArea;
   const name=String(p.name??p.name_en??p.adm1_code??('Province '+(i+1)));
   const id='admin1-'+String(p.adm1_code??countryId+'-'+i).replace(/[^a-zA-Z0-9_-]/g,'-');
   const centroid=geoCentroid(f as any) as [number,number];
   const terrain=terrainByType[(Math.abs(Math.round(centroid[0]*3+centroid[1]))+i)%terrainByType.length];
   const localCities=cityRows.filter(c=>{try{return geoContains(f as any,c.geometry.coordinates as [number,number])}catch{return false}}).sort((a,b)=>Number(b.properties?.pop_max??0)-Number(a.properties?.pop_max??0)).slice(0,12);
   const cityPop=localCities.reduce((s,c)=>s+Math.max(0,Number(c.properties?.pop_max??0)),0);
   const population=Math.max(1000,nation.population*1e6*share);
   const dev=Math.max(5,Math.min(100,nation.industrialCapacity*(.55+share*2)));
   const entity:MapEntity={id,name,category:'region',parentId:countryId,countryId,controller:country.controller,owner:country.owner,areaKm2:area,population, mapSource:'bundled-natural-earth-admin1',sourceCode:String(p.adm1_code??id),centroid,geometryKey:id,children:[],adjacency:[],development:dev,infrastructure:Math.max(10,Math.min(100,35+dev*.45)),ratios:{childrenPerParent:0,populationShare:share,areaShare:share,urbanization:Math.min(.95,Math.max(.05,cityPop/Math.max(1,population))),density:population/area}};
   state.mapEntities[id]=entity;
   if(!country.children.includes(id))country.children.push(id);
   created++;
   for(const city of localCities){
    const cp=city.properties??{}, coords=city.geometry.coordinates as [number,number], cid=id+'-city-'+String(cp.ne_id??cp.name??localCities.indexOf(city)).replace(/[^a-zA-Z0-9_-]/g,'-');
    if(state.mapEntities[cid])continue;
    const cityPopValue=Math.max(500,Number(cp.pop_max??cp.pop_min??10000));
    state.mapEntities[cid]={id:cid,name:String(cp.name??'City'),category:'city',parentId:id,countryId,controller:country.controller,owner:country.owner,areaKm2:Math.max(.1,cityPopValue/100000),population:cityPopValue,mapSource:'bundled-natural-earth-populated-places',sourceCode:String(cp.ne_id??cid),centroid:coords,geometryKey:cid,children:[],adjacency:[],development:Math.min(100,dev+15),infrastructure:Math.min(100,entity.infrastructure+15),ratios:{childrenPerParent:0,populationShare:cityPopValue/population,areaShare:0,urbanization:1,density:cityPopValue/Math.max(.1,cityPopValue/100000)}};
    entity.children.push(cid);
   }
  }
 }
 // Derive lightweight adjacency from shared admin country codes and neighboring centroids.
 for(const id of Object.keys(state.mapEntities)){
  const e=state.mapEntities[id]; if(e.category!=='region'||!e.parentId)continue;
  const siblings=state.mapEntities[e.parentId]?.children??[];
  e.adjacency=siblings.filter(x=>x!==id&&state.mapEntities[x]?.category==='region'&&Math.hypot(e.centroid[0]-state.mapEntities[x].centroid[0],e.centroid[1]-state.mapEntities[x].centroid[1])<18).slice(0,8);
 }
 return created;
}

export function addStrategicRegions(state:WorldState,countryId:string,countryName:string,population:number,development:number,resourcePotential:number,cities:string[]){
 // Compatibility fallback for tiny states that have no Admin-1 polygon in the bundled source.
 const country=state.mapEntities[countryId]; if(!country||country.children.length)return;
 const r=makeStrategicRegions(countryId,countryName,population,development,resourcePotential,cities)[0];
 const entity:MapEntity={id:r.id,name:r.name,category:'region',parentId:countryId,countryId,controller:country.controller,owner:country.owner,areaKm2:Math.max(1,country.areaKm2),population:population*1e6, mapSource:'bundled-fallback-admin1',sourceCode:r.id,centroid:country.centroid,geometryKey:country.geometryKey,children:[],adjacency:[],development:r.development,infrastructure:r.infrastructure,ratios:{childrenPerParent:1,populationShare:1,areaShare:1,urbanization:.25,density:0}};
 state.mapEntities[r.id]=entity;country.children.push(r.id);
}
