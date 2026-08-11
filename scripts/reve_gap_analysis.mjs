import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(siteRoot, "public", "catalog-data.json"), "utf8"));

const groups = {
  MOABB: [
    "AlexMI", "BNCI2014004", "BNCI2015001", "BNCI2015004", "Cho2017", "Lee2019MI",
    "Liu2024", "Ofner2017", "Shin2017A", "Weibo2014", "Zhou2016", "Schirrmeister2017",
    "Kalunga2016", "Lee2019SSVEP", "Nakanishi2015", "BI2014a", "BI2014b", "BNCI2014008",
    "BNCI2014009", "BNCI2015003", "EPFLP300", "BI2015a", "BI2015b", "Sosulski2019",
    "Lee2019ERP",
  ],
  PhysioNet: ["Siena", "ICARE"],
  OpenNeuro: [
    "ds004706", "ds004582", "ds004356", "ds004817", "ds005189", "ds003887", "ds004043",
    "ds003885", "ds004357", "ds003825", "ds004816", "ds004840", "ds005262", "ds004477",
    "ds005273", "ds004561", "ds004951", "ds004324", "ds005095", "ds005509", "ds005505",
    "ds005506", "ds005507", "ds005510", "ds005511", "ds005512", "ds005514", "ds001787",
    "ds003690", "ds004603", "ds003969", "ds004147", "ds003004", "ds002721", "ds004152",
    "ds005089", "ds004264", "ds004315", "ds004408", "ds005121", "ds003775", "ds004572",
    "ds002778", "ds003846", "ds004279", "ds004148", "ds004902", "ds002680", "ds004284",
    "ds004395", "ds005508", "ds005697", "ds005620", "ds005594", "ds005586",
  ],
  Other: ["NMT", "HMS", "SparrKULee", "Inria Large", "THINGS2", "TDBRAIN"],
  TUH: ["TUH"],
};

const aliases = {
  BNCI2014004: ["bnci0042014", "bcicompetitioniv2b"],
  BNCI2015001: ["bnci0012015"],
  Cho2017: ["chomi"],
  Lee2019MI: ["openbmi"],
  Shin2017A: ["shineegnirsmi"],
  Schirrmeister2017: ["hgd"],
  Lee2019SSVEP: ["openbmi"],
  BNCI2014008: ["bnci0082014"],
  BNCI2014009: ["bnci0092014"],
  BNCI2015003: ["bnci0032015"],
  Lee2019ERP: ["openbmi"],
  TUH: ["tueg", "templeuniversityeeg", "templeuniversityhospital"],
  Siena: ["siena", "sienascalpeeg"],
  ICARE: ["icare"],
  NMT: ["nmtscalpeeg", "nmt"],
  HMS: ["hms", "harmfulbrainactivity"],
  "Inria Large": ["inrialarge", "inriabci"],
  THINGS2: ["things2", "things-eeg2"],
  TDBRAIN: ["tdbrain"],
};

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function rowHaystack(row) {
  return normalize([
    row.id, row.name, row.stableId, row.url, row.paper, row.task,
  ].filter(Boolean).join(" "));
}

function findMatches(source) {
  const needles = [source, ...(aliases[source] ?? [])].map(normalize).filter(Boolean);
  return catalog.catalogRows.filter((row) => {
    const haystack = rowHaystack(row);
    return needles.some((needle) => haystack.includes(needle));
  });
}

const comparison = [];
for (const [platform, sources] of Object.entries(groups)) {
  for (const source of sources) {
    const matches = findMatches(source);
    comparison.push({
      platform,
      source,
      present: matches.length > 0,
      matches: matches.map((row) => `${row.id}:${row.name}`),
    });
  }
}

const byPlatform = Object.fromEntries(Object.keys(groups).map((platform) => {
  const rows = comparison.filter((row) => row.platform === platform);
  return [platform, {
    appendixNames: rows.length,
    present: rows.filter((row) => row.present).length,
    missing: rows.filter((row) => !row.present).map((row) => row.source),
  }];
}));

const result = {
  note: "REVE Table 7 claims 92 datasets, while Appendix B explicitly enumerates 89 unique source names/IDs (25 MOABB + 2 PhysioNet + 55 OpenNeuro + 6 Other + TUH).",
  appendixEnumerated: comparison.length,
  present: comparison.filter((row) => row.present).length,
  missing: comparison.filter((row) => !row.present).length,
  byPlatform,
  missingRows: comparison.filter((row) => !row.present),
  duplicateMatches: comparison.filter((row) => row.matches.length > 1),
};

const matchedCatalogIds = new Set(
  comparison.flatMap((row) => row.matches).map((match) => match.split(":")[0]),
);
const downloadedRows = catalog.focusRows.filter((row) => row.downloadedCountInTotal);
const localOnlyAuditedRows = downloadedRows
  .filter((row) => !matchedCatalogIds.has(row.id))
  .sort((a, b) => (b.downloadedHours ?? 0) - (a.downloadedHours ?? 0));
const localOnlyAuditedHours = localOnlyAuditedRows.reduce(
  (total, row) => total + (Number(row.downloadedHours) || 0),
  0,
);
const unnamedSourceCount = 92 - comparison.length;
const unnamedSourceReserveRows = localOnlyAuditedRows.slice(0, unnamedSourceCount);
const unnamedSourceReserveHours = unnamedSourceReserveRows.reduce(
  (total, row) => total + (Number(row.downloadedHours) || 0),
  0,
);
const sourceUnion = {
  method: "REVE aggregate + locally audited sources absent from the 89 explicitly named Appendix B sources",
  reveHours: 61415,
  localOnlyAuditedUnits: localOnlyAuditedRows.length,
  localOnlyAuditedHours,
  directUnionHours: 61415 + localOnlyAuditedHours,
  unnamedSourceCount,
  unnamedSourceReserveHours,
  conservativeComparableHours: 61415 + localOnlyAuditedHours - unnamedSourceReserveHours,
  reserveAssumption: "To avoid overstating coverage, the three largest local-only audited sources are reserved as possible matches for the three sources claimed by Table 7 but not named in Appendix B.",
  localOnlyAuditedRows: localOnlyAuditedRows.map((row) => ({
    id: row.id,
    name: row.name,
    hours: row.downloadedHours,
    stableId: row.stableId,
  })),
  unnamedSourceReserveRows: unnamedSourceReserveRows.map((row) => ({
    id: row.id,
    name: row.name,
    hours: row.downloadedHours,
  })),
};

catalog.reveComparison = { ...catalog.reveComparison, sourceUnion };
const finalPath = path.join(siteRoot, "work_spreadsheet", "final_catalog_data.json");
const finalData = JSON.parse(fs.readFileSync(finalPath, "utf8"));
finalData.reveComparison = { ...finalData.reveComparison, sourceUnion };
fs.writeFileSync(path.join(siteRoot, "public", "catalog-data.json"), JSON.stringify(catalog));
fs.writeFileSync(finalPath, JSON.stringify(finalData, null, 2));

const outPath = path.join(siteRoot, "work_spreadsheet", "reve_gap_analysis.json");
fs.writeFileSync(outPath, JSON.stringify({ result, comparison, sourceUnion }, null, 2));
console.log(JSON.stringify({ ...result, sourceUnion }, null, 2));
