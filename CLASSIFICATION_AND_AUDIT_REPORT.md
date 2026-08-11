# EEG Healthcare / Disease 分类与数量时长复核报告

修订日期：2026-08-10；最终复核：2026-08-11。

## 结论

总目录由 537 个唯一下载单元扩展到 556 个，本轮新增 19 个。Healthcare/Disease 重点视图包含 146 个单元。

当前已下载且确认存在 raw EEG signal 的主口径为：

| 口径 | 疾病/临床 | 健康/人群 | 合计 |
|---|---:|---:|---:|
| raw EEG 单元 | 53 | 4 | 57 |
| 受试者行计数 | 21,818 | 332 | 22,150 |
| raw EEG 时长 | 43,396.3 h | 231.5 h | 43,627.8 h |

19 个新增资源提供约 22,139 个受试者行计数，其中疾病/临床约 3,511、健康/人群约 18,628。加入后预计为约 44,289；按本地审计与新增行直接相加的可证实总时长下界为 45,062.6 h。新增资源中 EEG-Bench 的 4 项提供 138 h，HBN 的 7 个有可靠时长发布版提供 1,296.8 h；HBN Release 7 及其余大型 PSG 队列不以“人数 × 假设时长”估算。

直接从已下载内容观察到的受试者下界为 21,132。22,150 是文件观察与可信目录/论文回退后的 `participant-row count`；独立数据集之间是否包含同一参与者无法全面判定，所以不能称为全球唯一人数。

## 分类逻辑

采用双轴分类：

1. 主目录轴：保留研究任务，如睡眠分期、BCI、认知、情绪、运动。
2. 临床队列轴：区分疾病/临床、健康/人群、睡眠健康/PSG 与一般认知/BCI。

具体规则：

- 疾病/临床：正式诊断、患者招募、医院监测、治疗/预后或病例-对照研究。健康对照不改变研究的临床主属性。
- 健康/人群：健康参考、生命周期、流行病学、孕产妇、衰老或风险表型。
- 睡眠健康/PSG：主用途是睡眠分期或 PSG 队列；是否临床由第二轴表达，避免仅因出现 apnea 或患者就破坏任务目录。
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

## 新增 19 项

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
