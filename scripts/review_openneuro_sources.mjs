import fs from 'node:fs/promises';
const dir = new URL('../outputs/catalog-review-20260906/', import.meta.url);
await fs.mkdir(dir, { recursive: true });
const ids = ['ds005896','ds005901','ds002620','ds002366','ds002316','ds002738','ds004484','ds004493','ds004478','ds006265','ds006266'];
async function get(url) {
  try { const r = await fetch(url, {signal: AbortSignal.timeout(25000)}); return {url,status:r.status,text:r.ok?await r.text():''}; }
  catch(e) { return {url,error:e.message,text:''}; }
}
const snapshots = await Promise.all(ids.map(async id => {
  const files = await Promise.all(['README','dataset_description.json','participants.tsv'].map(file => get(`https://raw.githubusercontent.com/OpenNeuroDatasets/${id}/master/${file}`)));
  return {id,files};
}));
await fs.writeFile(new URL('duplicate-source-evidence.json',dir), JSON.stringify(snapshots,null,2));
console.log(JSON.stringify(snapshots.map(r => ({id:r.id,readme:r.files[0].text.slice(0,9000),description:r.files[1].text,participantsLines:r.files[2].text.trim().split('\n').length-1})),null,2));
