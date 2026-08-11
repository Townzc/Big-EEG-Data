import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const siteRoot = path.resolve(here, "..");
const baselinePath = path.join(
  siteRoot,
  "work_spreadsheet",
  "existing_preview",
  "baseline_workbook.json",
);
const auditPath = path.join(
  root,
  ".codex_tmp_subject_duration_audit",
  "final_disease_audit_20260731.json",
);
const tuegPath = path.join(
  root,
  ".codex_tmp_subject_duration_audit",
  "EEG-0582_tueg-success_job-2112048.json",
);

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const tuegJob = JSON.parse(fs.readFileSync(tuegPath, "utf8"));
const catalogSheet = baseline.sheets.find(
  (sheet) => sheet.name === "最终唯一下载清单",
);
if (!catalogSheet) throw new Error("Baseline catalog sheet not found");

const headers = catalogSheet.values[0];
const baseRows = catalogSheet.values.slice(1).map((values) =>
  Object.fromEntries(headers.map((header, index) => [header, values[index] ?? null])),
);

const changes = new Map();
const changeLog = [];

function addChange(id, field, value, reason, evidence) {
  if (!changes.has(id)) changes.set(id, {});
  changes.get(id)[field] = value;
  changeLog.push({ id, field, value, reason, evidence });
}

for (const row of baseRows) {
  if (row["大类目录"] === "02_Biometrics_and_Disease") {
    addChange(
      row["Unique ID"],
      "大类目录",
      "02_Healthcare_and_Disease",
      "目录命名修订：把临床疾病与医疗队列从生物识别概念中拆开。",
      "本轮分类规则",
    );
  }
}

const categoryCorrections = [
  ["EEG-0067", "04_Cognition_and_Emotion", "Attention_and_Multisensory", "健康受试者的听视转换/注意实验，不是神经系统疾病。"],
  ["EEG-0068", "06_Motor_and_Interaction", "BCI_Competition", "单受试者 ECoG 运动想象竞赛数据，主用途是 BCI。"],
  ["EEG-0069", "06_Motor_and_Interaction", "Interaction_and_Control", "SSVEP 拼写/BCI 基准，不是疾病队列。"],
  ["EEG-0073", "06_Motor_and_Interaction", "Error_Related_BCI", "ErrP 光标反馈任务，不含疾病队列证据。"],
  ["EEG-0077", "04_Cognition_and_Emotion", "Attention_and_ERP", "彩色层状刺激的注意诱发电位实验，不是疾病队列。"],
  ["EEG-0082", "08_Health_and_Population", "Sensory_Physiology", "脊髓体感诱发电位属于健康生理/方法学。"],
  ["EEG-0086", "08_Health_and_Population", "Sleep_and_Cardiometabolic", "MESA Sleep 是人群心代谢/睡眠队列，不是神经疾病。"],
  ["EEG-0090", "06_Motor_and_Interaction", "Human_Robot_Interaction", "工业人机协作生理信号，不是疾病队列。"],
  ["EEG-0091", "04_Cognition_and_Emotion", "Visual_Object_Decoding", "随机化视觉物体分类实验，不是疾病队列。"],
  ["EEG-0095", "06_Motor_and_Interaction", "P300_BCI", "P300 拼写器 BCI，健康/一般交互任务。"],
  ["EEG-0096", "04_Cognition_and_Emotion", "Emotion", "实时情绪标注数据，不是精神疾病队列。"],
  ["EEG-0097", "04_Cognition_and_Emotion", "Language_and_Semantics", "动物/工具语义想象解码，不是疾病队列。"],
  ["EEG-0101", "04_Cognition_and_Emotion", "Visual_Perception", "视觉诱发电位数据；已下载树中还缺 EEG 文件，且不是疾病队列。"],
  ["EEG-0519", "08_Health_and_Population", "Lifespan_and_Normative", "CHBMP 是健康成人规范数据库。"],
  ["EEG-0520", "08_Health_and_Population", "Lifespan_and_Normative", "婴儿首年发育/规范性 EEG。"],
  ["EEG-0521", "08_Health_and_Population", "Lifespan_and_Normative", "健康老年步行/移动 EEG。"],
  ["EEG-0522", "08_Health_and_Population", "Lifespan_and_Normative", "MIPDB 是健康发育数据库。"],
  ["EEG-0524", "07_General-purpose", "Biometrics_and_Identity", "身份识别/脑纹基准，不属于疾病或医疗队列。"],
  ["EEG-0345", "08_Health_and_Population", "Developmental_Clinical_Cohort", "HBN 是儿童青少年健康与精神健康表型队列。"],
  ["EEG-0493", "02_Healthcare_and_Disease", "Cross_Diagnostic_Clinical", "ADSZ 含阿尔茨海默病和精神分裂症病例。"],
];

for (const [id, large, small, reason] of categoryCorrections) {
  addChange(id, "大类目录", large, reason, "数据集说明/论文与本轮临床队列规则");
  addChange(id, "小类目录", small, reason, "数据集说明/论文与本轮临床队列规则");
}

