import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the preserved EEG catalog inside Big Data", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Big Data of EEG<\/title>/i);
  assert.match(html, /Big Data of EEG/);
  assert.match(html, />EEG<\/a>/);
  assert.match(html, />fMRI<\/a>/);
  assert.match(html, /563/);
  assert.match(html, /DISEASE \/ CLINICAL/);
  assert.match(html, /ALL KNOWN COVERAGE/);
  assert.match(html, /ROW-LEVEL HOURS/);
  assert.match(html, /270,544/);
  assert.match(html, /3,785,081\.5/);
  assert.match(html, /3,821,689\.4/);
  assert.match(html, /4,033,202\.7/);
  assert.match(html, /仍有 (?:<!-- -->)?295(?:<!-- -->)? 行未知/);
  assert.match(html, /269(?:<!-- -->)?\/(?:<!-- -->)?564/);
  assert.doesNotMatch(html, /52(?:<!-- -->)?\/(?:<!-- -->)?101|1,659,549|50–60 GiB/);
  assert.match(html, /273/);
  assert.match(html, /99,537/);
  assert.match(html, /独立 raw 已获取/);
  assert.match(html, /时长已审计/);
  assert.match(html, /43,627\.8/);
  assert.match(html, /DOWNLOAD CHECKLIST/);
  assert.match(html, /3,821,689\.4|3821\.7K|382\.17/);
  assert.match(html, /Neurotech EEG Dataset/);
  assert.match(html, /医疗与疾病<\/span><strong>97<\/strong>/);
  assert.match(html, /EEG_healthcare_disease_catalog_20260823\.xlsx/);
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /aria-label=/);
  assert.match(html, /论文换算·明确范围/);
  assert.match(html, /FOUNDATION-MODEL DURATION AUDIT/);
  assert.match(html, /10,179\.98 recording h/);
  assert.match(html, /PAIRED EEG–FMRI SURVEY/);
  assert.match(html, /696\.6/);
  assert.match(html, /443/);
  assert.equal([...html.matchAll(/显示 (?:<!-- -->)?1(?:<!-- -->)?–(?:<!-- -->)?5(?:<!-- -->)? 行/g)].length, 2);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the original EEG catalog byte-for-byte", () => {
  const raw = fs.readFileSync(new URL("../public/catalog-data.json", import.meta.url));
  assert.equal(crypto.createHash("sha256").update(raw).digest("hex").toUpperCase(), "2945590BBA5D852A1A838431C6861B7BE0623F4BAAC63CC5D3DE83F10D7F54D9");
});

test("keeps Vercel SPA deep links compatible with clean URLs", () => {
  const config = JSON.parse(fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.cleanUrls, true);
  assert.deepEqual(config.rewrites, [
    { source: "/fmri", destination: "/" },
    { source: "/fmri/:path*", destination: "/" },
  ]);
});

