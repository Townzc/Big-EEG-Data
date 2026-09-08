import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createServer } from 'vite';

const approx = (actual, expected, tolerance = 1e-8) => Math.abs(actual - expected) <= tolerance;

test('current EEG catalog applies exclusions, aliases, taxonomy and source-package reconciliation', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { eegCatalogRows, eegCategoryStats, eegDownloadChecklistRows, eegExcludedRows, eegDurationSummary } = await server.ssrLoadModule('/data/eeg-duration.ts');
    const { currentCatalog } = await server.ssrLoadModule('/data/current-catalog.ts');
    const { eegProgress } = await server.ssrLoadModule('/data/eeg-progress.ts');
    const original = JSON.parse(fs.readFileSync(new URL('../public/catalog-data.json', import.meta.url), 'utf8'));
    const eeg = currentCatalog.filter((entry) => entry.item.modality === 'eeg').map((entry) => entry.item);
    const byId = (id) => eeg.find((row) => row.id === id);

    assert.equal(original.catalogRows.length, 563, 'historical evidence snapshot remains immutable');
    assert.equal(eegCatalogRows.length, 563, 'one non-EEG exclusion and one evidence-layer supplemental row balance');
    assert.equal(eegDownloadChecklistRows.length, 145);
    assert.equal(eeg.length, 568);
    assert.equal(new Set(eeg.map((row) => row.id)).size, eeg.length);
    assert.ok(!eeg.some((row) => row.id === 'EEG-0050'));
    assert.equal(eegExcludedRows[0].id, 'EEG-0050');
    assert.equal(eegExcludedRows[0].auditEvidence.eegChannels, 0);
    assert.ok(!eeg.some((row) => row.id === 'EEG-0488'));
    assert.ok(byId('EEG-0064').aliases.includes('EEG-0488'));
    assert.equal(byId('EEG-0064').category, '运动与交互');
    assert.equal(byId('EEG-0064').subcategory, 'P300_BCI');
    assert.equal(byId('EEG-0064').sourcePackageId, 'PhysioNet:bigp3bci:v1.0.0');
    assert.ok(!eegDownloadChecklistRows.some((row) => ['EEG-0050', 'EEG-0064'].includes(row.id)));

    const heedb = byId('EEG-0012');
    assert.equal(heedb.category, '意识与状态');
    assert.equal(heedb.subcategory, 'Sleep_Staging');
    assert.equal(heedb.hours, 3_300_000);
    assert.equal(eegDownloadChecklistRows.find((row) => row.id === heedb.id).focusType, '睡眠');
    assert.equal(eegCategoryStats.reduce((sum, category) => sum + category.count, 0), eegCatalogRows.length);
    assert.deepEqual(eegProgress.categories.map((category) => category.units), [4, 98, 64, 142, 59, 135, 43, 23]);

    const morgothIds = new Set(['EEG-0020','EEG-0021','EEG-0022','EEG-0023','EEG-0024','EEG-0025','EEG-0026','EEG-0027','EEG-0028','EEG-0103','EEG-0104','EEG-0105','EEG-0131','EEG-0132','EEG-0133','EEG-0134']);
    const morgoth = eeg.filter((row) => morgothIds.has(row.id));
    assert.equal(morgoth.length, 16);
    assert.deepEqual([...new Set(morgoth.map((row) => row.sourcePackageId))], ['BDSP:morgoth1:v1.0.0']);

    assert.equal(eegDurationSummary.catalog.preservedOriginalUnits, 563);
    assert.equal(eegDurationSummary.catalog.retainedOriginalUnits, 562);
  } finally {
    await server.close();
  }
});

