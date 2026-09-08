import catalog from "../public/catalog-data.json";
import openNeuroAudit from "./eeg-openneuro-duration-audit.json";
import literatureAudit from "./eeg-literature-duration-audit.json";
import reconciliation from "./eeg-catalog-reconciliation.json";
import { applyCatalogClassification, applyChecklistClassification, heedbClassification } from "./eeg-classification";
import {
  independentDurationAudit,
  independentDurationRecords,
  neurotechSupplementalCatalogRow,
} from "./eeg-independent-duration-audit";

type DurationAuditRecord = (typeof openNeuroAudit.records)[number];
type LiteratureAuditRecord = (typeof literatureAudit.records)[number];
type IndependentAuditRecord = (typeof independentDurationRecords)[number];
type AuditedCatalogRow = {
  id: string; name: string; largeCategory: string; smallCategory: string; task: string | null;
  subjectsDisplay: string | number | null; channels: string | null; samplingRate: string | null;
  format: string | null; rawProcessed: string | null; access: string; url: string;
  stableId: string | null; paper: string | null; verification: string | null; isNew: boolean;
  durationHours: number | null; completenessScore: number; completenessMax: number;
  durationBasis?: string | null; durationEvidence?: string | null; durationEvidenceUrl?: string | null;
  durationSource?: "reported" | "calculated" | "estimated";
  sourcePackageId?: string; aliases?: string[]; acquisitionStatus?: string; acquisitionNote?: string;
  localFiles?: number; localBytes?: number; sourceSubjects?: number; localObservedSubjects?: number;
  localObservedRecords?: number; reference?: string; physicalUnitStatus?: string;
  preprocessingStatus?: string; validatedBatch?: string; outputRecords?: number; eventRows?: number;
  additionalSources?: { label: string; url: string; note?: string }[];
  subjectScope?: string; population?: string;
  localHours?: number;
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

const rowPatches = reconciliation.rowPatches as Record<string, Partial<AuditedCatalogRow>>;
const excludedIds = new Set(reconciliation.exclusions.map((entry) => entry.id));
const reconciledOriginalRows = catalog.catalogRows
  .filter((row) => !excludedIds.has(row.id))
  .map((row) => ({ ...row, ...(rowPatches[row.id] ?? {}) })) as AuditedCatalogRow[];

export const eegExcludedRows = reconciliation.exclusions.map((entry) => ({
  ...entry,
  original: catalog.catalogRows.find((row) => row.id === entry.id) ?? null,
}));
export const eegReconciliation = reconciliation;

const appliedAuditRecords = openNeuroAudit.records.filter((record) => {
  const row = reconciledOriginalRows.find((item) => item.id === record.id);
  return row != null && row.durationHours == null;
});

const appliedLiteratureRecords = literatureAudit.records.filter((record) => {
  const row = reconciledOriginalRows.find((item) => item.id === record.id);
  return row != null && row.durationHours == null && !auditById.has(record.id) && !independentById.has(record.id);
});

const appliedIndependentRecords = independentDurationRecords.filter((record) => {
  const row = reconciledOriginalRows.find((item) => item.id === record.id);
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

const auditedOriginalRows = reconciledOriginalRows.map((row): AuditedCatalogRow => {
  const audit = auditById.get(row.id);
  if (audit && row.durationHours == null) {
    return {
      ...row,
      durationHours: audit.durationHours,
      durationSource: audit.durationSource === 'calculated' ? 'calculated' : 'estimated',
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

// The historical 563-row JSON remains untouched. Confirmed non-EEG rows are
// removed in this evidence layer, while exclusions retain their original row
// and audit record above. A newly released 2026 corpus is then appended.
export const eegCatalogRows: AuditedCatalogRow[] = [
  ...auditedOriginalRows.map(applyCatalogClassification),
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

type ChecklistRow = Omit<(typeof catalog.downloadChecklist.rows)[number], "auditedHours" | "documentedHours"> & {
  auditedHours: number | null;
  documentedHours: number | null;
};
const focusRowPatches = reconciliation.focusRowPatches as Record<string, Record<string, unknown>>;
const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
export const eegDownloadChecklistRows = catalog.downloadChecklist.rows
  .filter((row) => !excludedIds.has(row.id) && row.id !== "EEG-0064")
  .map((row): ChecklistRow => {
    const focusPatch = focusRowPatches[row.id] ?? {};
    const catalogPatch = rowPatches[row.id] ?? {};
    const auditedHours = hasOwn(focusPatch, "downloadedHours")
      ? (focusPatch.downloadedHours as number | null)
      : row.auditedHours;
    const documentedHours = hasOwn(focusPatch, "documentedHours")
      ? (focusPatch.documentedHours as number | null)
      : catalogPatch.durationHours ?? row.documentedHours;
    const nextAction = (focusPatch.acquisitionNextAction as string | undefined) ?? row.nextAction;
    return {
      ...row,
      name: catalogPatch.name ?? row.name,
      url: catalogPatch.url ?? row.url,
      decision: (focusPatch.acquisitionDecision as string | undefined) ?? row.decision,
      priority: (focusPatch.acquisitionPriority as string | undefined)
        ?? (String(focusPatch.auditPresence ?? "").includes("PENDING") || String(focusPatch.auditPresence ?? "").includes("PROGRESS") ? "P0" : row.priority),
      serverStatus: (focusPatch.auditPresence as string | undefined) ?? row.serverStatus,
      serverCompleted: (focusPatch.serverCompleted as boolean | undefined) ?? row.serverCompleted,
      independentAcquired: (focusPatch.independentRawAcquired as boolean | undefined) ?? row.independentAcquired,
      exactDurationAudited: auditedHours != null && focusPatch.downloadedCountInTotal !== false,
      auditedHours,
      documentedHours,
      physicalSizeGB: catalogPatch.localBytes == null ? row.physicalSizeGB : catalogPatch.localBytes / 1e9,
      access: catalogPatch.access ?? row.access,
      accessLabel: catalogPatch.access === "DOWNLOAD_PUBLIC" ? "公开/登录后下载" : row.accessLabel,
      downloadMethod: row.id === "EEG-0106" ? "NEMAR CLI：nemar dataset download nm000181" : row.downloadMethod,
      nextAction,
    };
  })
  .map(applyChecklistClassification);
const focusTypeById = new Map(eegDownloadChecklistRows.map((row) => [row.id, row.focusType]));
const diseaseRows = eegCatalogRows.filter((row) =>
  focusTypeById.get(row.id) === "疾病/临床" || row.id === neurotechSupplementalCatalogRow.id
);
const diseaseKnownRows = diseaseRows.filter((row) => row.durationHours != null);

// These five entries are documented child subsets of the included TUEG parent.
// I-CARE is excluded only if its HEEDB parent is inside this same aggregation.
// The whole-catalog source union retains the conservative overlap guard.
const tuegChildOverlapIds = new Set(["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"]);
const diseaseIncludesHeedb = diseaseRows.some((row) => row.id === heedbClassification.id);
const knownClinicalOverlapIds = new Set([...tuegChildOverlapIds, ...(diseaseIncludesHeedb ? ["EEG-0150"] : [])]);
const nonFocusOpenNeuroHours = appliedAuditRecords.reduce((sum, record) => sum + record.durationHours, 0);
const focusIds = new Set(eegDownloadChecklistRows.map((row) => row.id));
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
    excludedIcareUnits: diseaseIncludesHeedb ? 1 : 0,
  },
  catalog: {
    units: eegCatalogRows.length,
    // The immutable evidence snapshot remains 563 rows.  One audited non-EEG
    // row is retained in the exclusion ledger rather than the searchable EEG
    // layer, hence 562 retained original rows.
    preservedOriginalUnits: catalog.catalogRows.length,
    retainedOriginalUnits: reconciledOriginalRows.length,
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
    sourceLevelCoveredFocusUnits: eegDownloadChecklistRows.length + independentDurationAudit.supplementalRows.length,
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
  // Transfer the original snapshot's 100,000+ lower bound. Do not mix releases
  // or substitute the different 109,178-patient v4.1 count during reclassification.
  const heedbTransfer = isClinical ? -1 : category.code === "03" ? 1 : 0;
  return {
    ...category,
    units: matching.length,
    subjectKnownUnits: category.subjectKnownUnits + (isClinical ? 1 : 0) + heedbTransfer,
    subjectEntries: category.subjectEntries + (isClinical ? 4_914 : 0) + heedbTransfer * 100_000,
    durationKnownUnits: known.length,
    hours: known.length ? known.reduce((sum, row) => sum + (row.durationHours ?? 0), 0) : null,
  };
});
