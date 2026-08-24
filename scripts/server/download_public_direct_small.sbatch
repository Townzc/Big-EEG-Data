#!/usr/bin/env bash
#SBATCH --job-name=eeg-direct-small
#SBATCH --partition=long-40core-shared
#SBATCH --array=0-7%4
#SBATCH --time=2-00:00:00
#SBATCH --cpus-per-task=2
#SBATCH --mem=8G
#SBATCH --output=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/eeg-direct-small-%A_%a.out
#SBATCH --error=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/eeg-direct-small-%A_%a.err

set -euo pipefail

ROOT="/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection"
VENV="$ROOT/tools/public-downloads"
TASK="${SLURM_ARRAY_TASK_ID:?SLURM_ARRAY_TASK_ID is required}"

IDS=(EEG-0583 EEG-0584 EEG-0585 EEG-0586 EEG-0093 EEG-0122 EEG-0125 EEG-0606)
NAMES=(Albrecht2019 Gruendler2009 Singh2020 Singh2021 PD-Mortality DOD-H HMC-Haaglanden UCDDB)
TARGETS=(
  "datasets/02_Biometrics_and_Disease/Mental_and_Developmental_Disorders/Albrecht2019"
  "datasets/08_Health_and_Population/Mental_Health_Risk_Phenotype/Gruendler2009"
  "datasets/02_Biometrics_and_Disease/Neurological_Disorders/Singh2020"
  "datasets/02_Biometrics_and_Disease/Neurological_Disorders/Singh2021"
  "datasets/02_Biometrics_and_Disease/Neurological_Disorders/PD-Mortality"
  "datasets/03_Consciousness_and_State/Sleep_Staging/Dreem_Open_Datasets_DOD-H"
  "datasets/03_Consciousness_and_State/Sleep_Staging/HMC_Haaglanden"
  "datasets/02_Biometrics_and_Disease/Sleep_Disordered_Breathing/UCDDB"
)

ID="${IDS[$TASK]}"
NAME="${NAMES[$TASK]}"
TARGET="$ROOT/${TARGETS[$TASK]}"
mkdir -p "$TARGET"

download_hf_dataset() {
  local repo="$1"
  local target="$2"
  "$VENV/bin/python" - "$repo" "$target" <<'PY'
import os
import sys
from urllib.parse import quote

import requests

repo, target = sys.argv[1], sys.argv[2]
api = "https://huggingface.co/api/datasets/jalauer/{}?blobs=true".format(repo)
response = requests.get(api, timeout=60)
response.raise_for_status()
siblings = response.json().get("siblings", [])
if not siblings:
    raise RuntimeError("No files returned for {}".format(repo))

for item in siblings:
    relative = item["rfilename"]
    expected = item.get("size")
    destination = os.path.join(target, *relative.split("/"))
    os.makedirs(os.path.dirname(destination) or target, exist_ok=True)
    if os.path.isfile(destination) and expected is not None and os.path.getsize(destination) == expected:
        continue
    partial = destination + ".part"
    offset = os.path.getsize(partial) if os.path.isfile(partial) else 0
    headers = {"Range": "bytes={}-".format(offset)} if offset else {}
    url = "https://huggingface.co/datasets/jalauer/{}/resolve/main/{}?download=true".format(repo, quote(relative, safe="/"))
    with requests.get(url, headers=headers, stream=True, timeout=120) as download:
        download.raise_for_status()
        append = offset > 0 and download.status_code == 206
        with open(partial, "ab" if append else "wb") as handle:
            for chunk in download.iter_content(chunk_size=8 * 1024 * 1024):
                if chunk:
                    handle.write(chunk)
    if expected is not None and os.path.getsize(partial) != expected:
        raise RuntimeError("Size mismatch for {}: expected {}, got {}".format(relative, expected, os.path.getsize(partial)))
    os.replace(partial, destination)
PY
}

case "$TASK" in
  0) download_hf_dataset Albrecht2019 "$TARGET" ;;
  1) download_hf_dataset Gruendler2009 "$TARGET" ;;
  2) download_hf_dataset Singh2020 "$TARGET" ;;
  3) download_hf_dataset Singh2021 "$TARGET" ;;
  4) "$VENV/bin/aws" s3 sync "s3://openneuro.org/ds007020" "$TARGET" --no-sign-request --exclude ".git/*" ;;
  5) wget --continue --tries=0 --timeout=60 --output-document="$TARGET/dodh.zip" "https://zenodo.org/records/15900394/files/dodh.zip?download=1" ;;
  6) wget --recursive --no-parent --continue --timestamping --no-host-directories --cut-dirs=3 --directory-prefix="$TARGET" "https://physionet.org/files/hmc-sleep-staging/1.1/" ;;
  7) wget --recursive --no-parent --continue --timestamping --no-host-directories --cut-dirs=3 --directory-prefix="$TARGET" "https://physionet.org/files/ucddb/1.0.0/" ;;
  *) echo "Unknown task: $TASK" >&2; exit 2 ;;
esac

{
  printf 'catalog_id=%s\n' "$ID"
  printf 'dataset=%s\n' "$NAME"
  printf 'completed_utc=%s\n' "$(date -u +%FT%TZ)"
  printf 'files=%s\n' "$(find "$TARGET" -type f ! -name .download_complete | wc -l)"
  printf 'bytes=%s\n' "$(du -sb "$TARGET" | cut -f1)"
} > "$TARGET/.download_complete"
