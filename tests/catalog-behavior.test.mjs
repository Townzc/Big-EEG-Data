import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterCatalog,filtersFromUrl,filtersToUrl,initialFilters,summarize,catalogCsv,exportRows,doiList,safeExternalUrl} from '../lib/catalog.ts';
import {parseNifti,uniqueBoldRuns,discoverBidsRoots} from '../scripts/lib/signal-headers.mjs';
const load=path=>JSON.parse(fs.readFileSync(new URL(path,import.meta.url),'utf8'));
const eeg=load('../public/catalog/eeg/index.json').rows;const fmri=load('../public/catalog/fmri/index.json').rows;
const f=patch=>({...initialFilters,compare:[],...patch});

test('disease search aliases and combinations retrieve the same PD records',()=>{
  const ids=query=>filterCatalog(eeg,f({q:query})).map(x=>x.id);
  assert.deepEqual(ids('PD'),ids('Parkinson'));assert.deepEqual(ids('PD'),ids('帕金森'));
  assert.ok(ids('PD').includes('EEG-NEW-0002'));
  const selected=filterCatalog(eeg,f({disease:'帕金森',minSubjects:'200',access:'公开下载'}));
  assert.ok(selected.length>0);assert.ok(selected.every(x=>x.subjects>=200&&x.diseases.includes('帕金森')&&x.access==='公开下载'));
  assert.ok(!filterCatalog(eeg,f({category:'医疗与疾病'})).some(x=>x.id==='EEG-0012'));
});
test('filtered totals cover all pages; unknown is not zero',()=>{
  const first=filterCatalog(fmri,f({category:'医疗与疾病',page:1,pageSize:20}));
  const second=filterCatalog(fmri,f({category:'医疗与疾病',page:2,pageSize:50}));
  assert.deepEqual(summarize(first),summarize(second));assert.ok(first.length>20);
  const unknown=fmri.find(x=>x.id==='brainlat');
  assert.equal(summarize([unknown]).hours,null);assert.equal(summarize([unknown]).subjects,null);
  assert.equal(filterCatalog([unknown],f({minHours:'1'})).length,0);
  assert.equal(filterCatalog([unknown],f({minHours:'1',includeUnknown:true})).length,1);
});
test('age filters use interval intersection, not substring matching',()=>{
  const sample=fmri.find(x=>x.id==='ds005899');assert.equal(sample.ageMin,9);assert.equal(sample.ageMax,12);
  assert.equal(filterCatalog([sample],f({minAge:'10',maxAge:'11'})).length,1);
  assert.equal(filterCatalog([sample],f({minAge:'20',maxAge:'29'})).length,0);
  assert.equal(filterCatalog([sample],f({minAge:'0',maxAge:'9'})).length,1);
  assert.equal(filterCatalog([sample],f({minAge:'11',maxAge:'10',includeUnknown:true})).length,0);
  assert.equal(filterCatalog([sample],f({minAge:'-1'})).length,0);
});
test('subset suppression depends on parents in the current result and known metrics',()=>{
  const parent=eeg.find(x=>x.id==='EEG-NEW-0002'),child=eeg.find(x=>x.id==='EEG-0093');
  assert.equal(summarize([child]).subjects,94);
  assert.equal(summarize([parent,child]).subjects,312);
  assert.equal(summarize([parent,child]).hours,parent.hours);
  assert.equal(summarize([{...parent,hours:null},child]).hours,child.hours);
  const icare=eeg.find(x=>x.id==='EEG-0150'),heedb=eeg.find(x=>x.id==='EEG-0012');
  assert.equal(summarize([icare,heedb]).hours,icare.hours+heedb.hours,'partial overlaps are not discarded wholesale');
});
test('URL state round-trips filters, paging, deep links and comparisons safely',()=>{
  const state=f({q:'帕金森 / PD',category:'医疗与疾病',minAge:'0',minHours:'10.5',includeUnknown:true,page:3,pageSize:50,detail:'EEG-NEW-0002',compare:['EEG-0012','EEG-0093']});
  assert.deepEqual(filtersFromUrl(filtersToUrl(state)),state);
  const invalid=filtersFromUrl('?minHours=-1&page=-2&pageSize=999&detail=../../secrets&compare=a,b,c,d,e&sort=invalid');
  assert.equal(invalid.minHours,'');assert.equal(invalid.page,1);assert.equal(invalid.pageSize,20);assert.equal(invalid.detail,'');assert.equal(invalid.compare.length,4);assert.equal(invalid.sort,'name');
});
test('canonical identities retain aliases and cross-modality views without duplicate rows',()=>{
  assert.equal(new Set(eeg.map(x=>x.id)).size,eeg.length);assert.equal(new Set(fmri.map(x=>x.id)).size,fmri.length);
  assert.ok(!eeg.some(x=>x.id==='EEG-0488'));assert.ok(eeg.find(x=>x.id==='EEG-0064').aliases.includes('EEG-0488'));
  assert.ok(!fmri.some(x=>x.id==='ds002366'));assert.ok(fmri.find(x=>x.id==='ds002620').aliases.includes('ds002366'));
  const osaEeg=eeg.find(x=>x.id==='EEG-NEW-0004'),osaFmri=fmri.find(x=>x.id==='ds008108');
  assert.equal(osaEeg.family,osaFmri.family);assert.equal(osaEeg.subjects,142);assert.equal(osaFmri.subjects,124);
  assert.ok(Math.abs(osaFmri.hours-15.891227627727721)<1e-8);
  assert.equal(eeg.find(x=>x.id==='EEG-0127').hours,null,'HSP v3 does not inherit old release hours');
});
test('current exports match the displayed dataset values and guard spreadsheet formulas',()=>{
  const manifest=load('../data/catalog-manifest.json');const workbook=load('../data/catalog-workbook-version.json');
  assert.equal(workbook.version,manifest.version,'regenerate workbook after changing the current catalog');
  for(const [modality,rows]of [['eeg',eeg],['fmri',fmri]]){
    assert.equal(workbook.counts[modality],rows.length);
    assert.equal(load(`../public/${modality}-catalog-current.json`).version,manifest.version);
    assert.deepEqual(load(`../public/${modality}-catalog-current.json`).rows,exportRows(rows));
    assert.equal(fs.readFileSync(new URL(`../public/${modality}-catalog-current.csv`,import.meta.url),'utf8'),catalogCsv(rows));
  }
  const row={...eeg[0],name:'=HYPERLINK("https://example.org")',hours:null};
  assert.ok(catalogCsv([row]).includes("'=HYPERLINK"));assert.equal(exportRows([row])[0].hours,null);
});
test('DOIs and external links do not produce invalid doi.org placeholder links',()=>{
  assert.deepEqual(doiList('# [under revision] https://osf.io/demo'),[]);
  assert.deepEqual(doiList('doi:10.18112/openneuro.ds008108.v1.0.0; https://doi.org/10.1038/s41597-023-02806-8'),['10.18112/openneuro.ds008108.v1.0.0','10.1038/s41597-023-02806-8']);
  assert.equal(safeExternalUrl('javascript:alert(1)'),null);
});
test('NIfTI-2 timing and multi-echo run deduplication avoid inflated hours',()=>{
  const header=Buffer.alloc(540);header.writeInt32LE(540,0);header.writeBigInt64LE(240n,48);header.writeDoubleLE(0.8,136);header.writeInt32LE(8,500);
  assert.equal(parseNifti(header).seconds,192);
  header.writeInt32LE(0,500);assert.throws(()=>parseNifti(header),/temporal units/);
  const runs=uniqueBoldRuns([{key:'sub-1_task-rest_echo-1_bold.nii.gz',seconds:100},{key:'sub-1_task-rest_echo-2_bold.nii.gz',seconds:100},{key:'sub-2_task-rest_echo-1_bold.nii.gz',seconds:120}]);
  assert.equal(runs.reduce((sum,x)=>sum+x.seconds,0),220);
});
test('BIDS discovery handles nested roots without crawling raw signals',async()=>{
  const requested=[];
  const roots=await discoverBidsRoots('ds005899',async url=>{
    const prefix=url.searchParams.get('prefix');requested.push(prefix);
    return prefix==='ds005899/'?'<CommonPrefixes><Prefix>ds005899/openneuro/</Prefix></CommonPrefixes><CommonPrefixes><Prefix>ds005899/derivatives/</Prefix></CommonPrefixes>':'<CommonPrefixes><Prefix>ds005899/openneuro/sub-7155/</Prefix></CommonPrefixes>';
  });
  assert.deepEqual(roots,['ds005899/openneuro/']);assert.deepEqual(requested,['ds005899/','ds005899/openneuro/']);
});
