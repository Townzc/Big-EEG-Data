import reconciliation from '../data/eeg-catalog-reconciliation.json';
import batch from '../data/pending-six-preprocessing-20260913.json';

export function DiseaseAuditSummary() {
  const p = reconciliation.preprocessing;
  return <section className="progress-section" aria-labelledby="disease-audit-title">
    <div className="section-heading">
      <div><p className="eyebrow">2026-09-13 · 已处理数据</p><h2 id="disease-audit-title">疾病类全量复核结果</h2></div>
      <a className="button primary" href={p.reportUrl}>阅读完整中文报告</a>
    </div>
    <div className="progress-lenses">
      <article><span>疾病类人类数据</span><strong>{p.auditedTargets}</strong><h3>已复核目标</h3><p>{p.outputs.toLocaleString('en-US')} 份完整记录、trial 或连续段。</p></article>
      <article><span>累计信号时长</span><strong>{p.signalHours.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong><h3>小时</h3><p>不乘通道数；犬类、VitalDB 和其他分类单独统计。</p></article>
      <article><span>合并已知共享身份</span><strong>{p.traceableIdentities.toLocaleString('en-US')}</strong><h3>可追踪身份，含对照</h3><p>{p.outputsWithoutReliableSubject} 份缺可靠人物映射；匿名来源仍可能有人物重叠。</p></article>
    </div>
    <p className="source-note">当前 {batch.catalogEntries} 个疾病条目：{batch.standardProcessedEntries} 个有统一格式产物，{batch.downloadedCalibrationBlockedEntries} 个已下载尚未执行统一格式处理，{batch.notDownloadedEntries} 个未下载。本轮六项共 {batch.standardOutputsAdded.toLocaleString('en-US')} 份标准产物，已包含 UCDDB。<a href="/disease97-acquisition-status-20260913.csv" download>下载获取与处理状态</a></p>
    <p className="source-note">UCDDB 已按负责人确认的 μV 完成 25 份 / 173.36 h 处理，保留 EDF 声明增益后输出 μV/100。25 份源记录均有实际 ADC 超头部声明量程的矛盾，增益缺独立校准证据；分期对齐和其他 QC 继续保留。</p>
    <p className="source-note">{p.unitReviewTargets} 个目标的 {p.unitReviewOutputs.toLocaleString('en-US')} 份产物仍有单位待核或推断。单位有依据、身份可追踪且排除 FEP 重复处理分支的联合清单覆盖 {p.unitConfirmedTargets} 个目标；其他 QC 和缺失标签仍保留。EEG-0053 的 μV 确认及 MODMA 整数溢出修复沿用已验证结果。<a href="/disease-preprocessing-summary-20260913.csv" download>下载 {p.auditedTargets} 项明细 CSV</a> · <a href="/disease-preprocessing-audit-20260913.md" download>下载完整报告</a></p>
  </section>;
}
