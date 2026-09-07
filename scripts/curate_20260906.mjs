// Reproducible curation from the saved public-source evidence. Does not download signals.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { uniqueBoldRuns } from './lib/signal-headers.mjs';
const folder = new URL('../outputs/catalog-update-20260906/', import.meta.url);
const read = async file => JSON.parse(await fs.readFile(new URL(file,folder)));
const date='2026-09-06'; const entries=[]; const relations=[]; const evidence=[];
const add=(id,modality,patch,extra={})=>{entries.push({id,modality,patch,...extra});};
const relation=(from,to,modality,kind,note,source,family='')=>relations.push({from,to,modality,kind,note,source,family});
const source=(label,url,note)=>({label,url,...(note?{note}:{})});
const index=[...(await read('../catalog-review-20260906/fresh-eeg-index.json')).datasets,...(await read('../catalog-review-20260906/fresh-fmri-index.json')).datasets];
const ids={ds008768:'EEG-NEW-0002',ds008115:'EEG-NEW-0003',ds008108:'EEG-NEW-0004',ds003474:'EEG-NEW-0005',ds005515:'EEG-NEW-0006',ds005516:'EEG-NEW-0007'};
for (const accession of Object.keys(ids)) {
  const item=index.find(x=>x.accession===accession);const meta=await read(`${accession}.json`);
  const isHbn=accession.startsWith('ds0055');
  const url=`https://openneuro.org/datasets/${accession}/versions/${item.snapshotTag}`;
  add(ids[accession],'eeg',{
    name:item.name,family: isHbn?'hbn':accession,aliases:[accession],release:`OpenNeuro ${item.snapshotTag}`,category:isHbn?'健康与人群':'医疗与疾病',
    subcategory:isHbn?'Neurodevelopment':accession==='ds008108'?'Sleep_Staging':accession==='ds008768'?'Parkinsons_Disease':accession==='ds003474'?'Depression':'Pain_and_Critical_Care',
    diseases:isHbn?[]:accession==='ds008768'?['帕金森']:accession==='ds008108'?['睡眠呼吸障碍']:accession==='ds003474'?['抑郁 / 焦虑']:['疼痛 / 重症'],
    tasks:item.tasks,population:isHbn?'人群队列':accession==='ds003474'?'症状分层（非全部确诊）':accession==='ds008115'?'临床患者':'患者与对照混合',
    subjects:item.subjects,subjectScope:'当前发布 BIDS participants；不是疾病确诊人数。',
    access:['ds008115','ds005516'].includes(accession)?'访问待确认':'公开下载',
    bids:'Yes',rawProcessed:accession==='ds003474'?'Processed':isHbn?'Processed':'Raw',format:accession==='ds008768'?'BrainVision':isHbn||accession==='ds003474'?'EEGLAB .set':'EDF',
    ageMin: isHbn?item.ageMin:null,ageMax:isHbn?item.ageMax:null,sizeGb:item.sizeGb,
    verified:date,url,search:accession,
  },{datasetDois:[item.datasetDoi.replace(/^doi:/,'')],paperDois:item.paperDoi?[item.paperDoi]:accession==='ds003474'?['10.1162/cpsy_a_00024']:[],license:item.license,
    sources:[source('版本与元数据',url),...meta.metadata.filter(x=>x.text&&/README|description/.test(x.key)).map(x=>source('发布者说明',x.url))],
    notes:isHbn?['与现有 HBN Releases 1–9 的公开 participant 标签交集为 0；仍共享同一 HBN 来源家族，不声称与其他模态或外部队列已去重。']:[]});
}
function update(id,modality,patch,extra={}) {
  const entry=entries.find(x=>x.id===id&&x.modality===modality);
  if(entry){Object.assign(entry.patch,patch);for(const [k,v] of Object.entries(extra))entry[k]=Array.isArray(v)?[...(entry[k]??[]),...v]:v;}
  else add(id,modality,patch,extra);
}
async function applyHeaderEvidence(accession,id,modality,options={}) {
  const record=await read(`${accession}-headers.json`);
  const matches=key=>modality==='eeg'?/\/eeg\//.test(key):/_bold\.nii/.test(key);
  const fileRows=record.records.filter(x=>matches(x.key)),failures=record.failures.filter(x=>matches(x.key));
  const rows=modality==='fmri'?uniqueBoldRuns(fileRows):fileRows;
  const seconds=rows.reduce((n,x)=>n+x.seconds,0);
  const subjects=new Set(rows.map(x=>x.key.match(/\/sub-([^/]+)/)?.[1])).size;
  const meta=await read(`${accession}.json`); const totalSignals=meta.signals.filter(matches).length;
  const signalSubjects=new Set(meta.signals.filter(matches).map(key=>key.match(/\/sub-([^/]+)/)?.[1])).size;
  const hours=record.sampled?seconds/subjects*signalSubjects/3600:seconds/3600;
  const partial=failures.length>0;
  const scope=record.sampled?`抽样 ${subjects}/${signalSubjects} 人的全部 ${fileRows.length} 个 BOLD 文件头、${rows.length} 个采集 run；多回波计一次，以每人均值外推。`:`${fileRows.length}/${totalSignals} 个 ${modality==='eeg'?'EEG':'BOLD'} 文件头；${partial?'部分可读记录，仍有文件缺失':'公开清单全部文件'}。`;
  update(id,modality,{hours:rows.length?hours:null,evidence:record.sampled?'estimated':'calculated',hoursScope:scope,records:record.sampled?null:totalSignals,verified:date,...(options.fixSubjects?{subjects:signalSubjects,subjectScope:`公开清单有 ${modality.toUpperCase()} 信号的 participant 标签数；未经 QC 排除。`}:{}),...options.patch},
    {sources:[source('公开 BIDS 文件头与文件清单',`https://openneuro.org/datasets/${accession}`,scope)],notes:[scope,...failures.map(x=>`${x.key}: ${x.error}`)]});
  evidence.push({accession,modality,checkedAt:record.checkedAt,attempted:fileRows.length+failures.length,readable:fileRows.length,logicalRuns:rows.length,failures,totalFiles:totalSignals,sampledSubjects:subjects,signalSubjects,sampled:record.sampled,hours,source:`https://s3.amazonaws.com/openneuro.org/?list-type=2&prefix=${accession}/`,manifestSha256:crypto.createHash('sha256').update(JSON.stringify(meta.signals.filter(matches))).digest('hex')});
}
await applyHeaderEvidence('ds008768',ids.ds008768,'eeg',{patch:{channels:63,channelMax:64,sampling:500,samplingMax:25000,ageMin:40,ageMax:92.5,longitudinal:'Yes',subjectScope:'312 名独立参与者：202 PD、110 对照；358 次记录。'}});
await applyHeaderEvidence('ds007020','EEG-0093','eeg');
await applyHeaderEvidence('ds008108',ids.ds008108,'eeg',{patch:{ageMin:19,ageMax:65,subjectScope:'142 名参与者：56 OSA、86 对照；夜间 PSG，不与午睡后 fMRI 同步。'}});
update(ids.ds008108,'eeg',{}, {metrics:[{label:'临床 / 对照',value:'56 OSA / 86 control',source:'https://raw.githubusercontent.com/OpenNeuroDatasets/ds008108/master/participants.tsv'}],notes:['EEG 与 fMRI 来自不同时间点。']});
update(ids.ds008115,'eeg',{subjectScope:'公开版本 180 人；对应论文总体为 196 人。两者范围不同。'}, {notes:['已核对发布者 README、论文和 180 个 EDF 路径。S3 对元数据请求返回 403，未确认文件可下载，总时长保持未知。'],metrics:[{label:'论文研究总体',value:'196 名重症患者；不是当前公开版人数',source:'https://pubmed.ncbi.nlm.nih.gov/40245519/'}],sources:[source('原始论文','https://pubmed.ncbi.nlm.nih.gov/40245519/') ]});
update(ids.ds003474,'eeg',{}, {notes:['根据 BDI 高低筛选，不把 122 人全部标为 MDD 患者。部分通道已插值，发布者说明无更早原始文件可回退。']});
update(ids.ds005516,'eeg',{}, {notes:['公开 Git 清单登记 EEG .set 链接，当前 S3 完整清单仅找到辅助元数据；信号获取待确认，未补总小时。']});

