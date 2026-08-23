# EEG Healthcare / Disease 分类与数量时长复核报告

修订日期：2026-08-10；最终复核：2026-08-23。

## 结论

总目录由 537 个基线下载单元扩展到 562 个，本轮累计新增 25 个。疾病/健康重点视图包含 146 个单元（疾病/临床 109、健康/人群 37）；其中 57 个已下载审计、89 个尚未进入本地文件审计。

当前已下载且确认存在 raw EEG signal 的主口径为：

| 口径 | 疾病/临床 | 健康/人群 | 合计 |
|---|---:|---:|---:|
| raw EEG 单元 | 53 | 4 | 57 |
| 受试者行计数 | 21,818 | 332 | 22,150 |
| raw EEG 时长 | 43,396.3 h | 231.5 h | 43,627.8 h |

疾病/健康重点范围中，120/146 个单元提供了可数的来源受试者口径，合计 94,700 个 dataset-subject entries；这不是跨数据集去重后的唯一人数。来源级去重时长覆盖约 346,490.7 h，其中 43,627.8 h 已下载并完成文件审计，约 302,862.9 h 属未下载或尚未进入本地审计的文献/官方来源范围。

NeuroAtlas 的 42 个来源原目录覆盖 36 个，本轮补入 SeizeIT1、DCSM、PN2026、STAGES、UCDDB 和 ArithmeticTask 后为 42/42。NeuroAtlas 的脑龄约 193k h 复用了睡眠队列，不重复叠加；详细来源级算法见 `NEUROATLAS_COMPARISON_AND_DOWNLOAD.md`。

直接从已下载内容观察到的受试者下界为 21,132。22,150 是文件观察与可信目录/论文回退后的 `participant-row count`；独立数据集之间是否包含同一参与者无法全面判定，所以不能称为全球唯一人数。

## 分类逻辑

采用双轴分类：

1. 主目录轴：保留研究任务，如睡眠分期、BCI、认知、情绪、运动。
2. 使用范围轴：将可用于当前项目的队列统一标为疾病/临床或健康/人群；睡眠分期仍可保留在主任务目录中。

具体规则：

- 疾病/临床：正式诊断、患者招募、医院监测、治疗/预后或病例-对照研究。健康对照不改变研究的临床主属性。
- 健康/人群：健康参考、生命周期、流行病学、孕产妇、衰老或风险表型。
- 临床 PSG、OSA、医院睡眠监测进入疾病/临床；SHHS、MrOS、WSC、一般睡眠健康/生命周期队列进入健康/人群。
- 一般认知/BCI：健康参与者的 ERP、情绪、语义、视觉、P300/ErrP、工业人机交互等，不归疾病。
- 非 raw EEG：下载内容没有 EEG signal 或只有处理后特征时，从 raw EEG 数量/时长主指标中排除并单列。

### 抑郁是否属于疾病类

属于，但要区分研究对象：

- 临床 MDD、正式抑郁诊断或病例-对照数据归疾病/临床。
- 一般情绪诱发、悲伤刺激、情绪识别不等同抑郁症。
- 仅按 BDI/OCI 等量表高低分组属于风险/症状表型，不能直接写成确诊疾病。

WHO 将 depressive disorder 描述为常见精神障碍：<https://www.who.int/news-room/fact-sheets/detail/depression>。

## 重要纠正

