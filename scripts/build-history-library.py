#!/usr/bin/env python3
"""Build the modular Chronicle historical library.

The base completeness target is "Cliopatria Complete": every unique polity
name represented by the selected Cliopatria release must produce one stable,
individually addressable polity resource. Raw upstream geometry is not copied
into the browser bundle; temporal/spatial rows retain their source metadata.

Usage:
  python scripts/build-history-library.py
  python scripts/build-history-library.py --cliopatria path/to/cliopatria.geojson
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "data" / "history-library"
POLITY_DIR = LIB / "polities"
MANIFEST_DIR = LIB / "manifests"


def slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "unknown"


def source_name_key(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def load_seed_polities() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for source in [
        ROOT / "data" / "historical-polities-since-1000-bce.csv",
        ROOT / "data" / "historical-polities-expansion-v2.csv",
    ]:
        if not source.exists():
            continue
        with source.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                try:
                    start = int(row.get("start_year", row.get("start", 0)))
                    end = int(row.get("end_year", row.get("end", 9999)))
                except (TypeError, ValueError):
                    continue
                pid = slug(row.get("id") or row.get("name") or "unknown")
                rows.append(
                    {
                        "id": pid,
                        "canonical_name": row.get("name") or pid,
                        "type": "polity",
                        "start_year": start,
                        "end_year": end,
                        "era": row.get("era"),
                        "region": row.get("region"),
                        "aliases": [
                            x.strip()
                            for x in (row.get("aliases") or "").split(";")
                            if x.strip()
                        ],
                        "source_ids": ["chronicle-seed-polities"],
                    }
                )

    merged: dict[str, dict[str, Any]] = {}
    for row in rows:
        old = merged.get(row["id"])
        if old is None or len(json.dumps(row)) > len(json.dumps(old)):
            merged[row["id"]] = row
    return sorted(
        merged.values(), key=lambda x: (x["start_year"], x["canonical_name"])
    )


def cliopatria_identity(name: str) -> str:
    """Stable Chronicle ID for a Cliopatria polity entity."""
    return f"cliopatria-{slug(name)}"


def ingest_cliopatria(path: Path) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    """Ingest the release and return resources plus a completeness manifest.

    Cliopatria is row-oriented: one polity can have many temporal/spatial rows.
    Completeness is therefore measured against unique POLITY names, not raw
    feature count. The raw row count is retained for auditability.
    """
    raw = path.read_bytes()
    data = json.loads(raw.decode("utf-8"))

    grouped: dict[str, dict[str, Any]] = {}
    source_names: dict[str, str] = {}
    source_rows = 0
    relation_rows = 0
    invalid_rows: list[dict[str, Any]] = []

    for index, feature in enumerate(data.get("features", [])):
        props = feature.get("properties") or {}
        kind = str(props.get("Type", "")).upper()

        if kind == "RELATION":
            relation_rows += 1
            continue
        if kind != "POLITY":
            continue

        name = props.get("Name") or props.get("name")
        if not name:
            invalid_rows.append({"feature_index": index, "reason": "missing Name"})
            continue

        source_rows += 1
        name = str(name).strip()
        name_key = source_name_key(name)
        source_names.setdefault(name_key, name)
        pid = cliopatria_identity(source_names[name_key])

        if pid not in grouped:
            grouped[pid] = {
                "id": pid,
                "canonical_name": source_names[name_key],
                "type": "polity",
                "source_ids": ["cliopatria"],
                "temporal_records": [],
            }

        grouped[pid]["temporal_records"].append(
            {
                "from_year": props.get("FromYear"),
                "to_year": props.get("ToYear"),
                "area_km2": props.get("Area"),
                "wikidata_id": props.get("WikidataID"),
                "seshat_id": props.get("SeshatID"),
                "wikipedia": props.get("Wikipedia"),
                "source_feature_index": index,
                "geometry_available": bool(feature.get("geometry")),
            }
        )

    source_id_set = sorted(source_names.values(), key=str.casefold)
    imported_names = sorted(
        (item["canonical_name"] for item in grouped.values()), key=str.casefold
    )
    source_keys = {source_name_key(x) for x in source_id_set}
    imported_keys = {source_name_key(x) for x in imported_names}
    missing = sorted(
        [source_names[k] for k in source_keys - imported_keys], key=str.casefold
    )
    unexpected = sorted(
        [next(x for x in imported_names if source_name_key(x) == k)
         for k in imported_keys - source_keys],
        key=str.casefold,
    )

    checksum = hashlib.sha256(raw).hexdigest()
    manifest = {
        "target": "cliopatria-complete",
        "source": {
            "source_id": "cliopatria",
            "source_file": path.name,
            "sha256": checksum,
            "retrieved_at": str(date.today()),
        },
        "counts": {
            "raw_features": len(data.get("features", [])),
            "polity_rows": source_rows,
            "relation_rows": relation_rows,
            "unique_source_polities": len(source_id_set),
            "imported_polities": len(imported_names),
            "temporal_spatial_records": sum(
                len(item["temporal_records"]) for item in grouped.values()
            ),
            "invalid_polity_rows": len(invalid_rows),
        },
        "coverage": {
            "missing": missing,
            "unexpected": unexpected,
            "coverage_ratio": (
                len(imported_names) / len(source_id_set)
                if source_id_set
                else 0.0
            ),
            "complete": (
                not missing
                and not unexpected
                and not invalid_rows
                and len(imported_names) == len(source_id_set)
            ),
        },
        "invalid_rows": invalid_rows,
        "stable_id_rule": "cliopatria-<normalized source Name>",
        "notes": [
            "Completeness is evaluated against unique POLITY Name values.",
            "Cliopatria rows are temporal/spatial observations of entities, not separate polities.",
            "Geometry is not copied into narrative resources; source_feature_index records the originating row.",
        ],
    }
    return grouped, manifest


def build_catalog(resources: dict[str, dict[str, Any]], manifest: dict[str, Any] | None) -> dict[str, Any]:
    catalog: dict[str, Any] = {
        "schema_version": "1.0.0",
        "generated_at": str(date.today()),
        "status": "cliopatria-complete" if manifest and manifest["coverage"]["complete"] else "seeded-and-expandable",
        "resource_roots": {
            "polities": "data/history-library/polities/",
            "events": "data/history-library/events/",
            "people": "data/history-library/people/",
            "places": "data/history-library/places/",
            "observations": "data/history-library/observations/",
            "relations": "data/history-library/relations/",
        },
        "polity_count": len(resources),
        "lookup": {pid: f"polities/{pid}.json" for pid in sorted(resources)},
        "source_ids": ["chronicle-seed-polities"] + (["cliopatria"] if manifest else []),
    }
    if manifest:
        catalog["cliopatria"] = {
            "target": "100% of unique POLITY entities in selected release",
            "source_unique_polities": manifest["counts"]["unique_source_polities"],
            "imported_polities": manifest["counts"]["imported_polities"],
            "coverage_ratio": manifest["coverage"]["coverage_ratio"],
            "complete": manifest["coverage"]["complete"],
            "manifest": "data/history-library/manifests/cliopatria-manifest.json",
        }
    return catalog


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliopatria", type=Path)
    args = ap.parse_args()

    POLITY_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)

    seed = load_seed_polities()
    resources = {x["id"]: x for x in seed}
    manifest = None

    if args.cliopatria:
        cliopatria_resources, manifest = ingest_cliopatria(args.cliopatria)
        for pid, item in cliopatria_resources.items():
            if pid in resources:
                resources[pid].setdefault("temporal_records", []).extend(
                    item["temporal_records"]
                )
                resources[pid]["source_ids"] = sorted(
                    set(resources[pid].get("source_ids", [])) | {"cliopatria"}
                )
            else:
                resources[pid] = item

    for pid, item in resources.items():
        item["provenance"] = [
            {
                "source_id": sid,
                "retrieved_at": str(date.today()),
                "confidence": "unknown",
            }
            for sid in sorted(set(item.get("source_ids", [])))
        ]
        write_json(POLITY_DIR / f"{pid}.json", item)

    if manifest:
        write_json(MANIFEST_DIR / "cliopatria-manifest.json", manifest)

    write_json(LIB / "catalog.json", build_catalog(resources, manifest))
    print(f"Built {len(resources)} polity resources.")
    if manifest:
        print(
            "Cliopatria:",
            manifest["counts"]["imported_polities"],
            "/",
            manifest["counts"]["unique_source_polities"],
            "unique polities imported;",
            "complete=",
            manifest["coverage"]["complete"],
        )


if __name__ == "__main__":
    main()