const subjectCorrections = [
  ["EEG-0064", "规范数据集名称", "bigP3BCI", "原名称把大型 P300 BCI 汇编误写成单一 ALS 眼动拼写数据。", "PhysioNet bigP3BCI v1.0.0"],
  ["EEG-0064", "受试者数", "336 个 study-participant 条目（20 项研究表内合计；跨研究唯一人数未声明）", "不能把研究内条目数当作全局唯一受试者。", "PhysioNet bigP3BCI Table 1"],
  ["EEG-0064", "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）", "PhysioNet:bigp3bci:v1.0.0 | DOI:10.13026/0byy-ry86", "补官方稳定标识。", "PhysioNet"],
  ["EEG-0064", "下载/申请入口", "https://physionet.org/content/bigp3bci/1.0.0/", "改为官方入口。", "PhysioNet"],
  ["EEG-0065", "受试者数", "176（6 ALS + 170 healthy）", "Scientific Data 数据描述给出的总数是 176，不是 178。", "PMC11193709 / Scientific Data"],
  ["EEG-0086", "受试者数", "2,056 个含原始 PSG/EEG 的参与者（父睡眠检查 2,237 人）", "按实际可用原始 PSG 文件口径。", "NSRR MESA polysomnography introduction"],
  ["EEG-0126", "受试者数", "343 个含原始 PSG/EEG 的参与者", "原表 373 不是当前原始 PSG 文件口径。", "NSRR HomePAP polysomnography introduction"],
  ["EEG-0135", "受试者数", "2,907（Visit 1）；1,026 为重复随访 Visit 2，不相加为唯一人数", "区分基线唯一参与者与重复随访。", "NSRR MrOS polysomnography introduction"],
  ["EEG-0142", "受试者数", "5,793（Visit 1）；2,651 为重复随访 Visit 2，不相加为唯一人数", "区分基线唯一参与者与重复随访。", "NSRR SHHS polysomnography introduction"],
  ["EEG-0050", "Raw/Processed", "下载内容仅含眼动/瞳孔数据；未发现 EEG 信号", "服务器文件审计未发现 EEG，应从原始 EEG 总量中排除。", "2026-07-31 下载审计"],
  ["EEG-0101", "核验结论", "视觉 ERP 项目；当前已下载树未发现 EEG 记录，且不属于疾病类", "分类与下载内容同时纠正。", "2026-07-31 下载审计"],
];
for (const item of subjectCorrections) addChange(...item);

