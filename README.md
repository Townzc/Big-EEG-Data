# BIG DATA · EEG + fMRI

统一的公共脑数据集门户：`/` 保留原有 EEG 数据集总表、下载清单与工作簿功能，`/fmri` 提供来源可追溯的公共人类 fMRI 数据集目录。网站名称已从 **Big EEG Data** 更新为 **Big Data**，两个页面分别为 **Big Data of EEG** 与 **Big Data of fMRI**。

原 EEG 数据文件 `public/catalog-data.json` 没有改动；当前 SHA-256 为 `2945590BBA5D852A1A838431C6861B7BE0623F4BAAC63CC5D3DE83F10D7F54D9`。原 EEG 工作簿、下载清单、分类和统计口径继续保留。

## Portal 架构

- EEG 页面：`app/page.tsx`，继续读取 `public/catalog-data.json`，沿用既有 `CatalogExplorer` 与 `DownloadChecklist`。
- EEG 首页先展示完整目录、疾病/健康下载清单和研究对照，最后才展示“数据预处理”；完整总表与下载执行清单默认均为每页 5 行，仍可分页浏览全部数据。
- fMRI 页面：`app/fmri/page.tsx`；交互目录与详情面板位于 `app/fmri/FmriExplorer.tsx`。
- 模态切换：`app/ModalitySwitcher.tsx`，在 EEG / fMRI 页面共享。
- fMRI 完整 schema：`data/fmri-schema.ts`。
- fMRI canonical catalog：`data/fmri-catalog.ts`。同一队列的 OpenNeuro、DataLad、NITRC、云镜像和机构入口记录在一个条目里，不按镜像重复建行。

## fMRI 目录范围

当前目录收录 **782 个 canonical fMRI 数据集/队列**：97 个为逐项核对官网/论文的 protocol-reviewed 核心条目，685 个为去重后补入、并实际读到 BOLD NIfTI header 的 OpenNeuro 长尾条目。两种核查层级在网页和 schema 中明确区分。覆盖：

- HCP Young Adult、HCP Development、AABC/HCP Aging、BCP、dHCP，以及 HCP-EP、BANDA、PDC、DCAM 等疾病相关 HCP 项目；
- ABCD、HBCD、UK Biobank、ADNI、OASIS-3、CamCAN、NKI-Rockland、Healthy Brain Network；
- 1000FCP、ADHD-200、ABIDE I/II、COBRE、SchizConnect 下的 FBIRN Phase II 与 MCIC、PING、PNC、IMAGEN、CoRR、GSP；
- Midnight Scan Club、Natural Scenes Dataset、StudyForrest、IBC、Narratives 等高密度/自然刺激数据；
- OpenNeuro 公共人类 fMRI 全量候选索引。发现阶段使用 OpenNeuro 公共 GraphQL API v5.6.0，检查所有公开 MRI 条目，保留至少一个 BIDS participant 且带 BOLD task 的数据，随后排除 derivatives、非人类、phantom、脊髓和明显 test/demo 占位数据；本次快照得到 874 个候选 accession。自动进入主目录的条目还必须实际读到 BOLD NIfTI header；再与人工 catalog 按 accession 去重，并合并 3 个元数据与字节规模一致的镜像 accession。
- REST-meta-MDD、ABCD、UKB、ADNI 等 foundation-model / review paper 中反复出现的人群与临床队列；并保留访问限制、模型论文实际样本数与官方发布人数之间的区别。

目录优先使用项目官方网站、官方 repository metadata 和原始 dataset paper。`Last Verified` 当前为 2026-08-30。受试者数可能指发布人数、BIDS participants 或整队列人数；每条记录的 Notes / Limitations 会说明它是否等同于可用/QC-passed fMRI 人数。

## fMRI 标准 schema

每个 `FmriDataset` 都包含下列固定分组，缺失值显式使用 `null` / `Unknown`，不会用 0 代替：