test('current EEG metrics are relation-aware and preprocessing totals use the strict canonical scope', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { eegProgress } = await server.ssrLoadModule('/data/eeg-progress.ts');
    const { catalog, acquisition, preprocessing } = eegProgress;
    assert.equal(catalog.units, 568);
    assert.equal(catalog.families, 547);
    assert.equal(catalog.acquisitionPackages, 553);
    assert.equal(catalog.includedAfterRelationDedup, 558);
    assert.equal(catalog.subjectIncludedAfterRelationDedup, 558);
    assert.equal(catalog.subjectKnownAfterRelationDedup, 531);
    assert.equal(catalog.subjectMissingAfterRelationDedup, 27);
    assert.equal(catalog.subjectsAfterRelationDedup, 223_167);
    assert.equal(catalog.rawSubjectKnownUnits, 541);
    assert.equal(catalog.rawSubjectEntrySum, 261_018);
    assert.equal(catalog.durationKnownAfterRelationDedup, 267);
    assert.equal(catalog.durationMissingAfterRelationDedup, 291);
    assert.ok(approx(catalog.hoursAfterRelationDedup, 3_841_983.5865503983));
    assert.equal(catalog.rawDurationKnownUnits, 274);
    assert.ok(approx(catalog.rawDurationRowSum, 3_845_506.5699559534));
    assert.equal(catalog.publicUnits, 420);

    assert.equal(acquisition.focusExecutionUnits, 145);
    assert.equal(acquisition.focusServerCompletedUnits, 80);
    assert.equal(acquisition.focusIndependentRawUnits, 74);
    assert.equal(acquisition.focusExactDurationAuditUnits, 61);
    assert.ok(approx(acquisition.focusExactDurationAuditHours, 46_893.44359662001));
    assert.equal(acquisition.focusRelationAwareExactDurationAuditUnits, 56);
    assert.ok(approx(acquisition.focusRelationAwareExactDurationAuditHours, 43_474.54665217556));
    assert.equal(acquisition.focusAppliedWaitingUnits, 19);
    assert.equal(acquisition.focusAppliedWaitingWorkflowsApprox, 3);
    assert.equal(acquisition.focusNotYetAppliedUnits, 22);
    assert.equal(acquisition.gpfsFreeBytes, 1_979_141_062_656);
    assert.equal(acquisition.retainedFailedStagingApproxGB, 119.1);

    assert.equal(preprocessing.metricScope, 'strict_raw_continuous_canonical_targets');
    assert.equal(preprocessing.strictCompleteTargets, 62);
    assert.equal(preprocessing.effectiveTargets, 99);
    assert.equal(preprocessing.outputs, 136_214);
    assert.equal(preprocessing.subjectEntries, 21_777);
    assert.ok(approx(preprocessing.signalHours, 43_182.68243472222));
    assert.equal(preprocessing.eventRows, 3_464_162);
    assert.equal(preprocessing.derivativeBytes, 1_686_520_768_213);
    assert.match(preprocessing.deduplicationNote, /batch80/);
  } finally {
    await server.close();
  }
});

