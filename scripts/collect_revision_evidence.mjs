import fs from 'node:fs/promises';
const out = new URL('../outputs/catalog-update-20260906/', import.meta.url);
await fs.mkdir(out, { recursive: true });
const ids = ['ds008768','ds008115','ds008108','ds005515','ds005516','ds003474','ds007020','ds005899','ds004192','ds008039','ds000030','ds004627','ds001734'];
const decode = x => x.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
async function read(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
  return r.text();
}
async function collect(id) {
  const destination = new URL(`${id}.json`, out);
  try { await fs.access(destination); return; } catch { /* resumable */ }
  let continuation = ''; const keys = [];
  do {
    const url = new URL('https://s3.amazonaws.com/openneuro.org/');
    url.searchParams.set('list-type', '2'); url.searchParams.set('prefix', `${id}/`);
    if (continuation) url.searchParams.set('continuation-token', continuation);
    const xml = await read(url);
    keys.push(...[...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m => decode(m[1])));
    continuation = decode(xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)?.[1] ?? '');
  } while (continuation);
  const signals = keys.filter(k => !/\/derivatives\//i.test(k) && /_(bold\.nii(?:\.gz)?|eeg\.(?:set|vhdr|edf|bdf|fif))$/i.test(k));
  const roots = [...new Set(signals.map(k => k.split('/sub-')[0] + '/'))];
  const metadataKeys = keys.filter(k => roots.some(root => ['README','README.md','README.txt','dataset_description.json','participants.tsv','participants.json'].includes(k.slice(root.length))));
  const metadata = await Promise.all(metadataKeys.map(async key => {
    const url = `https://s3.amazonaws.com/openneuro.org/${key}`;
    try { return { key, url, text: await read(url) }; } catch (e) { return { key, url, error: e.message }; }
  }));
  const sampleSidecars = [...new Set(signals.slice(0,4).flatMap(key => [key.replace(/\.(?:nii\.gz|nii|set|vhdr|edf|bdf|fif)$/, '.json'), ...(key.endsWith('.vhdr') ? [key] : [])]))].filter(k => keys.includes(k));
  for (const key of sampleSidecars) {
    const url = `https://s3.amazonaws.com/openneuro.org/${key}`;
    try { metadata.push({ key, url, text: await read(url) }); } catch (e) { metadata.push({ key, url, error: e.message }); }
  }
  const record = { id, checkedAt: new Date().toISOString(), roots, keys, signals, signalSubjects: [...new Set(signals.map(k => k.match(/\/sub-([^/]+)/)?.[1]).filter(Boolean))], metadata };
  await fs.writeFile(destination, JSON.stringify(record, null, 2) + '\n');
  console.log(`${id}: ${keys.length} keys, ${signals.length} signals, ${record.signalSubjects.length} signal subjects`);
}
const queue = [...ids];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) { const id = queue.shift(); try { await collect(id); } catch(e) { console.error(id, e.message); } } }));
