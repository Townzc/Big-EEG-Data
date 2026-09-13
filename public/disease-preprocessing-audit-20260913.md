# 疾病类 EEG 预处理全量复核（2026-09-13）

本次按网站**当前“医疗与疾病”分类**核算，并复核历史疾病处理目录中已迁往其他类别的产物。选用的标准数组完整性通过；另行检查发现并修复了 MODMA 三通道旧 int32 数值损坏，同时修正 EEG-0053 单位未落实、TBI 视觉分支处理状态错误、人数重复/误计和跨库划分冲突。单位推断、参考冲突、缺失标签及幅值异常仍明确保留，不能把“文件校验通过”等同于“所有科学元数据都已解决”。

**总体统计与人数口径**

| 范围 | 数据集目标 | 完整产物 | 可追踪身份 | 累计信号小时 | NPZ+JSON 大小 |
|---|---:|---:|---:|---:|---:|
| 当前疾病类，人类分支 | 62 | 189,256 | 25,007 | 44,078.886232 | 1.712287 TB / 1.557316 TiB |
| AES/UPenn 犬类，单独统计 | 2 | 31,373 | 9 个数据集内犬身份条目 | 1,261.500240 | 53.950 GB |
| 已归其他类别的历史产物 | 15 | 24,446 | 954 | 772.346104 | 115.634 GB |
| 可选 TUEG 重叠分支 batch111 | 1，与上表 TUEG 同一目标 | 10,396 | 855，与其他 TUH 分支可重叠 | 2,004.760278 | 91.235 GB |

疾病类各数据集内已核实身份人数相加为 **28,451**；按已经证实的共享身份合并后为 **25,007 个可追踪身份**。这些人数包含患者和健康对照，不是确诊患者总数，也不能保证所有匿名来源之间都已识别重叠。Bonn 的 500 段没有逐人映射；TUEV 的 159 份记录只有 80 个未证实为受试者的 session ID。这 **659 份**不计入已核实人数，仍保留信号与身份状态。

小时数 = 每份数组的时间点数 / 200 / 3600，**不乘通道数**，也不按“人数 × 实验计划时长”估算。它是文件累计时长；相同/重叠来源可以在不同发布中出现。疾病类有 1,319 个完全相同数组组、1,444 个额外副本；仅去除完全相同数组后为 **43,853.766826 h**，这仍未保证消除所有跨库部分时间重叠。FEP 的 raw/processed 子集关系另行处理。

疾病类共 **2,643,092 行事件**，可在加载时形成 **158,681,404 个完整 1 秒窗口**；尾部共 517,287 个样本，按原记录边界保留，加载器决定舍弃或补零加 mask。所有数据仍以完整记录、trial 或连续段保存，没有写出大量 1 秒小文件。

**EEG-0053 已落实到实际数组**

121 个 MAT，61 ADHD / 60 Control，19 通道；用户于 2026-09-13 确认原数值为 μV。已从原始数值重跑，采用 0.1–62.72 Hz、50-Hz notch、128→200 Hz、固定 `x_model = x_μV / 100`。原始时长 16,924.8671875 s，输出 16,924.895 s = 4.7013597222 h；差值 0.0278125 s 来自逐记录重采样舍入。输出 240,053,337 bytes；98 train / 7 validation / 16 test。121 个源 SHA-256 重新核对，121 个新数组全量校验通过，并逐一确认它们与历史 native 分支 `/100` 后仅有 float32 舍入差。

当前位置为 `results/disease_v1/batch114/`；旧 `quarantine_v1/batch113` 已被取代，不重复计数。19 列顺序是 Fp1, Fp2, F3, F4, C3, C4, P3, P4, O1, O2, F7, F8, T7, T8, P7, P8, Fz, Cz, Pz。DOCX 编号证据已从固定 commit 镜像恢复。单位的依据是负责人确认；官方信号字节等价性、原 CED 坐标和确切 A1/A2 连接方式仍无直接文件证据。