- Auditory-Visual Shift、BNCI2015_013 ErrP、PhysioP300、REFED、语义动物/工具、MultiPhysio-HRC 等从疾病目录移出。
- CHBMP、婴儿首年 EEG、MIPDB、健康老年步行、MESA Sleep 和 HBN 改为健康/人群。
- ADSZ 改入疾病/临床。
- EEG-0050 当前下载只有眼动/瞳孔数据；EEG-0101 当前下载树缺 EEG；二者不计 raw EEG。
- BEED 为 processed-only，80 subjects / 88.9 documented h 单列。
- MESA 以实际有 raw PSG 的 2,056 人计，不使用父睡眠检查 2,237 人。
- HomePAP 改为 343 个 raw PSG 参与者。
- SHHS 以 Visit 1 的 5,793 人为基线人数，Visit 2 的 2,651 是重复随访，不相加为唯一人数。
- MrOS 同理使用 Visit 1 的 2,907 人，Visit 2 的 1,026 单列为随访。
- bigP3BCI 改为 20 项研究内共 336 个 study-participant 条目；官方页未声明跨研究全局唯一人数。
- ALS EEG/eye-tracking 数据改为 176 人（6 ALS + 170 healthy）。
- ASCERTAIN、DREAMER、MAHNOB-HCI 从误列的睡眠健康移到认知与情感；ArithmeticTask 也属于一般认知，不进入疾病/健康重点时长。
- RestCog/Test-Retest 改为通用休息/认知状态；纯 BCI wake/sleep-like benchmark 不进入疾病/健康重点范围。
- NeuroAtlas 睡眠来源使用双轴：主目录仍可为“睡眠分期”，同时按临床患者或健康/人群队列纳入当前项目范围。

## 2026-08-11 前新增 19 项

| ID | 数据集 | 分类 | 受试者口径 | 文献总时长 |
|---|---|---|---:|---:|
| EEG-0583 | Albrecht2019 | 疾病/临床 | 78 | 51 h |
| EEG-0584 | Gruendler2009 | 健康/风险表型 | 46 | 22 h |
| EEG-0585 | Singh2020 | 疾病/临床 | 39 | 7 h |
| EEG-0586 | Singh2021 | 疾病/临床 | 120 | 58 h |
| EEG-0587 | HCHS/SOL PSG | 健康/人群 | 12,088 | 待 EDF 审计 |
| EEG-0588 | HAASSA | 健康/人群 | 717 | 待 EDF 审计 |
| EEG-0589 | ApoE Sleep | 健康/人群 | 712 | 待 EDF 审计 |
| EEG-0590 | nuMoM2b | 健康/人群 | 3,009 | 待 EDF 审计 |
| EEG-0591 | MNC | 疾病/临床 | 约 3,000 | 待 EDF 审计 |
| EEG-0592 | CPS | 疾病/临床 | 113 | 待 WFDB 审计 |
| EEG-0593 | LOFT-HF | 疾病/临床 | 161 baseline | 待 EDF 审计 |
| EEG-0594 | HBN-EEG Release 2 / ds005506 | 健康/人群 | 150 | 127.5 h |
| EEG-0595 | HBN-EEG Release 3 / ds005507 | 健康/人群 | 184 | 158.8 h |
| EEG-0596 | HBN-EEG Release 4 / ds005508 | 健康/人群 | 324 | 261.8 h |
| EEG-0597 | HBN-EEG Release 5 / ds005509 | 健康/人群 | 330 | 255.3 h |
| EEG-0598 | HBN-EEG Release 6 / ds005510 | 健康/人群 | 135 | 103.5 h |
| EEG-0599 | HBN-EEG Release 7 / ds005511 | 健康/人群 | 381 | 官方未给总时长 |
| EEG-0600 | HBN-EEG Release 8 / ds005512 | 健康/人群 | 257 | 179.1 h |
| EEG-0601 | HBN-EEG Release 9 / ds005514 | 健康/人群 | 295 | 210.8 h |

## TUEG 版本与重复口径

TUEG v2.0.2 下载作业复核：70,841 / 70,841 files，1,756,545,393,092 bytes，无 partial。14,987 patients 与 27,077.3 h 使用发布统计；时长来自 v2.0.1 审计，已在表内标注版本差异。

TUEG 是父库。TUAB、TUAR、TUEP、TUEV、TUSZ 和 TUSL 仍可单独展示任务，但不能再与 TUEG 相加。

## 复现

- `scripts/prepare_catalog.mjs`：加载旧总表与 2026-07-31 疾病下载审计，应用分类/人数修订，生成网页数据。
- `scripts/verify_metrics.mjs`：断言 556 个唯一 ID、57 个 raw signal 单元、TUEG 文件数、受试者和时长总数。
- `work_spreadsheet/build_final_workbook.mjs`：使用 artifact-tool 生成最终 XLSX。
- `work_spreadsheet/verify_final_workbook.mjs`：逐表检查、8 张渲染图和公式错误扫描。

所有官网与论文链接见工作簿“证据来源”工作表。
