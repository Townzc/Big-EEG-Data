import type { Metadata } from "next";
import data from "../public/catalog-data.json";
import { CatalogExplorer } from "./CatalogExplorer";
import { DownloadChecklist } from "./DownloadChecklist";
import { ModalitySwitcher } from "./ModalitySwitcher";
import { eegProgress } from "../data/eeg-progress";
import { categoryDurationStats, eegCatalogRows, eegCategoryStats, eegDurationSummary } from "../data/eeg-duration";
import { foundationPaperAudits } from "../data/eeg-foundation-paper-audit";
import { eegFmriPairs, eegFmriPairSummary } from "../data/eeg-fmri-pairs";
import { EegFmriExplorer } from "./EegFmriExplorer";

export const metadata: Metadata = {
  title: "Big Data of EEG",
  description: "A searchable EEG catalog preserving the original 563 units and appending newly verified releases, with source-aware duration coverage and a public EEG-fMRI survey.",
};

export default function Home() {
  const neuro = data.neuroAtlasComparison;
  const focus = neuro.focusCoverage;
  const acquisition = data.metrics.acquisition;
  const catalogScale = eegProgress.catalog;
  const duration = eegDurationSummary;
  const durationCategories = categoryDurationStats(eegProgress.categories);
  const firstAuditPairs = eegFmriPairs.filter((row) => row.pairing === "simultaneous" && row.sourceOrigin === "added-in-audit");
  const independentResurveyPairs = eegFmriPairs.filter((row) => row.pairing === "simultaneous" && row.sourceOrigin === "added-independent-resurvey");

  return (
    <>
      <a className="skip-link" href="#catalog">跳到完整数据目录</a>
      <header className="site-header portal-header">
        <a className="brand" href="#top" aria-label="返回页面顶部">
          <span className="brand-mark" aria-hidden="true">∿</span>
          <span>BIG DATA</span>
        </a>
        <ModalitySwitcher active="eeg" />
        <nav className="section-nav" aria-label="主要导航">
          <a href="#catalog">完整目录</a>
          <a href="#downloads">下载清单</a>
          <a href="#duration-methods">时长口径</a>
          <a href="#eeg-fmri">EEG–fMRI</a>
          <a href="#progress">数据预处理</a>
        </nav>
        <a className="header-download" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>
          下载 XLSX
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">EEG DATASET CATALOG · 2026</p>
            <h1 id="hero-title">Big Data of EEG</h1>
            <p className="hero-lead">
              {duration.catalog.units} 个可检索 EEG 单元（原始 {duration.catalog.preservedOriginalUnits} 行保持不变，另追加 {duration.catalog.supplementalUnits} 个新发布数据集）；{catalogScale.subjectKnownUnits} 个单元有受试者信息，已知下界 {catalogScale.subjectEntryLowerBound.toLocaleString("en-US")} 个 dataset-subject entries。疾病/临床队列目前可核验约 {duration.disease.knownOverlapAdjustedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h；结合官网、OpenNeuro 文件审计和独立论文复核后，全目录来源级已知覆盖约 {duration.catalog.sourceLevelKnownCoverageHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。缺失值不按 0 计入。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalog">浏览完整目录</a>
              <a className="button secondary" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>下载总表</a>
            </div>
          </div>
          <dl className="specs" aria-label="总表规格">
            <div><dt>DATASETS</dt><dd>{duration.catalog.units}</dd></div>
            <div><dt>DISEASE / CLINICAL</dt><dd>≈{(duration.disease.knownOverlapAdjustedHours / 1000).toFixed(1)}K h</dd></div>
            <div><dt>ALL KNOWN COVERAGE</dt><dd>≈{(duration.catalog.sourceLevelKnownCoverageHours / 1000).toFixed(1)}K h</dd></div>
            <div><dt>ROW-LEVEL HOURS</dt><dd>{duration.catalog.rowLevelKnownUnits}/{duration.catalog.units}</dd></div>
          </dl>
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPLETE CATALOG</p>
              <h2 id="catalog-title">完整 {duration.catalog.units} 行 EEG 总表</h2>
            </div>
            <p>原始 563 行数据未改动；2026 新发布的 Neurotech EEG Dataset 通过独立证据层追加。默认按资料完整度排序。</p>
          </div>
          <CatalogExplorer rows={eegCatalogRows} categoryStats={eegCategoryStats} />
        </section>

        <section className="download-section" id="downloads" aria-labelledby="downloads-title">
          <div className="section-heading">
            <div><p className="eyebrow">DOWNLOAD CHECKLIST</p><h2 id="downloads-title">疾病与 Health 下载执行清单</h2></div>
            <p>下载、申请、审计和舍弃使用不同状态；舍弃项仍留在总目录中作为证据，不再进入执行队列。</p>
          </div>
          <div className="download-metrics" aria-label="下载状态摘要">
            <div><span>服务器完成目录</span><strong>{acquisition.serverCompletedUnits}</strong><small>含重叠与非 raw 项</small></div>
            <div><span>独立 raw 已获取</span><strong>{acquisition.independentRawAcquiredUnits}</strong><small>疾病 {acquisition.diseaseRawAcquiredUnits} · Health {acquisition.healthRawAcquiredUnits}</small></div>
            <div><span>时长已审计</span><strong>{acquisition.exactDurationAuditUnits}</strong><small>{acquisition.exactDurationAuditHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</small></div>
            <div><span>仍可推进</span><strong>{acquisition.actionableDownloadUnits}</strong><small>另有 {acquisition.discardedUnits} 项舍弃</small></div>
          </div>
          <DownloadChecklist rows={data.downloadChecklist.rows} />
          <p className="source-note">服务器状态快照：2026-08-04；2026-08-23 经 VPN 只读复核。10 个已下载但未进入时长审计的数据集不会重复下载。</p>
        </section>

        <section className="reve-section" id="neuroatlas" aria-labelledby="neuroatlas-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">NEUROATLAS COMPARISON</p>
              <h2 id="neuroatlas-title">全目录已知覆盖约 {(duration.catalog.sourceLevelKnownCoverageHours / 10000).toFixed(2)} 万小时</h2>
            </div>
            <p>疾病类与全目录分列；reported、calculated 与 estimated 分开保留，未知时长不作为 0。</p>
          </div>

          <div className="reve-grid">
            <div className="reve-summary">
              <div className="primary-metric"><span>全目录来源级已知覆盖</span><strong>≈{duration.catalog.sourceLevelKnownCoverageHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <div><span>疾病/临床已知时长</span><strong>≈{duration.disease.knownOverlapAdjustedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <div><span>本轮 OpenNeuro 补全</span><strong>+{duration.openNeuro.addedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <div><span>独立官网/论文净新增</span><strong>+{duration.independent.sourceLevelNetAddedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <p>
                疾病/临床值来自 {duration.disease.knownUnits}/{duration.disease.units} 个有逐行证据的单元，并剔除 {duration.disease.excludedTuegChildUnits} 个 TUEG 子集及与 Harvard EEG Database 已知重叠的 I-CARE 行；它仍是当前可核验覆盖，不代表未知条目为 0。全目录来源级总量同时加入 HEEDB、Neurotech 和 NeuroLM 可唯一映射条目，并对已知重叠做保守扣除。
              </p>
            </div>
            <div className="reve-composition" role="region" aria-label="NeuroAtlas 与本目录规模对照">
              <table>
                <thead><tr><th scope="col">范围</th><th scope="col">单元</th><th scope="col">受试者条目</th><th scope="col">小时</th></tr></thead>
                <tbody>
                  <tr><td><strong>疾病/临床</strong></td><td>{duration.disease.units}</td><td>{duration.disease.knownUnits} 个有逐行时长</td><td>≈{duration.disease.knownOverlapAdjustedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                  <tr><td><strong>疾病/健康来源级覆盖</strong></td><td>{focus.units}</td><td>{focus.knownSubjectEntries.toLocaleString("en-US")}*</td><td>≈{duration.catalog.sourceLevelFocusHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                  <tr><td><strong>非重点 OpenNeuro 审计</strong></td><td>{duration.openNeuro.knownUnits}/{duration.openNeuro.candidateUnits}</td><td>{duration.openNeuro.calculatedUnits} calculated · {duration.openNeuro.estimatedUnits} estimated</td><td>+{duration.openNeuro.addedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                  <tr><td><strong>SingLEM 逐表补全</strong></td><td>{duration.literature.addedUnits}</td><td>{duration.literature.sourceLevelNonFocusUnits} 个非重点 canonical 行进入来源级总量</td><td>+{duration.literature.addedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} 逐行</td></tr>
                  <tr><td><strong>独立官网/论文复核</strong></td><td>{duration.independent.addedOriginalCatalogUnits}+{duration.independent.supplementalUnits}</td><td>HEEDB/HSP/NeuroLM + Neurotech 新发布</td><td>+{duration.independent.sourceLevelNetAddedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} 净覆盖</td></tr>
                  <tr><td><strong>全目录逐行证据</strong></td><td>{duration.catalog.rowLevelKnownUnits}/{duration.catalog.units}</td><td>{duration.catalog.rowLevelMissingUnits} 个仍未知</td><td>{duration.catalog.rowLevelHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} 原始行相加</td></tr>
                  <tr><td><strong>全目录来源级覆盖</strong></td><td>{duration.catalog.sourceLevelCoveredFocusUnits}+{duration.catalog.sourceLevelCoveredNonFocusUnits}</td><td>重点来源并集 + 非重点 canonical 行</td><td>≈{duration.catalog.sourceLevelKnownCoverageHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="source-note">
            时长审计快照：{duration.verifiedAt}。OpenNeuro 值读取公开 BIDS snapshot；SingLEM 只采用 Table I 的 multi-channel recording duration。HEEDB 的 330 万小时是 BDSP 官网近似发布值；加入时保守移除了全部 56,676 h I-CARE，以避免 Harvard 医院来源重复。* 受试者是 dataset-subject entries，不声称跨数据集唯一。
          </p>
        </section>

        <section className="paper-audit-section" id="duration-methods" aria-labelledby="duration-methods-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">FOUNDATION-MODEL DURATION AUDIT</p>
              <h2 id="duration-methods-title">论文中的“小时”并不是同一种量</h2>
            </div>
            <p>原始连续记录小时可以进入目录总量；通道小时、重叠窗和过滤后的模型样本小时只能用于说明训练规模。</p>
          </div>
          <div className="duration-callout">
            <strong>独立复核后，已知行升至 {duration.catalog.rowLevelKnownUnits}/{duration.catalog.units}</strong>
            <p>除 SingLEM 外，本轮从 NeuroLM、SleepFM、BrainWave、NeuralBench、BDSP 官方数据库等来源交叉核对；补入 HEEDB、HSP、7 个可唯一映射的 NeuroLM 条目，并追加 Neurotech 新发布数据集。仍有 {duration.catalog.rowLevelMissingUnits} 行缺少可靠时长，来源级总量或切窗数不能硬分摊到单行。</p>
          </div>
          <div className="table-shell paper-table-shell">
            <table className="paper-audit-table">
              <thead><tr><th scope="col">模型 / 论文</th><th scope="col">预训练数据</th><th scope="col">论文时长</th><th scope="col">网站处理</th></tr></thead>
              <tbody>
                {foundationPaperAudits.map((paper) => (
                  <tr key={paper.model}>
                    <td><a href={paper.paperUrl} target="_blank" rel="noreferrer"><strong>{paper.model}</strong> ↗</a><small>{paper.subjects}</small></td>
                    <td>{paper.datasets}</td>
                    <td><strong>{paper.headlineHours}</strong><small className={`basis-chip ${paper.basis}`}>{paper.basis}</small></td>
                    <td>{paper.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note">换算公式仅在分母清楚时使用：连续记录时长 = samples ÷ sampling rate，或 TR × volumes × runs；若论文报告的是切窗数，则“窗数 × 窗长”只是模型样本小时，窗口重叠时尤其不能等同于独立原始时长。</p>
        </section>

        <section className="pair-section" id="eeg-fmri" aria-labelledby="eeg-fmri-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">PAIRED EEG–FMRI SURVEY</p>
              <h2 id="eeg-fmri-title">公开 EEG–fMRI 配对数据集</h2>
            </div>
            <p>同步采集是主统计；同被试分开采集、仅公开 connectome/表格、无公开下载的数据保留在次级分类，不混入时长。</p>
          </div>
          <div className="pair-metrics" aria-label="公开同步 EEG-fMRI 汇总">
            <div><span>公开同步数据集</span><strong>{eegFmriPairSummary.datasets}</strong><small>canonical acquisitions</small></div>
            <div><span>Subject entries</span><strong>{eegFmriPairSummary.subjectEntries}</strong><small>跨数据集未去重</small></div>
            <div><span>已知配对时长</span><strong>≥{eegFmriPairSummary.knownPairedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong><small>{eegFmriPairSummary.knownDurationDatasets}/{eegFmriPairSummary.datasets} 有时长</small></div>
            <div><span>参考表外补入</span><strong>+{eegFmriPairSummary.addedDatasets}</strong><small>首轮 {eegFmriPairSummary.firstAuditAddedDatasets} · 独立复核 {eegFmriPairSummary.independentResurveyAddedDatasets}</small></div>
            <div><span>分开采集</span><strong>{eegFmriPairSummary.separateSessionDatasets}</strong><small>不计同步时长</small></div>
          </div>
          <div className="pair-audit-note">
            <p><strong>对参考 Google Sheet 的结论：</strong>原表的“21 个、419 subjects、约 263 h”混入未公开 NeuroBOLT、仅有汇总表的 MSIT 和未核实 raw 下载的 Berlin cohort。重新核对 NEMAR manifest、数据论文与官网后，NATVIEW 从错误的 5.9 h 修正为 41.87 h，并补出 Bondi 4.41 h、ATR 约 42.97 h。严格口径当前为 {eegFmriPairSummary.datasets} 个可获取同步采集、{eegFmriPairSummary.subjectEntries} 个 dataset-subject entries，已知/估计配对时长 {eegFmriPairSummary.knownPairedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。</p>
            <a href="https://docs.google.com/spreadsheets/d/1b3Tb4eD0jv-_eJzCRAL_UPl5MS7sRCp_FHz6tFmIhSA/edit?gid=0#gid=0" target="_blank" rel="noreferrer">打开参考表 ↗</a>
          </div>
          <div className="pair-added-list">
            <div>
              <strong>你问的首轮 8 个补入项</strong>
              <ol>{firstAuditPairs.map((row) => <li key={row.id}>{row.name} · {row.subjects ?? "N/A"} 人 · {row.pairedHours == null ? "时长待核" : `${row.pairedHours.toLocaleString("en-US", { maximumFractionDigits: 2 })} h`}</li>)}</ol>
            </div>
            <div>
              <strong>本次独立检索再新增</strong>
              <ol>{independentResurveyPairs.map((row) => <li key={row.id}>{row.name} · {row.subjects ?? "N/A"} 人 · {row.pairedHours == null ? "时长待核" : `${row.pairedHours.toLocaleString("en-US", { maximumFractionDigits: 2 })} h`}</li>)}</ol>
            </div>
          </div>
          <EegFmriExplorer rows={eegFmriPairs} />
          <p className="source-note">配对时长只统计 EEG 与 BOLD 同步存在的时间，不含 T1/T2、DWI、fMRI-only、EEG-only 或分开日期记录。当前 {eegFmriPairSummary.knownDurationDatasets}/{eegFmriPairSummary.datasets} 个严格纳入数据集有 reported/calculated/estimated 时长；Unknown 不按 0。AMRI sleep1 的约 256 h 是官方协议估算，也是本表最大项。NDA 控制访问候选保留在“范围待核”，未混入严格总数。</p>
        </section>

        <section className="workbook-section" id="workbook" aria-labelledby="workbook-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DOWNLOAD WORKBOOK</p>
              <h2 id="workbook-title">{data.worksheetGuide.length} 个工作表，一份精简总表</h2>
            </div>
            <a className="button primary" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>下载 XLSX</a>
          </div>
          <ol className="sheet-index">
            {data.worksheetGuide.map(([name, description], index) => (
              <li key={name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{name}</h3><p>{description}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="progress-section" id="progress" aria-labelledby="progress-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DATA PREPROCESSING</p>
              <h2 id="progress-title">数据预处理</h2>
            </div>
            <p>本区放在数据集收集之后，仅说明疾病/临床重点队列正在采用的预处理方法；不把局部生产进度外推为 563 个目录单元的统一完成率。</p>
          </div>

          <div className="progress-lenses progress-lenses-two">
            <article>
              <span>01 · 数据集收集</span>
              <strong>{catalogScale.units}</strong>
              <h3>唯一下载单元</h3>
              <p>{catalogScale.subjectKnownUnits}/{catalogScale.units} 有 subject；{duration.catalog.rowLevelKnownUnits}/{duration.catalog.units} 有逐行 duration，原始行相加为 {duration.catalog.rowLevelHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。</p>
            </article>
            <article>
              <span>02 · 本地获取</span>
              <strong>{eegProgress.acquisition.uniqueCatalogUnitsWithCompletionEvidence}</strong>
              <h3>有完成证据的目录单元</h3>
              <p>与 563 行 canonical catalog 取交集并去除旧表重复行；完成标记只证明数据单元已保留，不等同于已经完成预处理。</p>
            </article>
          </div>

          <div className="progress-table-card">
            <h3>八大类别来源规模</h3>
            <div className="table-shell">
              <table className="progress-table">
                <thead><tr><th scope="col">类别</th><th scope="col">数据单元</th><th scope="col">Subject entries</th><th scope="col">已知时长</th></tr></thead>
                <tbody>
                  {durationCategories.map((category) => (
                    <tr key={category.code}>
                      <td><strong>{category.code}</strong> · {category.label}</td>
                      <td>{category.units}</td>
                      <td>{category.subjectEntries.toLocaleString("en-US")}<small>{category.subjectKnownUnits}/{category.units} 有值</small></td>
                      <td>{category.hours == null ? "未形成可加总时长" : `${category.hours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h`}<small>{category.durationKnownUnits}/{category.units} 有值</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="method-strip" aria-label="疾病与临床数据预处理方法摘要">
            {eegProgress.methodology.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>
            ))}
          </div>
          <p className="source-note">
            快照日期：{duration.verifiedAt}。当前 {duration.catalog.rowLevelKnownUnits}/{duration.catalog.units} 行有时长证据，原始相加 {duration.catalog.rowLevelHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h；其中可能包含父集/子集，因此另给出来源级去重覆盖约 {duration.catalog.sourceLevelKnownCoverageHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。仍有 {duration.catalog.rowLevelMissingUnits} 行未知，最终真实时长只能高于当前已知覆盖，不能把未知值当作 0。
          </p>
        </section>
      </main>

      <footer>
        <div><span className="brand-mark" aria-hidden="true">∿</span><strong>BIG DATA</strong></div>
        <p>{duration.catalog.units} searchable units · {data.worksheetGuide.length} workbook sheets</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </>
  );
}
