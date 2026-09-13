import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createServer } from 'vite';

const approx = (actual, expected, tolerance = 1e-8) => Math.abs(actual - expected) <= tolerance;

test('six acquired disease sources retain physical-unit and person-identity gates', async () => {
  const batch = JSON.parse(fs.readFileSync(new URL('../data/pending-six-preprocessing-20260913.json', import.meta.url), 'utf8'));
  const audit = JSON.parse(fs.readFileSync(new URL('../data/disease-preprocessing-audit-20260913.json', import.meta.url), 'utf8'));
  assert.equal(batch.passed, true);
  assert.equal(batch.entries.length, 6);
  assert.equal(batch.standardProcessedEntries, 67);
  assert.equal(batch.downloadedCalibrationBlockedEntries, 1);
  assert.equal(batch.notDownloadedEntries, 29);
  assert.equal(batch.standardProcessedEntries + batch.downloadedCalibrationBlockedEntries + batch.notDownloadedEntries, 97);
  const entry = id => batch.entries.find(row => row.id === id);
  const ucddb = entry('EEG-0606');
  assert.equal(ucddb.outputUnit, 'native_ADC_count');
  assert.equal(ucddb.outputs, 25);
  assert.equal(ucddb.verifiedSubjectEntries, 25);
  assert.equal(audit.datasets[ucddb.id], undefined, 'uncalibrated ADC counts cannot enter microvolt totals');
  assert.equal(entry('EEG-0583').verifiedSubjectEntries, 77);
  assert.equal(entry('EEG-0583').unitReviewOutputs, entry('EEG-0583').outputs);
  assert.equal(entry('EEG-0493').verifiedSubjectEntries, 84);
  assert.equal(entry('EEG-0493').outputsWithoutVerifiedSubject, 48);
  assert.equal(entry('EEG-0493').unitReviewOutputs, 48);
  assert.equal(entry('EEG-0586').verifiedSubjectEntries, 111);
  assert.ok(entry('EEG-0586').outputsWithoutVerifiedSubject >= 18);
  const standard = batch.entries.filter(row => row.id !== ucddb.id);
  assert.equal(standard.reduce((sum, row) => sum + row.outputs, 0), batch.standardOutputsAdded);
  assert.ok(approx(standard.reduce((sum, row) => sum + row.hours, 0), batch.standardHoursAdded));
  const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { currentCatalog } = await server.ssrLoadModule('/data/current-catalog.ts');
    for (const row of batch.entries) {
      const detail = currentCatalog.find(d => d.item.modality === 'eeg' && d.item.id === row.id);
      assert.equal(detail.item.category, '医疗与疾病');
      assert.equal(detail.item.acquisitionStatus, row.status);
      assert.equal(detail.item.verified, '2026-09-13');
    }
  } finally {
    await server.close();
  }
});

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
    assert.equal(eegCatalogRows.length, 563, 'two exclusions and two evidence-layer supplemental rows balance');
    assert.equal(eegDownloadChecklistRows.length, 145);
    assert.equal(eeg.length, 568);
    assert.equal(new Set(eeg.map((row) => row.id)).size, eeg.length);
    assert.ok(!eeg.some((row) => row.id === 'EEG-0050'));
    assert.ok(!eeg.some((row) => row.id === 'EEG-0007'));
    assert.ok(!eegDownloadChecklistRows.some((row) => row.id === 'EEG-0007'));
    assert.equal(eegExcludedRows.find((row) => row.id === 'EEG-0007').disposition, 'EXCLUDED_UNRECOVERABLE_RAW_EEG');
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
    assert.deepEqual(eegProgress.categories.map((category) => category.units), [4, 97, 65, 142, 59, 135, 43, 23]);

    const morgothIds = new Set(['EEG-0020','EEG-0021','EEG-0022','EEG-0023','EEG-0024','EEG-0025','EEG-0026','EEG-0027','EEG-0028','EEG-0103','EEG-0104','EEG-0105','EEG-0131','EEG-0132','EEG-0133','EEG-0134']);
    const morgoth = eeg.filter((row) => morgothIds.has(row.id));
    assert.equal(morgoth.length, 16);
    assert.deepEqual([...new Set(morgoth.map((row) => row.sourcePackageId))], ['BDSP:morgoth1:v1.0.0']);

    assert.equal(eegDurationSummary.catalog.preservedOriginalUnits, 563);
    assert.equal(eegDurationSummary.catalog.retainedOriginalUnits, 561);
  } finally {
    await server.close();
  }
});

