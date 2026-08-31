import fs from "node:fs/promises";

const catalogUrl = new URL("../public/catalog-data.json", import.meta.url);
const outputUrl = new URL("../data/eeg-openneuro-duration-audit.json", import.meta.url);
const endpoint = "https://openneuro.org/crn/graphql";
const verifiedAt = "2026-08-31";
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=", 2);
  return [key, value];
}));
const sampleCount = Math.max(1, Number(args.get("samples") ?? 3));
const workerCount = Math.max(1, Number(args.get("workers") ?? 24));
const limit = Number(args.get("limit") ?? Number.POSITIVE_INFINITY);
const requestedIds = new Set((args.get("ids") ?? "").split(",").filter(Boolean));
const resume = args.get("resume") === "true";
const replaceExisting = args.get("replace") === "true";

const catalog = JSON.parse(await fs.readFile(catalogUrl, "utf8"));
const focusIds = new Set(catalog.downloadChecklist.rows.map((row) => row.id));
const rows = catalog.catalogRows
  .filter((row) => !focusIds.has(row.id) && row.durationHours == null)
  .map((row) => ({
    id: row.id,
    name: row.name,
    accessions: [...new Set((`${row.stableId ?? ""} ${row.url ?? ""}`.match(/ds\d+/gi) ?? []).map((value) => value.toLowerCase()))],
  }))
  .filter((row) => row.accessions.length > 0)
  .filter((row) => !requestedIds.size || requestedIds.has(row.id))
  .slice(0, limit);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pending = [];
let active = 0;
const withNetworkSlot = async (work) => {
  if (active >= workerCount * 2) await new Promise((resolve) => pending.push(resolve));
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
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await withNetworkSlot(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: { "user-agent": "Big-Data-EEG-duration-auditor/1.0", ...(options.headers ?? {}) },
          });
          if (!response.ok && response.status !== 206) throw new Error(`HTTP ${response.status}`);
          return response;
        } finally {
          clearTimeout(timeout);
        }
      });
    } catch (error) {
      lastError = error;
      if (attempt < 4) await sleep(attempt * 600);
    }
  }
  throw lastError;
}

async function graphql(accessions) {
  const fields = accessions.map((accession, index) => `d${index}: dataset(id: "${accession}") { latestSnapshot { tag summary { subjects } } }`).join("\n");
  const response = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: `query EegDurationSubjects { ${fields} }` }),
  });
  return response.json();
}

const accessionInfo = new Map();
const accessions = [...new Set(rows.flatMap((row) => row.accessions))];
for (let offset = 0; offset < accessions.length; offset += 20) {
  const batch = accessions.slice(offset, offset + 20);
  const payload = await graphql(batch);
  for (const [index, accession] of batch.entries()) {
    const snapshot = payload.data?.[`d${index}`]?.latestSnapshot;
    accessionInfo.set(accession, {
      snapshotTag: snapshot?.tag ?? null,
      subjects: snapshot?.summary?.subjects ?? [],
    });
  }
  console.log(`Loaded OpenNeuro metadata: ${Math.min(offset + batch.length, accessions.length)}/${accessions.length}`);
}

const decodeXml = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", "\"")
  .replaceAll("&apos;", "'");

async function listSubjectFiles(accession, subject) {
  const objects = [];
  let continuation = "";
  do {
    const url = new URL("https://s3.amazonaws.com/openneuro.org/");
    url.searchParams.set("list-type", "2");
    url.searchParams.set("prefix", `${accession}/sub-${subject.replace(/^sub-/, "")}/`);
    if (continuation) url.searchParams.set("continuation-token", continuation);
    const response = await fetchWithRetry(url);
    const xml = await response.text();
    const blocks = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((match) => match[1]);
    for (const block of blocks) {
      const key = decodeXml(block.match(/<Key>(.*?)<\/Key>/)?.[1] ?? "");
      const size = Number(block.match(/<Size>(.*?)<\/Size>/)?.[1] ?? 0);
      if (key) objects.push({ key, size });
    }
    continuation = decodeXml(xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)?.[1] ?? "");
  } while (continuation);
  return objects.filter((object) => !/\/(?:derivatives|sourcedata)\//i.test(object.key));
}

const objectUrl = (key) => `https://s3.amazonaws.com/openneuro.org/${key.split("/").map(encodeURIComponent).join("/")}`;

async function fetchBytes(key, range = null) {
  const response = await fetchWithRetry(objectUrl(key), { headers: range ? { range } : {} });
  return Buffer.from(await response.arrayBuffer());
}

