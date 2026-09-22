#!/usr/bin/env python3
"""Validate the historical library completeness contract."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "data" / "history-library"
MANIFEST = LIB / "manifests" / "cliopatria-manifest.json"
CATALOG = LIB / "catalog.json"


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--require-cliopatria", action="store_true")
    args = ap.parse_args()

    errors: list[str] = []

    if not CATALOG.exists():
        errors.append("catalog.json is missing")
    if args.require_cliopatria and not MANIFEST.exists():
        errors.append("Cliopatria manifest is missing")

    if errors:
        for error in errors:
            print("ERROR:", error)
        return 1

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    if args.require_cliopatria:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        coverage = manifest["coverage"]
        counts = manifest["counts"]

        if not coverage["complete"]:
            errors.append("Cliopatria completeness flag is false")
        if coverage["missing"]:
            errors.append(
                f"Missing {len(coverage['missing'])} Cliopatria polities"
            )
        if coverage["unexpected"]:
            errors.append(
                f"Found {len(coverage['unexpected'])} unexpected imported polities"
            )
        if counts["invalid_polity_rows"]:
            errors.append(
                f"Found {counts['invalid_polity_rows']} invalid Cliopatria polity rows"
            )
        if counts["unique_source_polities"] != counts["imported_polities"]:
            errors.append(
                "Source and imported Cliopatria polity counts differ"
            )
        if catalog.get("cliopatria", {}).get("source_unique_polities") != counts["unique_source_polities"]:
            errors.append("Catalog source count does not match manifest")
        if catalog.get("cliopatria", {}).get("imported_polities") != counts["imported_polities"]:
            errors.append("Catalog imported count does not match manifest")

        lookup = catalog.get("lookup", {})
        # Verify every imported Cliopatria resource resolves to a file.
        imported_ids = []
        for pid, relpath in lookup.items():
            if pid.startswith("cliopatria-"):
                imported_ids.append(pid)
                if not (ROOT / "data" / "history-library" / relpath).exists():
                    errors.append(f"Catalog entry has no resource file: {pid}")

        if len(imported_ids) < counts["imported_polities"]:
            errors.append("Catalog does not expose every imported Cliopatria resource")

    if errors:
        for error in errors:
            print("ERROR:", error)
        return 1

    print("Historical library validation passed.")
    if args.require_cliopatria:
        print("Cliopatria completeness target: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
