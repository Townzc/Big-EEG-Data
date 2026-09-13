# 网站当前 97 个疾病类条目的下载与处理状态（2026-09-13）

按当前网站的 97 个“医疗与疾病”条目逐项核对，并查验实际数据目录。当前为 **62 个已有统一预处理产物，6 个已下载但未进入本项目统一预处理，29 个未下载**。合计 97 个；已下载总计 68 个。

这里按网站条目计数，不按来源包或独立患者计数。未下载的 29 条中包含 12 条 MORGOTH 逻辑分区。下载是指本地存在实质信号或源归档；仅有网页、元数据、空目录或完成标记不算下载。发布者已经处理过的 MAT 等仍需要本项目适配，不能据此算作统一预处理完成。

## 已下载但尚未统一预处理：6 个

| ID | 数据集 | 实际文件证据 |
|---|---|---|
| EEG-0125 | HMC (Haaglanden) | 151 个 EEG/PSG EDF + 151 个评分 EDF；RECORDS 全齐，文件长度与 EDF 头一致；残留 8.81 GB ZIP .part 不计成功载荷 |
| EEG-0493 | ADSZ | 18,277,631-byte ZIP，132 个内部文件；CRC 与保留的源 SHA-256 均通过；尚未接入统一读取器 |
| EEG-0583 | Albrecht2019 | 77 个 CC_EEG MAT 信号文件，MATLAB 文件头有效；另有行为数据与代码；单位/参考/来源完整性待适配审计 |
| EEG-0585 | Singh2020 | 39 组原始 BrainVision 文件；VHDR 指向 EEG/VMRK 均存在，无 Git LFS 占位符；发布者处理文件不算本项目已处理 |
| EEG-0586 | Singh2021 | 129 组原始 BrainVision 文件；VHDR 指向 EEG/VMRK 均存在，无 Git LFS 占位符 |
| EEG-0606 | UCDDB Sleep Apnea Database | 25 个 PSG REC + 25 个 Lifecard EDF；RECORDS 全齐，文件长度与 EDF 头一致；ECG 与 EEG 不混计 |

HMC 的独立 EDF 文件已完整落盘；目录中另有一个未完成 ZIP 副本，不因此把整个数据集算成未下载，也不把该 .part 文件算作成功下载。六项目前没有本项目统一 200 Hz/缩放/JSON/清单及终端校验的产物。上游信号单位、参考、标签及同源交集仍需在适配时核验。

## 未下载：29 个

- EEG-0011 — EPILEPSIAE European Epilepsy Database
- EEG-0020 — MORGOTH HEP
- EEG-0021 — MORGOTH IIIC-Test
- EEG-0022 — MORGOTH IIIC-Train
- EEG-0023 — MORGOTH MoE-External
- EEG-0024 — MORGOTH MoE-Internal
- EEG-0025 — MORGOTH ON
- EEG-0026 — MORGOTH SAI
- EEG-0027 — MORGOTH SN2-Test
- EEG-0028 — MORGOTH SN2-Train
- EEG-0051 — B-SNIP1
- EEG-0102 — BrainLat (Latin American EEG)
- EEG-0103 — MORGOTH HEEDB-Pretrain
- EEG-0104 — MORGOTH HEEDB-Test
- EEG-0105 — MORGOTH HEEDB-Train
- EEG-0150 — I-CARE
- EEG-0591 — Mignot Nature Communications (MNC)
- EEG-0592 — Comprehensive Polysomnography (CPS)
- EEG-0593 — LOFT-HF
- EEG-0602 — SeizeIT1
- EEG-0603 — DCSM Sleep Staging Dataset
- EEG-0604 — George B. Moody PhysioNet Challenge 2026 (PN2026)
- EEG-0605 — STAGES
- EEG-0608 — Dreem Open Dataset – Obstructive (DOD-O)
- EEG-NEW-0001 — Neurotech EEG Dataset
- EEG-NEW-0002 — Resting-State EEG in Parkinson's Disease and Healthy Controls
- EEG-NEW-0003 — ValidPain2 - Performance of the Nociception Level Index and the PainSensor to predict and detect responsiveness to nociceptive procedures in critical care patients
- EEG-NEW-0004 — A Comprehensive Multimodal Dataset for Investigating Cognitive Impairment in Obstructive Sleep Apnea
- EEG-NEW-0005 — EEG: Probabilistic Selection and Depression

## 与旧 99 项说明的关系

这 6 个已下载未处理的目标均在旧 99 项清单之外。因此“原本地 14 项没有未着手积压”只适用于那一旧分组，不代表网站全部疾病条目没有待处理数据。旧 99 项中的疾病未下载 15 条，加上旧清单之外未下载 14 条，构成当前 29 条。

62 个已经处理的目标仍保留单位、参考、标签和幅值 QC 待核状态；“已有产物”不能解读为所有科学元数据已解决。此轮核对下载/处理状态，没有启动新下载或重跑数据。

[完整 97 行 CSV](data/disease97-acquisition-status-20260913.csv) · [统计 JSON](data/disease97-acquisition-status-20260913.json)。本地证据保存在 `EEG-data-process/results/disease_audit_20260913/current97_acquisition_status.csv` 和同名 JSON。
