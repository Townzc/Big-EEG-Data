"use client";

import { useMemo, useState } from "react";

type ChecklistRow = {
  id: string;
  priority: string;
  decision: string;
  focusType: string;
  focusSubtype: string;
  name: string;
  serverStatus: string;
  independentAcquired: boolean;
  exactDurationAudited: boolean;
  auditedHours: number | null;
  documentedHours: number | null;
  physicalSizeGB: number | null;
  accessLabel: string;
  url: string;
  applicationPage: string;
  downloadMethod: string;
  suggestedPath: string;
  nextAction: string;
};

const ALL = "全部";
const groupLabels: Record<string, string> = {
  待处理: "待处理",
  可下载: "可直接推进",
  待访问: "等待/需要访问",
  需申请: "正式申请",
  已完成: "服务器已完成",
  舍弃: "舍弃",
  全部: "全部",
};

function inGroup(row: ChecklistRow, group: string) {
  if (group === "待处理") return ["P0", "P1", "P2", "P3"].includes(row.priority);
  if (group === "可下载") return row.priority === "P1";
  if (group === "待访问") return ["P2", "P3"].includes(row.priority);
  if (group === "需申请") return ["已申请·等待访问", "需要申请/登录"].includes(row.decision);
  if (group === "已完成") return row.decision.startsWith("已下载");
  if (group === "舍弃") return row.decision === "舍弃";
  return true;
}

export function DownloadChecklist({ rows }: { rows: ChecklistRow[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("待处理");
  const [focus, setFocus] = useState(ALL);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const counts = useMemo(() => Object.fromEntries(Object.keys(groupLabels).map((key) => [key, rows.filter((row) => inGroup(row, key)).length])), [rows]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return rows
      .filter((row) => inGroup(row, group))
      .filter((row) => focus === ALL || row.focusType === focus)
      .filter((row) => !needle || [row.id, row.name, row.focusSubtype, row.decision, row.nextAction, row.applicationPage]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(needle)));
  }, [rows, query, group, focus]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const update = (callback: () => void) => { callback(); setPage(1); };

  return (
    <div className="download-planner">
      <div className="download-tabs" role="group" aria-label="按下载决策筛选">
        {Object.entries(groupLabels).map(([key, label]) => (
          <button type="button" key={key} className={group === key ? "active" : ""} onClick={() => update(() => setGroup(key))} aria-pressed={group === key}>
            <span>{label}</span><strong>{counts[key]}</strong>
          </button>
        ))}
      </div>

      <form className="download-filters" onSubmit={(event) => event.preventDefault()} aria-label="筛选疾病和健康下载清单">
        <label><span>搜索</span><input value={query} onChange={(event) => update(() => setQuery(event.target.value))} placeholder="数据集、ID、状态或下一步" /></label>
        <label><span>队列属性</span><select value={focus} onChange={(event) => update(() => setFocus(event.target.value))}><option value={ALL}>全部</option><option value="疾病/临床">疾病/临床</option><option value="健康/人群">健康/人群</option></select></label>
        <a className="button secondary checklist-export" href="/download-checklist.csv" download>下载 CSV 清单</a>
      </form>

      <div className="result-line" aria-live="polite"><p><strong>{filtered.length}</strong> 行 · 当前显示 {groupLabels[group]}</p><p>默认顺序：P0 审计 → P1 可下载 → P2 等待/复核 → P3 新申请</p></div>
      <div className="table-shell checklist-shell" role="region" aria-label="疾病和健康数据下载执行清单，可横向滚动">
        <table className="checklist-table">
          <caption className="sr-only">疾病和健康 EEG 数据下载执行清单</caption>
          <thead><tr><th scope="col">优先级</th><th scope="col">数据集</th><th scope="col">当前决策</th><th scope="col">队列</th><th scope="col">已知规模</th><th scope="col">获取方式</th><th scope="col">下一步</th></tr></thead>
          <tbody>
            {visible.map((row) => {
              const hours = row.auditedHours ?? row.documentedHours;
              return (
                <tr key={row.id}>
                  <td><span className={`priority-badge priority-${row.priority.toLocaleLowerCase()}`}>{row.priority}</span></td>
                  <td><strong>{row.name}</strong><small className="mono">{row.id}</small></td>
                  <td><span className="decision-label">{row.decision}</span><small>{row.serverStatus}</small></td>
                  <td>{row.focusType}<small>{row.focusSubtype}</small></td>
                  <td>
                    {hours == null ? "时长待核验" : `${hours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h`}
                    {hours == null ? null : <small>{row.exactDurationAudited ? "文件审计" : "论文/官网范围"}</small>}
                    {row.physicalSizeGB == null ? null : <small>{row.physicalSizeGB.toLocaleString("en-US", { maximumFractionDigits: 2 })} GB 已在服务器</small>}
                  </td>
                  <td>
                    {row.url ? <a href={row.url} target="_blank" rel="noreferrer">数据页 ↗</a> : row.accessLabel}
                    {row.applicationPage ? <small><a href={row.applicationPage} target="_blank" rel="noreferrer">申请/登录页面 ↗</a></small> : null}
                    <small>{row.downloadMethod}</small>
                  </td>
                  <td>{row.nextAction}{row.suggestedPath ? <small className="mono">{row.suggestedPath}</small> : null}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pagination" aria-label="下载清单分页">
        <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← 上一页</button>
        <span>第 {safePage} / {pages} 页 · 显示 {filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} 行</span>
        <button type="button" disabled={safePage === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>下一页 →</button>
      </div>
    </div>
  );
}
