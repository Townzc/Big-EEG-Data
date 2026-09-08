"use client";
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the labelled result region must be focusable for keyboard horizontal scrolling */

import { useEffect, useMemo, useRef, useState } from 'react';
import { catalogCsv, catalogDetailShard, evidenceLabels, exportRows, filterCatalog, filtersFromUrl, filtersToUrl, formatNumber, initialFilters, safeExternalUrl, summarize, type CatalogDetail, type CatalogItem, type Filters, type Modality } from '../lib/catalog';

function download(name:string,body:string,type:string) {
  const url=URL.createObjectURL(new Blob([body],{type})); const anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function External({href,children}:{href:string;children:React.ReactNode}) {
  const url=safeExternalUrl(href);return url?<a href={url} target="_blank" rel="noreferrer">{children} ↗</a>:<span>{children}</span>;
}
function Select({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(value:string)=>void}) {
  const labels:Record<string,string>={...evidenceLabels,name:'名称',subjects:'人数从多到少',hours:'时长从多到少',verified:'最近核查',Raw:'原始',Processed:'处理后',Both:'原始与处理后',Unknown:'未知',Yes:'是',No:'否'};
  return <label className="db-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">全部</option>{options.map(x=><option key={x} value={x}>{labels[x]??x}</option>)}</select></label>;
}
function Numeric({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) {
  return <label className="db-field"><span>{label}</span><input type="number" min="0" step="any" value={value} placeholder="不限" onChange={e=>onChange(e.target.value)} /></label>;
}
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const dialog=ref.current;const before=document.activeElement as HTMLElement|null;const previous=document.body.style.overflow;
    dialog?.showModal();document.body.style.overflow='hidden';
    return()=>{dialog?.close();document.body.style.overflow=previous;before?.focus();};
  },[]);
  return <dialog ref={ref} className="db-dialog" aria-label={title} onCancel={e=>{e.preventDefault();onClose();}}>
    <div className="db-dialog-head"><div><span className="eyebrow">DATASET NOTES</span><h2>{title}</h2></div><button type="button" onClick={onClose} aria-label="关闭详情">关闭 ×</button></div>{children}
  </dialog>;
}
function Detail({detail,onRelated}:{detail:CatalogDetail;onRelated:(id:string)=>void}) {
  const x=detail.item;
  return <div className="db-detail">
    <p className="db-id">{x.id} · {x.release}</p>
    <div className="db-tags"><span>{x.category}</span>{x.diseases.map(d=><span key={d}>{d}</span>)}<span>{x.population}</span></div>
    <dl className="db-detail-metrics">
      <div><dt>受试者条目</dt><dd>{formatNumber(x.subjects,0)}</dd><small>{x.subjectScope}</small></div>
      <div><dt>记录时长 · h</dt><dd>{formatNumber(x.hours,2)}</dd><small>{evidenceLabels[x.evidence]} · {x.hoursScope}</small></div>
      <div><dt>记录 / run 数</dt><dd>{formatNumber(x.records,0)}</dd><small>依当前来源定义，不能直接等同人数</small></div>
      <div><dt>本地已获取 · h</dt><dd>{formatNumber(x.localHours,2)}</dd><small>有文件审计证据才填写；未知不代表未下载</small></div>
      <div><dt>本地文件</dt><dd>{formatNumber(x.localFiles,0)}</dd><small>{x.localBytes==null?'字节数待核验':`${x.localBytes.toLocaleString('en-US')} bytes`}</small></div>
    </dl>
    <section><h3>采集协议</h3><dl className="db-kv">
      {x.modality==='eeg'?<>
        <div><dt>EEG 通道</dt><dd>{x.channels==null?'未知':x.channels===x.channelMax?x.channels:`${x.channels}–${x.channelMax}`}</dd></div>
        <div><dt>采样率</dt><dd>{x.sampling==null?'未知':`${formatNumber(x.sampling)}${x.sampling!==x.samplingMax?'–'+formatNumber(x.samplingMax):''} Hz`}</dd></div>
      </>:<>
        <div><dt>场强 / TR</dt><dd>{x.field} / {x.trMs==null?'未知':`${formatNumber(x.trMs)} ms`}</dd></div>
        <div><dt>站点 / 纵向采集</dt><dd>{x.sites} / {x.longitudinal==='Yes'?'是':x.longitudinal==='No'?'否':'未知'}</dd></div>
      </>}
      <div><dt>BIDS</dt><dd>{x.bids==='Yes'?'是':x.bids==='No'?'否':'未知'}</dd></div>
      <div><dt>发布数据体积</dt><dd>{x.sizeGb==null?'未知':`${formatNumber(x.sizeGb,2)} GB`}</dd></div>
    </dl></section>
    <div className="db-detail-columns">
      <section><h3>采集与使用</h3><dl className="db-kv"><div><dt>访问</dt><dd>{x.access}</dd></div><div><dt>本地获取状态</dt><dd>{x.acquisitionStatus}</dd><small>{x.acquisitionNote||'未单列本地状态'}</small></div><div><dt>来源包</dt><dd>{x.sourcePackageId??'按单条数据集计'}</dd></div><div><dt>许可</dt><dd>{detail.license}</dd></div><div><dt>格式 / 处理</dt><dd>{x.format} · {x.rawProcessed}</dd></div><div><dt>年龄覆盖</dt><dd>{x.ageMin==null||x.ageMax==null?'未知':`${x.ageMin}–${x.ageMax} 岁`}</dd></div><div><dt>核查日期</dt><dd>{x.verified||'原目录；日期未单列'}</dd></div><div><dt>任务</dt><dd>{x.tasks.join(' / ')||'未标注'}</dd></div></dl><p><External href={x.url}>打开数据与申请入口</External></p></section>
      <section><h3>范围与限制</h3><ul>{detail.notes.map((note,i)=><li key={i}>{note}</li>)}</ul></section>
    </div>
    {x.relations.length>0&&<section><h3>相关数据与重叠</h3><ul className="db-relations">{x.relations.map((r,i)=><li key={i}>{r.kind==='multimodal'?<a href={`${x.modality==='eeg'?'/fmri':'/'}?detail=${encodeURIComponent(r.id)}`}>{r.id} · 另一模态</a>:<button type="button" className="db-link" onClick={()=>onRelated(r.id)}>{r.id}</button>}<p>{r.note}</p><External href={r.source}>关系证据</External></li>)}</ul></section>}
    {x.aliases.length>0&&<p className="db-muted">别名与旧入口：{x.aliases.join(' · ')}</p>}
    <section><h3>数值与版本证据</h3><dl className="db-evidence-list">{detail.metrics.map((m,i)=><div key={i}><dt>{m.label}</dt><dd>{m.value}{m.note&&<small>{m.note}</small>}{m.source&&<External href={m.source}>来源</External>}</dd></div>)}</dl></section>
    <section><h3>来源与引用</h3><div className="db-source-list">{detail.sources.map((s,i)=><p key={i}><External href={s.url}>{s.label}</External>{s.note&&<small>{s.note}</small>}</p>)}</div>
      <p>数据集 DOI：{detail.datasetDois.length?detail.datasetDois.map(doi=><span key={doi}><External href={`https://doi.org/${doi}`}>{doi}</External> </span>):'未单列'}</p>
      <p>论文 DOI：{detail.paperDois.length?detail.paperDois.map(doi=><span key={doi}><External href={`https://doi.org/${doi}`}>{doi}</External> </span>):'未单列'}</p>
      <button type="button" onClick={()=>download(`${x.id}.bib`, `@misc{${x.id.replaceAll('-','_')},\n  title = {${x.name.replace(/[{}]/g,'')}},\n  url = {${x.url}},\n${detail.datasetDois[0]?`  doi = {${detail.datasetDois[0]}},\n`:''}  note = {Catalog entry; ${x.release.replace(/[{}]/g,'')}. Verify the publisher's preferred citation.}\n}\n`, 'text/plain;charset=utf-8')}>导出目录引用 BibTeX</button><small className="db-muted">这是数据入口的引用模板；正式论文请遵循发布者指定引用。</small>
    </section>
  </div>;
}
const unique=(rows:CatalogItem[],key:'category'|'subcategory'|'population'|'access'|'sites')=>[...new Set(rows.map(x=>x[key]))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'zh-CN'));

