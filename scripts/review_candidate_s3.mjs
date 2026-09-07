import fs from 'node:fs/promises';
const dir=new URL('../outputs/catalog-review-20260906/',import.meta.url);
const ids=['ds008768','ds008115','ds008108','ds008082','ds007823','ds008765','ds008039','ds005899','ds003568','ds008557','ds007022'];
const records=await Promise.all(ids.map(async id=>{
  const url=`https://s3.amazonaws.com/openneuro.org/?list-type=2&prefix=${id}/&max-keys=1000`;
  try {
    const r=await fetch(url,{signal:AbortSignal.timeout(30000)});const xml=await r.text();
    const keys=[...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m=>m[1]);
    const signals=keys.filter(k=>!k.includes('/derivatives/')&&/_(bold\.nii(\.gz)?|eeg\.(set|vhdr|edf|bdf|fif|eeg))$/i.test(k));
    return {id,url,status:r.status,listed:keys.length,truncated:/<IsTruncated>true<\/IsTruncated>/.test(xml),signalExamples:signals.slice(0,4),signalMatchesInPage:signals.length};
  }catch(e){return {id,url,error:e.message};}
}));
await fs.writeFile(new URL('candidate-s3-evidence.json',dir),JSON.stringify(records,null,2));
console.log(JSON.stringify(records,null,2));
