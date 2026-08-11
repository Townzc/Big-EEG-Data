import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");
const finalPath = path.join(siteRoot, "work_spreadsheet", "final_catalog_data.json");
const publicPath = path.join(siteRoot, "public", "catalog-data.json");

const data = JSON.parse(fs.readFileSync(finalPath, "utf8"));
const publicData = JSON.parse(fs.readFileSync(publicPath, "utf8"));

const H = {
  id: "Unique ID",
  large: "大类目录",
  small: "小类目录",
  name: "规范数据集名称",
  alias: "合并别名",
  stable: "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）",
  access: "下载状态",
  url: "下载/申请入口",
  task: "任务",
  subjects: "受试者数",
  channels: "通道数",
  rate: "采样率",
  format: "格式",
  raw: "Raw/Processed",
  license: "许可与申请说明",
  paper: "论文/作者",
  path: "建议相对路径",
  verification: "核验结论",
  duration: "Recording duration (s)",
  scans: "Number of scans",
};

const byId = new Map(data.rows.map((row) => [row[H.id], row]));

Object.assign(byId.get("EEG-0150"), {
  [H.large]: "02_Healthcare_and_Disease",
  [H.small]: "Critical_Care_and_Coma",
  [H.stable]: "BDSP:I-CARE:v2.0 | PhysioNet:i-care | PMID:37693458",
  [H.url]: "https://bdsp.io/content/bdsp-icare/2.0/",
  [H.subjects]: "1,020 patients (607 training + 107 validation + 306 test)",
  [H.license]: "Full I-CARE v2.0 corpus; follow current BDSP/PhysioNet terms. Public challenge release and complete consortium scope must be distinguished.",
  [H.paper]: "Amorim et al. (2023), I-CARE consortium; REVE Appendix B",
  [H.path]: "02_Healthcare_and_Disease/Critical_Care_and_Coma/I-CARE",
  [H.verification]: "分类修正：心脏骤停后昏迷 ICU 连续 EEG 属临床疾病/重症监护；56,676 h 为完整 consortium 连续 EEG 文献口径，不等于本地已下载文件审计时长。",
  [H.duration]: 204033600,
  [H.scans]: 1020,
});

Object.assign(byId.get("EEG-0345"), {
  [H.name]: "HBN-EEG Release 1",
  [H.alias]: "Healthy Brain Network EEG; ds005505",
  [H.stable]: "OpenNeuro:ds005505 | DOI:10.18112/openneuro.ds005505.v1.0.1",
  [H.url]: "https://openneuro.org/datasets/ds005505",
  [H.subjects]: "136",
  [H.channels]: "129",
  [H.rate]: "500 Hz",
  [H.format]: "BIDS EEG / EEGLAB SET",
  [H.raw]: "BIDS-organized EEG release",
  [H.license]: "CC BY-SA 4.0",
  [H.path]: "08_Health_and_Population/Developmental_Clinical_Cohort/HBN_EEG_R1_ds005505",
  [H.verification]: "按 OpenNeuro 独立 release 去重；136 subjects、1,342 recordings、117.5 h。HBN 是广泛发育/精神健康表型队列，不等同于单一确诊疾病队列。",
  [H.duration]: 423000,
  [H.scans]: 1342,
});

const hbnReleases = [
  ["EEG-0594", 2, "ds005506", 150, 1405, 127.5],
  ["EEG-0595", 3, "ds005507", 184, 1812, 158.8],
  ["EEG-0596", 4, "ds005508", 324, 3342, 261.8],
  ["EEG-0597", 5, "ds005509", 330, 3326, 255.3],
  ["EEG-0598", 6, "ds005510", 135, 1227, 103.5],
  ["EEG-0599", 7, "ds005511", 381, 3100, null],
  ["EEG-0600", 8, "ds005512", 257, 2320, 179.1],
  ["EEG-0601", 9, "ds005514", 295, 2885, 210.8],
];

