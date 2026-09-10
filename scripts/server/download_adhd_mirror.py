#!/usr/bin/env python3
"""Recover the 121 named source MATs from a public mirror, with provenance."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request
import numpy as np
from scipy.io import loadmat
from download_vitaldb_adhd import fetch, now, save_json


def main():
    root = Path('/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection')
    target = root / 'datasets/02_Biometrics_and_Disease/Mental_and_Developmental_Disorders/EEG_Data_for_ADHD'
    audit = root / 'manifests/current/EEG-0053'
    audit.mkdir(parents=True, exist_ok=True)
    target.mkdir(parents=True, exist_ok=True)
    repository = 'Ojesh-Mundale/AI-based-ADHD-detection'
    api = 'https://api.github.com/repos/' + repository
    with urllib.request.urlopen(api + '/commits/main', timeout=45) as response:
        commit = json.load(response)['sha']
    with urllib.request.urlopen(api + '/git/trees/' + commit + '?recursive=1', timeout=45) as response:
        tree = json.load(response)
    save_json(audit / 'mirror-tree.json', tree)
    source_list = (audit / 'user-provided-s3-objects.txt').read_text().splitlines()
    expected = {'/'.join(value.split('/')[-2:]) for value in source_list if value.endswith('.mat')}
    files = [entry for entry in tree['tree'] if entry['type'] == 'blob' and entry['path'].startswith('data/') and entry['path'].endswith('.mat')]
    if tree.get('truncated') or len(expected) != 121 or {entry['path'][5:] for entry in files} != expected:
        raise ValueError('Mirror file names do not exactly match the supplied 121-MAT source manifest')
    status = {'dataset_id': 'EEG-0053', 'state': 'RUNNING', 'started_at': now(),
              'source': 'https://github.com/' + repository, 'commit': commit,
              'official_source': 's3://ieee-dataport/open/28547/', 'official_source_status': 'HTTP_403',
              'official_byte_identity_verified': False,
              'missing_official_metadata': ['Channel_Labels.docx', 'Standard-10-20-Cap19new.ced'],
              'expected_mat_files': 121, 'destination': str(target),
              'source_note': 'Public third-party mirror. Git object identity is verified; byte identity with the inaccessible IEEE S3 originals cannot be confirmed.'}
    save_json(audit / 'mirror-download-status.json', status)

    def download(entry):
        rel = entry['path'][5:]
        path = target / rel
        url = 'https://raw.githubusercontent.com/' + repository + '/' + commit + '/' + entry['path']
        record = fetch(url, path)
        payload = path.read_bytes()
        blob_sha = hashlib.sha1(('blob ' + str(len(payload)) + '\0').encode() + payload).hexdigest()
        if blob_sha != entry['sha'] or len(payload) != entry['size']:
            raise ValueError('Git blob identity mismatch: ' + rel)
        mat = loadmat(path)
        signals = [(key, value) for key, value in mat.items() if not key.startswith('__') and isinstance(value, np.ndarray) and value.ndim == 2 and 19 in value.shape]
        if len(signals) != 1 or signals[0][1].size == 0:
            raise ValueError('Expected one 19-channel EEG matrix: ' + rel)
        key, signal = signals[0]
        if not np.isfinite(signal).all():
            raise ValueError('Non-finite source EEG samples: ' + rel)
        samples = signal.shape[0] if signal.shape[1] == 19 else signal.shape[1]
        record.update(relative_path=rel, git_blob_sha=blob_sha, variable=key,
                      shape=list(signal.shape), samples=samples, channels=19,
                      sampling_hz=128, sampling_source='IEEE source metadata; not encoded in MAT',
                      subject=path.stem, group='ADHD' if rel.startswith('ADHD_') else 'Control',
                      hours=samples / 128 / 3600)
        return record

    records = []
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(download, entry): entry['path'] for entry in files}
        for future in concurrent.futures.as_completed(futures):
            try:
                records.append(future.result())
            except Exception as error:
                failures.append({'file': futures[future], 'error': str(error)})
    status.update(state='COMPLETE' if not failures else 'INCOMPLETE', finished_at=now(),
                  downloaded_files=len(records), failed_files=len(failures),
                  downloaded_bytes=sum(record['bytes'] for record in records),
                  subjects=len({record['subject'] for record in records}),
                  groups={group: sum(record['group'] == group for record in records) for group in ['ADHD', 'Control']},
                  samples=sum(record['samples'] for record in records),
                  hours=sum(record['hours'] for record in records))
    save_json(audit / 'mirror-download-inventory.json', sorted(records, key=lambda record: record['relative_path']))
    save_json(audit / 'mirror-download-failures.json', failures)
    save_json(audit / 'mirror-download-status.json', status)
    save_json(target / 'MIRROR_PROVENANCE.json', status)
    print(json.dumps(status, indent=2), flush=True)
    raise SystemExit(1 if failures else 0)


if __name__ == '__main__':
    main()
