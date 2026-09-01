"use client";

import { useMemo, useState } from "react";
import type { EegFmriPair } from "../data/eeg-fmri-pairs";

const pairingLabels: Record<EegFmriPair["pairing"], string> = {
  simultaneous: "同步采集",
  "same-participants-separate": "同被试·分开采集",
  "derived-only": "仅衍生数据",
  "not-public": "未公开",
  unclear: "范围待核",
};

const activityLabels: Record<EegFmriPair["activity"], string> = {
  rest: "静息态",
  task: "任务态",
  sleep: "睡眠",
  naturalistic: "自然刺激",
  mixed: "混合设计",
};

const durationLabels: Record<EegFmriPair["durationSource"], string> = {
  reported: "reported",
  calculated: "calculated",
  estimated: "estimated",
  unavailable: "unavailable",
};

const sourceOriginLabels: Record<EegFmriPair["sourceOrigin"], string> = {
  "reference-sheet": "参考表已有",
  "added-in-audit": "首轮补入",
  "added-independent-resurvey": "独立复核新增",
};

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function EegFmriExplorer({ rows }: { rows: EegFmriPair[] }) {
  const [query, setQuery] = useState("");
  const [pairing, setPairing] = useState("simultaneous");
  const [activity, setActivity] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (pairing !== "all" && row.pairing !== pairing) return false;
      if (activity !== "all" && row.activity !== activity) return false;
      if (!needle) return true;
      return [row.name, row.repository, row.paradigms, row.notes, row.id].join(" ").toLowerCase().includes(needle);
    });
  }, [rows, query, pairing, activity]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };
  const downloadCsv = () => {
    const headers = ["id", "name", "repository", "subjects", "paired_hours", "duration_source", "pairing", "activity", "access", "source_url", "paper_url", "duration_note", "notes"];
    const lines = [headers.map(csvCell).join(","), ...filtered.map((row) => [
      row.id, row.name, row.repository, row.subjects, row.pairedHours, row.durationSource,
      row.pairing, row.activity, row.access, row.sourceUrl, row.paperUrl, row.durationNote, row.notes,
    ].map(csvCell).join(","))];
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "eeg-fmri-pair-survey.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pair-explorer">
      <div className="pair-filters" aria-label="EEG-fMRI 数据集筛选">
        <label>
          <span>搜索</span>
          <input value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="名称、任务、仓库…" />
        </label>
        <label>
          <span>配对方式</span>
          <select value={pairing} onChange={(event) => updateFilter(setPairing, event.target.value)}>
            <option value="simultaneous">同步采集</option>
            <option value="same-participants-separate">同被试·分开采集</option>
            <option value="derived-only">仅衍生数据</option>
            <option value="unclear">范围待核</option>
            <option value="not-public">未公开</option>
            <option value="all">全部</option>
          </select>
        </label>
        <label>
          <span>活动状态</span>
          <select value={activity} onChange={(event) => updateFilter(setActivity, event.target.value)}>
            <option value="all">全部</option>
            <option value="rest">静息态</option>
            <option value="task">任务态</option>
            <option value="sleep">睡眠</option>
            <option value="naturalistic">自然刺激</option>
            <option value="mixed">混合设计</option>
          </select>
        </label>
      </div>

      <div className="pair-table-head">
        <p><strong>{filtered.length}</strong> 个结果 · 同步公开总数只统计可下载或注册后可得的原始/可用配对信号</p>
        <div><span>每页 {pageSize} 行</span><button type="button" onClick={downloadCsv}>导出当前结果 CSV</button></div>
      </div>
      <div className="table-shell pair-table-shell">
        <table className="pair-table">
          <thead>
            <tr><th scope="col">数据集</th><th scope="col">设计</th><th scope="col">Subjects</th><th scope="col">配对时长</th><th scope="col">采集</th><th scope="col">访问</th></tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <a className="pair-name" href={row.sourceUrl} target="_blank" rel="noreferrer">{row.name} ↗</a>
                  <small>{row.repository}</small>
                  <div className="pair-badges">
                    <span>{sourceOriginLabels[row.sourceOrigin]}</span>
                    <span>{pairingLabels[row.pairing]}</span>
                  </div>
                </td>
                <td><strong>{activityLabels[row.activity]}</strong><small>{row.paradigms}</small></td>
                <td><strong>{row.subjects?.toLocaleString("en-US") ?? "N/A"}</strong><small>{row.subjectNote}</small></td>
                <td>
                  <strong>{row.pairedHours == null ? "Unknown" : `${row.pairedHours.toLocaleString("en-US", { maximumFractionDigits: 2 })} h`}</strong>
                  <small><span className={`duration-chip ${row.durationSource}`}>{durationLabels[row.durationSource]}</span> {row.durationNote}</small>
                </td>
                <td><strong>{row.eeg}</strong><small>{row.fmri}</small></td>
                <td><strong>{row.access}</strong><small>{row.notes}</small>{row.paperUrl && <a className="pair-paper" href={row.paperUrl} target="_blank" rel="noreferrer">论文 ↗</a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && <p className="pair-empty">没有符合当前筛选的数据集。</p>}
      {pages > 1 && (
        <div className="pair-pagination" aria-label="EEG-fMRI 表格分页">
          <button type="button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1}>上一页</button>
          <span>{safePage} / {pages}</span>
          <button type="button" onClick={() => setPage(Math.min(pages, safePage + 1))} disabled={safePage === pages}>下一页</button>
        </div>
      )}
    </div>
  );
}
