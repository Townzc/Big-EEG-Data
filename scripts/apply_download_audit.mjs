import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");
const finalPath = path.join(siteRoot, "work_spreadsheet", "final_catalog_data.json");
const publicPath = path.join(siteRoot, "public", "catalog-data.json");
const snapshotPath = path.join(siteRoot, "data", "server_focus_status_20260804.json");
const checklistCsvPath = path.join(siteRoot, "public", "download-checklist.csv");

const data = JSON.parse(fs.readFileSync(finalPath, "utf8"));
const publicData = JSON.parse(fs.readFileSync(publicPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const serverById = new Map(snapshot.rows.map((row) => [row.id, row]));
const catalogById = new Map(data.rows.map((row) => [row["Unique ID"], row]));

const tuegParentId = "EEG-0582";
const overlapIds = new Set(["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"]);
const rawExcludedIds = new Set(["EEG-0007", "EEG-0050", "EEG-0101"]);
const completedOverlay = new Map([
  ["EEG-0058", { bytes: 7593313997, completedUtc: "2026-08-26T04:11:10Z", job: "authenticated-direct" }],
  ["EEG-0583", { bytes: 28914297378, completedUtc: "2026-08-24T01:00:09Z", job: "2133731_0" }],
  ["EEG-0584", { bytes: 7385925560, completedUtc: "2026-08-24T00:40:13Z", job: "2133731_1" }],
  ["EEG-0585", { bytes: 4068828665, completedUtc: "2026-08-24T00:41:25Z", job: "2133731_2" }],
  ["EEG-0586", { bytes: 23488664219, completedUtc: "2026-08-24T00:55:56Z", job: "2133731_3" }],
  ["EEG-0093", { bytes: 1870057343, completedUtc: "2026-08-24T00:40:53Z", job: "2133731_4" }],
  ["EEG-0122", { bytes: 21872016312, completedUtc: "2026-08-24T01:04:25Z", job: "2133731_5" }],
]);
const activeDownloadIds = new Set(["EEG-0125", "EEG-0606"]);
const discard = new Map([
  ["EEG-0011", "舍弃下载：EPILEPSIAE 为付费/受限申请；保留目录证据，不进入本轮执行队列。"],
  ["EEG-0051", "舍弃下载：NIMH NDA 登录/受控访问未能打通；保留 B-SNIP1 目录记录。"],
  ["EEG-0053", "舍弃下载：IEEE DataPort 需要学校订阅且当前无法取得；保留 ADHD 目录记录。"],
  ["EEG-0602", "舍弃下载：SeizeIT1 当前官方文件访问不可用；可用 SeizeIT2 替代。"],
]);

const appliedWaiting = new Map([
  ["EEG-0012", "已提交 BDSP credentialing/DUA；等待 Harvard EEG 权限。"],
  ...["EEG-0020", "EEG-0021", "EEG-0022", "EEG-0023", "EEG-0024", "EEG-0025", "EEG-0026", "EEG-0027", "EEG-0028", "EEG-0103", "EEG-0104", "EEG-0105", "EEG-0131", "EEG-0132", "EEG-0133", "EEG-0134"]
    .map((id) => [id, "已提交 BDSP credentialing/DUA；获批后用 credentialed S3 入口同步 MORGOTH。"]),
  ["EEG-0043", "已提交 CAUEEG 申请；需本地伦理批准，等待邮件下载链接和密码。"],
  ["EEG-0086", "MESA Sleep 已提交 NSRR 申请；等待审批结果，若明确拒绝则转为舍弃。"],
]);

const approvedAccess = new Map([
  ["EEG-0519", {
    decision: "登录后可下载",
    priority: "P1",
    nextAction: "CHBMP LORIS 账号已开通；已核验 250 条 raw EEG session，首批 32 条已下载并在服务器解包，后续按登录态续传。",
  }],
]);

const nsrrRequestSlugs = new Map([
  ["EEG-0108", "abc"], ["EEG-0589", "apoe"], ["EEG-0111", "apples"], ["EEG-0115", "ccshs"],
  ["EEG-0116", "cfs"], ["EEG-0117", "chat"], ["EEG-0588", "haassa"], ["EEG-0587", "hchs"],
  ["EEG-0126", "homepap"], ["EEG-0593", "lofthf"], ["EEG-0591", "mnc"], ["EEG-0135", "mros"],
  ["EEG-0137", "nfs"], ["EEG-0590", "numom2b"], ["EEG-0142", "shhs"], ["EEG-0145", "sof"],
  ["EEG-0605", "stages"], ["EEG-0148", "wsc"],
]);
const applicationPages = new Map([
  ["EEG-0012", "https://bdsp.io/register/"],
  ...["EEG-0020", "EEG-0021", "EEG-0022", "EEG-0023", "EEG-0024", "EEG-0025", "EEG-0026", "EEG-0027", "EEG-0028", "EEG-0103", "EEG-0104", "EEG-0105", "EEG-0131", "EEG-0132", "EEG-0133", "EEG-0134"]
    .map((id) => [id, "https://bdsp.io/register/"]),
  ["EEG-0043", "https://github.com/ipis-mjkim/caueeg-dataset"],
  ["EEG-0058", "https://modma.lzu.edu.cn/data/application/"],
  ["EEG-0086", "https://sleepdata.org/data/requests/mesa/start"],
  ["EEG-0519", "https://chbmp-open.loris.ca/"],
  ...[...nsrrRequestSlugs].map(([id, slug]) => [id, `https://sleepdata.org/data/requests/${slug}/start`]),
  ["EEG-0127", "https://bdsp.io/register/"],
  ["EEG-0130", "https://ceams-carsm.ca/mass/"],
  ["EEG-0141", "https://bcmi.sjtu.edu.cn/ApplicationForm/apply_form/"],
  ["EEG-0592", "https://physionet.org/settings/profile/"],
  ["EEG-0102", "https://www.synapse.org/Synapse:syn51549340/wiki/624187"],
]);

const publicCorrections = new Map([
  ["EEG-0093", {
    name: "EEG Mortality Dataset in Parkinson's Disease",
    url: "https://openneuro.org/datasets/ds007020/versions/1.0.0",
    stableId: "OpenNeuro:ds007020 | NEMAR:on007020 | DOI:10.82901/nemar.on007020",
    note: "2026-06 已在 OpenNeuro/NEMAR 公开发布；无需再联系作者申请。",
  }],
  ["EEG-0122", {
    name: "Dreem Open Dataset – Healthy (DOD-H)",
    url: "https://zenodo.org/records/15900394",
    stableId: "DOI:10.5281/zenodo.15900394 | GitHub:Dreem-Organization/dreem-learning-open",
    note: "Dreem 官方仓库现指向 Zenodo:15900394；DOD-H 为 dodh.zip（21.9 GB）。旧 S3 桶已不存在，已更正入口。",
  }],
]);

const modmaCompletionNote = "2026-08-25 authenticated download complete: IDs 13/14/17, 7,593,313,997 bytes. ID 14/17 match the published MD5; ID 13 matches the current server size and passes all 60 ZIP CRCs while the published MD5 discrepancy is retained in the manifest.";
const modmaMaster = catalogById.get("EEG-0058");
if (modmaMaster && !String(modmaMaster["核验结论"] ?? "").includes("7,593,313,997 bytes")) {
  modmaMaster["核验结论"] = `${String(modmaMaster["核验结论"] ?? "").trim()} ${modmaCompletionNote}`.trim();
}
const modmaPublic = publicData.catalogRows?.find((row) => row.id === "EEG-0058");
if (modmaPublic && !String(modmaPublic.verification ?? "").includes("7,593,313,997 bytes")) {
  modmaPublic.verification = `${String(modmaPublic.verification ?? "").trim()} ${modmaCompletionNote}`.trim();
}

for (const [id, correction] of publicCorrections) {
  const master = catalogById.get(id);
  if (master) Object.assign(master, {
    "规范数据集名称": correction.name,
    "稳定标识（DOI/OpenNeuro/BNCI/仓库ID）": correction.stableId,
    "下载状态": "DOWNLOAD_PUBLIC",
    "下载/申请入口": correction.url,
    "许可与申请说明": "Open/public download",
    "核验结论": correction.note,
  });
  const focus = data.focusRows.find((row) => row.id === id);
  if (focus) Object.assign(focus, { name: correction.name, access: "DOWNLOAD_PUBLIC", url: correction.url, stableId: correction.stableId, verification: correction.note });
  const publicRow = publicData.catalogRows?.find((row) => row.id === id);
  if (publicRow) Object.assign(publicRow, { name: correction.name, access: "DOWNLOAD_PUBLIC", url: correction.url, stableId: correction.stableId, verification: correction.note });
}

const morgothIds = new Set(["EEG-0020", "EEG-0021", "EEG-0022", "EEG-0023", "EEG-0024", "EEG-0025", "EEG-0026", "EEG-0027", "EEG-0028", "EEG-0103", "EEG-0104", "EEG-0105", "EEG-0131", "EEG-0132", "EEG-0133", "EEG-0134"]);
for (const id of morgothIds) {
  const master = catalogById.get(id);
  if (master) Object.assign(master, {
    "下载状态": "DOWNLOAD_APPLICATION_REQUIRED",
    "下载/申请入口": "https://bdsp.io/content/morgoth1/1.0.0/",
    "许可与申请说明": "BDSP credentialed access；需完成 credentialing 和 DUA。",
  });
  const focus = data.focusRows.find((row) => row.id === id);
  if (focus) Object.assign(focus, { access: "DOWNLOAD_APPLICATION_REQUIRED", url: "https://bdsp.io/content/morgoth1/1.0.0/" });
  const publicRow = publicData.catalogRows?.find((row) => row.id === id);
  if (publicRow) Object.assign(publicRow, { access: "DOWNLOAD_APPLICATION_REQUIRED", url: "https://bdsp.io/content/morgoth1/1.0.0/" });
}
for (const [id, applicationPage] of applicationPages) {
  const master = catalogById.get(id);
  if (master) master["下载/申请入口"] = applicationPage;
}

function accessLabel(access) {
  return {
    DOWNLOAD_PUBLIC: "公开/登录后下载",
    DOWNLOAD_APPLICATION_REQUIRED: "需要申请",
    DOWNLOAD_UNAVAILABLE: "当前不可获取",
  }[access] ?? access ?? "未标注";
}

function downloadMethod(row) {
  const url = row.url || "";
  if (/openneuro\.org/i.test(url)) return "OpenNeuro 官方页面或 BIDS/OpenNeuro 下载工具";
  if (/physionet\.org/i.test(url)) return `PhysioNet：wget -r -N -c -np ${url}`;
  if (/sleepdata\.org/i.test(url)) return "NSRR：审批后用 nsrr download 或网页批量下载";
  if (/bdsp\.io/i.test(url)) return "BDSP：完成 credentialing/DUA 后使用 credentialed AWS CLI";
  if (/huggingface\.co/i.test(url)) return "Hugging Face：huggingface-cli download 或 Git LFS";
  if (/kaggle\.com/i.test(url)) return "Kaggle：接受规则后使用 Kaggle CLI";
  if (/zenodo\.org/i.test(url)) return "Zenodo 官方文件下载/API";
  if (/figshare\.com/i.test(url)) return "Figshare 官方文件下载/API";
  if (/osf\.io/i.test(url)) return "OSF 官方项目文件下载";
  if (/github\.com/i.test(url)) return "GitHub release/仓库说明中的官方数据入口";
  if (/synapse\.org|10\.7303\/syn/i.test(url)) return "Synapse 登录后从数据目录同步 EEG 文件";
  return url ? "打开官方入口并按页面说明下载" : "缺少有效入口；先补入口";
}

function decisionFor(row) {
  const server = serverById.get(row.id);
  const serverCompleted = row.id === tuegParentId || server?.finalStatus === "COMPLETED" || completedOverlay.has(row.id);
  const exactDurationAudited = Boolean(row.downloadedCountInTotal);
  const independentAcquired = serverCompleted && !overlapIds.has(row.id) && !rawExcludedIds.has(row.id);

  if (exactDurationAudited) {
    return { decision: "已下载·时长已审计", priority: "完成", nextAction: "无需下载；保持服务器校验记录。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (independentAcquired) {
    return { decision: "已下载·待信号/时长审计", priority: "P0", nextAction: "无需重复下载；补做 EEG 文件识别、subjects 和 duration 审计。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (serverCompleted && overlapIds.has(row.id)) {
    return { decision: "已下载·TUEG 重叠", priority: "排除", nextAction: "保留子集目录，但总时长/人数不与 TUEG 父库重复相加。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (serverCompleted && rawExcludedIds.has(row.id)) {
    const reason = row.id === "EEG-0007" ? "仅有 processed features/protocol" : "下载内容未确认可用 EEG signal";
    return { decision: "已下载·非独立 raw", priority: "排除", nextAction: `${reason}；不计入 raw EEG 主指标。`, serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (discard.has(row.id)) {
    return { decision: "舍弃", priority: "舍弃", nextAction: discard.get(row.id), serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (appliedWaiting.has(row.id)) {
    return { decision: "已申请·等待访问", priority: "P2", nextAction: appliedWaiting.get(row.id), serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (approvedAccess.has(row.id)) {
    return { ...approvedAccess.get(row.id), serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (activeDownloadIds.has(row.id)) {
    return { decision: "下载中", priority: "P0", nextAction: "SeaWulf Slurm 任务 2133731 正在续传；完成后立即运行 subjects / duration 文件级审计。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (row.id === "EEG-0102") {
    return { decision: "登录后可下载", priority: "P1", nextAction: "注册/登录 Synapse；EEG 数据目录可直接取得，MRI 权限另算。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (row.access === "DOWNLOAD_UNAVAILABLE") {
    return { decision: "舍弃", priority: "舍弃", nextAction: "当前官方入口不可获取；保留目录证据但停止投入下载。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (publicCorrections.has(row.id)) {
    return { decision: "可直接下载", priority: "P1", nextAction: "已确认新的公开官方入口；直接下载，完成后写入服务器状态并运行 subjects/duration 审计。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (row.access === "DOWNLOAD_APPLICATION_REQUIRED" || server?.finalStatus === "MANUAL_APPLICATION_OR_LOGIN") {
    const nextAction = nsrrRequestSlugs.has(row.id)
      ? "尚未申请；打开申请页面，登录 NSRR，填写研究用途并提交。"
      : row.id === "EEG-0127"
        ? "尚未申请 HSP；完成 BDSP credentialing/DUA 后申请该库权限。"
        : row.id === "EEG-0130"
          ? "尚未申请；按 MASS 官网说明提交项目描述和本地伦理审批材料。"
          : row.id === "EEG-0141"
            ? "尚未申请；填写 BCMI 官方 Apply 表单。"
            : row.id === "EEG-0592"
              ? "尚未申请；完成 PhysioNet credentialing、CITI 培训并签署项目 DUA。"
              : "尚未进入已申请名单；打开官方申请页面并提交。";
    return { decision: "需要申请/登录", priority: "P3", nextAction, serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (["FAILED_DISCOVERY", "FAILED_DOWNLOAD", "MANUAL_REVIEW_REQUIRED"].includes(server?.finalStatus)) {
    return { decision: "公开入口·需人工复核", priority: "P2", nextAction: "自动下载未完成；人工打开官方入口，确认真实文件链接后再下载。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  return { decision: "可直接下载", priority: "P1", nextAction: "从官方入口下载；完成后写入服务器状态并运行 subjects/duration 审计。", serverCompleted, independentAcquired, exactDurationAudited };
}

const priorityRank = new Map([["P0", 0], ["P1", 1], ["P2", 2], ["P3", 3], ["完成", 4], ["排除", 5], ["舍弃", 6]]);
const checklistRows = data.focusRows.map((row) => {
  const server = serverById.get(row.id) ?? {};
  const master = catalogById.get(row.id) ?? {};
  const decision = decisionFor(row);
  return {
    id: row.id,
    priority: decision.priority,
    decision: decision.decision,
    focusType: row.focusType,
    focusSubtype: row.focusSubtype,
    name: row.name,
    serverStatus: row.id === tuegParentId
      ? "COMPLETED_PARENT"
      : completedOverlay.has(row.id)
        ? "COMPLETED_DIRECT_OVERLAY"
        : (server.finalStatus ?? "NOT_IN_SERVER_AUDIT"),
    serverCompleted: decision.serverCompleted,
    independentAcquired: decision.independentAcquired,
    exactDurationAudited: decision.exactDurationAudited,
    auditedHours: row.downloadedHours,
    documentedHours: row.documentedHours,
    physicalSizeGB: completedOverlay.has(row.id)
      ? completedOverlay.get(row.id).bytes / 1e9
      : Number.isFinite(server.physicalBytes) ? server.physicalBytes / 1e9 : null,
    access: row.access,
    accessLabel: accessLabel(row.access),
    url: row.url,
    applicationPage: applicationPages.get(row.id) ?? "",
    downloadMethod: downloadMethod(row),
    suggestedPath: master["建议相对路径"] ?? server.relativeDirectory ?? "",
    nextAction: decision.nextAction,
    serverReason: completedOverlay.has(row.id) ? "" : (server.finalReason ?? ""),
  };
}).sort((a, b) => (priorityRank.get(a.priority) ?? 99) - (priorityRank.get(b.priority) ?? 99)
  || (b.documentedHours ?? -1) - (a.documentedHours ?? -1)
  || a.id.localeCompare(b.id, "en", { numeric: true }));

const independent = checklistRows.filter((row) => row.independentAcquired);
const exact = checklistRows.filter((row) => row.exactDurationAudited);
const serverComplete = checklistRows.filter((row) => row.serverCompleted);
const toDownload = checklistRows.filter((row) => !row.serverCompleted && row.decision !== "舍弃");
const discarded = checklistRows.filter((row) => row.decision === "舍弃");
const countsByDecision = Object.fromEntries([...new Set(checklistRows.map((row) => row.decision))]
  .map((decision) => [decision, checklistRows.filter((row) => row.decision === decision).length]));
const acquisitionMetrics = {
  serverSnapshotAt: snapshot.snapshotAt,
  serverCompletedUnits: serverComplete.length,
  independentRawAcquiredUnits: independent.length,
  diseaseRawAcquiredUnits: independent.filter((row) => row.focusType === "疾病/临床").length,
  healthRawAcquiredUnits: independent.filter((row) => row.focusType === "健康/人群").length,
  exactDurationAuditUnits: exact.length,
  exactDurationAuditHours: data.metrics.currentRaw.hours,
  pendingSignalDurationAuditUnits: independent.filter((row) => !row.exactDurationAudited).length,
  overlapOrNonRawUnits: serverComplete.filter((row) => !row.independentAcquired).length,
  remainingDownloadUnits: checklistRows.filter((row) => !row.serverCompleted).length,
  actionableDownloadUnits: toDownload.length,
  discardedUnits: discarded.length,
  applicationRequiredUnits: checklistRows.filter((row) => ["已申请·等待访问", "需要申请/登录"].includes(row.decision)).length,
  appliedWaitingUnits: checklistRows.filter((row) => row.decision === "已申请·等待访问").length,
  notYetAppliedUnits: checklistRows.filter((row) => row.decision === "需要申请/登录").length,
  countsByDecision,
  note: "已获取数量按服务器完成目录与去重规则；小时只使用已有文件级/发布级审计，不给待审计目录虚构精确时长。",
};

const expected = {
  serverCompletedUnits: 81,
  independentRawAcquiredUnits: 74,
  diseaseRawAcquiredUnits: 60,
  healthRawAcquiredUnits: 14,
  exactDurationAuditUnits: 57,
  pendingSignalDurationAuditUnits: 17,
  overlapOrNonRawUnits: 7,
  remainingDownloadUnits: 66,
  discardedUnits: 4,
  actionableDownloadUnits: 62,
  applicationRequiredUnits: 41,
  appliedWaitingUnits: 19,
  notYetAppliedUnits: 22,
};
for (const [key, value] of Object.entries(expected)) {
  if (acquisitionMetrics[key] !== value) throw new Error(`${key}: expected ${value}, got ${acquisitionMetrics[key]}`);
}

for (const row of data.focusRows) {
  const checklist = checklistRows.find((item) => item.id === row.id);
  Object.assign(row, {
    serverStatus: checklist.serverStatus,
    serverCompleted: checklist.serverCompleted,
    independentRawAcquired: checklist.independentAcquired,
    acquisitionDecision: checklist.decision,
    acquisitionPriority: checklist.priority,
    acquisitionNextAction: checklist.nextAction,
    physicalSizeGB: checklist.physicalSizeGB,
  });
}

// The focus audit already contains many duration values that the compact
// complete catalog previously failed to expose.  Promote the best-supported
// value to the master/public row while retaining its scope and provenance.
// File audits take precedence when present; paper-derived values fill blanks.
const publicCatalogById = new Map((publicData.catalogRows ?? []).map((row) => [row.id, row]));
const durationOverlayMetrics = {
  fileAuditUnits: 0,
  documentedOnlyUnits: 0,
  focusKnownUnits: 0,
  catalogKnownUnits: 0,
  missingFocusUnits: 0,
};
for (const focus of data.focusRows) {
  const hasAudit = Number.isFinite(focus.downloadedHours) && focus.downloadedHours > 0;
  const hasDocumented = Number.isFinite(focus.documentedHours) && focus.documentedHours > 0;
  const effectiveHours = hasAudit ? focus.downloadedHours : hasDocumented ? focus.documentedHours : null;
  if (effectiveHours == null) {
    durationOverlayMetrics.missingFocusUnits += 1;
    continue;
  }

  durationOverlayMetrics.focusKnownUnits += 1;
  if (hasAudit) durationOverlayMetrics.fileAuditUnits += 1;
  else durationOverlayMetrics.documentedOnlyUnits += 1;

  const evidence = String(focus.durationEvidence ?? "");
  const durationBasis = hasAudit
    ? evidence.includes("PARTIAL")
      ? "文件审计·部分范围"
      : evidence.includes("EXACT")
        ? "文件审计·精确"
        : "发布/下载范围"
    : evidence.includes("Common Sleep Data Pipeline")
      ? "论文换算·明确范围"
      : "论文/官网记录";
  const evidenceUrl = focus.durationEvidenceUrl || focus.url || "";

  const master = catalogById.get(focus.id);
  if (master) {
    const existingSeconds = Number(master["Recording duration (s)"]);
    if (!(Number.isFinite(existingSeconds) && existingSeconds > 0)) {
      master["Recording duration (s)"] = effectiveHours * 3600;
    }
    const provenance = `时长口径：${effectiveHours.toLocaleString("en-US", { maximumFractionDigits: 3 })} h（${durationBasis}；${evidence || "见下载/来源记录"}）`;
    const verification = String(master["核验结论"] ?? "").trim();
    if (!verification.includes("时长口径：")) master["核验结论"] = `${verification}${verification ? " " : ""}${provenance}`;
  }

  const publicRow = publicCatalogById.get(focus.id);
  if (publicRow) {
    const lackedDuration = !(Number.isFinite(publicRow.durationHours) && publicRow.durationHours > 0);
    if (lackedDuration) {
      publicRow.durationHours = effectiveHours;
      publicRow.completenessScore = Math.min(publicRow.completenessMax ?? 15, (publicRow.completenessScore ?? 0) + 2);
    }
    publicRow.durationBasis = durationBasis;
    publicRow.durationEvidence = evidence;
    publicRow.durationEvidenceUrl = evidenceUrl;
  }
}
durationOverlayMetrics.catalogKnownUnits = (publicData.catalogRows ?? [])
  .filter((row) => Number.isFinite(row.durationHours) && row.durationHours > 0).length;
data.metrics.durationCoverage = durationOverlayMetrics;
publicData.catalogRows?.sort((a, b) => (b.completenessScore ?? 0) - (a.completenessScore ?? 0)
  || Number(Number.isFinite(b.durationHours)) - Number(Number.isFinite(a.durationHours))
  || String(a.id).localeCompare(String(b.id), "en", { numeric: true }));

data.metrics.acquisition = acquisitionMetrics;
data.downloadChecklist = { metrics: acquisitionMetrics, rows: checklistRows };
data.neuroAtlasComparison.focusCoverage.serverCompletedUnits = acquisitionMetrics.serverCompletedUnits;
data.neuroAtlasComparison.focusCoverage.independentRawAcquiredUnits = acquisitionMetrics.independentRawAcquiredUnits;
data.neuroAtlasComparison.focusCoverage.durationAuditedUnits = acquisitionMetrics.exactDurationAuditUnits;
data.neuroAtlasComparison.focusCoverage.actionableDownloadUnits = acquisitionMetrics.actionableDownloadUnits;
data.neuroAtlasComparison.focusCoverage.discardedUnits = acquisitionMetrics.discardedUnits;
data.neuroAtlasComparison.focusCoverage.note = acquisitionMetrics.note;

data.worksheetGuide = [
  ["README", "核心规模、下载口径与状态说明"],
  ["最终唯一下载清单", `完整 ${data.metrics.finalUniqueUnits} 行唯一下载单元主表`],
  ["修订记录", "数据入口、状态、分类与去重规则的版本变更记录"],
];

Object.assign(publicData, {
  metrics: data.metrics,
  focusRows: data.focusRows,
  worksheetGuide: data.worksheetGuide,
  neuroAtlasComparison: data.neuroAtlasComparison,
  downloadChecklist: data.downloadChecklist,
});

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
const csvHeaders = ["ID", "优先级", "下载决策", "队列属性", "二级分类", "数据集", "服务器状态", "已取得独立raw", "精确时长已审计", "已审计时长(h)", "文献时长(h)", "实体大小(GB)", "访问方式", "下载方法", "官方入口", "申请/登录页面", "建议路径", "决策理由/下一步"];
const csvRows = checklistRows.map((row) => [row.id, row.priority, row.decision, row.focusType, row.focusSubtype, row.name, row.serverStatus, row.independentAcquired ? "是" : "否", row.exactDurationAudited ? "是" : "否", row.auditedHours, row.documentedHours, row.physicalSizeGB, row.accessLabel, row.downloadMethod, row.url, row.applicationPage, row.suggestedPath, row.nextAction]);

fs.writeFileSync(finalPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(publicPath, JSON.stringify(publicData));
fs.writeFileSync(checklistCsvPath, `${[csvHeaders, ...csvRows].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);
console.log(JSON.stringify({ acquisitionMetrics, checklistCsvPath, worksheetCount: data.worksheetGuide.length }, null, 2));
