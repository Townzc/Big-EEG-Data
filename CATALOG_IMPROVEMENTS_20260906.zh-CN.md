# 网站设计改进与目录复核记录

核查日期：2026-09-06（部分网络请求时间按 UTC 记为 2026-09-07）。范围为当前 EEG/fMRI 主目录、上次报告的重点候选、缺失数字的临床优先条目，以及相同来源/子集关系。不是对全球所有数据集完整性的保证。

## 本轮结果

| 模态 | 更新前 | 新增入口 | 合并重复入口 | 当前目录 | 有人数值 | 有小时值 |
|---|---:|---:|---:|---:|---:|---:|
| EEG | 564 | 6 | 1 | **569** | 540 | 273 |
| fMRI | 782 | 3 | 1 | **784** | 780 | 753 |

以上是逐行字段覆盖数。网页汇总会在当前筛选范围中按指标处理已确认父子集，因此汇总卡的覆盖分母可能小于目录条数。仍有 EEG 296 条、fMRI 31 条小时未知；没有用 0 填充。数据集行数、受试者条目数和全站独立人数不是同一概念。

## 已实施的设计与开发改进

1. **检索成为首页主体。** 缩短介绍区，EEG/fMRI 使用相同操作方式；原有下载进度、预处理方法与历史统计收进可展开区域，保留原有内容。
2. **筛选与汇总联动。** 选择疾病、类别或组合条件后，立即汇总全部匹配结果的条数、来源家族、已知受试者条目、已知记录小时、估算小时和访问方式；翻页不改变总量。
3. **按研究需求筛选。** 搜索支持名称、疾病中英文、常用缩写、DOI 和 accession；提供人群、访问条件、任务、人数、时长、证据类型及处理状态筛选。EEG 增加通道/采样率；fMRI 增加年龄区间、TR、场强、站点、BIDS、体积、纵向采集。年龄按区间相交匹配。
4. **详情与对比。** 详情区分人数、记录数、原始记录小时、本地已获取小时，展示版本、许可、证据与重叠说明；支持 2–4 条并排比较、相关数据跳转和 BibTeX 入口引用模板。
5. **可分享和导出。** 筛选、分页、详情与对比选择写入 URL，可刷新恢复。筛选导出包含全部结果；完整 CSV/JSON/XLSX 使用相同修订目录和版本。历史 563 行工作簿独立标注。
6. **更清楚地表达未知与估算。** reported、calculated、estimated、unavailable 分开；部分文件小时带范围说明。疾病主题不代表全部受试者确诊，估算数不标成完整实测值。
7. **减少首屏负担。** 当前索引独立请求，详情按需请求并缓存，历史大模块延迟加载。采用语义表格、分页、移动端样式、可聚焦横向滚动区域、原生 dialog、Escape 关闭和焦点返回；补充加载、失败、重试和无结果状态。
8. **统一维护与校验。** 原始数据快照不改写，修订/合并/关系集中管理；构建生成索引和导出，检查 ID、别名、来源、数值和关系目标。构建还检查工作簿版本，避免网页与下载文件不一致。
9. **修正自动审计盲点。** 公共文件扫描支持嵌套 BIDS 根目录、NIfTI-2、受限长度读取和同次采集的多回波合并；修复指定 accession 续跑可能丢失既有审计结果的问题。刷新年龄时不再把空值转为 0。

## 优先新增的数据