test("server-renders the comprehensive fMRI catalog and evidence boundaries", async () => {
  const response = await render("/fmri");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Big Data of fMRI<\/title>/i);
  const canonicalCount = html.match(/CANONICAL DATASETS<\/dt><dd>(\d+)<\/dd>/);
  assert.ok(canonicalCount, "canonical fMRI count is rendered");
  assert.ok(Number(canonicalCount[1]) > 750, "catalog covers more than 750 canonical human fMRI datasets");
  const directOpenCount = html.match(/DIRECT OPEN<\/dt><dd>(\d+)<\/dd>/);
  assert.ok(directOpenCount);
  assert.ok(Number(directOpenCount[1]) > 700, "direct-open collection is broad");
  const durationCoverage = html.match(/KNOWN HOURS<\/dt><dd>(\d+)(?:<!-- -->)?\/(?:<!-- -->)?(\d+)<\/dd>/);
  assert.ok(durationCoverage, "fMRI duration coverage is rendered");
  assert.ok(Number(durationCoverage[1]) > 400, "duration audit covers substantially more than the former eight datasets");
  assert.equal(durationCoverage[2], canonicalCount[1]);
  assert.match(html, /Total fMRI hours/);
  assert.match(html, /缺失值不按 0 计入/);
  assert.match(html, /UK Biobank Brain Imaging/);
  assert.match(html, /Adolescent Brain Cognitive Development Study/);
  assert.match(html, /OpenNeuro 候选先排除衍生物/);
  assert.match(html, /reported/);
  assert.match(html, /calculated/);
  assert.match(html, /estimated/);
  assert.match(html, /unavailable/);
  assert.match(html, /高级筛选/);
  assert.match(html, /自然刺激/);
  assert.match(html, /DUA \/ application \/ controlled/);
  assert.match(html, /BrainLM: a foundation model for brain activity recordings/);
  assert.match(html, /NeuroSTORM: a foundation model for human brain dynamics/);
  assert.match(html, /查看协议、来源与限制/);
  const catalogSource = fs.readFileSync(new URL("../data/fmri-catalog.ts", import.meta.url), "utf8");
  assert.match(catalogSource, /Functional Biomedical Informatics Research Network Phase II/);
  assert.match(catalogSource, /Mind Clinical Imaging Consortium Collection/);
});

test("surfaces audited and literature-derived durations in the complete catalog", () => {
  const data = JSON.parse(fs.readFileSync(new URL("../public/catalog-data.json", import.meta.url), "utf8"));
  const mesa = data.catalogRows.find((row) => row.id === "EEG-0086");
  assert.equal(mesa.durationHours, 21721.175);
  assert.equal(mesa.durationBasis, "论文换算·明确范围");
  assert.equal(data.metrics.durationCoverage.catalogKnownUnits, 94);
  const modma = data.downloadChecklist.rows.find((row) => row.id === "EEG-0058");
  assert.equal(modma.decision, "已下载·待信号/时长审计");
  assert.equal(modma.serverCompleted, true);
  assert.equal(modma.physicalSizeGB, 7.593313997);
});

test("adds a provenance overlay for formerly missing OpenNeuro EEG durations", () => {
  const audit = JSON.parse(fs.readFileSync(new URL("../data/eeg-openneuro-duration-audit.json", import.meta.url), "utf8"));
  assert.equal(audit.records.length, 123);
  assert.equal(audit.failures.length, 14);
  assert.equal(audit.records.filter((row) => row.durationSource === "calculated").length, 4);
  assert.equal(audit.records.filter((row) => row.durationSource === "estimated").length, 119);
  const hours = audit.records.reduce((sum, row) => sum + row.durationHours, 0);
  assert.ok(Math.abs(hours - 16_531.41) < 1e-6);
  assert.equal(new Set(audit.records.flatMap((row) => row.accessions.map((item) => item.accession))).size, 134);
  const peers = audit.records.find((row) => row.id === "EEG-0239");
  assert.equal(peers.durationSource, "estimated");
  assert.equal(peers.accessions[0].sampledSubjects.length, 15);
});

test("adds only canonical literature hours and keeps paper-hour semantics explicit", () => {
  const catalog = JSON.parse(fs.readFileSync(new URL("../public/catalog-data.json", import.meta.url), "utf8"));
  const openNeuro = JSON.parse(fs.readFileSync(new URL("../data/eeg-openneuro-duration-audit.json", import.meta.url), "utf8"));
  const literature = JSON.parse(fs.readFileSync(new URL("../data/eeg-literature-duration-audit.json", import.meta.url), "utf8"));
  assert.equal(literature.records.length, 42);
  assert.ok(Math.abs(literature.records.reduce((sum, row) => sum + row.durationHours, 0) - 5_426.72) < 1e-6);
  assert.equal(new Set(literature.records.map((row) => row.id)).size, literature.records.length);
  const openNeuroIds = new Set(openNeuro.records.map((row) => row.id));
  for (const record of literature.records) {
    const row = catalog.catalogRows.find((candidate) => candidate.id === record.id);
    assert.ok(row, `${record.id} exists in the immutable catalog`);
    assert.equal(row.durationHours, null, `${record.id} was genuinely missing before overlays`);
    assert.equal(openNeuroIds.has(record.id), false, `${record.id} is not double-counted with the file audit`);
  }
  const paperAudit = fs.readFileSync(new URL("../data/eeg-foundation-paper-audit.ts", import.meta.url), "utf8");
  assert.match(paperAudit, /357,000 single-channel h/);
  assert.match(paperAudit, /1,109,545 × 30 s = 9,246\.2 processed h/);
  assert.match(paperAudit, /not reported/);
});

