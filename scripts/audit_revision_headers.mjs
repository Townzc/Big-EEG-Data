import fs from 'node:fs/promises';
import { auditHeader } from './lib/signal-headers.mjs';
const folder = new URL('../outputs/catalog-update-20260906/', import.meta.url);
const ids = ['ds008768','ds007020','ds008108','ds005899','ds004192','ds008039','ds000030','ds004627','ds001734'];
for (const id of ids) {
  const path = new URL(`${id}-headers.json`, folder);
  try { await fs.access(path); continue; } catch { /* resume */ }
  const evidence = JSON.parse(await fs.readFile(new URL(`${id}.json`, folder)));
  let signals = evidence.signals;
  const sampled = ['ds000030','ds004627','ds001734'].includes(id);
  if (sampled) {
    const subjects = evidence.signalSubjects;
    const chosen = new Set([subjects[0], subjects[Math.floor(subjects.length/2)], subjects.at(-1)]);
    signals = signals.filter(k => chosen.has(k.match(/\/sub-([^/]+)/)?.[1]));
  }
  const queue = [...signals]; const records = []; const failures = [];
  await Promise.all(Array.from({ length: 12 }, async () => { while (queue.length) {
    const key = queue.shift(); const url = `https://s3.amazonaws.com/openneuro.org/${key}`;
    try { records.push({ key, ...await auditHeader(url) }); } catch (e) { failures.push({key, error:e.message}); }
  } }));
  const output = { id, checkedAt: new Date().toISOString(), sampled, totalFiles: evidence.signals.length, attempted: signals.length, records, failures };
  await fs.writeFile(path, JSON.stringify(output,null,2)+'\n');
  console.log(`${id}: ${records.length}/${signals.length} headers (${failures.length} failures)`);
}
