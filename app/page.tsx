import type { Metadata } from "next";
import data from "../public/catalog-data.json";
import { CatalogExplorer } from "./CatalogExplorer";

export const metadata: Metadata = {
  title: "BIG EEG DATA",
  description: "A searchable catalog of 548 EEG dataset download units and their evidence workbook.",
};

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#catalog">跳到完整数据目录</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回页面顶部">
          <span className="brand-mark" aria-hidden="true">∿</span>
          <span>BIG EEG DATA</span>
        </a>
        <nav aria-label="主要导航">
          <a href="#catalog">完整目录</a>
          <a href="#workbook">证据工作表</a>
        </nav>
        <a className="header-download" href="/EEG_healthcare_disease_catalog_20260810.xlsx" download>
          下载 XLSX
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">EEG DATASET CATALOG · 2026</p>
            <h1 id="hero-title">BIG EEG DATA</h1>
            <p className="hero-lead">
              548 个唯一下载单元，覆盖完整 EEG 目录、数据入口、受试者信息、任务、格式与核验证据。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#catalog">浏览完整目录</a>
              <a className="button secondary" href="/EEG_healthcare_disease_catalog_20260810.xlsx" download>下载总表</a>
            </div>
          </div>
          <dl className="specs" aria-label="总表规格">
            <div><dt>DATASETS</dt><dd>548</dd></div>
            <div><dt>WORKSHEETS</dt><dd>15</dd></div>
            <div><dt>NEW THIS ROUND</dt><dd>11</dd></div>
          </dl>
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPLETE CATALOG</p>
              <h2 id="catalog-title">完整 548 行 EEG 总表</h2>
            </div>
            <p>按名称、任务、ID、目录与访问方式检索。每一行对应一个唯一下载单元。</p>
          </div>
          <CatalogExplorer rows={data.catalogRows} />
        </section>

        <section className="workbook-section" id="workbook" aria-labelledby="workbook-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVIDENCE WORKBOOK</p>
              <h2 id="workbook-title">15 个工作表，一套完整证据链</h2>
            </div>
            <a className="button primary" href="/EEG_healthcare_disease_catalog_20260810.xlsx" download>下载完整工作簿</a>
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
        <p>548 unique download units · 15 evidence worksheets</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </>
  );
}
