#!/usr/bin/env python3
"""Authenticated, resumable MODMA downloader for SeaWulf.

Credentials are prompted in the terminal, used only for the live HTTPS
session, and are never written to disk or printed.
"""

from __future__ import annotations

import argparse
import getpass
import hashlib
import json
import os
import re
import sys
import tempfile
import time
from pathlib import Path
from urllib.parse import unquote

import requests


BASE = "https://modma.lzu.edu.cn"
LOGIN_URL = f"{BASE}/accounts/login/?next=/data/application/"
DATASETS = {
    13: {
        "label": "EEG_128channels_ERP_lanzhou_2015",
        "md5": "ac7b82ecf62de5c8783eaa0376674e9b",
        "published_size": "4.8 GB",
    },
    14: {
        "label": "EEG_128channels_resting_lanzhou_2015",
        "md5": "7f5ea8c89c550443dc740c5c9e9d3867",
        "published_size": "2.2 GB",
    },
    17: {
        "label": "EEG_3channels_resting_lanzhou_2015",
        "md5": "b4782823a5f4583de12c6334ebcd67c5",
        "published_size": "142 MB",
    },
}
TRANSFER_ATTEMPTS = 12
PROGRESS_INTERVAL = 512 * 1024 * 1024


def csrf_token(html: str) -> str:
    match = re.search(r'name=["\']csrfmiddlewaretoken["\']\s+value=["\']([^"\']+)', html)
    if not match:
        match = re.search(r'value=["\']([^"\']+)["\']\s+name=["\']csrfmiddlewaretoken["\']', html)
    if not match:
        raise RuntimeError("MODMA login page did not expose a CSRF token")
    return match.group(1)


def login(session: requests.Session, username: str, password: str) -> None:
    page = session.get(LOGIN_URL, timeout=60)
    page.raise_for_status()
    response = session.post(
        LOGIN_URL,
        data={
            "csrfmiddlewaretoken": csrf_token(page.text),
            "username": username,
            "password": password,
            "next": "/data/application/",
        },
        headers={"Referer": page.url},
        timeout=60,
        allow_redirects=True,
    )
    response.raise_for_status()
    if "/accounts/login/" in response.url or "Sign out" not in response.text:
        raise RuntimeError("MODMA login failed; verify the account name and password")


def filename_from_headers(response: requests.Response, fallback: str) -> str:
    disposition = response.headers.get("Content-Disposition", "")
    match = re.search(r"filename\*=UTF-8''([^;]+)", disposition, flags=re.I)
    if match:
        return Path(unquote(match.group(1))).name
    match = re.search(r'filename="?([^";]+)', disposition, flags=re.I)
    return Path(match.group(1)).name if match else fallback


