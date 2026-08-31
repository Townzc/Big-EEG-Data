import fs from "node:fs/promises";
import { createGunzip } from "node:zlib";

const indexUrl = new URL("../data/openneuro-fmri-index.json", import.meta.url);
const outputUrl = new URL("../data/openneuro-duration-audit.json", import.meta.url);
const endpoint = "https://openneuro.org/crn/graphql";
const verifiedAt = "2026-08-30";
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=", 2);
  return [key, value];
}));
const minSubjects = Number(args.get("min-subjects") ?? 1);
const sampleCount = Math.max(1, Number(args.get("samples") ?? 1));
const workerCount = Math.max(1, Number(args.get("workers") ?? 36));
const networkLimit = Math.max(workerCount, Number(args.get("network") ?? 72));
const limit = Number(args.get("limit") ?? Number.POSITIVE_INFINITY);
const requestedIds = new Set((args.get("ids") ?? "").split(",").filter(Boolean));
const resume = args.get("resume") === "true";
const replaceExisting = args.get("replace") === "true";

const index = JSON.parse(await fs.readFile(indexUrl, "utf8"));
let candidates = index.datasets.filter((dataset) => dataset.subjects >= minSubjects);
if (requestedIds.size) candidates = candidates.filter((dataset) => requestedIds.has(dataset.accession));
candidates = candidates.slice(0, limit);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pending = [];
let active = 0;
const withNetworkSlot = async (work) => {
  if (active >= networkLimit) await new Promise((resolve) => pending.push(resolve));
  active += 1;
  try {
    return await work();
  } finally {
    active -= 1;
    pending.shift()?.();
  }
};

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await withNetworkSlot(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);
        try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          if (!response.ok && response.status !== 206) throw new Error(`HTTP ${response.status}`);
          return response;
        } finally {
          clearTimeout(timeout);
        }
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 750);
    }
  }
  throw lastError;
}

async function loadSubjects(batch) {
  const fields = batch.map((dataset, index) => `d${index}: dataset(id: "${dataset.accession}") { latestSnapshot { summary { subjects } } }`).join("\n");
  const response = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "Big-Data-fMRI-duration-auditor/2.0" },
    body: JSON.stringify({ query: `query DurationSubjects { ${fields} }` }),
  });
  const payload = await response.json();
  return batch.map((dataset, index) => ({
    ...dataset,
    subjectIds: payload.data?.[`d${index}`]?.latestSnapshot?.summary?.subjects ?? [],
  }));
}

const withSubjects = [];
for (let offset = 0; offset < candidates.length; offset += 20) {
  const batch = candidates.slice(offset, offset + 20);
  withSubjects.push(...await loadSubjects(batch));
  console.log(`Loaded BIDS subject labels: ${withSubjects.length}/${candidates.length}`);
}

const decodeXml = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", "\"")
  .replaceAll("&apos;", "'");

async function listSubjectFiles(accession, subject) {
  const keys = [];
  let continuation = "";
  do {
    const url = new URL("https://s3.amazonaws.com/openneuro.org/");
    url.searchParams.set("list-type", "2");
    url.searchParams.set("prefix", `${accession}/sub-${subject.replace(/^sub-/, "")}/`);
    if (continuation) url.searchParams.set("continuation-token", continuation);
    const response = await fetchWithRetry(url, { headers: { "user-agent": "Big-Data-fMRI-duration-auditor/2.0" } });
    const xml = await response.text();
    keys.push(...[...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map((match) => decodeXml(match[1])));
    continuation = decodeXml(xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)?.[1] ?? "");
  } while (continuation);
  return keys.filter((key) => !key.includes("/derivatives/") && /_bold\.nii(?:\.gz)?$/i.test(key));
}

function unzipHeader(bytes) {
  return new Promise((resolve, reject) => {
    const gunzip = createGunzip();
    const chunks = [];
    let length = 0;
    let settled = false;
    const finish = () => {
      if (settled || length < 352) return;
      settled = true;
      resolve(Buffer.concat(chunks, length).subarray(0, 352));
      gunzip.destroy();
    };
    gunzip.on("data", (chunk) => {
      chunks.push(chunk);
      length += chunk.length;
      finish();
    });
    gunzip.on("error", (error) => {
      if (!settled) reject(error);
    });
    gunzip.on("end", () => {
      if (!settled) {
        if (length >= 352) finish();
        else reject(new Error("Incomplete NIfTI header"));
      }
    });
    gunzip.end(bytes);
  });
}

