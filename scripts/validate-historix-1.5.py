#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LIB=ROOT/"data/history-library"
payload=json.loads((LIB/"places/historix-places.json").read_text())
schema=json.loads((LIB/"places/schema.json").read_text())
manifest=json.loads((LIB/"HISTORIX-1.5-manifest.json").read_text())
assert payload["schema_version"]=="1.5.0"
assert schema["schema_version"]=="1.5.0"
assert manifest["version"]=="1.5.0"
rows=payload["records"]
ids=[r["id"] for r in rows]
assert len(ids)==len(set(ids))==payload["record_count"]==manifest["record_count"]
required={"id","identity","chronology","geography","hierarchy","associations","evidence","uncertainty","editorial"}
for r in rows:
    assert required <= r.keys(), f"missing place fields: {r.get('id')}"
    g=r["geography"]
    assert len(g.get("country_ids",[]))>=0
    if g["latitude"] is not None: assert -90<=g["latitude"]<=90
    if g["longitude"] is not None: assert -180<=g["longitude"]<=180
    for parent in r["hierarchy"]["parent_place_ids"]:
        assert parent in ids, f"missing parent {parent} for {r['id']}"
    for child in r["hierarchy"]["child_place_ids"]:
        assert child in ids, f"missing child {child} for {r['id']}"
        assert r["id"] in next(x for x in rows if x["id"]==child)["hierarchy"]["parent_place_ids"]
    assert r["evidence"]["source_ids"], f"no provenance for {r['id']}"
    assert r["editorial"]["status"] in {"curated-preserved","research-enriched","reviewed"}
print(f"HISTORIX 1.5 validation passed: {len(rows)} canonical places")
