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
  assert.match(html, /KNOWN COVERAGE/);
  assert.match(html, /SERVER COMPLETE/);
  assert.match(html, /SUBJECT ENTRIES/);
  assert.match(html, /265,630/);
  assert.match(html, /308,233/);
  assert.match(html, /346,490\.7/);
  assert.match(html, /其余(?:<!-- -->)?416(?:<!-- -->)?个单元尚无可加总时长/);
  assert.match(html, /52(?:<!-- -->)?\/(?:<!-- -->)?101/);
  assert.match(html, /122,219/);
  assert.match(html, /42,692\.2/);
  assert.match(html, /273/);
  assert.match(html, /99,537/);
  assert.match(html, /独立 raw 已获取/);
  assert.match(html, /其中 (?:<!-- -->)?57(?:<!-- -->)? 个有时长审计/);
  assert.match(html, /DOWNLOAD CHECKLIST/);
  assert.match(html, /346,490\.7|346\.5K|34\.65/);
  assert.match(html, /42\/42/);
  assert.match(html, /EEG_healthcare_disease_catalog_20260823\.xlsx/);
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /aria-label=/);
  assert.match(html, /论文换算·明确范围/);
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
  assert.match(html, /CANONICAL DATASETS<\/dt><dd>96<\/dd>/);
  assert.match(html, /DIRECT OPEN<\/dt><dd>68<\/dd>/);
  assert.match(html, /KNOWN HOURS<\/dt><dd>8(?:<!-- -->)?\/(?:<!-- -->)?96<\/dd>/);
  assert.match(html, /Total fMRI hours/);
  assert.match(html, /missing is not zero/);
  assert.match(html, /UK Biobank Brain Imaging/);
  assert.match(html, /Adolescent Brain Cognitive Development Study/);
  assert.match(html, /OpenNeuro 使用公开 GraphQL API/);
  assert.match(html, /reported/);
  assert.match(html, /calculated/);
  assert.match(html, /estimated/);
  assert.match(html, /unavailable/);
  assert.match(html, /Min hours \/ subject/);
  assert.match(html, /Movie \/ naturalistic/);
  assert.match(html, /DUA \/ application \/ controlled/);
  assert.match(html, /Rows/);
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

test("focuses on the full catalog and simplified workbook", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /COMPLETE CATALOG/);
  assert.match(html, /全类别数据规模与本地进度/);
  assert.match(html, /DOWNLOAD WORKBOOK/);
  assert.match(html, /3(?:<!-- -->)? 个工作表/);
  assert.match(html, /正式需申请/);
  assert.match(html, />41</);
  assert.match(html, /NEUROATLAS COMPARISON/);
  assert.match(html, /download-checklist\.csv/);
  assert.doesNotMatch(html, /WHY.*AND|SCALE, WITH BOUNDARIES|11 NEW DOWNLOAD UNITS/i);
});
