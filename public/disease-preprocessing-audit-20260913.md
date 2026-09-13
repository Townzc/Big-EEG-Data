# 六个已下载疾病类数据的处理结果（2026-09-13 / batch117）

已对六项全部执行来源核验、适配、处理和产物校验。**五项生成统一格式，UCDDB 完成原始计数隔离处理，仍缺少微伏校准依据。** 因此不能将这六项都报为“物理单位问题已经解决”。

当前网站 **97 个疾病条目 = 67 个有统一格式产物 + 1 个已下载、隔离处理完成但校准受阻（UCDDB）+ 29 个未下载**。可直接继续执行的已下载处理队列为 0；未下载的 29 项保持等待用户取得访问权限。本轮未申请或下载这些缺失来源。

本轮标准分支新增 **663 份产物、1,235.420214 h、376,744 条事件**。另有 UCDDB **25 份 / 173.360556 h** 原始计数隔离数据，不加入微伏统计。人数包含患者与对照，按证据计数；下面的未知人物映射没有用文件数补齐。

| ID / 数据集 | 可追踪身份条目 | 产物数 | 信号时长 h | EEG 通道 | 原始 Hz | 结果 |
|---|---:|---:|---:|---|---|---|
| EEG-0125 HMC | 151 | 151 | 1144.218889 | 4 | 256.0 | 标准格式通过；详见单位/身份限制 |
| EEG-0493 ADSZ | 84；另 48 个 AD 片段人物映射待核 | 132 | 1.513333 | 16 / 19 | 128.0 | 标准格式通过；详见单位/身份限制 |
| EEG-0583 Albrecht2019 | 77 | 186 | 34.671569 | 60 | 1000.0 | 标准格式通过；详见单位/身份限制 |
| EEG-0585 Singh2020 | 39 | 44 | 3.320767 | 63 | 500.0 | 标准格式通过；详见单位/身份限制 |
| EEG-0586 Singh2021 | 111；另 18 会话配对待核 | 150 | 51.695656 | 63 | 500.0 | 标准格式通过；详见单位/身份限制 |
| EEG-0606 UCDDB | 25 | 25 | 173.360556 | 2 | 128 | 原始计数隔离；待微伏校准 |

**EEG-0125 HMC**：保留 F4-M1、C4-M1、O2-M1、C3-M2 四路 EEG；去除 EMG/EOG/ECG。EDF 微伏增益逐文件独立复核，原生参考保留。保留 0.2 Hz 采集高通，补低通与 50 Hz notch，256→200 Hz；原 LP 35/128 Hz 的差异逐文件标记。W/N1/N2/N3/R 及开关灯事件按原秒数保留；没有逐人疾病诊断。151 个匿名 PSG 记录身份不宣称与其他来源全局唯一。

**EEG-0493 ADSZ**：48 个 AD/老年对照片段，实际 41 段 8 s、3 段 10 s、3 段 12 s、1 段 14 s，19 通道、128→200 Hz；保留所有原始点，不统一截成论文概述的 8 s。按父来源已带限 1–30 Hz 的数据仅重采样，不再次滤波。微伏数值尺度、列顺序为明确推断；AD 文件与独立人物的映射未公开，全部 split=unassigned，不能把 48 个文件直接报成 48 个已核实人物。 84 个 MSU 少年样本（45 有精神分裂症症状、39 健康），16 通道、每段 60 s。原发布者明确 mkV、128 Hz 和每通道连续 7680 点的排列；保留文件身份与疾病分组，0.1–62.72 Hz + 50 Hz notch、200 Hz、μV/100。

**EEG-0583 Albrecht2019**：实际 77 个 EEG MAT：46 个患者组 P、31 个对照组 N；其中 1 个 P 文件缺人口学表行，保留文件组别并标记证据限制，不补猜人口学或个人诊断细节。文件为连续 1000 Hz、单 trial、空 ICA、无 CSD 的导出，与镜像 README 的概括不一致；按文件处理，移除作者指定的四路眼电后保留 60 路。按 EEGLAB 合并边界拆段并保留全部源样点；0.1–75 Hz + 60 Hz notch，降至 200 Hz。MAT 无单位/增益字段，微伏仅为显式推断，排除确认单位训练池。原 ref=common 保留；1 个连续段触发幅值异常 QC，保留原值和标记，未作裁剪。