const additions = [
  {
    "Unique ID": "EEG-0583",
    "大类目录": "02_Healthcare_and_Disease",
    "小类目录": "Mental_and_Developmental_Disorders",
    "规范数据集名称": "Albrecht2019",
    "合并别名": "Schizophrenia modified Simon task EEG",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "HuggingFace:jalauer/Albrecht2019 | Zenodo:889204",
    "下载状态": "DOWNLOAD_PUBLIC",
    "下载/申请入口": "https://huggingface.co/datasets/jalauer/Albrecht2019",
    "任务": "精神分裂症/分裂情感障碍 vs 健康对照；modified Simon reinforcement-learning task",
    "受试者数": "78（46 patients + 32 controls）",
    "通道数": "64",
    "采样率": "1000 Hz",
    "格式": "MAT / EEGLAB-derived",
    "Raw/Processed": "预处理与伪影校正 EEG；仓库含实验数据",
    "许可与申请说明": "PDDL；EEG-Bench 再分发页不是原始所有者，引用原论文和数据来源",
    "论文/作者": "Albrecht et al. (2019), Neuropsychologia; EEG-Bench clinical benchmark",
    "建议相对路径": "02_Healthcare_and_Disease/Mental_and_Developmental_Disorders/Albrecht2019",
    "核验结论": "新增；EEG-Bench 论文与公开仓库交叉核验；51 h 为论文基准表记录",
    "fMRI TR (s)": null,
    "Recording duration (s)": 183600,
    "Number of scans": 78,
    focusType: "疾病/临床",
    focusSubtype: "精神分裂症",
    subjectNumeric: 78,
    durationHours: 51,
    durationEvidence: "EEG-Bench Table 1",
  },
  {
    "Unique ID": "EEG-0584",
    "大类目录": "08_Health_and_Population",
    "小类目录": "Mental_Health_Risk_Phenotype",
    "规范数据集名称": "Gruendler2009",
    "合并别名": "OC symptomatology flanker EEG",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "HuggingFace:jalauer/Gruendler2009",
    "下载状态": "DOWNLOAD_PUBLIC",
    "下载/申请入口": "https://huggingface.co/datasets/jalauer/Gruendler2009",
    "任务": "高/低强迫症状量表分组；flanker error-related negativity",
    "受试者数": "46 名本科生（按 OCI-R 高/低分组；非确诊 OCD 病例）",
    "通道数": "64 EEG + 2 EOG + 1 EKG",
    "采样率": "500 Hz",
    "格式": "CNT",
    "Raw/Processed": "Raw + possible preprocessed variants",
    "许可与申请说明": "PDDL；EEG-Bench 再分发页不是原始所有者",
    "论文/作者": "Gründler et al. (2009), Neuropsychologia; EEG-Bench clinical benchmark",
    "建议相对路径": "08_Health_and_Population/Mental_Health_Risk_Phenotype/Gruendler2009",
    "核验结论": "新增；不标为确诊 OCD 疾病队列；22 h 为 EEG-Bench 表记录",
    "fMRI TR (s)": null,
    "Recording duration (s)": 79200,
    "Number of scans": 46,
    focusType: "健康/人群",
    focusSubtype: "精神健康风险表型",
    subjectNumeric: 46,
    durationHours: 22,
    durationEvidence: "EEG-Bench Table 1",
  },
  {
    "Unique ID": "EEG-0585",
    "大类目录": "02_Healthcare_and_Disease",
    "小类目录": "Neurological_Disorders",
    "规范数据集名称": "Singh2020",
    "合并别名": "Parkinson pedaling / freezing-of-gait EEG",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "HuggingFace:jalauer/Singh2020",
    "下载状态": "DOWNLOAD_PUBLIC",
    "下载/申请入口": "https://huggingface.co/datasets/jalauer/Singh2020",
    "任务": "PD freezing-of-gait positive/negative and healthy control lower-limb pedaling",
    "受试者数": "39（13 FOG+ PD + 13 FOG- PD + 13 controls）",
    "通道数": "64 + accelerometer",
    "采样率": "500 Hz",
    "格式": "BrainVision + MAT",
    "Raw/Processed": "Raw + processed",
    "许可与申请说明": "PDDL；EEG-Bench 再分发页不是原始所有者",
    "论文/作者": "Singh et al. (2020), Clinical Neurophysiology; EEG-Bench",
    "建议相对路径": "02_Healthcare_and_Disease/Neurological_Disorders/Singh2020",
    "核验结论": "新增；39 名与 7 h 由仓库/EEG-Bench 交叉核验",
    "fMRI TR (s)": null,
    "Recording duration (s)": 25200,
    "Number of scans": 39,
    focusType: "疾病/临床",
    focusSubtype: "帕金森病",
    subjectNumeric: 39,
    durationHours: 7,
    durationEvidence: "EEG-Bench Table 1",
  },
  {
    "Unique ID": "EEG-0586",
    "大类目录": "02_Healthcare_and_Disease",
    "小类目录": "Neurological_Disorders",
    "规范数据集名称": "Singh2021",
    "合并别名": "Parkinson interval timing EEG",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "HuggingFace:jalauer/Singh2021",
    "下载状态": "DOWNLOAD_PUBLIC",
    "下载/申请入口": "https://huggingface.co/datasets/jalauer/Singh2021",
    "任务": "PD vs healthy control；3/7-second interval timing；ON/OFF medication subset",
    "受试者数": "120（83 PD + 37 controls）；129 recordings",
    "通道数": "64 + accelerometer",
    "采样率": "500 Hz",
    "格式": "BrainVision",
    "Raw/Processed": "Raw",
    "许可与申请说明": "PDDL；EEG-Bench 再分发页不是原始所有者",
    "论文/作者": "Singh et al. (2021), npj Parkinson's Disease; EEG-Bench",
    "建议相对路径": "02_Healthcare_and_Disease/Neurological_Disorders/Singh2021",
    "核验结论": "新增；受试者与记录数分开；58 h 为 EEG-Bench 表记录",
    "fMRI TR (s)": null,
    "Recording duration (s)": 208800,
    "Number of scans": 129,
    focusType: "疾病/临床",
    focusSubtype: "帕金森病",
    subjectNumeric: 120,
    durationHours: 58,
    durationEvidence: "EEG-Bench Table 1",
  },
  {
    "Unique ID": "EEG-0587",
    "大类目录": "08_Health_and_Population",
    "小类目录": "Population_Sleep_Health",
    "规范数据集名称": "HCHS/SOL Polysomnography",
    "合并别名": "Hispanic Community Health Study / Study of Latinos PSG",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "NSRR:hchs | DOI:10.25822/bmb1-c442",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://sleepdata.org/datasets/hchs",
    "任务": "Hispanic/Latino population sleep and cardiometabolic epidemiology",
    "受试者数": "12,088 个有原始 PSG/EEG 的参与者（父队列约 16,000）",
    "通道数": "ARES PSG montage（含 EEG）",
    "采样率": "见 NSRR official montage",
    "格式": "EDF + XML",
    "Raw/Processed": "Raw PSG + expert annotations",
    "许可与申请说明": "NSRR 账户、数据使用协议与项目审批",
    "论文/作者": "HCHS/SOL; NSRR",
    "建议相对路径": "08_Health_and_Population/Population_Sleep_Health/HCHS_SOL",
    "核验结论": "新增大型队列；按实际可用 raw PSG/EEG 12,088 人计，不用父队列人数替代",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 12088,
    focusType: "健康/人群",
    focusSubtype: "睡眠与流行病学",
    subjectNumeric: 12088,
    durationHours: null,
    durationEvidence: "官方页未给可直接相加的总时长；待 EDF 头审计",
  },
  {
    "Unique ID": "EEG-0588",
    "大类目录": "08_Health_and_Population",
    "小类目录": "Aging_and_Dementia_Risk",
    "规范数据集名称": "HAASSA",
    "合并别名": "Honolulu-Asia Aging Study of Sleep Apnea",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "NSRR:haassa | DOI:10.25822/s9wh-3k51",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://sleepdata.org/datasets/haassa",
    "任务": "老年日本裔美国男性；睡眠呼吸障碍、认知与痴呆风险",
    "受试者数": "717 个有原始 PSG/EEG 的参与者",
    "通道数": "2 EEG + PSG channels",
    "采样率": "EEG 125 Hz",
    "格式": "EDF + XML",
    "Raw/Processed": "Raw PSG + annotations",
    "许可与申请说明": "特殊审批：先获 Kuakini Medical Center 数据方许可，再签 NSRR DUA",
    "论文/作者": "HAASSA; NSRR",
    "建议相对路径": "08_Health_and_Population/Aging_and_Dementia_Risk/HAASSA",
    "核验结论": "新增；717 为官方 raw PSG 文件口径",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 717,
    focusType: "健康/人群",
    focusSubtype: "衰老与痴呆风险",
    subjectNumeric: 717,
    durationHours: null,
    durationEvidence: "官方页未给总时长；待 EDF 头审计",
  },
  {
    "Unique ID": "EEG-0589",
    "大类目录": "08_Health_and_Population",
    "小类目录": "Sleep_Disordered_Breathing_Risk",
    "规范数据集名称": "ApoE Sleep Disordered Breathing",
    "合并别名": "Sleep Disordered Breathing, ApoE and Lipid Metabolism",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "NSRR:apoe",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://sleepdata.org/datasets/apoe",
    "任务": "ApoE genotype, lipid metabolism and untreated suspected sleep-disordered breathing",
    "受试者数": "712 个有 EDF/EEG 的参与者",
    "通道数": "PSG（含 EEG）",
    "采样率": "EEG 256 Hz",
    "格式": "EDF + STA + CSV",
    "Raw/Processed": "Raw PSG + manually scored stages",
    "许可与申请说明": "NSRR data request / DUA",
    "论文/作者": "ApoE sleep study; NSRR",
    "建议相对路径": "08_Health_and_Population/Sleep_Disordered_Breathing_Risk/ApoE",
    "核验结论": "新增；712 为官方含 EEG 的 EDF 文件口径",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 712,
    focusType: "健康/人群",
    focusSubtype: "睡眠呼吸风险",
    subjectNumeric: 712,
    durationHours: null,
    durationEvidence: "官方页未给总时长；待 EDF 头审计",
  },
  {
    "Unique ID": "EEG-0590",
    "大类目录": "08_Health_and_Population",
    "小类目录": "Maternal_and_Pregnancy_Health",
    "规范数据集名称": "nuMoM2b Sleep Breathing Substudy",
    "合并别名": "NUMOM2B PSG",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "NSRR:numom2b | DOI:10.25822/37mc-6v21",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://sleepdata.org/datasets/numom2b",
    "任务": "nulliparous pregnancy outcomes, sleep-disordered breathing and maternal health",
    "受试者数": "3,009 个 Visit 1 raw PSG/EEG；2,332 为同队列 Visit 3 随访，不重复相加",
    "通道数": "PSG（含 EEG）",
    "采样率": "见 NSRR official montage",
    "格式": "EDF + XML",
    "Raw/Processed": "Raw PSG + annotations",
    "许可与申请说明": "NSRR data request / DUA",
    "论文/作者": "nuMoM2b Sleep Breathing Substudy; NSRR",
    "建议相对路径": "08_Health_and_Population/Maternal_and_Pregnancy_Health/NUMOM2B",
    "核验结论": "新增；按 Visit 1 的 3,009 个实际 raw PSG 计唯一基线参与者",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 5341,
    focusType: "健康/人群",
    focusSubtype: "孕产妇健康",
    subjectNumeric: 3009,
    durationHours: null,
    durationEvidence: "官方页未给总时长；待 EDF 头审计",
  },
  {
    "Unique ID": "EEG-0591",
    "大类目录": "02_Healthcare_and_Disease",
    "小类目录": "Sleep_and_Narcolepsy",
    "规范数据集名称": "Mignot Nature Communications (MNC)",
    "合并别名": "MNC sleep staging / narcolepsy dataset",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "NSRR:mnc",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://sleepdata.org/datasets/mnc",
    "任务": "normal and abnormal sleep staging; type-1 narcolepsy marker",
    "受试者数": "约 3,000（NSRR 列表口径；多队列正常/异常睡眠记录）",
    "通道数": "PSG（cohort-dependent）",
    "采样率": "cohort-dependent",
    "格式": "Harmonized EDF + annotations",
    "Raw/Processed": "Raw harmonized PSG + staging",
    "许可与申请说明": "NSRR data request / DUA",
    "论文/作者": "Stephansen et al. (2018), Nature Communications; NSRR",
    "建议相对路径": "02_Healthcare_and_Disease/Sleep_and_Narcolepsy/MNC",
    "核验结论": "新增大型临床睡眠汇编；3,000 为官方列表近似数，非全局唯一精确值",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 3000,
    focusType: "疾病/临床",
    focusSubtype: "睡眠疾病/发作性睡病",
    subjectNumeric: 3000,
    durationHours: null,
    durationEvidence: "官方页未给总时长；待 EDF 头审计",
  },
  {
    "Unique ID": "EEG-0592",
    "大类目录": "02_Healthcare_and_Disease",
    "小类目录": "Clinical_Sleep_Disorders",
    "规范数据集名称": "Comprehensive Polysomnography (CPS)",
    "合并别名": "CPS sleep arousal dataset",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "PhysioNet:cps-dataset-sleep:v1.0.0 | DOI:10.13026/sxs0-h317",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://physionet.org/content/cps-dataset-sleep/1.0.0/",
    "任务": "clinical sleep arousal, apnea/hypopnea and diagnostic decision support",
    "受试者数": "113 diagnostic PSG recordings / subjects",
    "通道数": "up to 36 raw channels；含 10 个 EEG derivations/electrodes",
    "采样率": "EEG original 128 Hz; distributed WFDB 256 Hz",
    "格式": "WFDB + TXT + YAML",
    "Raw/Processed": "Raw multichannel PSG + derived signals + annotations",
    "许可与申请说明": "PhysioNet credentialed access、CITI training、DUA",
    "论文/作者": "Kraft et al. (2024), PhysioNet",
    "建议相对路径": "02_Healthcare_and_Disease/Clinical_Sleep_Disorders/CPS",
    "核验结论": "新增；官方页面确认原始 EEG 通道与 113 份临床 PSG",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 113,
    focusType: "疾病/临床",
    focusSubtype: "临床睡眠障碍",
    subjectNumeric: 113,
    durationHours: null,
    durationEvidence: "官方页未给总时长；待 WFDB 头审计",
  },
  {
    "Unique ID": "EEG-0593",
    "大类目录": "02_Healthcare_and_Disease",
    "小类目录": "Cardiovascular_and_Sleep_Disorders",
    "规范数据集名称": "LOFT-HF",
    "合并别名": "Low Flow Nocturnal Oxygen Therapy in Heart Failure",
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": "NSRR:lofthf",
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://sleepdata.org/datasets/lofthf",
    "任务": "heart failure with reduced ejection fraction and central sleep apnea clinical trial",
    "受试者数": "161 名有 baseline raw PSG；31 名另有 follow-up；不把随访重复相加",
    "通道数": "Type-2 PSG with frontal EEG",
    "采样率": "见 NSRR files/montage",
    "格式": "EDF + annotations",
    "Raw/Processed": "Raw PSG + expert annotations",
    "许可与申请说明": "NSRR data request / DUA",
    "论文/作者": "LOFT-HF Trial; NSRR",
    "建议相对路径": "02_Healthcare_and_Disease/Cardiovascular_and_Sleep_Disorders/LOFT_HF",
    "核验结论": "新增；受试者按 161 名 baseline raw PSG 计，31 follow-up 不重复算人",
    "fMRI TR (s)": null,
    "Recording duration (s)": null,
    "Number of scans": 192,
    focusType: "疾病/临床",
    focusSubtype: "心衰与中枢性睡眠呼吸暂停",
    subjectNumeric: 161,
    durationHours: null,
    durationEvidence: "官方页未给总时长；待 EDF 头审计",
  },
];

