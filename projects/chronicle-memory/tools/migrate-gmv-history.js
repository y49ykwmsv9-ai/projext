const fs=require("fs"), path=require("path");
const ROOT=path.resolve(__dirname,"../../..");
const CAMPAIGN=path.join(ROOT,"roleplays","GMV-62BCE-001");
const ROUNDS=path.join(CAMPAIGN,"rounds");
const NEWS=path.join(CAMPAIGN,"news");

function parsePeriod(p){
  if(p&&typeof p==="object") return p;
  if(typeof p!=="string") return {start:null,end:null,display:p??null};
  const m=p.match(/^(.+?)\s*[–-]\s*(.+)$/);
  return m?{start:m[1].trim(),end:m[2].trim(),display:p}:{start:p,end:p,display:p};
}
function unitFor(metric){
  if(["population","births","deaths","migration","soldiers","available_troops","deployed_troops","garrison_troops","reserve_manpower","permanent_losses","temporary_unavailable","recruitment_gains","reinforcements_received"].includes(metric)) return "people";
  if(metric==="treasury"||metric==="currency") return "currency_units";
  if(metric==="food_stock") return "resource_units";
  if(metric==="land_area_sq_miles") return "square_miles";
  return "points";
}
function normalizeEvent(e,i,round){
  const eventId=e.event_id||e.id||`GMV-62BCE-001-R${String(round).padStart(3,"0")}-E${String(i+1).padStart(3,"0")}`;
  const ledger=e.ledger||e.state_changes||{};
  const stateChanges=[];
  if(Array.isArray(ledger)) stateChanges.push(...ledger);
  else if(ledger&&typeof ledger==="object"){
    for(const [metric,delta] of Object.entries(ledger)){
      if(typeof delta==="number") stateChanges.push({
        actor_id:"gaius_maximus_valerius",
        metric,before:null,delta,after:null,unit:unitFor(metric),
        reason:"Migrated from legacy event ledger; prior absolute value was not stored in the source record.",
        source_event_id:eventId,provenance:"legacy-migration"
      });
    }
  }
  return {
    event_id:eventId,
    date:e.date||null,
    type:String(e.type||"event").toLowerCase(),
    headline:e.headline||e.title||"Untitled event",
    article:e.article??e.description??null,
    actors:Array.isArray(e.actors)?e.actors:[],
    location:e.location??null,
    visibility:e.visibility??null,
    confidence:e.confidence??null,
    state_changes:stateChanges,
    migration:{source_event_id:e.event_id||null,source_type:e.type||null}
  };
}
function normalizeRound(file){
  const raw=JSON.parse(fs.readFileSync(file,"utf8"));
  if(raw.schema_version==="gmv-round-v2") return false;
  const round=raw.round;
  const action=raw.action||{
    action_id:`GMV-62BCE-001-R${String(round).padStart(3,"0")}-A001`,
    actor:"Gaius Maximus Valerius",
    action_text:raw.submitted_action||raw.player_action||"",
    components:[]
  };
  const events=Array.isArray(raw.events)?raw.events.map((e,i)=>normalizeEvent(e,i,round)):[];
  const running=raw.running_total||raw.state_changes||{};
  const roundLedger={};
  if(running&&typeof running==="object"&&!Array.isArray(running)){
    for(const [metric,delta] of Object.entries(running)){
      if(typeof delta==="number") roundLedger[metric]={before:null,delta,after:null,unit:unitFor(metric),provenance:"legacy-migration"};
    }
  }
  const migrated={
    schema_version:"gmv-round-v2",
    campaign_id:raw.scenario_id||"GMV-62BCE-001",
    round,
    period:parsePeriod(raw.period),
    action:{
      action_id:action.action_id||`GMV-62BCE-001-R${String(round).padStart(3,"0")}-A001`,
      actor:action.actor||"Gaius Maximus Valerius",
      action_text:action.action_text||raw.submitted_action||raw.player_action||"",
      components:action.components||[]
    },
    historical_context:raw.historical_anchor||raw.historical_context||null,
    events,
    round_ledger:roundLedger,
    financials:raw.financials||raw.commercial_accounting||null,
    special_event:raw.special_event||null,
    land_area:raw.land_area||raw.land_area_metric||null,
    state_transition:raw.state_transition||null,
    migration:{
      status:"legacy-normalized",
      source_schema:raw.metric_schema||"legacy-unspecified",
      source_file:path.relative(ROOT,file),
      source_had_before_after:events.some(e=>e.state_changes.some(s=>s.before!==null&&s.after!==null)),
      note:"Original record is preserved verbatim under legacy_record. Null before/after values mean the source did not retain the absolute state needed for reconstruction; no values were invented."
    },
    legacy_record:raw
  };
  fs.writeFileSync(file,JSON.stringify(migrated,null,2)+"\n");
  return true;
}
function normalizeNews(file){
  const raw=JSON.parse(fs.readFileSync(file,"utf8"));
  if(raw.schema_version==="gmv-news-v2") return false;
  const round=raw.round||Number(path.basename(file).match(/round-(\d+)/)?.[1]);
  const source=Array.isArray(raw.events)?raw.events:Array.isArray(raw.articles)?raw.articles:Array.isArray(raw.news)?raw.news:[];
  const events=source.map((e,i)=>({
    event_id:e.event_id||e.source_event_id||`GMV-62BCE-001-R${String(round).padStart(3,"0")}-E${String(i+1).padStart(3,"0")}`,
    date:e.date||null,
    type:String(e.type||"news").toLowerCase(),
    headline:e.headline||e.title||"Untitled report",
    article:e.article??e.description??null,
    source_event_id:e.source_event_id||e.event_id||null,
    visibility:e.visibility??null,
    confidence:e.confidence??null
  }));
  const migrated={
    schema_version:"gmv-news-v2",
    campaign_id:raw.scenario_id||raw.campaign_id||"GMV-62BCE-001",
    round,
    events,
    migration:{status:"legacy-normalized",source_file:path.relative(ROOT,file)},
    legacy_record:raw
  };
  fs.writeFileSync(file,JSON.stringify(migrated,null,2)+"\n");
  return true;
}
let changed=0;
for(const f of fs.readdirSync(ROUNDS).filter(x=>/^round-\d+\.json$/.test(x)).sort()) if(normalizeRound(path.join(ROUNDS,f))) changed++;
if(fs.existsSync(NEWS)) for(const f of fs.readdirSync(NEWS).filter(x=>/^round-\d+\.json$/.test(x)).sort()) if(normalizeNews(path.join(NEWS,f))) changed++;
console.log(`GMV history migration complete: ${changed} files normalized.`);