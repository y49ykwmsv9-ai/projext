#!/usr/bin/env python3
"""Run representative HISTORIX Place x Time coverage checks.

This is intentionally a coverage/gap detector, not a claim that a successful
place-name match proves historical identity. Gazetteer records with no
chronology are treated as spatially resolvable but historically unqualified.
"""
from __future__ import annotations
import json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LIB=ROOT/"data/history-library"
PLACES=LIB/"places/historix-places.json"
INDEX=LIB/"places/gazetteer-index.json"
NAME_INDEX=LIB/"places/gazetteer-name-index.json"
OUT=LIB/"graph/place-time-coverage.json"

CASES=[
 ("Alexandria",642),("Prague",1618),("Stalingrad",1942),("Mesopotamia",-1800),
 ("Rome",117),("Jerusalem",-700),("Babylon",-1700),("Constantinople",1204),
 ("Cordoba",1000),("Baghdad",800),("Beijing",1500),("Carthage",-300),
 ("Cusco",1500),("Delhi",1300),("Kyiv",1000),("London",1066),
 ("Paris",1300),("Vienna",1529),("Moscow",1600),("Tenochtitlan",1500)
]

def norm(s):
    return re.sub(r"[^a-z0-9]+"," ",s.lower()).strip()

def active(r,y):
    s=r["chronology"].get("start")
    e=r["chronology"].get("end")
    return (s is None or s<=y) and (e is None or y<=e)

def main():
    canonical=json.loads(PLACES.read_text())["records"]
    by_name={}
    for r in canonical:
        for n in [r["identity"]["canonical_name"],*r["identity"].get("alternate_names",[])]:
            by_name.setdefault(norm(n),[]).append(r)

    results=[]
    for name,y in CASES:
        exact=by_name.get(norm(name),[])
        results.append({
          "query":{"place":name,"year":y},
          "canonical_name_matches":[r["id"] for r in exact],
          "historically_active_matches":[r["id"] for r in exact if active(r,y)],
          "status":"resolved" if any(active(r,y) for r in exact) else ("spatial-only" if exact else "gap")
        })

    idx=json.loads(INDEX.read_text()) if INDEX.exists() else {}
    name_index=json.loads(NAME_INDEX.read_text()).get("names",{}) if NAME_INDEX.exists() else {}
    for result in results:
        if result["status"]=="gap":
            partitions=name_index.get(norm(result["query"]["place"]),[])
            if partitions:
                result["gazetteer_partitions"]=partitions
                result["status"]="gazetteer-resolved"
    report={
      "schema_version":"1.5.0","database":"HISTORIX","kind":"place-time-coverage-report",
      "query_count":len(CASES),
      "resolved":sum(x["status"] in {"resolved","gazetteer-resolved"} for x in results),
      "spatial_only":sum(x["status"]=="spatial-only" for x in results),
      "gaps":sum(x["status"]=="gap" for x in results),
      "gazetteer_record_count":idx.get("record_count",0),
      "queries":results,
      "notes":"A gap means the current canonical layer has no exact canonical name match; this is a diagnostic and not an exhaustive historical-coverage claim."
    }
    OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({k:report[k] for k in ["query_count","resolved","spatial_only","gaps","gazetteer_record_count"]}))
    # Gaps are intentionally reported for subsequent historical-place enrichment.

if __name__=="__main__":
    main()