const correctedRows = baseRows.map((row) => ({
  ...row,
  ...(changes.get(row["Unique ID"]) ?? {}),
}));
const allRows = [...correctedRows, ...additions.map((row) => ({ ...row }))];

const healthIds = new Set([
  "EEG-0082",
  "EEG-0086",
  "EEG-0345",
  "EEG-0519",
  "EEG-0520",
  "EEG-0521",
  "EEG-0522",
  "EEG-0584",
  "EEG-0587",
  "EEG-0588",
  "EEG-0589",
  "EEG-0590",
]);

const sleepNamesClinical = /CAP Sleep|CPS|MNC|LOFT|NCHSDB|HSP|Sleep-EDF|ISRUC|MASS|Apnea|Narcolepsy/i;
function focusClassification(row) {
  if (row.focusType) return { type: row.focusType, subtype: row.focusSubtype };
  const id = row["Unique ID"];
  if (healthIds.has(id) || row["大类目录"] === "08_Health_and_Population") {
    return { type: "健康/人群", subtype: row["小类目录"] };
  }
  if (row["大类目录"] === "02_Healthcare_and_Disease") {
    return { type: "疾病/临床", subtype: row["小类目录"] };
  }
  if (row["小类目录"] === "Sleep_Staging") {
    return {
      type: "睡眠健康/PSG",
      subtype: sleepNamesClinical.test(String(row["规范数据集名称"]))
        ? "临床/睡眠实验室"
        : "睡眠分期/队列",
    };
  }
  return null;
}

