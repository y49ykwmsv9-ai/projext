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


import {useEffect,useRef,useState} from "react";
import * as maplibregl from "maplibre-gl";
import {setWorkerUrl,type Map as MLMap} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {queryCliopatriaYear} from "../lib/cliopatria";
import {planFromPrompt} from "../lib/mapforge/planner";
import type {MapForgeClip,MapForgeProject} from "../lib/mapforge/types";
import {synthesizeNeural,type NeuralAudio,warmNeuralVoice} from "../lib/mapforge/tts";
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
  const [showCredits,setShowCredits]=useState(false);
  const [voiceEnabled,setVoiceEnabled]=useState(true);
  const [speaking,setSpeaking]=useState(false);
  const [voiceStatus,setVoiceStatus]=useState("Neural voice idle");
  const audioCache=useRef<Record<string,NeuralAudio>>({});
  const mapRef=useRef<MLMap|null>(null);
  const elRef=useRef<HTMLDivElement|null>(null);
  const timer=useRef<number|null>(null);
  const current=project?.clips[clip];

  const generate=()=>{const text=prompt.trim();if(!text)return;setProject(planFromPrompt(text));setClip(0);setPlaying(false);setStatus("Building a narrative timeline…");};
  const draw=async(m:MLMap,c:MapForgeClip)=>{
    if(!c.year)return;
    const features=await queryCliopatriaYear(c.year,c.region);
    const fc={type:"FeatureCollection",features:features as any};
    const existing=m.getSource("cliopatria") as maplibregl.GeoJSONSource|undefined;
    if(existing)existing.setData(fc as any);else m.addSource("cliopatria",{type:"geojson",data:fc as any});
    if(!m.getLayer("cliopatria-fill"))m.addLayer({id:"cliopatria-fill",type:"fill",source:"cliopatria",paint:{"fill-color":"#b68d55","fill-opacity":.24}});
    if(!m.getLayer("cliopatria-line"))m.addLayer({id:"cliopatria-line",type:"line",source:"cliopatria",paint:{"line-color":"#d6b36a","line-width":1.3,"line-opacity":.7}});
    for(const l of c.layers){if(l.kind!=="route"||!l.coordinates)continue;const id="route-"+l.id;const data={type:"Feature",geometry:{type:"LineString",coordinates:l.coordinates},properties:{}};const s=m.getSource(id) as maplibregl.GeoJSONSource|undefined;if(s)s.setData(data as any);else{m.addSource(id,{type:"geojson",data:data as any});m.addLayer({id,type:"line",source:id,paint:{"line-color":l.color||"#d6b36a","line-width":l.width||4,"line-opacity":.9,"line-dasharray":[1.2,1]}});}}
    m.flyTo({center:c.center,zoom:c.zoom,pitch:c.pitch||0,bearing:c.bearing||0,duration:Math.max(700,c.duration*140)});
    setStatus(`Scene ready · ${features.length} historically active polities in the narrative region`);
  };
  useEffect(()=>{if(!project||!elRef.current||!current)return;const m=new maplibregl.Map({container:elRef.current,style:STYLES[source],center:current.center,zoom:current.zoom,pitch:current.pitch||0,canvasContextAttributes:{preserveDrawingBuffer:true}});mapRef.current=m;m.on("load",()=>draw(m,current).catch(e=>setStatus("Data warning: "+e.message)));return()=>{m.remove();mapRef.current=null};},[project,source]);
  useEffect(()=>{const m=mapRef.current;if(m&&current&&m.isStyleLoaded())draw(m,current).catch(e=>setStatus(e.message));},[clip,current?.year]);
  useEffect(()=>{if(!playing||!project){if(timer.current)window.clearInterval(timer.current);return}timer.current=window.setInterval(()=>setClip(i=>(i+1)%project.clips.length),Math.max(1000,(current?.duration??6)*1000));return()=>{if(timer.current)window.clearInterval(timer.current)};},[playing,project,current?.duration]);

  const speakCurrent=async()=>{
    if(!voiceEnabled||!current?.narration)return;
    setSpeaking(true);setVoiceStatus("Generating neural narration…");
    try{let audio=audioCache.current[current.id];if(!audio){audio=await synthesizeNeural(current.narration,(project?.voice.voice as any)||"af_heart",project?.voice.pace??0.96);audioCache.current[current.id]=audio;}const el=new Audio(audio.url);el.onended=()=>setSpeaking(false);el.onerror=()=>setSpeaking(false);setVoiceStatus(`Neural voice ready · ${audio.duration.toFixed(1)}s`);await el.play();}catch(e){setSpeaking(false);setVoiceStatus(e instanceof Error?e.message:"Neural voice generation failed");}
  };
  const exportJson=()=>{if(!project)return;const blob=new Blob([JSON.stringify(project,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.title||"mapforge").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".json";a.click();};
  const record=async()=>{
    const m=mapRef.current;if(!m||!project)return;
    if(project.checks.some(x=>x.severity==="error"&&!x.passed)){setStatus("Render blocked: chronology checks failed.");return;}
    setStatus("Generating neural narration for every scene…");setVoiceStatus("Generating neural narration…");
    try{
      for(const sc of project.clips){if(!sc.narration)continue;if(!audioCache.current[sc.id])audioCache.current[sc.id]=await synthesizeNeural(sc.narration,(project.voice.voice as any)||"af_heart",project.voice.pace);sc.narrationSeconds=audioCache.current[sc.id].duration;}
      setProject({...project,clips:[...project.clips],voice:{...project.voice,provider:"neural",model:"Kokoro-82M"}});
      const canvas=m.getCanvas().captureStream(project.fps),ctx=new AudioContext(),dest=ctx.createMediaStreamDestination();
      const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")?"video/webm;codecs=vp9,opus":"video/webm";
      const stream=new MediaStream([...canvas.getVideoTracks(),...dest.stream.getAudioTracks()]);
      const rec=new MediaRecorder(stream,{mimeType:mime}),chunks:Blob[]=[];
      rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
      rec.onstop=()=>{const blob=new Blob(chunks,{type:mime}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.title||"mapforge").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+"-neural.webm";a.click();setStatus("Neural WebM exported with narration.");setVoiceStatus("Final audio/video render complete");ctx.close();};
      rec.start(250);setPlaying(true);
      for(let i=0;i<project.clips.length;i++){setClip(i);const sc=project.clips[i],audio=audioCache.current[sc.id];if(audio){const decoded=await ctx.decodeAudioData((await audio.blob.arrayBuffer()).slice(0));const node=ctx.createBufferSource();node.buffer=decoded;node.connect(dest);node.start();await new Promise(r=>setTimeout(r,Math.max(1200,decoded.duration*1000)));}else await new Promise(r=>setTimeout(r,Math.max(1200,sc.duration*1000)));}
      setPlaying(false);rec.stop();
    }catch(e){setPlaying(false);setStatus(e instanceof Error?e.message:"Neural render failed");setVoiceStatus("Neural render failed");}
  };
  if(!project)return <main className="mf-create"><div className="mf-create-inner"><span className="mf-kicker">MAPFORGE · VIDEO CREATION ENGINE</span><h1>What do you want to make?</h1><p className="mf-create-sub">Describe the video in plain language. MapForge will turn the request into a historical timeline, geography, camera choreography, routes, labels, and map animation.</p><div className="mf-prompt-shell"><textarea autoFocus value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")generate()}} placeholder="Create a cinematic documentary about the Reconquista from 711 to 1492, showing territorial changes, major campaigns, cities, battles, dates, narration, and camera movement…"/><button className="mf-create-button" disabled={!prompt.trim()} onClick={generate}>Create video</button></div><div className="mf-create-hint">⌘/Ctrl + Enter to create · No project is loaded until you submit a prompt.</div></div></main>;
  return <main className="mf"><header className="mf-head"><div><span className="mf-kicker">MAPFORGE / CREATION STUDIO</span><h1>{project.title}</h1><p>Edit the generated video plan, inspect the map, then render with local neural narration.</p></div><div className="mf-actions"><button onClick={()=>setProject(null)}>New video</button><button onClick={exportJson}>Export JSON</button><button onClick={record}>Render neural video</button><button onClick={speakCurrent}>{speaking?"Speaking…":"Play neural voice"}</button></div></header>
  <section className="mf-workspace"><aside className="mf-left"><label>VIDEO PROMPT<textarea value={prompt} onChange={e=>setPrompt(e.target.value)}/></label><button className="mf-generate-again" onClick={generate}>Regenerate from prompt</button><div className="mf-row"><button className={source==="historical"?"on":""} onClick={()=>setSource("historical")}>Historical</button><button className={source==="openfree"?"on":""} onClick={()=>setSource("openfree")}>Modern</button></div>
  <div className="mf-card"><b>Production checks</b><p>{project.checks.filter(x=>x.severity==="error"&&!x.passed).length?"Blocked: resolve chronology errors before recording.":"Chronology, geography, camera continuity and narration checks passed or flagged for review."}</p>{project.checks.slice(0,8).map(x=><div key={x.id} className={x.passed?"mf-check":"mf-check warn"}>● {x.label}: {x.passed?"PASS":"REVIEW"} <small>{x.detail}</small></div>)}</div>
  <div className="mf-card"><b>Neural voice-over engine</b><p>Kokoro-82M runs locally in the browser using WebGPU when available and WASM otherwise. No voice API key or per-minute credit system is required.</p><button onClick={()=>setVoiceEnabled(!voiceEnabled)}>{voiceEnabled?"Neural voice enabled":"Voice disabled"}</button><button onClick={()=>warmNeuralVoice().then(()=>setVoiceStatus("Neural model loaded")).catch(e=>setVoiceStatus(e.message))}>Load neural voice</button><small className="mf-voice-status">{voiceStatus}</small></div>
  <div className="mf-card"><b>Creation engine</b><p>Prompt → historical timeline → geographically scoped CLIOPATRIA data → camera choreography → neural narration → synchronized WebM render.</p></div><button className="mf-credit" onClick={()=>setShowCredits(!showCredits)}>{showCredits?"Hide":"Show"} data credits</button>{showCredits&&<div className="mf-card small">{project.credits.map(x=><div key={x}>• {x}</div>)}</div>}</aside>
  <section className="mf-map-wrap"><div ref={elRef} className="mf-map"/><div className="mf-map-title"><b>{current?.title}</b><span>{current?.year??"—"} · {current?.camera}</span></div><div className="mf-status">{status}</div></section>
  <aside className="mf-right"><div className="mf-right-head"><b>Generated scenes</b><span>{clip+1}/{project.clips.length}</span></div>{project.clips.map((c,i)=><button key={c.id} className={"mf-scene "+(i===clip?"active":"")} onClick={()=>setClip(i)}><span>{c.year??"—"}</span><strong>{c.title}</strong><small>{c.camera} · {c.narrationSeconds?c.narrationSeconds.toFixed(1)+"s voice":c.duration+"s target"}</small></button>)}</aside></section>
  <footer className="mf-transport"><button onClick={()=>setClip(Math.max(0,clip-1))}>‹</button><button onClick={()=>setPlaying(!playing)}>{playing?"Pause":"Play"}</button><button onClick={()=>setClip(Math.min(project.clips.length-1,clip+1))}>›</button><span>{current?.narration||"Scene ready"}</span><b>{Math.round((clip/(Math.max(1,project.clips.length-1)))*100)}%</b></footer></main>;
}