test("adds independently verified official and paper duration evidence without rewriting the original catalog", async () => {
  const auditUrl = new URL("../data/eeg-independent-duration-audit.ts", import.meta.url);
  auditUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const audit = await import(auditUrl.href);
  assert.equal(audit.independentDurationRecords.length, 9);
  assert.equal(new Set(audit.independentDurationRecords.map((row) => row.id)).size, 9);
  assert.equal(audit.independentDurationRecords.find((row) => row.id === "EEG-0012").durationHours, 3_300_000);
  assert.equal(audit.independentDurationRecords.find((row) => row.id === "EEG-0127").durationHours, 190_732);
  assert.equal(audit.neurotechSupplementalCatalogRow.durationHours, 212_186);

  const original = JSON.parse(fs.readFileSync(new URL("../public/catalog-data.json", import.meta.url), "utf8"));
  assert.equal(original.catalogRows.length, 563);
  assert.equal(original.catalogRows.find((row) => row.id === "EEG-0012").durationHours, null);

});

test("keeps simultaneous EEG-fMRI totals reproducible and excludes non-paired resources", async () => {
  const surveyUrl = new URL("../data/eeg-fmri-pairs.ts", import.meta.url);
  surveyUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const survey = await import(surveyUrl.href);
  assert.equal(survey.eegFmriPairSummary.datasets, 26);
  assert.equal(survey.eegFmriPairSummary.subjectEntries, 443);
  assert.equal(survey.eegFmriPairSummary.knownDurationDatasets, 25);
  assert.ok(Math.abs(survey.eegFmriPairSummary.knownPairedHours - 696.59) < 1e-6);
  assert.equal(survey.eegFmriPairSummary.addedDatasets, 9);
  assert.equal(survey.eegFmriPairSummary.firstAuditAddedDatasets, 8);
  assert.equal(survey.eegFmriPairSummary.independentResurveyAddedDatasets, 1);
  assert.equal(survey.eegFmriPairSummary.separateSessionDatasets, 7);
  assert.equal(new Set(survey.eegFmriPairs.map((row) => row.id)).size, survey.eegFmriPairs.length);
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "natview").pairedHours, 41.87);
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "g-node-epilepsy").pairing, "simultaneous");
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "schrooten").pairedHours, null);
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "gesture-speech").pairing, "derived-only");
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "ds003688").pairing, "same-participants-separate");
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "msit-dryad").pairing, "derived-only");
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "neurobolt").pairing, "not-public");
  assert.equal(survey.eegFmriPairs.find((row) => row.id === "ds004196").pairing, "same-participants-separate");
});

test("focuses on the full catalog and simplified workbook", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /COMPLETE CATALOG/);
  assert.match(html, /数据预处理/);
  assert.doesNotMatch(html, /03 · 严格预处理/);
  assert.match(html, /DOWNLOAD WORKBOOK/);
  assert.match(html, /3(?:<!-- -->)? 个工作表/);
  assert.doesNotMatch(html, /<span>正式需申请<\/span>|<span>已申请等待<\/span>|<span>尚未申请<\/span>/);
  assert.match(html, /NEUROATLAS COMPARISON/);
  assert.match(html, /download-checklist\.csv/);
  assert.doesNotMatch(html, /WHY.*AND|SCALE, WITH BOUNDARIES|11 NEW DOWNLOAD UNITS/i);
});
