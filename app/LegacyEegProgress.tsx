import { DownloadChecklist } from './DownloadChecklist';
import { eegProgress } from '../data/eeg-progress';
import { eegDownloadChecklistRows } from '../data/eeg-duration';

const number = (value: number | null, digits = 1) => value == null
  ? '未知'
  : value.toLocaleString('en-US', { maximumFractionDigits: digits });

export default function LegacyEegProgress() {
  const catalog = eegProgress.catalog;
  const acquisition = eegProgress.acquisition;
  const preprocessing = eegProgress.preprocessing;
  const focusCounts = Object.fromEntries(['疾病/临床', '健康/人群', '睡眠'].map((type) => [
    type,
    eegDownloadChecklistRows.filter((row) => row.focusType === type).length,
  ]));

  return <div className="db-history-body">
    <p className="db-history-warning">本区已按 {eegProgress.snapshotDate} 的 reconciliation overlay 更新。历史 563 行 JSON 仍作为不可变证据保存；当前检索目录排除 1 个非 EEG 条目、合并 1 个 alias，并纳入后续发布与修订。下载完成、信号审计和预处理完成是三个不同状态。</p>

    <section className="download-section" id="downloads" aria-labelledby="downloads-title">
      <div className="section-heading">
        <div><p className="eyebrow">DOWNLOAD CHECKLIST</p><h2 id="downloads-title">临床、健康与睡眠重点下载清单</h2></div>
        <p>当前清单 {acquisition.focusExecutionUnits} 个执行单元：疾病/临床 {focusCounts['疾病/临床']}、健康/人群 {focusCounts['健康/人群']}、睡眠 {focusCounts['睡眠']}。bigP3BCI 已归入运动/交互，眼动-only EEG-0050 已从 EEG 清单排除。</p>
      </div>
      <div className="download-metrics" aria-label="下载状态摘要">
        <div><span>服务器完成证据</span><strong>{acquisition.focusServerCompletedUnits}</strong><small>完成下载不等于完成信号审计</small></div>
        <div><span>独立 raw 已获取</span><strong>{acquisition.focusIndependentRawUnits}</strong><small>{acquisition.focusExecutionUnits} 个重点执行单元</small></div>
        <div><span>精确时长审计工作量</span><strong>{acquisition.focusExactDurationAuditUnits}</strong><small>{number(acquisition.focusExactDurationAuditHours)} h；关系去重 {acquisition.focusRelationAwareExactDurationAuditUnits} 项 / {number(acquisition.focusRelationAwareExactDurationAuditHours)} h</small></div>
        <div><span>申请中 / 尚未申请</span><strong>{acquisition.focusAppliedWaitingUnits} / {acquisition.focusNotYetAppliedUnits}</strong><small>19 是逻辑行，约 {acquisition.focusAppliedWaitingWorkflowsApprox} 个申请流程；另有 {acquisition.focusDirectDownloadUnits} 个可直接下载</small></div>
      </div>
      <DownloadChecklist rows={eegDownloadChecklistRows} />
      <div className="progress-table-card">
        <h3>当前采集与审计任务</h3>
        <div className="table-shell">
          <table className="progress-table">
            <thead><tr><th scope="col">数据集</th><th scope="col">项目</th><th scope="col">当前状态</th></tr></thead>
            <tbody>{acquisition.activeTasks.map((task) => <tr key={task.ids}>
              <td><strong>{task.ids}</strong><small>{task.sourcePackageId}</small></td>
              <td>{task.name}</td><td>{task.status}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
      <p className="source-note">状态快照：{eegProgress.snapshotDate}。GPFS 当前可用空间约 {number(acquisition.gpfsFreeTiB, 2)} TiB（{number(acquisition.gpfsFreeBytes, 0)} bytes）；安全层另保留约 {number(acquisition.retainedFailedStagingApproxGB)} GB 已精确定位但尚未删除的失败 staging。未完成的信号时长审计或 provenance 门禁均明确保留，不用文件夹存在代替验证结论。</p>
    </section>

    <section className="reve-section" id="neuroatlas" aria-labelledby="neuroatlas-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">CURRENT EEG SCALE</p>
          <h2 id="neuroatlas-title">关系去重后已知覆盖约 {(Number(catalog.hoursAfterRelationDedup) / 10000).toFixed(2)} 万小时</h2>
        </div>
        <p>当前目录与原始逐行汇总并列；未知时长不作为 0，subject 是 dataset-subject entries，不声称跨库唯一。</p>
      </div>
      <div className="reve-grid">
        <div className="reve-summary">
          <div className="primary-metric"><span>当前可检索 EEG</span><strong>{catalog.units}</strong></div>
          <div><span>数据集 family / acquisition package</span><strong>{catalog.families} / {catalog.acquisitionPackages}</strong></div>
          <div><span>关系去重受试者条目</span><strong>{number(catalog.subjectsAfterRelationDedup, 0)}</strong></div>
          <div><span>关系去重已知时长</span><strong>{number(catalog.hoursAfterRelationDedup)} h</strong></div>
          <p>当前数由 revision-aware catalog 实时复算。已确认的 parent/child subset 在对应指标存在父项时抑制；overlap / same-cohort 关系仅标注，不在证据不足时武断扣除。</p>
        </div>
        <div className="reve-composition" role="region" aria-label="当前 EEG 目录规模口径">
          <table>
            <thead><tr><th scope="col">口径</th><th scope="col">单元</th><th scope="col">受试者条目</th><th scope="col">小时</th></tr></thead>
            <tbody>
              <tr><td><strong>原始逐行相加</strong></td><td>{catalog.units}</td><td>{number(catalog.rawSubjectEntrySum, 0)}<small>{catalog.rawSubjectKnownUnits}/{catalog.units} 有值</small></td><td>{number(catalog.rawDurationRowSum)}<small>{catalog.rawDurationKnownUnits}/{catalog.units} 有值</small></td></tr>
              <tr><td><strong>parent/child 关系去重</strong></td><td>{catalog.includedAfterRelationDedup}</td><td>{number(catalog.subjectsAfterRelationDedup, 0)}<small>{catalog.subjectKnownAfterRelationDedup}/{catalog.subjectIncludedAfterRelationDedup} 有值</small></td><td>{number(catalog.hoursAfterRelationDedup)}<small>{catalog.durationKnownAfterRelationDedup}/{catalog.includedAfterRelationDedup} 有值</small></td></tr>
              <tr><td><strong>仍未知</strong></td><td>—</td><td>{catalog.subjectMissingAfterRelationDedup} 个 relation-aware 单元</td><td>{catalog.durationMissingAfterRelationDedup} 个 relation-aware 单元</td></tr>
              <tr><td><strong>公开下载</strong></td><td>{catalog.publicUnits}</td><td colSpan={2}>访问公开不代表格式、单位、参考或标签已通过生产门禁</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="source-note">历史证据层：563 行；当前保留其中 {catalog.retainedHistoricalEegRows} 行，排除 {catalog.excludedNonEegUnits} 个非 EEG 条目，并通过 {catalog.mergedAliasUnits} 个 canonical alias、{catalog.evidenceSupplementalUnits} 个 evidence-layer supplemental release 和 {catalog.revisionAddedUnits} 个 revision entry 形成 {catalog.units} 行当前目录。MORGOTH 的 16 个逻辑行保留检索，但只计 1 个已确认 acquisition package。</p>
    </section>

    <section className="workbook-section" id="workbook" aria-labelledby="workbook-title">
      <div className="section-heading">
        <div><p className="eyebrow">CURRENT WORKBOOK</p><h2 id="workbook-title">与网页同版本的 EEG / fMRI 工作簿</h2></div>
        <a className="button primary" href="/brain-data-catalog-current.xlsx" download>下载当前 XLSX</a>
      </div>
      <ol className="sheet-index">
        {[
          ['说明与修订', '版本、统计边界、重复关系与未知值说明。'],
          ['EEG目录', '当前可检索 EEG 行；字段与网页、JSON、CSV 同源。'],
          ['fMRI目录', '当前可检索 fMRI 行；保留来源级证据与关系。'],
        ].map(([name, description], index) => <li key={name}>
          <span>{String(index + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{description}</p></div>
        </li>)}
      </ol>
    </section>

    <section className="progress-section" id="progress" aria-labelledby="progress-title">
      <div className="section-heading">
        <div><p className="eyebrow">DATA PREPROCESSING · 2026-09-13</p><h2 id="progress-title">疾病类预处理全量复核</h2></div>
        <p>统计当前疾病类的人类完整记录、trial 和连续段；犬类、麻醉与其他分类另列。文件通过校验后仍保留单位、参考、标签和幅值问题。</p>
      </div>
      <div className="progress-lenses">
        <article><span>01 · 当前目录</span><strong>{catalog.units}</strong><h3>可检索 EEG 行</h3><p>{catalog.families} 个 family；{catalog.acquisitionPackages} 个 acquisition package。目录行数不是预处理分母。</p></article>
        <article><span>02 · 疾病类已处理</span><strong>{preprocessing.auditedTargets}</strong><h3>已全量复核的目标</h3><p>其中 {preprocessing.unitConfirmedTargets} 个目标进入单位有依据且身份可追踪的联合清单；{preprocessing.unitReviewTargets} 个目标含单位待核分支。</p></article>
        <article><span>03 · 已验证产物</span><strong>{number(preprocessing.outputs, 0)}</strong><h3>完整记录 / trial / 段</h3><p>{number(preprocessing.signalHours)} h · {number(preprocessing.traceableIdentities, 0)} 个按已知关系合并的身份，含健康对照。</p></article>
      </div>
      <div className="progress-table-card">
        <h3>八大类别原始行规模</h3>
        <div className="table-shell"><table className="progress-table">
          <thead><tr><th scope="col">类别</th><th scope="col">数据单元</th><th scope="col">Subject entries</th><th scope="col">已知时长</th></tr></thead>
          <tbody>{eegProgress.categories.map((category) => <tr key={category.code}>
            <td><strong>{category.code}</strong> · {category.label}</td><td>{category.units}</td>
            <td>{number(category.subjectEntries, 0)}<small>{category.subjectKnownUnits}/{category.units} 有值</small></td>
            <td>{number(category.hours)} h<small>{category.durationKnownUnits}/{category.units} 有值</small></td>
          </tr>)}</tbody>
        </table></div>
      </div>
      <div className="method-strip" aria-label="疾病与临床数据预处理方法摘要">
        {eegProgress.methodology.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></article>)}
      </div>
      <p className="source-note">复核：{preprocessing.auditDate}。各库已核实人数相加 {number(preprocessing.subjectEntries, 0)}，按已知身份合并后 {number(preprocessing.traceableIdentities, 0)}；另有 {preprocessing.outputsWithoutReliableSubject} 份缺可靠人物映射。{number(preprocessing.eventRows, 0)} 行事件，{number(preprocessing.derivativeBytes, 0)} bytes（{number(preprocessing.derivativeTiB, 2)} TiB）。{preprocessing.deduplicationNote} <a href={preprocessing.reportUrl}>完整复核报告</a> · <a href="/disease-preprocessing-summary-20260913.csv" download>62 项明细 CSV</a></p>
    </section>
  </div>;
}
