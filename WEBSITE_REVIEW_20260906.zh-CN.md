# Big Data 网站复核：设计、HEEDB 分类、重复与遗漏

核查日期：2026-09-06（America/Los_Angeles）。仓库：Townzc/Big-EEG-Data；核查起点 HEAD 为 `bda28b56585689e1bce00ac78553d591ea2999bb`，同时检查了工作区已有的未提交改动。网站目录规模为 **564 EEG 条目、782 fMRI 条目**。

本轮完成 HEEDB 团队分类修改；其余界面改进、重复项合并、候选补录均只报告。没有删除目录条目、下载研究信号或更改服务器文件。尚未推送或发布线上网站。

## 1. 先做哪些设计改进

### 数据使用者视角

| 优先级 | 当前问题及具体证据 | 建议和验收标准 |
|---|---|---|
| P0 | EEG 点击大类/小类后只有筛选行数，没有当前结果的人数、时长。fMRI 有总量卡，但 `sumKnown()` 始终读取全库，三个聚合 `useMemo` 的依赖为空，不随筛选变化。 | 在筛选器与结果表之间固定显示“当前筛选汇总”：数据集数、已知受试者条目、已知记录小时、公开下载数、未知字段数；对疾病、搜索、访问方式的所有组合使用同一结果集，统计全部匹配结果，不能只统计当前页。 |
| P0 | “医疗与疾病大类”和重点清单的“疾病/临床”并非同一分母；睡眠任务也可能来自临床患者，HEEDB 又采用团队自定义归类。 | 把团队目录、疾病标签、任务、研究人群拆开显示与筛选；例如“睡眠任务 / OSA / 临床患者”可同时存在。说明“疾病标签内人数”是全队列人数还是确诊患者人数。 |
| P0 | 人数可能是受试者、patients、study-participant entries 或整个队列；小时也可能是整库、部分已下载文件或抽样外推。 | 将“人数”“记录/session 数”“原始记录小时”“本地已获取小时”分开；每个数值带版本、范围和证据。只有有跨队列身份映射时才显示“去重人数”；否则使用“受试者条目数（可能重叠）”。 |
| P1 | EEG 缺少人数/时长区间、通道数、采样率、raw/processed 等筛选；fMRI 的年龄筛选实际是字符串包含，输入 20 并不表示年龄区间覆盖 20 岁。 | EEG 加可组合数值筛选与“包含未知值”；fMRI 年龄改为数值区间相交判断。疾病和任务提供中英别名，例如 PD / Parkinson / 帕金森能找到相同记录。 |
| P1 | EEG 首页资料很长，默认一页只有 5 行；fMRI 每页 20 行，交互习惯不一致。EEG 长证据文字直接塞在表格行里。 | EEG 默认 20–50 行，保留页长选择；把证据和限制放入详情面板，列表保留选库所需字段。fMRI 已有详情面板，可复用这一模式。 |
| P1 | 缺少把几个候选并排比较、保存筛选、将当前结果交给合作者的完整流程。筛选和所选数据集仅存在组件状态，刷新/复制链接不能复现。 | 提供 2–4 个数据集对比；筛选写入 URL，详情有稳定链接；“导出当前结果”与“下载完整历史工作簿”明确区分。 |
| P1 | 下载清单是 147 个重点单元，XLSX 是原始 563 行快照，而网页是 564 行且有额外时长证据。现在“下载总表”容易让人期待和网页完全一致。 | 从同一份当前目录自动生成 JSON/CSV/XLSX；历史快照单独标日期。此次只同步 HEEDB 分类，网页与工作簿的其他历史差异仍待处理。 |
| P2 | 来源链接有些指向门户/注册页，访问步骤、许可、是否需要申请容易与可直接获取混淆。 | 数据集详情分别给数据页、申请页、下载说明、license/DUA、核查日期；提供可引用的 dataset DOI/BibTeX，不将论文 DOI 当作数据集唯一身份。 |

