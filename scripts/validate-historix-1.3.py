#!/usr/bin/env python3
import json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
seed=(ROOT/"lib/historical-records.ts").read_text(encoding="utf-8")
payload=json.loads((ROOT/"data/history-library/enrichment/events.json").read_text(encoding="utf-8"))
json.loads((ROOT/"data/history-library/enrichment/events.schema.json").read_text(encoding="utf-8"))
manifest=json.loads((ROOT/"data/history-library/HISTORIX-1.3-manifest.json").read_text(encoding="utf-8"))
seed_ids=re.findall(r"^E\('([^']+)'", seed, flags=re.MULTILINE)
assert manifest["version"]=="1.3.0"
assert payload["schema_version"]=="1.3.0"
assert payload["record_count"]==len(seed_ids)==100
ids=[r["id"] for r in payload["records"]]
assert len(ids)==len(set(ids))
assert set(ids)==set(seed_ids), "1.3 event IDs do not match the existing seed set"
required=["id","identity","chronology","geography","participants","context","narrative","consequences","quantitative","evidence","uncertainty","graph","editorial"]
for r in payload["records"]:
    assert not [k for k in required if k not in r], r["id"]
    assert r["evidence"]["claims"], r["id"]
    assert r["editorial"]["status"] in {"expanded-structured","research-enriched","reviewed"}
print(f"HISTORIX 1.3 validation passed: {len(ids)} event enrichments match the existing seed set.")