const auditById = new Map(audit.detail.map((row) => [row.list_id, row]));
const overlapExcluded = new Set(["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"]);
const rawSignalExcluded = new Set(["EEG-0007", "EEG-0050", "EEG-0101"]);
const nonFocusAudit = new Set([
  "EEG-0067",
  "EEG-0068",
  "EEG-0069",
  "EEG-0073",
  "EEG-0077",
  "EEG-0090",
  "EEG-0091",
  "EEG-0095",
  "EEG-0096",
  "EEG-0097",
  "EEG-0101",
  "EEG-0524",
]);

const focusRows = allRows
  .map((row) => {
    const focus = focusClassification(row);
    if (!focus) return null;
    const audited = auditById.get(row["Unique ID"]);
    const isNew = row["Unique ID"] >= "EEG-0583";
    let downloadedCountInTotal = false;
    let downloadedNote = "未纳入现有服务器疾病目录审计";
    if (row["Unique ID"] === "EEG-0582") {
      downloadedCountInTotal = true;
      downloadedNote = "TUEG v2.0.2 下载成功；人数/时长采用发布统计口径";
    } else if (audited && overlapExcluded.has(row["Unique ID"])) {
      downloadedNote = "已下载，但与 TUEG 父库重叠；总量不重复相加";
    } else if (audited && nonFocusAudit.has(row["Unique ID"])) {
      downloadedNote = "已下载，但分类复核后不属于 healthcare/disease 范围";
    } else if (audited && rawSignalExcluded.has(row["Unique ID"])) {
      downloadedNote = audited.data_presence === "PROCESSED_FEATURES_PROTOCOL_ONLY"
        ? "已下载 processed features；无可复核 raw EEG"
        : "已下载内容未发现 EEG 信号；从 raw EEG 总量排除";
    } else if (audited && audited.data_presence === "EEG_SIGNAL_PRESENT") {
      downloadedCountInTotal = true;
      downloadedNote = "2026-07-31 文件级审计确认 EEG signal present";
    }

    const newMeta = additions.find((item) => item["Unique ID"] === row["Unique ID"]);
    const subjectNumeric = newMeta?.subjectNumeric
      ?? (row["Unique ID"] === "EEG-0582" ? 14987 : audited?.reconciled_subject_count ?? null);
    const observedSubject = audited?.observed_eeg_subject_count ?? null;
    const downloadedHours = row["Unique ID"] === "EEG-0582"
      ? 27077.3
      : audited?.duration_hours_actual_content ?? null;
    const documentedHours = newMeta?.durationHours
      ?? audited?.duration_hours_best_available
      ?? null;

    return {
      id: row["Unique ID"],
      name: row["规范数据集名称"],
      focusType: focus.type,
      focusSubtype: focus.subtype,
      largeCategory: row["大类目录"],
      smallCategory: row["小类目录"],
      task: row["任务"],
      subjectsDisplay: row["受试者数"],
      subjectNumeric,
      observedSubject,
      channels: row["通道数"],
      samplingRate: row["采样率"],
      format: row["格式"],
      access: row["下载状态"],
      url: String(row["下载/申请入口"] ?? "").match(/https?:\/\/[^\s)]+/)?.[0] ?? "",
      stableId: row["稳定标识（DOI/OpenNeuro/BNCI/仓库ID）"],
      isNew,
      downloadedCountInTotal,
      downloadedNote,
      downloadedHours,
      documentedHours,
      durationEvidence: newMeta?.durationEvidence ?? audited?.duration_precision ?? "未核验",
      auditPresence: audited?.data_presence ?? (row["Unique ID"] === "EEG-0582" ? "EEG_SIGNAL_PRESENT" : "NOT_AUDITED"),
      verification: row["核验结论"],
    };
  })
  .filter(Boolean);

