import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");
const finalPath = path.join(siteRoot, "work_spreadsheet", "final_catalog_data.json");
const publicPath = path.join(siteRoot, "public", "catalog-data.json");
const manifestPath = path.join(siteRoot, "data", "neuroatlas_gap_manifest.csv");

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

const newRows = [
  {
    [H.id]: "EEG-0602",
    [H.large]: "02_Healthcare_and_Disease",
    [H.small]: "Epilepsy_and_Seizure_Monitoring",
    [H.name]: "SeizeIT1",
    [H.alias]: "KU Leuven presurgical scalp EEG; SeizeIT 1",
    [H.stable]: "KU Leuven RDR:P5Q0OJ | DOI:10.48804/P5Q0OJ",
    [H.access]: "DOWNLOAD_UNAVAILABLE",
    [H.url]: "https://rdr.kuleuven.be/dataset.xhtml?persistentId=doi:10.48804/P5Q0OJ",
    [H.task]: "Adult presurgical seizure detection with scalp EEG, behind-the-ear EEG and ECG",
    [H.subjects]: "42 benchmark subjects (82 patients recorded overall)",
    [H.channels]: "24 scalp EEG + 4 behind-the-ear EEG + ECG",
    [H.rate]: "250 Hz",
    [H.format]: "EDF + TSV annotations",
    [H.raw]: "Raw continuous EEG + clinician seizure annotations",
    [H.license]: "Current source notice: no longer shared because the ethics approval expired; use SeizeIT2 as the obtainable alternative.",
    [H.paper]: "NeuroAtlas (2026); Chatzichristos & Claro Bhagubai, SeizeIT1",
    [H.path]: "02_Healthcare_and_Disease/Epilepsy_and_Seizure_Monitoring/SeizeIT1",
    [H.verification]: "NeuroAtlas Figure 2 labels 5.9k h; the current SzCORE public benchmark lists 4,211 h for 42 subjects. The hour field stays non-exact in the master row and both scopes are preserved in the comparison sheet.",
    "fMRI TR (s)": null,
    [H.duration]: null,
    [H.scans]: null,
  },
  {
    [H.id]: "EEG-0603",
    [H.large]: "02_Healthcare_and_Disease",
    [H.small]: "Clinical_Sleep_Disorders",
    [H.name]: "DCSM Sleep Staging Dataset",
    [H.alias]: "Danish Center for Sleep Medicine; DCSM",
    [H.stable]: "ERDA:db553715ecbe1f3ac66c1dc569826eef",
    [H.access]: "DOWNLOAD_PUBLIC",
    [H.url]: "https://erda.ku.dk/public/archives/db553715ecbe1f3ac66c1dc569826eef/published-archive.html",
    [H.task]: "Clinical sleep staging in patients evaluated for non-specific sleep-related disorders",
    [H.subjects]: "255 patients / 255 overnight PSG recordings",
    [H.channels]: "PSG including EEG, EOG and EMG",
    [H.rate]: "256 Hz (EEG/EOG)",
    [H.format]: "EDF + HDF5 + IDS hypnograms",
    [H.raw]: "Raw PSG + AASM hypnograms",
    [H.license]: "Public archive; single ZIP or U-Time fetch command",
    [H.paper]: "Perslev et al. (2021), U-Sleep; DCSM data archive; NeuroAtlas",
    [H.path]: "02_Healthcare_and_Disease/Clinical_Sleep_Disorders/DCSM",
    [H.verification]: "Official archive confirms 255 anonymized overnight clinical PSGs. No official total-hour figure was found, so duration is left blank.",
    "fMRI TR (s)": null,
    [H.duration]: null,
    [H.scans]: 255,
  },
  {
    [H.id]: "EEG-0604",
    [H.large]: "02_Healthcare_and_Disease",
    [H.small]: "Sleep_and_Cognitive_Impairment",
    [H.name]: "George B. Moody PhysioNet Challenge 2026 (PN2026)",
    [H.alias]: "PhysioNet Challenge 2026; Human Sleep Project curated subset",
    [H.stable]: "HSP DOI:10.60508/qjbv-hg78 | Kaggle:physionet/physionetchallenge2026datalargeversion",
    [H.access]: "DOWNLOAD_PUBLIC",
    [H.url]: "https://moody-challenge.physionet.org/2026/",
    [H.task]: "Sleep staging and clinical-event annotation; future cognitive-impairment screening",
    [H.subjects]: "Unique subjects not stated; 6,600 public large-training PSG records",
    [H.channels]: "Variable PSG montage including EEG/EOG/EMG/ECG/respiration",
    [H.rate]: "Recording/channel dependent",
    [H.format]: "EDF + CSV metadata/annotations",
    [H.raw]: "Raw PSG + human and algorithmic annotations",
    [H.license]: "Public large/small training sets on Kaggle; validation/test remain hidden during the 2026 Challenge.",
    [H.paper]: "George B. Moody PhysioNet Challenge 2026; Human Sleep Project; NeuroAtlas",
    [H.path]: "02_Healthcare_and_Disease/Sleep_and_Cognitive_Impairment/PN2026",
    [H.verification]: "Official page lists 5,139 + 319 + 1,142 = 6,600 public large-training PSG records (1.2 TiB). Hidden validation/test are not counted as downloadable records.",
    "fMRI TR (s)": null,
    [H.duration]: null,
    [H.scans]: 6600,
  },
  {
    [H.id]: "EEG-0605",
    [H.large]: "02_Healthcare_and_Disease",
    [H.small]: "Clinical_Sleep_Disorders",
    [H.name]: "STAGES",
    [H.alias]: "Stanford Technology Analytics and Genomics in Sleep",
    [H.stable]: "NSRR:stages | DOI:10.25822/me0d-xs45",
    [H.access]: "DOWNLOAD_APPLICATION_REQUIRED",
    [H.url]: "https://sleepdata.org/datasets/stages",
    [H.task]: "Clinical sleep staging, sleep-disorder phenotyping and brain-age evaluation",
    [H.subjects]: "1,500 adult/adolescent patients",
    [H.channels]: "Clinical PSG including EEG/EOG/EMG/ECG/respiration",
    [H.rate]: "Site/recording dependent",
    [H.format]: "EDF + annotations + phenotype tables",
    [H.raw]: "Raw clinical PSG + questionnaire/phenotype data",
    [H.license]: "NSRR account, approved data request and data-use agreement; available for non-commercial and commercial use under the stated terms.",
    [H.paper]: "STAGES cohort; NSRR; NeuroAtlas",
    [H.path]: "02_Healthcare_and_Disease/Clinical_Sleep_Disorders/STAGES",
    [H.verification]: "Official NSRR page reports 1,500 patients and flags four duplicate EDF pairs; the master duration remains blank pending EDF-header audit.",
    "fMRI TR (s)": null,
    [H.duration]: null,
    [H.scans]: 1500,
  },
  {
    [H.id]: "EEG-0606",
    [H.large]: "02_Healthcare_and_Disease",
    [H.small]: "Sleep_Disordered_Breathing",
    [H.name]: "UCDDB Sleep Apnea Database",
    [H.alias]: "St. Vincent's University Hospital / University College Dublin Sleep Apnea Database",
    [H.stable]: "PhysioNet:ucddb:v1.0.0 | DOI:10.13026/C26C7D",
    [H.access]: "DOWNLOAD_PUBLIC",
    [H.url]: "https://physionet.org/content/ucddb/1.0.0/",
    [H.task]: "Sleep staging and respiratory-event detection in suspected sleep-disordered breathing",
    [H.subjects]: "25 adults / 25 full overnight PSG recordings",
    [H.channels]: "2 EEG + EOG/EMG/ECG/respiration/SpO2 and other PSG channels",
    [H.rate]: "See EDF headers",
    [H.format]: "EDF (.rec) + TXT annotations",
    [H.raw]: "Raw overnight PSG + sleep-stage/respiratory-event annotations",
    [H.license]: "Open Data Commons Attribution License v1.0",
    [H.paper]: "UCDDB / PhysioNet; NeuroAtlas",
    [H.path]: "02_Healthcare_and_Disease/Sleep_Disordered_Breathing/UCDDB",
    [H.verification]: "Official PhysioNet page confirms 25 subjects and 25 full overnight PSGs. Total hours are not inferred from file size or an assumed night length.",
    "fMRI TR (s)": null,
    [H.duration]: null,
    [H.scans]: 25,
  },
  {
    [H.id]: "EEG-0607",
    [H.large]: "04_Cognition_and_Emotion",
    [H.small]: "Cognitive_Workload_and_Arithmetic",
    [H.name]: "ArithmeticTask (Rodriguez-Larios & Alaerts)",
    [H.alias]: "Alpha-theta harmonic relationships arithmetic/rest/breath-focus EEG",
    [H.stable]: "OSF:gh6q3 | DOI:10.1523/JNEUROSCI.2919-18.2019",
    [H.access]: "DOWNLOAD_PUBLIC",
    [H.url]: "https://osf.io/gh6q3/",
    [H.task]: "Arithmetic, rest and breath-focus cognitive-state decoding",
    [H.subjects]: "51 included participants (54 recruited across two experiments)",
    [H.channels]: "21 EEG electrodes",
    [H.rate]: "256 Hz",
    [H.format]: "Raw EEG files from OSF; analysis in MATLAB/Letswave",
    [H.raw]: "Raw continuous EEG",
    [H.license]: "Public OSF data; follow the project terms and cite the source paper",
    [H.paper]: "Rodriguez-Larios & Alaerts (2019), Journal of Neuroscience; NeuroAtlas",
    [H.path]: "04_Cognition_and_Emotion/Cognitive_Workload_and_Arithmetic/ArithmeticTask",
    [H.verification]: "Healthy cognitive experiment, not a disease cohort. The paper confirms 51 included participants, 21 electrodes and 256 Hz; no total-hour number is invented.",
    "fMRI TR (s)": null,
    [H.duration]: null,
    [H.scans]: 51,
  },
];

