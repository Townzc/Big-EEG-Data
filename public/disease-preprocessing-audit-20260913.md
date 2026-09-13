# 六个已下载疾病类数据的当前处理结果（2026-09-13 / batch117 + batch118）

**六项均已生成统一格式产物。** UCDDB 已依据项目负责人本次 μV 确认重跑，25 份标准产物通过独立 EDF 增益和全量缩放校验。Albrecht 与 ADSZ AD 的单位推断，以及各库既有身份、参考、标签和 QC 限制继续保留。

当前网站 **97 个疾病条目 = 68 个有统一格式产物 + 29 个未下载**；已下载尚未执行统一格式处理的条目为 **0**。未下载来源按用户要求等待后续访问权限。

这六项合计 **688 份标准产物 / 1,408.780769 h**。人数含对照，按可追踪身份计；匿名库仍可能有共享人物。UCDDB 旧计数版本留作历史比对，不额外增加人数或时长。

| ID / 数据集 | 可追踪身份条目 | 产物数 | 时长 h | EEG 通道 | 原始 Hz |
|---|---:|---:|---:|---|---|
| EEG-0125 HMC | 151 | 151 | 1144.218889 | 4 | 256.0 |
| EEG-0493 ADSZ | 84；另 48 个片段人物映射待核 | 132 | 1.513333 | 16 / 19 | 128.0 |
| EEG-0583 Albrecht2019 | 77 | 186 | 34.671569 | 60 | 1000.0 |
| EEG-0585 Singh2020 | 39 | 44 | 3.320767 | 63 | 500.0 |
| EEG-0586 Singh2021 | 111；另 18 会话配对待核 | 150 | 51.695656 | 63 | 500.0 |
| EEG-0606 UCDDB | 25 | 25 | 173.360556 | 2 | 128 |

**EEG-0125 HMC**：保留 F4-M1、C4-M1、O2-M1、C3-M2 四路 EEG；去除 EMG/EOG/ECG。EDF 微伏增益逐文件独立复核，原生参考保留。保留 0.2 Hz 采集高通，补低通与 50 Hz notch，256→200 Hz；原 LP 35/128 Hz 的差异逐文件标记。W/N1/N2/N3/R 及开关灯事件按原秒数保留；没有逐人疾病诊断。151 个匿名 PSG 记录身份不宣称与其他来源全局唯一。

**EEG-0493 ADSZ**：48 个 AD/老年对照片段，实际 41 段 8 s、3 段 10 s、3 段 12 s、1 段 14 s，19 通道、128→200 Hz；保留所有原始点，不统一截成论文概述的 8 s。按父来源已带限 1–30 Hz 的数据仅重采样，不再次滤波。微伏数值尺度、列顺序为明确推断；AD 文件与独立人物的映射未公开，全部 split=unassigned，不能把 48 个文件直接报成 48 个已核实人物。 84 个 MSU 少年样本（45 有精神分裂症症状、39 健康），16 通道、每段 60 s。原发布者明确 mkV、128 Hz 和每通道连续 7680 点的排列；保留文件身份与疾病分组，0.1–62.72 Hz + 50 Hz notch、200 Hz、μV/100。

**EEG-0583 Albrecht2019**：实际 77 个 EEG MAT：46 个患者组 P、31 个对照组 N；其中 1 个 P 文件缺人口学表行，保留文件组别并标记证据限制，不补猜人口学或个人诊断细节。文件为连续 1000 Hz、单 trial、空 ICA、无 CSD 的导出，与镜像 README 的概括不一致；按文件处理，移除作者指定的四路眼电后保留 60 路。按 EEGLAB 合并边界拆段并保留全部源样点；0.1–75 Hz + 60 Hz notch，降至 200 Hz。MAT 无单位/增益字段，微伏仅为显式推断，排除确认单位训练池。原 ref=common 保留；1 个连续段触发幅值异常 QC，保留原值和标记，未作裁剪。

