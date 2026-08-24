#!/usr/bin/env bash
#SBATCH --job-name=eeg-dl-tools
#SBATCH --partition=short-40core-shared
#SBATCH --time=00:30:00
#SBATCH --cpus-per-task=1
#SBATCH --mem=4G
#SBATCH --output=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/eeg-dl-tools-%j.out
#SBATCH --error=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/eeg-dl-tools-%j.err

set -euo pipefail

ROOT="/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection"
VENV="$ROOT/tools/public-downloads"

mkdir -p "$ROOT/tools" "$ROOT/logs"
if [[ ! -x "$VENV/bin/python" ]]; then
  python3 -m venv "$VENV"
fi
"$VENV/bin/python" -m pip install --upgrade pip
"$VENV/bin/python" -m pip install --upgrade awscli requests
"$VENV/bin/aws" --version