async function jsonDuration(key) {
  try {
    const response = await fetchWithRetry(objectUrl(key));
    const payload = await response.json();
    const value = Number(payload.RecordingDuration);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function parseEdfDuration(header) {
  if (header.length < 256) return null;
  const records = Number(header.subarray(236, 244).toString("ascii").trim());
  const secondsPerRecord = Number(header.subarray(244, 252).toString("ascii").trim());
  const value = records * secondsPerRecord;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseBrainVisionHeader(text, object, objectMap) {
  const value = (name) => text.match(new RegExp(`^${name}\\s*=\\s*(.+)$`, "im"))?.[1]?.trim() ?? null;
  const channels = Number(value("NumberOfChannels"));
  const samplingIntervalUs = Number(value("SamplingInterval"));
  const points = Number(value("DataPoints"));
  if (Number.isFinite(points) && points > 0 && Number.isFinite(samplingIntervalUs) && samplingIntervalUs > 0) {
    return points * samplingIntervalUs / 1_000_000;
  }
  const dataFile = value("DataFile");
  const binaryFormat = value("BinaryFormat")?.toUpperCase();
  const bytesPerSample = binaryFormat === "IEEE_FLOAT_32" ? 4 : binaryFormat === "INT_32" ? 4 : binaryFormat === "INT_16" ? 2 : null;
  if (!dataFile || !bytesPerSample || !Number.isFinite(channels) || channels <= 0 || !Number.isFinite(samplingIntervalUs) || samplingIntervalUs <= 0) return null;
  const directory = object.key.slice(0, object.key.lastIndexOf("/") + 1);
  // Some BIDS conversions rename the binary payload but leave the original
  // DataFile basename in the vendor header. Prefer the declared file and then
  // fall back to the BIDS-matched .eeg sidecar.
  const dataObject = objectMap.get(`${directory}${dataFile}`)
    ?? objectMap.get(object.key.replace(/\.vhdr$/i, ".eeg"));
  if (!dataObject?.size) return null;
  return (dataObject.size / bytesPerSample / channels) * samplingIntervalUs / 1_000_000;
}

async function signalDuration(object, objectMap) {
  const jsonKey = object.key.replace(/\.(?:edf|bdf|vhdr|set|fif)$/i, ".json");
  if (objectMap.has(jsonKey)) {
    const duration = await jsonDuration(jsonKey);
    if (duration) return { seconds: duration, method: "BIDS RecordingDuration" };
  }
  if (/\.(?:edf|bdf)$/i.test(object.key)) {
    const duration = parseEdfDuration(await fetchBytes(object.key, "bytes=0-511"));
    if (duration) return { seconds: duration, method: "EDF/BDF header" };
  }
  if (/\.vhdr$/i.test(object.key)) {
    const text = (await fetchBytes(object.key)).toString("utf8");
    const duration = parseBrainVisionHeader(text, object, objectMap);
    if (duration) return { seconds: duration, method: "BrainVision header" };
  }
  return null;
}

const signalPattern = /_(?:eeg|ieeg)\.(?:edf|bdf|vhdr|set|fif)$/i;
const chooseSubjects = (subjects, count) => {
  if (!subjects.length) return [];
  const size = Math.min(count, subjects.length);
  if (size === 1) return [subjects[Math.floor(subjects.length / 2)]];
  const indexes = Array.from({ length: size }, (_, index) => Math.round(index * (subjects.length - 1) / (size - 1)));
  return [...new Set(indexes.map((index) => subjects[index]))];
};

async function auditSubject(accession, subject) {
  const objects = await listSubjectFiles(accession, subject);
  const objectMap = new Map(objects.map((object) => [object.key, object]));
  const signals = objects.filter((object) => signalPattern.test(object.key));
  const results = (await Promise.all(signals.map(async (object) => {
    try {
      const duration = await signalDuration(object, objectMap);
      return duration ? { key: object.key, ...duration } : null;
    } catch {
      return null;
    }
  }))).filter(Boolean);
  if (!signals.length || !results.length) return null;
  const observedSeconds = results.reduce((sum, result) => sum + result.seconds, 0);
  const coverage = results.length / signals.length;
  return {
    subject: subject.replace(/^sub-/, ""),
    signalFiles: signals.length,
    readableSignalFiles: results.length,
    observedSeconds,
    coverage,
    estimatedSeconds: observedSeconds / coverage,
    methods: [...new Set(results.map((result) => result.method))],
  };
}

let existing = { records: [], failures: [] };
if (resume) {
  try { existing = JSON.parse(await fs.readFile(outputUrl, "utf8")); } catch { /* start clean */ }
}
const records = new Map((existing.records ?? []).map((record) => [record.id, record]));
const failures = new Map((existing.failures ?? []).map((record) => [record.id, record]));
if (replaceExisting) {
  for (const row of rows) {
    records.delete(row.id);
    failures.delete(row.id);
  }
}

const save = async () => {
  const output = {
    generatedAt: verifiedAt,
    source: "OpenNeuro public BIDS snapshots on the Registry of Open Data on AWS",
    method: `Up to ${sampleCount} evenly spaced BIDS participants per accession. Recording durations prefer BIDS RecordingDuration, then EDF/BDF or BrainVision headers. Unsampled cohorts and incomplete file coverage remain estimated.`,
    records: [...records.values()].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true })),
    failures: [...failures.values()].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true })),
  };
  await fs.writeFile(outputUrl, `${JSON.stringify(output, null, 2)}\n`, "utf8");
};