const currentRawRows = focusRows.filter((row) => row.downloadedCountInTotal);
const currentDiseaseRows = currentRawRows.filter((row) => row.focusType === "疾病/临床");
const currentHealthRows = currentRawRows.filter((row) => row.focusType === "健康/人群");
const newRows = focusRows.filter((row) => row.isNew);
const newDiseaseRows = newRows.filter((row) => row.focusType === "疾病/临床");
const newHealthRows = newRows.filter((row) => row.focusType === "健康/人群");

const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
const known = (rows, key) => rows.filter((row) => Number.isFinite(row[key])).length;

const metrics = {
  generatedAt: "2026-08-10",
  baselineUniqueUnits: baseRows.length,
  finalUniqueUnits: allRows.length,
  newlyAddedUnits: additions.length,
  categoryDecisionCount: categoryCorrections.length,
  fieldCorrectionCount: changeLog.length,
  focusUnitCount: focusRows.length,
  currentRaw: {
    units: currentRawRows.length,
    diseaseUnits: currentDiseaseRows.length,
    healthUnits: currentHealthRows.length,
    subjectRowCount: sum(currentRawRows, "subjectNumeric"),
    diseaseSubjectRowCount: sum(currentDiseaseRows, "subjectNumeric"),
    healthSubjectRowCount: sum(currentHealthRows, "subjectNumeric"),
    observedSubjectLowerBound: sum(currentRawRows, "observedSubject") + 14987,
    observedSubjectRows: known(currentRawRows, "observedSubject") + 1,
    hours: sum(currentRawRows, "downloadedHours"),
    diseaseHours: sum(currentDiseaseRows, "downloadedHours"),
    healthHours: sum(currentHealthRows, "downloadedHours"),
    durationKnownUnits: known(currentRawRows, "downloadedHours"),
  },
  processedOnly: {
    units: 1,
    subjects: 80,
    documentedHours: 88.88888888888889,
    note: "BEED 仅有 processed features/protocol；不计入 raw EEG 主指标。",
  },
  noSignalExcluded: {
    units: 2,
    ids: ["EEG-0050", "EEG-0101"],
    note: "当前下载内容未发现 EEG signal。",
  },
  additions: {
    units: newRows.length,
    subjectRowCount: sum(newRows, "subjectNumeric"),
    diseaseSubjectRowCount: sum(newDiseaseRows, "subjectNumeric"),
    healthSubjectRowCount: sum(newHealthRows, "subjectNumeric"),
    documentedHours: sum(newRows, "documentedHours"),
    diseaseDocumentedHours: sum(newDiseaseRows, "documentedHours"),
    healthDocumentedHours: sum(newHealthRows, "documentedHours"),
    durationKnownUnits: known(newRows, "documentedHours"),
  },
  projected: {
    subjectRowCount: sum(currentRawRows, "subjectNumeric") + sum(newRows, "subjectNumeric"),
    diseaseSubjectRowCount: sum(currentDiseaseRows, "subjectNumeric") + sum(newDiseaseRows, "subjectNumeric"),
    healthSubjectRowCount: sum(currentHealthRows, "subjectNumeric") + sum(newHealthRows, "subjectNumeric"),
    durationLowerBoundHours: sum(currentRawRows, "downloadedHours") + sum(newRows, "documentedHours"),
    diseaseDurationLowerBoundHours: sum(currentDiseaseRows, "downloadedHours") + sum(newDiseaseRows, "documentedHours"),
    healthDurationLowerBoundHours: sum(currentHealthRows, "downloadedHours") + sum(newHealthRows, "documentedHours"),
  },
  tueg: {
    version: "v2.0.2",
    expectedFiles: tuegJob.expected_file_count ?? 70841,
    downloadedFiles: tuegJob.actual_file_count ?? 70841,
    bytes: tuegJob.actual_bytes ?? 1756545393092,
    patientsPublished: 14987,
    durationHoursPublishedV201: 27077.3,
    note: "文件数与字节来自 v2.0.2 下载作业；人数/时长为发布统计（时长来自 v2.0.1 审计），版本口径已单独标注。",
  },
};

