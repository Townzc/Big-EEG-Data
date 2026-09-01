export type IndependentDurationRecord = {
  id: string;
  name: string;
  durationHours: number;
  durationSource: "reported" | "calculated" | "estimated";
  evidenceUrl: string;
  evidence: string;
  sourceLevelIncrementHours: number;
  note: string;
};

/**
 * Evidence found by independently checking official database releases and
 * large-corpus EEG papers after the OpenNeuro and SingLEM passes.
 *
 * sourceLevelIncrementHours is deliberately separate from durationHours:
 * HSP is already represented in the existing sleep-source union, while the
 * HEEDB increment removes the full 56,676 h I-CARE contribution as a
 * conservative overlap guard before adding the current approximate HEEDB
 * scale. This may undercount non-Harvard I-CARE sites, but it cannot inflate
 * the source-level total through a known mirror/subset relationship.
 */
export const independentDurationRecords: IndependentDurationRecord[] = [
  {
    id: "EEG-0012",
    name: "Harvard EEG Database (HEEDB)",
    durationHours: 3_300_000,
    durationSource: "reported",
    evidenceUrl: "https://bdsp.io/content/nf89816gtxbon11kbr9a/1.0/",
    evidence: "Official BDSP comparison reports approximately 3.3 million EEG hours, approximately 329,000 recordings and approximately 109,000 patients.",
    sourceLevelIncrementHours: 3_300_000 - 56_676,
    note: "Approximate current-platform scale; the separately versioned HEEDB v4.1 page reports 284,343 studies and 109,178 patients. The source-union increment conservatively removes all I-CARE hours because several Harvard hospitals overlap.",
  },
  {
    id: "EEG-0127",
    name: "Human Sleep Project (HSP)",
    durationHours: 190_732,
    durationSource: "reported",
    evidenceUrl: "https://openreview.net/pdf?id=DDXhRN66eV",
    evidence: "SleepFM Table 4 reports 25,253 recordings, 18,973 subjects, 7.6 ± 1.1 h average duration and 190,732 total hours.",
    sourceLevelIncrementHours: 0,
    note: "This matches the 18,973-subject catalog release. HSP v3 has since expanded to 90,166 patients, but its official page does not publish an exact aggregate EEG-hour total. The existing sleep-source union already includes this release, so it is row-level evidence only.",
  },
  {
    id: "EEG-0354",
    name: "BCI Competition IV-1",
    durationHours: 8.21,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 8.21 recording hours.",
    sourceLevelIncrementHours: 8.21,
    note: "Paper-level recording hours, not channel-hours.",
  },
  {
    id: "EEG-0180",
    name: "eNTERFACE 2006 (Emobrain)",
    durationHours: 4.94,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 4.94 recording hours.",
    sourceLevelIncrementHours: 4.94,
    note: "Paper-level recording hours, not channel-hours.",
  },
  {
    id: "EEG-0386",
    name: "Grasp-and-Lift EEG Challenge",
    durationHours: 11.72,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 11.72 recording hours.",
    sourceLevelIncrementHours: 11.72,
    note: "Paper-level recording hours, not channel-hours.",
  },
  {
    id: "EEG-0486",
    name: "Inria BCI Challenge (ERN)",
    durationHours: 29.98,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 29.98 recording hours.",
    sourceLevelIncrementHours: 29.98,
    note: "Paper-level recording hours, not channel-hours.",
  },
  {
    id: "EEG-0560",
    name: "Raw EEG Data (Trujillo 2020)",
    durationHours: 34.35,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 34.35 recording hours.",
    sourceLevelIncrementHours: 34.35,
    note: "Mapped by the official DOI and the paper's 48-subject count.",
  },
  {
    id: "EEG-0514",
    name: "RSEEG (Trujillo resting-state)",
    durationHours: 3.04,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 3.04 recording hours for the 22-subject resting-state release.",
    sourceLevelIncrementHours: 3.04,
    note: "The 22-subject count uniquely distinguishes this row from the separate 21-subject Trujillo 2017 release.",
  },
  {
    id: "EEG-0167",
    name: "SPIS Resting-State Dataset",
    durationHours: 0.83,
    durationSource: "reported",
    evidenceUrl: "https://proceedings.iclr.cc/paper_files/paper/2025/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf",
    evidence: "NeuroLM Appendix C, Table 6: 0.83 recording hours.",
    sourceLevelIncrementHours: 0.83,
    note: "Paper-level recording hours, not channel-hours.",
  },
];

export const neurotechSupplementalCatalogRow = {
  id: "EEG-NEW-0001",
  name: "Neurotech EEG Dataset",
  largeCategory: "02_Healthcare_and_Disease",
  smallCategory: "Clinical_Abnormalities",
  task: "Long-duration clinical EEG; diagnostic and report-linked corpus",
  subjectsDisplay: "4,914 patients",
  channels: "25–29",
  samplingRate: "256 Hz",
  format: "BIDS-EEG",
  rawProcessed: "Raw EEG + reports/metadata",
  access: "DOWNLOAD_APPLICATION_REQUIRED",
  url: "https://bdsp.io/content/nf89816gtxbon11kbr9a/1.0/",
  stableId: "BDSP:nf89816gtxbon11kbr9a v1.0",
  paper: "Official BDSP dataset release (2026)",
  verification: "2026-08-31 新增；原始 563 行 JSON 保持不变，通过独立审计层追加。需要 credentialing 与 DUA。",
  isNew: true,
  durationHours: 212_186,
  durationSource: "reported" as const,
  durationBasis: "官网发布·记录小时",
  durationEvidence: "4,914 patients · 23,607 recordings · 212,186 h · 10.2 TB",
  durationEvidenceUrl: "https://bdsp.io/content/nf89816gtxbon11kbr9a/1.0/",
  completenessScore: 15,
  completenessMax: 15,
};

export const independentDurationAudit = {
  generatedAt: "2026-08-31",
  records: independentDurationRecords,
  supplementalRows: [neurotechSupplementalCatalogRow],
  sourceLevelIncrementHours:
    independentDurationRecords.reduce((sum, row) => sum + row.sourceLevelIncrementHours, 0)
    + neurotechSupplementalCatalogRow.durationHours,
  knownIcareOverlapHoursRemoved: 56_676,
} as const;
