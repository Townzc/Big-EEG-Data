import { eegCatalogRows, eegReconciliation } from './eeg-duration';
import { fmriDatasets } from './fmri-catalog';
import revisions from './catalog-revisions.json';
import diseaseAudit from './disease-preprocessing-audit-20260913.json';
import { diseaseTags, doiList, type CatalogItem, type CatalogDetail, type Modality } from '../lib/catalog';

const categoryNames: Record<string,string> = { '01':'信号可靠性','02':'医疗与疾病','03':'意识与状态','04':'认知与情感','05':'自然刺激解码','06':'运动与交互','07':'通用与多范式','08':'健康与人群' };
const accessNames: Record<string,string> = { DOWNLOAD_PUBLIC:'公开下载', DOWNLOAD_APPLICATION_REQUIRED:'需要申请', DOWNLOAD_UNAVAILABLE:'当前不可获取', 'Open download':'公开下载', 'Open with registration':'需要注册', 'Open with DUA':'需要 DUA', 'Application required':'需要申请', 'Controlled access':'受控访问', 'Restricted / unclear':'访问待确认' };
const numberRange = (value: unknown): [number|null,number|null] => {
  if (value == null) return [null,null];
  const text = String(value).replaceAll(',','').trim();
  const match = text.match(/^(?:约\s*|[~≈]\s*)?(\d+(?:\.\d+)?)(?:\s*[-–—]\s*(\d+(?:\.\d+)?))?/);
  return match ? [Number(match[1]), Number(match[2] ?? match[1])] : [null,null];
};
function empty(id: string, modality: Modality): CatalogItem {
  return { id, modality, name:'', aliases:[], family:id, sourcePackageId:null, release:'原目录版本；详见来源', category:'', subcategory:'', diseases:[], tasks:[], population:'未核实', subjects:null, subjectScope:'受试者条目；可能与其他队列重叠', hours:null, evidence:'unavailable', hoursScope:'范围未核实', records:null, localHours:null, access:'访问待确认', acquisitionStatus:'未核实', acquisitionNote:'', localFiles:null, localBytes:null, channels:null, channelMax:null, sampling:null, samplingMax:null, ageMin:null, ageMax:null, sizeGb:null, trMs:null, field:'Unknown', sites:'Unknown', bids:'Unknown', format:'Unknown', rawProcessed:'Unknown', longitudinal:'Unknown', verified:'', relations:[], url:'', search:'' };
}
const details: CatalogDetail[] = eegCatalogRows.map(row => {
  const [channels,channelMax] = numberRange(row.channels); const [sampling,samplingMax] = numberRange(row.samplingRate);
  const accession = `${row.url} ${row.stableId}`.match(/ds\d{6}/)?.[0];
  const rawScope = `${row.durationBasis ?? ''} ${row.durationEvidence ?? ''}`;
  const item: CatalogItem = {
    ...empty(row.id,'eeg'), name:row.name, aliases:[...new Set(row.aliases ?? [])], family:accession ?? row.id,
    category:categoryNames[row.largeCategory.slice(0,2)] ?? row.largeCategory, subcategory:row.smallCategory,
    diseases:row.id==='EEG-0012'?[]:diseaseTags(`${row.name} ${row.task} ${row.smallCategory}`),
    tasks:[...new Set((row.task ?? '').split(/[；;]+/).map(x=>x.trim()).filter(Boolean))],
    population:row.population ?? '未核实',
    subjects:row.localObservedSubjects ?? numberRange(row.subjectsDisplay)[0],
    subjectScope:row.subjectScope ?? (row.sourceSubjects != null && row.localObservedSubjects != null
      ? `当前公开/本地范围 ${row.localObservedSubjects}；来源研究总体 ${row.sourceSubjects}，两者不相加。`
      : `原始人数口径：${row.subjectsDisplay ?? '未知'}；含范围时取下界，不代表确诊患者数。`),
    hours:row.durationHours, evidence:row.durationSource ?? 'unavailable',
    hoursScope: /部分|PARTIAL/.test(rawScope) ? '部分已获取文件；不是整库总时长' : row.durationHours == null ? '未知' : row.durationSource==='estimated' ? '抽样外推或协议估算；非精确整库时长' : '原目录记录范围；详见证据',
    records:row.localObservedRecords ?? row.outputRecords ?? null,
    localHours:row.localHours ?? (/文件审计/.test(rawScope)?row.durationHours:null),
    access:accessNames[row.access] ?? '访问待确认', channels,channelMax,sampling,samplingMax,
    format:row.format ?? 'Unknown', rawProcessed:row.rawProcessed ?? 'Unknown',
    sourcePackageId:row.sourcePackageId ?? null,
    acquisitionStatus:row.acquisitionStatus ?? '未核实', acquisitionNote:row.acquisitionNote ?? '',
    localFiles:row.localFiles ?? null, localBytes:row.localBytes ?? null,
    verified:row.acquisitionStatus || row.preprocessingStatus ? eegReconciliation.reconciledAt : '',
    url:row.url, search:[row.stableId, row.channels, row.samplingRate, row.sourcePackageId, ...(row.aliases ?? [])].filter(Boolean).join(' '),
  };
  if (item.category==='医疗与疾病') item.population='临床相关（分组待核）';
  return { item, sources:[{label:'数据入口',url:row.url},...(row.durationEvidenceUrl?[{label:'时长证据',url:row.durationEvidenceUrl,note:row.durationEvidence ?? undefined}]:[]),...(row.additionalSources ?? [])], notes:[row.verification, row.durationBasis, row.durationEvidence, row.acquisitionNote, row.physicalUnitStatus, row.reference, row.rereference ? `重参考建议：${row.rereference}` : null, row.preprocessingNotes].filter((x):x is string=>!!x), metrics:[...(row.physicalUnit ? [{label:'预处理物理单位',value:row.physicalUnit}] : []),...(row.reference ? [{label:'采集/存储参考',value:row.reference}] : []),...(row.rereference ? [{label:'重参考建议',value:row.rereference}] : []),{label:'原始人数',value:String(row.subjectsDisplay ?? '未知')},{label:'通道 / 采样率',value:`${row.channels ?? '未知'} / ${row.samplingRate ?? '未知'}`},...(row.localFiles != null ? [{label:'本地下载清单',value:`${row.localFiles.toLocaleString('en-US')} files / ${(row.localBytes ?? 0).toLocaleString('en-US')} bytes`}] : [])], datasetDois:doiList(row.stableId).filter(x=>!doiList(row.paper).includes(x)), paperDois:doiList(row.paper), license:'见数据源许可条款', original:row };
});
for (const row of fmriDatasets) {
  const [rawAgeMin,rawAgeMax] = numberRange(row.participants.ageRange);
  // Old API importer coerced null/empty ages to zero. Keep ambiguous indexed
  // lower bounds unknown; explicitly reviewed infant cohorts are unaffected.
  const indexedZero = row.classification.curationLevel==='Repository + BOLD header verified' && rawAgeMin===0;
  const ageMin=indexedZero?null:rawAgeMin;const ageMax=indexedZero&&rawAgeMax===0?null:rawAgeMax;
  const group:Record<string,string>={Healthy:'健康',Clinical:'临床患者',Mixed:'患者与对照混合',Population:'人群队列',Unknown:'未核实'};
  const item:CatalogItem = {
    ...empty(row.id,'fmri'), name:row.identification.datasetName, aliases:[...new Set([row.identification.abbreviation,...row.identification.datasetUrls.flatMap(url=>url.match(/ds\d{6}/g)??[])].filter(Boolean))],
    family:row.identification.datasetUrls.join(' ').match(/ds\d{6}/)?.[0] ?? row.id,
    release:row.release.releaseVersion, category: ['Clinical','Mixed'].includes(row.participants.healthyClinicalMixed)?'医疗与疾病':row.participants.healthyClinicalMixed==='Population'?'健康与人群':'认知与脑功能',
    subcategory:row.classification.taskDesign.join(' / '), diseases:diseaseTags(`${row.participants.diseaseCondition} ${row.identification.datasetName}`),
    tasks:row.classification.activity, population:group[row.participants.healthyClinicalMixed] ?? '未核实',
    subjects:row.scale.subjects.value, subjectScope:[row.scale.subjects.unit,row.scale.subjects.note].filter(Boolean).join('；'),
    hours:row.scale.totalFmriHours.value,evidence:row.scale.totalFmriHours.durationSource,hoursScope:row.scale.totalFmriHours.note ?? '详见来源范围',
    records:row.scale.fmriRuns.value,access:accessNames[row.access.accessType] ?? row.access.accessType,
    ageMin,ageMax,sizeGb:row.scale.datasetSizeGb.value,trMs:row.acquisition.trMs.value,
    field:row.acquisition.fieldStrengths.join(' / ') || 'Unknown',sites:row.acquisition.multiSite==null?'Unknown':row.acquisition.multiSite?'多中心':'单中心',
    bids:row.dataFormat.bidsCompliant==null?'Unknown':row.dataFormat.bidsCompliant?'Yes':'No',format:row.dataFormat.nifti?'NIfTI':'Unknown',
    rawProcessed:row.dataFormat.rawDataAvailable?(row.dataFormat.preprocessedDataAvailable?'Both':'Raw'):row.dataFormat.preprocessedDataAvailable?'Processed':'Unknown',
    longitudinal:row.fmriComposition.longitudinal==null?'Unknown':row.fmriComposition.longitudinal?'Yes':'No',
    verified:row.release.lastVerified,url:row.identification.officialWebsite,
    search:[row.identification.doi,...row.fmriComposition.task.names,...row.fmriComposition.naturalisticMovie.names,row.participants.diseaseCondition,...row.classification.taskDesign].filter(Boolean).join(' '),
  };
  const metrics = Object.entries(row.scale).map(([label,m])=>({label:`原目录字段 · ${label}`,value:m.value==null?'未知':`${m.value} ${m.unit}`,source:m.sourceUrl??undefined,note:m.note??undefined}));
  metrics.push({label:'年龄（原始口径）',value:row.participants.ageRange,source:undefined,note:undefined},{label:'临床 / 人群说明',value:row.participants.populationDescription,source:undefined,note:row.participants.diseaseCondition});
  details.push({item,sources:row.sources.map(s=>({label:s.label,url:s.url,note:s.scope})),notes:[...row.metadata.keyCharacteristics,...row.metadata.knownLimitations,...row.metadata.notes],metrics,datasetDois:row.identification.datasetUrls.flatMap(doiList),paperDois:doiList(row.identification.doi),license:row.access.license,original:row});
}
type Revision = { id:string; modality:Modality; patch:Partial<CatalogItem>; notes?:string[]; metrics?:CatalogDetail['metrics']; sources?:CatalogDetail['sources']; datasetDois?:string[]; paperDois?:string[]; license?:string };
for (const revision of revisions.entries as Revision[]) {
  let detail = details.find(x=>x.item.id===revision.id&&x.item.modality===revision.modality);
  if (!detail) { detail={item:empty(revision.id,revision.modality),sources:[],notes:[],metrics:[],datasetDois:[],paperDois:[],license:'见数据源条款'}; details.push(detail); }
  Object.assign(detail.item, revision.patch);
  if (revision.patch.hours !== undefined || revision.patch.subjects !== undefined) detail.notes=detail.notes.map(note=>note.startsWith('原目录备注：')?note:`原目录备注：${note}`);
  detail.notes.unshift(...revision.notes ?? []); detail.metrics.unshift(...revision.metrics ?? []); detail.sources.unshift(...revision.sources ?? []);
  if(revision.datasetDois) detail.datasetDois = revision.datasetDois;
  if(revision.paperDois) detail.paperDois = revision.paperDois;
  if(revision.license) detail.license = revision.license;
}
const focusAcquisitionPatches = eegReconciliation.focusRowPatches as Record<string, {
  auditPresence?: unknown;
  acquisitionDecision?: unknown;
}>;
for (const [id, patch] of Object.entries(focusAcquisitionPatches)) {
  const detail = details.find((entry) => entry.item.id === id && entry.item.modality === 'eeg');
  if (!detail) continue;
  if (detail.item.acquisitionStatus === '未核实') detail.item.acquisitionStatus = String(patch.auditPresence ?? detail.item.acquisitionStatus);
  if (!detail.item.acquisitionNote) detail.item.acquisitionNote = String(patch.acquisitionDecision ?? detail.item.acquisitionNote);
  detail.item.verified = eegReconciliation.reconciledAt;
}
for (const id of Object.keys(eegReconciliation.rowPatches)) {
  const detail = details.find((entry) => entry.item.id === id && entry.item.modality === 'eeg');
  if (detail) detail.item.verified = eegReconciliation.reconciledAt;
}
for (const merge of revisions.merges) {
  const target = details.find(x=>x.item.id===merge.into&&x.item.modality===merge.modality);
  const index = details.findIndex(x=>x.item.id===merge.from&&x.item.modality===merge.modality);
  if(!target || index<0) throw new Error(`Missing merge identity: ${merge.from}`);
  const old = details[index]; target.item.aliases=[...new Set([...target.item.aliases,old.item.id,old.item.name,...old.item.aliases])];
  target.item.search += ` ${old.item.subcategory} ${old.item.tasks.join(' ')}`;
  target.sources.push({label:`旧入口 ${merge.from}`,url:old.item.url});
  target.notes.unshift(merge.note); details.splice(index,1);
}
for (const link of revisions.relations) {
  const detail = details.find(x=>x.item.id===link.from&&x.item.modality===link.modality);
  if(!detail) throw new Error(`Missing relation source: ${link.from}`);
  detail.item.relations.push({id:link.to,kind:link.kind as CatalogItem['relations'][number]['kind'],note:link.note,source:link.source});
  if (link.family) detail.item.family=link.family;
}
// Several logical MORGOTH task/cohort rows share one physical BDSP release.
// Keep the rows searchable while exposing one acquisition package identity.
for (const sourcePackage of eegReconciliation.sourcePackages) {
  for (const id of sourcePackage.memberIds) {
    const detail = details.find((entry) => entry.item.id === id && entry.item.modality === 'eeg');
    if (!detail) throw new Error(`Missing source-package member: ${id}`);
    detail.item.sourcePackageId = sourcePackage.sourcePackageId;
    detail.notes.push(sourcePackage.note);
  }
}
// Cross-modality links share one source identity; their hours stay separate.
for (const detail of details) {
  const other = details.find(x=>x.item.modality!==detail.item.modality&&x.item.family===detail.item.family);
  if(other) detail.item.relations.push({id:other.item.id,kind:'multimodal',note:`同一来源另有 ${other.item.modality.toUpperCase()} 入口；不据此推断同步采集。`,source:other.item.url});
}
// Derivative statistics have their own scope. Source-release subjects, files,
// sampling rate and duration above remain source metrics, not output metrics.
for (const [id, audit] of Object.entries(diseaseAudit.datasets)) {
  const detail = details.find(entry => entry.item.id === id && entry.item.modality === 'eeg');
  if (!detail) throw new Error(`Audited disease dataset missing from current catalog: ${id}`);
  if (detail.item.category !== '医疗与疾病') throw new Error(`Audit taxonomy is stale for ${id}`);
  const unitReview = Object.entries(audit.unit_status_output_counts)
    .reduce((sum, [status, count]) => sum + (['documented', 'verified_from_file'].includes(status) ? 0 : count), 0);
  detail.metrics.unshift(
    { label: '2026-09-13 · 已复核人类产物', value: `${audit.outputs.toLocaleString('en-US')} 份 / ${audit.duration_hours.toFixed(6)} h`, note: '完整记录、trial 或连续段；时长不乘通道数，与原始发布范围分别统计。' },
    { label: '处理范围可追踪身份', value: String(audit.human_dataset_subject_entries), note: '包含健康对照；0 表示无可追踪人物 ID，不代表没有参与者。不同数据集仍可共享身份。' },
    { label: '输出格式', value: 'NPZ float32 [channel,time] + JSON · 200 Hz', note: '单位有依据时为 μV/100；联合训练必须采用新清单 split。MODMA 三通道 native int64 分支单独隔离。' },
    { label: '处理后单位待核记录', value: String(unitReview), note: '含推断或未知单位；文件完整性通过不替代单位、参考和标签证据。' },
  );
}
export const currentCatalog = details;
