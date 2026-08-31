/* eslint-disable @next/next/no-html-link-for-pages -- the production Vercel build is a two-route Vite SPA */
import type { Metadata } from "next";
import { ModalitySwitcher } from "../ModalitySwitcher";
import { FmriExplorer } from "./FmriExplorer";
import { fmriCatalogMeta, fmriDatasets } from "../../data/fmri-catalog";

export const metadata: Metadata = {
  title: "Big Data of fMRI",
  description: "A provenance-aware catalog of public human fMRI datasets.",
};

const foundationPapers = [
  {
    venue: "ICLR 2024",
    title: "BrainLM: a foundation model for brain activity recordings",
    url: "https://openreview.net/pdf/9b47441fd8280d26dca4ee62f9ee211888cd42d6.pdf",
    datasets: "UK Biobank · HCP Young Adult",
    note: "77,298 recordings、约 6,700 fMRI 小时；为本目录的大规模时长核查提供重要交叉参照。",
  },
  {
    venue: "NeurIPS 2024",
    title: "Brain-JEPA: Brain Dynamics Foundation Model",
    url: "https://papers.neurips.cc/paper_files/paper/2024/file/9c3828adf1500f5de3c56f6550dfe43c-Paper-Conference.pdf",
    datasets: "UK Biobank · HCP Aging · ADNI",
    note: "预训练使用 40,162 名 UKB 参与者，并在 HCP-Aging 与 ADNI 外部队列验证。",
  },
  {
    venue: "NeurIPS 2023",
    title: "SwiFT: Swin 4D fMRI Transformer",
    url: "https://papers.neurips.cc/paper_files/paper/2023/file/8313b1920ee9c78d846c5798c1ce48be-Paper-Conference.pdf",
    datasets: "ABCD · HCP Young Adult · UK Biobank",
    note: "报告的建模队列为 ABCD 9,128、HCP 1,084、UKB 5,935；提示总发布人数与实际建模样本必须分开记录。",
  },
  {
    venue: "Nature Biomedical Engineering 2026",
    title: "NeuroSTORM: a foundation model for human brain dynamics",
    url: "https://doi.org/10.1038/s41551-026-01666-y",
    datasets: "UKB · ABCD · HCP · ADHD-200 · ABIDE · CNP · COBRE · HBN · PNC · REST-meta-MDD + task cohorts",
    note: "覆盖人群、临床、药理和任务态数据，是这次补充临床与干预类别的重要数据集路线图。",
  },
  {
    venue: "NeuroImage 2021",
    title: "Scan Once, Analyse Many: Using large open-access neuroimaging datasets",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8111663/",
    datasets: "HCP · UK Biobank · ABCD · CamCAN · OpenNeuro · INDI families",
    note: "用于交叉检查主要公共倡议、访问边界和队列差异；目录仍优先引用各项目官网与原始数据论文。",
  },
] as const;