const byId = new Map(data.rows.map((row) => [row[H.id], row]));
for (const row of newRows) {
  if (byId.has(row[H.id])) continue;
  const normalized = Object.fromEntries(data.headers.map((header) => [header, row[header] ?? null]));
  data.rows.push(normalized);
  byId.set(row[H.id], normalized);
}

const additionsById = new Map(data.additions.map((row) => [row[H.id], row]));
for (const row of newRows) {
  if (!additionsById.has(row[H.id])) {
    data.additions.push(Object.fromEntries(data.headers.map((header) => [header, row[header] ?? null])));
  }
}

const aliasUpdates = {
  "EEG-0005": "Helsinki neonatal EEG; neonatal seizure annotations",
  "EEG-0116": "Cleveland Family Study; CFS",
  "EEG-0122": "Dreem Open Datasets; DOD-H/DOD-O",
  "EEG-0355": "BNCI2014_001; BCI Competition IV 2a",
  "EEG-0353": "BNCI2014_004; BCI Competition IV 2b",
  "EEG-0360": "BNCI2015_001",
  "EEG-0416": "Weibo2014; Yi2014",
  "EEG-0380": "Dreyer2023",
  "EEG-0410": "Shin2017A; Shin EEG-NIRS motor imagery",
  "EEG-0464": "BI2013a; Brain Invaders 2013a",
  "EEG-0465": "BI2014a; Brain Invaders 2014a",
  "EEG-0266": "EPFLP300; Hoffmann P300",
  "EEG-0071": "BNCI2014_008; P300 ALS",
  "EEG-0267": "ErpCore2021_N170; ERP CORE N170",
};
for (const [id, alias] of Object.entries(aliasUpdates)) {
  if (byId.has(id)) byId.get(id)[H.alias] = alias;
}

