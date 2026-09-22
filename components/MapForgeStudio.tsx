"use client";
import {useEffect,useRef,useState} from "react";
import * as maplibregl from "maplibre-gl";
import {setWorkerUrl,type Map as MLMap} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {queryCliopatriaYear} from "../lib/cliopatria";
import {planFromPrompt} from "../lib/mapforge/planner";
import type {MapForgeClip,MapForgeProject} from "../lib/mapforge/types";
import "../app/mapforge/mapforge.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";\nsetWorkerUrl(`${BASE_PATH}/maplibre/maplibre-gl-worker.mjs`);

const STYLES={openfree:"https://tiles.openfreemap.org/styles/fiord",historical:"https://unpkg.com/@openhistoricalmap/map-styles@latest/dist/historical/historical.json"} as const;
const demoPrompt="Create a cinematic Reconquista documentary from 711 to 1492. Show changing historical territories, invasion routes, major battles, cities, dates, camera moves, and a final fall of Granada.";
const blank=planFromPrompt(demoPrompt);

export default function MapForgeStudio(){
  const mapRef=useRef<MLMap|null>(null), elRef=useRef<HTMLDivElement|null>(null), timer=useRef<number|null>(null);
  const [project,setProject]=useState<MapForgeProject>(blank),[prompt,setPrompt]=useState(demoPrompt),[clip,setClip]=useState(0);
  const [playing,setPlaying]=useState(false),[source,setSource]=useState<"openfree"|"historical">("historical");
  const [status,setStatus]=useState("Ready"),[showCredits,setShowCredits]=useState(false);
  const current=project.clips[clip];

  const draw=async(m:MLMap,c:MapForgeClip)=>{
    const features=c.year?await queryCliopatriaYear(c.year):[];
    const fc={type:"FeatureCollection",features:features as any};
    const existing=m.getSource("cliopatria") as maplibregl.GeoJSONSource|undefined;
    if(existing) existing.setData(fc as any);
    else m.addSource("cliopatria",{type:"geojson",data:fc as any});
    if(!m.getLayer("cliopatria-fill"))m.addLayer({id:"cliopatria-fill",type:"fill",source:"cliopatria",paint:{"fill-color":"#b68d55","fill-opacity":.24}});
    if(!m.getLayer("cliopatria-line"))m.addLayer({id:"cliopatria-line",type:"line",source:"cliopatria",paint:{"line-color":"#d6b36a","line-width":1.3,"line-opacity":.7}});
    for(const l of c.layers){
      if(l.kind==="route"&&l.coordinates){
        const id="route-"+l.id, data={type:"Feature",geometry:{type:"LineString",coordinates:l.coordinates},properties:{}};
        const s=m.getSource(id) as maplibregl.GeoJSONSource|undefined;
        if(s)s.setData(data as any); else {m.addSource(id,{type:"geojson",data:data as any});m.addLayer({id,type:"line",source:id,paint:{"line-color":l.color||"#d6b36a","line-width":l.width||4,"line-opacity":.9,"line-dasharray":[1.2,1]}});}
      }
    }
    m.flyTo({center:c.center,zoom:c.zoom,pitch:c.pitch||0,bearing:c.bearing||0,duration:Math.max(700,c.duration*140)});
  };

  useEffect(()=>{
    if(!elRef.current)return;
    const m=new maplibregl.Map({container:elRef.current,style:STYLES[source],center:current.center,zoom:current.zoom,pitch:current.pitch||0,canvasContextAttributes:{preserveDrawingBuffer:true}});
    mapRef.current=m;
    m.on("load",()=>{setStatus("Map loaded • "+(source==="historical"?"OpenHistoricalMap":"OpenFreeMap"));draw(m,current).catch(e=>setStatus("Data warning: "+e.message));});
    return()=>{m.remove();mapRef.current=null};
  },[source]);

  useEffect(()=>{const m=mapRef.current;if(m&&m.isStyleLoaded())draw(m,current).catch(e=>setStatus(e.message));},[clip,current.year]);

  useEffect(()=>{if(!playing){if(timer.current)window.clearInterval(timer.current);return;}timer.current=window.setInterval(()=>setClip(i=>(i+1)%project.clips.length),Math.max(1000,current.duration*1000));return()=>{if(timer.current)window.clearInterval(timer.current)}},[playing,current.duration,project.clips.length]);

  const generate=()=>{const p=planFromPrompt(prompt);setProject(p);setClip(0);setStatus("Generated "+p.clips.length+" scenes from natural language");};
  const exportJson=()=>{const blob=new Blob([JSON.stringify(project,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.title||"mapforge").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".json";a.click();URL.revokeObjectURL(a.href);};
  const record=async()=>{
    const m=mapRef.current;if(!m){return} setStatus("Recording WebM preview…");
    const stream=m.getCanvas().captureStream(project.fps);const rec=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp9"});
    const chunks:Blob[]=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.onstop=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(chunks,{type:"video/webm"}));a.download="mapforge-preview.webm";a.click();setStatus("WebM exported");};
    rec.start();setPlaying(true);await new Promise(r=>setTimeout(r,Math.min(120000,project.clips.reduce((n,c)=>n+c.duration,0)*1000)));setPlaying(false);rec.stop();
  };
  return <main className="mf">
    <header className="mf-head"><div><span className="mf-kicker">WORLD FORGE / MAPFORGE</span><h1>Freeform Historical Map Studio</h1><p>Describe the history. Generate the timeline. Animate the map.</p></div><div className="mf-actions"><button onClick={generate}>Generate</button><button onClick={exportJson}>Export JSON</button><button onClick={record}>Record WebM</button></div></header>
    <section className="mf-workspace">
      <aside className="mf-left">
        <label>FREEFORM REQUEST<textarea value={prompt} onChange={e=>setPrompt(e.target.value)} /></label>
        <div className="mf-row"><button className={source==="historical"?"on":""} onClick={()=>setSource("historical")}>Historical</button><button className={source==="openfree"?"on":""} onClick={()=>setSource("openfree")}>Modern</button></div>
        <div className="mf-card"><b>Generation engine</b><p>Natural-language parser extracts dates, places, routes, historical scenes and camera intent. Reconquista has a curated 711–1492 chronology.</p></div>
        <div className="mf-card"><b>Data stack</b><p>Cliopatria/Seshat for dated polity geometry, OpenHistoricalMap for historical basemaps, OpenFreeMap for modern basemaps.</p></div>
        <button className="mf-credit" onClick={()=>setShowCredits(!showCredits)}>{showCredits?"Hide":"Show"} map credits</button>
        {showCredits&&<div className="mf-card small">{project.credits.map(x=><div key={x}>• {x}</div>)}</div>}
      </aside>
      <section className="mf-map-wrap"><div ref={elRef} className="mf-map"/><div className="mf-map-title"><b>{current.title}</b><span>{current.year??"—"} · {current.camera}</span></div><div className="mf-status">{status}</div></section>
      <aside className="mf-right"><div className="mf-right-head"><b>Timeline</b><span>{clip+1}/{project.clips.length}</span></div>{project.clips.map((c,i)=><button key={c.id} className={"mf-scene "+(i===clip?"active":"")} onClick={()=>setClip(i)}><span>{c.year??"—"}</span><strong>{c.title}</strong><small>{c.camera} · {c.duration}s</small></button>)}</aside>
    </section>
    <footer className="mf-transport"><button onClick={()=>setClip(Math.max(0,clip-1))}>‹</button><button onClick={()=>setPlaying(!playing)}>{playing?"Pause":"Play"}</button><button onClick={()=>setClip(Math.min(project.clips.length-1,clip+1))}>›</button><span>{current.narration||"Scene ready"}</span><b>{Math.round((clip/(Math.max(1,project.clips.length-1)))*100)}%</b></footer>
  </main>
}