- `identification`：名称、缩写、官网、repository、所有 access URL、paper/DOI、机构和地区；
- `scale`：subjects、sessions、fMRI runs、总分钟/小时、每受试者小时数、数据容量；
- `fmriComposition`：rest、task、movie/naturalistic、task names、分项时长和 longitudinal；
- `classification`：按活动状态（resting、task-evoked、naturalistic、intervention、repeated/longitudinal）与任务设计（attention/executive、emotion/social、language、memory、motor/sensory、reward、clinical provocation、naturalistic、multi-domain）进行非互斥分类，并记录 curation level；
- `participants`：年龄、平均年龄、sex/gender、healthy/clinical/mixed、疾病与 population；
- `acquisition`：厂商、型号、场强、sites、TR、TE、flip angle、voxel size、volumes、multiband；
- `additionalModalities`：T1w、T2w、DWI、EEG、MEG、PET、行为、认知、遗传、临床、生理和眼动；
- `dataFormat`：BIDS、NIfTI、raw、preprocessed 和主要 pipeline；
- `access`：访问类型、registration/application/DUA、费用、license 与 commercial restrictions；
- `release`、`metadata` 和 `sources`：版本、年份、核查日期、特点、限制、备注及 provenance URL。

所有重要数值使用 `Metric`：

```ts
type Metric = {
  value: number | null;
  unit: string;
  durationSource: "reported" | "calculated" | "estimated" | "unavailable";
  sourceUrl: string | null;
  note: string | null;
};
```

时长只统计 BOLD fMRI，不含 structural MRI、DWI、PET、EEG 等。`calculated` 必须可由 TR、volumes、runs、sessions/subjects 等复算；`estimated` 必须在 note 里写明假设。OpenNeuro 长尾条目通过公开快照中的 BOLD NIfTI header 读取 TR × volumes，并从均匀抽取的 participant protocol 外推时长；这类值始终标为 `estimated`，详情中显示抽样人数、run 数、snapshot 与局限。聚合卡只累加非空值并显示覆盖分母，因此缺失数据不会被误当作 0。

## fMRI 数据刷新与时长审计

```powershell
# 重新抓取 OpenNeuro 官方公共 MRI/BOLD 元数据快照
node scripts/refresh_openneuro_fmri_index.mjs

# 从公开 S3 快照仅读取 BOLD NIfTI 文件头；支持 checkpoint / resume
node scripts/audit_openneuro_fmri_durations.mjs --samples=1 --resume

# 验证所有 OpenNeuro accession 仍能由官方 API 解析
npm run verify:openneuro
```

生成文件分别为 `data/openneuro-fmri-index.json` 与 `data/openneuro-duration-audit.json`。若要提高时长估计稳健性，可增加 `--samples=3` 或更多，但会显著增加网络请求；任何抽样外推仍不得改标为 reported/calculated。

## 添加或修订 fMRI 数据集

1. 先确认它包含 human fMRI 且存在可说明的研究者获取机制。
2. 检查 `id`、cohort 名称、DOI、accession 和 participant population，避免与现有镜像或 release 重复。
3. 在 `data/fmri-catalog.ts` 通过 `defineDataset(...)` 添加需要人工核查的核心条目；OpenNeuro 长尾条目由官方索引自动生成，不要再手工创建同 accession 的重复行。
4. 所有已知 numeric metric 必须附 HTTPS `sourceUrl`；找不到可靠值时保持 unavailable。
5. 对 derived duration 在 note 中写出公式与分母，例如 `TR × volumes × runs × subjects / 3600`。
6. 至少提供一个 `sources` 条目，优先 official release page，再补 primary paper。
7. 运行 `npm run lint` 和 `npm test`。catalog 在 module load 时检查重复 ID、缺失来源、非 HTTPS provenance 以及数值/证据状态不一致。

## 主要文件

- 工作簿：`EEG_healthcare_disease_catalog_20260823.xlsx`（仅保留 README、最终唯一下载清单、修订记录 3 个工作表）
- 网页入口：`app/page.tsx`
- 网页数据：`public/catalog-data.json`
- EEG 时长审计 overlay：`data/eeg-openneuro-duration-audit.json`（不改原 EEG JSON）
- EEG 时长审计脚本：`scripts/audit_openneuro_eeg_durations.mjs`
- 全目录获取/预处理快照：`data/eeg-progress.ts`
- 下载清单：`public/download-checklist.csv`
- 服务器状态快照：`data/server_focus_status_20260804.json`
- NeuroAtlas 逐源对照与下载说明：`NEUROATLAS_COMPARISON_AND_DOWNLOAD.md`
- NeuroAtlas 42 源机器清单：`data/neuroatlas_gap_manifest.csv`
- REVE 精确缺口与下载说明：`REVE_GAP_AND_DOWNLOAD.md`
- REVE 缺口机器清单：`data/reve_gap_manifest.csv`
- HBN/OpenNeuro 下载脚本：`scripts/download_hbn_reve_gap.ps1`

