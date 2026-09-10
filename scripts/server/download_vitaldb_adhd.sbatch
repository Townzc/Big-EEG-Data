#!/bin/bash
#SBATCH --job-name=eeg_vital_adhd
#SBATCH --partition=long-40core-shared
#SBATCH --array=0-1%2
#SBATCH --cpus-per-task=4
#SBATCH --mem=4G
#SBATCH --time=1-00:00:00
#SBATCH --output=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/vitaldb_adhd_20260910/%A_%a.out
#SBATCH --error=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/logs/vitaldb_adhd_20260910/%A_%a.err
set -euo pipefail
eeg_collection_root=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection
eeg_repo_root=/gpfs/projects/ChenyuYouGroup/Big-EEG-Data
eeg_dataset=vitaldb
if [ "${SLURM_ARRAY_TASK_ID}" = 1 ]; then eeg_dataset=adhd; fi
exec "$eeg_collection_root/tools/eeg-audit-env/bin/python" "$eeg_repo_root/scripts/server/download_vitaldb_adhd.py" "$eeg_dataset" --collection-root "$eeg_collection_root" --workers 16