function parseNifti1(header) {
  const little = header.readInt32LE(0) === 348;
  const big = header.readInt32BE(0) === 348;
  if (!little && !big) throw new Error("Unsupported NIfTI header");
  const readInt16 = little ? Buffer.prototype.readInt16LE : Buffer.prototype.readInt16BE;
  const readFloat = little ? Buffer.prototype.readFloatLE : Buffer.prototype.readFloatBE;
  const volumes = readInt16.call(header, 48);
  const temporalValue = readFloat.call(header, 92);
  const units = header.readUInt8(123) & 0x38;
  const scale = units === 16 ? 0.001 : units === 24 ? 0.000001 : 1;
  let trSeconds = temporalValue * scale;
  if (units === 0 && trSeconds > 30) trSeconds /= 1_000;
  if (!Number.isFinite(volumes) || volumes <= 0 || !Number.isFinite(trSeconds) || trSeconds <= 0 || trSeconds > 30) {
    throw new Error(`Implausible NIfTI timing (${volumes} volumes, TR ${trSeconds})`);
  }
  return { volumes, trSeconds };
}

async function readRunHeader(key) {
  const path = key.split("/").map(encodeURIComponent).join("/");
  const response = await fetchWithRetry(`https://s3.amazonaws.com/openneuro.org/${path}`, {
    headers: { range: "bytes=0-262143", "user-agent": "Big-Data-fMRI-duration-auditor/2.0" },
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const header = key.endsWith(".gz") ? await unzipHeader(bytes) : bytes.subarray(0, 352);
  return parseNifti1(header);
}

const taskFromKey = (key) => key.match(/_task-([^_/]+)/i)?.[1] ?? "unknown";
const activityForTask = (task) => {
  const value = task.toLowerCase();
  if (/rest|resting/.test(value)) return "rest";
  if (/movie|film|story|narr|audiobook|documentary|cartoon/.test(value)) return "naturalistic";
  return "task";
};

const chooseSubjects = (subjects, count) => {
  if (!subjects.length) return [];
  const indexes = count === 1
    ? [Math.floor(subjects.length / 2)]
    : Array.from({ length: Math.min(count, subjects.length) }, (_, index) => Math.round(index * (subjects.length - 1) / (Math.min(count, subjects.length) - 1)));
  return [...new Set(indexes.map((index) => subjects[index]))];
};

async function auditSubject(accession, subject) {
  const keys = await listSubjectFiles(accession, subject);
  const runs = (await Promise.all(keys.map(async (key) => {
    try {
      const header = await readRunHeader(key);
      const task = taskFromKey(key);
      return { task, activity: activityForTask(task), ...header, durationSeconds: header.volumes * header.trSeconds };
    } catch {
      return null;
    }
  }))).filter(Boolean);
  if (!runs.length) return null;
  return { subject: subject.replace(/^sub-/, ""), runs };
}

let existing = { records: [], failures: [] };
if (resume) {
  try { existing = JSON.parse(await fs.readFile(outputUrl, "utf8")); } catch { /* start clean */ }
}
const candidateAccessions = new Set(candidates.map((dataset) => dataset.accession));
const records = new Map((existing.records ?? []).filter((record) => candidateAccessions.has(record.accession)).map((record) => [record.accession, record]));
const failures = new Map((existing.failures ?? []).filter((record) => candidateAccessions.has(record.accession)).map((record) => [record.accession, record]));
if (replaceExisting) {
  for (const dataset of candidates) {
    records.delete(dataset.accession);
    failures.delete(dataset.accession);
  }
}

const save = async () => {
  const output = {
    generatedAt: verifiedAt,
    source: "OpenNeuro public BIDS snapshots on the Registry of Open Data on AWS",
    method: `NIfTI header calculation from up to ${sampleCount} evenly spaced BIDS participant(s); cohort totals are estimates unless every participant was sampled.`,
    records: [...records.values()].sort((a, b) => a.accession.localeCompare(b.accession)),
    failures: [...failures.values()].sort((a, b) => a.accession.localeCompare(b.accession)),
  };
  await fs.writeFile(outputUrl, `${JSON.stringify(output, null, 2)}\n`, "utf8");
};

let completed = records.size + failures.size;
const queue = withSubjects.filter((dataset) => !records.has(dataset.accession) && !failures.has(dataset.accession));
await Promise.all(Array.from({ length: workerCount }, async () => {
  while (queue.length) {
    const dataset = queue.shift();
    if (!dataset) break;
    const chosen = chooseSubjects(dataset.subjectIds, sampleCount);
    const samples = [];
    for (const subject of chosen) {
      try {
        const result = await auditSubject(dataset.accession, subject);
        if (result) samples.push(result);
      } catch { /* try the next sampled subject */ }
    }
    if (!samples.length) {
      failures.set(dataset.accession, { accession: dataset.accession, reason: "No readable BOLD NIfTI header found for sampled participant(s)" });
    } else {
      const runs = samples.flatMap((sample) => sample.runs);
      const sampleMinutes = samples.map((sample) => sample.runs.reduce((sum, run) => sum + run.durationSeconds, 0) / 60);
      const meanMinutes = sampleMinutes.reduce((sum, value) => sum + value, 0) / sampleMinutes.length;
      const byActivity = Object.fromEntries(["rest", "task", "naturalistic"].map((activity) => {
        const minutes = samples.map((sample) => sample.runs.filter((run) => run.activity === activity).reduce((sum, run) => sum + run.durationSeconds, 0) / 60);
        return [activity, minutes.reduce((sum, value) => sum + value, 0) / minutes.length];
      }));
      const taskMinutes = {};
      for (const run of runs) taskMinutes[run.task] = (taskMinutes[run.task] ?? 0) + run.durationSeconds / 60 / samples.length;
      const everySubjectSampled = samples.length === dataset.subjects;
      records.set(dataset.accession, {
        accession: dataset.accession,
        snapshotTag: dataset.snapshotTag,
        subjects: dataset.subjects,
        sampledSubjects: samples.map((sample) => sample.subject),
        sampledRuns: runs.length,
        averageMinutesPerSubject: Math.round(meanMinutes * 100) / 100,
        estimatedTotalHours: Math.round((meanMinutes * dataset.subjects / 60) * 100) / 100,
        estimatedRestHours: Math.round((byActivity.rest * dataset.subjects / 60) * 100) / 100,
        estimatedTaskHours: Math.round((byActivity.task * dataset.subjects / 60) * 100) / 100,
        estimatedNaturalisticHours: Math.round((byActivity.naturalistic * dataset.subjects / 60) * 100) / 100,
        taskMinutesPerSubject: Object.fromEntries(Object.entries(taskMinutes).sort(([a], [b]) => a.localeCompare(b)).map(([task, minutes]) => [task, Math.round(minutes * 100) / 100])),
        trMsRange: [Math.min(...runs.map((run) => run.trSeconds * 1_000)), Math.max(...runs.map((run) => run.trSeconds * 1_000))].map((value) => Math.round(value * 100) / 100),
        volumesRange: [Math.min(...runs.map((run) => run.volumes)), Math.max(...runs.map((run) => run.volumes))],
        durationSource: everySubjectSampled ? "calculated" : "estimated",
        sourceUrl: `https://openneuro.org/datasets/${dataset.accession}/versions/${dataset.snapshotTag}`,
        note: everySubjectSampled
          ? "Calculated from every participant's readable BOLD NIfTI headers in the cited snapshot."
          : `Estimated as the mean readable BOLD duration of ${samples.length} sampled participant(s) multiplied by ${dataset.subjects} BIDS participants; run completion can vary.`,
      });
    }
    completed += 1;
    if (completed % 20 === 0) {
      await save();
      console.log(`Duration audit: ${completed}/${withSubjects.length} (${records.size} with timing, ${failures.size} unavailable)`);
    }
  }
}));

await save();
console.log(`Duration audit complete: ${records.size}/${withSubjects.length} datasets with calculated or estimated fMRI duration.`);