## REVE 差异结论

原 548 行目录与 REVE Appendix B 做别名归一和 accession 级去重后，真正缺少的是 8 个 HBN/OpenNeuro 独立发布版：`ds005506`、`ds005507`、`ds005508`、`ds005509`、`ds005510`、`ds005511`、`ds005512`、`ds005514`。它们现已加入工作簿和网页。

这 8 个发布版已知时长合计 1,296.8 h（`ds005511` 官方未给总时长，保持空白），不是 43,627.8 h 与 REVE 61,415 h 的全部差额。具体解释、类别和下载方法见 `REVE_GAP_AND_DOWNLOAD.md`。

先查看下载计划，不写入磁盘：

```powershell
.\scripts\download_hbn_reve_gap.ps1 -PlanOnly
```

实际下载到仓库外的目录：

```powershell
.\scripts\download_hbn_reve_gap.ps1 -OutputRoot 'D:\EEG\REVE_HBN_gap'
```

## NeuroAtlas 差异结论

NeuroAtlas 的 42 个评测来源中，原目录已经覆盖 36 个，本轮补入 6 个：SeizeIT1、DCSM、PN2026、STAGES、UCDDB 和 ArithmeticTask。补入后为 42/42；其中前 5 个进入疾病/健康重点范围，ArithmeticTask 属一般认知。

按数据源去重，NeuroAtlas 癫痫与睡眠域约 259,000 h；脑龄约 193,000 h 复用睡眠队列，不重复相加。用完整 TUEG 父集替换 TUSZ 子集，并加入不重叠的 I-CARE 后，核心疾病/健康并集约 341,253.3 h；再加入现有独有审计来源、HBN 和 EEG-Bench 后，扩展覆盖约 346,490.7 h。该数字是文献/官方来源覆盖估计，不是本地已下载文件的精确总时长。

## 当前下载状态

### 2026-08-31 全类别目录与数据预处理口径

- 完整 EEG catalog 为 563 个 canonical 下载单元；544 个有可解释的来源受试者数，已知下界合计 265,630 个 dataset-subject entries。该数字不声称是跨数据集去重后的唯一人数。
- 原始 EEG JSON 的 94 个时长值保持不变；新增 OpenNeuro overlay 后，217/563 个单元有逐行时长证据，原始行相加为 324,764.9 h。综合既有疾病/健康来源级并集与本轮非重点 OpenNeuro canonical 条目，当前全目录已知覆盖约 363,022.2 h。仍有 346 行未知，不能当作 0，因而 36.30 万小时仍不是 563 行的最终上限。
- “疾病/临床”共 109 个重点单元，其中 72 个有逐行时长，原始相加 142,241.8 h；剔除已知包含在 TUEG 父集内的 TUEP、TUEV、TUSL、TUSZ、TUAB 五个子集后，当前可核验疾病/临床覆盖约 138,822.9 h。页面把这个值与完整目录约 363,022.2 h 分开显示。
- 将全类别服务器审计、新增疾病/健康下载 overlay 与 563 行 canonical catalog 合并后，273 个唯一目录单元有完成证据；旧审计表在 catalog 去重前有 280 个 `COMPLETED` 状态行。
- SeaWulf `datasets/` 当前约 14 TiB；GPFS 约剩 2.4 TiB。
- 严格终端验证完成 52/101 个预处理目标（47 个 disease-v1 目标 + 5 个 baseline，共 54 adapters）：122,219 outputs、21,319 adapter-level subject entries、42,692.2 signal-hours、1,659,549 event rows、1,607,042,726,768 derivative bytes。
- EEG-0082 spinal SEP（99/399）和 EEG-0523 SFARI（1,590/2,563）仍在 full production，未计入严格完成数；前者当前有一个 SET/FDT 样本数不一致问题待处理。两者 signal matrix 估算约 46.35 GiB，按 50–60 GiB 预留。EEG-0521 older-adult walking 仍因事件/信号时间轴冲突而保持 gated。

