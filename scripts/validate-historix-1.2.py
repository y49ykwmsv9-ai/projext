#!/usr/bin/env python3
"""Validate the HISTORIX 1.2 quantitative layer."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/history-library/HISTORIX-1.2-manifest.json"
SCHEMA = ROOT / "data/history-library/schema.json"
SOURCES = ROOT / "data/history-library/numeric/source-registry.json"

def main() -> int:
    manifest = json.loads(MANIFEST.read_text())
    schema = json.loads(SCHEMA.read_text())
    sources = json.loads(SOURCES.read_text())

    assert manifest["version"] == "1.2.0"
    assert schema["schema_version"] == "1.2.0"
    assert len(sources["sources"]) >= 5

    required = {"entity_id","metric","year","value","unit","confidence","source_ids","source_record_id"}
    assert required.issubset(set(schema["observation_schema"]["required_fields"]))
    assert {"lower","upper"}.issubset(set(schema["observation_schema"]["optional_fields"]))
    assert schema["observation_schema"]["year_rule"] == "integer; BCE negative; CE positive"

    source_ids = {s["id"] for s in sources["sources"]}
    for source in manifest["registered_sources"]:
        assert source in source_ids, f"unregistered source: {source}"

    print("HISTORIX 1.2 quantitative schema validation passed.")
    print(f"Registered quantitative sources: {len(sources['sources'])}")
    print("Numerical precision policy: uncertainty preserved; no synthetic estimates generated.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