const sourceRows = [
  ["EEG-Bench paper", "https://arxiv.org/abs/2512.08959", "14 个临床 EEG 基准的 subjects/recordings/total length；用于新增 4 个未收录任务。"],
  ["EEG-Bench repository", "https://github.com/ETH-DISCO/EEG-Bench", "访问与可复现接口；仓库不是原始数据所有者。"],
  ["Albrecht2019 data card", "https://huggingface.co/datasets/jalauer/Albrecht2019", "78 participants, 64 channels, 1000 Hz, PDDL。"],
  ["Gruendler2009 data card", "https://huggingface.co/datasets/jalauer/Gruendler2009", "46 undergraduates；OCI-R 高低分，不是确诊 OCD。"],
  ["Singh2020 data card", "https://huggingface.co/datasets/jalauer/Singh2020", "39 participants, 64 channels, 500 Hz。"],
  ["Singh2021 data card", "https://huggingface.co/datasets/jalauer/Singh2021", "83 PD + 37 controls；129 recordings。"],
  ["HCHS/SOL official", "https://sleepdata.org/datasets/hchs/pages/polysomnography-introduction.md", "12,088 raw PSG/EEG participants。"],
  ["HAASSA official", "https://sleepdata.org/datasets/haassa/pages/polysomnography-introduction.md", "717 raw PSG subjects。"],
  ["ApoE official", "https://sleepdata.org/datasets/apoe", "712 EDF/EEG subjects, EEG 256 Hz。"],
  ["nuMoM2b official", "https://sleepdata.org/datasets/numom2b/pages/polysomnography-introduction.md", "Visit 1 3,009；Visit 3 2,332 repeated follow-up。"],
  ["MNC official", "https://sleepdata.org/datasets/mnc", "约 3,000 normal/abnormal sleep records。"],
  ["CPS official", "https://physionet.org/content/cps-dataset-sleep/1.0.0/", "113 clinical PSG；raw EEG channels；credentialed access。"],
  ["LOFT-HF official", "https://sleepdata.org/datasets/lofthf/pages/README.md", "161 baseline PSG participants + 31 follow-up。"],
  ["MESA official", "https://sleepdata.org/datasets/mesa/pages/polysomnography-introduction.md", "2,056 raw PSG participants。"],
  ["SHHS official", "https://sleepdata.org/datasets/shhs/pages/05-polysomnography-introduction.md", "5,793 Visit 1 + 2,651 Visit 2。"],
  ["MrOS official", "https://sleepdata.org/datasets/mros/pages/polysomnography-introduction.md", "2,907 Visit 1 + 1,026 Visit 2。"],
  ["HomePAP official", "https://sleepdata.org/datasets/homepap/pages/polysomnography-introduction.md", "343 raw PSG participants。"],
  ["bigP3BCI official", "https://physionet.org/content/bigp3bci/1.0.0/", "20 studies；研究内 participant entries 与全局唯一人数须区分。"],
  ["WHO depression", "https://www.who.int/news-room/fact-sheets/detail/depression", "抑郁是常见精神障碍；归疾病/临床，但普通情绪诱发任务不等同抑郁。"],
];

