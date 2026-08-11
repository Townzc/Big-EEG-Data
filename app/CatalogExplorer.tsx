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
};

const categoryLabels: Record<string, string> = {
  "01_Signal_Reliability": "Signal Reliability",
  "02_Healthcare_and_Disease": "Healthcare & Disease",
  "03_Consciousness_and_State": "Consciousness & State",
  "04_Cognition_and_Emotion": "Cognition & Emotion",
  "05_Naturalistic_Stimulus_Decoding": "Naturalistic Decoding",
  "06_Motor_and_Interaction": "Motor & Interaction",
  "07_General-purpose": "General-purpose",
  "07_General-purpose_and_Multi-paradigm": "General-purpose",
  "08_Health_and_Population": "Health & Population",
};

const accessLabels: Record<string, string> = {
  DOWNLOAD_PUBLIC: "公开下载",
  DOWNLOAD_APPLICATION_REQUIRED: "需申请",
};

export function CatalogExplorer({ rows }: { rows: CatalogRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [access, setAccess] = useState("全部");
  const [onlyNew, setOnlyNew] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(rows.map((row) => row.largeCategory))).sort()],
    [rows],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return rows
      .filter((row) => category === "全部" || row.largeCategory === category)
      .filter((row) => access === "全部" || row.access === access)
      .filter((row) => !onlyNew || row.isNew)
      .filter((row) => !needle || [row.id, row.name, row.task, row.largeCategory, row.smallCategory, row.stableId]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(needle)))
      .sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.id.localeCompare(b.id));
  }, [rows, query, category, access, onlyNew]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const update = (callback: () => void) => { callback(); setPage(1); };
  const reset = () => {
    setQuery(""); setCategory("全部"); setAccess("全部"); setOnlyNew(false); setPage(1); setPageSize(25);
  };

  return (
    <div className="explorer">
      <form className="filters" onSubmit={(event) => event.preventDefault()} aria-label="筛选完整 EEG 数据目录">
        <label className="search-field">
          <span>搜索</span>
          <input value={query} onChange={(event) => update(() => setQuery(event.target.value))} placeholder="名称、任务、ID 或稳定标识" />
        </label>
        <label>
          <span>大类目录</span>
          <select value={category} onChange={(event) => update(() => setCategory(event.target.value))}>
            {categories.map((item) => <option key={item} value={item}>{item === "全部" ? item : (categoryLabels[item] ?? item)}</option>)}
          </select>
        </label>
        <label>
          <span>访问方式</span>
          <select value={access} onChange={(event) => update(() => setAccess(event.target.value))}>
            <option value="全部">全部</option>
            <option value="DOWNLOAD_PUBLIC">公开下载</option>
            <option value="DOWNLOAD_APPLICATION_REQUIRED">需申请</option>
          </select>
        </label>
        <label className="check-field">
          <input type="checkbox" checked={onlyNew} onChange={(event) => update(() => setOnlyNew(event.target.checked))} />
          <span>只看本轮新增</span>
        </label>
        <button type="button" className="reset" onClick={reset}>重置</button>
      </form>

      <div className="result-line" aria-live="polite">
        <p><strong>{filtered.length}</strong> 个唯一下载单元</p>
        <label>每页
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
            <option value="25">25</option><option value="50">50</option><option value="100">100</option>
          </select>
        </label>
      </div>

      <div className="table-shell" role="region" aria-label="完整 EEG 数据集表格，可横向滚动">
        <table>
          <caption className="sr-only">完整 548 行 EEG 唯一下载单元总表</caption>
          <thead><tr><th scope="col">ID</th><th scope="col">数据集</th><th scope="col">目录</th><th scope="col">任务</th><th scope="col">受试者</th><th scope="col">格式</th><th scope="col">入口与证据</th></tr></thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td><span className="mono">{row.id}</span>{row.isNew ? <b className="new-badge">NEW</b> : null}</td>
                <td><strong>{row.name}</strong>{row.stableId ? <small>{row.stableId}</small> : null}</td>
                <td><span className="category-pill">{categoryLabels[row.largeCategory] ?? row.largeCategory}</span><small>{row.smallCategory}</small></td>
                <td>{row.task ?? "—"}</td>
                <td>{row.subjectsDisplay ?? "未给出"}</td>
                <td>{row.format ?? "未给出"}</td>
                <td>
                  {row.url ? <a href={row.url} target="_blank" rel="noreferrer">{accessLabels[row.access] ?? row.access} ↗</a> : <span>{accessLabels[row.access] ?? row.access}</span>}
                  {row.verification ? <small>{row.verification}</small> : null}
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
  );
}