const addedRows = hbnReleases.map(([id, release, accession, subjects, recordings, hours]) => ({
  [H.id]: id,
  [H.large]: "08_Health_and_Population",
  [H.small]: "Developmental_Clinical_Cohort",
  [H.name]: `HBN-EEG Release ${release}`,
  [H.alias]: `Healthy Brain Network EEG; ${accession}`,
  [H.stable]: `OpenNeuro:${accession} | DOI:10.18112/openneuro.${accession}.v1.0.1`,
  [H.access]: "DOWNLOAD_PUBLIC",
  [H.url]: `https://openneuro.org/datasets/${accession}`,
  [H.task]: "Multi-task developmental EEG (rest, visual/cognitive tasks and behavioral phenotyping; release-dependent)",
  [H.subjects]: String(subjects),
  [H.channels]: "129",
  [H.rate]: "500 Hz",
  [H.format]: "BIDS EEG / EEGLAB SET",
  [H.raw]: "BIDS-organized EEG release",
  [H.license]: "CC BY-SA 4.0",
  [H.paper]: "Shirazi et al., HBN-EEG; REVE Appendix B",
  [H.path]: `08_Health_and_Population/Developmental_Clinical_Cohort/HBN_EEG_R${release}_${accession}`,
  [H.verification]: hours == null
    ? `${subjects} subjects、${recordings.toLocaleString("en-US")} recordings；官方 release 可核验，但未把未公开的总时长估算成精确值。`
    : `${subjects} subjects、${recordings.toLocaleString("en-US")} recordings、${hours} h；按 OpenNeuro 独立 release 去重。`,
  "fMRI TR (s)": null,
  [H.duration]: hours == null ? null : hours * 3600,
  [H.scans]: recordings,
}));

for (const row of addedRows) {
  if (!byId.has(row[H.id])) {
    const normalized = Object.fromEntries(data.headers.map((header) => [header, row[header] ?? null]));
    data.rows.push(normalized);
    byId.set(row[H.id], normalized);
  }
}

const additionsById = new Map(data.additions.map((row) => [row[H.id], row]));
for (const row of addedRows) {
  if (!additionsById.has(row[H.id])) {
    data.additions.push(Object.fromEntries(data.headers.map((header) => [header, row[header] ?? null])));
  }
}

const missingPattern = /^(?:\s*|—|-|n\/?a|na|null|none|unknown|not specified|not reported|未给出|未核验|待.*审计|见官方|various)$/i;
function hasValue(value) {
  if (value == null) return false;
  const text = String(value).trim();
  return text.length > 0 && !missingPattern.test(text);
}

function durationHours(row) {
  const seconds = Number(row[H.duration]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds / 3600 : null;
}

function completeness(row) {
  const fields = [H.name, H.large, H.small, H.subjects, H.channels, H.rate, H.format, H.raw, H.access, H.url, H.stable, H.paper, H.task];
  const base = fields.reduce((sum, field) => sum + (hasValue(row[field]) ? 1 : 0), 0);
  return base + (durationHours(row) != null ? 2 : 0);
}

data.rows.sort((a, b) =>
  completeness(b) - completeness(a)
  || Number(durationHours(b) != null) - Number(durationHours(a) != null)
  || String(a[H.id]).localeCompare(String(b[H.id]), "en", { numeric: true })
);

const compactFromRow = (row) => ({
  id: row[H.id],
  name: row[H.name],
  largeCategory: row[H.large],
  smallCategory: row[H.small],
  task: row[H.task],
  subjectsDisplay: row[H.subjects],
  channels: row[H.channels],
  samplingRate: row[H.rate],
  format: row[H.format],
  rawProcessed: row[H.raw],
  access: row[H.access],
  url: String(row[H.url] ?? "").match(/https?:\/\/[^\s)\]]+/)?.[0] ?? "",
  stableId: row[H.stable],
  paper: row[H.paper],
  verification: row[H.verification],
  isNew: String(row[H.id]) >= "EEG-0583",
  durationHours: durationHours(row),
  completenessScore: completeness(row),
  completenessMax: 15,
});

