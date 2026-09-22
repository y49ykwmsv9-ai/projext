"use client";
import {useEffect,useRef,useState} from "react";
import * as maplibregl from "maplibre-gl";
import {setWorkerUrl,type Map as MLMap} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {queryCliopatriaYear} from "../lib/cliopatria";
import {planFromPrompt} from "../lib/mapforge/planner";
import type {MapForgeClip,MapForgeProject} from "../lib/mapforge/types";
import "../app/mapforge/mapforge.css";

const BASE_PATH=process.env.NEXT_PUBLIC_BASE_PATH??"";
setWorkerUrl(`${BASE_PATH}/maplibre/maplibre-gl-worker.mjs`);

const STYLES={openfree:"https://tiles.openfreemap.org/styles/fiord",historical:"https://unpkg.com/@openhistoricalmap/map-styles@latest/dist/historical/historical.json"} as const;

export default function MapForgeStudio(){
  const [prompt,setPrompt]=useState("");
  const [project,setProject]=useState<MapForgeProject|null>(null);
  const [clip,setClip]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [source,setSource]=useState<"openfree"|"historical">("historical");
  const [status,setStatus]=useState("");
  const [showCredits,setShowCredits]=useState(false);\n  const [voiceEnabled,setVoiceEnabled]=useState(true);\n  const [speaking,setSpeaking]=useState(false);
  const mapRef=useRef<MLMap|null>(null);
  const elRef=useRef<HTMLDivElement|null>(null);
  const timer=useRef<number|null>(null);
  const current=project?.clips[clip];

  const generate=()=>{
    const text=prompt.trim();
    if(!text)return;
    const next=planFromPrompt(text);
    setProject(next);
    setClip(0);
    setPlaying(false);
    setStatus("Building a narrative timeline…");
  };

  const draw=async(m:MLMap,c:MapForgeClip)=>{
    if(!c.year)return;
    const features=await queryCliopatriaYear(c.year,c.region);
    const fc={type:"FeatureCollection",features:features as any};
    const existing=m.getSource("cliopatria") as maplibregl.GeoJSONSource|undefined;
    if(existing)existing.setData(fc as any);
    else m.addSource("cliopatria",{type:"geojson",data:fc as any});
    if(!m.getLayer("cliopatria-fill"))m.addLayer({id:"cliopatria-fill",type:"fill",source:"cliopatria",paint:{"fill-color":"#b68d55","fill-opacity":.24}});
    if(!m.getLayer("cliopatria-line"))m.addLayer({id:"cliopatria-line",type:"line",source:"cliopatria",paint:{"line-color":"#d6b36a","line-width":1.3,"line-opacity":.7}});
    for(const l of c.layers){
      if(l.kind!=="route"||!l.coordinates)continue;
      const id="route-"+l.id;
      const data={type:"Feature",geometry:{type:"LineString",coordinates:l.coordinates},properties:{}};
      const s=m.getSource(id) as maplibregl.GeoJSONSource|undefined;
      if(s)s.setData(data as any);
      else{m.addSource(id,{type:"geojson",data:data as any});m.addLayer({id,type:"line",source:id,paint:{"line-color":l.color||"#d6b36a","line-width":l.width||4,"line-opacity":.9,"line-dasharray":[1.2,1]}});}
    }
    m.flyTo({center:c.center,zoom:c.zoom,pitch:c.pitch||0,bearing:c.bearing||0,duration:Math.max(700,c.duration*140)});
    setStatus(`Scene ready · ${features.length} historically active polities in the narrative region`);
  };

  useEffect(()=>{
    if(!project||!elRef.current||!current)return;
    const m=new maplibregl.Map({container:elRef.current,style:STYLES[source],center:current.center,zoom:current.zoom,pitch:current.pitch||0,canvasContextAttributes:{preserveDrawingBuffer:true}});
    mapRef.current=m;
    m.on("load",()=>draw(m,current).catch(e=>setStatus("Data warning: "+e.message)));
    return()=>{m.remove();mapRef.current=null};
  },[project,source]);

  useEffect(()=>{
    const m=mapRef.current;
    if(m&&current&&m.isStyleLoaded())draw(m,current).catch(e=>setStatus(e.message));
  },[clip,current?.year]);

  useEffect(()=>{
    if(!playing||!project){if(timer.current)window.clearInterval(timer.current);return}
    timer.current=window.setInterval(()=>setClip(i=>(i+1)%project.clips.length),Math.max(1000,(current?.duration??6)*1000));
    return()=>{if(timer.current)window.clearInterval(timer.current)};
  },[playing,project,current?.duration]);

  const speakCurrent=()=>{
    const text=current?.narration?.trim();
    if(!text||typeof window==="undefined"||!("speechSynthesis" in window))return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=project?.voice.language??"en-US";
    u.rate=project?.voice.pace??0.96;
    const voices=window.speechSynthesis.getVoices();
    u.voice=voices.find(v=>v.lang===u.lang)||voices.find(v=>v.lang.startsWith("en"))||null;
    u.onstart=()=>setSpeaking(true); u.onend=()=>setSpeaking(false); u.onerror=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const exportJson=()=>{
    if(!project)return;
    const blob=new Blob([JSON.stringify(project,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.title||"mapforge").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".json";a.click();URL.revokeObjectURL(a.href);
  };

  const record=async()=>{
    const m=mapRef.current;if(!m||!project)return;
    setStatus("Recording WebM preview…");
    const stream=m.getCanvas().captureStream(project.fps);
    const rec=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp9"});
    const chunks:Blob[]=[];
    rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    rec.onstop=()=>{
      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(chunks,{type:"video/webm"}));a.download="mapforge-preview.webm";a.click();setStatus("WebM exported");
    };
    rec.start();setPlaying(true);
    await new Promise(r=>setTimeout(r,Math.min(120000,project.clips.reduce((n,c)=>n+c.duration,0)*1000)));
    setPlaying(false);rec.stop();
  };

  if(!project){
    return <main className="mf-create">
      <div className="mf-create-inner">
        <span className="mf-kicker">MAPFORGE · VIDEO CREATION ENGINE</span>
        <h1>What do you want to make?</h1>
        <p className="mf-create-sub">Describe the video in plain language. MapForge will turn the request into a historical timeline, geography, camera choreography, routes, labels, and map animation.</p>
        <div className="mf-prompt-shell">
          <textarea autoFocus value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")generate()}} placeholder="Create a cinematic documentary about the Reconquista from 711 to 1492, showing territorial changes, major campaigns, cities, battles, dates, narration, and camera movement…" />
          <button className="mf-create-button" disabled={!prompt.trim()} onClick={generate}>Create video</button>
        </div>
        <div className="mf-create-hint">⌘/Ctrl + Enter to create · No project is loaded until you submit a prompt.</div>
      </div>
    </main>;
  }

  return <main className="mf">
    <header className="mf-head"><div><span className="mf-kicker">MAPFORGE / CREATION STUDIO</span><h1>{project.title}</h1><p>Edit the generated video plan, inspect the map, then export or record a preview.</p></div><div className="mf-actions"><button onClick={()=>setProject(null)}>New video</button><button onClick={exportJson}>Export JSON</button><button onClick={record}>Record WebM</button><button onClick={speakCurrent}>{speaking?"Speaking…":"Play voice-over"}</button></div></header>
    <section className="mf-workspace">
      <aside className="mf-left">
        <label>VIDEO PROMPT<textarea value={prompt} onChange={e=>setPrompt(e.target.value)}/></label>
        <button className="mf-generate-again" onClick={generate}>Regenerate from prompt</button>
        <div className="mf-row"><button className={source==="historical"?"on":""} onClick={()=>setSource("historical")}>Historical</button><button className={source==="openfree"?"on":""} onClick={()=>setSource("openfree")}>Modern</button></div>
        <div className="mf-card"><b>Production checks</b><p>{project.checks.filter(x=>x.severity==="error"&&!x.passed).length?"Blocked: resolve chronology errors before recording.":"Chronology, geography, camera continuity and narration checks passed or flagged for review."}</p>{project.checks.slice(0,8).map(x=><div key={x.id} className={x.passed?"mf-check":"mf-check warn"}>● {x.label}: {x.passed?"PASS":"REVIEW"} <small>{x.detail}</small></div>)}</div>
        <div className="mf-card"><b>Voice-over engine</b><p>{project.voice.provider==="browser"?"Browser TTS is available for preview. For a genuinely human-sounding final voice, connect an external neural TTS provider and attach its generated audio before final render.":project.voice.provider}</p><button onClick={()=>setVoiceEnabled(!voiceEnabled)}>{voiceEnabled?"Voice enabled":"Voice disabled"}</button></div>
        <div className="mf-card"><b>Creation engine</b><p>Prompt → narrative scenes → dated geography → camera choreography → map animation. Historical data is filtered to the scene year and the geography implied by the narrative.</p></div>
        <button className="mf-credit" onClick={()=>setShowCredits(!showCredits)}>{showCredits?"Hide":"Show"} data credits</button>
        {showCredits&&<div className="mf-card small">{project.credits.map(x=><div key={x}>• {x}</div>)}</div>}
      </aside>
      <section className="mf-map-wrap"><div ref={elRef} className="mf-map"/><div className="mf-map-title"><b>{current?.title}</b><span>{current?.year??"—"} · {current?.camera}</span></div><div className="mf-status">{status}</div></section>
      <aside className="mf-right"><div className="mf-right-head"><b>Generated scenes</b><span>{clip+1}/{project.clips.length}</span></div>{project.clips.map((c,i)=><button key={c.id} className={"mf-scene "+(i===clip?"active":"")} onClick={()=>setClip(i)}><span>{c.year??"—"}</span><strong>{c.title}</strong><small>{c.camera} · {c.duration}s</small></button>)}</aside>
    </section>
    <footer className="mf-transport"><button onClick={()=>setClip(Math.max(0,clip-1))}>‹</button><button onClick={()=>setPlaying(!playing)}>{playing?"Pause":"Play"}</button><button onClick={()=>setClip(Math.min(project.clips.length-1,clip+1))}>›</button><span>{current?.narration||"Scene ready"}</span><b>{Math.round((clip/(Math.max(1,project.clips.length-1)))*100)}%</b></footer>
  </main>
}