**发现的问题、修正与保留事项**

- MODMA 三通道旧 int32 隔离文件存在真实数值损坏：7 份文件、1,703,972 个值因超出 signed int32 范围而错误变成极限值。已在 `quarantine_v1/batch116` 按原始十进制整数重建为 int64，55/55 份、50,401,506 个数值均与源文件逐值一致。旧 batch109 三通道分支被标记为已废弃；未对无符号编码、ADC 增益或物理电压作猜测。
- TBI 视觉工作记忆（EEG-0081 / ds003523）原先误用“已处理”分支。发布者 BIDS 转换代码实际读取 RawEEG，现有连续 CPz 数据也不符合另一份 epoched STEP1 输出，因此已对 221 份 / 90 人重跑 raw 滤波分支；听觉分支保持原产物。单位仍明确待核。依据：[发布者转换代码](https://github.com/OpenNeuroDatasets/ds003523/blob/master/code/Convert2BIDS_mTBICoBRE_WM.m)。
- AES / UPenn 原有数组已经 `/100`；本次按负责人此前确认的 μV 与颅外/颅骨固定单极参考补齐 66,839 份 JSON/清单，未再次缩放信号。旧元数据有压缩备份。犬与人分开；不重复乘 UPenn 增益；Bipolar/CAR 是建议，现有保留原参考的基线没有擅自执行。
- 跨库已知身份存在 **75 组划分冲突**，另有 **9 组完全相同数组跨 split**。联合清单按 test > validation > train 保留较严格的留出归属，修正 1,209 行有效划分；复核后已知身份与完全相同数组均为 0 个跨 split。原单库 JSON 保留历史划分，联合使用必须读新 CSV 的 `split`。
- 人数按证据合并：[CHB-MIT 的 chb01/chb21](https://physionet.org/content/chbmit/1.0.0/)；AHEPA 的闭眼/光刺激共享 88 人；FEP 已处理版是 FEPCR 的 72 人子集；三个帕金森任务按 Original_ID 合并为 56 人；Iowa PD/PD-Mortality 的同源身份及信号；TUH 与 TBI 已有共享命名空间。完全相同的零值信号不会被当作“两个身份一定是同一个人”。
- 有 **32,142 份疾病产物仍为单位推断、单位未知或设备证据纠正**，涉及 18 个目标（MODMA 为部分分支）。不能默认为已经完成物理校准。MODMA 128 通道的 53 份 rest 仍为单位推断；3 通道 55 人另存 native ADC，等待作者细节。ALS-Spelling 的 EDF 标记纠正、BNCI SCP/P300、vEpiSet、Adult ADHD、APAVA、部分 PD/TBI 等均在表格和 JSON 保留证据级别。
- NMT 2,417 份和 TDBRAIN 3,148 份没有可用的当前诊断标签；保留 -1/未标注，可评估自监督用途，不能当成带确诊标签的监督样本。HMS 是窗口级专家标签；TUH 大库、任务事件和人群分组也不能互相替代。
- 振幅不强行压到 [-1,1]。疾病产物中 14,945 份有持续高幅值审查标记、501 份有极端峰值标记、365 份有 ≥5 秒平线标记；这些集合可重叠。BDI 有稀疏极端尾值，TDBRAIN 大量高幅值、NMT 幅度明显偏小，TBI/ADHD 部分记录也有大幅值。保留并标记，未仅凭幅度删除、裁剪或编造缩放倍数。
- 参考和通道数没有强行统一。AHEPA 的 README/sidecar 存在参考冲突，部分 iEEG/BTE/临床 EEG 未说明确切参考；它们仍在 JSON 中。颅内、电极对、双极导联和头皮通道不能只按列号互换。高采样率原数据经统一限带/200 Hz 后不适于恢复原高频研究终点（例如 HFO）。
- 1,620 个看似“越界”的标记复核后均是来源保留信息：EEGLAB boundary/删除时段，或已有 `training_interval_eligible=false` 的发布者异常标记；有效训练事件区间未发现未解释越界。新增加载器会排除这些非训练区间，同时保留完整事件 provenance。[EEGLAB 的 boundary 定义](https://eeglab.org/tutorials/ConceptsGuide/Data_Structures.html#event-boundaries)。

**预处理后的格式和使用方式**

| 文件/字段 | 含义 |
|---|---|
| 每份 `.npz` 的 `data` | `float32`，二维 `[channel, time]`；单位有依据的分支为 `μV/100`，恢复微伏乘 100，勿重复除 100。单位待核分支不能据此声称已物理校准 |
| `channel_names` | Unicode 字符串数组，与 data 第一维逐列对应；保留经安全名称规范化的原导联顺序 |
| `sfreq` | 标量 float，标准分支为 200 Hz |
| 同名 `.json` | 原/目标单位和采样率、参考、通道类型、源路径/哈希、信号哈希、人物/会话/记录 ID、标签与证据、事件、滤波步骤、QC、划分和 patch 合约 |
| `preprocessing_manifest.csv` | 每份产物一行，含路径、形状、时长、标签、单位状态、QC、hash、split |
| `events_manifest.csv` | 每个事件一行；不要把 boundary duration 或被排除的来源标记当有效训练时段 |
| `dataset_registry.csv` / `dedup_report.csv` | 批次汇总和完全相同信号关系；跨库使用以本次联合清单为准 |

基线：原始连续数据按有效 Nyquist 上限做 0.1–75 Hz 带通与有依据的 50/60-Hz notch；128-Hz 原数据上限为 62.72 Hz。已有部分滤波的源只补必要部分；已经预处理或分 trial 的发布版不重复整套滤波。重采样 200 Hz、以微伏为物理尺度固定 `/100`，无 z-score、跨库均值方差归一化、追加 ICA/ASR、统一 CAR、坏道插值或仅按振幅删除。发布者已有操作及 HMS 等适配器的明示哨兵修复例外保留 provenance。

本次提供 `disease_joint_manifest.csv`（全部人类疾病产物，含待核单位）及 `disease_unit_confirmed_joint_manifest.csv`（单位有文档/文件头依据、身份可追踪，排除 FEP 重复处理子支）。后者含 **43 个目标 / 155,729 份 / 43,375.604024 h / 24,024 个可追踪身份**。它仍保留幅值、参考、标签等 QC；不是“所有问题已解决”的承诺。可选的 `disease_unit_confirmed_unique_manifest.csv` 再去完全相同数组，含 154,311 份 / 43,159.821218 h。犬类有独立清单。CSV 仅引用已有 NPZ/JSON，没有复制大量信号。

```python
import csv
from disease_manifest_loader114 import load_record
from model_adapter import make_patches

with open("results/disease_audit_20260913/disease_unit_confirmed_joint_manifest.csv") as f:
    row = next(csv.DictReader(f))
x, metadata = load_record(row)  # already μV/100; uses the joint CSV split
patches, mask = make_patches(x, 200, remainder="pad")
# patches: [number_of_patches, channels, 200]; mask marks padded samples
# For publisher-discontinuous records, also use all_source_events to avoid
# windows crossing an internal boundary; do not join separate recordings.
```

**全部疾病类目标明细（人类分支）**

人数列只列可追踪身份，含对照；同一人在不同目标的列内仍会出现，不能再次把此列相加当成全球唯一人数。时长为当前完整产物累计小时。精确采样率、参考、标签计数、QC、字节数、路径和 source URL 另见机器可读 CSV/JSON。

| ID / 数据集 | 人数 | 完整产物 | 小时 | 输出通道 | 源 Hz | 单位/主要备注 |
|---|---:|---:|---:|---|---|---|
| EEG-0005 A dataset of neonatal EEG recordings with seizure annotations | 79 | 79 | 111.895833 | 19 | 256 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0006 American Epilepsy Society Seizure Prediction Challenge | 2 | 473 | 78.833333 | 15, 24 | 5000 | 单位有文档/头信息依据。 此表仅人类 2 人；犬类另列。负责人确认 μV/单极参考；不重复增益或强制重参考。 |
| EEG-0008 Bonn EEG Seizure Dataset | 0 | 500 | 3.277778 | 1 | 173.61 | 单位有文档/头信息依据。 缺逐人映射，0 表示可追踪 ID 为 0，不是没有受试者；500 段保持 unassigned。 |
| EEG-0009 CHB-MIT | 23 | 686 | 982.935278 | 18–32（6 种） | 256 | 单位有文档/头信息依据。 24 个 case ID 合并为 23 人；chb01/chb21 为同一人。 |
| EEG-0010 Criteria for defining interictal epileptiform discharges in EEG: a clinical validation study | 100 | 100 | 0.350833 | 19, 25 | 500 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0013 HFO (High-Frequency Oscillations) | 30 | 30 | 89.006944 | 23, 24 | 1024, 2048 | 单位有文档/头信息依据。 统一版本仅保留 ≤75 Hz，不能用于原始高频振荡频段的检测。 |
| EEG-0014 HMS Harmful Brain Activity Classification | 1950 | 17,089 | 380.280000 | 19 | 200 | 单位有文档/头信息依据。 106,800 个专家窗口以事件保存；不能将窗口诊断推广到整段。NaN/±9999 哨兵按旧适配器规则修复并留证。 |
| EEG-0015 HUP iEEG Epilepsy Dataset | 58 | 348 | 49.769444 | 36–195（45 种） | 256, 500, 512, 1024 | 单位有文档/头信息依据。 13 个发布者越界 offset 标记仅作 provenance，不进入训练时间区间。 |
| EEG-0016 vEpiSet (Interictal Epileptiform Discharge EEG Dataset) | 84 | 25,449 | 28.241667 | 23 | 500 | 含单位待核/推断。 μV 换算依赖数值范围与论文幅度推断；不是文件内明文单位。 |
| EEG-0017 Intracranial entrainment reveals statistical learning across levels of abstraction | 8 | 30 | 1.226347 | 116–223（7 种） | 4096 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0018 Kaggle UPenn and Mayo Clinic Seizure Detection | 8 | 34,993 | 9.723367 | 16–72（7 种） | 499.907, 5000 | 单位有文档/头信息依据。 此表仅人类 8 人；犬类另列。隐藏测试标签保持 -1；每段独立重采样产生少量时长舍入。 |
| EEG-0030 OpenNeuro ds003029 Epilepsy iEEG Multicenter | 31 | 102 | 7.956888 | 30–184（29 种） | 249.875, 499.75, 1000, 1001, 2004.01 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0031 SeizeIT2 | 125 | 2,850 | 11626.248889 | 2 | 256 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0032 Siena Scalp EEG | 14 | 41 | 141.020556 | 19, 29 | 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0033 TUEP (TUH Epilepsy) | 200 | 2,808 | 626.766389 | 17 | 250, 256, 400, 512, 1000 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0034 TUEV (TUH Events) | 290 | 518 | 148.744722 | 21 | 250 | 单位有文档/头信息依据。 290 个已核实身份；另有 80 个未证实为人的 session ID / 159 份记录，未计入人数。 |
| EEG-0035 TUSL (TUH Slowing) | 38 | 112 | 27.596389 | 21 | 250, 256, 400, 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0036 TUSZ (TUH Seizure) | 675 | 8,140 | 1474.787222 | 17 | 250, 256, 400, 512, 1000 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0039 AD-Auditory | 35 | 35 | 5.202778 | 19 | 250 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0040 AD65 (Alzheimer/FTD) | 88 | 88 | 19.608417 | 19 | 500 | 单位有文档/头信息依据。 与 EEG-0044 共享 88 人。README 的 Cz 与 sidecar 的 A1/A2 参考有冲突，保留冲突记录。 |
| EEG-0041 Alzheimer Risk Classification Sample-enrichment EEG | 44 | 44 | 3.911556 | 58 | 1000 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0042 APAVA | 23 | 663 | 0.920833 | 16 | 256 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0043 CAUEEG | 1379 | 1,379 | 307.770556 | 19 | 200 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0044 Dementia Photo-stimulation Open-eyes EEG | 88 | 88 | 7.716667 | 19 | 500 | 单位有文档/头信息依据。 与 EEG-0040 同一队列的不同刺激条件；人数不重复计入跨库合并值。参考描述有来源冲突。 |
| EEG-0045 EEG p-adic quantum potential accurately identifies depression, schizophrenia and cognitive decline | 236 | 249 | 84.299794 | 19 | 200, 500 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0047 Resting-state high-density EEG using EGI GES 300 for healthy elders, SCD, MCI and Alzheimer's disease | 4 | 9 | 1.500000 | 256 | 250 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0048 Adult ADHD EEG | 80 | 880 | 7.111111 | 2 | 256 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0052 Depression resting (BDI) | 122 | 243 | 23.359661 | 64 | 500 | 含单位待核/推断。 少量极端峰值影响总体均值/方差；单位未明确，保留原值与审查标记。 |
| EEG-0053 EEG Data for ADHD | 121 | 121 | 4.701360 | 19 | 128 | 单位有文档/头信息依据。 121 人 = 61 ADHD + 60 对照；2026-09-13 负责人确认 μV，已从原始 MAT 重跑 /100。 |
| EEG-0054 EEG in schizophrenia | 28 | 28 | 8.017500 | 19 | 250 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0055 FEPCR | 143 | 143 | 12.265278 | 61 | 1000, 3000 | 单位有文档/头信息依据。 143 人；EEG-0059 是其中 72 人的已处理子集，联合采样清单优先本 raw 分支。 |
| EEG-0056 Fribourg Ultimatum Game in Schizophrenia Study | 43 | 86 | 12.335000 | 128 | 2048 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0057 MDD (Mumtaz) | 64 | 181 | 20.555833 | 19 | 256 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0058 MODMA | 53 | 106 | 16.629376 | 128 | 250 | 含单位待核/推断。 本表为 128 通道 53 人 / 106 份；dot-probe 单位有文件证据，rest 单位推断。3 通道另隔离。 |
| EEG-0059 Power Spectral Density-Based Resting-State EEG Classification of First-Episode Psychosis | 72 | 726 | 6.050000 | 60 | 1000 | 单位有文档/头信息依据。 726 个发布者 epochs，非完整原始记录；与 EEG-0055 重叠，联合单位确认清单排除此重复处理支系。 |
| EEG-0060 Schizophrenia-81 | 40 | 11,527 | 9.605833 | 64 | 1024 | 单位有文档/头信息依据。 实际取得 40 人、11,527 个 3 秒 trial；名称中的 81 不是本地产物人数。 |
| EEG-0061 TDBRAIN | 1464 | 3,268 | 120.516389 | 26 | 500 | 单位有文档/头信息依据。 仅 120 份 MDD 子集记录有诊断标签；3,148 份信号保留未标注。多数记录幅值审查标记仍在。 |
| EEG-0062 Acute Mild TBI DPX Cognitive-control EEG | 90 | 223 | 125.701324 | 62, 63 | 500 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0063 Clinical BCI Challenge WCCI 2020 (Stroke Motor Attempt) | 10 | 1,200 | 2.666667 | 12 | 512 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0065 ALS-Spelling (EEG-ET) | 176 | 1,989 | 66.323056 | 32 | 128 | 含单位待核/推断。 176 人包含 6 ALS + 170 对照；EDF mV 标记曾按设备证据纠正，但仍列单位待核。 |
| EEG-0070 BNCI 006-2014 (SCP training in stroke) | 2 | 16 | 21.875556 | 1 | 256 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0071 BNCI 008-2014 (P300 speller, ALS) | 8 | 8 | 3.018267 | 8 | 256 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0074 CCEP ECoG Dataset across age 4-51 | 74 | 117 | 89.391008 | 40–115（45 种） | 512, 2048 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0075 Dataset of electrophysiological signals (EEG, ECG, EMG) during Music therapy with adult burn patients in the Intensive Care Unit. | 9 | 51 | 10.938317 | 8 | 256, 512, 1024 | 含单位待核/推断。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0078 EEG: 3-Stim Auditory Oddball and Rest in Parkinson’s | 50 | 75 | 12.759917 | 63 | 500 | 含单位待核/推断。 与 EEG-0079/0080 按 Original_ID 合并；三个任务合计 56 个已知人。 |
| EEG-0079 EEG: Reinforcement Learning in Parkinson’s | 56 | 84 | 35.381278 | 63 | 500 | 含单位待核/推断。 与 EEG-0078/0080 共享队列；采用 Original_ID 而非各发布的局部 sub 编号。 |
| EEG-0080 EEG: Simon Conflict in Parkinson's | 56 | 84 | 48.534861 | 63 | 500 | 含单位待核/推断。 与 EEG-0078/0079 共享队列；年龄/性别/分组一致性已逐 ID 核对。 |
| EEG-0081 EEG: Three-Stim Auditory Oddball and Rest in Acute and Chronic TBI | 115 | 421 | 141.664933 | 62, 63 | 500 | 含单位待核/推断。 视觉分支 221 份已改按 raw 重跑（batch115）；听觉 200 份保留。单位仍待核，不能宣称已完成物理校准。 |
| EEG-0083 Intraoperative Medianus-tibialis Stimulation EEG | 18 | 437 | 11.763056 | 4, 5, 7, 8, 10 | 20000 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0084 Liu2024 | 50 | 50 | 4.444444 | 29 | 500 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0085 Lower-Limb-MI (stroke) | 27 | 419 | 23.205117 | 40 | 250 | 含单位待核/推断。 publisher ICA-pruned 数据保留；boundary 的 duration 是删去的长度，不是当前信号上的有效区间。 |
| EEG-0087 Ultra High-Density EEG of Interictal Migraine and Controls | 39 | 117 | 21.232222 | 128 | 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0089 Mu and Beta Oscillatory Changes during a motor task following Rehabilitation in Chronic MCA Stroke: Insights from EEG | 18 | 27 | 12.769161 | 58 | 1000 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0092 PD-EEG Resting-State & Walking EEG | 144 | 277 | 19.488693 | 60 | 250 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0093 EEG Mortality Dataset in Parkinson's Disease | 94 | 94 | 4.106461 | 63 | 500 | 单位有文档/头信息依据。 与 EEG-0100 共享部分 Iowa PD 身份/信号，已统一联合划分；生存结局不同于正常/异常标签。 |
| EEG-0094 PD31 (Parkinson) | 31 | 46 | 2.517778 | 40 | 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0098 Tinnitus Acoustic Therapy EEG Database | 103 | 877 | 100.311458 | 16 | 256, 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0100 UNMDataset | 28 | 28 | 1.466000 | 63 | 500 | 单位有文档/头信息依据。 与 PD-Mortality 以同一 PD 身份及完全相同信号复核重叠。 |
| EEG-0106 NMT Scalp EEG Dataset | 2417 | 2,417 | 488.966944 | 21 | 200 | 单位有文档/头信息依据。 2,417 人信号齐全，正常/异常映射未恢复，标签仍 -1；文件头 μV，但整体幅值偏小，未擅自改倍数。 |
| EEG-0107 TUAB (TUH Abnormal) | 2329 | 2,993 | 1141.002222 | 21 | 250, 256, 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0523 SFARI_EEG multi-paradigm dataset | 135 | 2,563 | 226.532672 | 64 | 512 | 单位有文档/头信息依据。 保留原参考、分组/事件与 QC；具体字段见 CSV/JSON。 |
| EEG-0582 TUEG (TUH EEG Corpus) | 14530 | 60,431 | 25002.085000 | 17 | 250, 256, 400, 512, 1000 | 单位有文档/头信息依据。 主汇总仅 batch42；用于自监督，无逐人疾病诊断。完整独立 TUEG 的 batch111 重叠段另列。 |

**排除项、单列保留项与审计证据**

其他类别的 15 个已处理目标为：EEG-0095 PhysioP300 (PhysioNet ERP, EEG-0090 MultiPhysio-HRC: Multimodal Physiological Signals Dataset for industrial Human-Robot Collaboration, EEG-0064 bigP3BCI, EEG-0520 Infant First-year Resting EEG Dataset, EEG-0067 Auditory-Visual Shift Study, EEG-0082 Human Spinal-cord Somatosensory Evoked Potentials EEG, EEG-0097 Semantic Animals/Tools (EEG-fNIRS), EEG-0068 BCI Competition III (2005) Dataset I, EEG-0069 Tsinghua SSVEP Benchmark (Wang 2016), EEG-0073 BNCI2015_013 (Error-Related Potentials), EEG-0521 Mind in Motion Older Adults Walking EEG, EEG-0524 M3CV (Multi-Subject Multi-Session Multi-Paradigm database for EEG-based Biometrics), EEG-0101 VEPCON, EEG-0077 EEG recordings comprising evoked potentials related to attention to colored laminar stimuli, EEG-0522 MIPDB。这些产物也通过本次数组复核，合计 772.346104 h，未计入疾病总数。

VitalDB 属意识与状态 / 麻醉，沿用上次完成结果：5,565 病例 / 5,344 患者、16,785 段、18,097.513249 h；case 4552 原生时钟隔离。本次不把它加入疾病人数/时长，也未重复扫描其全部数组。BEED 已从当前目录删除，不是可恢复的时域 EEG。MODMA 3 通道为 55 人 / 18.667224 h，`native_source_integers int64 [time,3]`、250 Hz；本次对全部 50,401,506 个数值与 TXT 独立浮点解析结果比对，通过，但没有 counts→μV 校准。与 128 通道共享 53 人，整个 MODMA 可追踪队列为 55 人，不能算成 108 人。

本次实际读取 255,471 份标准结构数组（77 个目标 / 83 个信号分支），扫描 532,287,289,199 个值，重新计算每份规范化信号 SHA-256。缺文件、未列出的同目录 NPZ、dtype/形状/200-Hz/缩放元数据/patch 合约/哈希错误及 NaN/Inf 均为 0。源文件没有全部重哈希：新 ADHD 121 个 MAT 和 MODMA 55 个 TXT 做了源哈希复核，其他数据使用保留的来源审计与哈希 provenance。完整重跑和审计 Slurm 作业 2171322、2171324、2171326、2171363 均成功，MODMA 的独立浮点复核 2171387 揭示旧 int32 错误，修复并全量通过的作业为 2171425。

本地证据目录 `EEG-data-process/results/disease_audit_20260913/`：`summary.json`、`dataset_summary.csv`、`signal_group_summary.csv`、`scope.json`、`scan_completion.json`、`integrity_errors.json`、`physical_output_coverage.json`、`event_semantics_validation.json`、`joint_view_independent_validation.json` 和各联合清单。原有 62/99、63/99 等数字是不同日期和范围的历史 strict KPI，不应继续作为本次疾病类现状。