export function CatalogBrowser({modality,version,count}:{modality:Modality;version:string;count:number}) {
  const [rows,setRows]=useState<CatalogItem[]|null>(null);const [error,setError]=useState('');const [filters,setFilters]=useState<Filters>({...initialFilters,compare:[]});
  const [detail,setDetail]=useState<CatalogDetail|null>(null);const [detailError,setDetailError]=useState('');
  const [comparing,setComparing]=useState(false);const [notice,setNotice]=useState('');const [retry,setRetry]=useState(0);
  const cache=useRef(new Map<string,CatalogDetail>());
  useEffect(()=>{
    const controller=new AbortController();
    fetch(`/catalog/${modality}/index.json?v=${version}`,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('目录加载失败');return r.json() as Promise<{version:string;rows:CatalogItem[]}>;}).then(data=>{
      if(data.version!==version)throw new Error('目录版本正在更新，请刷新后重试');
      if(!Array.isArray(data.rows)||data.rows.length!==count)throw new Error('目录索引不完整，请重试');
      setRows(data.rows);setError('');
    }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    return()=>controller.abort();
  },[modality,version,count,retry]);
  useEffect(()=>{
    const sync=()=>setFilters(filtersFromUrl(window.location.search));
    queueMicrotask(sync);window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);
  },[]);
  const update=(patch:Partial<Filters>,replace=false,resetPage=true)=>{
    const next={...filters,...(resetPage?{page:1}:{}),...patch};setFilters(next);
    const query=filtersToUrl(next);const url=`${window.location.pathname}${query?'?'+query:''}${window.location.hash}`;
    window.history[replace?'replaceState':'pushState']({},'',url);
  };
  const canonical=(id:string)=>rows?.find(x=>x.id===id||x.aliases.includes(id))?.id??id;
  const selectedId=canonical(filters.detail);
  useEffect(()=>{
    if(!selectedId)return;
    const controller=new AbortController();
    const cached=cache.current.get(selectedId);
    Promise.resolve().then(async()=>{
      setDetail(null);setDetailError('');
      if(cached){setDetail(cached);return;}
      const shard=catalogDetailShard(selectedId);
      const r=await fetch(`/catalog/${modality}/details-${shard}.json?v=${version}`,{signal:controller.signal});
      if(!r.ok)throw new Error('未找到该数据集，或详情暂时不可用');
      const payload=await r.json() as {version:string;details:Record<string,CatalogDetail>};if(payload.version!==version)throw new Error('详情版本不一致，请刷新页面');
      const data=payload.details[selectedId];if(!data)throw new Error('未找到该数据集，或详情暂时不可用');
      if(!controller.signal.aborted){for(const [id,value] of Object.entries(payload.details))cache.current.set(id,value);setDetail(data);}
    }).catch(e=>{if(e.name!=='AbortError')setDetailError(e.message);});
    return()=>controller.abort();
  },[selectedId,modality,version,retry]);
  const matched=useMemo(()=>filterCatalog(rows??[],filters),[rows,filters]);
  const summary=useMemo(()=>summarize(matched),[matched]);
  const pages=Math.max(1,Math.ceil(matched.length/filters.pageSize));const page=Math.min(filters.page,pages);
  const visible=matched.slice((page-1)*filters.pageSize,page*filters.pageSize);
  const compared=[...new Set(filters.compare.map(canonical))].map(id=>rows?.find(x=>x.id===id)).filter((x):x is CatalogItem=>!!x);
  const compareIds=new Set(compared.map(x=>x.id));
  const toggleCompare=(id:string)=>{if(compareIds.has(id))update({compare:compared.filter(x=>x.id!==id).map(x=>x.id)},false,false);else if(compared.length<4)update({compare:[...compared.map(x=>x.id),id]},false,false);};
  const choose=(key:keyof Filters)=>(value:string)=>update({[key]:value},true);
  const share=async()=>{try{await navigator.clipboard.writeText(window.location.href);setNotice('链接已复制，包含筛选、详情和对比选择。');}catch{setNotice('请复制浏览器地址栏；当前筛选已保存在链接中。');}};
  const invalidRange=[['minSubjects','maxSubjects'],['minHours','maxHours'],['minAge','maxAge']].some(([a,b])=>filters[a as keyof Filters]!==''&&filters[b as keyof Filters]!==''&&Number(filters[a as keyof Filters])>Number(filters[b as keyof Filters]));
  return <div className="db-browser">
    <div className="db-search-row"><label className="db-search"><span>查找 {modality==='eeg'?'EEG':'fMRI'} 数据集</span><input type="search" placeholder="输入疾病、数据集名、DOI 或 accession，例如：帕金森 / PD" value={filters.q} onChange={e=>update({q:e.target.value},true)} /></label><button type="button" className="db-secondary" onClick={()=>update({...initialFilters,compare:filters.compare})}>清空筛选</button></div>
    <div className="db-shortcuts" aria-label="疾病主题快捷筛选"><span>疾病主题</span>{['癫痫 / EEG 异常','帕金森','阿尔茨海默 / 认知障碍','抑郁 / 焦虑','ADHD','自闭症','睡眠呼吸障碍'].map(d=><button type="button" key={d} aria-pressed={filters.disease===d} className={filters.disease===d?'active':''} onClick={()=>update({disease:filters.disease===d?'':d})}>{d}</button>)}</div>
    <div className="db-filters">
      <Select label="团队目录" value={filters.category} options={unique(rows??[],'category')} onChange={value=>update({category:value,subcategory:''})}/>
      <Select label="疾病主题" value={filters.disease} options={[...new Set((rows??[]).flatMap(x=>x.diseases))].sort()} onChange={choose('disease')}/>
      <Select label="研究人群" value={filters.population} options={unique(rows??[],'population')} onChange={choose('population')}/>
      <Select label="获取方式" value={filters.access} options={unique(rows??[],'access')} onChange={choose('access')}/>
    </div>
    <details className="db-advanced"><summary>更多筛选 · 人数、时长、{modality==='eeg'?'通道与采样率':'年龄与采集协议'}</summary>
      <div className="db-filters db-advanced-grid">
        <Select label="小类" value={filters.subcategory} options={unique((rows??[]).filter(x=>!filters.category||x.category===filters.category),'subcategory')} onChange={choose('subcategory')}/>
        <Select label="任务 / 活动" value={filters.task} options={[...new Set((rows??[]).flatMap(x=>x.tasks))].sort()} onChange={choose('task')}/>
        <Numeric label="人数 ≥" value={filters.minSubjects} onChange={choose('minSubjects')}/><Numeric label="人数 ≤" value={filters.maxSubjects} onChange={choose('maxSubjects')}/>
        <Numeric label="记录小时 ≥" value={filters.minHours} onChange={choose('minHours')}/><Numeric label="记录小时 ≤" value={filters.maxHours} onChange={choose('maxHours')}/>
        <Select label="时长证据" value={filters.evidence} options={Object.keys(evidenceLabels)} onChange={choose('evidence')}/>
        <Select label="原始 / 处理后" value={filters.rawProcessed} options={['Raw','Processed','Both','Unknown']} onChange={choose('rawProcessed')}/>
        {modality==='eeg'?<><Numeric label="最大通道数 ≥" value={filters.minChannels} onChange={choose('minChannels')}/><Numeric label="最高采样率 ≥ Hz" value={filters.minSampling} onChange={choose('minSampling')}/></>:<>
          <Numeric label="年龄区间下界（岁）" value={filters.minAge} onChange={choose('minAge')}/><Numeric label="年龄区间上界（岁）" value={filters.maxAge} onChange={choose('maxAge')}/>
          <Numeric label="数据体积 ≥ GB" value={filters.minSize} onChange={choose('minSize')}/><Numeric label="平均小时 / 人 ≥" value={filters.minHoursPerSubject} onChange={choose('minHoursPerSubject')}/>
          <Numeric label="TR ≤ ms" value={filters.maxTr} onChange={choose('maxTr')}/>
          <Select label="场强" value={filters.field} options={[...new Set((rows??[]).flatMap(x=>x.field.split(' / ')))].sort()} onChange={choose('field')}/>
          <Select label="站点" value={filters.sites} options={unique(rows??[],'sites')} onChange={choose('sites')}/>
          <Select label="BIDS" value={filters.bids} options={['Yes','No','Unknown']} onChange={choose('bids')}/><Select label="纵向 / 重复采集" value={filters.longitudinal} options={['Yes','No','Unknown']} onChange={choose('longitudinal')}/>
        </>}
      </div><label className="db-checkbox"><input type="checkbox" checked={filters.includeUnknown} onChange={e=>update({includeUnknown:e.target.checked})}/>数值筛选时同时保留未知值</label><p className="db-muted">年龄按两个区间是否相交筛选。人数是整条记录的人群规模；疾病主题可能包含健康对照和症状分层研究。</p>
    </details>
    {invalidRange&&<p role="alert" className="db-error">区间下界大于上界，请调整数值。</p>}
    {error?<div role="alert" className="db-error">{error} <button type="button" onClick={()=>setRetry(x=>x+1)}>重试</button></div>:!rows?<p role="status" className="db-loading">正在载入 {count} 条目录索引…<a href={`/${modality}-catalog-current.csv`}>也可下载 CSV</a></p>:<>
      <section className="db-summary" aria-label="当前筛选汇总" aria-live="polite">
        <div><span>匹配数据集</span><strong>{summary.count}</strong><small>{summary.families} 个来源家族</small></div>
        <div><span>已知受试者条目</span><strong>{formatNumber(summary.subjects,0)}</strong><small>{summary.knownSubjects}/{summary.subjectIncluded} 有值 · 可能重叠</small></div>
        <div><span>已知记录小时</span><strong>{formatNumber(summary.hours,1)}<em> h</em></strong><small>{summary.knownHours}/{summary.included} 有值 · 含约数 / 部分范围</small></div>
        <div><span>其中估算小时</span><strong>{formatNumber(summary.estimatedHours,1)}<em> h</em></strong><small>来源报告 {formatNumber(summary.reportedHours)} · 计算 {formatNumber(summary.calculatedHours)}</small></div>
        <div><span>公开下载入口</span><strong>{summary.public}</strong><small>人数未知 {summary.missingSubjects} · 时长未知 {summary.missingHours}</small></div>
      </section>
      <div className="db-scope-note"><span>统计口径</span><p>汇总覆盖全部匹配结果，与当前页无关。结果中有 {summary.suppressed.length} 个已确认父子关系；父库有值的指标不再累加子集，父库未知的指标仍保留子集已知值。其余队列可能重叠，人数不是跨库独立人数。{summary.partialHours>0&&` ${summary.partialHours} 条小时仅覆盖部分文件。`}{summary.overlap.length>0&&` ${summary.overlap.length} 条存在待精确核对的队列重叠，未任意扣除。`}</p><a href="#catalog-methodology">查看说明</a></div>
      <div className="db-results-toolbar"><p><strong>{matched.length}</strong> 个结果 <span>/ {rows.length} 条目录</span></p><div>
        <Select label="排序" value={filters.sort} options={['name','subjects','hours','verified']} onChange={choose('sort')}/>
        <button type="button" onClick={share}>分享筛选</button>
        <button type="button" disabled={!matched.length} onClick={()=>download(`${modality}-filtered.csv`,catalogCsv(matched),'text/csv;charset=utf-8')}>导出 CSV</button>
        <button type="button" disabled={!matched.length} onClick={()=>download(`${modality}-filtered.json`,JSON.stringify({version,filters,summary,rows:exportRows(matched)},null,2),'application/json')}>JSON</button>
      </div></div>
      {notice&&<p role="status" className="db-notice">{notice}</p>}
      {compared.length>0&&<div className="db-compare-bar"><span>已选 {compared.length}/4：{compared.map(x=>x.id).join(' · ')}</span><button type="button" disabled={compared.length<2} onClick={()=>setComparing(true)}>并排比较</button><button type="button" onClick={()=>update({compare:[]},false,false)}>清空对比</button></div>}
      <div className="db-table-scroll" tabIndex={0} role="region" aria-label="数据集结果，可横向滚动">
        <table className="db-table"><caption className="sr-only">{modality.toUpperCase()} 筛选结果，第 {page} 页</caption><thead><tr><th scope="col">对比</th><th scope="col">数据集 / 来源</th><th scope="col">主题 / 人群</th><th scope="col">受试者条目</th><th scope="col">记录小时</th><th scope="col">{modality==='eeg'?'通道 / 采样率':'场强 / BIDS'}</th><th scope="col">访问</th></tr></thead><tbody>
          {visible.map(x=><tr key={x.id}><td><input type="checkbox" aria-label={`对比 ${x.name}`} checked={compareIds.has(x.id)} disabled={!compareIds.has(x.id)&&compared.length>=4} onChange={()=>toggleCompare(x.id)}/></td><td><button type="button" className="db-name" onClick={()=>update({detail:x.id},false,false)}>{x.name}</button><span className="db-id">{x.id} · {x.family}</span>{x.relations.length>0&&<small className="db-relation-label">{x.relations.some(r=>r.kind==='subset')?'关联母库 / 子集':x.relations.some(r=>r.kind==='multimodal')?'多模态来源':'关联队列'}</small>}</td><td><span>{x.diseases.join(' / ')||x.category}</span><small>{x.population}</small></td><td className="db-numeric">{formatNumber(x.subjects,0)}<small>整条记录口径</small></td><td className="db-numeric">{formatNumber(x.hours,2)}<small className={`db-evidence ${x.evidence}`}>{evidenceLabels[x.evidence]}{x.hoursScope.includes('部分')?' · 部分范围':''}</small></td><td>{modality==='eeg'?<>{x.channels==null?'未知':x.channels===x.channelMax?x.channels:`${x.channels}–${x.channelMax}`} ch<small>{x.sampling==null?'未知':`${formatNumber(x.sampling,0)}${x.sampling!==x.samplingMax?'–'+formatNumber(x.samplingMax,0):''}`} Hz</small></>:<>{x.field}<small>BIDS {x.bids}</small></>}</td><td><span className={`db-access ${x.access==='公开下载'?'open':''}`}>{x.access}</span><small><External href={x.url}>数据页</External></small></td></tr>)}
        </tbody></table>
      </div>
      {!matched.length&&<div className="db-empty"><h3>没有符合这些条件的数据集</h3><p>可以放宽数值区间，或勾选“同时保留未知值”。</p><button type="button" onClick={()=>update({...initialFilters,compare:filters.compare})}>重置筛选</button></div>}
      <div className="db-pagination"><label>每页 <select aria-label="每页条数" value={filters.pageSize} onChange={e=>update({pageSize:Number(e.target.value)})}>{[20,50,100].map(n=><option key={n} value={n}>{n}</option>)}</select> 条</label><span>{matched.length?`${(page-1)*filters.pageSize+1}–${Math.min(page*filters.pageSize,matched.length)}`:'0'} / {matched.length}</span><div><button type="button" disabled={page<=1} onClick={()=>update({page:page-1},false,false)}>上一页</button><span>{page} / {pages}</span><button type="button" disabled={page>=pages} onClick={()=>update({page:page+1},false,false)}>下一页</button></div></div>
    </>}
    {filters.detail&&<Modal title={detail?.item.id===selectedId?detail.item.name:'数据集详情'} onClose={()=>update({detail:''},false,false)}>{detailError?<p role="alert" className="db-error">{detailError} <button type="button" onClick={()=>setRetry(x=>x+1)}>重试</button></p>:detail?.item.id===selectedId?<Detail detail={detail} onRelated={id=>update({detail:id},false,false)}/>:<p role="status" className="db-loading">正在加载来源与证据…</p>}</Modal>}
    {comparing&&<Modal title="数据集对比" onClose={()=>setComparing(false)}><div className="db-table-scroll db-comparison"><table className="db-table"><thead><tr><th scope="col">比较项</th>{compared.map(x=><th scope="col" key={x.id}>{x.name}<small>{x.id}</small></th>)}</tr></thead><tbody>{([
      ['研究人群',(x:CatalogItem)=>x.population],['疾病主题',(x:CatalogItem)=>x.diseases.join(' / ')||'未标注'],['受试者条目',(x:CatalogItem)=>`${formatNumber(x.subjects,0)}；${x.subjectScope}`],['记录小时',(x:CatalogItem)=>`${formatNumber(x.hours,2)} h · ${evidenceLabels[x.evidence]}；${x.hoursScope}`],['访问 / 版本',(x:CatalogItem)=>`${x.access} / ${x.release}`],['数据格式',(x:CatalogItem)=>`${x.format} / ${x.rawProcessed}`],['来源关系',(x:CatalogItem)=>`${x.family}；${x.relations.map(r=>r.note).join(' / ')||'未确认跨库关系'}`],
    ] as [string,(x:CatalogItem)=>string][]).map(([label,render])=><tr key={label}><th scope="row">{label}</th>{compared.map(x=><td key={x.id}>{render(x)}</td>)}</tr>)}</tbody></table></div><p className="db-muted">对比不会改变筛选汇总。复制页面链接可恢复这组选择。</p></Modal>}
  </div>;
}
