import fs from 'node:fs/promises';
import { auditHeader } from './lib/signal-headers.mjs';
const out = new URL('../outputs/catalog-update-20260906/', import.meta.url);
for (const id of ['ds005899','ds008115','ds005516']) {
  const path = new URL(`${id}.json`, out); const record = JSON.parse(await fs.readFile(path));
  for (const file of ['README','dataset_description.json','participants.tsv','participants.json']) {
    const url = `https://raw.githubusercontent.com/OpenNeuroDatasets/${id}/master/${file}`;
    const response = await fetch(url, {signal:AbortSignal.timeout(30000)});
    if (response.ok) record.metadata.push({key:`${id}/${file}`,url,text:await response.text()});
  }
  await fs.writeFile(path, JSON.stringify(record,null,2)+'\n');
}
const base = 'https://physionet.org/files/hmc-sleep-staging/1.1/';
const records = (await (await fetch(base+'RECORDS')).text()).trim().split(/\r?\n/);
const queue = [...records]; const headers = []; const failures = [];
await Promise.all(Array.from({length:8},async()=>{while(queue.length){const key=queue.shift();try{headers.push({key,...await auditHeader(base+key)});}catch(e){failures.push({key,error:e.message});}}}));
await fs.writeFile(new URL('hmc-headers.json',out), JSON.stringify({checkedAt:new Date().toISOString(),source:base+'RECORDS',totalFiles:records.length,records:headers,failures},null,2)+'\n');
console.log(`HMC: ${headers.length}/${records.length} headers, ${headers.reduce((n,x)=>n+x.seconds,0)/3600} h`);
const hbn = [];
for (const id of ['ds005505','ds005506','ds005507','ds005508','ds005509','ds005510','ds005511','ds005512','ds005514','ds005515','ds005516']) {
  const url = `https://raw.githubusercontent.com/OpenNeuroDatasets/${id}/master/participants.tsv`;
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});
  hbn.push({id,url,status:r.status,subjects:r.ok?(await r.text()).trim().split(/\r?\n/).slice(1).map(x=>x.split('\t')[0]):[]});
}
const pairs=[];
for(let i=0;i<hbn.length;i++)for(let j=0;j<i;j++){const prior=new Set(hbn[j].subjects);const shared=hbn[i].subjects.filter(x=>prior.has(x));if(shared.length)pairs.push({a:hbn[i].id,b:hbn[j].id,shared:shared.length});}
await fs.writeFile(new URL('hbn-release-overlap.json',out), JSON.stringify({checkedAt:new Date().toISOString(),hbn,pairs},null,2)+'\n');
console.log('HBN shared participant labels:',JSON.stringify(pairs));
