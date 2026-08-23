import type { Metadata } from "next";
import data from "../public/catalog-data.json";
import { CatalogExplorer } from "./CatalogExplorer";

export const metadata: Metadata = {
  title: "BIG EEG DATA",
  description: "A searchable catalog of 562 EEG dataset download units with an 18-sheet evidence workbook and NeuroAtlas source comparison.",
};

export default function Home() {
  const reve = data.reveComparison;
  const neuro = data.neuroAtlasComparison;
  const focus = neuro.focusCoverage;
  const union = neuro.sourceUnion;
  const neuroAtlasAdditions = neuro.sources.filter((row) => row.status === "本轮补入");

  return (
    <>
      <a className="skip-link" href="#catalog">跳到完整数据目录</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回页面顶部">
          <span className="brand-mark" aria-hidden="true">∿</span>
          <span>BIG EEG DATA</span>
        </a>
        <nav aria-label="主要导航">
          <a href="#categories">分类</a>
          <a href="#catalog">完整目录</a>
          <a href="#neuroatlas">NeuroAtlas 对照</a>
          <a href="#workbook">证据工作表</a>
        </nav>
        <a className="header-download" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>
          下载 XLSX
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">EEG DATASET CATALOG · 2026</p>
            <h1 id="hero-title">BIG EEG DATA</h1>
            <p className="hero-lead">
              562 个 EEG 下载单元；NeuroAtlas 42 个来源已全部覆盖。疾病/健康来源级去重覆盖约 34.65 万小时，已下载与未下载范围分开统计。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalog">浏览完整目录</a>
              <a className="button secondary" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>下载总表</a>
            </div>
          </div>
          <dl className="specs" aria-label="总表规格">
            <div><dt>DATASETS</dt><dd>{data.metrics.finalUniqueUnits}</dd></div>
            <div><dt>WORKSHEETS</dt><dd>{data.worksheetGuide.length}</dd></div>
            <div><dt>DISEASE + HEALTH</dt><dd>≈{(union.extendedHours / 1000).toFixed(1)}K h</dd></div>
          </dl>
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
                  <tr><td><strong>已下载并审计</strong></td><td>{focus.downloadedUnits}</td><td>≥{data.metrics.currentRaw.observedSubjectLowerBound.toLocaleString("en-US")}</td><td>{focus.downloadedHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                  <tr><td><strong>未下载/未纳入本地审计</strong></td><td>{focus.notDownloadedUnits}</td><td>见逐行来源口径</td><td>≈{focus.pendingHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}</td></tr>
                  <tr><td><strong>NeuroAtlas</strong></td><td>{neuro.paper.datasets}</td><td>论文分域报告</td><td>≈{neuro.paper.hoursRounded.toLocaleString("en-US")}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <ul className="difference-list neuroatlas-additions">
            {neuroAtlasAdditions.map((item) => <li key={item.source}><strong>{item.source} · {item.domain}</strong><span>{item.focusScope}；{item.download}。{item.note}</span></li>)}
          </ul>
          <p className="source-note">
            NeuroAtlas 对照：原目录覆盖 {neuro.match.alreadyCovered}/42，本轮补入 {neuro.match.added} 个后为 42/42。* 受试者为各数据源报告值的条目合计，不声称为跨数据集去重后的唯一人数。REVE 的 61,415 h 与 89 个明示来源对照仍保留在工作簿中；当前保守可比覆盖为 {reve.sourceUnion.conservativeComparableHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。
          </p>
        </section>

        <section className="workbook-section" id="workbook" aria-labelledby="workbook-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVIDENCE WORKBOOK</p>
              <h2 id="workbook-title">{data.worksheetGuide.length} 个工作表，一套完整证据链</h2>
            </div>
            <a className="button primary" href="/EEG_healthcare_disease_catalog_20260823.xlsx" download>下载完整工作簿</a>
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
        <div><span className="brand-mark" aria-hidden="true">∿</span><strong>BIG EEG DATA</strong></div>
        <p>{data.metrics.finalUniqueUnits} download units · {data.worksheetGuide.length} evidence worksheets</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </>
  );
}
