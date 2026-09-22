'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {getWorldProfile} from '../lib/world-database';
import {makeNation} from '../lib/game-data';
import type {WorldState} from '../engine';

const countryFeatures:any[]=(((feature(world as any,(world as any).objects.countries) as any).features??[]) as any[]);
function idFor(f:any,i:number){const raw=f?.id;if(raw!==undefined&&raw!==null&&String(raw)!=='')return String(raw);return 'unit-'+String(f?.properties?.name??i).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function identityColor(key:string){let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;return 'hsl('+h%360+' 42% 43%)';}
function countryGeoJson(){
 return {type:'FeatureCollection',features:countryFeatures.map((f,i)=>({...f,id:idFor(f,i),properties:{...(f.properties??{}),__wf_id:idFor(f,i)}}))} as any;
}
const countries=countryGeoJson();
const countryColorExpression=(colors:Record<string,string>)=>{
 const pairs:string[]=[]; for(const [id,color] of Object.entries(colors)){pairs.push(id,color)}
 return ['match',['get','__wf_id'],...pairs,'#52636d'] as any;
};

type Props={
 worldState:WorldState;
 mapMode:'political'|'economy'|'military'|'resources'|'diplomacy'|'history';
 admin1Features:any[];
 cityFeatures:any[];
 historicalFeatures:any[];
 selectedNationId:string|null;
 selectedRegion:string|null;
 zoom:number;
 onCountrySelect:(id:string,name:string)=>void;
 onRegionSelect:(id:string)=>void;
 onZoomChange?:(zoom:number)=>void;
};

const LOCAL_MAP_STYLE:any={
 version:8,
 name:'Worldforge Local',
 sources:{},
 layers:[{id:'background',type:'background',paint:{'background-color':'#071521'}}]
};

export default function WorldMap({worldState,mapMode,admin1Features,cityFeatures,historicalFeatures,selectedNationId,selectedRegion,zoom,onCountrySelect,onRegionSelect,onZoomChange}:Props){
 const el=useRef<HTMLDivElement|null>(null);
 const mapRef=useRef<maplibregl.Map|null>(null);
 const [mapReady,setMapReady]=useState(false);
 const countrySelectRef=useRef(onCountrySelect); const regionSelectRef=useRef(onRegionSelect); const zoomChangeRef=useRef(onZoomChange);
 countrySelectRef.current=onCountrySelect; regionSelectRef.current=onRegionSelect; zoomChangeRef.current=onZoomChange;
 const colorMap=useMemo(()=>{
  const out:Record<string,string>={};
  for(const f of countryFeatures){
   const id=idFor(f,countryFeatures.indexOf(f)),name=f.properties?.name??'Unknown',live=worldState.nations[id],base=makeNation(id,getWorldProfile(id,name)?.name??name),n=live?({...base,...live} as any):base,displayId=worldState.mapEntities[id]?.controller??worldState.mapEntities[id]?.owner??id,display=worldState.nations[displayId]??n,rel=worldState.nations[worldState.playerNation??'']?.relations[displayId]??0;
   if(mapMode==='economy')out[id]='hsl('+Math.round(display.gdp%360)+' 48% '+Math.max(28,Math.min(65,30+display.industrialCapacity/3))+'%)';
   else if(mapMode==='military')out[id]='hsl('+Math.round(5+(worldState.military[displayId]?.readiness??display.industrialCapacity)*1.4)+' 50% '+Math.max(30,Math.min(68,34+(worldState.military[displayId]?.readiness??display.industrialCapacity)/2))+'%)';
   else if(mapMode==='resources')out[id]='hsl('+Math.round(70+(display.resources?.oil??display.resources?.iron??50)/2)+' 44% '+Math.max(28,Math.min(70,30+(display.resources?.oil??50)/2))+'%)';
   else if(mapMode==='diplomacy')out[id]='hsl('+Math.round(120+rel*1.2)+' 46% 42%)';
   else out[id]=identityColor(worldState.political.identities[displayId]?.colorKey??displayId);
  }
  return out;
 },[worldState,mapMode]);

 useEffect(()=>{
  if(!el.current||mapRef.current)return;
  let map:maplibregl.Map;
  try{
   map=new maplibregl.Map({container:el.current,style:LOCAL_MAP_STYLE,center:[0,20],zoom:1.05,minZoom:0,maxZoom:22,renderWorldCopies:false,dragRotate:false,pitchWithRotate:false,attributionControl:false});
  }catch{
   if(el.current)el.current.dataset.mapFallback='map-init-failed';
   return;
  }
  mapRef.current=map;
  const fail=()=>{if(el.current)el.current.dataset.mapFallback='map-load-failed';};
  map.on('error',fail);
  map.on('load',()=>{
   map.addSource('wf-countries',{type:'geojson',data:countries,promoteId:'__wf_id'});
   map.addLayer({id:'wf-country-fill',type:'fill',source:'wf-countries',paint:{'fill-color':'#52636d','fill-opacity':['interpolate',['linear'],['zoom'],0,.78,4,.62,7,.28,12,.10,18,.03]}});
   map.addLayer({id:'wf-country-line',type:'line',source:'wf-countries',paint:{'line-color':'#101820','line-width':['interpolate',['linear'],['zoom'],0,.45,4,.8,8,1.15,14,1.8,20,2.2],'line-opacity':.9}});
   map.addSource('wf-admin1',{type:'geojson',data:{type:'FeatureCollection',features:admin1Features}});
   map.addLayer({id:'wf-admin1-fill',type:'fill',source:'wf-admin1',minzoom:2.2,paint:{'fill-color':'#e5c777','fill-opacity':['interpolate',['linear'],['zoom'],2,.08,5,.055,9,.025,14,.012]}});
   map.addLayer({id:'wf-admin1-line',type:'line',source:'wf-admin1',minzoom:2.2,paint:{'line-color':'#d6c7a0','line-width':['interpolate',['linear'],['zoom'],2,.45,6,.8,10,1.2,16,1.8,21,2.4],'line-opacity':['interpolate',['linear'],['zoom'],2,.45,7,.72,14,.9,21,1]}});
   map.addSource('wf-cities',{type:'geojson',data:{type:'FeatureCollection',features:cityFeatures}});
   map.addLayer({id:'wf-city-points',type:'circle',source:'wf-cities',minzoom:5,paint:{'circle-radius':['interpolate',['linear'],['zoom'],5,2,10,3.2,16,5.5,21,7],'circle-color':'#f0d486','circle-stroke-color':'#111820','circle-stroke-width':1,'circle-opacity':.9}});
   map.addSource('wf-history',{type:'geojson',data:{type:'FeatureCollection',features:historicalFeatures}});
   map.addLayer({id:'wf-history-fill',type:'fill',source:'wf-history',minzoom:0,paint:{'fill-color':'#9f7ac2','fill-opacity':mapMode==='history'?.32:0}});
   map.addLayer({id:'wf-history-line',type:'line',source:'wf-history',minzoom:0,paint:{'line-color':'#d9c5ec','line-width':1,'line-opacity':mapMode==='history'?.75:0}});
   map.addLayer({id:'wf-country-hitbox',type:'fill',source:'wf-countries',minzoom:0,paint:{'fill-color':'#ffffff','fill-opacity':0.001}});
   map.addLayer({id:'wf-city-labels',type:'symbol',source:'wf-cities',minzoom:6,layout:{'text-field':['get','name'],'text-size':['interpolate',['linear'],['zoom'],6,9,12,12,18,15,22,18],'text-offset':[0,1.05],'text-anchor':'top'},paint:{'text-color':'#f3e9c5','text-halo-color':'#101820','text-halo-width':1.3}});
   map.on('click',(e:any)=>{
    const hits=map.queryRenderedFeatures(e.point,{layers:['wf-admin1','wf-country-hitbox']});
    const region=hits.find((f:any)=>f.layer?.id==='wf-admin1');
    if(region){const p=region.properties??{};const rid='admin1-'+String(p.adm1_code??p.code??region.id??'').replace(/[^a-zA-Z0-9_-]/g,'-');if(rid)regionSelectRef.current(rid);return;}
    const country=hits.find((f:any)=>f.layer?.id==='wf-country-hitbox');
    if(country)countrySelectRef.current(String(country.properties?.__wf_id??country.id),String(country.properties?.name??'Unknown'));
   });
   map.on('mouseenter','wf-country-hitbox',()=>{map.getCanvas().style.cursor='pointer'});
   map.on('mouseleave','wf-country-hitbox',()=>{map.getCanvas().style.cursor=''});
   map.on('mouseenter','wf-admin1',()=>{map.getCanvas().style.cursor='crosshair'});
   map.on('mouseleave','wf-admin1',()=>{map.getCanvas().style.cursor=''});
   setMapReady(true);
  });
  const report=()=>zoomChangeRef.current?.(map.getZoom());
  map.on('zoomend',report);
  return()=>{setMapReady(false);map.remove();mapRef.current=null};
 },[]);

 useEffect(()=>{
  const map=mapRef.current;if(!map||!mapReady||!map.isStyleLoaded())return;
  const src=map.getSource('wf-countries') as maplibregl.GeoJSONSource|undefined;
  if(src)src.setData(countries as any);
  if(map.getLayer('wf-country-fill'))map.setPaintProperty('wf-country-fill','fill-color',countryColorExpression(colorMap));
  if(map.getLayer('wf-country-line'))map.setPaintProperty('wf-country-line','line-color',selectedNationId?['case',['==',['get','__wf_id'],selectedNationId],'#fff0b9','#101820']:'#101820');
  if(map.getLayer('wf-admin1-line'))map.setPaintProperty('wf-admin1-line','line-color',selectedRegion?'#e3c780':'#d6c7a0');
  if(map.getLayer('wf-history-fill'))map.setPaintProperty('wf-history-fill','fill-opacity',mapMode==='history'?.32:0);
  if(map.getLayer('wf-history-line'))map.setPaintProperty('wf-history-line','line-opacity',mapMode==='history'?.75:0);
 },[worldState,mapMode,colorMap,selectedNationId,selectedRegion,mapReady]);

 useEffect(()=>{const map=mapRef.current;if(!map||!mapReady)return;const src=map.getSource('wf-admin1') as maplibregl.GeoJSONSource|undefined;if(src)src.setData({type:'FeatureCollection',features:admin1Features} as any);const cities=map.getSource('wf-cities') as maplibregl.GeoJSONSource|undefined;if(cities)cities.setData({type:'FeatureCollection',features:cityFeatures});const hist=map.getSource('wf-history') as maplibregl.GeoJSONSource|undefined;if(hist)hist.setData({type:'FeatureCollection',features:historicalFeatures} as any)},[admin1Features,cityFeatures,historicalFeatures,mapReady]);
 useEffect(()=>{const map=mapRef.current;if(!map)return;const z=Math.max(0,Math.min(22,zoom));if(Math.abs(map.getZoom()-z)>.08)map.zoomTo(z,{duration:180})},[zoom]);

 useEffect(()=>{
  const map=mapRef.current;if(!map)return;
  const target=worldState.mapEntities[worldState.playerNation??'']?.centroid;
  if(target&&map.getZoom()<1.3)map.easeTo({center:target,duration:500});
 },[worldState.playerNation]);

 return <div ref={el} className='world-maplibre' aria-label='Interactive Worldforge map'/>;
}
