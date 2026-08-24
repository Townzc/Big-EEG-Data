import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(here, "..", "work_spreadsheet", "final_catalog_data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const { metrics, rows, additions, focusRows, neuroAtlasComparison } = data;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const approx = (actual, expected, tolerance = 1e-6) =>
  Math.abs(actual - expected) <= tolerance;

assert(rows.length === 562, `Expected 562 rows, got ${rows.length}`);
assert(additions.length === 25, `Expected 25 additions, got ${additions.length}`);
assert(new Set(rows.map((row) => row["Unique ID"])).size === rows.length, "Duplicate Unique ID found");
assert(metrics.currentRaw.units === 57, `Expected 57 current raw units, got ${metrics.currentRaw.units}`);
assert(metrics.currentRaw.subjectRowCount === 22150, `Unexpected current subject row-count: ${metrics.currentRaw.subjectRowCount}`);
assert(metrics.currentRaw.observedSubjectLowerBound === 21132, `Unexpected observed lower bound: ${metrics.currentRaw.observedSubjectLowerBound}`);
assert(approx(metrics.currentRaw.hours, 43627.81906678666), `Unexpected current hours: ${metrics.currentRaw.hours}`);
assert(metrics.additions.subjectRowCount === 23961, `Unexpected new subject row-count: ${metrics.additions.subjectRowCount}`);
assert(approx(metrics.additions.documentedHours, 7334.8), `Unexpected new documented hours: ${metrics.additions.documentedHours}`);
assert(metrics.focusUnitCount === 146, `Expected 146 focus units, got ${metrics.focusUnitCount}`);
assert(metrics.projected.subjectRowCount === 99515, `Unexpected projected subject row-count: ${metrics.projected.subjectRowCount}`);
assert(approx(metrics.projected.durationLowerBoundHours, 346490.7408902543), `Unexpected projected hours: ${metrics.projected.durationLowerBoundHours}`);
assert(neuroAtlasComparison.match.total === 42, `Expected 42 NeuroAtlas sources, got ${neuroAtlasComparison.match.total}`);
assert(neuroAtlasComparison.match.alreadyCovered === 36, `Expected 36 pre-existing NeuroAtlas sources, got ${neuroAtlasComparison.match.alreadyCovered}`);
assert(neuroAtlasComparison.match.added === 6, `Expected 6 NeuroAtlas additions, got ${neuroAtlasComparison.match.added}`);
assert(neuroAtlasComparison.focusCoverage.diseaseUnits === 108, `Expected 108 disease units, got ${neuroAtlasComparison.focusCoverage.diseaseUnits}`);
assert(neuroAtlasComparison.focusCoverage.healthUnits === 38, `Expected 38 health units, got ${neuroAtlasComparison.focusCoverage.healthUnits}`);
assert(approx(neuroAtlasComparison.sourceUnion.coreHours, 341253.3), `Unexpected core source-union hours: ${neuroAtlasComparison.sourceUnion.coreHours}`);
assert(approx(neuroAtlasComparison.sourceUnion.extendedHours, 346490.7408902543), `Unexpected extended source-union hours: ${neuroAtlasComparison.sourceUnion.extendedHours}`);
assert(metrics.tueg.downloadedFiles === metrics.tueg.expectedFiles, "TUEG file-count mismatch");
assert(metrics.tueg.bytes === 1756545393092, `Unexpected TUEG bytes: ${metrics.tueg.bytes}`);
assert(metrics.acquisition.serverCompletedUnits === 80, "Expected 80 server-completed disease/health units");
assert(metrics.acquisition.independentRawAcquiredUnits === 73, "Expected 73 independent raw acquisitions");
assert(metrics.acquisition.diseaseRawAcquiredUnits === 59, "Expected 59 disease raw acquisitions");
assert(metrics.acquisition.healthRawAcquiredUnits === 14, "Expected 14 health raw acquisitions");
assert(metrics.acquisition.exactDurationAuditUnits === 57, "Expected 57 exact-duration audits");
assert(metrics.acquisition.actionableDownloadUnits === 62, "Expected 62 actionable remaining downloads");
assert(metrics.acquisition.discardedUnits === 4, "Expected 4 discarded downloads");
assert(metrics.acquisition.applicationRequiredUnits === 41, "Expected 41 application-required actionable units");
assert(metrics.acquisition.appliedWaitingUnits === 19, "Expected 19 already-applied units");
assert(metrics.acquisition.notYetAppliedUnits === 22, "Expected 22 not-yet-applied units");
assert(data.downloadChecklist.rows.length === 146, "Expected 146 focus rows in download checklist");
assert(data.worksheetGuide.length === 3, "Expected simplified 3-sheet workbook guide");

const seizeIt2 = data.downloadChecklist.rows.find((row) => row.id === "EEG-0031");
assert(seizeIt2?.decision === "已下载·时长已审计", "SeizeIT2 must remain completed, not pending");
assert(approx(seizeIt2?.auditedHours, 11626.24888888889), "Unexpected SeizeIT2 audited hours");
for (const row of data.downloadChecklist.rows.filter((item) => ["已申请·等待访问", "需要申请/登录"].includes(item.decision))) {
  assert(/^https?:\/\//.test(row.applicationPage), `Missing application page for ${row.id}`);
}
assert(data.downloadChecklist.rows.find((row) => row.id === "EEG-0093")?.decision === "已下载·待信号/时长审计", "PD-Mortality should reflect the completed server download");
assert(data.downloadChecklist.rows.find((row) => row.id === "EEG-0122")?.focusType === "健康/人群", "DOD-H should be classified as health");
assert(data.downloadChecklist.rows.find((row) => row.id === "EEG-0122")?.decision === "已下载·待信号/时长审计", "DOD-H should reflect the completed server download");
assert(data.downloadChecklist.rows.find((row) => row.id === "EEG-0058")?.decision === "登录后可下载", "MODMA should reflect approved login access");
assert(data.downloadChecklist.rows.find((row) => row.id === "EEG-0519")?.decision === "登录后可下载", "CHBMP should reflect approved LORIS access");

const counted = focusRows.filter((row) => row.downloadedCountInTotal);
assert(counted.every((row) => row.auditPresence === "EEG_SIGNAL_PRESENT"), "Non-signal row included in current raw total");
assert(!counted.some((row) => ["EEG-0007", "EEG-0050", "EEG-0101"].includes(row.id)), "Excluded signal row counted");
assert(!counted.some((row) => ["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"].includes(row.id)), "TUH child overlap counted with TUEG");

console.log(JSON.stringify({
  status: "PASS",
  checkedAt: "2026-08-23",
  catalogRows: rows.length,
  focusRows: focusRows.length,
  currentRaw: metrics.currentRaw,
  additions: metrics.additions,
  projected: metrics.projected,
  tueg: metrics.tueg,
  neuroAtlas: neuroAtlasComparison,
}, null, 2));