**建议的疾病筛选汇总形式**：选“癫痫”后展示 `匹配数据集 N`、`已知受试者条目 S（K/N 有值，可能重叠）`、`已知记录时长 H（K/N 有值）`、`其中估算时长 E`、`可公开获取 M`。父子集重叠单列提醒，未知值不能写成 0。列表换页不改变这些数值。

### 专业开发者视角

| 优先级 | 当前实现缺陷 | 改进措施 |
|---|---|---|
| P0 | 目录 JSON、时长叠加文件、`eeg-progress.ts` 静态人数、网页说明、CSV、XLSX 各自维护；分类改一处会导致汇总和导出不同步。 | 建立统一的当前目录生成步骤；输入保留原始版本和修订，输出网页与导出文件。人数改为可校验的数值 + 范围 + 计数单位，展示文字不参与统计。 |
| P0 | fMRI 校验只阻止重复内部 ID，不检查“不同 accession、同一信号子集”；EEG 的父子重叠目前主要依赖手工 ID 集合。 | 添加 `datasetFamilyId`、`releaseId`、`subsetOf`、`aliasOf`、`overlapWith`。分别记录队列重叠和信号文件重叠；汇总按当前筛选范围决定扣除项。此次 HEEDB/I-CARE 的联动就是必要示例。 |
| P0 | `refresh_openneuro_fmri_index.mjs` 把 MRI + 非空 task 当成 fMRI 候选；MRI 可能只有结构像，task 来自 MEG/EEG。候选里实际出现 MEG 项目。 | 候选阶段保留不确定性；使用公开文件清单确认 `/func/*_bold.nii*`。存在 BOLD 与有可信时长应是两个状态，不能因为时长未知而把有效数据集从目录排除。 |
| P0 | 时长扫描固定查 `accession/sub-ID/`。ADHD Dualcontrol 的文件实际在 `ds005899/openneuro/sub-ID/func/`，因此 61 人、122 个 BOLD 文件的有效数据未进主表。 | 先发现 BIDS root，再扫描受试者；支持合理嵌套目录和多根。失败原因拆分为“无 BOLD”“根目录未解析”“格式不支持”“网络失败”“时长未知”。 |
| P1 | 当前 fMRI 749 个有时长条目中，734 个被标成 estimated；大量长尾只抽取 1 人。显示 evidence 是优点，但聚合仍容易被误读为确定规模。 | 汇总分开 reported/calculated/estimated；对多 session、纵向和复杂协议分层抽样。增加抽样覆盖率，不凭 1 人外推就宣称精确总时长。 |
| P1 | 20 个 fMRI DOI 字段不是规范的裸 DOI：包括 `#`、`[under revision]`、OSF URL、论文题名、多 DOI 拼接等；其中多项会被详情拼成无效 doi.org 链接。 | DOI 使用结构化列表及严格格式验证，保留原始文本作为备注；项目/论文/数据集 DOI 分开。不能把空串经 `Number()` 转成 0 岁等数值。 |
| P1 | 刷新脚本与元数据有硬编码核查日期，部分 API 数据缺失仍继续生成；“已核查”可能覆盖不同层级。 | 自动写执行时间，保留来源版本和错误清单；区分“官网协议复核”“仓库元数据核对”“文件头核对”“完整文件审计”。失败不能更新成成功核查日期。 |
| P1 | 前端包含完整 fMRI 目录与丰富证据数据，构建已提示大 chunk；还没有基于浏览器实测的性能结论。 | 列表使用精简记录，详情按需载入，必要时服务端筛选/分页；用真实浏览器测传输体积、输入响应和首屏，再决定优化，不仅凭源码推断具体延迟。 |
| P1 | 现有测试主要检查服务端 HTML 和固定文案；没有覆盖筛选后的汇总、导出一致性和跨 accession 重叠。 | 增加基于真实用户行为的回归：组合筛选、分页不改变汇总、未知值、父子数据集、导出与屏幕一致。本次新增分类联动测试，其余交互测试待界面改进时补。 |
| P2 | fMRI 弹窗有 Escape 关闭和 `aria-modal`，但没有看到初始焦点、焦点圈定及关闭后焦点恢复。 | 补键盘焦点管理；以实际浏览器/辅助技术验证移动端横表与放大阅读。本轮没有做浏览器视觉或键盘测试。 |

