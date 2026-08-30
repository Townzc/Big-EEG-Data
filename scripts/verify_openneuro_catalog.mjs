import fs from "node:fs";

const catalog = fs.readFileSync(new URL("../data/fmri-catalog.ts", import.meta.url), "utf8");
const expected = new Map(
  [...catalog.matchAll(/openNeuro\(\{\s*accession: "(ds\d+)",\s*name: "([^"]+)"/g)]
    .map((match) => [match[1], match[2]]),
);
const accessions = [...expected.keys()];
const records = [];
let apiVersion = "unknown";
const normalizeName = (value) => value.trim().replace(/\.$/, "");

for (let offset = 0; offset < accessions.length; offset += 20) {
  const batch = accessions.slice(offset, offset + 20);
  const fields = batch.map((id, index) => `d${index}: dataset(id: "${id}") { id name }`).join("\n");
  const response = await fetch("https://openneuro.org/crn/graphql", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "Big-Data-fMRI-catalog-validator/1.0" },
    body: JSON.stringify({ query: `query VerifyCatalog { ${fields} }` }),
  });
  if (!response.ok) throw new Error(`OpenNeuro API returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors));
  apiVersion = payload.extensions?.openneuro?.version ?? apiVersion;
  for (const [index, id] of batch.entries()) records.push(payload.data[`d${index}`] ?? { id, name: null });
}

const missing = records.filter((record) => !record.name);
const renamed = records.filter((record) => record.name && normalizeName(record.name) !== normalizeName(expected.get(record.id)));
console.log(`Verified ${records.length} OpenNeuro accessions against API v${apiVersion}; ${missing.length} missing, ${renamed.length} normalized/local display names differ.`);
for (const record of renamed) console.log(`${record.id}\tLOCAL: ${expected.get(record.id)}\tOFFICIAL: ${record.name}`);
if (missing.length) {
  for (const record of missing) console.log(`MISSING\t${record.id}`);
  process.exitCode = 1;
}