这些数字集中定义在 `data/eeg-progress.ts`。EEG 首页公开展示“数据集收集 / 本地获取”两个层级与处理方法，不再展示仅适用于疾病队列的严格生产完成率、events、存储余量或批次预算。

疾病/健康重点清单使用研究队列属性而不是关键词硬分：有临床诊断、患者招募、医院监测、疾病预后/治疗或病例-对照设计的归为“疾病/临床”，其中的健康对照仍随主研究目标归疾病；健康参考、生命周期、流行病学、孕产妇、衰老或风险表型归为“健康/人群”，不会把量表高分直接当作确诊。睡眠分期/PSG 先按任务轴保留睡眠类别，再用第二轴标记临床属性。

`346,490.7 h` 仍是 147 个疾病/健康重点单元的来源级去重覆盖估计。新审计在此基础上增加 123 个非重点 OpenNeuro canonical 条目的 `16,531.41 h`，得到全目录当前来源级已知覆盖约 `363,022.2 h`。逐行口径为 217 行、`324,764.9 h`，因为逐行相加包含已知父集/子集；两种数字用途不同，页面同时列出分母与方法。

## EEG OpenNeuro 时长审计

本轮系统检查了完整目录中原来没有时长、且具有 OpenNeuro accession 的 137 个非重点 EEG 条目。123 个得到可复算的时长，14 个因 BIDS sidecar 与受支持信号头都没有足够时长信息而保持 Unknown；123 个新增条目合计 `16,531.41 h`。其中 4 个读取了全部被试和全部信号文件，标为 `calculated`；119 个按均匀抽取的 BIDS participants 外推，标为 `estimated`，不会冒充官网报告值。

审计按以下顺序取证：BIDS `RecordingDuration` → EDF/BDF header → BrainVision header。多数队列抽取 3 名被试；PEERS、PURSUE、India/Tanzania、Dortmund Vital 等高影响或高异质性条目扩展到最多 15 名被试。PEERS 的 OpenNeuro README 另称五个实验累计超过 7,000 个 90 分钟 session，但当前 snapshot 只列出其中三个实验，所以网页采用 snapshot 文件证据的估算值，不直接把论文级总数塞入该行。

- BIDS EEG 规范：<https://bids-specification.readthedocs.io/en/v1.7.0/04-modality-specific-files/03-electroencephalography.html>
- OpenNeuro 下载说明：<https://docs.openneuro.org/user-guide/>
- PEERS OpenNeuro snapshot：<https://openneuro.org/datasets/ds004395/versions/2.0.0>
- EEG-Speech 175 h 论文：<https://arxiv.org/abs/2407.07595>

重新运行或扩大抽样：

```powershell
# 全部 137 个候选，默认每个 accession 均匀抽取 3 名被试
node scripts/audit_openneuro_eeg_durations.mjs --samples=3 --workers=24

# 针对高影响条目扩大抽样，并保留其他已有记录
node scripts/audit_openneuro_eeg_durations.mjs --ids=EEG-0239,EEG-0502 --samples=15 --resume --replace
```

### 疾病/健康下载执行状态

- 疾病/健康重点范围共 147 个下载单元；其中 129 个有来源报告的受试者数，合计 99,537 个 dataset-subject entries（非跨数据集去重人数）。DOD-H（25 名健康志愿者）与 DOD-O（55 名 OSA 患者）已拆成两个下载单元，避免人数合并后整体误归 Health。
- 服务器完成目录/下载单元：81（含 TUH 重叠子集及非 raw 排除项）。
- 独立 raw EEG 已获取：74（疾病 60、Health 14）。
- 已有精确时长审计：57 个 / 43,627.8 h；另 17 个已下载目录待信号与时长审计，不重复下载。
- 当前仍可推进下载：62；明确舍弃 4 个（EPILEPSIAE、B-SNIP1、IEEE ADHD、SeizeIT1），但保留总目录证据。
- 62 项仍可推进的下载中，正式需要申请 41 项：19 项已申请等待访问，22 项尚需申请；MODMA 已完成，CHBMP 已从“等待审批”移到“已获批/登录后下载”。
- SeizeIT2（EEG-0031）已经下载并精确审计 11,626.25 h，不在待下载清单；待舍弃的是 SeizeIT1。
- PD-Mortality 已更新为 OpenNeuro ds007020 公开下载；DOD-H 已更新为 Dreem 官方 Zenodo 记录 15900394，不再列为申请项。
- CHBMP 账号已开通，官方项目队列为 282 人，当前 LORIS 可见 250 条 raw EEG session；首批 32 条已下载并在服务器解包，后续批次可续传。
- MODMA 三个获批包（ID 13/14/17）已于 2026-08-25 完整下载，共 7,593,313,997 bytes；ID 14/17 匹配发布 MD5，ID 13 保留发布 MD5 差异并已通过当前服务器长度与 60/60 ZIP CRC，不重复申请或下载。