test('current EEG metrics distinguish source scope and fully audited human disease outputs', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { eegProgress } = await server.ssrLoadModule('/data/eeg-progress.ts');
    const { catalog, acquisition, preprocessing } = eegProgress;
    assert.equal(catalog.units, 568);
    assert.equal(catalog.families, 547);
    assert.equal(catalog.acquisitionPackages, 553);
    assert.equal(catalog.includedAfterRelationDedup, 558);
    assert.equal(catalog.subjectIncludedAfterRelationDedup, 558);
    assert.equal(catalog.subjectKnownAfterRelationDedup, 532);
    assert.equal(catalog.subjectMissingAfterRelationDedup, 26);
    assert.equal(catalog.subjectsAfterRelationDedup, 228_790);
    assert.equal(catalog.rawSubjectKnownUnits, 542);
    assert.equal(catalog.rawSubjectEntrySum, 266_641);
    assert.equal(catalog.durationKnownAfterRelationDedup, 267);
    assert.equal(catalog.durationMissingAfterRelationDedup, 291);
    assert.ok(approx(catalog.hoursAfterRelationDedup, 3_841_899.399013502));
    assert.equal(catalog.rawDurationKnownUnits, 274);
    assert.ok(approx(catalog.rawDurationRowSum, 3_845_422.3824190614));
    assert.equal(catalog.publicUnits, 420);

    assert.equal(acquisition.focusExecutionUnits, 145);
    assert.equal(acquisition.focusServerCompletedUnits, 81);
    assert.equal(acquisition.focusIndependentRawUnits, 76);
    assert.equal(acquisition.focusExactDurationAuditUnits, 62);
    assert.ok(approx(acquisition.focusExactDurationAuditHours, 46_898.14494861653));
    assert.equal(acquisition.focusRelationAwareExactDurationAuditUnits, 57);
    assert.ok(approx(acquisition.focusRelationAwareExactDurationAuditHours, 43_479.248004172085));
    assert.equal(acquisition.focusAppliedWaitingUnits, 19);
    assert.equal(acquisition.focusAppliedWaitingWorkflowsApprox, 3);
    assert.equal(acquisition.focusNotYetAppliedUnits, 22);
    assert.equal(acquisition.gpfsFreeBytes, 1_528_505_040_896);
    assert.equal(acquisition.retainedFailedStagingApproxGB, 119.1);

    const audit = JSON.parse(fs.readFileSync(new URL('../data/disease-preprocessing-audit-20260913.json', import.meta.url), 'utf8'));
    assert.equal(preprocessing.metricScope, 'current_disease_human_materialized_outputs');
    assert.equal(preprocessing.auditedTargets, 67);
    assert.equal(preprocessing.outputs, 189_919);
    assert.equal(preprocessing.subjectEntries, 28_913);
    assert.equal(preprocessing.traceableIdentities, 25_469);
    assert.equal(preprocessing.outputsWithoutReliableSubject, 731);
    assert.ok(approx(preprocessing.signalHours, 45_314.30644583137));
    assert.equal(preprocessing.eventRows, 3_019_836);
    assert.equal(preprocessing.derivativeBytes, 1_739_504_213_679);
    assert.equal(preprocessing.unitReviewTargets, 20);
    assert.equal(preprocessing.unitConfirmedTargets, 47);
    assert.equal(preprocessing.unitReviewOutputs, 32_376);
    assert.equal(preprocessing.unitConfirmedOutputs, 156_134);
    const datasets = Object.values(audit.datasets);
    assert.equal(datasets.length, preprocessing.auditedTargets);
    assert.equal(datasets.reduce((sum, d) => sum + d.outputs, 0), preprocessing.outputs);
    assert.equal(datasets.reduce((sum, d) => sum + d.human_dataset_subject_entries, 0), preprocessing.subjectEntries);
    assert.ok(approx(datasets.reduce((sum, d) => sum + d.duration_hours, 0), preprocessing.signalHours));
    assert.equal(audit.disease_human.outputs + audit.disease_canine.outputs + audit.other_categories.outputs + audit.optional_tueg_overlap.outputs, audit.all_audited.outputs);
    for (const id of ['EEG-0007','EEG-0077','EEG-0609']) assert.equal(audit.datasets[id], undefined);
    assert.equal(audit.full_scan_passed, true);
    assert.equal(audit.modma_native.passed, true);
    assert.equal(audit.modma_native.old_corrupted_outputs, 7);
    assert.equal(audit.modma_native.old_corrupted_values, 1_703_972);
    assert.match(audit.modma_native.format, /int64/);
    assert.deepEqual(audit.joint_validation.final_cross_split_counts, { canonical_subject_id: 0, signal_sha256: 0 });
    assert.match(preprocessing.deduplicationNote, /匿名/);
    assert.equal(preprocessing.completionPercent, undefined, 'source catalog rows are not a preprocessing denominator');
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
    assert.match(eeg0047.item.acquisitionStatus, /PREPROCESSING_AUDITED/);
    assert.match(eeg0047.item.subjectScope, /来源研究总体 230/);
    assert.ok(eeg0047.sources.some((source) => source.url.includes('PMC7349850')));
    assert.ok(eeg0047.sources.some((source) => source.url.includes('NS_4x_File_Formats')));

    const eeg0077 = detail('EEG-0077');
    assert.equal(eeg0077.item.category, '认知与情感');
    assert.equal(eeg0077.item.subcategory, 'Attention_and_ERP');
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
    for (const id of ['EEG-0006', 'EEG-0018']) {
      const entry = detail(id);
      assert.equal(entry.original.physicalUnit, 'μV');
      assert.match(entry.original.physicalUnitStatus, /user_confirmed/);
      assert.match(entry.original.reference, /单极/);
      assert.match(entry.original.rereference, /Bipolar.*CAR/);
      assert.ok(!/unknown unit\/reference|unit and reference remain unresolved/i.test(entry.notes.join(' ')));
      assert.equal(entry.original.preprocessingStatus, 'COMPLETE_200HZ_UV100_FULLY_VALIDATED');
      assert.ok(!/preprocessing remains pending|does not mark preprocessing complete/i.test(entry.notes.join(' ')));
    }
    assert.match(detail('EEG-0058').notes.join(' '), /已邮件询问.*等待作者回复/);
    const adhd = detail('EEG-0053');
    assert.equal(adhd.item.subjects, 121);
    assert.equal(adhd.item.localFiles, 121);
    assert.equal(adhd.item.localBytes, 33_110_477);
    assert.ok(approx(adhd.item.hours, 2_166_383 / 128 / 3600));
    assert.match(adhd.item.acquisitionStatus, /MIRROR_RAW_SIGNAL/);
    assert.match(adhd.item.acquisitionNote, /403/);
    assert.match(adhd.notes.join(' '), /Channel_Labels|通道标签/);
    assert.equal(adhd.original.physicalUnit, 'μV');
    assert.equal(adhd.original.preprocessingStatus, 'COMPLETE_200HZ_UV100_FULLY_VALIDATED');
    assert.match(adhd.notes.join(' '), /μV\/100/);
    assert.ok(adhd.metrics.some(metric => metric.label === '处理范围可追踪身份' && metric.value === '121'));
    const vital = detail('EEG-0609');
    assert.equal(vital.item.category, '意识与状态');
    assert.equal(vital.item.subcategory, 'Anesthesia');
    assert.equal(vital.item.channels, 2);
    assert.equal(vital.item.sampling, 128);
    assert.equal(vital.item.subjects, 5623);
    assert.equal(vital.item.records, 5871);
    assert.equal(vital.item.localFiles, 6395);
    assert.equal(vital.item.localBytes, 102456727132);
    assert.match(vital.item.acquisitionStatus, /DOWNLOAD_COMPLETE_SHA256_VERIFIED/);
    assert.equal(vital.item.hours, null, 'case counts must not be converted to EEG hours');
    assert.equal(vital.item.evidence, 'unavailable');
    assert.match(vital.item.subjectScope, /6,090.*6,388/);
    assert.match(vital.notes.join(' '), /BIS\/BIS.*派生/);
    assert.match(vital.notes.join(' '), /Nyquist.*64 Hz/);
    assert.match(vital.notes.join(' '), /5,344.*16,785.*18,097/);
    assert.equal(vital.original.preprocessingStatus, 'COMPLETE_WITH_ONE_NATIVE_CLOCK_QUARANTINE');
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
