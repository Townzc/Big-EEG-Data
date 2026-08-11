import type { Metadata } from "next";
import data from "../public/catalog-data.json";
import { CatalogExplorer } from "./CatalogExplorer";

export const metadata: Metadata = {
  title: "BIG EEG DATA",
  description: "A searchable catalog of 556 EEG dataset download units with a 17-sheet evidence workbook.",
};

export default function Home() {
  const reve = data.reveComparison;

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
          <a href="#reve">REVE 对照</a>
          <a href="#workbook">证据工作表</a>
        </nav>
        <a className="header-download" href="/EEG_healthcare_disease_catalog_20260811.xlsx" download>
          下载 XLSX
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">EEG DATASET CATALOG · 2026</p>
            <h1 id="hero-title">BIG EEG DATA</h1>
            <p className="hero-lead">
              556 个唯一下载单元，覆盖完整 EEG 目录、官方入口、受试者信息、任务、格式、时长与证据链。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalog">浏览完整目录</a>
              <a className="button secondary" href="/EEG_healthcare_disease_catalog_20260811.xlsx" download>下载总表</a>
            </div>
          </div>
          <dl className="specs" aria-label="总表规格">
            <div><dt>DATASETS</dt><dd>556</dd></div>
            <div><dt>WORKSHEETS</dt><dd>17</dd></div>
            <div><dt>COMPARABLE HOURS</dt><dd>≥63.4K</dd></div>
          </dl>
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPLETE CATALOG</p>
              <h2 id="catalog-title">完整 556 行 EEG 总表</h2>
            </div>
            <p>默认按资料完整度排序；缺少受试者、通道、采样率、格式、入口或时长的条目自动后置。</p>
          </div>
          <CatalogExplorer rows={data.catalogRows} categoryStats={data.categoryStats} />
        </section>

        <section className="reve-section" id="reve" aria-labelledby="reve-title">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">REVE COMPARISON</p>
              <h2 id="reve-title">可比来源覆盖已超过 REVE</h2>
            </div>
            <p>两个数字使用不同口径，不能把差值直接理解为“仍缺少的下载时长”。</p>
          </div>

          <div className="reve-grid">
            <div className="reve-summary">
              <div className="primary-metric"><span>保守可比来源覆盖</span><strong>≥{reve.sourceUnion.conservativeComparableHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <div><span>REVE 预训练汇编</span><strong>{reve.paperHeadline.hours.toLocaleString("en-US")} h</strong></div>
              <div><span>本地已下载文件审计</span><strong>{reve.currentDownloadedAuditHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</strong></div>
              <p>
                REVE 的 61,415 h 加上我们已审计、且未出现在 Appendix B 89 个明示来源中的 {reve.sourceUnion.localOnlyAuditedUnits} 个来源，直接并集为 {reve.sourceUnion.directUnionHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。再把最大的 3 个额外来源全部预留给 REVE 未写明的 3 个名称，保守值仍为 {reve.sourceUnion.conservativeComparableHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h。
              </p>
            </div>
            <div className="reve-composition" role="region" aria-label="REVE 数据组成">
              <table>
                <thead><tr><th scope="col">来源</th><th scope="col">数据集</th><th scope="col">受试者</th><th scope="col">小时</th></tr></thead>
                <tbody>{reve.composition.map((row) => (
                  <tr key={row.platform}>
                    <td><strong>{row.platform}</strong></td>
                    <td>{row.datasets}</td>
                    <td>{row.subjects.toLocaleString("en-US")}</td>
                    <td>{row.hours.toLocaleString("en-US")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>

          <ul className="difference-list">
            {reve.keyDifferences.map((item) => <li key={item.item}><strong>{item.item}</strong><span>{item.note}</span></li>)}
          </ul>
          <p className="source-note">
            REVE 论文 Table 7 称 92 个来源，但 Appendix B 逐名列出的唯一名称/ID 为 89 个；完成别名合并并补入 8 个 HBN releases 后，本目录已覆盖这 89 个明示来源。
          </p>
        </section>

        <section className="workbook-section" id="workbook" aria-labelledby="workbook-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVIDENCE WORKBOOK</p>
              <h2 id="workbook-title">17 个工作表，一套完整证据链</h2>
            </div>
            <a className="button primary" href="/EEG_healthcare_disease_catalog_20260811.xlsx" download>下载完整工作簿</a>
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
        <p>556 unique download units · 17 evidence worksheets</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </>
  );
}
