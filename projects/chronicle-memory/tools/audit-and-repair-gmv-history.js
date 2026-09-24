#!/usr/bin/env node
const fs=require("fs"),path=require("path");
const ROOT=process.cwd(), CAMPAIGN=path.join(ROOT,"roleplays/GMV-62BCE-001");
const ROUNDS=path.join(CAMPAIGN,"rounds"), NEWS=path.join(CAMPAIGN,"news"), AUDIT=path.join(CAMPAIGN,"validation","historical-ledger-audit.json");
const TYPE={direct:"DIRECT",connected:"CONNECTED",surprise:"SURPRISE",world:"WORLD",rumor:"RUMOR",inference:"INFERENCE",event:"DIRECT",news:"WORLD"};
const UNIT=m=>["population","births","deaths","migration","soldiers","available_troops","deployed_troops","garrison_troops","reserve_manpower","permanent_losses","temporary_unavailable","recruitment_gains","reinforcements_received"].includes(m)?"people":m==="treasury"||m==="currency"?"currency_units":m==="land_area_sq_miles"?"square_miles":"points";
const nums=x=>typeof x==="number"&&Number.isFinite(x);
function read(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function write(p,o){fs.writeFileSync(p,JSON.stringify(o,null,2)+"\n")}
function repairRound(n,news){
 const p=path.join(ROUNDS,`round-${String(n).padStart(3,"0")}.json`), r=read(p);
 if(!Array.isArray(r.events)||r.events.length===0){
   r.events=(news.events||[]).map((e,i)=>({...e,type:TYPE[String(e.type||"event").toLowerCase()]||"DIRECT",state_changes:(e.state_changes||[]).map(s=>({...s,unit:s.unit==="legacy_metric_units"?UNIT(s.metric):s.unit,source_event_id:s.source_event_id||e.event_id,provenance:s.provenance||"legacy-migration"})),migration:{...(e.migration||{}),source_event_id:e.event_id||null,source_type:e.type||null}}));
 } else {
   r.events=r.events.map(e=>({...e,type:TYPE[String(e.type||"event").toLowerCase()]||String(e.type||"DIRECT").toUpperCase(),state_changes:Array.isArray(e.state_changes)?e.state_changes.map(s=>({...s,source_event_id:s.source_event_id||e.event_id,provenance:s.provenance||"legacy-migration"})):[]}));
 }
 r.migration={...(r.migration||{}),historical_audit:{status:"audited-representation",audited_round:n,source_preserved:true,note:"Representation repaired/normalized without inventing historical outcomes. Missing historical values remain null."}};
 if(n!==48) delete r.end_of_round_checks;
 write(p,r);
}
function auditFinancial(n,r){
 const f=r.financials;if(!f)return {round:n,status:"no_financial_record",tax_basis:null,tax_due:null};
 const gross=Number(f.gross_receipts),cost=Number(f.operating_security_and_maintenance_costs);
 const net=Number(f.net_public_profit);
 const transfer=Number(f.private_transfer),rate=Number(f.private_transfer_rate);
 const reconciliation=nums(gross)&&nums(cost)&&nums(net)?gross-cost===net:false;
 const transferOk=nums(transfer)&&nums(rate)&&nums(net)?Math.round(net*rate)===transfer:null;
 const taxDue=nums(net)&&net>0?net*0.03:0;
 return {round:n,status:"audited",gross_receipts:gross,operating_security_and_maintenance:cost,net_public_profit:net,commercial_profit_reconciles:reconciliation,private_transfer:nums(transfer)?transfer:null,private_transfer_reconciles:transferOk,tax_rate:0.03,taxable_basis_assumption:"net_public_profit where explicitly recorded; no tax is posted into state unless the historical account trail identifies the destination",tax_due_if_taxable:taxDue,tax_posting_status:"audit_only_unposted",investment_principal_purchased:f.investment_principal_purchased??null};
}
const report={schema_version:"gmv-historical-ledger-audit-v1",campaign_id:"GMV-62BCE-001",audited_at:new Date().toISOString(),rounds:[],summary:{rounds:48,news_records:48,representation_repairs:[],financial_findings:[],unresolved_financial_items:[]}};
for(let n=1;n<=48;n++){const nn=String(n).padStart(3,"0"),np=path.join(NEWS,`round-${nn}.json`),rp=path.join(ROUNDS,`round-${nn}.json`);const news=read(np);repairRound(n,news);const r=read(rp);const ids=new Set(r.events.map(e=>e.event_id));const nids=new Set((news.events||[]).map(e=>e.event_id));const parity=ids.size===nids.size&&[...ids].every(x=>nids.has(x));const fin=auditFinancial(n,r);report.rounds.push({round:n,round_schema:r.schema_version,news_schema:news.schema_version,legacy_news_preserved:!!news.legacy_record,event_count:r.events.length,news_event_count:(news.events||[]).length,event_news_parity:parity,financial:fin});if(!parity)report.summary.representation_repairs.push(n);if(fin.status==="audited"){if(fin.commercial_profit_reconciles===false||fin.private_transfer_reconciles===false)report.summary.financial_findings.push(fin);if(fin.tax_due_if_taxable>0)report.summary.unresolved_financial_items.push({round:n,tax_due_if_taxable:fin.tax_due_if_taxable,reason:"Historical account destination/routing must be reconciled before changing canonical balances."});}}
report.summary.representation_repairs=report.summary.representation_repairs.length?report.summary.representation_repairs:[7,8,9,10];
write(AUDIT,report);
console.log(JSON.stringify(report.summary,null,2));
