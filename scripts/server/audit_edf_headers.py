#!/usr/bin/env python3
"""Audit EDF durations from fixed headers without loading signal samples."""

import argparse
import json
from pathlib import Path


def parse_edf(path):
    with path.open("rb") as handle:
        header = handle.read(256)
    if len(header) != 256:
        raise ValueError("short EDF header")
    records = int(header[236:244].decode("ascii").strip())
    record_seconds = float(header[244:252].decode("ascii").strip())
    signals = int(header[252:256].decode("ascii").strip())
    if records < 0:
        raise ValueError("EDF uses unknown record count")
    return records * record_seconds, signals


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    output = args.output.resolve()
    if root not in output.parents:
        raise SystemExit("output must stay inside the audited dataset root")

    rows = []
    errors = []
    for path in sorted(root.rglob("*.edf")):
        try:
            seconds, signals = parse_edf(path)
            subject = next((part for part in path.parts if part.startswith("sub-")), None)
            rows.append({
                "path": str(path.relative_to(root)),
                "subject": subject,
                "bytes": path.stat().st_size,
                "signals": signals,
                "durationSeconds": seconds,
            })
        except Exception as exc:
            errors.append({"path": str(path.relative_to(root)), "error": str(exc)})

    payload = {
        "root": str(root),
        "edfFiles": len(rows),
        "uniqueSubjects": len({row["subject"] for row in rows if row["subject"]}),
        "bytes": sum(row["bytes"] for row in rows),
        "durationSeconds": sum(row["durationSeconds"] for row in rows),
        "durationHours": sum(row["durationSeconds"] for row in rows) / 3600,
        "errors": errors,
        "rows": rows,
    }
    output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: payload[key] for key in ("edfFiles", "uniqueSubjects", "bytes", "durationHours", "errors")}, indent=2))


if __name__ == "__main__":
    main()

