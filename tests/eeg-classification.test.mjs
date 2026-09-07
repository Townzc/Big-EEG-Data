import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createServer } from 'vite';

test('HEEDB team taxonomy reconciles catalog, checklist, category statistics and overlap-aware totals', async () => {
  const server = await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
  try {
    const {eegCatalogRows, eegCategoryStats, eegDownloadChecklistRows, eegDurationSummary, categoryDurationStats} = await server.ssrLoadModule('/data/eeg-duration.ts');
    const {eegProgress} = await server.ssrLoadModule('/data/eeg-progress.ts');
    const original = JSON.parse(fs.readFileSync(new URL('../public/catalog-data.json',import.meta.url),'utf8'));
    const row = eegCatalogRows.find(r=>r.id==='EEG-0012');
    assert.equal(row.largeCategory,'03_Consciousness_and_State');
    assert.equal(row.smallCategory,'Sleep_Staging');
    assert.match(row.verification,/团队分类/);
    assert.match(row.verification,/官方来源仍为临床 EEG/);
    assert.equal(row.durationHours,3_300_000);
    assert.equal(row.task,original.catalogRows.find(r=>r.id===row.id).task);
    assert.equal(eegCatalogRows.length,564);
    assert.equal(eegDownloadChecklistRows.find(r=>r.id===row.id).focusType,'睡眠');
    assert.equal(eegDownloadChecklistRows.length,147);
    assert.equal(eegCategoryStats.find(c=>c.code.startsWith('02_')).count,96);
    assert.equal(eegCategoryStats.find(c=>c.code.startsWith('03_')).count,64);
    assert.equal(eegCategoryStats.find(c=>c.code.startsWith('03_')).subcategories.find(c=>c.name==='Sleep_Staging').count,32);
    const categories=categoryDurationStats(eegProgress.categories);
    assert.equal(categories.find(c=>c.code==='02').subjectEntries,87_200);
    assert.equal(categories.find(c=>c.code==='03').subjectEntries,147_224);
    assert.equal(categories.reduce((s,c)=>s+c.subjectEntries,0),270_544);
    assert.equal(categories.reduce((s,c)=>s+c.subjectKnownUnits,0),545);
    assert.equal(eegDurationSummary.disease.units,109);
    assert.equal(eegDurationSummary.disease.knownUnits,75);
    assert.equal(eegDurationSummary.disease.excludedIcareUnits,0);
    assert.ok(Math.abs(eegDurationSummary.disease.knownOverlapAdjustedHours-541_757.5)<0.1);
    assert.ok(Math.abs(eegDurationSummary.catalog.sourceLevelKnownCoverageHours-3_821_689.4)<0.1);
    assert.ok(Math.abs(eegDurationSummary.catalog.rowLevelHours-4_033_202.7)<0.1);
    const csv=fs.readFileSync(new URL('../public/download-checklist.csv',import.meta.url),'utf8');
    assert.match(csv,/EEG-0012,P2,已申请·等待访问,睡眠,Sleep_Staging,/);
  } finally {await server.close();}
});