## 直接下载与容量计划

- 当前 19 个公开直下单元中，8 个 HBN/OpenNeuro release 合计约 1.38 TiB；PN2026 约 1.2 TiB，DCSM 约 365 GiB，Challenge 2018 约 267 GB。
- 19 项合计超过 Seawulf 项目目录当前约 2.8 TB 空闲容量，因此先运行 8 个较小且使用条件清晰的单元：4 个 Hugging Face EEG-Bench 来源、PD-Mortality、DOD-H、HMC、UCDDB。
- PN2026 数据虽然公开，但官方规则限制 2026 challenge 数据在 CinC 2026 结束前用于其他论文投稿；在容量与投稿合规确认前不自动启动 1.2 TiB 下载。
- 可复现 Slurm 脚本位于 `scripts/server/`；完成标记记录文件数、字节数和 UTC 时间。

## MESA 申请口径

- 本项目应申请标准 **MESA Sleep / Multi-Ethnic Study of Atherosclerosis**，不是商业使用版 `MESA-COMMERCIAL-USE`。
- 申请时选择 raw polysomnography EDF、XML annotations，并配套核心协变量。官方可下载 raw PSG/EEG 为 2,056 名参与者；母队列睡眠检查样本 2,237 人，两者不要混成同一“已下载受试者数”。
- 申请入口：<https://sleepdata.org/data/requests/mesa/start>；Matrix 页面用于发现数据集，不是实际文件申请入口。

## 开发与验证

```powershell
npm run lint
npm test
```

## 重新生成数据与工作簿

```powershell
$node = 'C:\Users\tangzhice\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$env:NODE_PATH = 'C:\Users\tangzhice\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& $node scripts/prepare_catalog.mjs
& $node scripts/augment_reve_catalog.mjs
& $node scripts/reve_gap_analysis.mjs
& $node scripts/augment_neuroatlas_catalog.mjs
& $node scripts/sync_server_focus_status.mjs '<Seawulf all_status.csv>'
& $node scripts/apply_download_audit.mjs
& $node work_spreadsheet/build_final_workbook_20260811.mjs
& $node work_spreadsheet/verify_final_workbook_20260811.mjs
```

## 统计口径

- 43,627.8 h 是当前已下载文件审计口径。
- 138,822.9 h 是疾病/临床已知行剔除明确 TUEG 子集重叠后的当前可核验覆盖；未知疾病条目不计为 0。
- 363,022.2 h 是全目录当前来源级已知覆盖，包含疾病/健康来源并集 346,490.7 h 与非重点 OpenNeuro 审计 16,531.41 h；其中大量数值仍是论文/官网或 BIDS 抽样估算，不等于本地文件精确审计。
- 受试者统计为来源报告的 dataset-subject entries，不声称是跨数据集去重后的全球唯一人数。
- REVE 的 61,415 h 是其预训练汇编与预处理口径，两者不可直接相减为下载缺口。
- 未获得官方总时长的条目保持空白，不以“人数 × 假设时长”制造精确值。
- 临床 MDD/确诊病例-对照属于疾病类；一般情绪诱发、情感识别或仅量表风险分层不自动归为抑郁症。

## 协作与部署

- GitHub：<https://github.com/Townzc/Big-EEG-Data>
- Vercel：<https://big-eeg-data.vercel.app>
- 本仓库只保存目录元数据、证据、脚本、工作簿与网页代码；原始 EEG 数据不进入 Git。
- 更新后运行 `npm run lint`、`npm test`，再由 Vercel 构建网页。
