#!/usr/bin/env python3
"""Build the modular Chronicle historical library.

The script intentionally creates small JSON resources instead of a monolithic
client bundle. It ingests the project's existing polity CSV and, when enabled,
the upstream Cliopatria GeoJSON release.

Usage:
  python scripts/build-history-library.py
  python scripts/build-history-library.py --cliopatria path/to/cliopatria.geojson
"""

from __future__ import annotations
import argparse, csv, json, re
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "data" / "history-library"
POLITY_DIR = LIB / "polities"

def slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "unknown"

def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def load_seed_polities():
    rows = []
    for source in [ROOT / "data" / "historical-polities-since-1000-bce.csv",
                   ROOT / "data" / "historical-polities-expansion-v2.csv"]:
        if not source.exists():
            continue
        with source.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                try:
                    start = int(row.get("start_year", row.get("start", 0)))
                    end = int(row.get("end_year", row.get("end", 9999)))
                except ValueError:
                    continue
                pid = slug(row.get("id") or row.get("name") or "unknown")
                rows.append({
                    "id": pid,
                    "canonical_name": row.get("name") or pid,
                    "type": "polity",
                    "start_year": start,
                    "end_year": end,
                    "era": row.get("era"),
                    "region": row.get("region"),
                    "aliases": [x.strip() for x in (row.get("aliases") or "").split(";") if x.strip()],
                    "source_ids": ["chronicle-seed-polities"]
                })
    # Keep the most information-rich occurrence for duplicate IDs.
    merged = {}
    for row in rows:
        old = merged.get(row["id"])
        if old is None or len(json.dumps(row)) > len(json.dumps(old)):
            merged[row["id"]] = row
    return sorted(merged.values(), key=lambda x: (x["start_year"], x["canonical_name"]))

def ingest_cliopatria(path: Path):
    """Convert an already-downloaded Cliopatria GeoJSON into temporal polity resources.

    The upstream repository distributes the GeoJSON in a zip because of GitHub's
    file-size limits. Download/unzip it outside this script or pass the extracted
    GeoJSON path. Geometry is kept as a source reference rather than duplicated
    into every narrative record.
    """
    data = json.loads(path.read_text(encoding="utf-8"))
    grouped = {}
    for feature in data.get("features", []):
        p = feature.get("properties") or {}
        if str(p.get("Type", "")).upper() != "POLITY":
            continue
        name = p.get("Name") or p.get("name")
        if not name:
            continue
        pid = slug(name)
        grouped.setdefault(pid, {"id": pid, "canonical_name": name, "type": "polity",
                                 "temporal_records": [], "source_ids": ["cliopatria"]})
        grouped[pid]["temporal_records"].append({
            "from_year": p.get("FromYear"),
            "to_year": p.get("ToYear"),
            "area_km2": p.get("Area"),
            "wikidata_id": p.get("WikidataID"),
            "seshat_id": p.get("SeshatID"),
            "wikipedia": p.get("Wikipedia"),
        })
    return grouped

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliopatria", type=Path)
    args = ap.parse_args()

    POLITY_DIR.mkdir(parents=True, exist_ok=True)
    seed = load_seed_polities()
    resources = {x["id"]: x for x in seed}

    if args.cliopatria:
        for pid, item in ingest_cliopatria(args.cliopatria).items():
            if pid in resources:
                resources[pid].setdefault("temporal_records", []).extend(item["temporal_records"])
                resources[pid]["source_ids"].append("cliopatria")
            else:
                resources[pid] = item

    for pid, item in resources.items():
        item["provenance"] = [{
            "source_id": sid,
            "retrieved_at": str(date.today()),
            "confidence": "unknown"
        } for sid in sorted(set(item.get("source_ids", [])))]
        write_json(POLITY_DIR / f"{pid}.json", item)

    catalog = {
        "schema_version": "1.0.0",
        "generated_at": str(date.today()),
        "polity_count": len(resources),
        "lookup": {pid: f"polities/{pid}.json" for pid in sorted(resources)},
        "source_ids": ["chronicle-seed-polities", "cliopatria"]
    }
    write_json(LIB / "catalog.json", catalog)
    print(f"Built {len(resources)} polity resources.")

if __name__ == "__main__":
    main()