**EEG-0585 Singh2020**：39 名受试者：13 健康对照、13 PD 无冻结步态、13 PD 有冻结步态。读取原始 VHDR/EEG/VMRK，应用头文件 µV 分辨率一次，保留 63 路 EEG、去除 X/Y/Z 加速度；原 Pz 参考不合成额外通道。500→200 Hz、0.1–75 Hz + 60 Hz notch。分组、MOCA/FoG/UPDRS、S1 提示及 S2 GO 按作者工作簿/代码保留；原生分段边界不跨越。

**EEG-0586 Singh2021**：129 组原始会话；111 个身份可由工作簿核对（74 PD、37 对照），另 18 组 ON/OFF 会话（对应 24 个连续段）缺正式人物配对，不能报为 18 个独立新增人，也不使用镜像的推测配对/药物状态。保留 63 路 EEG，去除 Resp 或 X/Y/Z 辅助通道；保留 Iz/I1/I2 等实际导联名和 Pz 参考，不插值。500→200 Hz、0.1–75 Hz + 60 Hz notch。原始触发码保留，推測的语义不冒充已确认标签。

**EEG-0606 UCDDB**：项目负责人于 2026-09-13 确认 EEG 物理单位为 μV。25 人、25 份 PSG，保留 C3-A2/C4-A1 两路 EEG；EDF 原 NV 标记保留在来源记录中，仅在读取时按确认单位解释。沿用文件头 physical 0..1、digital -2048..2047，先计算 x_uV=(ADC+2048)/4095，再经既定滤波/重采样后除 100；没有把 ADC 整数直接当微伏。128→200 Hz、float32 [channel,time] NPZ + JSON/CSV，保留原 0.3–35 Hz 采集带宽和参考，补低通与 50 Hz notch。物理头范围 0..1 μV 单列 QC，未按幅值外观猜测放大倍数。AHI、人口学及 3,428 条呼吸事件保留；睡眠分期起点仍待核，2 份文件共 15 个未定义代码 8 原样保留。旧原始计数产物留作历史比对，不重复计入训练或统计。 25 份实际 ADC 最大绝对值为 11,600–13,632，均超出头部声明的 -2048..2047，继续标记 source_exceeds_declared_edf_digital_range。读取与逐点核验仅证明按声明增益实现一致，不独立证明头部模拟增益正确；另有 2 份低变化/flatline QC，均未静默删除。

**当前全部疾病标准产物**

| 指标 | 数值 |
|---|---:|
| 疾病目录条目 | 68 |
| 完整记录 / trial / 连续段 | 189,944 |
| 各库可追踪身份合计，含对照 | 28,938 |
| 按有证据共享关系合并后 | 25,494 |
| 缺可靠人物映射的产物 | 731 |
| 累计信号时长，不乘通道数 | 45,487.667001 h |
| NPZ + JSON 字节 | 1,740,379,377,252 |
| 事件行数 | 3,023,264 |
| 单位推断或待核的产物 | 32,376 |
| 单位有依据且身份可追踪的联合视图 | 48 项 / 156,159 份 / 44,742.894685 h |

**格式、范围与验证**

标准 NPZ 只有 `data`（float32，`[channel,time]`）、`channel_names`（Unicode）、`sfreq`（200 Hz）。单位有依据时 `data=x_uV/100`；单位推断分支显式标记并排除确认单位清单。每份同名 JSON 保存来源与信号哈希、单位依据、参考、导联顺序、人物/会话、事件、分段、QC 与处理步骤。连续段未预切小文件，加载时按 1 秒 / 200 点 patch；不跨原始段边界。未做 z-score、统计归一化、ICA、CAR、插值或幅值裁剪。

原始分支沿用 0.1–75 Hz 与已知 50/60 Hz notch，128 Hz 来源上限受 Nyquist 约束为 62.72 Hz；HMC/UCDDB 保留采集带宽，ADSZ AD 仅重采样。当前读取以 `results/disease_audit_20260913_batch118/` 的联合 CSV split 为准，分支 JSON 保留历史 split。96 个 Iowa 候选人物组继续保守共享 split，人物计数不据此作未经证实的合并。确认身份、重复数组及候选组跨 split 均为 0，原 67 项有效 split 全部保留。

