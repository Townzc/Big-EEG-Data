import assert from "node:assert/strict";
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
  assert.match(html, /562/);
  assert.match(html, /19/);
  assert.match(html, /RAW ACQUIRED/);
  assert.match(html, />67</);
  assert.match(html, /DOWNLOAD CHECKLIST/);
  assert.match(html, /346,490\.7|346\.5K|34\.65/);
  assert.match(html, /42\/42/);
  assert.match(html, /EEG_healthcare_disease_catalog_20260823\.xlsx/);
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /aria-label=/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("focuses on the full catalog and evidence workbook", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /COMPLETE CATALOG/);
  assert.match(html, /EVIDENCE WORKBOOK/);
  assert.match(html, /19 .*WORKSHEETS|WORKSHEETS/i);
  assert.match(html, /NEUROATLAS COMPARISON/);
  assert.match(html, /download-checklist\.csv/);
  assert.doesNotMatch(html, /WHY.*AND|SCALE, WITH BOUNDARIES|11 NEW DOWNLOAD UNITS/i);
});
