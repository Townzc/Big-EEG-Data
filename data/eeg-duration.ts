import catalog from "../public/catalog-data.json";
import openNeuroAudit from "./eeg-openneuro-duration-audit.json";
import literatureAudit from "./eeg-literature-duration-audit.json";
import {
  independentDurationAudit,
  independentDurationRecords,
  neurotechSupplementalCatalogRow,
} from "./eeg-independent-duration-audit";

type CatalogRow = (typeof catalog.catalogRows)[number];
type DurationAuditRecord = (typeof openNeuroAudit.records)[number];
type LiteratureAuditRecord = (typeof literatureAudit.records)[number];
type IndependentAuditRecord = (typeof independentDurationRecords)[number];
type AuditedCatalogRow = (CatalogRow | typeof neurotechSupplementalCatalogRow) & {
  durationSource?: "reported" | "calculated" | "estimated";
};

const auditById = new Map<string, DurationAuditRecord>(
  openNeuroAudit.records.map((record) => [record.id, record]),
);
const literatureById = new Map<string, LiteratureAuditRecord>(
  literatureAudit.records.map((record) => [record.id, record]),
);
const independentById = new Map<string, IndependentAuditRecord>(
  independentDurationRecords.map((record) => [record.id, record]),
);

const appliedAuditRecords = openNeuroAudit.records.filter((record) => {
  const row = catalog.catalogRows.find((item) => item.id === record.id);
  return row != null && row.durationHours == null;
});

const appliedLiteratureRecords = literatureAudit.records.filter((record) => {
  const row = catalog.catalogRows.find((item) => item.id === record.id);
  return row != null && row.durationHours == null && !auditById.has(record.id) && !independentById.has(record.id);
});

