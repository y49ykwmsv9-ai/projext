#!/usr/bin/env python3
"""HISTORIX 1.4 enrichment pass 3: connect existing polities to existing events, people and places."""
import json,re
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; LIB=ROOT/"data/history-library"; AGG=LIB/"polities/historix-linked.json"
def norm(x): return re.sub(r"[^a-z0-9]+"," ",x.lower()).strip()
def main():
    p=json.loads(AGG.read_text()); files={"events":LIB/"enrichment/events.json","people":LIB/"people","places":LIB/"places"}
    event=json.loads(files["events"].read_text())["records"]
    people=[]; places=[]
    for kind in ("people","places"):
        for f in files[kind].glob("*.json"):
            item=json.loads(f.read_text())
            if isinstance(item,dict) and item.get("id"):
                people.append(item) if kind=="people" else places.append(item)
    entities={"events":event,"people":people,"places":places}
    for r in p["records"]:
        names=[norm(r["identity"]["canonical_name"])]+[norm(x) for x in r["identity"].get("alternate_names",[])]
        def hit(x):
            hay=norm(x.get("name") or x.get("canonical_name") or x.get("identity",{}).get("canonical_name",""))
            return any(n and (n==hay or n in hay or hay in n) for n in names)
        for kind,arr in entities.items():
            hits=[x["id"] for x in arr if hit(x)]
            key={"events":"associated_event_ids","people":"associated_person_ids","places":"associated_place_ids"}[kind]
            r[key]=sorted(set(r.get(key,[]))|set(hits))
        r["research"]["crosslink_method"]="deterministic name/alias matching against existing HISTORIX records; no new records created"
    p["enrichment_pass_3"]={"name":"existing-record-crosslinks","completed_at":str(date.today()),"scope":"existing records only","new_records":0}
    AGG.write_text(json.dumps(p,ensure_ascii=False,indent=2)+"\n")
    by={r["id"]:r for r in p["records"]}
    for f in AGG.parent.glob("cliopatria-*.json"):
        if f.stem in by: f.write_text(json.dumps(by[f.stem],ensure_ascii=False,indent=2)+"\n")
    print("pass 3 complete:",len(p["records"]),"polities; new records=0")
if __name__=="__main__": main()