const nmt='https://pmc.ncbi.nlm.nih.gov/articles/PMC8766964/';
add('EEG-0106','eeg',{subjects:2417,hours:625,evidence:'reported',hoursScope:'原始论文报告约 625 h；近似整库规模。',records:2417,channels:19,channelMax:19,sampling:200,samplingMax:200,verified:date}, {sources:[source('NMT 原始数据论文',nmt)],notes:['约 625 h 是作者报告的记录小时；不把每个电极的小时重复相加。']});
const hmc=await read('hmc-headers.json');
if(hmc.failures.length===0&&hmc.records.length===151) add('EEG-0125','eeg',{hours:hmc.records.reduce((n,x)=>n+x.seconds,0)/3600,evidence:'calculated',hoursScope:'PhysioNet v1.1 RECORDS 清单全部 151 个 EDF 文件头。',records:151,release:'PhysioNet v1.1',verified:date},{sources:[source('完整 RECORDS 清单',hmc.source)],notes:['只读取 EDF 头部记录数与每记录秒数；没有下载完整 PSG 信号。']});
const epilepsy='https://pubmed.ncbi.nlm.nih.gov/22738131/';
add('EEG-0011','eeg',{subjects:275,subjectScope:'2012 年原始数据库 275 人；当前可申请子集另计。',hours:null,evidence:'unavailable',verified:date},{sources:[source('EPILEPSIAE 原始论文',epilepsy)],metrics:[{label:'历史全库规模',value:'275 人；头皮与颅内 EEG 混合',source:epilepsy}],notes:['补回原论文人数。不同研究使用的 30 人头皮子集与全库不是同一范围；未将这些论文的小时直接填为当前可获取总量。']});
const brainlat='https://www.nature.com/articles/s41597-023-02806-8';
add('EEG-0102','eeg',{family:'brainlat',subjects:null,subjectScope:'780 为全模态队列；表4 EEG分组合计157，表5合计156，待按 BrainLat_records.csv 核对。',verified:date}, {sources:[source('BrainLat 原始论文',brainlat)],metrics:[{label:'全模态研究队列',value:'780 人（不是 EEG 可用人数）',source:brainlat},{label:'EEG 采集协议',value:'闭眼静息 10 分钟；不是包含准备工作的 2 小时访问',source:brainlat},{label:'EEG 表格计数待核',value:'表4：35 AD + 19 bvFTD + 29 PD + 32 MS + 42 HC = 157；表5 PD 为 28',source:brainlat}],notes:['移除将 780 名全模态参加者当作 EEG 人数的旧统计。原论文表格有计数差异，实际可用 EEG 人数与小时保留未知，不按 780 × 10 分钟估算。']});
add('EEG-0127','eeg',{family:'hsp',release:'HSP v3.0',subjects:null,subjectScope:'90,166 为 PSG + HSAT 全队列人数；有 EEG 的独立人数尚未单列。',hours:null,evidence:'unavailable',hoursScope:'v3.0 EEG 总时长未知；旧版 190,732 h 不套用于新版人数。',records:115129,verified:date,url:'https://bdsp.io/content/hsp/3.0/'}, {sources:[source('HSP v3.0','https://bdsp.io/content/hsp/3.0/')],metrics:[{label:'v3.0 全部患者',value:'90,166（含无 EEG 的 HSAT）'},{label:'v3.0 全部记录',value:'119,234 = 115,129 PSG + 4,105 HSAT'},{label:'旧版本历史证据',value:'18,973 人 / 190,732 h（SleepFM 对旧版的引用；不进入 v3.0 汇总）'}],notes:['版本更新覆盖原 HSP 入口；未另建一个独立队列。HSAT 不含 EEG。']});
add('EEG-0012','eeg',{family:'heedb',subjects:109178,subjectScope:'HEEDB v4.1 官方 patients；不是全部睡眠或 PSG 患者。',release:'v4.1 人数；总小时来自未注明版本的官方近似比较',records:284343,verified:date,category:'意识与状态',subcategory:'Sleep_Staging',diseases:[],hoursScope:'官方比较页约 330 万 h，未绑定 v4.1 精确版本；整库临床 EEG。'}, {sources:[source('HEEDB v4.1','https://bdsp.io/content/harvard-eeg-db/4.1/')],notes:['按团队口径归入睡眠，不进入疾病主题汇总；官方属性仍为临床 EEG。']});
const morgoth='https://bdsp.io/content/morgoth1/1.0.0/';
const counts={'EEG-0020':143,'EEG-0021':758,'EEG-0022':1940,'EEG-0023':636,'EEG-0024':2125,'EEG-0025':100,'EEG-0026':100,'EEG-0027':208,'EEG-0028':4886,'EEG-0103':14500,'EEG-0104':8527,'EEG-0105':10851};
for(const [id,records]of Object.entries(counts))add(id,'eeg',{records,verified:date}, {sources:[source('MORGOTH 官方 Table 1',morgoth)],notes:['官网明确列出患者与 EEG 记录数；片段长度与每人原始记录总时长不同，未用片段长度乘人数伪造整库小时。'],...(id==='EEG-0103'?{metrics:[{label:'预训练文件发布范围',value:'官网文件布局列 9,242 个预训练文件，与论文 14,500 人训练总体不同',source:morgoth}]}:{})});
for(const id of ['EEG-0053','EEG-0043','EEG-0493'])add(id,'eeg',{}, {notes:['2026-09-06 再查来源：未获得可对应当前发布范围的整库记录小时，保留未知。']});