const compactRows = data.rows.map(compactFromRow);

const focusById = new Map(data.focusRows.map((row) => [row.id, row]));
const icareFocus = focusById.get("EEG-0150") ?? {
  id: "EEG-0150",
  name: "I-CARE",
  task: byId.get("EEG-0150")[H.task],
  observedSubject: null,
  channels: byId.get("EEG-0150")[H.channels],
  samplingRate: byId.get("EEG-0150")[H.rate],
  format: byId.get("EEG-0150")[H.format],
  access: byId.get("EEG-0150")[H.access],
  isNew: false,
  downloadedCountInTotal: false,
  downloadedNote: "未纳入本地已下载文件审计；文献总时长与本地审计口径分列",
  downloadedHours: null,
  auditPresence: "NOT_AUDITED",
};
Object.assign(icareFocus, {
  focusType: "疾病/临床",
  focusSubtype: "重症监护与昏迷",
  largeCategory: "02_Healthcare_and_Disease",
  smallCategory: "Critical_Care_and_Coma",
  subjectsDisplay: "1,020 patients (607 training + 107 validation + 306 test)",
  subjectNumeric: 1020,
  url: "https://bdsp.io/content/bdsp-icare/2.0/",
  stableId: "BDSP:I-CARE:v2.0 | PhysioNet:i-care | PMID:37693458",
  documentedHours: 56676,
  durationEvidence: "I-CARE consortium paper; complete continuous EEG corpus",
  verification: byId.get("EEG-0150")[H.verification],
});
focusById.set("EEG-0150", icareFocus);
Object.assign(focusById.get("EEG-0345"), {
  name: "HBN-EEG Release 1",
  subjectsDisplay: "136",
  subjectNumeric: 136,
  documentedHours: 117.5,
  durationEvidence: "EEGDash/OpenNeuro release metadata",
  url: "https://openneuro.org/datasets/ds005505",
  stableId: "OpenNeuro:ds005505 | DOI:10.18112/openneuro.ds005505.v1.0.1",
  channels: "129",
  format: "BIDS EEG / EEGLAB SET",
  verification: byId.get("EEG-0345")[H.verification],
});

for (const row of addedRows) {
  focusById.set(row[H.id], {
    id: row[H.id],
    name: row[H.name],
    focusType: "健康/人群",
    focusSubtype: "Developmental_Clinical_Cohort",
    largeCategory: row[H.large],
    smallCategory: row[H.small],
    task: row[H.task],
    subjectsDisplay: row[H.subjects],
    subjectNumeric: Number(row[H.subjects]),
    observedSubject: null,
    channels: row[H.channels],
    samplingRate: row[H.rate],
    format: row[H.format],
    access: row[H.access],
    url: row[H.url],
    stableId: row[H.stable],
    isNew: true,
    downloadedCountInTotal: false,
    downloadedNote: "尚未纳入本地已下载文件审计",
    downloadedHours: null,
    documentedHours: durationHours(row),
    durationEvidence: durationHours(row) == null ? "官方未给可直接相加的总时长" : "EEGDash/OpenNeuro release metadata",
    auditPresence: "NOT_AUDITED",
    verification: row[H.verification],
  });
}
data.focusRows = [...focusById.values()].sort((a, b) => String(a.id).localeCompare(String(b.id), "en", { numeric: true }));

