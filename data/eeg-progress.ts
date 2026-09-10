import { currentCatalog } from "./current-catalog";
import { eegDownloadChecklistRows, eegReconciliation } from "./eeg-duration";
import { summarize } from "../lib/catalog";

const categoryDefinitions = [
  { code: "01", label: "信号可靠性", category: "信号可靠性" },
  { code: "02", label: "医疗与疾病", category: "医疗与疾病" },
  { code: "03", label: "意识与状态", category: "意识与状态" },
  { code: "04", label: "认知与情感", category: "认知与情感" },
  { code: "05", label: "自然刺激解码", category: "自然刺激解码" },
  { code: "06", label: "运动与交互", category: "运动与交互" },
  { code: "07", label: "通用与多范式", category: "通用与多范式" },
  { code: "08", label: "健康与人群", category: "健康与人群" },
] as const;

const eegItems = currentCatalog
  .filter((detail) => detail.item.modality === "eeg")
  .map((detail) => detail.item);
const deduplicated = summarize(eegItems);
const rowSubjects = eegItems.filter((item) => item.subjects != null);
const rowHours = eegItems.filter((item) => item.hours != null);
const countDecision = (...decisions: string[]) => eegDownloadChecklistRows
  .filter((row) => decisions.includes(row.decision)).length;
const focusExactOverlapIds = new Set(["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"]);
const focusRelationAwareExactRows = eegDownloadChecklistRows
  .filter((row) => row.exactDurationAudited && !focusExactOverlapIds.has(row.id));
const preprocessing = eegReconciliation.preprocessing;

export const eegProgress = {
  snapshotDate: eegReconciliation.reconciledAt,
  catalog: {
    units: eegItems.length,
    families: deduplicated.families,
    acquisitionPackages: deduplicated.acquisitionPackages,
    historicalSnapshotUnits: 563,
    retainedHistoricalEegRows: 563 - eegReconciliation.exclusions.length,
    evidenceSupplementalUnits: 1 + eegReconciliation.supplementalRows.length,
    revisionAddedUnits: 6,
    mergedAliasUnits: eegReconciliation.aliases.length,
    excludedNonEegUnits: eegReconciliation.exclusions.length,
    includedAfterRelationDedup: deduplicated.included,
    subjectIncludedAfterRelationDedup: deduplicated.subjectIncluded,
    subjectsAfterRelationDedup: deduplicated.subjects,
    subjectKnownAfterRelationDedup: deduplicated.knownSubjects,
    subjectMissingAfterRelationDedup: deduplicated.missingSubjects,
    hoursAfterRelationDedup: deduplicated.hours,
    durationKnownAfterRelationDedup: deduplicated.knownHours,
    durationMissingAfterRelationDedup: deduplicated.missingHours,
    rawSubjectKnownUnits: rowSubjects.length,
    rawSubjectEntrySum: rowSubjects.reduce((sum, item) => sum + (item.subjects ?? 0), 0),
    rawDurationKnownUnits: rowHours.length,
    rawDurationRowSum: rowHours.reduce((sum, item) => sum + (item.hours ?? 0), 0),
    focusUnits: eegDownloadChecklistRows.length,
    nonFocusUnits: eegItems.length - eegDownloadChecklistRows.length,
    publicUnits: deduplicated.public,
    note: "Current searchable metrics are derived from the revision-aware catalog. Relation-aware totals suppress documented parent/child subsets; raw row sums are retained as an audit cross-check and must not be presented as globally unique people or independent recording hours.",
  },
  categories: categoryDefinitions.map(({ code, label, category }) => {
    const rows = eegItems.filter((item) => item.category === category);
    const subjectRows = rows.filter((item) => item.subjects != null);
    const durationRows = rows.filter((item) => item.hours != null);
    return {
      code,
      label,
      units: rows.length,
      subjectKnownUnits: subjectRows.length,
      subjectEntries: subjectRows.reduce((sum, item) => sum + (item.subjects ?? 0), 0),
      durationKnownUnits: durationRows.length,
      hours: durationRows.reduce((sum, item) => sum + (item.hours ?? 0), 0),
    };
  }),
  acquisition: {
    catalogUnits: eegItems.length,
    acquisitionPackages: deduplicated.acquisitionPackages,
    legacyCatalogUnitsWithCompletionEvidence: 273,
    focusExecutionUnits: eegDownloadChecklistRows.length,
    focusServerCompletedUnits: eegDownloadChecklistRows.filter((row) => row.serverCompleted).length,
    focusIndependentRawUnits: eegDownloadChecklistRows.filter((row) => row.independentAcquired).length,
    focusExactDurationAuditUnits: eegDownloadChecklistRows.filter((row) => row.exactDurationAudited).length,
    focusExactDurationAuditHours: eegDownloadChecklistRows
      .filter((row) => row.exactDurationAudited)
      .reduce((sum, row) => sum + (row.auditedHours ?? 0), 0),
    focusRelationAwareExactDurationAuditUnits: focusRelationAwareExactRows.length,
    focusRelationAwareExactDurationAuditHours: focusRelationAwareExactRows
      .reduce((sum, row) => sum + (row.auditedHours ?? 0), 0),
    focusAppliedWaitingUnits: countDecision("已申请·等待访问"),
    focusAppliedWaitingWorkflowsApprox: 3,
    focusNotYetAppliedUnits: countDecision("需要申请/登录"),
    focusDirectDownloadUnits: countDecision("可直接下载"),
    focusLoginDownloadUnits: countDecision("登录后可下载"),
    focusManualReviewUnits: countDecision("公开入口·需人工复核"),
    focusDiscardedUnits: countDecision("舍弃"),
    gpfsFreeBytes: eegReconciliation.storageSnapshot.gpfsFreeBytes,
    gpfsFreeTiB: eegReconciliation.storageSnapshot.gpfsFreeBytes / 2 ** 40,
    retainedFailedStagingApproxGB: eegReconciliation.storageSnapshot.retainedFailedStagingApproxGB,
    activeTasks: eegReconciliation.activeAcquisitionTasks,
    note: "The 273 value is a retained historical completion-evidence audit. Current focus counts are recomputed from the reconciled checklist; a download marker is not a signal audit or preprocessing completion result. The 19 applied/waiting rows correspond to about three access workflows (one BDSP credential/application covers HEEDB plus 16 MORGOTH logical rows, plus MESA and CAUEEG). Exact-audit workload retains five TUEG child rows; relation-aware totals exclude them.",
  },
  preprocessing: {
    ...preprocessing,
    completionPercent: preprocessing.strictCompleteTargets / preprocessing.effectiveTargets * 100,
    derivativeTiB: preprocessing.derivativeBytes / 2 ** 40,
    note: "Subject entries are adapter-level entries, not globally unique people. Strict totals exclude smoke outputs, partial shards, confirmed duplicate batch80 and processed-only/non-EEG targets from the raw-continuous KPI.",
  },
  methodology: [
    "先核对数据身份、来源完整性、物理单位、参考、通道、事件和精确重复项；证据不足时保持门禁，不猜单位或标签。",
    "只对真正的 raw continuous EEG 做有依据的 0.1–75 Hz 滤波和 50/60 Hz notch；已处理或分段数据保留发布者 provenance，不重复整套滤波。",
    "统一为物理微伏并重采样到 200 Hz，以 float32 x_uV/100 保存；同时保留信号、事件、哈希、划分和来源 JSON。",
    "按 subject 划分并隔离重复数据；临床异常振幅只标记、不删除。训练时再切成 1 秒、200 点 patch。",
  ],
} as const;
