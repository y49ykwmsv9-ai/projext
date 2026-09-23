#!/usr/bin/env python3
"""HISTORIX unified expansion pipeline.

This is the single entrypoint for the seven mandatory HISTORIX expansions.
Each expansion remains independently testable, but this runner owns ordering,
failure propagation, reporting, and future phase discovery.

Roadmap:
  1. canonical places and geographic hierarchy
  2. canonical events, wars, and battles
  3. canonical people
  4. connect places/events/people through the 1,583 polities
  5. integrate quantitative databases without duplicates
  6. build Place × Time × Entity index
  7. automated historical place/time coverage tests

The runner never fabricates records to satisfy counts. A future expansion is
reported as pending until its paired enrichment and validation programs exist.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "historix-master"
REPORT = OUT / "pipeline_report.json"

EXPANSIONS = {
    1: "Complete canonical places and geographic hierarchy.",
    2: "Complete canonical events, including wars and battles.",
    3: "Complete canonical people, especially rulers, commanders, political figures, scholars, religious figures, and other historically consequential individuals.",
    4: "Connect places, events, and people through the existing 1,583 polities.",
    5: "Integrate quantitative databases without duplicating entities.",
    6: "Build the full Place × Time × Entity index.",
    7: "Run automated coverage tests asking thousands of historical place/time queries and flagging gaps.",
}

BUILD = ROOT / "scripts" / "build-historix-master-intake.py"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def run_program(path: Path) -> dict:
    started = now()
    proc = subprocess.run(
        [sys.executable, str(path)],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    finished = now()
    result = {
        "program": str(path.relative_to(ROOT)),
        "started_at": started,
        "completed_at": finished,
        "return_code": proc.returncode,
        "status": "passed" if proc.returncode == 0 else "failed",
        "stdout": proc.stdout[-12000:],
        "stderr": proc.stderr[-12000:],
    }
    if proc.returncode:
        raise RuntimeError(json.dumps(result, indent=2))
    return result


def phase_files(n: int) -> tuple[Path, Path]:
    return (
        ROOT / "scripts" / f"enrich-historix-expansion{n}.py",
        ROOT / "scripts" / f"validate-historix-expansion{n}.py",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the unified HISTORIX expansion pipeline.")
    parser.add_argument(
        "--through",
        type=int,
        default=7,
        choices=range(1, 8),
        help="Highest roadmap expansion to consider. Default: 7.",
    )
    parser.add_argument(
        "--require-complete",
        action="store_true",
        help="Fail if any requested expansion is not implemented yet.",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Skip rebuilding the canonical Master Store intake.",
    )
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    report = {
        "pipeline": "HISTORIX unified expansion pipeline",
        "started_at": now(),
        "requested_through": args.through,
        "no_fabrication_rule": True,
        "expansions": [],
    }

    try:
        if not args.skip_build:
            report["master_build"] = run_program(BUILD)
        else:
            report["master_build"] = {"status": "skipped"}

        for n in range(1, args.through + 1):
            enrich, validate = phase_files(n)
            phase = {
                "expansion": n,
                "goal": EXPANSIONS[n],
                "enrichment_program": str(enrich.relative_to(ROOT)),
                "validation_program": str(validate.relative_to(ROOT)),
            }

            if not enrich.exists() or not validate.exists():
                phase["status"] = "pending"
                phase["reason"] = "Both enrichment and validation programs are required before this expansion can run."
                report["expansions"].append(phase)
                if args.require_complete:
                    raise RuntimeError(
                        f"Expansion {n} is not implemented: missing paired enrichment/validation program."
                    )
                continue

            phase["enrichment"] = run_program(enrich)
            phase["validation"] = run_program(validate)
            phase["status"] = "complete"
            report["expansions"].append(phase)

        report["completed_at"] = now()
        report["status"] = "passed"
        report["implemented_expansions"] = [
            p["expansion"] for p in report["expansions"] if p["status"] == "complete"
        ]
        report["pending_expansions"] = [
            p["expansion"] for p in report["expansions"] if p["status"] == "pending"
        ]
        REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(json.dumps(report, indent=2))
        return 0

    except Exception as exc:
        report["completed_at"] = now()
        report["status"] = "failed"
        report["error"] = str(exc)
        REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(json.dumps(report, indent=2))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