**EEG-0585 Singh2020**：39 名受试者：13 健康对照、13 PD 无冻结步态、13 PD 有冻结步态。读取原始 VHDR/EEG/VMRK，应用头文件 µV 分辨率一次，保留 63 路 EEG、去除 X/Y/Z 加速度；原 Pz 参考不合成额外通道。500→200 Hz、0.1–75 Hz + 60 Hz notch。分组、MOCA/FoG/UPDRS、S1 提示及 S2 GO 按作者工作簿/代码保留；原生分段边界不跨越。

**EEG-0586 Singh2021**：129 组原始会话；111 个身份可由工作簿核对（74 PD、37 对照），另 18 组 ON/OFF 会话（对应 24 个连续段）缺正式人物配对，不能报为 18 个独立新增人，也不使用镜像的推测配对/药物状态。保留 63 路 EEG，去除 Resp 或 X/Y/Z 辅助通道；保留 Iz/I1/I2 等实际导联名和 Pz 参考，不插值。500→200 Hz、0.1–75 Hz + 60 Hz notch。原始触发码保留，推測的语义不冒充已确认标签。

**EEG-0606 UCDDB**：25 人、25 个 PSG REC，另 25 个 Lifecard 文件是 ECG，未混入 EEG。只保留 C3-A2/C4-A1，128→200 Hz。EDF 标为 NV、物理范围 0..1，缺少可核实的 counts→μV 换算；生成 float32 native_ADC_count 隔离产物，不除 100，不加入统一微伏训练池。保留 AHI、人口学、按 PSG 时钟对齐的呼吸事件；原始睡眠分期序列完整保留，但 30 s epoch 的起点缺乏明确时间戳，不臆造对齐。两份分期文件共 15 个未在发布说明中定义的代码 8 原样保留并标记，不猜成睡眠阶段。

**当前全部疾病类汇总**

| 指标 | 数值 |
|---|---:|
| 有标准格式产物的疾病目录条目 | 67 |
| 完整记录 / trial / 连续段 | 189,919 |
| 各库可追踪身份合计，含对照 | 28,913 |
| 合并有证据的共享身份后 | 25,469 |
| 缺可靠人物映射的产物 | 731 |
| 累计时长，不乘通道数 | 45,314.306446 h |
| NPZ + JSON 字节 | 1,739,504,213,679 |
| 事件行数 | 3,019,836 |
| 单位推断或待核的产物 | 32,376 |
| 单位有依据且身份可追踪的联合视图 | 47 项 / 156,134 份 / 44,569.534129 h |

上述人数不是全球唯一患者数，时长也可能含跨发布版的部分重复时间。新发现的 Iowa 任务编号候选交集在 **96 个候选组**中保守使用同一 split；其中 28 对静息/计时编号的人口学字段一致，但缺少正式跨任务身份表，因此只防止可能的训练/测试泄漏，不把候选关系冒充已证明的人物合并。确认身份、完全相同数组、这些候选组复核后跨 split 均为 0。

**格式与处理规则**

标准 NPZ 只有 `data`（float32，`[channel,time]`）、`channel_names`（Unicode）、`sfreq`（200 Hz）。单位有依据时 `data = x_uV / 100`，恢复微伏乘 100；单位推断分支有 `unit_not_verified`，默认不进入确认单位清单。UCDDB 的 `native_ADC_count` 没有微伏缩放，不能乘 100 当作微伏。

每份同名 JSON 保存来源/信号哈希、原始与目标采样率、单位证据、参考、导联顺序、人物/会话、诊断/任务事件、分段边界、处理步骤、QC 和 split。CSV 包括逐产物清单、事件清单、分支汇总、重复信号关系。连续段未预切成小文件；加载时取 1 秒 / 200 点 patch，禁止跨原始段边界，尾部由加载器丢弃或带 mask 补齐。

