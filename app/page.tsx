import type { Metadata } from "next";
import data from "../public/catalog-data.json";
import { CatalogExplorer } from "./CatalogExplorer";
import { DownloadChecklist } from "./DownloadChecklist";
import { ModalitySwitcher } from "./ModalitySwitcher";
import { eegProgress } from "../data/eeg-progress";

export const metadata: Metadata = {
  title: "Big Data of EEG",
  description: "A searchable 563-unit EEG catalog with catalog-wide subject and duration coverage, acquisition status, and strictly validated preprocessing progress.",
};

export default function Home() {
  const reve = data.reveComparison;
  const neuro = data.neuroAtlasComparison;
  const focus = neuro.focusCoverage;
  const union = neuro.sourceUnion;
  const acquisition = data.metrics.acquisition;
  const catalogScale = eegProgress.catalog;
  const preprocessing = eegProgress.preprocessing;
  const preprocessingPercent = 100 * preprocessing.strictCompleteTargets / preprocessing.effectiveTargets;

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
          <a href="#categories">分类</a>
          <a href="#progress">全量进度</a>
          <a href="#catalog">完整目录</a>
          <a href="#downloads">下载清单</a>
          <a href="#neuroatlas">NeuroAtlas 对照</a>
          <a href="#workbook">工作簿</a>
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
              {catalogScale.units} 个 EEG 下载单元；{catalogScale.subjectKnownUnits} 个有受试者信息，已知下界 {catalogScale.subjectEntryLowerBound.toLocaleString("en-US")} 个 dataset-subject entries。当前来源级去重覆盖估计约 {catalogScale.sourceDeduplicatedCoverageEstimateHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h；完整563个单元的实际总时长尚未闭合。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalog">浏览完整目录</a>
              <a className="button secondary" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>下载总表</a>
            </div>
          </div>
          <dl className="specs" aria-label="总表规格">
            <div><dt>DATASETS</dt><dd>{data.metrics.finalUniqueUnits}</dd></div>
            <div><dt>SUBJECT ENTRIES</dt><dd>{catalogScale.subjectEntryLowerBound.toLocaleString("en-US")}+</dd></div>
            <div><dt>KNOWN COVERAGE</dt><dd>≈{Math.round(catalogScale.sourceDeduplicatedCoverageEstimateHours).toLocaleString("en-US")}</dd></div>
            <div><dt>SERVER COMPLETE</dt><dd>{eegProgress.acquisition.uniqueCatalogUnitsWithCompletionEvidence}</dd></div>
          </dl>
        </section>

        <section className="progress-section" id="progress" aria-labelledby="progress-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CATALOG · ACQUISITION · PREPROCESSING</p>
              <h2 id="progress-title">全类别数据规模与本地进度</h2>
            </div>
            <p>三个口径分开报告：全目录来源规模、本地获取证据、严格通过终端验证的预处理结果。缺失值不按 0 计。</p>
          </div>

          <div className="progress-lenses">
            <article>
              <span>01 · 全目录</span>
              <strong>{catalogScale.units}</strong>
              <h3>唯一下载单元</h3>
              <p>{catalogScale.subjectKnownUnits}/{catalogScale.units} 有 subject；{catalogScale.durationKnownUnits}/{catalogScale.units} 有逐行 duration，合计 {catalogScale.documentedHoursRowSum.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。来源级去重覆盖约 {catalogScale.sourceDeduplicatedCoverageEstimateHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。</p>
            </article>
            <article>
              <span>02 · 本地获取</span>
              <strong>{eegProgress.acquisition.uniqueCatalogUnitsWithCompletionEvidence}</strong>
              <h3>有完成证据的目录单元</h3>
              <p>与 563 行 canonical catalog 取交集并去除旧表重复行；当前 datasets 目录约 {eegProgress.acquisition.datasetsDiskTiB} TiB，GPFS 约剩 {eegProgress.acquisition.gpfsFreeTiB} TiB。</p>
            </article>
            <article>
              <span>03 · 严格预处理</span>
              <strong>{preprocessing.strictCompleteTargets}/{preprocessing.effectiveTargets}</strong>
              <h3>{preprocessingPercent.toFixed(1)}% 通过终端验证</h3>
              <p>{preprocessing.outputs.toLocaleString("en-US")} 个 outputs、{preprocessing.subjectEntries.toLocaleString("en-US")} 个 adapter-level subject entries、{preprocessing.signalHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h；衍生数据约 {(preprocessing.derivativeBytes / 1e12).toFixed(2)} TB。</p>
            </article>
          </div>

          <div className="progress-detail-grid">
            <div className="progress-table-card">
              <h3>八大类别来源规模</h3>
              <div className="table-shell">
                <table className="progress-table">
                  <thead><tr><th scope="col">类别</th><th scope="col">数据单元</th><th scope="col">Subject entries</th><th scope="col">已知时长</th></tr></thead>
                  <tbody>
                    {eegProgress.categories.map((category) => (
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

            <aside className="progress-status" aria-label="当前生产与统计边界">
              <h3>当前生产与统计边界</h3>
              <ul>
                {preprocessing.activeTargets.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <dl>
                <div><dt>正式需申请</dt><dd>{eegProgress.acquisition.focusApplicationRequiredUnits}</dd></div>
                <div><dt>已申请等待</dt><dd>{eegProgress.acquisition.focusAppliedWaitingUnits}</dd></div>
                <div><dt>尚未申请</dt><dd>{eegProgress.acquisition.focusNotYetAppliedUnits}</dd></div>
                <div><dt>严格验证 events</dt><dd>{preprocessing.eventRows.toLocaleString("en-US")}</dd></div>
                <div><dt>GPFS 可用</dt><dd>{eegProgress.acquisition.gpfsFreeTiB} TiB</dd></div>
                <div><dt>当前批次预算</dt><dd>{preprocessing.activeProductionBudgetGiB} GiB</dd></div>
              </dl>
            </aside>
          </div>

          <div className="method-strip" aria-label="预处理方法摘要">
            {eegProgress.methodology.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>
            ))}
          </div>
          <p className="source-note">
            快照日期：{eegProgress.snapshotDate}。全目录 subject 是来源报告条目下界，未跨数据集去重。308,233.5 h 是 94 行原始相加，会包含父集/子集或重复队列；这94行全部位于147个疾病/健康重点单元内，其余416个单元尚无可加总时长。因此当前应报告“已知来源覆盖约 {union.extendedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h”，而不是把30.82万小时当作563个单元的最终总时长。严格预处理 subject 同样是 adapter 内相加，不代表全球唯一人数。
          </p>
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPLETE CATALOG</p>
              <h2 id="catalog-title">完整 {data.metrics.finalUniqueUnits} 行 EEG 总表</h2>
            </div>
            <p>默认按资料完整度排序；缺少受试者、通道、采样率、格式、入口或时长的条目自动后置。</p>
          </div>
          <CatalogExplorer rows={data.catalogRows} categoryStats={data.categoryStats} />
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
            <div><span>正式需申请</span><strong>{acquisition.applicationRequiredUnits}</strong><small>{acquisition.appliedWaitingUnits} 已申请 · {acquisition.notYetAppliedUnits} 待申请</small></div>
          </div>
          <DownloadChecklist rows={data.downloadChecklist.rows} />
          <p className="source-note">服务器状态快照：2026-08-04；2026-08-23 经 VPN 只读复核。10 个已下载但未进入时长审计的数据集不会重复下载。</p>
        </section>

        <section className="reve-section" id="neuroatlas" aria-labelledby="neuroatlas-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">NEUROATLAS COMPARISON</p>
              <h2 id="neuroatlas-title">疾病/健康去重覆盖约 {(union.extendedHours / 10000).toFixed(2)} 万小时</h2>
            </div>
            <p>NeuroAtlas 的脑龄任务复用睡眠队列，不重复叠加；全部数字按数据源层级去重。</p>
          </div>

          <div className="reve-grid">
            <div className="reve-summary">
              <div className="primary-metric"><span>疾病/健康来源覆盖</span><strong>≈{union.extendedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <div><span>NeuroAtlas 全基准</span><strong>≈{neuro.paper.hoursRounded.toLocaleString("en-US")} h</strong></div>
              <div><span>超出 NeuroAtlas</span><strong>+{union.exceedsNeuroAtlasFullByHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <p>
                核心并集约 {union.coreHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h：以 NeuroAtlas 癫痫 + 睡眠 25 个来源的约 259,000 h 为底稿，用完整 TUEG 父集替换其 TUSZ 子集，再加入不重叠的 I-CARE。即使不计 HBN、EEG-Bench 和其他小型来源，也已超过 26 万小时。
              </p>
            </div>
            <div className="reve-composition" role="region" aria-label="NeuroAtlas 与本目录规模对照">
              <table>
                <thead><tr><th scope="col">范围</th><th scope="col">单元</th><th scope="col">受试者条目</th><th scope="col">小时</th></tr></thead>
                <tbody>
                  <tr><td><strong>疾病/健康总范围</strong></td><td>{focus.units}</td><td>{focus.knownSubjectEntries.toLocaleString("en-US")}*</td><td>≈{union.extendedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                  <tr><td><strong>独立 raw 已获取</strong></td><td>{acquisition.independentRawAcquiredUnits}</td><td>其中 {acquisition.exactDurationAuditUnits} 个有时长审计</td><td>{focus.downloadedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} 已审计</td></tr>
                  <tr><td><strong>仍可推进下载</strong></td><td>{acquisition.actionableDownloadUnits}</td><td>申请/登录/公开入口分列</td><td>未知保持空白</td></tr>
                  <tr><td><strong>停止投入</strong></td><td>{acquisition.discardedUnits}</td><td>保留目录证据</td><td>不计入执行队列</td></tr>
                  <tr><td><strong>NeuroAtlas</strong></td><td>{neuro.paper.datasets}</td><td>论文分域报告</td><td>≈{neuro.paper.hoursRounded.toLocaleString("en-US")}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="source-note">
            NeuroAtlas 对照：原目录覆盖 {neuro.match.alreadyCovered}/42，本轮补入 {neuro.match.added} 个后为 42/42。* 受试者为 {focus.knownSubjectEntryUnits}/{focus.units} 个疾病/健康数据单元的来源报告条目合计，不声称为跨数据集去重后的唯一人数；CHBMP 项目队列为 282 人，当前 LORIS 可见 250 条 raw EEG session。REVE 的 61,415 h 与 89 个明示来源对照仍保留在网页数据中；当前保守可比覆盖为 {reve.sourceUnion.conservativeComparableHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。
          </p>
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
      </main>

      <footer>
        <div><span className="brand-mark" aria-hidden="true">∿</span><strong>BIG DATA</strong></div>
        <p>{data.metrics.finalUniqueUnits} download units · {data.worksheetGuide.length} workbook sheets</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </>
  );
}
