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

test("server-renders the current EEG research workflow", async () => {
  const response=await render();assert.equal(response.status,200);const html=(await response.text()).replace(/<!--.*?-->/gs,'');
  assert.match(html,/<title>Big Data of EEG<\/title>/i);
  assert.match(html,/查找 EEG 数据集/);assert.match(html,/疾病主题/);assert.match(html,/研究人群/);
  assert.match(html,/采集记录与数据预处理复核/);assert.match(html,/brain-data-catalog-current\.xlsx/);
  const { preprocessing } = JSON.parse(fs.readFileSync(new URL('../data/eeg-catalog-reconciliation.json', import.meta.url), 'utf8'));
  assert.match(html,/疾病类全量复核结果/);
  for (const value of [preprocessing.outputs, preprocessing.traceableIdentities, preprocessing.unitReviewOutputs]) assert.ok(html.includes(value.toLocaleString('en-US')));
  assert.match(html,/disease-preprocessing-summary-20260913\.csv/);
  assert.match(html,/匿名来源仍可能有人物重叠/);
  assert.match(html,/67 个有统一格式产物/);assert.match(html,/UCDDB 已完成原始计数隔离、待微伏校准/);assert.match(html,/29 个未下载/);
  assert.match(html,/EEG_catalog_20260906\.xlsx/);assert.match(html,/lang="zh-CN"/);
  assert.doesNotMatch(html,/Your site is taking shape|Building your site/);
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

test("server-renders fMRI search, protocol filters and evidence boundaries", async () => {
  const response=await render('/fmri');assert.equal(response.status,200);const html=(await response.text()).replace(/<!--.*?-->/gs,'');
  assert.match(html,/<title>Big Data of fMRI<\/title>/i);
  assert.match(html,/查找 fMRI 数据集/);assert.match(html,/年龄区间下界/);assert.match(html,/TR ≤ ms/);
  assert.match(html,/可能包含对照、随访或同一队列/);assert.match(html,/多回波|扫描准备时间/);
  assert.match(html,/BrainLM: a foundation model for brain activity recordings/);
  assert.match(html,/fmri-catalog-current\.csv/);
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

test("keeps current exports and historical snapshots visibly distinct",async()=>{
  const response=await render();const html=await response.text();
  assert.match(html,/当前完整 XLSX/);assert.match(html,/历史 EEG 工作簿（563 行）/);
  assert.match(html,/统计口径/);assert.match(html,/未知保持空白/);assert.match(html,/HEEDB 按团队口径归入睡眠/);
});