原始数据沿用 0.1–75 Hz 与已知 50/60 Hz notch，遵守原始 Nyquist；128 Hz 来源最多 62.72 Hz，不声称恢复 75 Hz 内容。HMC/UCDDB 保留更高的原采集高通和 35 Hz 带宽记录；ADSZ AD 仅重采样。未额外做 z-score、统计归一化、ICA、CAR、插值或幅值裁剪。

**核验范围与剩余问题**

源审计覆盖 1,141 个文件 / 71,824,900,072 bytes。HMC/UCDDB 发布者 SHA-256、ADSZ CRC、所有原始三联文件的长度和增益检查通过；对 HMC 和两套 Singh 共 319 个记录进行了直接二进制换算与 MNE 读取的独立数值比较。新产物全部重新读取，核对有限值、dtype、形状、通道、200 Hz、缩放元数据、SHA-256、patch、事件区间、源文件覆盖与分段不丢点。

既有 255,471 份数组的全量审计通过记录按不可变 part 哈希复用，加上本轮新数组重新扫描，形成 256,134 份标准结构数组的当前验证集合；这不是在本轮重复读取全部旧 2 TB 信号。UCDDB 原始单位隔离另验。

UCDDB 仍需来源方明确 NV/增益及分期起点；Albrecht MAT 的电压单位、ADSZ AD 的单位/列顺序/人物映射和 Singh2021 的 18 个 ON/OFF 会话配对仍待更强依据。既有 MODMA 校准、部分库标签/参考、平线与幅值 QC 限制保留；本轮没有把它们改成全部正常。[本轮前的完整问题与修复记录](https://github.com/Townzc/Big-EEG-Data/blob/main/DISEASE_AUDIT_BEFORE_BATCH117_20260913.zh-CN.md) 另存为历史报告。旧六项状态、旧 99 项分类对账均保留为历史证据；不能把旧 14 项当成这次六项。

**当前联合清单与复现**

项目根目录：`EEG-dataset-collection/EEG-data-process`。本轮标准分支位于 `results/disease_v1/batch117/<branch>/shards/.../data/`；UCDDB 位于 `results/quarantine_v1/batch117/ucddb/`。当前疾病汇总位于 `results/disease_audit_20260913_batch117/`，`results/current_disease_audit.json` 指向当前版本。联合使用以新 CSV 的 `split` 为准，分支 JSON 保留历史划分。

```python
import csv
from disease_manifest_loader114 import load_record
with open('results/disease_audit_20260913_batch117/disease_unit_confirmed_joint_manifest.csv') as f:
    row = next(csv.DictReader(f))
data, metadata = load_record(row)  # 使用联合 split，校验单位门禁，不重复 /100
```

适配代码 `eeg_preprocess_batch117.py`、七份 `configs/disease_v1_batch117_*.yaml`、`audit_sources_pending117.py`、`validate_pending_six117.py`、`consolidate_pending_six117.py`，以及 `provenance/pending_six117/` 的源证据、执行哈希和逐分支报告可复核。正式处理 Slurm 2173580；针对变长片段、未定义分期和缺人口学表行的补跑及最终全量验证为 2173587，已成功产物保留；合并审计见本地执行记录。

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

源说明：[HMC](https://physionet.org/content/hmc-sleep-staging/1.1/)、[UCDDB](https://physionet.org/content/ucddb/1.0.0/)、[ADSZ 发布与论文](https://doi.org/10.6084/m9.figshare.19091771.v1)、[AD 父来源的选段/滤波/参考](https://doi.org/10.1371/journal.pone.0231169)、[MSU 原始单位与排列](http://brain.bio.msu.ru/eeg_schizophrenia.htm)、[Singh2021 原论文](https://doi.org/10.1038/s41531-021-00158-x)。Albrecht/Singh 的工作簿、原文件头及作者处理代码均来自已下载发布包；文件证据优先于镜像概括。