let completed = records.size + failures.size;
const queue = rows.filter((row) => !records.has(row.id) && !failures.has(row.id));
await Promise.all(Array.from({ length: workerCount }, async () => {
  while (queue.length) {
    const row = queue.shift();
    if (!row) break;
    const accessionRecords = [];
    for (const accession of row.accessions) {
      const info = accessionInfo.get(accession) ?? { snapshotTag: null, subjects: [] };
      const chosen = chooseSubjects(info.subjects, sampleCount);
      const samples = [];
      for (const subject of chosen) {
        try {
          const sample = await auditSubject(accession, subject);
          if (sample) samples.push(sample);
        } catch { /* continue with other participants */ }
      }
      if (!samples.length) continue;
      const meanSeconds = samples.reduce((sum, sample) => sum + sample.estimatedSeconds, 0) / samples.length;
      const totalHours = meanSeconds * info.subjects.length / 3600;
      accessionRecords.push({
        accession,
        snapshotTag: info.snapshotTag,
        subjects: info.subjects.length,
        sampledSubjects: samples.map((sample) => sample.subject),
        sampledSignalFiles: samples.reduce((sum, sample) => sum + sample.signalFiles, 0),
        readableSignalFiles: samples.reduce((sum, sample) => sum + sample.readableSignalFiles, 0),
        averageHoursPerSubject: Math.round((meanSeconds / 3600) * 1000) / 1000,
        estimatedTotalHours: Math.round(totalHours * 100) / 100,
        methods: [...new Set(samples.flatMap((sample) => sample.methods))],
        sourceUrl: `https://openneuro.org/datasets/${accession}${info.snapshotTag ? `/versions/${info.snapshotTag}` : ""}`,
      });
    }
    if (!accessionRecords.length) {
      failures.set(row.id, { id: row.id, name: row.name, accessions: row.accessions, reason: "No readable BIDS duration or EDF/BDF/BrainVision header in sampled participant(s)" });
    } else {
      const totalHours = accessionRecords.reduce((sum, record) => sum + record.estimatedTotalHours, 0);
      const allSubjectsSampled = accessionRecords.every((record) => record.sampledSubjects.length === record.subjects);
      const allSignalsReadable = accessionRecords.every((record) => record.sampledSignalFiles === record.readableSignalFiles);
      records.set(row.id, {
        id: row.id,
        name: row.name,
        accessions: accessionRecords,
        durationHours: Math.round(totalHours * 100) / 100,
        durationSource: allSubjectsSampled && allSignalsReadable ? "calculated" : "estimated",
        sourceUrl: accessionRecords[0].sourceUrl,
        note: allSubjectsSampled && allSignalsReadable
          ? "Calculated from every participant and every readable signal file in the cited OpenNeuro snapshot."
          : `Estimated from ${accessionRecords.reduce((sum, record) => sum + record.sampledSubjects.length, 0)} sampled BIDS participant(s); ${accessionRecords.reduce((sum, record) => sum + record.readableSignalFiles, 0)}/${accessionRecords.reduce((sum, record) => sum + record.sampledSignalFiles, 0)} sampled signal files had usable duration metadata or headers.`,
      });
    }
    completed += 1;
    if (completed % 10 === 0) {
      await save();
      console.log(`EEG duration audit: ${completed}/${rows.length} (${records.size} with timing, ${failures.size} unavailable)`);
    }
  }
}));

await save();
console.log(`OpenNeuro EEG duration audit complete: ${records.size}/${rows.length} catalog rows with calculated or estimated duration.`);
