import type {MapForgeCheck,MapForgeClip} from "./types";
import {narrationSeconds} from "./continuity";

export type RenderPhase="planning"|"historical-verification"|"continuity"|"narration"|"voice-generation"|"audio-sync"|"visual-render"|"final-qc"|"complete";

export function renderGate(clips:MapForgeClip[]):MapForgeCheck[]{
  const checks:MapForgeCheck[]=[];
  const seen=new Set<string>();
  for(const c of clips){
    const duplicate=seen.has(c.title+"|"+c.year);seen.add(c.title+"|"+c.year);
    checks.push({id:"duplicate-"+c.id,label:"Duplicate scene",passed:!duplicate,severity:"error",detail:duplicate?"Repeated scene title/date.":"Unique scene."});
    checks.push({id:"date-context-"+c.id,label:"Date context",passed:!!c.year&&!!c.narration&&c.narration.includes(String(c.year)),severity:"error",detail:c.narration&&c.narration.includes(String(c.year))?"Narration names the scene date.":"Narration does not explicitly establish the scene date."});
    const seconds=c.narrationSeconds??(c.narration?narrationSeconds(c.narration):0);
    checks.push({id:"duration-"+c.id,label:"Audio duration",passed:seconds>0,severity:"error",detail:seconds?seconds.toFixed(1)+"s narration":"No narration audio duration."});
    checks.push({id:"geography-data-"+c.id,label:"Narrative geography",passed:!!c.region,severity:"warning",detail:c.region?"Scene has a geographic scope.":"Scene lacks a geographic scope."});
  }
  return checks;
}

