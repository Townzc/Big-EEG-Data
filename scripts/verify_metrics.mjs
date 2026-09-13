import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createServer } from 'vite';

const root = new URL('../', import.meta.url);
const load = (path) => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));
const approx = (actual, expected, tolerance = 1e-8) => Math.abs(actual - expected) <= tolerance;
const manifest = load('data/catalog-manifest.json');
const workbook = load('data/catalog-workbook-version.json');
const aliases = load('public/catalog/eeg/aliases.json');
const excluded = load('public/catalog/eeg/excluded.json');
const historical = fs.readFileSync(new URL('public/catalog-data.json', root));

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
try {
  const { currentCatalog } = await server.ssrLoadModule('/data/current-catalog.ts');
  const { eegProgress } = await server.ssrLoadModule('/data/eeg-progress.ts');
  const { eegDownloadChecklistRows } = await server.ssrLoadModule('/data/eeg-duration.ts');
  const { summarize } = await server.ssrLoadModule('/lib/catalog.ts');
  const eeg = currentCatalog.filter((entry) => entry.item.modality === 'eeg').map((entry) => entry.item);
  const summary = summarize(eeg);

  assert.equal(crypto.createHash('sha256').update(historical).digest('hex').toUpperCase(), '2945590BBA5D852A1A838431C6861B7BE0623F4BAAC63CC5D3DE83F10D7F54D9');
  assert.equal(eeg.length, 568);
  assert.equal(summary.families, 547);
  assert.equal(summary.acquisitionPackages, 553);
  assert.equal(summary.included, 558);
  assert.equal(summary.subjectIncluded, 558);
  assert.equal(summary.subjects, 228_790);
  assert.equal(summary.knownSubjects, 532);
  assert.equal(summary.missingSubjects, 26);
  assert.ok(approx(summary.hours, 3_841_899.399013502));
  assert.equal(summary.knownHours, 267);
  assert.equal(summary.missingHours, 291);
  assert.equal(summary.public, 420);
  assert.deepEqual(eegProgress.categories.map((category) => category.units), [4, 97, 65, 142, 59, 135, 43, 23]);
  assert.equal(eegProgress.catalog.rawSubjectKnownUnits, 542);
  assert.equal(eegProgress.catalog.rawSubjectEntrySum, 266_641);
  assert.equal(eegProgress.catalog.rawDurationKnownUnits, 274);
  assert.ok(approx(eegProgress.catalog.rawDurationRowSum, 3_845_422.3824190614));
  assert.equal(eegDownloadChecklistRows.length, 145);
  assert.equal(eegProgress.acquisition.focusExactDurationAuditUnits, 62);
  assert.equal(eegProgress.acquisition.focusRelationAwareExactDurationAuditUnits, 57);
  assert.equal(eegProgress.preprocessing.metricScope, 'current_disease_human_materialized_outputs');
  assert.equal(eegProgress.preprocessing.auditedTargets, 68);
  assert.equal(eegProgress.preprocessing.outputs, 189_944);
  assert.equal(eegProgress.preprocessing.traceableIdentities, 25_494);
  assert.equal(eegProgress.preprocessing.unitReviewTargets, 20);
  assert.equal(aliases['EEG-0488'], 'EEG-0064');
  assert.equal(aliases['EEG-0072'], 'EEG-0071');
  assert.equal(aliases['EEG-0088'], 'EEG-0073');
  assert.equal(excluded.rows.length, 2);
  assert.equal(excluded.rows[0].id, 'EEG-0050');
  assert.equal(manifest.version, workbook.version);
  assert.equal(manifest.version, excluded.version);
  assert.equal(manifest.modalities.eeg.count, eeg.length);
  assert.equal(workbook.counts.eeg, eeg.length);
  assert.equal(manifest.reviewDate, '2026-09-13');

  console.log(JSON.stringify({
    status: 'PASS',
    version: manifest.version,
    reviewDate: manifest.reviewDate,
    eeg: {
      rows: eeg.length,
      families: summary.families,
      acquisitionPackages: summary.acquisitionPackages,
      relationIncluded: summary.included,
      subjects: summary.subjects,
      hours: summary.hours,
      public: summary.public,
    },
    focus: {
      rows: eegDownloadChecklistRows.length,
      exactAuditRows: eegProgress.acquisition.focusExactDurationAuditUnits,
      relationAwareExactAuditRows: eegProgress.acquisition.focusRelationAwareExactDurationAuditUnits,
    },
    preprocessing: eegProgress.preprocessing,
  }, null, 2));
} finally {
  await server.close();
}
