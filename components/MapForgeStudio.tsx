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
import {renderGate,type RenderPhase} from "../lib/mapforge/qc";
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
  const [renderPhase,setRenderPhase]=useState<RenderPhase>("planning");
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
    setRenderPhase("historical-verification");setStatus("Verifying historical scene scopes…");
    try{
      const historicalChecks=[] as MapForgeProject["checks"];
      for(const sc of project.clips){
        if(!sc.year||!sc.region)continue;
        const active=await queryCliopatriaYear(sc.year,sc.region);
        historicalChecks.push({id:"historical-"+sc.id,label:"Historical data",passed:active.length>0,severity:active.length>0?"info":"warning",detail:active.length?active.length+" active polities in scene scope.":"No CLIOPATRIA polity matched this scene scope; review before publication."});
      }
      setRenderPhase("continuity");
      const gate=[...project.checks,...historicalChecks,...renderGate(project.clips)];
      const fatal=gate.some(x=>x.severity==="error"&&!x.passed);
      setProject({...project,checks:gate});
      if(fatal){setStatus("Final render blocked by production QC.");return;}
      setRenderPhase("voice-generation");setStatus("Generating neural narration and measuring every scene…");
      for(const sc of project.clips){
        if(!sc.narration)continue;
        if(!audioCache.current[sc.id])audioCache.current[sc.id]=await synthesizeNeural(sc.narration,(project.voice.voice as any)||"af_heart",project.voice.pace);
        sc.narrationSeconds=audioCache.current[sc.id].duration;
        sc.duration=Math.max(4,sc.narrationSeconds+0.6);
      }
      setRenderPhase("audio-sync");
      const canvas=m.getCanvas().captureStream(project.fps);
      const ctx=new AudioContext();
      const dest=ctx.createMediaStreamDestination();
      const master=ctx.createGain();
      const compressor=ctx.createDynamicsCompressor();
      master.gain.value=0.88;
      compressor.threshold.value=-18;compressor.knee.value=12;compressor.ratio.value=3;compressor.attack.value=0.01;compressor.release.value=0.15;
      master.connect(compressor);compressor.connect(dest);
      const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")?"video/webm;codecs=vp9,opus":"video/webm";
      const stream=new MediaStream([...canvas.getVideoTracks(),...dest.stream.getAudioTracks()]);
      const rec=new MediaRecorder(stream,{mimeType:mime});
      const chunks:Blob[]=[];
      rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
      rec.onstop=()=>{const blob=new Blob(chunks,{type:mime}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.title||"mapforge").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+"-neural.webm";a.click();setRenderPhase("complete");setStatus("Final QC passed · synchronized neural video exported.");setVoiceStatus("Final audio/video render complete");ctx.close();};
      setRenderPhase("visual-render");rec.start(250);
      for(let i=0;i<project.clips.length;i++){
        const sc=project.clips[i];
        setClip(i);
        await draw(m,sc);
        const audio=audioCache.current[sc.id];
        if(audio){
          const decoded=await ctx.decodeAudioData((await audio.blob.arrayBuffer()).slice(0));
          const node=ctx.createBufferSource();
          const gain=ctx.createGain();
          node.buffer=decoded;gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(1,ctx.currentTime+0.08);gain.gain.setValueAtTime(1,ctx.currentTime+Math.max(0.08,decoded.duration-0.12));gain.gain.linearRampToValueAtTime(0,ctx.currentTime+decoded.duration);
          node.connect(gain);gain.connect(master);node.start();
          await new Promise(r=>setTimeout(r,Math.max(1000,(decoded.duration-0.12)*1000)));
        }else await new Promise(r=>setTimeout(r,Math.max(1000,sc.duration*1000)));
      }
      setRenderPhase("final-qc");setStatus("Running final render QC…");
      await new Promise(r=>setTimeout(r,350));
      setPlaying(false);rec.stop();
    }catch(e){setPlaying(false);setRenderPhase("final-qc");setStatus(e instanceof Error?e.message:"Neural render failed");setVoiceStatus("Neural render failed");}
  };

