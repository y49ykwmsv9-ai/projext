#!/usr/bin/env python3
"""Validate the HISTORIX 1.1 curated graph layer."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAPH = ROOT / "data/history-library/graph/curated-records.json"
MANIFEST = ROOT / "data/history-library/HISTORIX-1.1-manifest.json"

def main():
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    assert graph["database"] == "HISTORIX"
    assert graph["version"] == "1.1.0"
    assert manifest["version"] == "1.1.0"

    records = {}
    for kind in ("events", "places", "people"):
        for record in graph[kind]:
            rid = f"{kind}:{record['id']}"
            assert rid not in records, f"duplicate record: {rid}"
            records[rid] = record
            assert record["id"] and record["name"]
            assert record["source"]
            assert record["confidence"] in {"high", "medium", "low", "unknown"}
            if "end" in record:
                assert record["start"] <= record["end"], f"invalid dates: {rid}"

    # Relations use singular endpoint types while the graph stores plural collections.
    type_to_collection = {"event": "events", "place": "places", "person": "people"}
    relation_ids = set()
    for relation in graph["relations"]:
        assert relation["id"] not in relation_ids, f"duplicate relation: {relation['id']}"
        relation_ids.add(relation["id"])
        assert relation["from_type"] in type_to_collection, f"unknown relation from_type: {relation['from_type']}"
        assert f"{relation['from_type']}:{relation['from_id']}" in records, (
            f"missing relation source: {relation['from_type']}:{relation['from_id']}"
        )
        assert relation["to_type"] == "polity"
        assert relation["to_id"], f"empty polity target for relation {relation['id']}"

    counts = {
        "events": len(graph["events"]),
        "places": len(graph["places"]),
        "people": len(graph["people"]),
        "relations": len(graph["relations"]),
    }
    assert counts == manifest["record_counts"], f"manifest mismatch: {counts} != {manifest['record_counts']}"

    print("HISTORIX 1.1 graph validation passed.")
    print(f"Events: {counts['events']}")
    print(f"Places: {counts['places']}")
    print(f"People: {counts['people']}")
    print(f"Relations: {counts['relations']}")

if __name__ == "__main__":
    main()
