import data from '../public/catalog-data.json';
import { DownloadChecklist } from './DownloadChecklist';
import { eegProgress } from '../data/eeg-progress';
import { categoryDurationStats, eegDownloadChecklistRows, eegDurationSummary } from '../data/eeg-duration';
export default function LegacyEegProgress() {
 const neuro=data.neuroAtlasComparison; const focus=neuro.focusCoverage; const acquisition=data.metrics.acquisition; const catalogScale=eegProgress.catalog; const duration=eegDurationSummary; const durationCategories=categoryDurationStats(eegProgress.categories);
return <div className="db-history-body"><p className="db-history-warning">以下为旧版 563 / 564 条采集与预处理快照。数值、分类和下载范围未应用本轮新增与去重修订；最新目录与统计请使用上方检索区。完成标记不代表已经完成预处理。</p>
        <section className="download-section" id="downloads" aria-labelledby="downloads-title">
          <div className="section-heading">
            <div><p className="eyebrow">DOWNLOAD CHECKLIST</p><h2 id="downloads-title">临床、健康与睡眠重点下载清单</h2></div>
            <p>重点清单保留 147 个执行单元；HEEDB 按团队口径移至睡眠后，其中 95 个医疗与疾病、21 个健康与人群、31 个睡眠单元。完整目录另含 Neurotech，医疗与疾病大类为 96 个。</p>
          </div>
          <div className="download-metrics" aria-label="下载状态摘要">
            <div><span>服务器完成目录</span><strong>{acquisition.serverCompletedUnits}</strong><small>含重叠与非 raw 项</small></div>
            <div><span>独立 raw 已获取</span><strong>{acquisition.independentRawAcquiredUnits}</strong><small>疾病 {acquisition.diseaseRawAcquiredUnits} · Health {acquisition.healthRawAcquiredUnits}</small></div>
            <div><span>时长已审计</span><strong>{acquisition.exactDurationAuditUnits}</strong><small>{acquisition.exactDurationAuditHours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h</small></div>
            <div><span>仍可推进</span><strong>{acquisition.actionableDownloadUnits}</strong><small>另有 {acquisition.discardedUnits} 项舍弃</small></div>
          </div>
          <DownloadChecklist rows={eegDownloadChecklistRows} />
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
                疾病/临床值来自 {duration.disease.knownUnits}/{duration.disease.units} 个有逐行证据的单元，并剔除 {duration.disease.excludedTuegChildUnits} 个 TUEG 子集。HEEDB 按团队口径归入睡眠，不再进入疾病汇总；I-CARE 仍属于疾病范围。全目录来源级总量继续保留 HEEDB，并对 I-CARE 的已知重叠做保守扣除，因此全目录总时长不变。
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
            时长审计快照：{duration.verifiedAt}。OpenNeuro 值读取公开 BIDS snapshot；SingLEM 只采用 Table I 的 multi-channel recording duration。HEEDB 的约 330 万小时来自 <a href="https://bdsp.io/content/nf89816gtxbon11kbr9a/1.0/" target="_blank" rel="noreferrer">BDSP Neurotech 官方对照页</a>，是整个受控访问临床库的近似规模，不是本地已下载或当前可直接训练的时长；<a href="https://bdsp.io/content/harvard-eeg-db/4.1/" target="_blank" rel="noreferrer">HEEDB v4.1</a> 页面本身报告 284,343 studies / 109,178 patients，但未发布精确总小时。访问全部 HEEDB 仍需 credentialing、签署 DUA 并遵守受控数据许可。* 受试者是 dataset-subject entries，不声称跨数据集唯一。
          </p>
        </section>

        <section className="workbook-section" id="workbook" aria-labelledby="workbook-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DOWNLOAD WORKBOOK</p>
              <h2 id="workbook-title">{data.worksheetGuide.length} 个工作表，一份精简总表</h2>
            </div>
            <a className="button primary" href="/EEG_catalog_20260906.xlsx" download>下载 XLSX</a>
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

</div>;
}
