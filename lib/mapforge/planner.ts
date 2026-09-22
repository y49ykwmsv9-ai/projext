import type { CameraMode, MapForgeClip, MapForgeProject, MapForgeVoice } from "./types";
import {addTransitionRoutes,narrationSeconds,runContinuityChecks} from "./continuity";

const places:Record<string,[number,number]> = {
  "gibraltar":[-5.35,36.14],"tangier":[-5.81,35.78],"cordoba":[-4.78,37.89],
  "toledo":[-4.03,39.86],"seville":[-5.99,37.39],"zaragoza":[-0.88,41.65],
  "granada":[-3.60,37.18],"covadonga":[-5.09,43.31],"las navas de tolosa":[-3.53,38.34],
  "lisbon":[-9.14,38.72],"barcelona":[2.17,41.39],"valencia":[-0.38,39.47],
  "rome":[12.50,41.90],"constantinople":[28.98,41.01],"jerusalem":[35.23,31.78]
};
const reconquista: Array<[number,string,string,[number,number],number,CameraMode]> = [
  [711,"Iberia before the conquest","Toledo",[-4.0,39.9],5.2,"top-down"],
  [711,"The invasion begins","Gibraltar",[-5.3,36.2],7.0,"fly-to"],
  [714,"Rapid Umayyad expansion","Córdoba",[-4.8,37.9],5.6,"sweep"],
  [722,"Covadonga","Covadonga",[-5.1,43.3],6.4,"fly-to"],
  [756,"Emirate of Córdoba","Córdoba",[-4.8,37.9],5.6,"orbit"],
  [900,"The northern kingdoms","Toledo",[-4.0,40.0],5.3,"sweep"],
  [929,"Caliphate of Córdoba","Córdoba",[-4.8,37.9],5.5,"orbit"],
  [1031,"The taifa kingdoms","Seville",[-6.0,37.4],5.4,"sweep"],
  [1085,"Toledo falls","Toledo",[-4.0,39.9],6.3,"fly-to"],
  [1086,"Almoravid intervention","Gibraltar",[-5.3,36.2],5.2,"sweep"],
  [1212,"Las Navas de Tolosa","Las Navas de Tolosa",[-3.5,38.3],6.2,"fly-to"],
  [1250,"The frontier moves south","Toledo",[-4.0,39.5],5.1,"sweep"],
  [1300,"The Kingdom of Granada","Granada",[-3.6,37.2],6.2,"orbit"],
  [1400,"The final frontier","Granada",[-3.6,37.2],5.8,"sweep"],
  [1491,"The final campaign","Granada",[-3.6,37.2],6.6,"fly-to"],
  [1492,"Granada falls","Granada",[-3.6,37.2],6.6,"orbit"]
] as const;

function narrationFor(title:string,year:number,prompt:string){
  const clean=prompt.replace(/\s+/g," ").trim();
  return `${title}. In ${year}, this scene establishes the political and geographic context before the sequence moves forward. The map focuses on the places and powers relevant to this moment, while later developments remain outside the scene until their own date. ${clean.slice(0,360)}`;
}
function findPlace(text:string) {
  const key=Object.keys(places).sort((a,b)=>b.length-a.length).find(k=>text.toLowerCase().includes(k));
  return key ? places[key] : [0,30] as [number,number];
}
function years(text:string) {
  const ys=[...text.matchAll(/(?<!\\d)(-?\\d{1,4})(?:\\s*(?:BCE|BC|CE|AD))?(?!\\d)/gi)].map(m=>Number(m[1])).filter(y=>Math.abs(y)>=100 && Math.abs(y)<=4000);
  return [...new Set(ys)];
}
export function planFromPrompt(prompt:string):MapForgeProject {
  const p=prompt.toLowerCase();
  if(p.includes("reconquista")) {
    const reconquistaRegion:[number,number,number,number]=[-10,33,6,45];
    const clips:MapForgeClip[]=reconquista.map(([year,title,place,center,zoom,camera],i)=>({
      id:"reconquista-"+year+"-"+i,title,year,duration:6,camera,center:[...center] as [number,number],zoom,pitch:camera==="fly-to"?18:0,
      layers:[{id:"territory-"+i,kind:"polity",label:"Historical territorial control",fromYear:year,toYear:year},
        {id:"event-"+i,kind:"marker",label:title,point:center,color:"#d6b36a"},
        {id:"year-"+i,kind:"label",label:String(year),point:center,color:"#f2e7c7"}],
      narration:title+" — "+year
    }));
    clips[1].layers.push({id:"invasion-route",kind:"route",label:"Tariq ibn Ziyad",coordinates:[places.tangier,places.gibraltar],color:"#d6b36a",width:4});
    clips[2].layers.push({id:"expansion-route",kind:"route",label:"Umayyad expansion",coordinates:[places.gibraltar,places.toledo],color:"#c98f5b",width:3});
    clips[10].layers.push({id:"battle-route",kind:"route",label:"Christian campaign",coordinates:[places.toledo,places["las navas de tolosa"]],color:"#9fb8c3",width:4});
    clips[14].layers.push({id:"final-route",kind:"route",label:"Final campaign",coordinates:[places.toledo,places.granada],color:"#d6b36a",width:4});
    const voice:MapForgeVoice={provider:"neural",voice:"af_heart",language:"en-US",pace:0.96,tone:"documentary",model:"Kokoro-82M"};
    clips=addTransitionRoutes(clips).map(c=>({...c,narrationSeconds:narrationSeconds(c.narration||"",voice.pace)}));
    return {title:"The Reconquista, 711–1492",prompt,mapSource:"historical",aspectRatio:"16:9",fps:30,resolution:"1080p",theme:"dark",clips,voice,checks:runContinuityChecks(clips),credits:["OpenHistoricalMap contributors","Cliopatria / Seshat Global History Databank","MapLibre GL JS"]};
  }
  const ys=years(prompt);
  const center=findPlace(prompt);
  const chosen=ys.length?ys:[new Date().getFullYear()];
  const clips:MapForgeClip[]=chosen.slice(0,24).sort((a,b)=>a-b).map((year,i)=>({
    id:"generated-"+year+"-"+i,title:"Historical scene — "+year,year,duration:6,camera:(i%3===0?"top-down":i%3===1?"fly-to":"sweep") as CameraMode,
    center,zoom:5.2,pitch:12,layers:[
      {id:"history-"+i,kind:"polity",label:"Historical polities",fromYear:year,toYear:year},
      {id:"focus-"+i,kind:"marker",label:prompt.trim().slice(0,80),point:center,color:"#d6b36a"}
    ],narration:prompt.trim()
  }));
  const voice:MapForgeVoice={provider:"neural",voice:"af_heart",language:"en-US",pace:0.96,tone:"documentary",model:"Kokoro-82M"};
  clips=addTransitionRoutes(clips).map(c=>({...c,narrationSeconds:narrationSeconds(c.narration||"",voice.pace)}));
  return {title:prompt.trim().slice(0,80)||"MapForge project",prompt,mapSource:"historical",aspectRatio:"16:9",fps:30,resolution:"1080p",theme:"dark",clips,voice,checks:runContinuityChecks(clips),credits:["OpenHistoricalMap contributors","Cliopatria / Seshat Global History Databank","OpenFreeMap / OpenStreetMap","MapLibre GL JS"]};
}