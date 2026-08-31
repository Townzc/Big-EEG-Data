import catalog from "../public/catalog-data.json";
import openNeuroAudit from "./eeg-openneuro-duration-audit.json";

type CatalogRow = (typeof catalog.catalogRows)[number];
type DurationAuditRecord = (typeof openNeuroAudit.records)[number];
type AuditedCatalogRow = CatalogRow & { durationSource?: "reported" | "calculated" | "estimated" };

const auditById = new Map<string, DurationAuditRecord>(
  openNeuroAudit.records.map((record) => [record.id, record]),
);

const appliedAuditRecords = openNeuroAudit.records.filter((record) => {
  const row = catalog.catalogRows.find((item) => item.id === record.id);
  return row != null && row.durationHours == null;
});

const auditBasis = (record: DurationAuditRecord) => record.durationSource === "calculated"
  ? "OpenNeuro 全量文件计算"
  : "OpenNeuro BIDS 抽样外推";

const auditEvidence = (record: DurationAuditRecord) => {
  const participants = record.accessions.reduce((sum, accession) => sum + accession.sampledSubjects.length, 0);
  const available = record.accessions.reduce((sum, accession) => sum + accession.subjects, 0);
  const files = record.accessions.reduce((sum, accession) => sum + accession.sampledSignalFiles, 0);
  return record.durationSource === "calculated"
    ? `calculated · 全部 ${available} 名 BIDS 被试、${files} 个信号文件`
    : `estimated · 均匀抽取 ${participants}/${available} 名 BIDS 被试、${files} 个信号文件`;
};

export const eegCatalogRows = catalog.catalogRows.map((row): AuditedCatalogRow => {
  const audit = auditById.get(row.id);
  if (!audit || row.durationHours != null) {
    return row.durationHours == null ? row : {
      ...row,
      durationSource: row.durationBasis?.includes("文件") ? "calculated" : "reported",
    };
  }
  return {
    ...row,
    durationHours: audit.durationHours,
    durationSource: audit.durationSource,
    durationBasis: auditBasis(audit),
    durationEvidence: auditEvidence(audit),
    durationEvidenceUrl: audit.sourceUrl,
    completenessScore: Math.min(row.completenessMax, row.completenessScore + 1),
  };
});

const focusTypeById = new Map(catalog.downloadChecklist.rows.map((row) => [row.id, row.focusType]));
const diseaseRows = eegCatalogRows.filter((row) => focusTypeById.get(row.id) === "疾病/临床");
const diseaseKnownRows = diseaseRows.filter((row) => row.durationHours != null);

// These five entries are documented child subsets of the included TUEG parent.
// Removing them is the only row-level overlap correction made here.
const tuegChildOverlapIds = new Set(["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"]);
const nonFocusOpenNeuroHours = appliedAuditRecords.reduce((sum, record) => sum + record.durationHours, 0);
const rowLevelHours = eegCatalogRows.reduce((sum, row) => sum + (row.durationHours ?? 0), 0);
const rowLevelKnownUnits = eegCatalogRows.filter((row) => row.durationHours != null).length;

export const eegDurationSummary = {
  verifiedAt: openNeuroAudit.generatedAt,
  disease: {
    units: diseaseRows.length,
    knownUnits: diseaseKnownRows.length,
    rawKnownRowHours: diseaseKnownRows.reduce((sum, row) => sum + (row.durationHours ?? 0), 0),
    knownOverlapAdjustedHours: diseaseKnownRows
      .filter((row) => !tuegChildOverlapIds.has(row.id))
      .reduce((sum, row) => sum + (row.durationHours ?? 0), 0),
    excludedKnownOverlapUnits: tuegChildOverlapIds.size,
  },
  catalog: {
    units: catalog.catalogRows.length,
    rowLevelKnownUnits,
    rowLevelMissingUnits: catalog.catalogRows.length - rowLevelKnownUnits,
    rowLevelHours,
    sourceLevelKnownCoverageHours: catalog.neuroAtlasComparison.sourceUnion.extendedHours + nonFocusOpenNeuroHours,
    sourceLevelFocusHours: catalog.neuroAtlasComparison.sourceUnion.extendedHours,
    sourceLevelCoveredFocusUnits: catalog.neuroAtlasComparison.focusCoverage.units,
    sourceLevelCoveredNonFocusUnits: appliedAuditRecords.length,
  },
  openNeuro: {
    candidateUnits: appliedAuditRecords.length + openNeuroAudit.failures.length,
    knownUnits: appliedAuditRecords.length,
    unavailableUnits: openNeuroAudit.failures.length,
    calculatedUnits: appliedAuditRecords.filter((record) => record.durationSource === "calculated").length,
    estimatedUnits: appliedAuditRecords.filter((record) => record.durationSource === "estimated").length,
    addedHours: nonFocusOpenNeuroHours,
  },
} as const;

const categoryAliases: Record<string, string> = {
  "07_General-purpose": "07_General-purpose_and_Multi-paradigm",
};

export const categoryDurationStats = (categories: readonly {
  code: string;
  label: string;
  units: number;
  subjectKnownUnits: number;
  subjectEntries: number;
  durationKnownUnits: number;
  hours: number | null;
}[]) => categories.map((category) => {
  const matching = eegCatalogRows.filter((row) => {
    const normalized = categoryAliases[row.largeCategory] ?? row.largeCategory;
    return normalized.startsWith(`${category.code}_`);
  });
  const known = matching.filter((row) => row.durationHours != null);
  return {
    ...category,
    durationKnownUnits: known.length,
    hours: known.length ? known.reduce((sum, row) => sum + (row.durationHours ?? 0), 0) : null,
  };
});
