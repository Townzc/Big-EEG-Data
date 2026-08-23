import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");
const sourcePath = process.argv[2]
  ?? path.resolve(siteRoot, "..", "tmp", "remote_audit_20260823", "all_status.csv");
const catalogPath = path.join(siteRoot, "work_spreadsheet", "final_catalog_data.json");
const outputPath = path.join(siteRoot, "data", "server_focus_status_20260804.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  const [rawHeaders, ...records] = rows;
  const headers = rawHeaders.map((header, index) => index === 0 ? header.replace(/^\uFEFF/, "") : header);
  return records
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

const physicalBytes = {
  "EEG-0113": 35922487667,
  "EEG-0114": 43071893776,
  "EEG-0121": 4259327851,
  "EEG-0123": 13210689017,
  "EEG-0124": 95116020667,
  "EEG-0138": 312924643894,
  "EEG-0143": 8900349601,
  "EEG-0144": 8715274636,
  "EEG-0345": 110710683953,
  "EEG-0493": 18289919,
};

if (!fs.existsSync(sourcePath)) throw new Error(`Server status CSV not found: ${sourcePath}`);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const focusIds = new Set(catalog.focusRows.map((row) => row.id));
const statusRows = parseCsv(fs.readFileSync(sourcePath, "utf8"));
const byId = new Map(statusRows.map((row) => [row.list_id, row]));

const rows = [...focusIds].sort().map((id) => {
  const row = byId.get(id);
  return {
    id,
    datasetName: row?.dataset_name || catalog.focusRows.find((item) => item.id === id)?.name || "",
    finalStatus: row?.final_status || "NOT_IN_SERVER_AUDIT",
    finalReason: row?.final_reason || "",
    automationPolicy: row?.automation_policy || "",
    handler: row?.handler || "",
    workbookStatus: row?.workbook_status || "",
    serverCategory: row?.category || "",
    serverSubcategory: row?.subcategory || "",
    stableIdentifier: row?.stable_identifier || "",
    relativeDirectory: row?.relative_directory || "",
    physicalBytes: physicalBytes[id] ?? null,
  };
});

const output = {
  snapshotAt: "2026-08-04T01:33:09-04:00",
  checkedAt: "2026-08-23",
  source: "Seawulf reports/auto_v2/all_status.csv plus read-only physical-directory checks",
  focusRows: rows.length,
  completedRows: rows.filter((row) => row.finalStatus === "COMPLETED").length,
  rows,
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, focusRows: rows.length, completedRows: output.completedRows }, null, 2));
