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
assert(metrics.projected.subjectRowCount === 94700, `Unexpected projected subject row-count: ${metrics.projected.subjectRowCount}`);
assert(approx(metrics.projected.durationLowerBoundHours, 346490.7408902543), `Unexpected projected hours: ${metrics.projected.durationLowerBoundHours}`);
assert(neuroAtlasComparison.match.total === 42, `Expected 42 NeuroAtlas sources, got ${neuroAtlasComparison.match.total}`);
assert(neuroAtlasComparison.match.alreadyCovered === 36, `Expected 36 pre-existing NeuroAtlas sources, got ${neuroAtlasComparison.match.alreadyCovered}`);
assert(neuroAtlasComparison.match.added === 6, `Expected 6 NeuroAtlas additions, got ${neuroAtlasComparison.match.added}`);
assert(neuroAtlasComparison.focusCoverage.diseaseUnits === 109, `Expected 109 disease units, got ${neuroAtlasComparison.focusCoverage.diseaseUnits}`);
assert(neuroAtlasComparison.focusCoverage.healthUnits === 37, `Expected 37 health units, got ${neuroAtlasComparison.focusCoverage.healthUnits}`);
assert(approx(neuroAtlasComparison.sourceUnion.coreHours, 341253.3), `Unexpected core source-union hours: ${neuroAtlasComparison.sourceUnion.coreHours}`);
assert(approx(neuroAtlasComparison.sourceUnion.extendedHours, 346490.7408902543), `Unexpected extended source-union hours: ${neuroAtlasComparison.sourceUnion.extendedHours}`);
assert(metrics.tueg.downloadedFiles === metrics.tueg.expectedFiles, "TUEG file-count mismatch");
assert(metrics.tueg.bytes === 1756545393092, `Unexpected TUEG bytes: ${metrics.tueg.bytes}`);
assert(metrics.acquisition.serverCompletedUnits === 74, "Expected 74 server-completed disease/health units");
assert(metrics.acquisition.independentRawAcquiredUnits === 67, "Expected 67 independent raw acquisitions");
assert(metrics.acquisition.diseaseRawAcquiredUnits === 55, "Expected 55 disease raw acquisitions");
assert(metrics.acquisition.healthRawAcquiredUnits === 12, "Expected 12 health raw acquisitions");
assert(metrics.acquisition.exactDurationAuditUnits === 57, "Expected 57 exact-duration audits");
assert(metrics.acquisition.actionableDownloadUnits === 68, "Expected 68 actionable remaining downloads");
assert(metrics.acquisition.discardedUnits === 4, "Expected 4 discarded downloads");
assert(data.downloadChecklist.rows.length === 146, "Expected 146 focus rows in download checklist");

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