test('new local and official evidence preserves release scopes and production gates', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { currentCatalog } = await server.ssrLoadModule('/data/current-catalog.ts');
    const detail = (id) => currentCatalog.find((entry) => entry.item.id === id);

    const eeg0047 = detail('EEG-0047');
    assert.equal(eeg0047.item.subjects, 4);
    assert.equal(eeg0047.item.records, 9);
    assert.equal(eeg0047.item.hours, 1.5);
    assert.equal(eeg0047.item.evidence, 'calculated');
    assert.equal(eeg0047.item.localFiles, 4);
    assert.equal(eeg0047.item.access, '公开下载');
    assert.match(eeg0047.item.acquisitionStatus, /AUDIT_COMPLETE_PRODUCTION_GATED/);
    assert.match(eeg0047.item.subjectScope, /来源研究总体 230/);
    assert.ok(eeg0047.sources.some((source) => source.url.includes('PMC7349850')));
    assert.ok(eeg0047.sources.some((source) => source.url.includes('NS_4x_File_Formats')));

    const eeg0077 = detail('EEG-0077');
    assert.equal(eeg0077.item.subjects, 14);
    assert.ok(approx(eeg0077.item.hours, 8.848888888888888));
    assert.equal(eeg0077.item.localFiles, 16);
    assert.match(eeg0077.notes.join(' '), /yes\/no intention and target side/);
    assert.match(eeg0077.notes.join(' '), /no diagnostic labels/i);
    assert.ok(eeg0077.sources.some((source) => source.url.endsWith('/DatasetDescription.pdf')));
    assert.ok(eeg0077.sources.some((source) => source.url.includes('brainproducts.com/solutions/brainamp')));

    const mipdb = detail('EEG-0522');
    assert.equal(mipdb.item.subjects, 118);
    assert.equal(mipdb.item.records, 1515);
    assert.match(mipdb.item.population, /通常发育与临床参与者混合/);
    assert.ok(approx(mipdb.item.hours, 126.02113));
    assert.equal(mipdb.item.url, 'https://fcon_1000.projects.nitrc.org/indi/cmi_eeg/');
    assert.match(mipdb.notes.join(' '), /legacy MAT files have no unit field/);
    assert.match(mipdb.notes.join(' '), /final reference unresolved/);
    assert.ok(mipdb.sources.some((source) => source.url.includes('nm000153')));
    assert.ok(mipdb.sources.some((source) => source.url.includes('/indi/cmi_eeg/')));
    assert.ok(mipdb.sources.some((source) => source.url.includes('PMC5387929')));

    const nmt = detail('EEG-0106').item;
    assert.equal(nmt.url, 'https://www.nemar.org/dataset/nm000181');
    assert.equal(nmt.localFiles, 9676);
    assert.equal(nmt.localBytes, 14_819_739_145);
    assert.equal(nmt.sourcePackageId, 'NEMAR:nm000181');
    const m3cv = detail('EEG-0524').item;
    assert.equal(m3cv.url, 'https://www.nemar.org/dataset/nm000166');
    assert.equal(m3cv.localFiles, 18048);
    assert.equal(m3cv.population, '健康');
    assert.equal(m3cv.sourcePackageId, 'NEMAR:nm000166');
    assert.match(m3cv.rawProcessed, /Preprocessed/);
    const vepcon = detail('EEG-0101').item;
    assert.equal(vepcon.url, 'https://www.nemar.org/dataset/on003505');
    assert.equal(vepcon.localFiles, 568);
    assert.equal(vepcon.sourcePackageId, 'NEMAR:on003505');
    assert.notEqual(vepcon.acquisitionStatus, '未核实');

    const hms = detail('EEG-0014').item;
    assert.equal(hms.records, 17301);
    assert.equal(hms.subjects, 1950);
    assert.equal(hms.hours, 390.16);
    assert.match(hms.acquisitionNote, /6,559,009 NaN/);
    const aes = detail('EEG-0006').item;
    assert.equal(aes.subjects, 7);
    assert.equal(aes.records, 8002);
    assert.equal(aes.hours, 1333.6666666666667);
    assert.equal(aes.localHours, 1333.6666666666667);
    assert.equal(aes.evidence, 'reported');
    assert.match(aes.acquisitionNote, /55,677,288,438 finite values/);
    assert.match(detail('EEG-0006').notes.join(' '), /2\.757-s rounding difference/);
    const upenn = detail('EEG-0018').item;
    assert.equal(upenn.subjects, 12);
    assert.equal(upenn.records, 58837);
    assert.match(upenn.acquisitionNote, /Mixed species/i);
    const schizophrenia = detail('EEG-0060').item;
    assert.equal(schizophrenia.subjects, 40);
    assert.equal(schizophrenia.records, 11527);
    assert.match(schizophrenia.acquisitionStatus, /PRODUCTION_VALIDATED/);
    assert.match(detail('EEG-0060').notes.join(' '), /11,527 outputs/);
    assert.match(detail('EEG-0060').notes.join(' '), /23,054 events/);
    const tdbrain = detail('EEG-0061').item;
    assert.equal(tdbrain.subjects, 1274);
    assert.equal(tdbrain.records, 1464);
    assert.equal(tdbrain.localFiles, 10306);
  } finally {
    await server.close();
  }
});
