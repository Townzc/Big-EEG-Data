/* eslint-disable @next/next/no-html-link-for-pages -- shared Vercel SPA and server routes */
import manifest from '../data/catalog-manifest.json';
import { CatalogBrowser } from './CatalogBrowser';
import { ModalitySwitcher } from './ModalitySwitcher';
import type { Modality } from '../lib/catalog';

export function CatalogLanding({modality,children}:{modality:Modality;children?:React.ReactNode}) {
  const label=modality==='eeg'?'EEG':'fMRI';const stats=manifest.modalities[modality];
  return <>
    <a className="skip-link" href="#catalog">跳到数据目录</a>
    <header className="site-header portal-header db-header"><a className="brand" href="/" aria-label="Big Data 首页"><span className="brand-mark" aria-hidden="true">∿</span><span>BIG DATA</span></a><ModalitySwitcher active={modality}/><nav className="section-nav" aria-label="目录导航"><a href="#catalog">查找数据</a><a href="#catalog-methodology">统计口径</a><a href="#catalog-exports">下载目录</a></nav><a className="header-download" href="https://github.com/Townzc/Big-EEG-Data" target="_blank" rel="noreferrer">GitHub ↗</a></header>
    <main id="top" className="db-main">
      <section className="db-hero" aria-labelledby="db-title"><div><p className="eyebrow">OPEN NEUROSCIENCE · CURATED DATA CATALOG</p><h1 id="db-title">Big Data of <span>{label}</span></h1><p>找到适合你的研究数据。按疾病、规模与获取条件检索，核对证据，再比较和导出。</p></div><div className="db-catalog-stamp"><strong>{stats.count}</strong><span>个可检索数据集</span><small>目录修订 {manifest.reviewDate}<br/>来源日期见各条详情</small></div></section>
      <section id="catalog" className="db-catalog" aria-label={`${label} 数据目录`}><CatalogBrowser modality={modality} version={manifest.version} count={stats.count}/><noscript>检索需要 JavaScript。<a href={`/${modality}-catalog-current.csv`}>下载当前 {label} CSV</a>或<a href={`/${modality}-catalog-current.json`}>JSON</a>。</noscript></section>
      <section id="catalog-methodology" className="db-methodology"><div className="db-section-title"><p className="eyebrow">READ THE NUMBERS</p><h2>先明确范围，再比较规模。</h2></div><div className="db-method-grid">
        <article><span>01</span><h3>人数不是全站唯一人数</h3><p>按当前筛选相加已知受试者条目，可能包含对照、随访或同一队列。完整母库在结果中时跳过已确认子集；部分重叠继续提示，不任意扣除整条。</p></article>
        <article><span>02</span><h3>小时保留证据与范围</h3><p>来源报告、文件计算与抽样估算分别统计。部分文件时长不会写成精确整库规模；未知保持空白。本地下载量、扫描准备时间和多通道小时不混作原始记录小时。</p></article>
        <article><span>03</span><h3>团队分类与临床属性分开</h3><p>疾病主题用于发现相关研究，不等于每个参与者都确诊。HEEDB 按团队口径归入睡眠；官方临床 EEG 属性保留在详情。跨模态来源共享身份，EEG 与 fMRI 小时分别统计。</p></article>
        <article><span>04</span><h3>一次修订，一致的目录</h3><p>网页索引、详情、CSV、JSON 和当前工作簿来自同一目录版本。来源未给出有效数字时，保留未知及核查记录；BOLD 的存在与总时长是否已知分别核查。</p></article>
      </div></section>
      <section id="catalog-exports" className="db-downloads"><div><p className="eyebrow">TAKE YOUR SEARCH FURTHER</p><h2>把目录带进你的工作流。</h2><p>“导出 CSV / JSON”包含全部筛选结果。下方文件是完整当前目录；历史工作簿单独保存。</p></div><div className="db-download-actions"><a className="button primary" href="/brain-data-catalog-current.xlsx" download>当前完整 XLSX · EEG + fMRI</a><a href={`/${modality}-catalog-current.csv`} download>{label} CSV ↓</a><a href={`/${modality}-catalog-current.json`} download>{label} JSON ↓</a><a href="/EEG_catalog_20260906.xlsx" download>历史 EEG 工作簿（563 行）↓</a></div></section>
      {children}
    </main><footer className="db-footer"><div><span className="brand-mark" aria-hidden="true">∿</span><strong>BIG DATA</strong></div><p>{stats.count} {label} datasets · catalog {manifest.version.slice(0,7)}</p><a href="#top">回到顶部 ↑</a></footer>
  </>;
}
