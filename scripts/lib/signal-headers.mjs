import { createGunzip } from 'node:zlib';

export const logicalBoldKey = key => key.replace(/_echo-[^_]+(?=_)/g, '');
export function uniqueBoldRuns(records) {
  const groups = new Map();
  for (const record of [...records].sort((a,b)=>a.key.localeCompare(b.key))) {
    const key = logicalBoldKey(record.key);
    const prior = groups.get(key);
    if(prior && Math.abs(prior.seconds-record.seconds)>0.01) throw new Error(`Echo timing disagreement: ${key}`);
    if(!prior) groups.set(key, record);
  }
  return [...groups.values()];
}

// Bounded metadata reads only. Never fall back to downloading a complete signal.
export async function readPrefix(url, length = 1024) {
  const response = await fetch(url, { headers: { range: `bytes=0-${length - 1}` }, signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    while (size < length) {
      const { done, value } = await reader.read(); if (done) break;
      const part = value.subarray(0, length - size); chunks.push(part); size += part.length;
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks, size);
}

export function parseNifti(header) {
  const little = [348, 540].includes(header.readInt32LE(0));
  const size = little ? header.readInt32LE(0) : header.readInt32BE(0);
  if (![348,540].includes(size)) throw new Error('Unsupported NIfTI header');
  const suffix = little ? 'LE' : 'BE';
  const volumes = size === 348 ? header[`readInt16${suffix}`](48) : Number(header[`readBigInt64${suffix}`](48));
  const interval = size === 348 ? header[`readFloat${suffix}`](92) : header[`readDouble${suffix}`](136);
  const units = (size === 348 ? header.readUInt8(123) : header[`readInt32${suffix}`](500)) & 0x38;
  if (![8, 16, 24].includes(units)) throw new Error(`Unspecified or unsupported temporal units: ${units}`);
  const trSeconds = interval * (units === 16 ? 0.001 : units === 24 ? 0.000001 : 1);
  if (!Number.isSafeInteger(volumes) || volumes <= 0 || !Number.isFinite(trSeconds) || trSeconds <= 0 || trSeconds > 30) throw new Error('Implausible NIfTI timing');
  return { seconds: volumes * trSeconds, volumes, trSeconds, format: `NIfTI-${size === 348 ? 1 : 2}` };
}

async function unzipPrefix(bytes) {
  return new Promise((resolve, reject) => {
    const stream = createGunzip(); const chunks = []; let size = 0; let finished = false;
    stream.on('data', chunk => {
      chunks.push(chunk); size += chunk.length;
      if (size >= 540 && !finished) { finished = true; resolve(Buffer.concat(chunks, size).subarray(0, 540)); stream.destroy(); }
    });
    stream.on('error', error => { if (!finished) reject(error); });
    stream.on('end', () => { if (!finished) reject(new Error('Incomplete compressed NIfTI header')); });
    stream.end(bytes);
  });
}

export async function auditHeader(url) {
  if (/\.nii(?:\.gz)?$/i.test(url)) {
    const bytes = await readPrefix(url, url.endsWith('.gz') ? 262144 : 540);
    return parseNifti(url.endsWith('.gz') ? await unzipPrefix(bytes) : bytes);
  }
  if (/\.(edf|bdf)$/i.test(url)) {
    const header = await readPrefix(url, 256);
    const records = Number(header.toString('ascii', 236, 244).trim());
    const recordSeconds = Number(header.toString('ascii', 244, 252).trim());
    const channels = Number(header.toString('ascii', 252, 256).trim());
    if (!Number.isInteger(records) || records <= 0 || !Number.isFinite(recordSeconds) || recordSeconds <= 0) throw new Error('Unknown EDF record count/duration');
    return { seconds: records * recordSeconds, records, recordSeconds, channels, format: 'EDF/BDF' };
  }
  if (url.endsWith('.vhdr')) {
    const header = (await readPrefix(url, 65536)).toString('utf8');
    const get = name => header.match(new RegExp(`^${name}=(.*)$`, 'mi'))?.[1].trim();
    const channels = Number(get('NumberOfChannels')); const interval = Number(get('SamplingInterval'));
    const bytesPerSample = { IEEE_FLOAT_32: 4, INT_16: 2, UINT_16: 2, INT_32: 4 }[get('BinaryFormat')];
    if (!channels || !interval || !bytesPerSample || get('DataFormat') !== 'BINARY') throw new Error('Unsupported BrainVision encoding');
    const dataUrl = new URL(get('DataFile'), url);
    // Signal size and ETag establish provenance without retrieving signal samples.
    const r = await fetch(dataUrl, { method: 'HEAD', signal: AbortSignal.timeout(45000) });
    if (!r.ok) throw new Error(`Signal HEAD HTTP ${r.status}`);
    const bytes = Number(r.headers.get('content-length')); const points = bytes / bytesPerSample / channels;
    if (!Number.isInteger(points) || points <= 0) throw new Error('Invalid BrainVision signal size');
    return { seconds: points * interval / 1e6, channels, samplingHz: 1e6 / interval, points, bytes, etag: r.headers.get('etag'), format: 'BrainVision' };
  }
  throw new Error('Unsupported signal format');
}

export async function discoverBidsRoots(accession, getText) {
  const found = new Set(); const queue = [`${accession}/`];
  while (queue.length) {
    const prefix = queue.shift(); let continuation = '';
    do {
      const url = new URL('https://s3.amazonaws.com/openneuro.org/');
      url.searchParams.set('list-type','2'); url.searchParams.set('delimiter','/'); url.searchParams.set('prefix',prefix);
      if (continuation) url.searchParams.set('continuation-token', continuation);
      const xml = await getText(url);
      const prefixes = [...xml.matchAll(/<CommonPrefixes><Prefix>(.*?)<\/Prefix><\/CommonPrefixes>/g)].map(m => m[1].replaceAll('&amp;', '&'));
      if (prefixes.some(p => /\/sub-[^/]+\/$/.test(p))) found.add(prefix);
      for (const p of prefixes) if (!/\/sub-|\/derivatives\/|\/sourcedata\/|\/stimuli\/|\/\./.test(p) && p.split('/').length <= 5) queue.push(p);
      continuation = xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)?.[1].replaceAll('&amp;', '&') ?? '';
    } while (continuation);
  }
  return [...found];
}