const worksheetGuide = [
  ["README", "核心规模、统计口径与推荐阅读顺序"],
  ["最终唯一下载清单", "完整 548 行唯一下载单元主表"],
  ["排除与非独立条目", "非数据集、混合记录与非独立条目的排除理由"],
  ["重复合并证据", "确认重复、版本继承与同一仓库标识的合并证据"],
  ["人工复核结论", "需要人工判断的候选组与最终决策"],
  ["TUH体系与重叠", "TUEG 父库和 TUAB/TUAR/TUEP/TUEV/TUSZ/TUSL 子集关系"],
  ["文件夹架构", "目录层级、论文用名和各目录唯一单元数"],
  ["修订记录", "历次目录修订与变更范围"],
  ["原重复证据归档", "历史重复证据的只读归档"],
  ["Healthcare重点清单", "疾病、健康人群与睡眠 PSG 的 137 行重点视图"],
  ["本轮新增_11", "本轮从 EEG 论文和官网补充的 11 个下载单元"],
  ["分类复核", "疾病、健康、睡眠和一般 BCI 的分类规则"],
  ["分类修订明细", "本轮逐字段分类与人数修订记录"],
  ["下载与时长复核", "已下载 raw EEG、processed-only、排除项及预计规模"],
  ["证据来源", "论文、官网、仓库和口径证据链接"],
];

const compactCatalogRows = allRows.map((row) => ({
  id: row["Unique ID"],
  name: row["规范数据集名称"],
  largeCategory: row["大类目录"],
  smallCategory: row["小类目录"],
  task: row["任务"],
  subjectsDisplay: row["受试者数"],
  channels: row["通道数"],
  samplingRate: row["采样率"],
  format: row["格式"],
  rawProcessed: row["Raw/Processed"],
  access: row["下载状态"],
  url: String(row["下载/申请入口"] ?? "").match(/https?:\/\/[^\s)]+/)?.[0] ?? "",
  stableId: row["稳定标识（DOI/OpenNeuro/BNCI/仓库ID）"],
  paper: row["论文/作者"],
  verification: row["核验结论"],
  isNew: row["Unique ID"] >= "EEG-0583",
}));

const classificationRules = [
  ["疾病/临床", "存在临床诊断、患者招募、医院监测、疾病预后/治疗或病例-对照设计。", "抑郁/MDD、精神分裂症、帕金森、癫痫、TBI、临床睡眠障碍", "健康对照仍随主研究目标归疾病/临床。"],
  ["健康/人群", "健康参考、生命周期、流行病学、孕产妇、衰老或风险表型；没有把量表高分直接等同诊断。", "CHBMP、HCHS/SOL、nuMoM2b、Gruendler2009", "风险/症状分层与确诊疾病分开。"],
  ["睡眠健康/PSG", "主用途是睡眠分期或 PSG 队列，临床属性用第二轴表示。", "SHHS、MrOS、HomePAP、CAP Sleep", "避免仅因含 apnea/患者就破坏任务型目录。"],
  ["一般认知/BCI", "健康受试者的 ERP、情绪、语义、视觉、BCI 或工业交互。", "BNCI2015_013、PhysioP300、REFED、MultiPhysio-HRC", "不因 EEG 被用于医疗研究就自动归疾病。"],
  ["非 raw EEG / 排除", "当前下载内容没有 EEG signal，或只有处理后特征。", "EEG-0050、EEG-0101；BEED processed-only", "从 raw EEG subjects/hours 主指标排除并单列。"],
];

const output = {
  headers,
  rows: allRows.map((row) => Object.fromEntries(headers.map((header) => [header, row[header] ?? null]))),
  additions: additions.map((row) => Object.fromEntries(headers.map((header) => [header, row[header] ?? null]))),
  focusRows,
  changeLog,
  categoryCorrections: categoryCorrections.map(([id, large, small, reason]) => ({ id, large, small, reason })),
  classificationRules,
  sources: sourceRows,
  worksheetGuide,
  metrics,
};

fs.mkdirSync(path.join(siteRoot, "public"), { recursive: true });
fs.mkdirSync(path.join(siteRoot, "work_spreadsheet"), { recursive: true });
fs.writeFileSync(
  path.join(siteRoot, "work_spreadsheet", "final_catalog_data.json"),
  JSON.stringify(output, null, 2),
);
fs.writeFileSync(
  path.join(siteRoot, "public", "catalog-data.json"),
  JSON.stringify({
    metrics,
    catalogRows: compactCatalogRows,
    focusRows,
    classificationRules,
    additions: output.additions,
    sources: sourceRows,
    worksheetGuide,
  }),
);

console.log(JSON.stringify(metrics, null, 2));