const addFmri=async(accession,name,patch,notes=[])=>{
  const idx=index.find(x=>x.accession===accession);const meta=await read(`${accession}.json`);const desc=JSON.parse(meta.metadata.findLast(m=>m.key.endsWith('dataset_description.json')&&m.text).text);
  const doi=(idx?.datasetDoi??desc.DatasetDOI).replace(/^doi:/,'');
  add(accession,'fmri',{name,family:accession,aliases:[accession],release:`OpenNeuro ${idx?.snapshotTag??doi.match(/\.v(.+)$/)?.[1]}`,category:'认知与脑功能',subcategory:'Task fMRI',tasks:['Task-evoked'],subjects:meta.signalSubjects.length,subjectScope:'公开 BOLD 文件对应的参与者目录',access:'公开下载',bids:'Yes',rawProcessed:'Raw',format:'NIfTI',verified:date,url:`https://openneuro.org/datasets/${accession}`,search:accession,...patch},{datasetDois:[doi],license:desc.License,sources:meta.metadata.filter(m=>m.text&&/README|description/.test(m.key)).map(m=>source('发布者说明',m.url)),notes});
};
await addFmri('ds005899','ADHD Dualcontrol Dataset',{category:'医疗与疾病',subcategory:'Attention / executive',diseases:['ADHD'],population:'患者与对照混合',ageMin:9,ageMax:12,subjectScope:'61 人：26 ADHD、35 TD；每人 2 个 CSST runs。',tasks:['Task-evoked','Attention / executive']},['嵌套 openneuro/sub-* 目录已发现并完成全部 BOLD 文件头核对。']);
await applyHeaderEvidence('ds005899','ds005899','fmri',{fixSubjects:true});
await addFmri('ds004192','THINGS-fMRI',{population:'健康',subjects:3,ageMin:23,ageMax:29,rawProcessed:'Both',tasks:['Task-evoked','Resting-state'],longitudinal:'Yes'},['3 人各 12 次图像任务 session；另有 localizer、retinotopy 和 rest。与 THINGS-EEG/MEG 共享项目主题，不是同一模态记录。']);
await applyHeaderEvidence('ds004192','ds004192','fmri');
update('ds004192','fmri',{}, {paperDois:['10.7554/eLife.82580']});
add('brainlat','fmri',{name:'BrainLat — neurodegeneration resting-state fMRI',family:'brainlat',aliases:['syn51549340'],release:'2023 原始数据论文',category:'医疗与疾病',subcategory:'Resting-state',tasks:['Resting-state'],diseases:['阿尔茨海默 / 认知障碍','帕金森','多发性硬化'],population:'患者与对照混合',subjects:null,subjectScope:'原论文 780 人为全模态队列；fMRI 分表计数有差异，等待源记录清单。',hours:null,evidence:'unavailable',hoursScope:'站点协议与实际完成情况不同，整库小时未核实。',access:'需要申请',field:'1.5T / 3T',sites:'多中心',bids:'Yes',format:'NIfTI',verified:date,url:'https://www.synapse.org/Synapse:syn51549340',search:'BrainLat neurodegeneration'}, {paperDois:['10.1038/s41597-023-02806-8'],datasetDois:['10.7303/syn51549340'],sources:[source('原始数据论文',brainlat),source('官方数据页','https://www.synapse.org/Synapse:syn51549340')],notes:['原论文确认含静息态 BOLD；不是结构 MRI 候选。EEG 已有入口，此次补 fMRI 视图并共享来源家族。']});
await applyHeaderEvidence('ds008108','ds008108','fmri',{fixSubjects:true,patch:{family:'ds008108',population:'患者与对照混合',category:'医疗与疾病',diseases:['睡眠呼吸障碍'],ageMin:19,ageMax:65}});
for(const id of ['ds000030','ds004627','ds001734'])await applyHeaderEvidence(id,id,'fmri');
add('ds002620','fmri',{subjectScope:'82 个 BOLD 信号目录；participants.tsv 只有34行，元数据不完整。'}, {notes:['ds002366 全部 136 个 BOLD 的路径与 Git blob SHA 包含于此发布；已作为别名归并。人数以 BOLD 目录计数，不能将 participants.tsv 的缺行当作无信号。']});
for(const [id,suffix]of Object.entries({ds004484:'7T / 20 participants',ds004493:'3T / 16 participants',ds004478:'simultaneous EEG-fMRI / 6 participants',ds006265:'small-FOV',ds006266:'whole-brain'})) {
  const baseline=(await read('../catalog-review-20260906/catalog-snapshot.json')).fmri.find(x=>x.id===id);
  add(id,'fmri',{name:`${baseline.name} — ${suffix}`});
}
for(const id of ['ds005896','ds005901'])add(id,'fmri',{family:'ahdc'}, {notes:['同一 AHDC 研究的相关发布；两份 BOLD 目录有114个共享participant标签，但无相同Git信号链接。当前保留两个观测入口，不声称382名独立参加者。']});

