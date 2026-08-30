import fs from "node:fs";

const source = fs.readFileSync(new URL("../data/fmri-catalog.ts", import.meta.url), "utf8");
const literalUrls = [...source.matchAll(/https:\/\/[^"'`\s)]+/g)].map((match) => match[0]).filter((url) => !url.includes("${"));
const openNeuroUrls = [...source.matchAll(/accession: "(ds\d+)"/g)].map((match) => `https://openneuro.org/datasets/${match[1]}`);
const discoveredUrls = [...new Set([...literalUrls, ...openNeuroUrls])].sort();
const urls = process.argv.length > 2 ? process.argv.slice(2) : discoveredUrls;

async function probe(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Big-Data-fMRI-catalog-link-check/1.0" },
    });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "Big-Data-fMRI-catalog-link-check/1.0", range: "bytes=0-1023" },
      });
    }
    const reachable = (response.status >= 200 && response.status < 400)
      || [401, 403, 429].includes(response.status)
      || (response.status === 400 && url.endsWith("/graphql"));
    return { url, status: response.status, reachable, finalUrl: response.url };
  } catch (error) {
    return { url, status: "ERR", reachable: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

const results = [];
const queue = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    if (url) results.push(await probe(url));
  }
}));

results.sort((a, b) => a.url.localeCompare(b.url));
const failed = results.filter((item) => !item.reachable);
console.log(`Checked ${results.length} unique fMRI catalog URLs; ${results.length - failed.length} reachable, ${failed.length} need review.`);
for (const item of failed) console.log(`${item.status}\t${item.url}${item.error ? `\t${item.error}` : ""}`);
if (failed.length) process.exitCode = 1;
