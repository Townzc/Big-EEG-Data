#!/usr/bin/env python3
"""Download public source files atomically; retain checksums and truthful status."""
import argparse
import concurrent.futures
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(4 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def save_json(path, value):
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
    temp.replace(path)


def fetch(url, path, expected_sha=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and expected_sha and digest(path) == expected_sha:
        return {'path': str(path), 'bytes': path.stat().st_size, 'sha256': expected_sha, 'url': url}
    partial = path.with_suffix(path.suffix + '.part')
    for attempt in range(5):
        try:
            offset = partial.stat().st_size if partial.exists() else 0
            request = urllib.request.Request(url, headers={'Range': 'bytes={}-'.format(offset)} if offset else {})
            with urllib.request.urlopen(request, timeout=120) as response:
                append = offset > 0 and response.status == 206
                size = response.headers.get('Content-Length')
                expected_bytes = int(size) + (offset if append else 0) if size else None
                with partial.open('ab' if append else 'wb') as stream:
                    for block in iter(lambda: response.read(1024 * 1024), b''):
                        stream.write(block)
            if expected_bytes is not None and partial.stat().st_size != expected_bytes:
                raise ValueError('Content-Length mismatch: ' + url)
            actual_sha = digest(partial)
            if expected_sha and actual_sha != expected_sha:
                # A corrupted partial must not become a completed source file.
                partial.rename(partial.with_name(partial.name + '.invalid-' + str(time.time_ns())))
                raise ValueError('SHA256 mismatch: ' + url)
            partial.replace(path)
            return {'path': str(path), 'bytes': path.stat().st_size, 'sha256': actual_sha, 'url': url}
        except urllib.error.HTTPError as error:
            if error.code in (401, 403, 404):
                raise
            if error.code == 416 and partial.exists():
                if expected_sha and digest(partial) == expected_sha:
                    partial.replace(path)
                    return {'path': str(path), 'bytes': path.stat().st_size, 'sha256': expected_sha, 'url': url}
                partial.rename(partial.with_name(partial.name + '.invalid-' + str(time.time_ns())))
            if attempt == 4:
                raise
        except Exception:
            if attempt == 4:
                raise
        time.sleep(min(2 ** attempt, 16))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('dataset', choices=['vitaldb', 'adhd'])
    parser.add_argument('--collection-root', type=Path, required=True)
    parser.add_argument('--workers', type=int, default=8)
    args = parser.parse_args()
    if os.uname().nodename.split('.')[0] in ('milan1', 'milan2', 'login1', 'login2'):
        raise SystemExit('Submit through Slurm; bulk downloads must run on a compute node.')
    root = args.collection_root
    if args.dataset == 'vitaldb':
        dataset_id = 'EEG-0609'
        target = root / 'datasets/03_Consciousness_and_State/Anesthesia/VitalDB'
        base = 'https://physionet-open.s3.amazonaws.com/vitaldb/1.0.0/'
    else:
        dataset_id = 'EEG-0053'
        target = root / 'datasets/02_Biometrics_and_Disease/Mental_and_Developmental_Disorders/EEG_Data_for_ADHD'
        base = 'https://ieee-dataport.s3.amazonaws.com/open/28547/'
    audit_dir = root / 'manifests/current' / dataset_id
    audit_dir.mkdir(parents=True, exist_ok=True)
    target.mkdir(parents=True, exist_ok=True)
    lock = (audit_dir / 'download.lock').open('w')
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    status = {'dataset_id': dataset_id, 'state': 'RUNNING', 'started_at': now(),
              'destination': str(target), 'source': base, 'job_id': os.environ.get('SLURM_JOB_ID'),
              'downloaded_files': 0, 'downloaded_bytes': 0, 'failed_files': 0}
    status_file = audit_dir / 'download-status.json'
    save_json(status_file, status)
    inventory = []
    failures = []
    try:
        if args.dataset == 'vitaldb':
            manifest = fetch(base + 'SHA256SUMS.txt', target / 'SHA256SUMS.txt')
            inventory.append(manifest)
            entries = []
            for line in (target / 'SHA256SUMS.txt').read_text().splitlines():
                checksum, name = line.split(maxsplit=1)
                name = name.lstrip('*')
                rel = Path(name)
                if rel.is_absolute() or '..' in rel.parts:
                    raise ValueError('Unsafe publisher manifest path')
                entries.append((name, checksum))
            status['expected_files'] = len(entries) + 1
            status['expected_vital_files'] = sum(name.endswith('.vital') for name, _ in entries)
            if status['expected_vital_files'] != 6388:
                raise ValueError('Unexpected VitalDB 1.0.0 source manifest scope')
        else:
            entries = [(name, None) for name in ['ADHD_part1.zip', 'ADHD_part2.zip', 'Control_part1.zip',
                       'Control_part2.zip', 'Standard-10-20-Cap19new.zip', 'Channel_Labels.zip']]
            status['expected_files'] = len(entries)
        save_json(status_file, status)
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = {pool.submit(fetch, base + urllib.parse.quote(name, safe='/'), target / name, sha): name
                       for name, sha in entries}
            for future in concurrent.futures.as_completed(futures):
                name = futures[future]
                try:
                    inventory.append(future.result())
                except Exception as error:
                    failures.append({'path': name, 'error': str(error), 'at': now()})
                    print('FAILED', name, str(error), flush=True)
                status.update(updated_at=now(), downloaded_files=len(inventory),
                              downloaded_bytes=sum(item['bytes'] for item in inventory), failed_files=len(failures))
                save_json(status_file, status)
                if len(inventory) % 100 == 0:
                    print(json.dumps(status), flush=True)
        status['state'] = 'INCOMPLETE' if failures else 'COMPLETE'
    except Exception as error:
        failures.append({'error': str(error), 'at': now()})
        status['state'] = 'FAILED'
    status.update(finished_at=now(), failed_files=len(failures))
    save_json(audit_dir / 'download-inventory.json', inventory)
    save_json(audit_dir / 'download-failures.json', failures)
    save_json(status_file, status)
    if status['state'] == 'COMPLETE':
        save_json(target / '.download_complete.json', status)
    print(json.dumps(status), flush=True)
    raise SystemExit(0 if status['state'] == 'COMPLETE' else 1)


if __name__ == '__main__':
    main()
