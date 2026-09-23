#!/usr/bin/env python3
"""HISTORIX 1.4 enrichment pass 4: build a place-time query index without adding entities."""
import json
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; LIB=ROOT/"data/history-library"; AGG=LIB/"polities/historix-linked.json"; OUT=LIB/"graph/place-time-index.json"
def main():
    p=json.loads(AGG.read_text()); idx={}
    for r in p["records"]:
        key=r["id"]; chrono=r["chronology"]; idx[key]={"polity_id":key,"start":chrono.get("start"),"end":chrono.get("end"),"event_ids":r.get("associated_event_ids",[]),"person_ids":r.get("associated_person_ids",[]),"place_ids":r.get("associated_place_ids",[]),"predecessor_ids":r.get("predecessors",[]),"successor_ids":r.get("successors",[])}
    out={"schema_version":"1.0.0","database":"HISTORIX","built_at":str(date.today()),"record_count":len(idx),"new_records":0,"query_contract":{"inputs":["place_or_polity_id","year"],"returns":["active_polity","major_event_ids","person_ids","place_ids","predecessor_ids","successor_ids"]},"records":idx}
    OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
    p["enrichment_pass_4"]={"name":"place-time-query-index","completed_at":str(date.today()),"scope":"existing records only","new_records":0,"index":"data/history-library/graph/place-time-index.json"}
    AGG.write_text(json.dumps(p,ensure_ascii=False,indent=2)+"\n")
    by={r["id"]:r for r in p["records"]}
    for f in AGG.parent.glob("cliopatria-*.json"):
        if f.stem in by: f.write_text(json.dumps(by[f.stem],ensure_ascii=False,indent=2)+"\n")
    print("pass 4 complete:",len(idx),"indexed polities; new records=0")
if __name__=="__main__": main()
