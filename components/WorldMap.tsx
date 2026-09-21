'use client';

import {useEffect,useMemo,useRef} from 'react';
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

type Props={
 worldState:WorldState;
 mapMode:'political'|'economy'|'military'|'resources'|'diplomacy'|'history';
 admin1Features:any[];
 cityFeatures:any[];
 historicalFeatures:any[];
 selectedNationId:string|null;
 selectedRegion:string|null;
 onCountrySelect:(id:string,name:string)=>void;
 onRegionSelect:(id:string)=>void;
 onZoomChange?:(zoom:number)=>void;
};

export default function WorldMap({worldState,mapMode,admin1Features,cityFeatures,historicalFeatures,selectedNationId,selectedRegion,onCountrySelect,onRegionSelect,onZoomChange}:Props){
 const el=useRef<HTMLDivElement|null>(null);
 const mapRef=useRef<maplibregl.Map|null>(null);
 const initialized=useRef(false);
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
  const map=new maplibregl.Map({container:el.current,style:'https://tiles.openfreemap.org/styles/liberty',center:[0,20],zoom:1.05,minZoom:0,maxZoom:22,renderWorldCopies:true,dragRotate:false,pitchWithRotate:false,attributionControl:true});
  mapRef.current=map;
  map.addControl(new maplibregl.NavigationControl({showCompass:false}), 'bottom-right');
  map.on('load',()=>{
   map.addSource('wf-countries',{type:'geojson',data:countries});
   map.addLayer({id:'wf-country-fill',type:'fill',source:'wf-countries',paint:{'fill-color':'#52636d','fill-opacity':['interpolate',['linear'],['zoom'],0,.78,4,.62,7,.28,12,.10,18,.03]}});
   map.addLayer({id:'wf-country-line',type:'line',source:'wf-countries',paint:{'line-color':'#101820','line-width':['interpolate',['linear'],['zoom'],0,.45,4,.8,8,1.15,14,1.8,20,2.2],'line-opacity':.9}});
   map.addSource('wf-admin1',{type:'geojson',data:{type:'FeatureCollection',features:admin1Features}});
   map.addLayer({id:'wf-admin1-fill',type:'fill',source:'wf-admin1',minzoom:2.2,paint:{'fill-color':'#e5c777','fill-opacity':['interpolate',['linear'],['zoom'],2,.08,5,.055,9,.025,14,.012]}});
   map.addLayer({id:'wf-admin1-line',type:'line',source:'wf-admin1',minzoom:2.2,paint:{'line-color':'#d6c7a0','line-width':['interpolate',['linear'],['zoom'],2,.45,6,.8,10,1.2,16,1.8,21,2.4],'line-opacity':['interpolate',['linear'],['zoom'],2,.45,7,.72,14,.9,21,1]}});
   map.addSource('wf-cities',{type:'geojson',data:{type:'FeatureCollection',features:cityFeatures}});
   map.addLayer({id:'wf-city-points',type:'circle',source:'wf-cities',minzoom:5,paint:{'circle-radius':['interpolate',['linear'],['zoom'],5,2,10,3.2,16,5.5,21,7],'circle-color':'#f0d486','circle-stroke-color':'#111820','circle-stroke-width':1,'circle-opacity':.9}});
   map.addLayer({id:'wf-city-labels',type:'symbol',source:'wf-cities',minzoom:6,layout:{'text-field':['get','name'],'text-size':['interpolate',['linear'],['zoom'],6,9,12,12,18,15,22,18],'text-offset':[0,1.05],'text-anchor':'top'},paint:{'text-color':'#f3e9c5','text-halo-color':'#101820','text-halo-width':1.3}});
   map.on('click','wf-countries',(e:any)=>{const f=e.features?.[0];if(!f)return;onCountrySelect(String(f.properties?.__wf_id??f.id),String(f.properties?.name??'Unknown'));});
   map.on('click','wf-admin1',(e:any)=>{const f=e.features?.[0];const p=f?.properties??{};const rid='admin1-'+String(p.adm1_code??p.code??f?.id??'').replace(/[^a-zA-Z0-9_-]/g,'-');if(rid)onRegionSelect(rid);});
   map.on('mouseenter','wf-countries',()=>{map.getCanvas().style.cursor='pointer'});
   map.on('mouseleave','wf-countries',()=>{map.getCanvas().style.cursor=''});
   map.on('mouseenter','wf-admin1',()=>{map.getCanvas().style.cursor='crosshair'});
   map.on('mouseleave','wf-admin1',()=>{map.getCanvas().style.cursor=''});
  });
  const report=()=>onZoomChange?.(map.getZoom());
  map.on('zoomend',report);
  return()=>{map.remove();mapRef.current=null};
 },[admin1Features,cityFeatures,onCountrySelect,onRegionSelect,onZoomChange]);

 useEffect(()=>{
  const map=mapRef.current;if(!map||!map.isStyleLoaded())return;
  const src=map.getSource('wf-countries') as maplibregl.GeoJSONSource|undefined;
  if(src)src.setData(countries as any);
  for(const [id,color] of Object.entries(colorMap))map.setFeatureState({source:'wf-countries',id},{color});
  if(map.getLayer('wf-country-fill'))map.setPaintProperty('wf-country-fill','fill-color',['coalesce',['feature-state','color'],colorMap[selectedNationId??'']??'#52636d']);
  if(map.getLayer('wf-country-line'))map.setPaintProperty('wf-country-line','line-color',selectedNationId?['case',['==',['get','__wf_id'],selectedNationId],'#fff0b9','#101820']:'#101820');
  if(map.getLayer('wf-admin1-line'))map.setPaintProperty('wf-admin1-line','line-color',selectedRegion?'#e3c780':'#d6c7a0');
 },[worldState,mapMode,colorMap,selectedNationId,selectedRegion]);

 useEffect(()=>{
  const map=mapRef.current;if(!map)return;
  const target=worldState.mapEntities[worldState.playerNation??'']?.centroid;
  if(target&&map.getZoom()<1.3)map.easeTo({center:target,duration:500});
 },[worldState.playerNation]);

 return <div ref={el} className='world-maplibre' aria-label='Interactive Worldforge map'/>;
}
