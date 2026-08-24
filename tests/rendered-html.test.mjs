import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the simplified BIG EEG DATA catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>BIG EEG DATA<\/title>/i);
  assert.match(html, /BIG EEG DATA/);
  assert.match(html, /563/);
  assert.match(html, /WORKSHEETS<\/dt><dd>3<\/dd>/);
  assert.match(html, /TOTAL HOURS/);
  assert.match(html, /SUBJECT ENTRIES/);
  assert.match(html, /99,537/);
  assert.match(html, /346,490(?:<!-- -->)?\+/);
  assert.match(html, /73(?:<!-- -->)? 个独立 raw/);
  assert.match(html, /DOWNLOAD CHECKLIST/);
  assert.match(html, /346,490\.7|346\.5K|34\.65/);
  assert.match(html, /42\/42/);
  assert.match(html, /EEG_healthcare_disease_catalog_20260823\.xlsx/);
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /aria-label=/);
  assert.match(html, /论文换算·明确范围/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("surfaces audited and literature-derived durations in the complete catalog", () => {
  const data = JSON.parse(fs.readFileSync(new URL("../public/catalog-data.json", import.meta.url), "utf8"));
  const mesa = data.catalogRows.find((row) => row.id === "EEG-0086");
  assert.equal(mesa.durationHours, 21721.175);
  assert.equal(mesa.durationBasis, "论文换算·明确范围");
  assert.equal(data.metrics.durationCoverage.catalogKnownUnits, 94);
});

test("focuses on the full catalog and simplified workbook", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /COMPLETE CATALOG/);
  assert.match(html, /DOWNLOAD WORKBOOK/);
  assert.match(html, /WORKSHEETS<\/dt><dd>3<\/dd>/);
  assert.match(html, /正式需申请/);
  assert.match(html, />41</);
  assert.match(html, /NEUROATLAS COMPARISON/);
  assert.match(html, /download-checklist\.csv/);
  assert.doesNotMatch(html, /WHY.*AND|SCALE, WITH BOUNDARIES|11 NEW DOWNLOAD UNITS/i);
});
