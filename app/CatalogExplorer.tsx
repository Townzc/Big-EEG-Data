"use client";

import { useMemo, useState } from "react";

type CatalogRow = {
  id: string;
  name: string;
  largeCategory: string;
  smallCategory: string;
  task: string | null;
  subjectsDisplay: string | number | null;
  format: string | null;
  access: string;
  url: string;
  stableId: string | null;
  verification: string | null;
  isNew: boolean;
  durationHours: number | null;
  durationBasis?: string;
  durationEvidence?: string;
  durationEvidenceUrl?: string;
  durationSource?: "reported" | "calculated" | "estimated";
  completenessScore: number;
  completenessMax: number;
};

type CategoryStat = {
  code: string;
  label: string;
  count: number;
  subcategories: { name: string; count: number }[];
};

const ALL = "全部";
const categoryLabels: Record<string, string> = {
  "01_Signal_Reliability": "信号可靠性",
  "02_Healthcare_and_Disease": "医疗与疾病",
  "03_Consciousness_and_State": "意识与状态",
  "04_Cognition_and_Emotion": "认知与情感",
  "05_Naturalistic_Stimulus_Decoding": "自然刺激解码",
  "06_Motor_and_Interaction": "运动与交互",
  "07_General-purpose_and_Multi-paradigm": "通用与多范式",
  "07_General-purpose": "通用与多范式",
  "08_Health_and_Population": "健康与人群",
};

const accessLabels: Record<string, string> = {
  DOWNLOAD_PUBLIC: "公开下载",
  DOWNLOAD_APPLICATION_REQUIRED: "需要申请",
  DOWNLOAD_UNAVAILABLE: "当前不可获取",
};

function normalizeCategory(value: string) {
  return value.startsWith("07_General-purpose") ? "07_General-purpose_and_Multi-paradigm" : value;
}