const merges=[{from:'EEG-0488',into:'EEG-0064',modality:'eeg',note:'同一 bigP3BCI v1.0.0 / DOI:10.13026/0byy-ry86，Mainsah2025 为 MOABB 适配器；合并别名与工具入口。'},{from:'ds002366',into:'ds002620',modality:'fmri',note:'ds002366 的 136 个 BOLD 路径与 Git blob SHA 全部包含于 ds002620；旧 accession 保留为别名。'}];
const tuh='https://isip.piconepress.com/projects/nedc/html/tuh_eeg/index.shtml';
for(const id of ['EEG-0004','EEG-0033','EEG-0034','EEG-0035','EEG-0036','EEG-0107'])relation(id,'EEG-0582','eeg','subset','TUH 文档确认的 TUEG 子集；父库也在筛选范围时不重复累加。',tuh,'tuh');
add('EEG-0582','eeg',{family:'tuh'});
for(const id of ['EEG-0103','EEG-0104','EEG-0105'])relation(id,'EEG-0012','eeg','subset','MORGOTH HEEDB 派生任务；母库在范围内时不独立累加。',morgoth,'heedb');
relation('EEG-0150','EEG-0012','eeg','overlap','I-CARE 部分站点与 HEEDB 重叠；尚无精确文件交集，不整条扣除。','https://physionet.org/content/i-care/2.1/');
relation('EEG-0093',ids.ds008768,'eeg','subset','94/94 份 BrainVision 信号的 S3 ETag 与字节数在新库中匹配。保留死亡结局标签任务，父库在范围内时扣除子集。','https://openneuro.org/datasets/ds008768','iowa-pd');
update(ids.ds008768,'eeg',{family:'iowa-pd'}, {notes:['现有 ds007020 的 94 份信号与本发布的 S3 ETag / 字节数全部匹配。不是新增 312 + 94 个独立参加者。']});
relation('EEG-0604','EEG-0127','eeg','overlap','Moody 2026 挑战与 HSP 来源关联；比赛记录数不代表新增独立患者。','https://moody-challenge.physionet.org/2026/','hsp');
for(const [a,b]of [['ds005896','ds005901'],['ds005901','ds005896']])relation(a,b,'fmri','same-cohort','114 个相同 participant 标签；人数标签并集268，尚无完整时间/扫描去重。',`https://github.com/OpenNeuroDatasets/${a}`,'ahdc');
for(const [a,b]of [['ds002316','ds002738'],['ds002738','ds002316']])relation(a,b,'fmri','overlap','同名 rewardBeast，任务不同；重叠待确认，保留入口。',`https://github.com/OpenNeuroDatasets/${a}`,'rewardbeast');
for(const id of ['EEG-0345','EEG-0594','EEG-0595','EEG-0596','EEG-0597','EEG-0598','EEG-0599','EEG-0600','EEG-0601'])add(id,'eeg',{family:'hbn'});
const output={schemaVersion:1,reviewDate:date,entries,merges,relations};
const pdParent=await read('ds008768-headers.json');const pdChild=await read('ds007020-headers.json');
const pdKeys=new Set(pdParent.records.map(r=>`${r.etag}|${r.bytes}`));
if(pdChild.records.length!==94||!pdChild.records.every(r=>pdKeys.has(`${r.etag}|${r.bytes}`)))throw new Error('PD subset evidence changed');
const hbn=await read('hbn-release-overlap.json');
if(hbn.hbn.length!==11||hbn.hbn.some(r=>r.status!==200)||hbn.pairs.length)throw new Error('HBN overlap evidence changed');
add('EEG-0592','eeg',{url:'https://physionet.org/content/cps-dataset-sleep/1.0.0/',records:113,subjects:null,subjectScope:'官网明确报告 113 次 PSG 记录；未将记录数直接改为独立人数。',verified:date},{datasetDois:['10.13026/sxs0-h317'],sources:[source('CPS 官方发布页','https://physionet.org/content/cps-dataset-sleep/1.0.0/')],notes:['数据入口从个人账户设置页修正为实际发布页。官网未给出精确整库小时；保留未知。']});
update('EEG-0106','eeg',{release:'NMT v1.0（2022 原论文口径）'},{
  sources:[source('NMT-4K 相关新版 v1.2（受控）','https://zenodo.org/records/21405022'),source('作者新版代码与数据说明','https://github.com/dll-ncai/NMT-4k-EEG-Dataset')],
  metrics:[{label:'相关新版，未计入本条汇总',value:'NMT-4K v1.2：4,500 条 / 独立受试者；3,336 normal + 1,164 abnormal',source:'https://zenodo.org/records/21405022',note:'Zenodo 元数据标为 restricted，未公开文件列表；尚未核实与旧 NMT 的交集，不与旧版人数小时累加。'}],
  notes:['此次 2,417 人 / 约 625 h 明确限定为 NMT 原论文版本。另发现 NMT-4K v1.2，先保留独立版本证据和受控入口；核对发布清单与旧库交集后再确定替换或新增关系。']
});
await fs.writeFile(new URL('../data/catalog-revisions.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
await fs.writeFile(new URL('../data/catalog-revision-evidence.json',import.meta.url),JSON.stringify({date,headers:evidence,hmc:{source:hmc.source,files:hmc.records.length,hours:hmc.records.reduce((n,x)=>n+x.seconds,0)/3600},pdOverlap:{compared:94,matchingEtagsAndBytes:94},hbn:{releases:11,intersections:0}},null,2)+'\n');
console.log(`${entries.length} revisions, ${merges.length} merges, ${relations.length} relations`);