const primaryCategoryCorrections = {
  "EEG-0112": ["04_Cognition_and_Emotion", "Emotion", "ASCERTAIN is an affect/personality experiment, not a sleep or clinical cohort."],
  "EEG-0120": ["04_Cognition_and_Emotion", "Emotion", "DREAMER is an affective EEG/ECG experiment, not a sleep-health dataset."],
  "EEG-0129": ["04_Cognition_and_Emotion", "Emotion", "MAHNOB-HCI is multimodal affect recognition, not sleep staging."],
  "EEG-0146": ["07_General-purpose", "Rest_and_Cognitive_State", "RestCog is a healthy rest/cognitive-state benchmark, not a disease or population-health cohort."],
  "EEG-0122": ["08_Health_and_Population", "Sleep_Health_and_PSG", "DOD-H contains healthy volunteer sleep recordings and is not a clinical disease cohort."],
  "EEG-0125": ["02_Healthcare_and_Disease", "Clinical_Sleep_Disorders", "HMC is a clinical sleep-center cohort and belongs in the disease/clinical queue."],
};
for (const [id, [large, small, reason]] of Object.entries(primaryCategoryCorrections)) {
  const row = byId.get(id);
  if (!row) continue;
  row[H.large] = large;
  row[H.small] = small;
  row[H.verification] = `${row[H.verification] ?? ""} 分类复核：${reason}`.trim();
}
if (byId.has("EEG-0122")) {
  byId.get("EEG-0122")[H.path] = "08_Health_and_Population/Sleep_Health_and_PSG/Dreem_Open_Dataset_Healthy_DOD-H";
}
if (byId.has("EEG-0125")) {
  byId.get("EEG-0125")[H.path] = "02_Healthcare_and_Disease/Clinical_Sleep_Disorders/HMC_Haaglanden";
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
data.rows.sort((a, b) => completeness(b) - completeness(a)
  || Number(durationHours(b) != null) - Number(durationHours(a) != null)
  || String(a[H.id]).localeCompare(String(b[H.id]), "en", { numeric: true }));

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
for (const id of ["EEG-0112", "EEG-0120", "EEG-0129", "EEG-0139", "EEG-0146"]) focusById.delete(id);

const sleepSubjectNumeric = {
  "EEG-0108": 332,
  "EEG-0110": 29,
  "EEG-0111": 1096,
  "EEG-0113": 108,
  "EEG-0114": 108,
  "EEG-0115": 515,
  "EEG-0117": 1232,
  "EEG-0121": 20,
  "EEG-0123": 9,
  "EEG-0124": 10,
  "EEG-0127": 18973,
  "EEG-0131": 1000,
  "EEG-0132": 1000,
  "EEG-0133": 1000,
  "EEG-0134": 69,
  "EEG-0136": 3960,
  "EEG-0137": null,
  "EEG-0138": 33,
  "EEG-0140": 1983,
  "EEG-0141": 40,
  "EEG-0143": 71,
  "EEG-0145": 453,
};
const clinicalSleepIds = new Set(["EEG-0108", "EEG-0111", "EEG-0114", "EEG-0117", "EEG-0127", "EEG-0131", "EEG-0132", "EEG-0133", "EEG-0134", "EEG-0136", "EEG-0140"]);
for (const row of focusById.values()) {
  if (row.focusType !== "睡眠健康/PSG") continue;
  row.focusType = clinicalSleepIds.has(row.id) ? "疾病/临床" : "健康/人群";
  row.focusSubtype = clinicalSleepIds.has(row.id) ? "Clinical_Sleep_and_PSG" : "Sleep_Health_and_PSG";
  if (Object.hasOwn(sleepSubjectNumeric, row.id)) row.subjectNumeric = sleepSubjectNumeric[row.id];
}
const focusDefinitions = {
  "EEG-0116": ["健康/人群", "Family_Sleep_and_SDB", 735],
  "EEG-0122": ["健康/人群", "Sleep_Health_and_PSG", 55],
  "EEG-0125": ["疾病/临床", "Clinical_Sleep_Disorders", 154],
  "EEG-0126": ["疾病/临床", "Obstructive_Sleep_Apnea", 343],
  "EEG-0128": ["疾病/临床", "Clinical_Sleep_Disorders", 118],
  "EEG-0130": ["健康/人群", "Sleep_Staging_and_Microarousals", 200],
  "EEG-0135": ["健康/人群", "Aging_and_Sleep", 2907],
  "EEG-0142": ["健康/人群", "Population_Sleep_Health", 5793],
  "EEG-0144": ["健康/人群", "Sleep_and_Insomnia", 197],
  "EEG-0148": ["健康/人群", "Population_Sleep_Health", 1123],
  "EEG-0602": ["疾病/临床", "Epilepsy_and_Seizure_Monitoring", 42, 5900, "NeuroAtlas Figure 2; SzCORE lists 4,211 h for the current public benchmark scope"],
  "EEG-0603": ["疾病/临床", "Clinical_Sleep_Disorders", 255],
  "EEG-0604": ["疾病/临床", "Sleep_and_Cognitive_Impairment", null],
  "EEG-0605": ["疾病/临床", "Clinical_Sleep_Disorders", 1500],
  "EEG-0606": ["疾病/临床", "Sleep_Disordered_Breathing", 25],
};

for (const [id, definition] of Object.entries(focusDefinitions)) {
  const row = byId.get(id);
  const existing = focusById.get(id) ?? {};
  const [focusType, focusSubtype, subjectNumeric, documentedHours = null, durationEvidence = "Official source gives records/subjects but not a total-hour value"] = definition;
  focusById.set(id, {
    id,
    name: row[H.name],
    focusType,
    focusSubtype,
    largeCategory: row[H.large],
    smallCategory: row[H.small],
    task: row[H.task],
    subjectsDisplay: row[H.subjects],
    subjectNumeric,
    observedSubject: existing.observedSubject ?? null,
    channels: row[H.channels],
    samplingRate: row[H.rate],
    format: row[H.format],
    access: row[H.access],
    url: row[H.url],
    stableId: row[H.stable],
    isNew: id >= "EEG-0602",
    downloadedCountInTotal: existing.downloadedCountInTotal ?? false,
    downloadedNote: existing.downloadedNote ?? "尚未纳入本地已下载文件审计",
    downloadedHours: existing.downloadedHours ?? null,
    documentedHours,
    durationEvidence,
    auditPresence: existing.auditPresence ?? "NOT_AUDITED",
    verification: row[H.verification],
  });
}

// Officially reported participant counts that were previously left null because
// they were not part of the local file audit or the newly-added benchmark rows.
// These values are dataset-level participant counts; ambiguous record counts,
// parent/child overlaps (Harvard/MORGOTH), and release-dependent subsets remain
// null instead of being promoted to subjects.
const verifiedSubjectCounts = new Map([
  ["EEG-0043", 1379], // CAUEEG: 1,379 patients / 1,388 EEG recordings
  ["EEG-0053", 121],  // ADHD/control EEG dataset
  ["EEG-0058", 55],   // MODMA IDs are unified; 55 is the EEG union (53 in 128-ch subset)
  ["EEG-0086", 2056], // MESA participants with downloadable raw PSG/EEG
  ["EEG-0093", 94],   // OpenNeuro ds007020 participants
  ["EEG-0102", 780],  // BrainLat participants across five countries
  ["EEG-0493", 48],   // ADSZ participants
  ["EEG-0519", 282],  // CHBMP project cohort; LORIS currently exposes 250 raw sessions
]);
for (const [id, subjectNumeric] of verifiedSubjectCounts) {
  const row = focusById.get(id);
  if (row) row.subjectNumeric = subjectNumeric;
}
data.focusRows = [...focusById.values()].sort((a, b) => String(a.id).localeCompare(String(b.id), "en", { numeric: true }));

const source = (domain, name, catalogIds, options = {}) => ({
  domain,
  source: name,
  catalogIds,
  status: options.added ? "本轮补入" : "原目录已覆盖",
  neuroAtlasHours: options.hours ?? null,
  category: options.category ?? "",
  focusScope: options.focusScope ?? "非疾病/健康重点",
  access: options.access ?? "",
  url: options.url ?? "",
  download: options.download ?? "见目录入口",
  note: options.note ?? "",
});

const neuroAtlasSources = [
  source("Epilepsy", "Helsinki neonatal", ["EEG-0005"], { hours: 106, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床" }),
  source("Epilepsy", "CHB-MIT", ["EEG-0009"], { hours: 983, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床" }),
  source("Epilepsy", "Siena", ["EEG-0032"], { hours: 137, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床" }),
  source("Epilepsy", "SeizeIT1", ["EEG-0602"], { added: true, hours: 5900, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床", access: "当前不可申请", url: byId.get("EEG-0602")[H.url], download: "伦理批准已过期；当前无法获取，建议使用 SeizeIT2", note: "NeuroAtlas 5.9k h；SzCORE 当前公开基准口径 4,211 h。" }),
  source("Epilepsy", "SeizeIT2", ["EEG-0031"], { hours: 24000, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床", note: "NeuroAtlas 24k h；本地文件审计 11,626.2 h，属于版本/范围差异。" }),
  source("Epilepsy", "TUSZ", ["EEG-0036"], { hours: 1500, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床", note: "TUSZ 是 TUEG 子集，来源并集用 TUEG 父集替换，不重复相加。" }),
  source("Epilepsy", "Epilepsiae", ["EEG-0011"], { hours: 26000, category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床" }),
  source("Epilepsy", "TUAB", ["EEG-0107"], { category: "医疗与疾病 / 异常 EEG", focusScope: "疾病/临床", note: "record-level cohort；不把未知小时估为精确值。" }),
  source("Epilepsy", "NMT", ["EEG-0106"], { category: "医疗与疾病 / 异常 EEG", focusScope: "疾病/临床", note: "record-level cohort；不把未知小时估为精确值。" }),
  source("Epilepsy", "Bonn", ["EEG-0008"], { category: "医疗与疾病 / 癫痫", focusScope: "疾病/临床", note: "短片段 record-level benchmark。" }),

  source("Sleep", "CFS", ["EEG-0116"], { category: "意识状态 / 睡眠分期", focusScope: "健康/人群" }),
  source("Sleep", "DCSM", ["EEG-0603"], { added: true, category: "医疗与疾病 / 临床睡眠", focusScope: "疾病/临床", access: "公开下载", url: byId.get("EEG-0603")[H.url], download: "ERDA ZIP；或 ut fetch --dataset dcsm --out_dir data/dcsm" }),
  source("Sleep", "DOD", ["EEG-0122"], { category: "健康与人群 / 健康睡眠", focusScope: "健康/人群" }),
  source("Sleep", "HMC", ["EEG-0125"], { category: "意识状态 / 睡眠分期", focusScope: "疾病/临床" }),
  source("Sleep", "HomePAP", ["EEG-0126"], { category: "意识状态 / 睡眠分期", focusScope: "疾病/临床" }),
  source("Sleep", "ISRUC", ["EEG-0128"], { category: "意识状态 / 睡眠分期", focusScope: "疾病/临床" }),
  source("Sleep", "MASS", ["EEG-0130"], { category: "意识状态 / 睡眠分期", focusScope: "健康/人群" }),
  source("Sleep", "MESA", ["EEG-0086"], { category: "健康与人群 / 睡眠心代谢", focusScope: "健康/人群" }),
  source("Sleep", "MrOS", ["EEG-0135"], { category: "意识状态 / 睡眠分期", focusScope: "健康/人群" }),
  source("Sleep", "PN2026", ["EEG-0604"], { added: true, category: "医疗与疾病 / 睡眠与认知障碍", focusScope: "疾病/临床", access: "公开训练集", url: byId.get("EEG-0604")[H.url], download: "Kaggle large: kaggle datasets download -d physionet/physionetchallenge2026datalargeversion", note: "large training 6,600 PSG records / 1.2 TiB；validation/test hidden。" }),
  source("Sleep", "SHHS", ["EEG-0142"], { category: "意识状态 / 睡眠分期", focusScope: "健康/人群" }),
  source("Sleep", "STAGES", ["EEG-0605"], { added: true, category: "医疗与疾病 / 临床睡眠", focusScope: "疾病/临床", access: "申请访问", url: byId.get("EEG-0605")[H.url], download: "NSRR 审批后：nsrr download stages/original", note: "官方提示存在 4 对重复 EDF；下载后须按文件哈希复核。" }),
  source("Sleep", "Sleep-EDF", ["EEG-0144"], { category: "意识状态 / 睡眠分期", focusScope: "健康/人群" }),
  source("Sleep", "UCDDB", ["EEG-0606"], { added: true, category: "医疗与疾病 / 睡眠呼吸障碍", focusScope: "疾病/临床", access: "公开下载", url: byId.get("EEG-0606")[H.url], download: "wget -r -N -c -np https://physionet.org/files/ucddb/1.0.0/" }),
  source("Sleep", "WSC", ["EEG-0148"], { category: "意识状态 / 睡眠分期", focusScope: "健康/人群" }),

  source("BCI-MI", "BNCI2014_001", ["EEG-0355"], { category: "运动与交互 / 运动想象" }),
  source("BCI-MI", "BNCI2014_004", ["EEG-0353"], { category: "运动与交互 / 运动想象" }),
  source("BCI-MI", "BNCI2015_001", ["EEG-0360"], { category: "运动与交互 / 运动想象" }),
  source("BCI-MI", "Weibo2014", ["EEG-0415", "EEG-0416"], { category: "运动与交互 / 运动想象", note: "目录有原始发布入口与 MOABB 入口两个下载单元；来源级统计只计 1 个数据源。" }),
  source("BCI-MI", "Dreyer2023", ["EEG-0380"], { category: "运动与交互 / 运动想象" }),
  source("BCI-MI", "Shin2017A", ["EEG-0410"], { category: "运动与交互 / 运动想象" }),
  source("BCI-MI", "Liu2024", ["EEG-0084"], { category: "运动与交互 / 运动想象" }),
  source("BCI-ERP", "BI2013a", ["EEG-0464"], { category: "运动与交互 / P300 BCI" }),
  source("BCI-ERP", "BI2014a", ["EEG-0465"], { category: "运动与交互 / P300 BCI" }),
  source("BCI-ERP", "EPFLP300", ["EEG-0229", "EEG-0266"], { category: "认知/交互 / P300", note: "目录有官网入口与 MOABB 入口两个下载单元；来源级统计只计 1 个数据源。" }),
  source("BCI-ERP", "BNCI2014_008", ["EEG-0071"], { category: "运动与交互 / P300 ALS" }),
  source("BCI-ERP", "ErpCore2021_N170", ["EEG-0267"], { category: "认知与情感 / ERP" }),
  source("BCI-SSVEP", "Nakanishi2015", ["EEG-0444"], { category: "运动与交互 / SSVEP" }),
  source("BCI-SSVEP", "Kim2025BetaRange", ["EEG-0439"], { category: "运动与交互 / SSVEP" }),
  source("BCI-Other", "DREAMER", ["EEG-0120"], { category: "认知与情感 / 情感" }),
  source("BCI-Other", "EEGMat", ["EEG-0228"], { category: "认知与情感 / 认知负荷" }),
  source("BCI-Other", "ArithmeticTask", ["EEG-0607"], { added: true, category: "认知与情感 / 算术负荷", access: "公开下载", url: byId.get("EEG-0607")[H.url], download: "OSF project gh6q3", note: "健康认知实验，不属于疾病/健康重点范围。" }),
];

if (neuroAtlasSources.length !== 42) throw new Error(`Expected 42 NeuroAtlas sources, found ${neuroAtlasSources.length}`);

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
const categoryStats = [...categoryMap.entries()].map(([code, smallMap]) => ({
  code,
  label: categoryLabels[code] ?? code,
  count: [...smallMap.values()].reduce((a, b) => a + b, 0),
  subcategories: [...smallMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
})).sort((a, b) => a.code.localeCompare(b.code));

const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
const downloadedFocus = data.focusRows.filter((row) => row.downloadedCountInTotal);
const neuroAtlasFocusIds = new Set(neuroAtlasSources.filter((row) => row.focusScope !== "非疾病/健康重点").flatMap((row) => row.catalogIds));
const localOnlyAuditedRows = downloadedFocus.filter((row) => !neuroAtlasFocusIds.has(row.id) && row.id !== "EEG-0582");
const localOnlyAuditedHours = sum(localOnlyAuditedRows, "downloadedHours");
const hbnIds = new Set(["EEG-0345", "EEG-0594", "EEG-0595", "EEG-0596", "EEG-0597", "EEG-0598", "EEG-0599", "EEG-0600", "EEG-0601"]);
const hbnHours = sum(data.focusRows.filter((row) => hbnIds.has(row.id)), "documentedHours");
const eegBenchIds = new Set(["EEG-0583", "EEG-0584", "EEG-0585", "EEG-0586"]);
const eegBenchHours = sum(data.focusRows.filter((row) => eegBenchIds.has(row.id)), "documentedHours");
const neuroAtlasDiseaseHealthHours = 58000 + 201000;
const sourceUnionCoreHours = neuroAtlasDiseaseHealthHours - 1500 + data.metrics.tueg.durationHoursPublishedV201 + 56676;
const sourceUnionExtendedHours = sourceUnionCoreHours + localOnlyAuditedHours + hbnHours + eegBenchHours;
const paperHeadlineHours = 260000;
const downloadedHours = data.metrics.currentRaw.hours;
const pendingHours = sourceUnionExtendedHours - downloadedHours;
const focusKnownSubjectRows = data.focusRows.filter((row) => Number.isFinite(row.subjectNumeric));
const diseaseFocus = data.focusRows.filter((row) => row.focusType === "疾病/临床");
const healthFocus = data.focusRows.filter((row) => row.focusType === "健康/人群");

const neuroAtlasComparison = {
  paper: {
    title: "NeuroAtlas: Benchmarking Foundation Models for Clinical EEG and Brain-Computer Interfaces",
    url: "https://arxiv.org/abs/2605.14698",
    datasets: 42,
    hoursRounded: paperHeadlineHours,
    epilepsyHoursRounded: 58000,
    sleepHoursRounded: 201000,
    brainAgeHoursRounded: 193000,
    bciHoursAppendix: 159,
    bciHoursFigure: 170,
    note: "Brain-age uses ten sleep cohorts and is not additive to the 201k-hour sleep total. Appendix B.4 says ~159 h BCI while Figure 1 rounds the BCI block to 170 h.",
  },
  match: {
    total: neuroAtlasSources.length,
    alreadyCovered: neuroAtlasSources.filter((row) => row.status === "原目录已覆盖").length,
    added: neuroAtlasSources.filter((row) => row.status === "本轮补入").length,
    focusSources: neuroAtlasSources.filter((row) => row.focusScope !== "非疾病/健康重点").length,
  },
  focusCoverage: {
    units: data.focusRows.length,
    diseaseUnits: diseaseFocus.length,
    healthUnits: healthFocus.length,
    downloadedUnits: downloadedFocus.length,
    notDownloadedUnits: data.focusRows.length - downloadedFocus.length,
    downloadedHours,
    pendingHours,
    knownSubjectEntryUnits: focusKnownSubjectRows.length,
    knownSubjectEntries: sum(focusKnownSubjectRows, "subjectNumeric"),
    diseaseSubjectEntries: sum(diseaseFocus, "subjectNumeric"),
    healthSubjectEntries: sum(healthFocus, "subjectNumeric"),
  },
  sourceUnion: {
    method: "NeuroAtlas epilepsy + sleep source aggregate, replace its TUSZ subset with the downloaded TUEG parent, then add non-overlapping I-CARE and catalog-only audited/documented sources.",
    neuroAtlasDiseaseHealthHours,
    tuszHoursRemoved: 1500,
    tuegParentHoursAdded: data.metrics.tueg.durationHoursPublishedV201,
    icareHoursAdded: 56676,
    coreHours: sourceUnionCoreHours,
    localOnlyAuditedHours,
    hbnHours,
    eegBenchHours,
    extendedHours: sourceUnionExtendedHours,
    exceedsNeuroAtlasFullByHours: sourceUnionExtendedHours - paperHeadlineHours,
    exceedsNeuroAtlasFullByPercent: (sourceUnionExtendedHours / paperHeadlineHours - 1) * 100,
    note: "This is a source-level, non-additive coverage estimate, not an audited local-file total. The core estimate already exceeds NeuroAtlas without relying on HBN, EEG-Bench, or other small additions.",
  },
  sources: neuroAtlasSources,
};

const newFocus = data.focusRows.filter((row) => row.isNew);
const newDisease = newFocus.filter((row) => row.focusType === "疾病/临床");
const newHealth = newFocus.filter((row) => row.focusType === "健康/人群");
data.metrics.generatedAt = "2026-08-23";
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
  durationKnownUnits: newFocus.filter((row) => Number.isFinite(row.documentedHours)).length,
};
data.metrics.projected = {
  subjectRowCount: neuroAtlasComparison.focusCoverage.knownSubjectEntries,
  diseaseSubjectRowCount: neuroAtlasComparison.focusCoverage.diseaseSubjectEntries,
  healthSubjectRowCount: neuroAtlasComparison.focusCoverage.healthSubjectEntries,
  durationLowerBoundHours: sourceUnionExtendedHours,
  diseaseDurationLowerBoundHours: null,
  healthDurationLowerBoundHours: null,
  note: "Hours are a deduplicated disease/health source-coverage estimate; subjects are source-reported dataset-subject entries and are not globally deduplicated people.",
};

data.categoryStats = categoryStats;
data.neuroAtlasComparison = neuroAtlasComparison;
data.classificationRules = [
  ["疾病/临床", "存在临床诊断、患者招募、医院监测、疾病预后/治疗或病例-对照设计。", "临床 MDD、精神分裂症、癫痫、TBI、OSA/临床睡眠障碍", "健康对照随主研究目标归入疾病/临床；抑郁症属于疾病类。"],
  ["健康/人群", "健康参考、生命周期、流行病学、睡眠健康、孕产妇、衰老或风险表型。", "SHHS、MrOS、WSC、MESA、HBN、量表风险队列", "量表高分、一般情绪诱发或情感识别不自动等同临床诊断。"],
  ["任务目录与使用范围分轴", "主目录按研究任务归类；疾病/健康重点范围再按招募人群和临床目的标注。", "Sleep-EDF 主目录可为睡眠分期，同时重点范围归健康/人群", "避免把所有睡眠任务机械归疾病，也避免漏掉临床 PSG。"],
  ["一般认知/情感/BCI", "健康受试者的 ERP、情绪、算术、语义、视觉或 BCI。", "DREAMER、ASCERTAIN、MAHNOB-HCI、ArithmeticTask", "本轮已把误列为睡眠健康的情感数据移出疾病/健康重点范围。"],
  ["非 raw EEG / 排除", "当前下载内容没有 EEG signal，或只有处理后特征。", "EEG-0050、EEG-0101；BEED processed-only", "从 raw EEG subjects/hours 主指标排除并单列。"],
];
data.sources.push(
  ["NeuroAtlas paper", "https://arxiv.org/abs/2605.14698", "42 datasets / ~260k h; Appendix B source list and domain-level scope."],
  ["DCSM official archive", byId.get("EEG-0603")[H.url], "255 clinical overnight PSG recordings; public ZIP/U-Time access."],
  ["PhysioNet Challenge 2026", byId.get("EEG-0604")[H.url], "6,600 public large-training PSG records / 1.2 TiB; validation/test hidden."],
  ["STAGES / NSRR", byId.get("EEG-0605")[H.url], "1,500 patients; application access; duplicate EDF warning."],
  ["UCDDB / PhysioNet", byId.get("EEG-0606")[H.url], "25 public full-night PSGs with sleep and respiratory annotations."],
  ["ArithmeticTask paper/data", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6687903/", "51 included participants; raw data linked from OSF."],
  ["SeizeIT1 official record", byId.get("EEG-0602")[H.url], "Current notice says access is no longer granted because the ethics approval expired."],
);
// Keep regeneration idempotent: repeated audit runs must not duplicate evidence rows.
data.sources = [...new Map(data.sources.map((row) => [`${row[0]}|${row[1]}`, row])).values()];

data.worksheetGuide = data.worksheetGuide
  .map(([sheet, description]) => sheet === "最终唯一下载清单"
    ? [sheet, `完整 ${data.rows.length} 行下载单元主表；默认按资料完整度优先`]
    : sheet === "本轮新增_19"
      ? ["新增来源记录_25", "从 EEG 论文、官网、REVE 与 NeuroAtlas 补入的 25 个下载单元"]
      : sheet === "Healthcare重点清单"
        ? [sheet, `疾病/临床与健康/人群的 ${data.focusRows.length} 行重点视图`]
      : [sheet, description])
  .filter(([sheet]) => sheet !== "NeuroAtlas对照_42");
data.worksheetGuide.push(["NeuroAtlas对照_42", "42 个 NeuroAtlas 来源逐项匹配、类别、时长口径、访问状态与下载方式"]);

const worksheetOrder = [
  "README", "最终唯一下载清单", "排除与非独立条目", "重复合并证据", "人工复核结论",
  "TUH体系与重叠", "文件夹架构", "修订记录", "原重复证据归档", "分类复核",
  "分类修订明细", "下载与时长复核", "证据来源", "Healthcare重点清单", "新增来源记录_25",
  "分类统计", "REVE对照_92", "NeuroAtlas对照_42",
];
data.worksheetGuide.sort((a, b) => worksheetOrder.indexOf(a[0]) - worksheetOrder.indexOf(b[0]));

Object.assign(publicData, {
  metrics: data.metrics,
  catalogRows: compactRows,
  focusRows: data.focusRows,
  additions: data.additions,
  sources: data.sources,
  worksheetGuide: data.worksheetGuide,
  categoryStats,
  neuroAtlasComparison,
});

const csvEscape = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const manifestHeaders = ["domain", "source", "status", "catalog_ids", "neuroatlas_hours", "focus_scope", "category", "access", "url", "download", "note"];
const manifestRows = neuroAtlasSources.map((row) => [row.domain, row.source, row.status, row.catalogIds.join(" | "), row.neuroAtlasHours, row.focusScope, row.category, row.access, row.url, row.download, row.note]);
fs.writeFileSync(manifestPath, [manifestHeaders, ...manifestRows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
fs.writeFileSync(finalPath, JSON.stringify(data, null, 2));
fs.writeFileSync(publicPath, JSON.stringify(publicData));

console.log(JSON.stringify({
  rows: data.rows.length,
  focusRows: data.focusRows.length,
  neuroAtlas: neuroAtlasComparison.match,
  sourceUnion: neuroAtlasComparison.sourceUnion,
  focusCoverage: neuroAtlasComparison.focusCoverage,
}, null, 2));
