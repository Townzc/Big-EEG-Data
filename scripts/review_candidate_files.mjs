import fs from 'node:fs/promises';
const dir = new URL('../outputs/catalog-review-20260906/',import.meta.url);
const ids = ['ds005515','ds005516','ds008768','ds008115','ds008108','ds008082','ds007823','ds008765','ds008039','ds005899','ds003568','ds008557','ds007022','ds005896','ds005901','ds002620','ds002366','ds006265','ds006266'];
const results=[];
for(let i=0;i<ids.length;i+=4) {
  const batch=await Promise.all(ids.slice(i,i+4).map(async id=>{
    try {
      const url=`https://api.github.com/repos/OpenNeuroDatasets/${id}/git/trees/master?recursive=1`;
      const response=await fetch(url,{signal:AbortSignal.timeout(35000),headers:{'User-Agent':'Big-EEG-Data-catalog-review'}});
      if(!response.ok) return {id,status:response.status};
      const data=await response.json();
      const signal=data.tree.filter(f=>/_(bold\.nii(\.gz)?|eeg\.(set|vhdr|edf|bdf|fif|eeg))$/i.test(f.path));
      const paths=signal.map(f=>f.path);
      const subjects=[...new Set(paths.map(p=>p.match(/(?:^|\/)(sub-[^/]+)/)?.[1]).filter(Boolean))];
      const metadata=await Promise.all(['README','dataset_description.json'].map(async name=>{const u=`https://raw.githubusercontent.com/OpenNeuroDatasets/${id}/master/${name}`;const r=await fetch(u,{signal:AbortSignal.timeout(20000)});return {url:u,status:r.status,text:r.ok?await r.text():''};}));
      return {id,url,commit:data.sha,truncated:data.truncated,signalFiles:signal.length,signalSubjects:subjects.length,subjects,samplePaths:paths.slice(0,3),files:signal,metadata};
    } catch(e){return {id,error:e.message};}
  }));
  results.push(...batch);
  console.log(JSON.stringify(batch.map(({id,status,truncated,signalFiles,signalSubjects,samplePaths,error})=>({id,status,truncated,signalFiles,signalSubjects,samplePaths,error}))));
}
await fs.writeFile(new URL('candidate-file-evidence.json',dir),JSON.stringify(results,null,2));
