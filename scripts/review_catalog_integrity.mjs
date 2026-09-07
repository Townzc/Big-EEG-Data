import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

// Read-only audit: all generated output goes to the explicitly selected directory.
const output = path.resolve(process.argv[2] ?? 'outputs/catalog-review-20260906');
await fs.mkdir(output, { recursive: true });
const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
try {
  const { eegCatalogRows, eegDurationSummary, eegCategoryStats } = await server.ssrLoadModule('/data/eeg-duration.ts');
  const { fmriDatasets, fmriCatalogMeta } = await server.ssrLoadModule('/data/fmri-catalog.ts');
  const eeg = eegCatalogRows.map(r => ({ ...r, accessionText: `${r.url ?? ''} ${r.stableId ?? ''}` }));
  const fmri = fmriDatasets.map(r => ({ id: r.id, name: r.identification.datasetName, url: r.identification.officialWebsite, urls: r.identification.datasetUrls, doi: r.identification.doi, subjects: r.scale.subjects, hours: r.scale.totalFmriHours, notes: r.metadata, accessionText: `${r.identification.officialWebsite} ${r.identification.datasetUrls.join(' ')}`, record: r }));
  const normalizeName = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const canonicalUrl = s => { try { const u = new URL(s); u.searchParams.sort(); return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}${u.search}`.toLowerCase(); } catch { return null; } };
  const group = (rows, keys) => {
    const map = new Map();
    for (const r of rows) for (const key of new Set(keys(r).filter(Boolean))) map.set(key, [...(map.get(key) ?? []), { id: r.id, name: r.name }]);
    return [...map].filter(([, records]) => records.length > 1).map(([key, records]) => ({ key, records }));
  };
  const audit = rows => ({
    rows: rows.length,
    duplicateIds: group(rows, r => [r.id]),
    sharedAccessions: group(rows, r => r.accessionText.match(/ds\d{6}/gi) ?? []),
    sameName: group(rows, r => [normalizeName(r.name)]),
    sameUrl: group(rows, r => [r.url, ...(r.urls ?? [])].map(canonicalUrl)),
    sharedDois: group(rows, r => [r.doi, ...((r.stableId ?? '').match(/10\.\d{4,9}\/[^\s;,]+/gi) ?? [])].map(x => x?.toLowerCase()).filter(x=>/^10\.\d{4,9}\//.test(x ?? ''))),
  });
  const index = JSON.parse(await fs.readFile('data/openneuro-fmri-index.json', 'utf8'));
  const represented = new Set(fmri.flatMap(r => r.accessionText.match(/ds\d{6}/gi) ?? []));
  const summary = { eeg: audit(eeg), fmri: audit(fmri), eegDurationSummary, eegCategoryStats, fmriCatalogMeta, indexedFmriNotRepresented: index.datasets.filter(r => !represented.has(r.accession)), crossModalityAccessions: group([...eeg.map(r => ({...r,id:`EEG:${r.id}`})), ...fmri.map(r => ({...r,id:`fMRI:${r.id}`}))], r => r.accessionText.match(/ds\d{6}/gi) ?? []).filter(g => g.records.some(r => r.id.startsWith('EEG:')) && g.records.some(r => r.id.startsWith('fMRI:'))) };
  await fs.writeFile(path.join(output, 'integrity-audit.json'), JSON.stringify(summary, null, 2));
  await fs.writeFile(path.join(output, 'catalog-snapshot.json'), JSON.stringify({ eeg, fmri }, null, 2));
  console.log(JSON.stringify({ eeg: summary.eeg, fmri: summary.fmri, fmriIndexedMissing: summary.indexedFmriNotRepresented.length, crossModalityAccessions: summary.crossModalityAccessions.length }, null, 2));
} finally { await server.close(); }