const appliedIndependentRecords = independentDurationRecords.filter((record) => {
  const row = catalog.catalogRows.find((item) => item.id === record.id);
  return row != null && row.durationHours == null && !auditById.has(record.id);
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

const auditedOriginalRows = catalog.catalogRows.map((row): AuditedCatalogRow => {
  const audit = auditById.get(row.id);
  if (audit && row.durationHours == null) {
    return {
      ...row,
      durationHours: audit.durationHours,
      durationSource: audit.durationSource,
      durationBasis: auditBasis(audit),
      durationEvidence: auditEvidence(audit),
      durationEvidenceUrl: audit.sourceUrl,
      completenessScore: Math.min(row.completenessMax, row.completenessScore + 1),
    };
  }
  const independent = independentById.get(row.id);
  if (independent && row.durationHours == null) {
    return {
      ...row,
      durationHours: independent.durationHours,
      durationSource: independent.durationSource,
      durationBasis: independent.durationSource === "reported" ? "官网/论文报告·记录小时" : "独立复核计算",
      durationEvidence: independent.evidence,
      durationEvidenceUrl: independent.evidenceUrl,
      completenessScore: Math.min(row.completenessMax, row.completenessScore + 1),
    };
  }
  const literature = literatureById.get(row.id);
  if (literature && row.durationHours == null) {
    return {
      ...row,
      durationHours: literature.durationHours,
      durationSource: "reported",
      durationBasis: "论文表格报告·记录小时",
      durationEvidence: "SingLEM Table I；多通道连续记录小时，不是 single-channel hours",
      durationEvidenceUrl: literatureAudit.sourceUrl,
      completenessScore: Math.min(row.completenessMax, row.completenessScore + 1),
    };
  }
  return row.durationHours == null ? row : {
      ...row,
      durationSource: row.durationBasis?.includes("文件") ? "calculated" : "reported",
  };
});

// The immutable 563-row JSON remains untouched. A newly released 2026 corpus
// is appended in this evidence layer so it is searchable without rewriting the
// user's original catalog.
export const eegCatalogRows: AuditedCatalogRow[] = [
  ...auditedOriginalRows,
  neurotechSupplementalCatalogRow,
];

const normalizeCatalogCategory = (value: string) =>
  value.startsWith("07_General-purpose") ? "07_General-purpose_and_Multi-paradigm" : value;

// Keep the immutable JSON's labels/order while deriving counts from the
// searchable evidence-layer rows, including supplemental releases.
export const eegCategoryStats = catalog.categoryStats.map((category) => {
  const matching = eegCatalogRows.filter((row) => normalizeCatalogCategory(row.largeCategory) === category.code);
  const subcategoryCounts = new Map<string, number>();
  for (const row of matching) {
    subcategoryCounts.set(row.smallCategory, (subcategoryCounts.get(row.smallCategory) ?? 0) + 1);
  }
  return {
    ...category,
    count: matching.length,
    subcategories: [...subcategoryCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name)),
  };
});

const focusTypeById = new Map(catalog.downloadChecklist.rows.map((row) => [row.id, row.focusType]));
const diseaseRows = eegCatalogRows.filter((row) =>
  focusTypeById.get(row.id) === "疾病/临床" || row.id === neurotechSupplementalCatalogRow.id
);
const diseaseKnownRows = diseaseRows.filter((row) => row.durationHours != null);

// These five entries are documented child subsets of the included TUEG parent.
// Removing them is the only row-level overlap correction made here.
const tuegChildOverlapIds = new Set(["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"]);
const knownClinicalOverlapIds = new Set([...tuegChildOverlapIds, "EEG-0150"]);
const nonFocusOpenNeuroHours = appliedAuditRecords.reduce((sum, record) => sum + record.durationHours, 0);
const focusIds = new Set(catalog.downloadChecklist.rows.map((row) => row.id));
const nonFocusLiteratureRecords = appliedLiteratureRecords.filter((record) => !focusIds.has(record.id));
const nonFocusLiteratureHours = nonFocusLiteratureRecords.reduce((sum, record) => sum + record.durationHours, 0);
const independentNonFocusRecords = appliedIndependentRecords.filter((record) => !focusIds.has(record.id));
const independentFocusIncrementHours = independentDurationRecords
  .filter((record) => focusIds.has(record.id))
  .reduce((sum, record) => sum + record.sourceLevelIncrementHours, 0)
  + neurotechSupplementalCatalogRow.durationHours;
const rowLevelHours = eegCatalogRows.reduce((sum, row) => sum + (row.durationHours ?? 0), 0);
const rowLevelKnownUnits = eegCatalogRows.filter((row) => row.durationHours != null).length;

export const eegDurationSummary = {
  verifiedAt: independentDurationAudit.generatedAt,
  disease: {
    units: diseaseRows.length,
    knownUnits: diseaseKnownRows.length,
    rawKnownRowHours: diseaseKnownRows.reduce((sum, row) => sum + (row.durationHours ?? 0), 0),
    knownOverlapAdjustedHours: diseaseKnownRows
      .filter((row) => !knownClinicalOverlapIds.has(row.id))
      .reduce((sum, row) => sum + (row.durationHours ?? 0), 0),
    excludedKnownOverlapUnits: knownClinicalOverlapIds.size,
    excludedTuegChildUnits: tuegChildOverlapIds.size,
    excludedIcareUnits: 1,
  },
  catalog: {
    units: eegCatalogRows.length,
    preservedOriginalUnits: catalog.catalogRows.length,
    supplementalUnits: independentDurationAudit.supplementalRows.length,
    rowLevelKnownUnits,
    rowLevelMissingUnits: eegCatalogRows.length - rowLevelKnownUnits,
    rowLevelHours,
    sourceLevelKnownCoverageHours:
      catalog.neuroAtlasComparison.sourceUnion.extendedHours
      + nonFocusOpenNeuroHours
      + nonFocusLiteratureHours
      + independentDurationAudit.sourceLevelIncrementHours,
    sourceLevelFocusHours: catalog.neuroAtlasComparison.sourceUnion.extendedHours + independentFocusIncrementHours,
    sourceLevelCoveredFocusUnits: catalog.neuroAtlasComparison.focusCoverage.units + independentDurationAudit.supplementalRows.length,
    sourceLevelCoveredNonFocusUnits:
      appliedAuditRecords.length + nonFocusLiteratureRecords.length + independentNonFocusRecords.length,
  },
  openNeuro: {
    candidateUnits: appliedAuditRecords.length + openNeuroAudit.failures.length,
    knownUnits: appliedAuditRecords.length,
    unavailableUnits: openNeuroAudit.failures.length,
    calculatedUnits: appliedAuditRecords.filter((record) => record.durationSource === "calculated").length,
    estimatedUnits: appliedAuditRecords.filter((record) => record.durationSource === "estimated").length,
    addedHours: nonFocusOpenNeuroHours,
  },
  literature: {
    sourceName: "SingLEM Table I",
    sourceUrl: literatureAudit.sourceUrl,
    candidateUnits: literatureAudit.records.length,
    addedUnits: appliedLiteratureRecords.length,
    addedHours: appliedLiteratureRecords.reduce((sum, record) => sum + record.durationHours, 0),
    sourceLevelNonFocusUnits: nonFocusLiteratureRecords.length,
    sourceLevelNonFocusHours: nonFocusLiteratureHours,
  },
  independent: {
    sourceName: "官方数据库 + NeuroLM 独立复核",
    addedOriginalCatalogUnits: appliedIndependentRecords.length,
    supplementalUnits: independentDurationAudit.supplementalRows.length,
    addedRowHours:
      appliedIndependentRecords.reduce((sum, record) => sum + record.durationHours, 0)
      + neurotechSupplementalCatalogRow.durationHours,
    sourceLevelNetAddedHours: independentDurationAudit.sourceLevelIncrementHours,
    knownIcareOverlapHoursRemoved: independentDurationAudit.knownIcareOverlapHoursRemoved,
    nonFocusUnits: independentNonFocusRecords.length,
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
  const isClinical = category.code === "02";
  return {
    ...category,
    units: matching.length,
    subjectKnownUnits: category.subjectKnownUnits + (isClinical ? 1 : 0),
    subjectEntries: category.subjectEntries + (isClinical ? 4_914 : 0),
    durationKnownUnits: known.length,
    hours: known.length ? known.reduce((sum, row) => sum + (row.durationHours ?? 0), 0) : null,
  };
});
