export type EegFmriPair = {
  id: string;
  name: string;
  repository: string;
  sourceUrl: string;
  paperUrl: string | null;
  subjects: number | null;
  subjectNote: string;
  pairedHours: number | null;
  durationSource: "reported" | "calculated" | "estimated" | "unavailable";
  durationNote: string;
  pairing: "simultaneous" | "same-participants-separate" | "derived-only" | "not-public" | "unclear";
  activity: "rest" | "task" | "sleep" | "naturalistic" | "mixed";
  paradigms: string;
  eeg: string;
  fmri: string;
  access: "Open download" | "Registration required" | "Derived only" | "Not public" | "Restricted / unclear";
  sourceOrigin: "reference-sheet" | "added-in-audit";
  notes: string;
};

export const eegFmriPairs: EegFmriPair[] = [
  {
    id: "natview", name: "NATVIEW naturalistic viewing", repository: "NKI / FCP-INDI", sourceUrl: "https://fcon_1000.projects.nitrc.org/indi/retro/nat_view.html", paperUrl: "https://doi.org/10.1038/s41597-023-02458-8", subjects: 22, subjectNote: "22 released participants", pairedHours: 5.90, durationSource: "reported", durationNote: "SingLEM Table I multi-channel recording duration; conservative relative to the full protocol schedule.", pairing: "simultaneous", activity: "mixed", paradigms: "rest, checkerboard, Inscapes and movie clips", eeg: "64 channels, 5 kHz", fmri: "3 T Siemens TIM Trio, TR 2.1 s", access: "Registration required", sourceOrigin: "reference-sheet", notes: "Commercial use is restricted by the project consent language."
  },
  {
    id: "nimh-autonomic", name: "NIMH autonomic / global-signal EEG-fMRI", repository: "Figshare", sourceUrl: "https://doi.org/10.6084/m9.figshare.28225415.v3", paperUrl: "https://doi.org/10.1038/s41593-025-01945-y", subjects: 12, subjectNote: "Largest condition has 12; REST=11, respiration=6 and RT-cue=12 with overlap, so 12 is a conservative union lower bound.", pairedHours: 8.30, durationSource: "reported", durationNote: "Known lower bound: 15 × 24.5-min rest scans plus 9 × 14–15-min respiration scans; RT-cue duration is not added.", pairing: "simultaneous", activity: "mixed", paradigms: "eyes-closed rest, cued deep breathing, reaction-time cues", eeg: "32 channels, 5 kHz", fmri: "3 T multi-echo, TR 2.1 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "The true paired total is higher because one condition lacks a verified scan duration."
  },
  {
    id: "binocular-rivalry", name: "Frequency-tagged binocular rivalry", repository: "Dryad", sourceUrl: "https://doi.org/10.5061/dryad.bf1b1", paperUrl: "https://doi.org/10.1016/j.neuroimage.2017.01.056", subjects: 20, subjectNote: "20 participants", pairedHours: 14.80, durationSource: "calculated", durationNote: "222 s × 12 simultaneous runs × 20 participants / 3600.", pairing: "simultaneous", activity: "task", paradigms: "binocular rivalry, replay and instant-replay controls", eeg: "64 channels, 5 kHz", fmri: "3 T, TR 2.2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Raw paired signals are available from the canonical Dryad record."
  },
  {
    id: "eeg-fmri-7t", name: "High-resolution 7 T EEG-fMRI rest", repository: "Zenodo", sourceUrl: "https://doi.org/10.5281/zenodo.15781280", paperUrl: "https://doi.org/10.1162/imag.a.983", subjects: 8, subjectNote: "8 released participants; the paper's acquisition cohort was larger.", pairedHours: 3.47, durationSource: "calculated", durationNote: "Eight participants × two 8-min standard runs plus five participants × two 8-min prototype runs.", pairing: "simultaneous", activity: "rest", paradigms: "rest and eyes-open/eyes-closed blocks", eeg: "64 channels, 5 kHz", fmri: "7 T, TR 1.05/3.52 s, 1.6/0.8 mm", access: "Open download", sourceOrigin: "reference-sheet", notes: "Released data are preprocessed/artifact-corrected rather than a fully raw acquisition export."
  },
  {
    id: "ds000116", name: "Auditory and visual oddball", repository: "OpenNeuro ds000116", sourceUrl: "https://openneuro.org/datasets/ds000116/versions/00003", paperUrl: "https://doi.org/10.1016/j.neuroimage.2015.03.028", subjects: 17, subjectNote: "17 BIDS participants", pairedHours: 9.63, durationSource: "estimated", durationNote: "BOLD header audit: 6 × 170 volumes × TR 2 s per participant; run completion may vary.", pairing: "simultaneous", activity: "task", paradigms: "auditory and visual oddball", eeg: "49 recorded channels, 1 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "CC0 BIDS release."
  },
  {
    id: "ds002158", name: "Confidence in speeded perceptual decisions", repository: "OpenNeuro ds002158", sourceUrl: "https://openneuro.org/datasets/ds002158/versions/1.0.2", paperUrl: "https://doi.org/10.1073/pnas.1915784117", subjects: 20, subjectNote: "20 participants", pairedHours: 17.46, durationSource: "estimated", durationNote: "OpenNeuro EEG-file header audit across the released BIDS snapshot.", pairing: "simultaneous", activity: "task", paradigms: "dot-array perceptual choice and confidence", eeg: "63 channels, 5 kHz", fmri: "3 T, TR 1.28 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "OpenNeuro release contains paired task recordings."
  },
  {
    id: "ds002336", name: "Motor-imagery neurofeedback XP1", repository: "OpenNeuro ds002336", sourceUrl: "https://openneuro.org/datasets/ds002336/versions/2.0.2", paperUrl: "https://doi.org/10.1038/s41597-020-0498-3", subjects: 10, subjectNote: "10 released participants", pairedHours: 5.64, durationSource: "estimated", durationNote: "OpenNeuro EEG-file header audit; more conservative than treating every planned run as complete.", pairing: "simultaneous", activity: "task", paradigms: "EEG, fMRI and bimodal motor-imagery neurofeedback", eeg: "63 EEG + ECG, 5 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "XP1 and XP2 are different cohorts and remain separate canonical entries."
  },
  {
    id: "ds002338", name: "Motor-imagery neurofeedback XP2", repository: "OpenNeuro ds002338", sourceUrl: "https://openneuro.org/datasets/ds002338/versions/2.0.2", paperUrl: "https://doi.org/10.1038/s41597-020-0498-3", subjects: 17, subjectNote: "17 participants are present in the public BIDS release; 23 is a planned/paper cohort count.", pairedHours: 8.29, durationSource: "estimated", durationNote: "OpenNeuro EEG-file header audit of the released cohort.", pairing: "simultaneous", activity: "task", paradigms: "1D/2D motor-imagery neurofeedback", eeg: "63 EEG + ECG, 5 kHz", fmri: "3 T, TR 1 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Corrects the reference sheet's 23-subject value to 17 actually released participants."
  },
  {
    id: "ds002725", name: "Affective music listening", repository: "OpenNeuro ds002725", sourceUrl: "https://openneuro.org/datasets/ds002725/versions/1.0.0", paperUrl: "https://doi.org/10.1038/s41598-019-45105-2", subjects: 21, subjectNote: "21 participants", pairedHours: 22.49, durationSource: "estimated", durationNote: "OpenNeuro EEG-file header audit, extrapolated over the released participants.", pairing: "simultaneous", activity: "naturalistic", paradigms: "music listening and continuous affect ratings", eeg: "30 EEG + ECG, 1 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "The naturalistic label reflects continuous music stimulation."
  },
  {
    id: "ds002739", name: "Confidence in perceptual decisions", repository: "OpenNeuro ds002739", sourceUrl: "https://openneuro.org/datasets/ds002739/versions/1.0.0", paperUrl: "https://doi.org/10.7554/eLife.38293", subjects: 24, subjectNote: "24 BIDS participants", pairedHours: 20.56, durationSource: "estimated", durationNote: "BOLD header audit: two 771-volume runs at TR 2 s in the sampled protocol, extrapolated to 24 participants.", pairing: "simultaneous", activity: "task", paradigms: "random-dot motion decisions and confidence", eeg: "64 channels, native 5 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Current accession supersedes the legacy ds001512 identifier."
  },
  {
    id: "ds003768", name: "Rest and sleep EEG-fMRI", repository: "OpenNeuro ds003768 / NEMAR", sourceUrl: "https://openneuro.org/datasets/ds003768/versions/1.0.13", paperUrl: "https://doi.org/10.1016/j.dib.2023.109059", subjects: 33, subjectNote: "33 healthy participants", pairedHours: 68.82, durationSource: "estimated", durationNote: "BOLD header audit of a sampled participant (20.0 min rest + 105.1 min sleep), extrapolated to 33; sleep-run completion varies.", pairing: "simultaneous", activity: "sleep", paradigms: "rest and PSG-staged sleep", eeg: "about 30 EEG channels, native 5 kHz", fmri: "3 T Siemens Prisma, TR 2.1 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "The reference sheet's fixed three-sleep-run assumption understates/overstates participants with variable sleep runs."
  },
  {
    id: "ds006033", name: "Synchronous inner speech", repository: "OpenNeuro ds006033", sourceUrl: "https://openneuro.org/datasets/ds006033/versions/1.0.1", paperUrl: null, subjects: 3, subjectNote: "3 released participants", pairedHours: 2.01, durationSource: "estimated", durationNote: "BOLD header audit: mean 40.1 min per sampled participant × 3.", pairing: "simultaneous", activity: "task", paradigms: "covert/inner speech", eeg: "64 EEG + ECG/misc, 5 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Distinct from the older ds004196 bimodal inner-speech dataset, where modalities were recorded separately."
  },
  {
    id: "ds006040", name: "Sustained attention gradCPT + DWI", repository: "OpenNeuro ds006040", sourceUrl: "https://openneuro.org/datasets/ds006040/versions/1.0.2", paperUrl: null, subjects: 28, subjectNote: "28 BIDS participants", pairedHours: 29.46, durationSource: "estimated", durationNote: "BOLD header audit: mean 63.13 min of readable paired functional runs × 28.", pairing: "simultaneous", activity: "mixed", paradigms: "rest, checkerboard, gradCPT and mental imagery", eeg: "63 EEG + ECG, 5 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "DWI is additional and is not counted in paired hours."
  },
  {
    id: "ds007216", name: "Multi-session gradCPT + experience sampling", repository: "OpenNeuro ds007216", sourceUrl: "https://openneuro.org/datasets/ds007216/versions/1.0.0", paperUrl: "https://doi.org/10.64898/2026.02.04.703882", subjects: 24, subjectNote: "24 published participants; participants.tsv may contain one additional administrative row.", pairedHours: 32.00, durationSource: "reported", durationNote: "Approximately 80 min of simultaneous acquisition per participant × 24.", pairing: "simultaneous", activity: "mixed", paradigms: "gradCPT and rest with thought probes across two sessions", eeg: "31 EEG + ECG + 4 CWL, 5 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "The one-participant BOLD sample audit reads fewer runs; the paper-level protocol is used and labeled reported."
  },
  {
    id: "noddi", name: "NODDI resting-state EEG-fMRI", repository: "OSF", sourceUrl: "https://osf.io/94c5t/", paperUrl: "https://doi.org/10.3389/fnins.2014.00258", subjects: 17, subjectNote: "17 released; the original analysis used 16.", pairedHours: 3.06, durationSource: "calculated", durationNote: "300 volumes × TR 2.16 s × 17 released participants / 3600.", pairing: "simultaneous", activity: "rest", paradigms: "eyes-open resting state", eeg: "64 channels, 1 kHz", fmri: "3 T, TR 2.16 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Includes structural/diffusion imaging, which is excluded from paired-hour totals."
  },
  {
    id: "cwl-eyes", name: "CWL eyes-open / eyes-closed", repository: "NITRC", sourceUrl: "https://www.nitrc.org/projects/cwleegfmri_data/", paperUrl: "https://doi.org/10.1016/j.dib.2016.08.064", subjects: 8, subjectNote: "8 participants across two scanners", pairedHours: 1.20, durationSource: "calculated", durationNote: "Two 4.5-min simultaneous runs × 8 participants / 60.", pairing: "simultaneous", activity: "rest", paradigms: "alternating eyes open and eyes closed, helium pump on/off", eeg: "30 EEG + EOG/ECG + 6 CWL, 5 kHz", fmri: "3 T Siemens Trio/Verio, TR ≈2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Reference artifact-correction dataset used by multimodal representation papers."
  },
  {
    id: "unam", name: "UNAM simultaneous + independent EEG/MRI", repository: "Mendeley Data", sourceUrl: "https://data.mendeley.com/datasets/crhybxpdy6/2", paperUrl: "https://doi.org/10.1016/j.dib.2023.109646", subjects: 20, subjectNote: "20 participants", pairedHours: 4.67, durationSource: "calculated", durationNote: "Approximately 14 min of simultaneous resting/block data × 20 / 60.", pairing: "simultaneous", activity: "rest", paradigms: "eyes closed/open plus independent comparison sessions", eeg: "32-channel EGI, 1 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Only simultaneous runs are counted; independent EEG/MRI sessions are not added."
  },
  {
    id: "gesture-speech", name: "Gesture–speech integration", repository: "Zenodo", sourceUrl: "https://doi.org/10.5281/zenodo.5031815", paperUrl: "https://doi.org/10.1007/s00429-018-1676-5", subjects: 19, subjectNote: "19 participants", pairedHours: 8.97, durationSource: "calculated", durationNote: "425 volumes × TR 2 s × 2 runs × 19 / 3600.", pairing: "simultaneous", activity: "naturalistic", paradigms: "gesture-speech congruency video clips", eeg: "31 channels, 5 kHz", fmri: "3 T, TR 2 s", access: "Open download", sourceOrigin: "reference-sheet", notes: "Event-related audiovisual task."
  },
  {
    id: "ds002734", name: "Evidence accumulation in value decisions", repository: "OpenNeuro ds002734", sourceUrl: "https://openneuro.org/datasets/ds002734/versions/1.0.2", paperUrl: "https://doi.org/10.7554/eLife.65018", subjects: 22, subjectNote: "22 BIDS participants", pairedHours: 9.38, durationSource: "estimated", durationNote: "BOLD header audit: two 307-volume runs at TR 2.5 s, extrapolated to 22 participants.", pairing: "simultaneous", activity: "task", paradigms: "value-based decision making", eeg: "MR-compatible scalp EEG", fmri: "3 T, TR 2.5 s", access: "Open download", sourceOrigin: "added-in-audit", notes: "Confirmed omission from the reference sheet."
  },
  {
    id: "ds003574", name: "Reward-biased reactivation during sleep", repository: "OpenNeuro ds003574 / NEMAR", sourceUrl: "https://nemar.org/dataset/on003574", paperUrl: "https://doi.org/10.1038/s41467-021-22202-3", subjects: 18, subjectNote: "18 participants", pairedHours: 50.37, durationSource: "estimated", durationNote: "BOLD header audit: mean 167.89 min of game/rest-sleep runs in a sampled participant × 18.", pairing: "simultaneous", activity: "sleep", paradigms: "rewarded games followed by 1–2 h sleep monitoring", eeg: "64 channels", fmri: "3 T", access: "Open download", sourceOrigin: "added-in-audit", notes: "Confirmed omission from the reference sheet; CC0 raw BIDS release."
  },
  {
    id: "ds005127", name: "AMRI sleep1 whole-night EEG-fMRI", repository: "OpenNeuro ds005127", sourceUrl: "https://openneuro.org/datasets/ds005127/versions/2.0.2", paperUrl: "https://elifesciences.org/articles/98739", subjects: 16, subjectNote: "16 released participants", pairedHours: 256.00, durationSource: "estimated", durationNote: "Official README: approximately 8 h per night × two consecutive nights × 16 participants.", pairing: "simultaneous", activity: "sleep", paradigms: "whole-night sleep with repeated awakenings", eeg: "overnight PSG/EEG", fmri: "3 T, TR 3 s", access: "Open download", sourceOrigin: "added-in-audit", notes: "Largest paired collection in this survey by recording hours; approximate protocol total, not a QC-passed exact sum."
  },
  {
    id: "ds004478", name: "Visual flicker and CSF-flow experiment", repository: "OpenNeuro ds004478", sourceUrl: "https://openneuro.org/datasets/ds004478/versions/1.0.2", paperUrl: "https://doi.org/10.1371/journal.pbio.3002035", subjects: 6, subjectNote: "6 participants", pairedHours: 0.40, durationSource: "estimated", durationNote: "BOLD header audit: one 4-min checkerboard run × 6.", pairing: "simultaneous", activity: "task", paradigms: "flickering radial checkerboard", eeg: "one cleaned occipital EEG channel per run", fmri: "3 T high-temporal-resolution fMRI, TR 0.367 s", access: "Open download", sourceOrigin: "added-in-audit", notes: "Raw fMRI is public; the released EEG is a cleaned single-channel derivative."
  },
  {
    id: "cinebrain", name: "CineBrain", repository: "Hugging Face", sourceUrl: "https://huggingface.co/datasets/Fudan-fMRI/CineBrain", paperUrl: "https://arxiv.org/abs/2503.06940", subjects: 6, subjectNote: "6 participants", pairedHours: 36.00, durationSource: "reported", durationNote: "Official dataset card: approximately 6 h per participant × 6.", pairing: "simultaneous", activity: "naturalistic", paradigms: "30 television episodes with audiovisual narrative", eeg: "64 channels, 1 kHz, plus ECG", fmri: "TR 0.8 s", access: "Open download", sourceOrigin: "added-in-audit", notes: "Large within-subject duration; Apache-2.0 dataset card."
  },
  {
    id: "bondi-motor", name: "Whole-brain EEG-informed fMRI motor conditions", repository: "CMU Figshare", sourceUrl: "https://doi.org/10.1184/R1/29264621", paperUrl: "https://doi.org/10.1016/j.neuroimage.2025.121311", subjects: 17, subjectNote: "17 participants completed one session", pairedHours: null, durationSource: "unavailable", durationNote: "The open record confirms the cohort and paired data but does not report a reliable total scan duration.", pairing: "simultaneous", activity: "task", paradigms: "left/right hand and right-foot motor execution and imagery", eeg: "preprocessed after GA/BCG correction", fmri: "preprocessed BOLD", access: "Open download", sourceOrigin: "added-in-audit", notes: "25.09 GB, CC BY-NC 4.0."
  },
  {
    id: "schrooten", name: "Simultaneous versus separate covert attention", repository: "Zenodo", sourceUrl: "https://zenodo.org/records/1507643", paperUrl: "https://doi.org/10.3389/fnins.2018.01009", subjects: 5, subjectNote: "5 participants", pairedHours: null, durationSource: "unavailable", durationNote: "Repository confirms simultaneous and separate sessions but no trustworthy aggregate duration was found.", pairing: "simultaneous", activity: "task", paradigms: "covert spatial attention", eeg: "raw/processed EEG archive", fmri: "fMRI archive", access: "Open download", sourceOrigin: "added-in-audit", notes: "10.7 GB public record."
  },
  {
    id: "atr-efp-2025", name: "ATR EEG-fMRI with carbon-wire loops", repository: "ATR DBI", sourceUrl: "https://doi.org/10.34860/atr-EfP-2025", paperUrl: "https://doi.org/10.1038/s41597-026-06734-1", subjects: 39, subjectNote: "39 unique participants; 10 were scanned on both Prisma and Verio.", pairedHours: null, durationSource: "unavailable", durationNote: "Task durations are reported, but missing sessions and repeated scanner visits prevent a reliable aggregate without auditing the released files.", pairing: "simultaneous", activity: "mixed", paradigms: "8-min rest, visual oddball and 0/2-back inside and outside MRI", eeg: "63 EEG + ECG + 4 CWL, 5 kHz", fmri: "3 T Siemens Prisma/Verio", access: "Registration required", sourceOrigin: "added-in-audit", notes: "The reference sheet had only a blank ATR placeholder; the 2026 Scientific Data paper and registered dataset now make it identifiable."
  },
  {
    id: "berlin-tvb", name: "Berlin/Charité 50-subject EEG-fMRI connectome", repository: "paper/project description", sourceUrl: "https://www.biorxiv.org/content/10.1101/2024.01.24.576989v1", paperUrl: null, subjects: 50, subjectNote: "50 recruited; 49 processed", pairedHours: 17.94, durationSource: "calculated", durationNote: "666 volumes × TR 1.94 s × 50 / 3600.", pairing: "unclear", activity: "rest", paradigms: "eyes-closed rest and TVB modeling", eeg: "64 channels, 5 kHz", fmri: "3 T, TR 1.94 s", access: "Restricted / unclear", sourceOrigin: "reference-sheet", notes: "No documented raw public download mechanism was verified; excluded from public-paired aggregates."
  },
  {
    id: "msit-dryad", name: "Multi-Source Interference Task", repository: "Dryad", sourceUrl: "https://doi.org/10.5061/dryad.c1m3b", paperUrl: "https://doi.org/10.1371/journal.pone.0114599", subjects: 18, subjectNote: "18 study participants", pairedHours: 4.02, durationSource: "calculated", durationNote: "402 s × two runs × 18 / 3600 from the paper protocol.", pairing: "derived-only", activity: "task", paradigms: "control versus interference", eeg: "only summary values in the public record", fmri: "only summary values in the public record", access: "Derived only", sourceOrigin: "reference-sheet", notes: "Dryad contains one 46.59 KB spreadsheet, not raw EEG/fMRI signals; excluded from raw-paired aggregates."
  },
  {
    id: "neurobolt", name: "NeuroBOLT resting EEG-fMRI", repository: "paper only", sourceUrl: "https://proceedings.neurips.cc/paper_files/paper/2024/hash/5d582367652cd9473d4f5fba7dcfb503-Abstract-Conference.html", paperUrl: null, subjects: 22, subjectNote: "22 participants / 29 scans in the paper", pairedHours: 9.67, durationSource: "reported", durationNote: "Approximately 20 min × 29 scans.", pairing: "not-public", activity: "rest", paradigms: "eyes-closed resting state", eeg: "26 analyzed channels, 5 kHz", fmri: "3 T, TR 2.1 s", access: "Not public", sourceOrigin: "reference-sheet", notes: "Useful literature cohort but no public researcher download was verified; excluded from public aggregates."
  },
  {
    id: "ds004196", name: "Bimodal inner speech (legacy)", repository: "OpenNeuro ds004196", sourceUrl: "https://openneuro.org/datasets/ds004196", paperUrl: null, subjects: 4, subjectNote: "4 participants", pairedHours: null, durationSource: "unavailable", durationNote: "EEG and fMRI were acquired in separate modality sessions, so no simultaneous paired-hour total is defined.", pairing: "same-participants-separate", activity: "task", paradigms: "inner speech", eeg: "scalp EEG", fmri: "task fMRI", access: "Open download", sourceOrigin: "added-in-audit", notes: "Corrects the EEG catalog's legacy stable-ID typo from ds004197 to ds004196 through the survey layer."
  },
  {
    id: "ds004718", name: "Le Petit Prince Hong Kong", repository: "OpenNeuro ds004718", sourceUrl: "https://openneuro.org/datasets/ds004718/versions/1.0.1", paperUrl: null, subjects: 52, subjectNote: "52 participants", pairedHours: null, durationSource: "unavailable", durationNote: "Same cohort but modality sessions were not simultaneous; durations should remain modality-specific.", pairing: "same-participants-separate", activity: "naturalistic", paradigms: "Cantonese story listening", eeg: "EEG session", fmri: "naturalistic fMRI session", access: "Open download", sourceOrigin: "added-in-audit", notes: "Do not treat multimodal BIDS presence as synchronous acquisition."
  },
  {
    id: "ds005345", name: "Le Petit Prince Multi-talker", repository: "OpenNeuro ds005345", sourceUrl: "https://openneuro.org/datasets/ds005345", paperUrl: "https://doi.org/10.1038/s41597-025-05215-1", subjects: 26, subjectNote: "26 catalog participants; usable modality counts can differ", pairedHours: null, durationSource: "unavailable", durationNote: "EEG and 7 T fMRI were collected in separate visits.", pairing: "same-participants-separate", activity: "naturalistic", paradigms: "single- and multi-talker story listening", eeg: "EEG session", fmri: "7 T fMRI session", access: "Open download", sourceOrigin: "added-in-audit", notes: "Excluded from simultaneous totals."
  },
  {
    id: "ds004796", name: "PEARL Neuro", repository: "OpenNeuro ds004796", sourceUrl: "https://openneuro.org/datasets/ds004796", paperUrl: null, subjects: 79, subjectNote: "79 participants", pairedHours: null, durationSource: "unavailable", durationNote: "EEG and fMRI belong to the same cohort but were not verified as simultaneous.", pairing: "same-participants-separate", activity: "mixed", paradigms: "multimodal cognition and naturalistic tasks", eeg: "EEG", fmri: "fMRI", access: "Open download", sourceOrigin: "added-in-audit", notes: "Kept as a paired-cohort resource, outside the simultaneous aggregate."
  },
  {
    id: "ds003505", name: "VEPCON", repository: "OpenNeuro ds003505", sourceUrl: "https://openneuro.org/datasets/ds003505", paperUrl: null, subjects: 20, subjectNote: "20 participants", pairedHours: null, durationSource: "unavailable", durationNote: "MRI/connectome data support EEG source modeling; no simultaneous BOLD pairing is counted.", pairing: "same-participants-separate", activity: "task", paradigms: "visual evoked potentials and source imaging", eeg: "high-density EEG", fmri: "MRI/connectome support", access: "Open download", sourceOrigin: "added-in-audit", notes: "Multimodal does not imply simultaneous functional acquisition."
  },
  {
    id: "ds002718", name: "Wakeman–Henson multimodal faces", repository: "OpenNeuro ds002718", sourceUrl: "https://openneuro.org/datasets/ds002718", paperUrl: "https://doi.org/10.1038/sdata.2015.1", subjects: 18, subjectNote: "18 participants", pairedHours: null, durationSource: "unavailable", durationNote: "EEG/MEG and fMRI sessions are separate.", pairing: "same-participants-separate", activity: "task", paradigms: "face perception", eeg: "EEG/MEG", fmri: "task fMRI", access: "Open download", sourceOrigin: "added-in-audit", notes: "Important multimodal benchmark but not a synchronous EEG-fMRI pair."
  },
  {
    id: "tle-connectomes", name: "EEG–fMRI connectomes in temporal-lobe epilepsy", repository: "UNIGE", sourceUrl: "https://www.unige.ch/medecine/neucli/groupes-de-recherche/serge-vulliemoz/open-science/altered-correlation-eeg-fmri-connectomes-tle", paperUrl: null, subjects: 69, subjectNote: "35 healthy + 34 temporal-lobe epilepsy", pairedHours: null, durationSource: "unavailable", durationNote: "The public resource contains derived connectomes rather than raw paired time series.", pairing: "derived-only", activity: "rest", paradigms: "resting functional connectomes", eeg: "derived EEG connectomes", fmri: "derived fMRI connectomes", access: "Derived only", sourceOrigin: "added-in-audit", notes: "Clinically useful derived resource; excluded from raw hours."
  },
  {
    id: "connectome-repro", name: "Cross-study EEG–fMRI connectome collection", repository: "Zenodo", sourceUrl: "https://zenodo.org/records/3905103", paperUrl: "https://doi.org/10.1162/netn_a_00129", subjects: null, subjectNote: "Combines already-published cohorts; do not sum as new people", pairedHours: null, durationSource: "unavailable", durationNote: "Only derived atlas connectomes are provided.", pairing: "derived-only", activity: "rest", paradigms: "resting EEG/fMRI connectome reproducibility", eeg: "derived connectomes", fmri: "derived connectomes", access: "Derived only", sourceOrigin: "added-in-audit", notes: "A mirror/derivative across source cohorts, not a new canonical acquisition."
  },
  {
    id: "ds005533", name: "Inknet2 multimodal MRI with EEG cap", repository: "OpenNeuro ds005533", sourceUrl: "https://openneuro.org/datasets/ds005533", paperUrl: "https://doi.org/10.1088/1741-2552/ad8837", subjects: 3, subjectNote: "Public BIDS index exposes 3 participants; the paper includes additional 3 T/7 T acquisitions.", pairedHours: null, durationSource: "unavailable", durationNote: "The public release is primarily an MRI image-quality resource; usable raw EEG time series were not verified.", pairing: "unclear", activity: "rest", paradigms: "MRI sequence/image-quality validation with conductive-ink EEG net", eeg: "EEG net present; public signal scope unclear", fmri: "3 T/7 T multimodal MRI", access: "Open download", sourceOrigin: "added-in-audit", notes: "Excluded until raw EEG availability and synchronous run coverage are verified."
  }
];

export const simultaneousPublicPairs = eegFmriPairs.filter((row) =>
  row.pairing === "simultaneous" && (row.access === "Open download" || row.access === "Registration required")
);

export const eegFmriPairSummary = {
  datasets: simultaneousPublicPairs.length,
  subjectEntries: simultaneousPublicPairs.reduce((sum, row) => sum + (row.subjects ?? 0), 0),
  knownDurationDatasets: simultaneousPublicPairs.filter((row) => row.pairedHours != null).length,
  knownPairedHours: simultaneousPublicPairs.reduce((sum, row) => sum + (row.pairedHours ?? 0), 0),
  addedDatasets: simultaneousPublicPairs.filter((row) => row.sourceOrigin === "added-in-audit").length,
  separateSessionDatasets: eegFmriPairs.filter((row) => row.pairing === "same-participants-separate").length,
  excludedOrUnclearDatasets: eegFmriPairs.filter((row) => ["derived-only", "not-public", "unclear"].includes(row.pairing)).length,
} as const;
