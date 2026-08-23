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
const discard = new Map([
  ["EEG-0011", "舍弃下载：EPILEPSIAE 为付费/受限申请；保留目录证据，不进入本轮执行队列。"],
  ["EEG-0051", "舍弃下载：NIMH NDA 登录/受控访问未能打通；保留 B-SNIP1 目录记录。"],
  ["EEG-0053", "舍弃下载：IEEE DataPort 需要学校订阅且当前无法取得；保留 ADHD 目录记录。"],
  ["EEG-0602", "舍弃下载：SeizeIT1 当前官方文件访问不可用；可用 SeizeIT2 替代。"],
]);

const appliedWaiting = new Map([
  ["EEG-0012", "已提交 BDSP credentialing/DUA；等待 Harvard EEG 权限。"],
  ...["EEG-0020", "EEG-0021", "EEG-0022", "EEG-0023", "EEG-0024", "EEG-0025", "EEG-0026", "EEG-0027", "EEG-0028", "EEG-0103", "EEG-0104", "EEG-0105"]
    .map((id) => [id, "已提交 BDSP credentialing/DUA；获批后用 credentialed S3 入口同步 MORGOTH。"]),
  ["EEG-0043", "已提交 CAUEEG 申请；需本地伦理批准，等待邮件下载链接和密码。"],
  ["EEG-0058", "MODMA 已申请；登录个人页确认授权，获批后立即下载。"],
  ["EEG-0086", "MESA Sleep 已提交 NSRR 申请；等待审批结果，若明确拒绝则转为舍弃。"],
  ["EEG-0519", "CHBMP 已申请账号；等待 LORIS 账户开通。"],
]);

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
  const serverCompleted = row.id === tuegParentId || server?.finalStatus === "COMPLETED";
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
  if (row.id === "EEG-0102") {
    return { decision: "登录后可下载", priority: "P1", nextAction: "注册/登录 Synapse；EEG 数据目录可直接取得，MRI 权限另算。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (row.access === "DOWNLOAD_UNAVAILABLE") {
    return { decision: "舍弃", priority: "舍弃", nextAction: "当前官方入口不可获取；保留目录证据但停止投入下载。", serverCompleted, independentAcquired, exactDurationAudited };
  }
  if (row.access === "DOWNLOAD_APPLICATION_REQUIRED" || server?.finalStatus === "MANUAL_APPLICATION_OR_LOGIN") {
    return { decision: "需要申请/登录", priority: "P3", nextAction: "尚未进入已申请名单；先确认研究价值与审批成本，再决定是否提交。", serverCompleted, independentAcquired, exactDurationAudited };
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
    serverStatus: row.id === tuegParentId ? "COMPLETED_PARENT" : (server.finalStatus ?? "NOT_IN_SERVER_AUDIT"),
    serverCompleted: decision.serverCompleted,
    independentAcquired: decision.independentAcquired,
    exactDurationAudited: decision.exactDurationAudited,
    auditedHours: row.downloadedHours,
    documentedHours: row.documentedHours,
    physicalSizeGB: Number.isFinite(server.physicalBytes) ? server.physicalBytes / 1e9 : null,
    access: row.access,
    accessLabel: accessLabel(row.access),
    url: row.url,
    downloadMethod: downloadMethod(row),
    suggestedPath: master["建议相对路径"] ?? server.relativeDirectory ?? "",
    nextAction: decision.nextAction,
    serverReason: server.finalReason ?? "",
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
  countsByDecision,
  note: "已获取数量按服务器完成目录与去重规则；小时只使用已有文件级/发布级审计，不给待审计目录虚构精确时长。",
};

const expected = {
  serverCompletedUnits: 74,
  independentRawAcquiredUnits: 67,
  diseaseRawAcquiredUnits: 55,
  healthRawAcquiredUnits: 12,
  exactDurationAuditUnits: 57,
  pendingSignalDurationAuditUnits: 10,
  overlapOrNonRawUnits: 7,
  remainingDownloadUnits: 72,
  discardedUnits: 4,
  actionableDownloadUnits: 68,
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

data.metrics.acquisition = acquisitionMetrics;
data.downloadChecklist = { metrics: acquisitionMetrics, rows: checklistRows };
data.neuroAtlasComparison.focusCoverage.serverCompletedUnits = acquisitionMetrics.serverCompletedUnits;
data.neuroAtlasComparison.focusCoverage.independentRawAcquiredUnits = acquisitionMetrics.independentRawAcquiredUnits;
data.neuroAtlasComparison.focusCoverage.durationAuditedUnits = acquisitionMetrics.exactDurationAuditUnits;
data.neuroAtlasComparison.focusCoverage.actionableDownloadUnits = acquisitionMetrics.actionableDownloadUnits;
data.neuroAtlasComparison.focusCoverage.discardedUnits = acquisitionMetrics.discardedUnits;
data.neuroAtlasComparison.focusCoverage.note = acquisitionMetrics.note;

data.worksheetGuide = data.worksheetGuide.filter(([name]) => name !== "下载执行清单");
const healthcareIndex = data.worksheetGuide.findIndex(([name]) => name === "Healthcare重点清单");
data.worksheetGuide.splice(healthcareIndex + 1, 0, ["下载执行清单", "疾病/健康146行服务器状态、优先级、下载决策、官方入口与下一步操作；舍弃项仍保留证据"]);

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
const csvHeaders = ["ID", "优先级", "下载决策", "队列属性", "二级分类", "数据集", "服务器状态", "已取得独立raw", "精确时长已审计", "已审计时长(h)", "文献时长(h)", "实体大小(GB)", "访问方式", "下载方法", "官方入口", "建议路径", "决策理由/下一步"];
const csvRows = checklistRows.map((row) => [row.id, row.priority, row.decision, row.focusType, row.focusSubtype, row.name, row.serverStatus, row.independentAcquired ? "是" : "否", row.exactDurationAudited ? "是" : "否", row.auditedHours, row.documentedHours, row.physicalSizeGB, row.accessLabel, row.downloadMethod, row.url, row.suggestedPath, row.nextAction]);

fs.writeFileSync(finalPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(publicPath, JSON.stringify(publicData));
fs.writeFileSync(checklistCsvPath, `${[csvHeaders, ...csvRows].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);
console.log(JSON.stringify({ acquisitionMetrics, checklistCsvPath, worksheetCount: data.worksheetGuide.length }, null, 2));