const categoryLabels = {
  "01_Signal_Reliability": "信号可靠性",
  "02_Healthcare_and_Disease": "医疗与疾病",
  "03_Consciousness_and_State": "意识与状态",
  "04_Cognition_and_Emotion": "认知与情感",
  "05_Naturalistic_Stimulus_Decoding": "自然刺激解码",
  "06_Motor_and_Interaction": "运动与交互",
  "07_General-purpose": "通用与多范式",
  "07_General-purpose_and_Multi-paradigm": "通用与多范式",
  "08_Health_and_Population": "健康与人群",
};
const categoryMap = new Map();
for (const row of compactRows) {
  const rawLarge = row.largeCategory || "Unclassified";
  const large = rawLarge.startsWith("07_General-purpose") ? "07_General-purpose_and_Multi-paradigm" : rawLarge;
  if (!categoryMap.has(large)) categoryMap.set(large, new Map());
  const small = row.smallCategory || "Unclassified";
  categoryMap.get(large).set(small, (categoryMap.get(large).get(small) ?? 0) + 1);
}
const categoryStats = [...categoryMap.entries()]
  .map(([code, smallMap]) => ({
    code,
    label: categoryLabels[code] ?? code,
    count: [...smallMap.values()].reduce((a, b) => a + b, 0),
    subcategories: [...smallMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

const reveComparison = {
  paperHeadline: { sources: 92, subjects: 24274, sessions: 150833, hours: 61415, rawTerabytes: 19, processedTerabytes: 6 },
  appendixExplicitSources: 89,
  appendixCoveredAfterUpdate: 89,
  appendixAddedThisUpdate: 8,
  appendixNote: "REVE Table 7 reports 92 datasets, while Appendix B explicitly enumerates 89 unique source names/IDs. The catalog covers all 89 explicit names after alias resolution and eight HBN release additions.",
  currentDownloadedAuditHours: publicData.metrics.currentRaw.hours,
  differenceHours: 61415 - publicData.metrics.currentRaw.hours,
  notDirectlyComparable: true,
  reason: "The 43.6k-hour figure is a local downloaded-file audit. REVE's 61,415 hours are an assembled pretraining corpus after its inclusion/exclusion pipeline; many sources already in this catalog had no locally audited duration. Our audit also includes SeizeIT2 (~11.6k h), which is not named in REVE Appendix B.",
  composition: [
    { platform: "TUH", subjects: 14987, hours: 26847, datasets: 1 },
    { platform: "PhysioNet", subjects: 607, hours: 22707, datasets: 2 },
    { platform: "OpenNeuro", subjects: 4153, hours: 10194, datasets: 56 },
    { platform: "MOABB", subjects: 711, hours: 384, datasets: 27 },
    { platform: "Other", subjects: 3802, hours: 1250, datasets: 6 },
  ],
  keyDifferences: [
    { item: "I-CARE / PhysioNet", note: "REVE counts it inside the 22,707 h PhysioNet subtotal; our prior 43.6k h did not count I-CARE because it was not in the local downloaded-file audit." },
    { item: "OpenNeuro", note: "REVE reports 10,194 h. Most accessions were already cataloged, but many lacked a locally verified duration and therefore contributed zero to the local audit total." },
    { item: "HBN releases", note: "Eight missing OpenNeuro releases (ds005506–ds005512, excluding gaps, plus ds005514) are now added; Release 7 duration remains unknown rather than estimated." },
    { item: "SeizeIT2", note: "Our local audit includes ~11,626 h, but this source is not explicitly named by REVE, partially offsetting REVE-only hours." },
  ],
};

const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
const known = (rows, key) => rows.filter((row) => Number.isFinite(row[key])).length;
const newFocus = data.focusRows.filter((row) => row.isNew);
const newDisease = newFocus.filter((row) => row.focusType === "疾病/临床");
const newHealth = newFocus.filter((row) => row.focusType === "健康/人群");
data.metrics.generatedAt = "2026-08-11";
data.metrics.finalUniqueUnits = data.rows.length;
data.metrics.newlyAddedUnits = data.additions.length;
data.metrics.focusUnitCount = data.focusRows.length;
data.metrics.additions = {
  units: newFocus.length,
  subjectRowCount: sum(newFocus, "subjectNumeric"),
  diseaseSubjectRowCount: sum(newDisease, "subjectNumeric"),
  healthSubjectRowCount: sum(newHealth, "subjectNumeric"),
  documentedHours: sum(newFocus, "documentedHours"),
  diseaseDocumentedHours: sum(newDisease, "documentedHours"),
  healthDocumentedHours: sum(newHealth, "documentedHours"),
  durationKnownUnits: known(newFocus, "documentedHours"),
};
data.metrics.projected = {
  subjectRowCount: data.metrics.currentRaw.subjectRowCount + data.metrics.additions.subjectRowCount,
  diseaseSubjectRowCount: data.metrics.currentRaw.diseaseSubjectRowCount + data.metrics.additions.diseaseSubjectRowCount,
  healthSubjectRowCount: data.metrics.currentRaw.healthSubjectRowCount + data.metrics.additions.healthSubjectRowCount,
  durationLowerBoundHours: data.metrics.currentRaw.hours + data.metrics.additions.documentedHours,
  diseaseDurationLowerBoundHours: data.metrics.currentRaw.diseaseHours + data.metrics.additions.diseaseDocumentedHours,
  healthDurationLowerBoundHours: data.metrics.currentRaw.healthHours + data.metrics.additions.healthDocumentedHours,
};

data.categoryStats = categoryStats;
data.reveComparison = reveComparison;
data.sources.push(
  ["REVE paper / Appendix B", "https://papers.neurips.cc/paper_files/paper/2025/file/20a917f77773ac0fa8bea2bdd6606b66-Paper-Conference.pdf", "61,415 h、24,274 subjects、150,833 sessions；Table 7 与 Appendix B 来源清单。"],
  ["MOABB dataset summary", "https://moabb.neurotechx.com/docs/dataset_summary.html", "用于 BNCI/Cho/OpenBMI 等旧名称与当前目录名称的别名解析，避免重复新增。"],
  ["I-CARE consortium paper", "https://pubmed.ncbi.nlm.nih.gov/37693458/", "完整 consortium：1,020 patients、56,676 h continuous EEG。"],
  ["I-CARE v2.0", "https://bdsp.io/content/bdsp-icare/2.0/", "完整 1,020-patient release；与 607-person public training partition 分开记录。"],
  ["HBN-EEG Release 1", "https://huggingface.co/datasets/EEGDash/ds005505", "136 subjects、1,342 recordings、117.5 h。"],
  ["HBN-EEG releases", "https://eegdash.org/datasets", "ds005506–ds005514 的 release-level subjects/recordings/duration metadata。"],
);

data.worksheetGuide = data.worksheetGuide
  .map(([sheet, description]) => sheet === "最终唯一下载清单"
    ? [sheet, `完整 ${data.rows.length} 行唯一下载单元主表；默认按资料完整度优先`]
    : sheet === "本轮新增_11"
      ? ["本轮新增_19", "2026-08-10/11 从 EEG 论文、官网与 REVE Appendix B 补入的 19 个独立下载单元"]
    : [sheet, description])
  .filter(([sheet]) => !["分类统计", "REVE对照_92"].includes(sheet));
data.worksheetGuide.push(
  ["分类统计", "按大类与小类统计完整目录数量；网页筛选与此表使用同一口径"],
  ["REVE对照_92", "REVE 61,415 h 组成、Appendix B 明示来源覆盖、别名与本目录口径差异"],
);

Object.assign(publicData, {
  metrics: data.metrics,
  catalogRows: compactRows,
  focusRows: data.focusRows,
  additions: data.additions,
  sources: data.sources,
  worksheetGuide: data.worksheetGuide,
  categoryStats,
  reveComparison,
});

fs.writeFileSync(finalPath, JSON.stringify(data, null, 2));
fs.writeFileSync(publicPath, JSON.stringify(publicData));

console.log(JSON.stringify({
  rows: data.rows.length,
  focusRows: data.focusRows.length,
  additions: data.additions.length,
  categoryCounts: Object.fromEntries(categoryStats.map((item) => [item.code, item.count])),
  currentDownloadedHours: data.metrics.currentRaw.hours,
  reveHours: reveComparison.paperHeadline.hours,
  documentedNewHours: data.metrics.additions.documentedHours,
}, null, 2));
