export type Modality = 'eeg' | 'fmri';
export type Evidence = 'reported' | 'calculated' | 'estimated' | 'unavailable';
export type Relation = { id: string; kind: 'subset' | 'overlap' | 'same-cohort' | 'multimodal'; note: string; source: string };
export type CatalogItem = {
  id: string; modality: Modality; name: string; aliases: string[]; family: string; release: string;
  category: string; subcategory: string; diseases: string[]; tasks: string[]; population: string;
  subjects: number | null; subjectScope: string; hours: number | null; evidence: Evidence;
  hoursScope: string; records: number | null; localHours: number | null;
  access: string; channels: number | null; channelMax: number | null; sampling: number | null; samplingMax: number | null;
  ageMin: number | null; ageMax: number | null; sizeGb: number | null; trMs: number | null;
  field: string; sites: string; bids: string; format: string; rawProcessed: string; longitudinal: string;
  verified: string; relations: Relation[]; url: string; search: string;
};
export type CatalogDetail = { item: CatalogItem; sources: { label: string; url: string; note?: string }[]; notes: string[]; metrics: { label: string; value: string; source?: string; note?: string }[]; datasetDois: string[]; paperDois: string[]; license: string; original?: unknown };

export const diseaseAliases: Record<string, string[]> = {
  '癫痫 / EEG 异常': ['epilep', 'seizure', '癫痫', 'ictal', 'abnormal', '异常', 'tusz', 'tuep'],
  '帕金森': ['parkinson', '帕金森', 'pd31'],
  '阿尔茨海默 / 认知障碍': ['alzheimer', 'dementia', 'cognitive impairment', '认知障碍', '痴呆', '阿尔茨海默', 'mci', 'caueeg'],
  '抑郁 / 焦虑': ['depress', 'anxiety', '抑郁', '焦虑', 'mdd', 'banda'],
  '精神分裂 / 精神病': ['schizo', 'psychosis', '精神分裂', '精神病', 'b-snip'],
  'ADHD': ['adhd', 'attention deficit', 'attention-deficit', '注意缺陷', '多动'],
  '自闭症': ['autis', 'abide', '自闭', '孤独症'],
  '睡眠呼吸障碍': ['sleep apnea', 'sleep apnoea', '呼吸暂停', 'osa', 'dod-o'],
  '脑损伤 / 意识障碍': ['brain injury', 'disorders of consciousness', 'cardiac arrest', 'coma', '脑损伤', '意识障碍', '昏迷', 'i-care'],
  '疼痛 / 重症': ['pain', 'nocicep', 'critical care', '疼痛', '重症'],
  '脑卒中': ['stroke', '脑卒中', '中风'],
  '多发性硬化': ['multiple sclerosis', '多发性硬化'],
  '成瘾': ['addiction', 'substance use', 'alcohol use', '成瘾'],
};
export function diseaseTags(text: string) {
  const value = text.toLowerCase();
  return Object.entries(diseaseAliases).filter(([, words]) => words.some(word => word.length <= 4 ? new RegExp(`\\b${word}\\b`, 'i').test(value) : value.includes(word))).map(([label]) => label);
}
export function normalizeSearch(text: string) {
  let value = text.toLowerCase().normalize('NFKC');
  // Abbreviations expand for search, without assigning a clinical diagnosis.
  value = value.replace(/\bpd\b/g, 'parkinson').replace(/\bad\b/g, 'alzheimer').replace(/\bsz\b/g, 'schizophrenia');
  for (const [label, aliases] of Object.entries(diseaseAliases)) {
    if (value.includes(label.toLowerCase()) || aliases.some(a => a.length > 4 && value.includes(a))) value += ` ${label.toLowerCase()}`;
  }
  return value;
}
export const initialFilters = {
  q: '', category: '', subcategory: '', disease: '', population: '', access: '', task: '',
  minSubjects: '', maxSubjects: '', minHours: '', maxHours: '', minChannels: '', minSampling: '',
  minAge: '', maxAge: '', minSize: '', minHoursPerSubject: '', maxTr: '', field: '', sites: '', bids: '', rawProcessed: '', longitudinal: '', evidence: '',
  includeUnknown: false, sort: 'name', page: 1, pageSize: 20, detail: '', compare: [] as string[],
};
export type Filters = typeof initialFilters;
const numericKeys = ['minSubjects','maxSubjects','minHours','maxHours','minChannels','minSampling','minAge','maxAge','minSize','minHoursPerSubject','maxTr'];
const allowedSorts = ['name','subjects','hours','verified'];
const safeId = (x: string) => /^[a-zA-Z0-9_-]{1,100}$/.test(x);
export function filtersFromUrl(search: string): Filters {
  const p = new URLSearchParams(search); const result = { ...initialFilters, compare: [] as string[] };
  for (const key of Object.keys(initialFilters) as (keyof Filters)[]) {
    if (typeof initialFilters[key] === 'string') {
      const value = (p.get(key) ?? '').slice(0,300);
      if (numericKeys.includes(key) && value && (!Number.isFinite(Number(value)) || Number(value) < 0)) continue;
      Object.assign(result, { [key]: value });
    }
  }
  result.sort = allowedSorts.includes(result.sort) ? result.sort : 'name';
  result.page = Math.max(1, Math.min(100000, Math.floor(Number(p.get('page')) || 1)));
  result.pageSize = [20,50,100].includes(Number(p.get('pageSize'))) ? Number(p.get('pageSize')) : 20;
  result.includeUnknown = p.get('includeUnknown') === '1';
  result.detail = safeId(result.detail) ? result.detail : '';
  result.compare = [...new Set((p.get('compare') ?? '').split(',').filter(safeId))].slice(0,4);
  return result;
}
export function filtersToUrl(filters: Filters) {
  const p = new URLSearchParams();
  for (const key of Object.keys(initialFilters) as (keyof Filters)[]) {
    const value = filters[key];
    if (key === 'compare') { if (filters.compare.length) p.set(key, filters.compare.join(',')); }
    else if (value !== initialFilters[key] && value !== '') p.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
  }
  return p.toString();
}
function matchesRange(value: number | null, min: string, max: string, unknown: boolean) {
  if (!min && !max) return true;
  if (value == null) return unknown;
  return (!min || value >= Number(min)) && (!max || value <= Number(max));
}
export function filterCatalog(items: CatalogItem[], f: Filters) {
  if (numericKeys.some(key => { const value = f[key as keyof Filters]; return value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0); })) return [];
  if ([['minSubjects','maxSubjects'],['minHours','maxHours'],['minAge','maxAge']].some(([a,b]) => f[a as keyof Filters] !== '' && f[b as keyof Filters] !== '' && Number(f[a as keyof Filters]) > Number(f[b as keyof Filters]))) return [];
  const queryText=/^(pd|parkinson(?:'s)?(?: disease)?|帕金森病?)$/i.test(f.q.trim())?'帕金森':normalizeSearch(f.q);
  const query = queryText.trim().split(/\s+/).filter(Boolean);
  const matched = items.filter(item => {
    const text = normalizeSearch(`${item.name} ${item.search} ${item.id} ${item.aliases.join(' ')} ${item.diseases.join(' ')} ${item.tasks.join(' ')} ${item.category} ${item.subcategory}`);
    return query.every(word => text.includes(word))
      && (!f.category || item.category === f.category) && (!f.subcategory || item.subcategory === f.subcategory)
      && (!f.disease || item.diseases.includes(f.disease)) && (!f.population || item.population === f.population)
      && (!f.access || item.access === f.access) && (!f.task || item.tasks.includes(f.task))
      && (!f.evidence || item.evidence === f.evidence) && (!f.field || item.field.split(' / ').includes(f.field))
      && (!f.sites || item.sites === f.sites) && (!f.bids || item.bids === f.bids)
      && (!f.rawProcessed || item.rawProcessed.toLowerCase().includes(f.rawProcessed.toLowerCase()) || (f.rawProcessed !== 'Unknown' && item.rawProcessed === 'Both'))
      && (!f.longitudinal || item.longitudinal === f.longitudinal)
      && matchesRange(item.subjects, f.minSubjects, f.maxSubjects, f.includeUnknown)
      && matchesRange(item.hours, f.minHours, f.maxHours, f.includeUnknown)
      && matchesRange(item.channelMax, f.minChannels, '', f.includeUnknown)
      && matchesRange(item.samplingMax, f.minSampling, '', f.includeUnknown)
      && matchesRange(item.sizeGb, f.minSize, '', f.includeUnknown)
      && matchesRange(item.subjects && item.hours != null ? item.hours/item.subjects : null, f.minHoursPerSubject, '', f.includeUnknown)
      && matchesRange(item.trMs, '', f.maxTr, f.includeUnknown)
      && ((!f.minAge && !f.maxAge) || (item.ageMin == null || item.ageMax == null ? f.includeUnknown : (!f.minAge || item.ageMax >= Number(f.minAge)) && (!f.maxAge || item.ageMin <= Number(f.maxAge))));
  });
  return matched.sort((a,b) => (f.sort === 'subjects' ? (b.subjects ?? -1)-(a.subjects ?? -1) : f.sort === 'hours' ? (b.hours ?? -1)-(a.hours ?? -1) : f.sort === 'verified' ? b.verified.localeCompare(a.verified) : 0) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function summarize(items: CatalogItem[]) {
  const ids = new Set(items.map(x => x.id));
  const suppressed = items.filter(x => x.relations.some(r => r.kind === 'subset' && ids.has(r.id)));
  const byId = new Map(items.map(x=>[x.id,x]));
  const keepMetric = (key:'subjects'|'hours') => items.filter(x=>!x.relations.some(r=>r.kind==='subset'&&byId.get(r.id)?.[key]!=null));
  const subjectRows=keepMetric('subjects');const kept=keepMetric('hours');
  const sum = (rows: CatalogItem[], key: 'subjects'|'hours') => rows.reduce((n,x)=>n+(x[key] ?? 0),0);
  const knownSubjects = subjectRows.filter(x => x.subjects != null).length; const knownHours = kept.filter(x => x.hours != null).length;
  const overlaps = items.filter(x => x.relations.some(r => ['overlap','same-cohort'].includes(r.kind) && ids.has(r.id)));
  return {
    count: items.length, families: new Set(items.map(x=>x.family)).size, included: kept.length, subjectIncluded:subjectRows.length,
    subjects: knownSubjects ? sum(subjectRows,'subjects') : null, hours: knownHours ? sum(kept,'hours') : null,
    knownSubjects, knownHours, missingSubjects: subjectRows.length-knownSubjects, missingHours: kept.length-knownHours,
    estimatedHours: sum(kept.filter(x=>x.evidence==='estimated'),'hours'), reportedHours: sum(kept.filter(x=>x.evidence==='reported'),'hours'), calculatedHours: sum(kept.filter(x=>x.evidence==='calculated'),'hours'),
    partialHours: kept.filter(x=>x.hours!=null && x.hoursScope.includes('部分')).length,
    public: items.filter(x=>x.access==='公开下载').length, suppressed: suppressed.map(x=>x.id), overlap: overlaps.map(x=>x.id),
  };
}
export function doiList(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return [...new Set((value.match(/10\.\d{4,9}\/[A-Z0-9][A-Z0-9._;()/:+-]*/gi) ?? []).map(x=>x.replace(/[.,;:]+$/, '')))];
}
export function safeExternalUrl(url: string | null | undefined): string | null {
  try { const parsed = new URL(url ?? ''); return ['http:','https:'].includes(parsed.protocol) ? parsed.href : null; } catch { return null; }
}
export const exportColumns = ['id','modality','name','family','release','category','subcategory','diseases','population','subjects','subjectScope','records','hours','evidence','hoursScope','localHours','access','channels','channelMax','sampling','samplingMax','ageMin','ageMax','field','bids','rawProcessed','verified','url','aliases','relations','tasks','sizeGb','trMs','sites','format','longitudinal'] as const;
export function exportRows(items: CatalogItem[]) {
  return items.map(item => Object.fromEntries(exportColumns.map(key => [key, Array.isArray(item[key]) ? key === 'relations' ? JSON.stringify(item[key]) : (item[key] as string[]).join(' | ') : item[key]])));
}
export function catalogCsv(items: CatalogItem[]) {
  const escape = (value: unknown) => { let text = value == null ? '' : String(value); if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"','""')}"`; };
  return '\uFEFF' + [exportColumns.join(','), ...exportRows(items).map(row => exportColumns.map(key=>escape(row[key])).join(','))].join('\r\n');
}
export const formatNumber = (value: number | null, digits = 1) => value == null ? '未知' : value.toLocaleString('zh-CN', { maximumFractionDigits: digits });
export const evidenceLabels: Record<Evidence,string> = { reported: '来源报告', calculated: '计算值', estimated: '估算值', unavailable: '时长未知' };