| 模态 / 入口 | 规模与用途 | 本轮证据和限制 |
|---|---|---|
| EEG：PD 静息态，EEG-NEW-0002 / ds008768 | 312 人（202 PD / 110 对照），358 条记录 | 357/358 个文件可读，约 **20.23 h 为部分范围**；1 个配套信号 HEAD 返回 404。旧死亡结局数据是已确认子集。[官方发布](https://openneuro.org/datasets/ds008768) |
| EEG：ValidPain2，EEG-NEW-0003 / ds008115 | 公开 participant 表 180 人；重症患者伤害性感受研究 | 论文 196 人与发布版 180 人分开。EDF 路径可见，但 S3 访问未确认，小时未知。[发布者](https://github.com/OpenNeuroDatasets/ds008115)、[原论文](https://pubmed.ncbi.nlm.nih.gov/40245519/) |
| EEG：OSA，EEG-NEW-0004 / ds008108 | 142 人，夜间 PSG 共 **1,119.61 h** | 142/142 EDF 头部全量计算。同源 fMRI 只有 124 人/124 BOLD、**15.89 h**，已修正；不同时间点，未标成同步 EEG-fMRI。[官方发布](https://openneuro.org/datasets/ds008108) |
| EEG：抑郁症状分层，EEG-NEW-0005 / ds003474 | 122 人，概率选择/学习任务 | BDI 高低分层，不能全称 MDD 患者。发布信号已做部分通道插值，时长未知。[发布者](https://github.com/OpenNeuroDatasets/ds003474)、[论文](https://doi.org/10.1162/cpsy_a_00024) |
| EEG：HBN Release 10、11，EEG-NEW-0006/0007 | 分别 533、430 人 | 全部 11 个发布的公开 participant 标签交集检查为 0；归于 HBN 来源家族。Release 11 的信号访问待确认，两版小时未知。[Release 10](https://openneuro.org/datasets/ds005515)、[Release 11](https://openneuro.org/datasets/ds005516) |
| fMRI：ADHD Dualcontrol，ds005899 | 61 人（26 ADHD / 35 对照），9–12 岁，**10.66 h** | 发现嵌套 openneuro/sub-*，全部 122 BOLD 头部计算。[发布者](https://github.com/OpenNeuroDatasets/ds005899) |
| fMRI：BrainLat，brainlat | 神经退行性疾病静息态 BOLD | 论文确认模态存在，提供受控获取入口；模态特定人数/小时未确认，保留未知，与 EEG 共用来源家族。[原论文](https://www.nature.com/articles/s41597-023-02806-8) |
| fMRI：THINGS-fMRI，ds004192 | 3 人、高密度重复采集，**50.00 h** | 435 BOLD 文件头全部读取；与 THINGS-EEG 不作为同模态重复。[发布者](https://github.com/OpenNeuroDatasets/ds004192)、[原论文](https://doi.org/10.7554/eLife.82580) |

## 缺失数字与版本再次核查

| 数据 | 修订结果 |
|---|---|
| NMT / EEG-0106 | 原论文明确 2,417 名独立受试者、约 **625 h**、19 通道/200 Hz，补入旧版小时。明确限定 NMT v1.0 原论文口径。[原论文](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.755817/full) |
| NMT-4K 相关新版 | 发现 v1.2 受控发布，4,500 条/独立受试者，3,336 normal + 1,164 abnormal；公开 API 未列信号文件，未核对与旧 NMT 交集。已在原条详情加入新版来源和单独规模证据，暂不另建行累加。[Zenodo](https://zenodo.org/records/21405022)、[作者说明](https://github.com/dll-ncai/NMT-4k-EEG-Dataset) |
| HMC / EEG-0125 | v1.1 清单 151 个 EDF，逐头计算 **1,144.22 h PSG**。不下载完整信号，不按通道数乘小时。[官方发布](https://physionet.org/content/hmc-sleep-staging/1.1/) |
| PD 死亡结局 / EEG-0093 | 94/94 头部计算 **4.11 h**；与新 PD 库建立子集关系。[发布入口](https://openneuro.org/datasets/ds007020) |
| EPILEPSIAE / EEG-0011 | 补回原论文 275 人。全库、头皮/iEEG 混合范围与常见 30 人子集不混用，当前可获取范围小时仍未知。[原论文](https://pubmed.ncbi.nlm.nih.gov/22738131/) |
| BrainLat / EEG-0102 | 删除把全模态 780 人当作 EEG 人数的旧值。论文表 4 与表 5 对 PD 人数有 1 人差异；10 分钟闭眼 EEG 也不等于包含准备的整个访视时间，等待实际发布清单。[原论文](https://www.nature.com/articles/s41597-023-02806-8) |
| HSP / EEG-0127 | 更新到 v3.0：90,166 为含 PSG/HSAT 的全体患者，119,234 条中 115,129 PSG、4,105 HSAT。EEG 独立人数及新版小时未单列，不能套用旧版 190,732 h。[官网](https://bdsp.io/content/hsp/3.0/) |
| HEEDB / EEG-0012 | 持续按团队口径归睡眠，保留临床属性。v4.1 官方人数 109,178、记录 284,343；约 330 万小时来自未绑定该版本的官方比较，详情单独说明。[v4.1](https://bdsp.io/content/harvard-eeg-db/4.1/)、[官方比较](https://bdsp.io/content/nf89816gtxbon11kbr9a/1.0/) |
| MORGOTH 12 个任务条目 | 补官网记录数与核查日期；不把 10 秒片段或训练文件数乘患者数当整库小时。HEEDB 预训练/训练/测试保持派生关系。[官方 Table 1](https://bdsp.io/content/morgoth1/1.0.0/) |
| CPS / EEG-0592 | 修复指向个人设置页的错误链接；官网 113 次 PSG 不直接当 113 个独立人，人数/小时未知。[真实数据页](https://physionet.org/content/cps-dataset-sleep/1.0.0/) |
| UCLA ds000030、CAT-D ds004627、NARPS ds001734 | 各抽 3 人全部 runs，恢复估算值 **225.86 / 117.67 / 54.36 h**；保留 estimated。CAT-D 40 个 BOLD 文件对应 16 次采集，已去多回波重复，不当 40 次扫描。[UCLA](https://openneuro.org/datasets/ds000030)、[CAT-D](https://openneuro.org/datasets/ds004627)、[NARPS](https://openneuro.org/datasets/ds001734) |
| CAUEEG、ADHD EEG-0053、ADSZ EEG-0493 | 再查后仍没有与当前发布范围一致的整库小时，保留未知与复核备注；尤其不将诊疗/实验总时间代替 EEG 信号时间。 |

## 重复与重叠的处理

- **确认合并两组。** Mainsah2025 / EEG-0488 与 bigP3BCI / EEG-0064 为同一 PhysioNet DOI 发布；前者归为别名。ds002366 的 136 个 BOLD 路径及 Git blob SHA 全部包含在 ds002620，旧 accession 保留为别名。[bigP3BCI](https://doi.org/10.13026/0byy-ry86)、[ds002366](https://github.com/OpenNeuroDatasets/ds002366)、[ds002620](https://github.com/OpenNeuroDatasets/ds002620)
- **保留任务但控制汇总。** TUH 6 个子集、HEEDB/MORGOTH 派生任务以及 Iowa PD 死亡结局子集建立母库关系。PD 的 94 个信号均与新库 S3 ETag 和字节数匹配；母库不在筛选结果中时，子集仍有自己的规模。
- **不误删不同采集。** CSF 三个同名条目分别增加 7T/3T/同步采集限定；TOAM 标明 small-FOV / whole-brain。
- **部分重叠继续明示。** AHDC 两份发布有 114 个共同 participant 标签，尚不能等同扫描重复；rewardBeast 同名任务、I-CARE/HEEDB 等也不整条扣除。没有宣称已完成全站独立受试者去重。

## 验证与交付边界

- Vinext 生产构建、Vercel 构建通过；21 项回归测试通过，包括分类、筛选汇总、缺失值、父子集、旧别名、导出、深链接、NIfTI-2 与多回波计算。
- ESLint、TypeScript 检查通过；补充 Cloudflare 运行时声明，保留未配置 D1 时的运行时检查。
- 当前 XLSX 3 个工作表已渲染检查；569 × 36 和 784 × 36 数据单元逐项与 JSON 对照，汇总公式缓存与版本一致，无公式错误。
- 原始 `public/catalog-data.json` SHA-256 保持 `2945590BBA5D852A1A838431C6861B7BE0623F4BAAC63CC5D3DE83F10D7F54D9`。
- 本轮没有运行浏览器点击/截图验收，响应式、焦点与复制行为仍需真实浏览器验收。历史模块仍有大块构建警告，已延迟加载；本轮没有测量 Core Web Vitals。
- 代码与目录文件已在本地完成，未提交、推送或发布到线上。历史 fMRI 自动长尾导入仍有“可读时长头”准入条件；本轮修订层已支持 BOLD 存在而时长未知的条目，后续应统一这个准入规则。

## 下一步建议（优先级）

1. **临床数据证据补齐。** 优先申请/核实 NMT-4K、BrainLat、HSP 的模态清单和版本范围，以及 ValidPain2/HBN 11 的信号访问；按清单确认独立人、文件交集与小时后再更改规模。
2. **提高估算可靠性。** 优先对疾病相关 fMRI 扩大受试者抽样，回扫历史多回波条目；给估算范围增加样本覆盖和变异度，避免只展示单个点估计。
3. **做真实使用验收后发布。** 重点验证手机布局、键盘操作、刷新恢复、对比返回和导出；再进行本次版本上线。后续加入链接/版本定期检查与审阅队列，而不是每次建站自动抓取并纳入新库。
4. **继续候选队列。** learning-habits ds008039 本次 210 个 BOLD 头请求均 403，CNeuroMod 等非疾病候选暂列后续；ds008082、ds004362 先按可能镜像处理，不直接新增。

源码入口：`data/catalog-revisions.json`（54 条修订记录、2 次归并、16 条有向来源关系），`data/catalog-revision-evidence.json`（文件计算与覆盖摘要），`data/catalog-duplicate-evidence.json`（136 条 BOLD 身份与 94 条 PD 信号匹配证据），`scripts/curate_20260906.mjs`（本轮策展步骤）。当前目录版本以 `data/catalog-manifest.json` 为准。
