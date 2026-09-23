#!/usr/bin/env python3
"""Materialize the complete Cliopatria polity universe as the HISTORIX 1.4 layer.

Input: data/history-library/polities/*.json produced by build-history-library.py
Output: data/history-library/polities/historix-linked.json
         data/history-library/HISTORIX-1.4-manifest.json

The generated layer intentionally preserves source temporal records instead of
inventing chronology, geography, rulers, or cross-dataset matches.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
POLITY_DIR=ROOT/"data/history-library/polities"
OUT=POLITY_DIR/"historix-linked.json"
MANIFEST=ROOT/"data/history-library/HISTORIX-1.4-manifest.json"

records=[]
for path in sorted(POLITY_DIR.glob("cliopatria-*.json")):
    if path.name=="historix-linked.json":
        continue
    src=json.loads(path.read_text(encoding="utf-8"))
    temporal=src.get("temporal_records",[])
    records.append({
        "id":src["id"],
        "identity":{
            "canonical_name":src.get("canonical_name",src["id"]),
            "alternate_names":[],
            "polity_type":"historical-polity",
        },
        "chronology":{
            "start":min((x.get("from_year") for x in temporal if isinstance(x.get("from_year"),int)),default=None),
            "end":max((x.get("to_year") for x in temporal if isinstance(x.get("to_year"),int)),default=None),
            "date_precision":"cliopatria-source",
        },
        "geography":{
            "regions":[],
            "capital_place_ids":[],
            "territorial_notes":[],
        },
        "status":{
            "historix_reference_count":0,
            "cliopatria_link":"resolved-source-record",
        },
        "predecessors":[],
        "successors":[],
        "rulers":[],
        "associated_event_ids":[],
        "associated_person_ids":[],
        "associated_place_ids":[],
        "source_links":src.get("source_ids",["cliopatria"]),
        "temporal_records":temporal,
        "evidence":{
            "source_ids":["cliopatria-pinned"],
            "confidence":"medium",
        },
        "uncertainty":{
            "unknowns":["HISTORIX cross-links","alternate names","polity type normalization"],
            "disputes":[],
        },
        "editorial":{
            "status":"cliopatria-imported",
            "last_reviewed":None,
            "notes":"Complete Cliopatria baseline record. HISTORIX-specific cross-links are added only when verified.",
        },
    })
records.sort(key=lambda x:x["id"])
if len(records)!=1583:
    raise SystemExit(f"Expected 1583 Cliopatria polity resources, found {len(records)}")

OUT.write_text(json.dumps({
    "schema_version":"1.4.0",
    "database":"HISTORIX",
    "kind":"complete_polity_universe",
    "record_count":len(records),
    "source":{"dataset":"Cliopatria","commit":"ad28a691b7c07c1fca89d0e0636d324667d2a258"},
    "records":records,
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

catalog_path=ROOT/"data/history-library/catalog.json"
if catalog_path.exists():
    catalog=json.loads(catalog_path.read_text(encoding="utf-8"))
else:
    catalog={}
catalog["schema_version"]="1.4.0"
catalog["version"]="1.4.0"
catalog["status"]="complete-cliopatria-baseline"
catalog["polity_layer"]={"version":"1.4.0","record_count":len(records),"storage":"data/history-library/polities/","aggregate":"data/history-library/polities/historix-linked.json","source_commit":"ad28a691b7c07c1fca89d0e0636d324667d2a258"}
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

manifest={
    "schema_version":"1.4.0",
    "database":"HISTORIX",
    "version":"1.4.0",
    "layer":"complete-polity-universe",
    "status":"complete-cliopatria-baseline",
    "purpose":"Materialize all unique Cliopatria polity records as individually addressable, editable HISTORIX 1.4 polity records.",
    "record_count":len(records),
    "source":{"dataset":"Cliopatria","commit":"ad28a691b7c07c1fca89d0e0636d324667d2a258"},
    "storage":"data/history-library/polities/",
    "aggregate":"data/history-library/polities/historix-linked.json",
    "stable_id_rule":"Reuse deterministic cliopatria- IDs generated from source polity names.",
    "editable_units":["polities"],
    "research_status":"cliopatria-imported",
    "next_step":"verified HISTORIX aliases, chronology normalization, geographic linkage, succession, people/events/places linkage and quantitative observations.",
}
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Materialized complete HISTORIX 1.4 polity universe: {len(records)} records")
