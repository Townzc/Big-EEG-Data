"""Apply the completed local-array audit without replacing source-release counts."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'data/eeg-catalog-reconciliation.json'
c = json.loads(path.read_text())
a = json.loads((ROOT / 'data/disease-preprocessing-audit-20260913.json').read_text())
h = a['disease_human']
report_url = 'https://github.com/Townzc/Big-EEG-Data/blob/main/DISEASE_AUDIT_20260913.zh-CN.md'
c.setdefault('historicalPreprocessing20260908', c['preprocessing'])
c['preprocessing'] = {
    'metricScope': 'current_disease_human_materialized_outputs',
    'auditDate': '2026-09-13',
    'auditedTargets': h['catalog_targets'],
    'outputs': h['outputs'],
    'subjectEntries': h['human_dataset_subject_entries'],
    'traceableIdentities': h['identity_namespace_entries'],
    'outputsWithoutReliableSubject': h['outputs_without_reliable_subject_id'],
    'signalHours': h['duration_hours'],
    'eventRows': h['events'],
    'derivativeBytes': h['output_bytes'],
    'unitReviewOutputs': h['qc_flag_counts']['unit_not_verified'],
    'unitReviewTargets': sum(any(k not in ('documented', 'verified_from_file') and v for k,v in d['unit_status_output_counts'].items()) for d in a['datasets'].values()),
    'unitConfirmedTargets': a['unit_confirmed_joint']['catalog_targets'],
    'unitConfirmedOutputs': a['unit_confirmed_joint']['outputs'],
    'unitConfirmedHours': a['unit_confirmed_joint']['duration_hours'],
    'unitConfirmedIdentities': a['unit_confirmed_joint']['identity_namespace_entries'],
    'reportUrl': report_url,
    'deduplicationNote': '人数包含患者和对照；25,007 为按已知同源关系合并的可追踪身份，不能保证跨所有匿名库唯一。时长为文件累计、不乘通道数；完全相同数组去重后为 43,853.766826 h，仍可能含部分时间重叠。犬类、VitalDB、其他分类及可选 TUEG 重叠分支不计入本疾病人类汇总。',
}
history = c.setdefault('historicalPreprocessingRowPatches20260910', {})
for key, d in a['datasets'].items():
    p = c['rowPatches'].setdefault(key, {})
    if key not in history:
        history[key] = {k:v for k,v in p.items() if k in ('preprocessingNotes','preprocessingStatus','acquisitionNote','acquisitionStatus','verification')}
    review = sum(v for k,v in d['unit_status_output_counts'].items() if k not in ('documented','verified_from_file'))
    note = (f"2026-09-13 全量产物复核：人类分支 {d['human_dataset_subject_entries']:,} 个已核实身份、"
            f"{d['outputs']:,} 份完整记录/trial/段、{d['duration_hours']:.6f} h；200 Hz float32 [channel,time] NPZ + JSON。"
            f"{review:,} 份单位仍待核/推断。该处理范围与原始发布/下载规模分别统计，其他 QC、参考和标签证据见本次报告。")
    if key == 'EEG-0053':
        note += ' 负责人已确认 μV，已从原 MAT 重跑 μV/100；61 ADHD / 60 Control，19 通道，128→200 Hz，0.1–62.72 Hz + 50 Hz notch，98/7/16 划分。Channel_Labels.docx 已恢复；CED 坐标和确切 A1/A2 组合未取得。'
    if key in ('EEG-0006','EEG-0018'):
        note += ' 犬类独立统计。负责人确认 μV/颅外或颅骨固定单极参考，原数组已除 100，本次只落实元数据，不重复增益或缩放；基线保留原参考，Bipolar/CAR 仅为建议。'
        p['acquisitionNote'] = p['acquisitionNote'].replace('this update does not mark preprocessing complete.', 'current derivatives and unit/reference metadata passed the 2026-09-13 audit.').replace('preprocessing remains pending.', 'current derivatives and unit/reference metadata passed the 2026-09-13 audit.')
    if key == 'EEG-0058':
        note += ' 128 通道 53 人 / 106 份：53 份 dot-probe 有单位证据，53 份 rest 仍为推断。3 通道 55 人另存 250 Hz native int64 [time,3]；已修复旧 int32 的 7 文件 / 1,703,972 值溢出，55 份逐值核验通过。项目负责人已邮件询问单位/参考/编码，等待作者回复；不猜测电压换算。两个分支身份重叠，整库 55 人不相加。'
        p['physicalUnitStatus'] = 'mixed_by_branch: 128ch dot-probe verified; rest inferred; 3ch native integer encoding/calibration pending_author_reply'
    if key == 'EEG-0081':
        note += ' 视觉工作记忆 221 份已按发布者 RawEEG 转换代码纠正为 raw 滤波分支；听觉 200 份保留。单位与部分幅值仍待核。'
    if key == 'EEG-0014':
        p['acquisitionNote'] = p['acquisitionNote'].replace('Production is gated on an explicit policy for 6,559,009 NaN and 7,916,310 ±9999 samples.', 'The existing adapter explicitly repairs the 6,559,009 NaN and 7,916,310 ±9999 source sentinels with provenance; 17,089 annotated outputs are fully validated. Orphan/train-test source files are not silently added to the supervised scope.')
        p['verification'] = '17,301 source files remain the acquisition inventory; 17,089 annotated derivatives / 380.28 h passed the current full audit. Labels remain at expert-window level.'
    if key == 'EEG-0047':
        p['acquisitionNote'] = 'The local success manifest contains 4 MAT files / 2,775,782,032 bytes with 9 internal segments. All 9 derivatives and their identity/label mapping passed the completed audit.'
    if key == 'EEG-0061':
        p['acquisitionNote'] = 'All three authorized archives were extracted: 10,306 files / 21,521,819,132 bytes. The completed derivative inventory has 3,268 outputs / 1,464 traceable subjects / 120.516389 h. Only 120 MDD records are labeled; 3,148 remain unlabeled. High-amplitude QC flags remain.'
    if key == 'EEG-0106':
        p['acquisitionNote'] = 'Official NEMAR v1.0.0 download: 9,676 files / 14,819,739,145 bytes. All 2,417 EEG outputs passed numeric/hash checks. Current diagnostic labels remain -1, and unusually small physical amplitudes are flagged without guessing a scale factor.'
    p['preprocessingStatus'] = 'OUTPUTS_FULLY_VALIDATED_UNIT_REVIEW_REMAINS' if review else 'COMPLETE_200HZ_UV100_FULLY_VALIDATED'
    p['preprocessingNotes'] = note
    p['outputRecords'] = d['outputs']
    p['eventRows'] = d['events']
    if p.get('acquisitionStatus') and key not in ('EEG-0053','EEG-0058','EEG-0060'):
        p['acquisitionStatus'] = 'DOWNLOADED_SIGNAL_SCOPE_AND_PREPROCESSING_AUDITED'
    sources = p.setdefault('additionalSources', [])
    if not any(s['url'] == report_url for s in sources):
        sources.append({'label':'2026-09-13 全量预处理复核及范围说明','url':report_url})
    if key in c['focusRowPatches']:
        c['focusRowPatches'][key]['nextAction'] = note

v = next(x for x in c['supplementalRows'] if x['id']=='EEG-0609')
v['preprocessingStatus'] = 'COMPLETE_WITH_ONE_NATIVE_CLOCK_QUARANTINE'
v['validatedBatch'] = 'batch112'
v['preprocessingNotes'] = 'PhysioNet 1.0.0 静态文件全部 6,388 病例已核验：5,566 例 / 5,345 患者有原始 EEG；5,565 例 / 5,344 患者生成 16,785 个连续段、18,097.513249 h，96,852,696,463 bytes，全部校验通过。128→200 Hz、0.1–62.72 Hz、60 Hz notch、μV/100；BIS/BIS 是派生指标，不替代 EEG。原始 Nyquist 64 Hz，保留 BIS 原生参考。病例 4552 包时钟歧义另存原始包、未进入标准分支。API 的 5,871 例 / 5,623 患者为另一快照；不可与本地静态包混用。'
v['acquisitionStatus'] = 'DOWNLOAD_COMPLETE_SHA256_VERIFIED_PREPROCESSING_AUDITED'
v['acquisitionNote'] = '6,388 个 .vital 与元数据共 6,395 文件 / 102,456,727,132 bytes；全部发布者 SHA-256 通过。标准处理与时钟隔离均已完成，详见当前预处理说明。'
v['additionalSources'].append({'label':'VitalDB 完整预处理与时钟审计','url':'https://github.com/Townzc/Big-EEG-Data/blob/main/PREPROCESSING_UPDATE_20260910.zh-CN.md'}) if not any('PREPROCESSING_UPDATE_20260910' in x['url'] for x in v.get('additionalSources',[])) else None
for x in c['supplementalChecklistRows']:
    if x['id']=='EEG-0609':x['nextAction']=v['preprocessingNotes']
for task in c['activeAcquisitionTasks']:
    ids = task['ids'].split(' / ')
    if ids == ['EEG-0609']: task['status']=v['preprocessingNotes']
    elif all(key in a['datasets'] for key in ids): task['status']=' '.join(c['rowPatches'][key]['preprocessingNotes'] for key in ids)
c['reconciledAt']='2026-09-13'
path.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