## 2. HEEDB 已按确认的团队口径调整

官方 [HEEDB v4.1](https://bdsp.io/content/harvard-eeg-db/4.1/) 明确包含 routine EEG、EMU、ICU/LTM；[HSP](https://bdsp.io/content/hsp/3.0/) 是另一睡眠项目。项目负责人确认“确实是 HEEDB，按团队口径归入睡眠”，因此网站执行自定义分类，同时保留官方临床属性说明，未将临床信号描述改写成 PSG。

| 项目 | 修改前 | 修改后 |
|---|---:|---:|
| HEEDB（EEG-0012）大类/小类 | Healthcare and Disease / Epilepsy and Abnormalities | Consciousness and State / Sleep Staging |
| 重点下载清单分组 | 疾病/临床 | 睡眠 |
| 医疗与疾病大类 | 97 | 96 |
| 意识与状态大类 | 63 | 64 |
| Sleep_Staging 小类 | 31 | 32 |
| 疾病/临床汇总单元 | 110 | 109 |
| 疾病/临床有逐行时长单元 | 76 | 75 |
| 疾病/临床已知时长，既有重叠处理口径 | 3,785,081.5 h | 541,757.5 h |
| 全目录来源级既有估计 | 3,821,689.4 h | 不变 |
| 全目录逐行小时相加 | 4,033,202.7 h | 不变 |
| 医疗大类受试者条目下界 | 187,200 | 87,200 |
| 意识与状态受试者条目下界 | 47,224 | 147,224 |

疾病时长变化是 **旧值 − 3,300,000 + 56,676**，不是只减掉 HEEDB。HEEDB 移出疾病范围后，I-CARE 不应继续因为这个范围外的父库而被扣除；全目录范围仍保留 HEEDB/I-CARE 的原有保守重叠处理。330 万小时是既有官方比较页提供的近似整库规模，不是本次新做的精确文件审计。这些总量尚未吸收本报告新发现的其他重复/重叠问题。

人数迁移使用原始快照的 `100,000+` 下界 100,000，未在分类任务中擅自换用 HEEDB v4.1 的另一发布计数；全目录仍为 270,544 个受试者条目下界。原始 JSON 和历史工作簿保留；当前网页通过分类修订层读取。CSV 及当前 XLSX 已同步分类，历史服务器路径不变。

## 3. 重复与重叠检查

### EEG

扫描 564 行的内部 ID、规范化名称、OpenNeuro accession、URL 与 DOI。没有重复内部 ID、完全同名或重复主 accession；这**不能证明独立数据源已经全部去重**。184 行没有稳定标识，仍需补足来源身份。

| 条目 | 结论 | 证据及建议 |
|---|---|---|
| EEG-0064 bigP3BCI / EEG-0488 Mainsah2025 BigP3BCI family | **确认同源重复建档** | 同为 `10.13026/0byy-ry86`，同一个 PhysioNet v1.0.0；MOABB 的 Mainsah2025 是该库的 A–S2 研究适配器。保留 EEG-0064，把 EEG-0488 变为别名/工具入口；保留两个学科标签。[原始数据](https://physionet.org/content/bigp3bci/1.0.0/)、[MOABB 官方更新记录](https://moabb.neurotechx.com/docs/whats_new.html)。当前第二行时长为空，不能因此声称总小时已经多加了 267 h。 |
| EEG-0582 TUEG 与 TUAR/TUEP/TUEV/TUSL/TUSZ/TUAB | **父子集，不能独立累加** | TUAR（EEG-0004，99.98 h）也是 TUEG 子集，当前疾病扣除列表只有另五个子集，且全目录来源总量另走历史并集公式。需要统一到父子关系图，逐项核对 TUAR 是否已在历史并集中扣除，不能直接再减一次。[TUH 官方目录](https://isip.piconepress.com/projects/nedc/html/tuh_eeg/index.shtml)。 |
| HEEDB 与 MORGOTH HEEDB-Pretrain/Test/Train、I-CARE | **母库/衍生任务/站点重叠关系** | 同一 BDSP 门户或站点不等于整条重复。MORGOTH 的多个任务应保留任务入口，但不能与母库作为互不重叠人数相加；I-CARE 当前整行保守扣除只是上界式处理，未精确解决医院之外的非重叠记录。[MORGOTH 发布页](https://bdsp.io/content/morgoth1/1.0.0/)、[HEEDB](https://bdsp.io/content/harvard-eeg-db/4.1/)。 |
| HSP / PN2026（EEG-0127 / EEG-0604） | **挑战赛与来源家族关联，待细分重叠** | PN2026 稳定标识引用 HSP DOI，不是两个完全独立队列的证明；按来源家族处理，保留挑战任务。[挑战官网](https://moody-challenge.physionet.org/2026/)。 |
| DOD-H / DOD-O | **不能按相同 DOI 删除** | 同一 Zenodo 发布下的健康与阻塞性队列，应保留子队列属性。[数据发布](https://zenodo.org/records/15900394)。 |
| Shin EEG-NIRS cognitive / Shin2017B | **相同门户，实际不同研究** | 前者为 2018 年认知任务、26 人，后者为 2017 年 mental arithmetic、29 人。不是同一 URL 就等于重复。[MOABB Shin2017B](https://moabb.neurotechx.com/docs/generated/moabb.datasets.Shin2017B.html)。 |
| SEED-VLA / SEED-VRW；音乐 BCI calibration/testing/training；RSVP exp1/exp2 | **共享论文的实验/阶段，不能仅凭论文 DOI 合并** | 这些组合在自动 DOI 查重中命中，需要保留实验身份，再单独评估受试者复用；不是确认重复建档。 |

### fMRI

扫描 782 行，没有重复内部 ID 或跨行重复主 accession。发现 **5 组同名、涉及 11 行**；按公开 README、participants.tsv 和 Git 文件清单进一步核对如下。证据文件及来源 Git commit 已保存于本地审计目录，可复算。

| 同名组 | 结论 | 具体证据及处理建议 |
|---|---|---|
| ds002620 / ds002366：Emotion regulation in the Ageing Brain | **确认 BOLD 子集重叠** | ds002620 有 82 个信号目录、327 个 BOLD；ds002366 有 34 个、136 个。后者全部 136 个 BOLD 路径及 Git blob SHA 与前者一致，链接指向同一组内容寻址对象。建议前者作 canonical，后者记为子集/别名；当前相加重复了该子集的 34 个 subject entries、15.94 h 目录估计。此外，母集 participants.tsv 只有 34 行，与 82 个信号目录不一致，人数元数据也需要复核。这里不是重新下载信号做哈希。[ds002620](https://github.com/OpenNeuroDatasets/ds002620)、[ds002366](https://github.com/OpenNeuroDatasets/ds002366)。 |
| ds005896 / ds005901：AHDC | **同一纵向研究、受试者部分重叠；不能整条删除** | 两边信号目录分别 262/120 人；同一研究内有 114 个相同 participant 标签；BOLD 链接没有相同 Git blob SHA。人数标签并集为 268，不应把 382 当独立人数；需要按波次/记录时间/扫描进一步决定时长是否重叠。现有人工条目备注声称已避开小发布版，但自动长尾又把它加了回来。[ds005896](https://github.com/OpenNeuroDatasets/ds005896)、[ds005901](https://github.com/OpenNeuroDatasets/ds005901)。 |
| ds002316 / ds002738：rewardBeast | **待确认关系，不自动合并** | 两者都写 36 人，但 README 描述的任务内容不同；ds002738 明确说明由旧 ds001393 重传，不能据此推断它就是 ds002316 的镜像。应比较两者 signal manifest、任务和 session。[ds002316](https://github.com/OpenNeuroDatasets/ds002316)、[ds002738](https://github.com/OpenNeuroDatasets/ds002738)。 |
| ds004484 / ds004493 / ds004478：CSF-flow visual stimulation | **同论文下不同实验，保留** | README 分别说明 20 人 7T、16 人 3T、6 人同步 EEG-fMRI；不能因为标题一样删除。建议标题增加实验/场强后缀。[7T](https://github.com/OpenNeuroDatasets/ds004484)、[3T](https://github.com/OpenNeuroDatasets/ds004493)、[EEG-fMRI](https://github.com/OpenNeuroDatasets/ds004478)。 |
| ds006265 / ds006266：TOAM | **不同采集组，保留** | 各 20 人，participant 标签无交集、BOLD 链接无交集。作者仓库明确分别链接 small-FOV 与 whole-brain 两组。建议加组别后缀。[作者仓库](https://github.com/TomW92/TOAM-fMRI)。 |

现有 fMRI 代码已合并三对镜像 accession：ds006105←ds006108、ds003988←ds003872、ds007272←ds006798。本轮仍保留这些既有合并，不把它们算成新发现问题。

EEG 和 fMRI 两边同时命中 **14 个 accession**，这通常是多模态数据在两个入口中的正常呈现。未来全站统计应按数据源计一次；不同模态的信号小时必须分别计算，不能混为一种测量。

## 4. 没收全的数据：先列候选，不录入

### 系统检索范围与局限

- 重新分页查询 OpenNeuro 官方公共 API：EEG 返回 452 个节点；MRI 返回总数 1,157，成功得到 1,154 个节点，另 3 个存在部分字段/API 错误。
- 沿用项目当前的候选筛选逻辑后得到 EEG 419、MRI 864 个候选 accession；与网站主 URL/稳定 accession 比较，分别有 **246、135 个未匹配 accession**。
- **246/135 是待核查入口差集，不是确认遗漏的独立数据集数。** 其中可能是已有数据的镜像、新版本、多模态中非目标信号、测试数据或没有可用 BOLD 的 MRI。EEG 这一遍也沿用了原脚本的非空 task 等条件，不代表所有公开 EEG；不能据此声称全球收全。
- 旧 fMRI 索引有 126 个 accession 未进入主表，说明“已发现但未展示”和“完全没有发现”需要区分。鲜活索引和旧快照计数变化不等于有数据被本次删除。
- 没有扫描服务器原始信号，不能由此判断哪些候选已经在服务器其他目录下载。本轮数据身份依据来自公开元数据和文件清单；没有为候选估算新时长。

### 优先候选清单

| 模态 | 候选 | 已核对的规模/存在性 | 当前缺口及后续注意 |
|---|---|---|---|
| EEG | **HBN EEG Release 10 — ds005515** | 官方快照 533 个 BIDS participants；公开 Git 信号目录也覆盖 533 个标签 | 网站只有 Release 1–9；这是同一 HBN 家族的新发布单元，需与前九批做参与者/文件交集，不先假定人数全新增。[数据源](https://github.com/OpenNeuroDatasets/ds005515)。 |
| EEG | **HBN EEG Release 11 — ds005516** | 官方快照 430 个 BIDS participants，确认存在 EEG `.set` 文件 | 同上，优先补齐系列；不在本轮新增。[数据源](https://github.com/OpenNeuroDatasets/ds005516)。 |
| EEG | **Resting-State EEG in Parkinson's Disease and Healthy Controls — ds008768** | API 312 个 participants；公开 S3 清单实际有 BrainVision EEG 文件 | 2026 发布候选，适合疾病/静息态方向；需再核对患者/健康分组和与既有 PD 队列关系。[数据页](https://openneuro.org/datasets/ds008768)。 |
| EEG | **ValidPain2 — ds008115** | API 180 个 participants；完整公开清单 180 个 EEG EDF | ICU 疼痛/伤害性感受候选；不要把仪器性能实验自动等同某一种确诊疾病。[数据页](https://openneuro.org/datasets/ds008115)。 |
| EEG | **OSA multimodal dataset — ds008108** | API 142 个 participants；同一公开目录可见夜间睡眠 EEG EDF 及午睡后 resting BOLD | **网站 fMRI 已有，EEG 入口遗漏**。宜共享一个源身份、增加 EEG 可发现性；夜间 EEG 与午睡后 fMRI 不能因同一 accession 就标为同步采集。[数据页](https://openneuro.org/datasets/ds008108)。 |
| EEG | **HSP v3.0** | 官方 90,166 patients、119,234 recordings；其中 115,129 PSG、4,105 HSAT | **现有 HSP 条目版本落后**，网站仍用旧 18,973 人/SleepFM 190,732 h。应该更新发布版关联，而不是加一个不重叠母库。HSAT 不能自动计为有 EEG；新整库精确小时未核实。[官方发布](https://bdsp.io/content/hsp/3.0/)。 |
| fMRI | **THINGS-fMRI — ds004192** | 3 人，每人 12 sessions，8,740 个独特图像；官方 README 确认功能 MRI、localizers 和 rest | 当前 fMRI 主表及旧候选索引均未包含该 accession；EEG 的 THINGS-EEG1/2 不能替代 fMRI。[官方数据仓库](https://github.com/OpenNeuroDatasets/ds004192)。 |
| fMRI | **CNeuroMod / CNeuroMod-THINGS** | CNeuroMod-THINGS 原始论文：4 人、每人 33–36 sessions，高密度自然图像任务 | 当前目录没有该家族。建议一个 CNeuroMod 父记录，THINGS/Friends 等任务作关联子记录，防止同六人核心队列在不同任务重复计人；具体访问条件按官方当前发布核对。[原始论文](https://www.nature.com/articles/s41597-026-06591-y)、[项目文档](https://docs.cneuromod.ca/)。 |
| fMRI | **ADHD Dualcontrol — ds005899** | 61 个 participants，公开清单确认 122 个 BOLD | 已在候选索引，因嵌套 `openneuro/sub-*` 被扫描漏掉。应修扫描并以时长 Unknown 保留候选状态，而不是重搜/重复登记。[数据页](https://openneuro.org/datasets/ds005899)。 |
| fMRI | **learning-habits — ds008039** | API 70 个 participants，公开 S3 清单确认有 learning/test BOLD runs | 2026 候选，主表没有；需补协议、年龄、来源和版本，再决定入库。[数据页](https://openneuro.org/datasets/ds008039)。 |

**不作为确定新增的例子**：ds008082 与现有 EEG-0533（ds007823）均为 COVID-19 survivors/close contacts 数据，名称及抽查的 CUCOV participant 路径高度一致，需要先查新镜像/重发关系。ds004362 的名称为 PhysioNet EEG Motor Movement/Imagery，可能只是现有 EEGMMIDB 的 BIDS 镜像。MRI 候选中的 MEG 项目也不能当作确定 fMRI 缺口。BOLD5000（ds001499）和 BOLD Moments（ds005165）已在现有主表，本轮没有重复推荐。

## 5. 建议实施顺序及本轮验证

1. **先修统计口径和数据身份**：当前筛选汇总；团队目录/任务/疾病/人群分开；统一源身份、父子集与范围内重叠规则。
2. **再修检索与可复现使用**：EEG 数值筛选、真实年龄区间、URL 保存筛选、详情/对比、当前结果导出。
3. **最后按优先级补数据**：先 HBN 10/11、OSA 的 EEG 入口、THINGS-fMRI、CNeuroMod，再核对新的临床/行为候选。HSP 作为版本更新处理。所有补录需保留候选证据与重复关系。

本轮已验证：生产构建成功；11 项测试通过，包括 EEG/fMRI 服务端渲染、原始 JSON 字节不变、HEEDB 分类/清单/类别人数/疾病时长联动；ESLint 通过。工作簿修改前后已渲染核对，原有 3 张工作表、表格、合并区域和数据验证等结构保持；既有单元格仅 6 处目标变化，另追加 1 行修订记录。XLSX 仍为 563 行历史数据主体，网页仍为 564 行，fMRI 仍为 782 行。

审计脚本位于 `scripts/review_catalog_integrity.mjs` 等 `review_*` 文件；机器结果、官方元数据、Git 树证据和候选差集存于 `outputs/catalog-review-20260906/`。这些核查不等于浏览器交互测试、逐条下载可用性测试或全服务器信号哈希去重。公开页面可读/API 存在也不保证已获受控库权限。