export function CatalogExplorer({ rows, categoryStats }: { rows: CatalogRow[]; categoryStats: CategoryStat[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [subcategory, setSubcategory] = useState(ALL);
  const [access, setAccess] = useState(ALL);
  const [sort, setSort] = useState("complete");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const activeCategory = categoryStats.find((item) => item.code === category);
  const subcategories = activeCategory?.subcategories ?? [];

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const result = rows
      .filter((row) => category === ALL || normalizeCategory(row.largeCategory) === category)
      .filter((row) => subcategory === ALL || row.smallCategory === subcategory)
      .filter((row) => access === ALL || row.access === access)
      .filter((row) => !needle || [row.id, row.name, row.task, row.largeCategory, row.smallCategory, row.stableId]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(needle)));

    return result.sort((a, b) => {
      if (sort === "id") return a.id.localeCompare(b.id, "en", { numeric: true });
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "duration") return (b.durationHours ?? -1) - (a.durationHours ?? -1) || b.completenessScore - a.completenessScore;
      return b.completenessScore - a.completenessScore
        || Number(b.durationHours != null) - Number(a.durationHours != null)
        || a.id.localeCompare(b.id, "en", { numeric: true });
    });
  }, [rows, query, category, subcategory, access, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const update = (callback: () => void) => { callback(); setPage(1); };
  const chooseCategory = (code: string) => update(() => { setCategory(code); setSubcategory(ALL); });
  const reset = () => {
    setQuery(""); setCategory(ALL); setSubcategory(ALL); setAccess(ALL); setSort("complete"); setPage(1); setPageSize(5);
  };

  return (
    <div className="catalog-stack">
      <section className="category-panel" id="categories" aria-labelledby="category-title">
        <div className="category-panel-head">
          <div><p className="eyebrow">CATEGORY INDEX</p><h3 id="category-title">按类别查看</h3></div>
          <button type="button" className={category === ALL ? "category-card active" : "category-card"} onClick={() => chooseCategory(ALL)}>
            <span>全部</span><strong>{rows.length}</strong>
          </button>
        </div>
        <div className="category-grid">
          {categoryStats.map((item) => (
            <button type="button" key={item.code} className={category === item.code ? "category-card active" : "category-card"} onClick={() => chooseCategory(item.code)} aria-pressed={category === item.code}>
              <span>{item.label}</span><strong>{item.count}</strong><small>{item.subcategories.length} 个小类</small>
            </button>
          ))}
        </div>
        {activeCategory ? (
          <div className="subcategory-row" aria-label={`${activeCategory.label}小类统计`}>
            <button type="button" className={subcategory === ALL ? "active" : ""} onClick={() => update(() => setSubcategory(ALL))}>全部 {activeCategory.count}</button>
            {subcategories.map((item) => (
              <button type="button" key={item.name} className={subcategory === item.name ? "active" : ""} onClick={() => update(() => setSubcategory(item.name))}>
                {item.name} <strong>{item.count}</strong>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="explorer">
        <form className="filters" onSubmit={(event) => event.preventDefault()} aria-label="筛选完整 EEG 数据目录">
          <label className="search-field">
            <span>搜索</span>
            <input value={query} onChange={(event) => update(() => setQuery(event.target.value))} placeholder="名称、任务、ID 或稳定标识" />
          </label>
          <label>
            <span>大类目录</span>
            <select value={category} onChange={(event) => chooseCategory(event.target.value)}>
              <option value={ALL}>全部</option>
              {categoryStats.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.count}</option>)}
            </select>
          </label>
          <label>
            <span>小类目录</span>
            <select value={subcategory} onChange={(event) => update(() => setSubcategory(event.target.value))} disabled={!activeCategory}>
              <option value={ALL}>全部</option>
              {subcategories.map((item) => <option key={item.name} value={item.name}>{item.name} · {item.count}</option>)}
            </select>
          </label>
          <label>
            <span>访问方式</span>
            <select value={access} onChange={(event) => update(() => setAccess(event.target.value))}>
              <option value={ALL}>全部</option>
              <option value="DOWNLOAD_PUBLIC">公开下载</option>
              <option value="DOWNLOAD_APPLICATION_REQUIRED">需要申请</option>
              <option value="DOWNLOAD_UNAVAILABLE">当前不可获取</option>
            </select>
          </label>
          <label>
            <span>排序</span>
            <select value={sort} onChange={(event) => update(() => setSort(event.target.value))}>
              <option value="complete">资料完整度优先</option>
              <option value="duration">时长优先</option>
              <option value="id">ID</option>
              <option value="name">名称</option>
            </select>
          </label>
          <button type="button" className="reset" onClick={reset}>重置</button>
        </form>

        <div className="result-line" aria-live="polite">
          <p><strong>{filtered.length}</strong> 个唯一下载单元</p>
          <label>每页
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
              <option value="5">5</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
            </select>
          </label>
        </div>

        <div className="table-shell" role="region" aria-label="完整 EEG 数据集表格，可横向滚动">
          <table>
            <caption className="sr-only">完整 {rows.length} 行 EEG 下载单元总表</caption>
            <thead><tr><th scope="col">ID</th><th scope="col">数据集</th><th scope="col">目录</th><th scope="col">任务</th><th scope="col">受试者</th><th scope="col">时长</th><th scope="col">格式</th><th scope="col">资料</th><th scope="col">入口与证据</th></tr></thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td><span className="mono">{row.id}</span>{row.isNew ? <b className="new-badge">NEW</b> : null}</td>
                  <td><strong>{row.name}</strong>{row.stableId ? <small>{row.stableId}</small> : null}</td>
                  <td><span className="category-pill">{categoryLabels[normalizeCategory(row.largeCategory)] ?? row.largeCategory}</span><small>{row.smallCategory}</small></td>
                  <td>{row.task ?? "—"}</td>
                  <td>{row.subjectsDisplay ?? "未给出"}</td>
                  <td>
                    {row.durationHours == null ? "未给出" : `${row.durationHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h`}
                    {row.durationSource ? <span className={`evidence evidence-${row.durationSource}`}>{row.durationSource}</span> : null}
                    {row.durationHours != null && row.durationBasis ? <small>{row.durationBasis}</small> : null}
                  </td>
                  <td>{row.format ?? "未给出"}</td>
                  <td><span className="score-badge">{row.completenessScore}/{row.completenessMax}</span></td>
                  <td>
                    {row.url ? <a href={row.url} target="_blank" rel="noreferrer">{accessLabels[row.access] ?? row.access} ↗</a> : <span>{accessLabels[row.access] ?? row.access}</span>}
                    {row.verification ? <small>{row.verification}</small> : null}
                    {row.durationEvidence ? <small>时长依据：{row.durationEvidence}{row.durationEvidenceUrl && row.durationEvidenceUrl !== row.url ? <> · <a href={row.durationEvidenceUrl} target="_blank" rel="noreferrer">来源 ↗</a></> : null}</small> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination" aria-label="数据表分页">
          <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← 上一页</button>
          <span>第 {safePage} / {pages} 页 · 显示 {filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} 行</span>
          <button type="button" disabled={safePage === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>下一页 →</button>
        </div>
      </div>
    </div>
  );
}
