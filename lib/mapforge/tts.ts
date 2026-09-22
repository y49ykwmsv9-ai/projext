"use client";
import {KokoroTTS} from "kokoro-js";
export type NeuralVoice="af_heart"|"af_bella"|"af_nicole"|"af_sarah"|"am_fenrir"|"am_michael"|"bf_emma"|"bm_george";
export type NeuralAudio={blob:Blob;url:string;duration:number};
let enginePromise:Promise<any>|null=null;
const MODEL_ID="onnx-community/Kokoro-82M-v1.0-ONNX";
async function getEngine(){
  if(!enginePromise) enginePromise=(async()=>{
    const gpu=typeof navigator!=="undefined"&&"gpu" in navigator;
    return KokoroTTS.from_pretrained(MODEL_ID,{dtype:gpu?"fp16":"q8",device:gpu?"webgpu":"wasm"});
  })();
  return enginePromise;
}
export async function synthesizeNeural(text:string,voice:NeuralVoice="af_heart",speed=0.96):Promise<NeuralAudio>{
  const clean=text.replace(/\s+/g," ").trim();
  if(!clean)throw new Error("Narration text is empty.");
  const engine=await getEngine();
  const audio=await engine.generate(clean,{voice,speed});
  const blob=audio.toBlob();
  return {blob,url:URL.createObjectURL(blob),duration:audio.audio.length/audio.sampling_rate};
}
export async function warmNeuralVoice(){await getEngine();}
export function releaseNeuralAudio(audio?:NeuralAudio){if(audio)URL.revokeObjectURL(audio.url);}
