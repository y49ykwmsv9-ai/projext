import {MapEntity,RegionCategory,RegionRatios} from './types';

const parentCategory:Record<RegionCategory,RegionCategory|undefined>={
 country:undefined, region:'country', county:'region', city:'county'
};

export function deriveRatios(entity:Pick<MapEntity,'category'|'areaKm2'|'population'|'children'>,parent?:Pick<MapEntity,'areaKm2'|'population'|'children'>):RegionRatios{
 const childCount=entity.children.length;
 const parentArea=parent?.areaKm2??entity.areaKm2;
 const parentPopulation=parent?.population??entity.population;
 const density=entity.areaKm2>0?entity.population/entity.areaKm2:0;
 return {
  childrenPerParent:childCount,
  populationShare:parentPopulation>0?entity.population/parentPopulation:0,
  areaShare:parentArea>0?entity.areaKm2/parentArea:0,
  urbanization:entity.category==='city'?1:Math.min(1,Math.sqrt(Math.max(0,density)/250)),
  density
 };
}

export function expectedChildCategory(category:RegionCategory):RegionCategory|undefined{
 return parentCategory[category];
}

export function hierarchyPath(entities:Record<string,MapEntity>,id:string):MapEntity[]{
 const path:MapEntity[]=[]; let cur=entities[id];
 while(cur){path.unshift(cur);cur=cur.parentId?entities[cur.parentId]:undefined;}
 return path;
}

export function getChildren(entities:Record<string,MapEntity>,parentId:string,category?:RegionCategory){
 return Object.values(entities).filter(e=>e.parentId===parentId && (!category||e.category===category));
}
