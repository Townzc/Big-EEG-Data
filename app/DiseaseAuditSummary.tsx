import reconciliation from '../data/eeg-catalog-reconciliation.json';

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
    <p className="source-note">EEG-0053 已按负责人确认的 μV 重新处理。MODMA 三通道整数溢出已修复；{p.unitReviewTargets} 个目标的 {p.unitReviewOutputs.toLocaleString('en-US')} 份产物仍有单位待核或推断。单位有依据、身份可追踪且排除 FEP 重复处理分支的联合清单覆盖 {p.unitConfirmedTargets} 个目标；其他 QC 和缺失标签仍保留。<a href="/disease-preprocessing-summary-20260913.csv" download>下载 62 项明细 CSV</a> · <a href="/disease-preprocessing-audit-20260913.md" download>下载完整报告</a></p>
  </section>;
}