def md5sum(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(16 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def download_one(session: requests.Session, dataset_id: int, target: Path, probe_only: bool) -> dict[str, object]:
    meta = DATASETS[dataset_id]
    fallback = f"{meta['label']}.download"
    probe = session.get(f"{BASE}/data/download/?id={dataset_id}", stream=True, timeout=120, allow_redirects=True)
    probe.raise_for_status()
    if "/accounts/login/" in probe.url or "text/html" in probe.headers.get("Content-Type", "").lower():
        probe.close()
        raise RuntimeError(f"MODMA did not grant file access for dataset id={dataset_id}")
    filename = filename_from_headers(probe, fallback)
    content_type = probe.headers.get("Content-Type", "")
    content_length = probe.headers.get("Content-Length")
    probe.close()
    if probe_only:
        return {
            "id": dataset_id,
            "label": meta["label"],
            "filename": filename,
            "content_type": content_type,
            "content_length": int(content_length) if content_length and content_length.isdigit() else None,
            "status": "AUTHORIZED",
        }

    final_path = target / filename
    partial_path = final_path.with_name(final_path.name + ".part")
    if final_path.is_file() and md5sum(final_path) == meta["md5"]:
        return {"id": dataset_id, "filename": filename, "bytes": final_path.stat().st_size, "md5": meta["md5"], "status": "ALREADY_COMPLETE"}

    transfer_attempt = 0
    while True:
        offset = partial_path.stat().st_size if partial_path.exists() else 0
        headers = {"Range": f"bytes={offset}-"} if offset else {}
        transfer_attempt += 1
        try:
            with session.get(
                f"{BASE}/data/download/?id={dataset_id}",
                headers=headers,
                stream=True,
                timeout=120,
                allow_redirects=True,
            ) as response:
                if response.status_code == 416 and offset:
                    # The local partial may already be complete; MD5 below is
                    # the authoritative check.
                    print(f"id={dataset_id} server reports range complete; verifying MD5", flush=True)
                    break
                response.raise_for_status()
                if "/accounts/login/" in response.url or "text/html" in response.headers.get("Content-Type", "").lower():
                    raise RuntimeError(f"MODMA session expired while downloading dataset id={dataset_id}")

                skip_remaining = 0
                if offset and response.status_code == 206:
                    content_range = response.headers.get("Content-Range", "")
                    match = re.match(r"bytes\s+(\d+)-(\d+)/(\d+|\*)", content_range, flags=re.I)
                    if not match or int(match.group(1)) != offset:
                        raise RuntimeError(
                            f"MODMA returned an invalid Content-Range for id={dataset_id}: {content_range!r}"
                        )
                    mode = "ab"
                elif offset:
                    # Preserve the large partial even if the origin ignores
                    # Range. Discard the already saved prefix from the new
                    # response, then append only unseen bytes.
                    mode = "ab"
                    skip_remaining = offset
                    print(
                        f"id={dataset_id} server ignored Range; preserving the partial and skipping {offset:,} response bytes",
                        flush=True,
                    )
                else:
                    mode = "wb"

                print(
                    f"id={dataset_id} {meta['label']} -> {final_path.name} "
                    f"(resume={offset:,} bytes, attempt={transfer_attempt}/{TRANSFER_ATTEMPTS})",
                    flush=True,
                )
                written_size = offset
                next_report = ((written_size // PROGRESS_INTERVAL) + 1) * PROGRESS_INTERVAL
                with partial_path.open(mode) as handle:
                    for chunk in response.iter_content(chunk_size=16 * 1024 * 1024):
                        if not chunk:
                            continue
                        if skip_remaining:
                            if len(chunk) <= skip_remaining:
                                skip_remaining -= len(chunk)
                                continue
                            chunk = chunk[skip_remaining:]
                            skip_remaining = 0
                        handle.write(chunk)
                        written_size += len(chunk)
                        if written_size >= next_report:
                            print(f"id={dataset_id} downloaded={written_size:,} bytes", flush=True)
                            next_report = ((written_size // PROGRESS_INTERVAL) + 1) * PROGRESS_INTERVAL
                if skip_remaining:
                    raise requests.exceptions.ChunkedEncodingError(
                        f"response ended while skipping the saved {offset:,}-byte prefix"
                    )
                break
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.ChunkedEncodingError) as exc:
            if transfer_attempt >= TRANSFER_ATTEMPTS:
                raise RuntimeError(
                    f"MODMA transfer failed after {TRANSFER_ATTEMPTS} attempts for id={dataset_id}; partial retained"
                ) from exc
            saved_size = partial_path.stat().st_size if partial_path.exists() else 0
            wait_seconds = min(2 ** max(transfer_attempt, 1), 30)
            print(
                f"id={dataset_id} connection interrupted ({type(exc).__name__}); "
                f"saved={saved_size:,} bytes, retrying in {wait_seconds}s",
                flush=True,
            )
            time.sleep(wait_seconds)

    observed_md5 = md5sum(partial_path)
    if observed_md5 != meta["md5"]:
        raise RuntimeError(f"MD5 mismatch for id={dataset_id}: expected {meta['md5']}, got {observed_md5}; partial retained")
    os.replace(partial_path, final_path)
    return {"id": dataset_id, "filename": filename, "bytes": final_path.stat().st_size, "md5": observed_md5, "status": "COMPLETE"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--target",
        type=Path,
        default=Path("/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/datasets/02_Biometrics_and_Disease/Mental_and_Developmental_Disorders/MODMA/raw"),
    )
    parser.add_argument("--ids", nargs="+", type=int, choices=sorted(DATASETS), default=sorted(DATASETS))
    parser.add_argument("--probe-only", action="store_true", help="Verify authorization and response metadata without downloading bodies")
    args = parser.parse_args()

    args.target.mkdir(parents=True, exist_ok=True)
    username = input("MODMA account/email: ").strip()
    if sys.stdin.isatty():
        password = getpass.getpass("MODMA password (not saved): ")
    else:
        # start_modma_remote.ps1 supplies a hidden local prompt over SSH stdin.
        # Reading the second line directly avoids getpass's misleading no-TTY
        # warning; the value is neither echoed nor persisted.
        password = sys.stdin.readline().rstrip("\r\n")
        print("MODMA password received securely from launcher (not saved)", flush=True)
    if not username or not password:
        raise SystemExit("Both account and password are required")

    session = requests.Session()
    session.headers.update({"User-Agent": "BIG-EEG-DATA/1.0 (authorized research download)"})
    login(session, username, password)
    print("MODMA authentication succeeded", flush=True)
    results = [download_one(session, dataset_id, args.target, args.probe_only) for dataset_id in args.ids]

    if not args.probe_only:
        payload = {"source": BASE, "target": str(args.target), "datasets": results}
        fd, temp_name = tempfile.mkstemp(prefix=".modma_manifest_", suffix=".json", dir=args.target)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
            os.replace(temp_name, args.target / "download_manifest.json")
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
    print(json.dumps(results, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted; partial files were retained for resume", file=sys.stderr)
        raise SystemExit(130)
