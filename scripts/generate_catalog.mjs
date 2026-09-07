import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createServer } from 'vite';
const root = new URL('../',import.meta.url);
const server = await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
try {
  const {currentCatalog} = await server.ssrLoadModule('/data/current-catalog.ts');
  const {catalogCsv, summarize, exportRows, exportColumns, safeExternalUrl} = await server.ssrLoadModule('/lib/catalog.ts');
  const version = crypto.createHash('sha256').update(JSON.stringify({columns:exportColumns,records:currentCatalog})).digest('hex').slice(0,12);
  const manifest={schemaVersion:1,version,reviewDate:'2026-09-06',modalities:{}};
  for(const modality of ['eeg','fmri']) {
    const details=currentCatalog.filter(x=>x.item.modality===modality);
    const ids=new Set(); const aliases=new Map();
    for(const detail of details){
      const item=detail.item;
      if(ids.has(item.id)||!/^[A-Za-z0-9_-]+$/.test(item.id))throw new Error(`Invalid/duplicate ID: ${item.id}`);
      ids.add(item.id);
      for(const key of ['subjects','hours','records','localHours','ageMin','ageMax'])if(item[key]!=null&&(!Number.isFinite(item[key])||item[key]<0))throw new Error(`Invalid ${key}: ${item.id}`);
      if(item.hours==null) item.evidence='unavailable';
      for(const alias of item.aliases.filter(a=>/^(?:ds\d{6}|EEG-[A-Z0-9-]+)$/.test(a))){if(aliases.has(alias)&&aliases.get(alias)!==item.id)throw new Error(`Duplicate alias: ${alias}`); aliases.set(alias,item.id);}
      detail.sources=detail.sources.filter(s=>safeExternalUrl(s.url));
      detail.sources=[...new Map(detail.sources.map(s=>[s.url+'|'+s.label,s])).values()];
    }
    for(const item of details.map(x=>x.item)) for(const r of item.relations)if(r.kind!=='multimodal'&&!ids.has(r.id))throw new Error(`Broken relationship ${item.id} -> ${r.id}`);
    const rows=details.map(x=>x.item).sort((a,b)=>a.id.localeCompare(b.id));
    manifest.modalities[modality]={count:rows.length,...summarize(rows)};
    const dir=new URL(`public/catalog/${modality}/`,root);await fs.mkdir(dir,{recursive:true});
    // Remove only obsolete generated detail files in this exact output directory.
    for (const name of await fs.readdir(dir)) if (/^[A-Za-z0-9_-]+\.json$/.test(name) && !['index.json','aliases.json'].includes(name) && !ids.has(name.slice(0,-5))) await fs.unlink(new URL(name,dir));
    await fs.writeFile(new URL('index.json',dir),JSON.stringify({version,rows})+'\n');
    await fs.writeFile(new URL('aliases.json',dir),JSON.stringify(Object.fromEntries(aliases))+'\n');
    for(const detail of details)await fs.writeFile(new URL(`${detail.item.id}.json`,dir),JSON.stringify({version,...detail})+'\n');
    await fs.writeFile(new URL(`public/${modality}-catalog-current.csv`,root),catalogCsv(rows));
    await fs.writeFile(new URL(`public/${modality}-catalog-current.json`,root),JSON.stringify({schemaVersion:1,version,rows:exportRows(rows)},null,2)+'\n');
  }
  await fs.writeFile(new URL('data/catalog-manifest.json',root),JSON.stringify(manifest,null,2)+'\n');
  await fs.writeFile(new URL('public/catalog/manifest.json',root),JSON.stringify(manifest,null,2)+'\n');
  if(process.argv.includes('--check-workbook')) {
    const workbook=JSON.parse(await fs.readFile(new URL('data/catalog-workbook-version.json',root)));
    if(workbook.version!==version || ['eeg','fmri'].some(m=>workbook.counts[m]!==manifest.modalities[m].count)) throw new Error('Workbook is stale. Run npm run catalog:workbook before building.');
    await fs.access(new URL('public/brain-data-catalog-current.xlsx',root));
  }
  console.log(`Catalog ${version}: ${manifest.modalities.eeg.count} EEG / ${manifest.modalities.fmri.count} fMRI`);
} finally {await server.close();}
