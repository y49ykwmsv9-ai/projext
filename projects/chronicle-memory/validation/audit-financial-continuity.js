#!/usr/bin/env node
const fs=require("fs"),path=require("path");
const ROOT=process.cwd(), DIR=path.join(ROOT,"roleplays","GMV-62BCE-001","rounds");
const rounds=fs.readdirSync(DIR).filter(f=>/^round-\d+\.json$/.test(f)).sort();
const report={schema_version:"gmv-financial-continuity-audit-v1",campaign_id:"GMV-62BCE-001",rounds_checked:rounds.length,tax_rate:0.03,investment_start_round:21,rounds:[],issues:[],totals:{net_public_profit:0,private_transfer:0,estate_tax_candidate:0,investment_principal:0,realized_investment_returns:0}};
function n(v){return typeof v==="number"&&Number.isFinite(v)?v:null}
for(const file of rounds){
 const r=JSON.parse(fs.readFileSync(path.join(DIR,file),"utf8")), f=r.financials||null;
 if(!f){report.issues.push({round:r.round,code:"FINANCIAL_RECORD_MISSING"});continue}
 const net=n(f.net_public_commercial_profit??f.net_public_profit);
 const transfer=n(f.private_transfer), principal=n(f.investment_principal??f.investment_principal_purchased);
 const returns=n(f.realized_investment_returns);
 const taxable=n(f.taxable_income_basis);
 const tax=n(f.estate_tax);
 const candidate=net===null?null:Math.round(net*0.03*100)/100;
 const item={round:r.round,net_public_profit:net,private_transfer:transfer,investment_principal:principal,realized_investment_returns:returns,declared_taxable_income_basis:taxable,declared_estate_tax:tax,candidate_estate_tax:candidate};
 if(net!==null){report.totals.net_public_profit+=net;report.totals.estate_tax_candidate+=candidate||0}
 if(transfer!==null) report.totals.private_transfer+=transfer;
 if(principal!==null) report.totals.investment_principal+=principal;
 if(returns!==null) report.totals.realized_investment_returns+=returns;
 if(net!==null && r.round>=21 && tax===null) report.issues.push({round:r.round,code:"ESTATE_TAX_NOT_RECORDED",candidate_estate_tax:candidate});
 if(principal!==null && principal>0 && r.round>=21){
   const rate=n(f.investment_return_rate);
   const terms=f.investment_terms||f.return_terms||null;
   if(rate===null && !terms) report.issues.push({round:r.round,code:"INVESTMENT_RETURN_TERMS_MISSING",principal});
 }
 report.rounds.push(item);
}
console.log(JSON.stringify(report,null,2));
if(report.issues.length){console.error("FINANCIAL CONTINUITY AUDIT: ISSUES FOUND");process.exitCode=1}else console.log("FINANCIAL CONTINUITY AUDIT: PASSED");
