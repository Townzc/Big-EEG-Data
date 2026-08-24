#!/usr/bin/env bash
#SBATCH --job-name=chbmp-extract
#SBATCH --partition=short-40core-shared
#SBATCH --time=02:00:00
#SBATCH --cpus-per-task=2
#SBATCH --mem=4G
#SBATCH --output=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/chbmp-extract-%j.out
#SBATCH --error=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/chbmp-extract-%j.err

set -euo pipefail

ROOT="/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/datasets/08_Health_and_Population/Lifespan_and_Normative/Cuban_Human_Brain_Mapping_Project_CHBMP"
ARCHIVES="$ROOT/_archives"

shopt -s nullglob
for archive in "$ARCHIVES"/sub-CBM*_ses-*_eeg.tgz; do
  filename="$(basename "$archive")"
  subject="${filename%%_ses-*}"
  remainder="${filename#*_ses-}"
  session="ses-${remainder%%_*}"
  target="$ROOT/$subject/$session/eeg"
  marker="$target/.archive_extracted"
  if [[ -f "$marker" ]]; then
    continue
  fi
  mkdir -p "$target"
  tar -xzf "$archive" -C "$target"
  printf '%s\t%s\n' "$(date -u +%FT%TZ)" "$filename" > "$marker"
done

find "$ROOT" -type f -name '*_eeg.edf' -printf '%p\t%s\n' | sort > "$ROOT/edf_manifest.tsv"
