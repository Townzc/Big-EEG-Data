import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(here, "..", "work_spreadsheet", "final_catalog_data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const { metrics, rows, additions, focusRows } = data;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const approx = (actual, expected, tolerance = 1e-6) =>
  Math.abs(actual - expected) <= tolerance;

assert(rows.length === 556, `Expected 556 rows, got ${rows.length}`);
assert(additions.length === 19, `Expected 19 additions, got ${additions.length}`);
assert(new Set(rows.map((row) => row["Unique ID"])).size === rows.length, "Duplicate Unique ID found");
assert(metrics.currentRaw.units === 57, `Expected 57 current raw units, got ${metrics.currentRaw.units}`);
assert(metrics.currentRaw.subjectRowCount === 22150, `Unexpected current subject row-count: ${metrics.currentRaw.subjectRowCount}`);
assert(metrics.currentRaw.observedSubjectLowerBound === 21132, `Unexpected observed lower bound: ${metrics.currentRaw.observedSubjectLowerBound}`);
assert(approx(metrics.currentRaw.hours, 43627.81906678666), `Unexpected current hours: ${metrics.currentRaw.hours}`);
assert(metrics.additions.subjectRowCount === 22139, `Unexpected new subject row-count: ${metrics.additions.subjectRowCount}`);
assert(approx(metrics.additions.documentedHours, 1434.8), `Unexpected new documented hours: ${metrics.additions.documentedHours}`);
assert(metrics.projected.subjectRowCount === 44289, `Unexpected projected subject row-count: ${metrics.projected.subjectRowCount}`);
assert(approx(metrics.projected.durationLowerBoundHours, 45062.61906678666), `Unexpected projected hours: ${metrics.projected.durationLowerBoundHours}`);
assert(metrics.tueg.downloadedFiles === metrics.tueg.expectedFiles, "TUEG file-count mismatch");
assert(metrics.tueg.bytes === 1756545393092, `Unexpected TUEG bytes: ${metrics.tueg.bytes}`);

const counted = focusRows.filter((row) => row.downloadedCountInTotal);
assert(counted.every((row) => row.auditPresence === "EEG_SIGNAL_PRESENT"), "Non-signal row included in current raw total");
assert(!counted.some((row) => ["EEG-0007", "EEG-0050", "EEG-0101"].includes(row.id)), "Excluded signal row counted");
assert(!counted.some((row) => ["EEG-0033", "EEG-0034", "EEG-0035", "EEG-0036", "EEG-0107"].includes(row.id)), "TUH child overlap counted with TUEG");

console.log(JSON.stringify({
  status: "PASS",
  checkedAt: "2026-08-11",
  catalogRows: rows.length,
  focusRows: focusRows.length,
  currentRaw: metrics.currentRaw,
  additions: metrics.additions,
  projected: metrics.projected,
  tueg: metrics.tueg,
}, null, 2));