export default function FmriPage() {
  const directOpen = fmriDatasets.filter((dataset) => dataset.access.accessType === "Open download").length;
  const withKnownHours = fmriDatasets.filter((dataset) => dataset.scale.totalFmriHours.value !== null).length;

  return (
    <>
      <a className="skip-link" href="#fmri-catalog">跳到 fMRI 数据目录</a>
      <header className="site-header portal-header">
        <a className="brand" href="/" aria-label="Big Data 首页">
          <span className="brand-mark" aria-hidden="true">∿</span>
          <span>BIG DATA</span>
        </a>
        <ModalitySwitcher active="fmri" />
        <nav className="section-nav" aria-label="fMRI 页面导航">
          <a href="#fmri-catalog">数据目录</a>
          <a href="#evidence">研究依据</a>
          <a href="#methodology">统计口径</a>
          <a href="#schema">Schema</a>
        </nav>
        <a className="header-download" href="#fmri-catalog">浏览数据</a>
      </header>

      <main id="top">
        <section className="hero fmri-hero" aria-labelledby="fmri-hero-title">
          <div>
            <p className="eyebrow">PUBLIC NEUROIMAGING DATASET CATALOG · 2026</p>
            <h1 id="fmri-hero-title">Big Data of fMRI</h1>
            <p className="hero-lead">
              面向大规模神经影像研究、表征学习、脑解码与临床神经科学的公共人类 fMRI 数据目录；访问限制与时长证据会被明确标注。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#fmri-catalog">浏览 fMRI 目录</a>
              <a className="button secondary" href="/">返回 EEG</a>
            </div>
          </div>
          <dl className="specs" aria-label="fMRI 目录概况">
            <div><dt>CANONICAL DATASETS</dt><dd>{fmriDatasets.length}</dd></div>
            <div><dt>DIRECT OPEN</dt><dd>{directOpen}</dd></div>
            <div><dt>KNOWN HOURS</dt><dd>{withKnownHours}/{fmriDatasets.length}</dd></div>
            <div><dt>LAST VERIFIED</dt><dd className="spec-date">2026</dd></div>
          </dl>
        </section>

        <section className="fmri-catalog-section" id="fmri-catalog" aria-labelledby="fmri-catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PROVENANCE-AWARE CATALOG</p>
              <h2 id="fmri-catalog-title">一个数据集，一个 canonical 入口</h2>
            </div>
            <p>同一队列的 OpenNeuro、DataLad、NITRC、机构门户或云镜像合并在一个条目中；不同 release 只有在代表不同队列时才拆分。</p>
          </div>
          <FmriExplorer />
        </section>

        <section className="fmri-evidence-section" id="evidence" aria-labelledby="evidence-title">
          <div className="section-heading">
            <div><p className="eyebrow">FOUNDATION-MODEL EVIDENCE MAP</p><h2 id="evidence-title">从模型论文反查训练与评测数据</h2></div>
            <p>这些论文帮助发现数据集和核对建模样本，但目录中的人数、协议与访问状态仍尽量回到官网、仓库快照或原始数据论文。</p>
          </div>
          <div className="paper-grid">
            {foundationPapers.map((paper) => (
              <article key={paper.title}>
                <span>{paper.venue}</span>
                <h3><a href={paper.url} target="_blank" rel="noreferrer">{paper.title} ↗</a></h3>
                <strong>{paper.datasets}</strong>
                <p>{paper.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fmri-methodology" id="methodology" aria-labelledby="methodology-title">
          <div className="section-heading">
            <div><p className="eyebrow">RESEARCH NOTES</p><h2 id="methodology-title">统计口径与可信度边界</h2></div>
            <p>目录优先保留可核查来源，不把缺失值当作 0，也不把受试者招募数自动当作可用 fMRI 人数。</p>
          </div>
          <div className="method-grid">
            <article><span>01</span><h3>系统发现</h3><p>逐项检查 HCP、NDA/NBDC、UKB、ADNI、OASIS、INDI/NITRC、机构门户与 DataLad 家族；OpenNeuro 候选先排除衍生物、非人类、phantom、脊髓和 test/demo，再只把实际读到 BOLD NIfTI header 的长尾条目加入主目录。</p></article>
            <article><span>02</span><h3>时长证据</h3><p><strong>reported</strong> 为来源直接报告；<strong>calculated</strong> 为完整协议或全部 BOLD 头可复算；<strong>estimated</strong> 为 NIfTI 头抽样或依赖完成率假设的外推；<strong>unavailable</strong> 保持空白。</p></article>
            <article><span>03</span><h3>访问不是二元标签</h3><p>Open download、registration、DUA、application、controlled 与 restricted/unclear 分开显示。ABCD、UKB、ADNI 等受控资源不会被标为完全开放。</p></article>
            <article><span>04</span><h3>总计的含义</h3><p>Subject entries 是各数据集内已知人数之和，不是跨队列唯一人数；Total hours 和 size 只累加已有证据的条目，并同时显示已知覆盖数。</p></article>
          </div>
          <p className="method-source">OpenNeuro discovery snapshot: {fmriCatalogMeta.openNeuroDiscovery.indexedCandidates} candidates → {fmriCatalogMeta.openNeuroDiscovery.boldHeaderVerifiedCanonicalEntries} deduplicated BOLD-header-verified long-tail entries, API v{fmriCatalogMeta.openNeuroDiscovery.apiVersionAtVerification}, verified {fmriCatalogMeta.lastVerified}. Duration audit: {fmriCatalogMeta.durationAudit.withTiming} candidates with readable timing, {fmriCatalogMeta.durationAudit.unavailable} sampled candidates unavailable, {fmriCatalogMeta.durationAudit.pending} pending manual/dense-protocol review. <a href={fmriCatalogMeta.openNeuroDiscovery.api} target="_blank" rel="noreferrer">API endpoint ↗</a> · Classification references: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6289578/" target="_blank" rel="noreferrer">Cognitive Atlas / CogPO aggregation ↗</a> · <a href="https://www.sciencedirect.com/science/article/pii/S105381192200725X" target="_blank" rel="noreferrer">MDTB cognitive task battery ↗</a> · <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6326731/" target="_blank" rel="noreferrer">naturalistic fMRI review ↗</a>.</p>
        </section>

        <section className="fmri-schema-section" id="schema" aria-labelledby="schema-title">
          <div>
            <p className="eyebrow">STANDARDIZED METADATA</p>
            <h2 id="schema-title">Identification → scale → protocol → access → provenance</h2>
            <p>每个条目共享同一完整 schema；不知道的值显式为 null/Unknown，重要数值携带来源 URL、证据类型与说明。这样目录可以继续扩充，而不用把主表拉成无法阅读的超宽页面。</p>
          </div>
          <div className="schema-actions">
            <a className="button primary" href="https://github.com/Townzc/Big-EEG-Data/blob/main/data/fmri-schema.ts" target="_blank" rel="noreferrer">查看 schema ↗</a>
            <a className="button secondary" href="https://github.com/Townzc/Big-EEG-Data/blob/main/data/fmri-catalog.ts" target="_blank" rel="noreferrer">查看 catalog source ↗</a>
          </div>
        </section>
      </main>

      <footer>
        <div><span className="brand-mark" aria-hidden="true">∿</span><strong>BIG DATA</strong></div>
        <p>{fmriDatasets.length} fMRI datasets · schema v{fmriCatalogMeta.schemaVersion} · EEG catalog preserved</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </>
  );
}