前次已对六项来源中的 1,141 个文件 / 71,824,900,072 bytes 完成核验。本次重新核验 UCDDB 源 REC，并逐份比较独立 EDF 读取及全部样点缩放。当前验证集合共 256,159 份标准数组：复用此前 256,134 份的不可变审计 part 哈希，加上本次 25 份全量重读结果；没有宣称本次再次扫描全部旧 2 TB 波形。此前单列的 UCDDB 计数副本不计入该标准集合。所有新增事件有效区间检查通过；既有边界/删除期注释语义审查沿用原结果。

UCDDB 的 μV 来源是负责人确认，增益和偏移按源 EDF 头部；25 份均保留 0..1 μV 头部范围及实际 ADC 超声明量程 QC，头部模拟增益缺独立校准证据。另有 2 份低变化标记，睡眠分期起点和未定义代码继续待核。Albrecht 1 段幅值异常及人口学缺行、ADSZ AD 人物/导联映射、Singh2021 的 18 会话配对、MODMA 校准及其他既有 QC 限制继续保留。

[UCDDB 换算公式与核验详情](https://github.com/Townzc/Big-EEG-Data/blob/main/PREPROCESSING_UCDDB_UV_20260913.zh-CN.md) · [前次六项处理报告](https://github.com/Townzc/Big-EEG-Data/blob/main/DISEASE_AUDIT_BEFORE_UCDDB_UV_20260913.zh-CN.md) · [更早的全量问题与修复记录](https://github.com/Townzc/Big-EEG-Data/blob/main/DISEASE_AUDIT_BEFORE_BATCH117_20260913.zh-CN.md)

```python
import csv
from disease_manifest_loader114 import load_record
with open('results/disease_audit_20260913_batch118/disease_unit_confirmed_joint_manifest.csv') as f:
    row = next(csv.DictReader(f))
data, metadata = load_record(row)  # 使用联合 split，不重复 /100
```

原五项标准分支在 `results/disease_v1/batch117/`；UCDDB 当前分支在 `results/disease_v1/batch118/ucddb/`，历史计数副本在 `results/quarantine_v1/batch117/ucddb/`。当前报告/清单由 `results/current_disease_audit.json` 指向。

**所有标准格式疾病条目明细**

| ID / 数据集 | 身份条目 | 产物数 | 时长 h | EEG 通道 | 单位待核产物 |
|---|---:|---:|---:|---|---:|
| EEG-0005 A dataset of neonatal EEG recordings with seizure annotations | 79 | 79 | 111.895833 | 19 | 0 |
| EEG-0006 American Epilepsy Society Seizure Prediction Challenge | 2 | 473 | 78.833333 | 15 / 24 | 0 |
| EEG-0008 Bonn EEG Seizure Dataset | 0 | 500 | 3.277778 | 1 | 0 |
| EEG-0009 CHB-MIT | 23 | 686 | 982.935278 | 18 / 22 / 23 / 24 / 26 / 32 | 0 |
| EEG-0010 Criteria for defining interictal epileptiform discharges in EEG: a clinical validation study | 100 | 100 | 0.350833 | 19 / 25 | 0 |
| EEG-0013 HFO (High-Frequency Oscillations) | 30 | 30 | 89.006944 | 23 / 24 | 0 |
| EEG-0014 HMS Harmful Brain Activity Classification | 1950 | 17,089 | 380.280000 | 19 | 0 |
| EEG-0015 HUP iEEG Epilepsy Dataset | 58 | 348 | 49.769444 | 36–195 | 0 |
| EEG-0016 vEpiSet (Interictal Epileptiform Discharge EEG Dataset) | 84 | 25,449 | 28.241667 | 23 | 25,449 |
| EEG-0017 Intracranial entrainment reveals statistical learning across levels of abstraction | 8 | 30 | 1.226347 | 116–223 | 0 |
| EEG-0018 Kaggle UPenn and Mayo Clinic Seizure Detection | 8 | 34,993 | 9.723367 | 16–72 | 0 |
| EEG-0030 OpenNeuro ds003029 Epilepsy iEEG Multicenter | 31 | 102 | 7.956888 | 30–184 | 0 |
| EEG-0031 SeizeIT2 | 125 | 2,850 | 11626.248889 | 2 | 0 |
| EEG-0032 Siena Scalp EEG | 14 | 41 | 141.020556 | 19 / 29 | 0 |
| EEG-0033 TUEP (TUH Epilepsy) | 200 | 2,808 | 626.766389 | 17 | 0 |
| EEG-0034 TUEV (TUH Events) | 290 | 518 | 148.744722 | 21 | 0 |
| EEG-0035 TUSL (TUH Slowing) | 38 | 112 | 27.596389 | 21 | 0 |
| EEG-0036 TUSZ (TUH Seizure) | 675 | 8,140 | 1474.787222 | 17 | 0 |
| EEG-0039 AD-Auditory | 35 | 35 | 5.202778 | 19 | 35 |
| EEG-0040 AD65 (Alzheimer/FTD) | 88 | 88 | 19.608417 | 19 | 0 |
| EEG-0041 Alzheimer Risk Classification Sample-enrichment EEG | 44 | 44 | 3.911556 | 58 | 0 |
| EEG-0042 APAVA | 23 | 663 | 0.920833 | 16 | 663 |
| EEG-0043 CAUEEG | 1379 | 1,379 | 307.770556 | 19 | 0 |
| EEG-0044 Dementia Photo-stimulation Open-eyes EEG | 88 | 88 | 7.716667 | 19 | 0 |
| EEG-0045 EEG p-adic quantum potential accurately identifies depression, schizophrenia and cognitive decline | 236 | 249 | 84.299794 | 19 | 249 |
| EEG-0047 Resting-state high-density EEG using EGI GES 300 for healthy elders, SCD, MCI and Alzheimer's disease | 4 | 9 | 1.500000 | 256 | 0 |
| EEG-0048 Adult ADHD EEG | 80 | 880 | 7.111111 | 2 | 880 |
| EEG-0052 Depression resting (BDI) | 122 | 243 | 23.359661 | 64 | 243 |
| EEG-0053 EEG Data for ADHD | 121 | 121 | 4.701360 | 19 | 0 |
| EEG-0054 EEG in schizophrenia | 28 | 28 | 8.017500 | 19 | 0 |
| EEG-0055 FEPCR | 143 | 143 | 12.265278 | 61 | 0 |
| EEG-0056 Fribourg Ultimatum Game in Schizophrenia Study | 43 | 86 | 12.335000 | 128 | 0 |
| EEG-0057 MDD (Mumtaz) | 64 | 181 | 20.555833 | 19 | 0 |
| EEG-0058 MODMA | 53 | 106 | 16.629376 | 128 | 53 |
| EEG-0059 Power Spectral Density-Based Resting-State EEG Classification of First-Episode Psychosis | 72 | 726 | 6.050000 | 60 | 0 |
| EEG-0060 Schizophrenia-81 | 40 | 11,527 | 9.605833 | 64 | 0 |
| EEG-0061 TDBRAIN | 1464 | 3,268 | 120.516389 | 26 | 0 |
| EEG-0062 Acute Mild TBI DPX Cognitive-control EEG | 90 | 223 | 125.701324 | 62 / 63 | 223 |
| EEG-0063 Clinical BCI Challenge WCCI 2020 (Stroke Motor Attempt) | 10 | 1,200 | 2.666667 | 12 | 1,200 |
| EEG-0065 ALS-Spelling (EEG-ET) | 176 | 1,989 | 66.323056 | 32 | 1,989 |
| EEG-0070 BNCI 006-2014 (SCP training in stroke) | 2 | 16 | 21.875556 | 1 | 16 |
| EEG-0071 BNCI 008-2014 (P300 speller, ALS) | 8 | 8 | 3.018267 | 8 | 8 |
| EEG-0074 CCEP ECoG Dataset across age 4-51 | 74 | 117 | 89.391008 | 40–115 | 0 |
| EEG-0075 Dataset of electrophysiological signals (EEG, ECG, EMG) during Music therapy with adult burn patients in the Intensive Care Unit. | 9 | 51 | 10.938317 | 8 | 51 |
| EEG-0078 EEG: 3-Stim Auditory Oddball and Rest in Parkinson’s | 50 | 75 | 12.759917 | 63 | 75 |
| EEG-0079 EEG: Reinforcement Learning in Parkinson’s | 56 | 84 | 35.381278 | 63 | 84 |
| EEG-0080 EEG: Simon Conflict in Parkinson's | 56 | 84 | 48.534861 | 63 | 84 |
| EEG-0081 EEG: Three-Stim Auditory Oddball and Rest in Acute and Chronic TBI | 115 | 421 | 141.664933 | 62 / 63 | 421 |
| EEG-0083 Intraoperative Medianus-tibialis Stimulation EEG | 18 | 437 | 11.763056 | 4 / 5 / 7 / 8 / 10 | 0 |
| EEG-0084 Liu2024 | 50 | 50 | 4.444444 | 29 | 0 |
| EEG-0085 Lower-Limb-MI (stroke) | 27 | 419 | 23.205117 | 40 | 419 |
| EEG-0087 Ultra High-Density EEG of Interictal Migraine and Controls | 39 | 117 | 21.232222 | 128 | 0 |
| EEG-0089 Mu and Beta Oscillatory Changes during a motor task following Rehabilitation in Chronic MCA Stroke: Insights from EEG | 18 | 27 | 12.769161 | 58 | 0 |
| EEG-0092 PD-EEG Resting-State & Walking EEG | 144 | 277 | 19.488693 | 60 | 0 |
| EEG-0093 EEG Mortality Dataset in Parkinson's Disease | 94 | 94 | 4.106461 | 63 | 0 |
| EEG-0094 PD31 (Parkinson) | 31 | 46 | 2.517778 | 40 | 0 |
| EEG-0098 Tinnitus Acoustic Therapy EEG Database | 103 | 877 | 100.311458 | 16 | 0 |
| EEG-0100 UNMDataset | 28 | 28 | 1.466000 | 63 | 0 |
| EEG-0106 NMT Scalp EEG Dataset | 2417 | 2,417 | 488.966944 | 21 | 0 |
| EEG-0107 TUAB (TUH Abnormal) | 2329 | 2,993 | 1141.002222 | 21 | 0 |
| EEG-0125 HMC clinical sleep EEG | 151 | 151 | 1144.218889 | 4 | 0 |
| EEG-0493 ADSZ (Alzheimer / MSU schizophrenia) | 84 | 132 | 1.513333 | 16 / 19 | 48 |
| EEG-0523 SFARI_EEG multi-paradigm dataset | 135 | 2,563 | 226.532672 | 64 | 0 |
| EEG-0582 TUEG (TUH EEG Corpus) | 14530 | 60,431 | 25002.085000 | 17 | 0 |
| EEG-0583 Albrecht2019 schizophrenia modified Simon continuous EEG | 77 | 186 | 34.671569 | 60 | 186 |
| EEG-0585 Singh2020 Parkinson pedaling raw EEG | 39 | 44 | 3.320767 | 63 | 0 |
| EEG-0586 Singh2021 Parkinson interval timing raw EEG | 111 | 150 | 51.695656 | 63 | 0 |
| EEG-0606 UCDDB sleep apnea | 25 | 25 | 173.360556 | 2 | 0 |

源说明：[HMC](https://physionet.org/content/hmc-sleep-staging/1.1/)、[UCDDB](https://physionet.org/content/ucddb/1.0.0/)、[EDF 规范](https://www.edfplus.info/specs/edf.html)、[ADSZ](https://doi.org/10.6084/m9.figshare.19091771.v1)、[AD 父来源](https://doi.org/10.1371/journal.pone.0231169)、[MSU](http://brain.bio.msu.ru/eeg_schizophrenia.htm)、[Singh2021](https://doi.org/10.1038/s41531-021-00158-x)。原文件头、作者工作簿/代码及负责人单位确认的来源级记录保存在本地 provenance。
