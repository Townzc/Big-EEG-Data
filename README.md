# BIG DATA · EEG + fMRI

## 当前更新：2026-09-10

VitalDB 新增为 **EEG-0609**，归入“意识与状态 / Anesthesia”；全量 **6,388 个 vital 文件及配套元数据已下载并通过发布者 SHA-256**。官方 API 当前 EEG 范围为 5,871 病例 / 5,623 患者、2 通道 / 128 Hz；整库 6,388 次手术 / 6,090 患者另列，EEG 有效小时仍待审计。

**EEG-0053 的 121 个 MAT 已从公开镜像下载并校验**（61 ADHD / 60 Control，19 通道，4.701352 h）。官方 S3 本次仍返回 403；通道标签 DOCX/坐标 CED 未取得，镜像与官方源的字节一致性尚不能确认。

**BEED（EEG-0007）从当前目录和统计删除**，历史排除证据保留；**EEG-0077 确认归 cognitive**。AES、UPenn 的 μV、单极采集参考及 Bipolar/CAR 建议依据项目负责人提供的信息登记；MODMA 标注“已邮件询问，等待作者回复”。

当前仍为 **568 EEG / 784 fMRI**，八大 EEG 类别为 `4 / 97 / 65 / 142 / 59 / 135 / 43 / 23`。重点下载清单 145 行：81 有完成证据，76 取得独立 raw，62 个完成精确时长审计。网站、CSV/JSON、当前 Excel 已同步；详情与验证见 [本次更新记录](CATALOG_UPDATE_20260910.zh-CN.md)。以下较早日期小节为历史快照。

## 2026-09-08 reconciliation 历史快照

当前主目录为 **568 条 EEG / 784 条 fMRI**。EEG 由不可变的历史 563 行证据快照出发：排除非 EEG 的 EEG-0050，将 EEG-0488 合并为 EEG-0064 alias，纳入 1 个 evidence-layer supplemental release 和 6 个后续 revision entry。设计、证据和后续核查清单见 [更新报告](CATALOG_IMPROVEMENTS_20260906.zh-CN.md)；较早日期的小节是历史快照，不能覆盖本节的当前口径。

- 当前 EEG 为 568 行、547 个 source family、553 个 acquisition package。八大类别行数为 `4 / 98 / 64 / 142 / 59 / 135 / 43 / 23`；bigP3BCI（EEG-0064）现归“运动与交互 / P300_BCI”。
- 原始逐行有 541/568 行给出 subject，合计 261,018 个 dataset-subject entries；274/568 行有时长，逐行相加 3,845,506.57 h。按已记录 parent/child relation 抑制 10 个子集后，受试者条目为 223,167（531/558 有值），已知时长为 3,841,983.59 h（267/558 有值）。这不是跨数据库的全球唯一人数；未知不按 0 处理。
- 重点下载清单为 145 个执行单元；80 个有服务器完成证据，74 个已取得独立 raw。精确时长审计工作量为 61 行 / 46,893.44 h，其中含 5 个 TUEG child；关系去重后约 56 项 / 43,474.55 h。19 个“已申请等待访问”是 logical rows，实际约 3 个申请流程/入口：一次 BDSP credential/application 覆盖 HEEDB + MORGOTH 16 行，另有 MESA 与 CAUEEG；22 个尚需申请/登录。另有 12 个可直接下载、2 个登录后可下载和 4 个需人工复核。
- 严格 raw-continuous 预处理完成 62/99 个 canonical targets：136,214 outputs、21,777 adapter-level subject entries、43,182.68 signal-hours、3,464,162 event rows、1,686,520,768,213 derivative bytes。统计明确排除重复 EEG-0072 batch80 及 non-EEG / processed-only 目标。
- NMT、M3CV、VEPCON EEG subset 已下载；AES、HMS、UPenn/Mayo、Schizophrenia 和 TDBRAIN 均已完成对应全量信号范围审计但门禁各异。AES 显示 publisher-declared 1,333.6667 h，并保留 header 重算多 2.757 s 的舍入差；mixed-species 与未知 unit/reference 仍阻断生产。Schizophrenia 的 11,527-output processed-trial scope 已通过 batch91 终端生产验证；它不增加严格 raw-continuous 62/99 KPI。GPFS 当前可用约 1.80 TiB；安全层另保留约 119.1 GB 已识别但尚未删除的失败 staging。详细状态由 `data/eeg-catalog-reconciliation.json` 驱动。

- 主界面：`app/CatalogLanding.tsx`、`app/CatalogBrowser.tsx`；筛选后汇总全部结果，支持 2–4 项对比、深链接、CSV/JSON 导出与按需加载详情。
- 当前数据入口：`data/current-catalog.ts`，组合原 EEG/fMRI 目录与 `data/catalog-revisions.json` 的修订、别名合并及来源关系。保留 `public/catalog-data.json` 不变，历史预处理与下载记录移入可展开区域。
- 来源证据：`data/catalog-revision-evidence.json` 保留文件头核查覆盖、失败记录、清单哈希及交集摘要；来源网页与论文记录在修订详情中。
- 构建前由 `scripts/generate_catalog.mjs` 生成网页索引、32-way 详情分片、CSV/JSON、排除审计和 manifest；生成物不入 Git，`dev`、两种 `build` 均自动生成。当前 XLSX 和版本侧文件入库，构建检查其版本，避免网页更新而工作簿过期。
- 分清目录条目、来源家族、受试者条目、记录数、小时和本地已获取时长。未知保持 `null`；已确认子集只在父库同时出现且对应指标有值时排除，部分重叠仍提示。

```powershell
npm run catalog:generate
# 目录数值或导出列变更后，用项目内 ExcelJS 重新生成 XLSX
npm run catalog:workbook
npm test
npm run lint
npx tsc --noEmit
npm run build:vercel
npm run dev -- --host 127.0.0.1
```

工作簿脚本使用项目内固定版本的 ExcelJS，列公式按 `exportColumns` 动态定位，避免新增字段后 subject/hour 列错位。研究脚本的原始请求缓存位于忽略的 `outputs/`；`curate_20260906.mjs` 是本轮策展过程记录，需要对应缓存，日常构建直接读取已提交的修订 JSON。重新联网审计属于显式维护操作，不会在站点构建时触发。

`scripts/lib/signal-headers.mjs` 支持有界文件头读取、NIfTI-1/2、多回波采集去重及嵌套 BIDS 根目录发现。抽样结果保持 `estimated`，不推断为完整实际小时。Cloudflare 类型由当前生产构建配置生成；如兼容日期变化，在完成构建后运行 `npx wrangler types worker-configuration.d.ts --config dist/server/wrangler.json --include-env false`。

## 2026-09-06 历史网站复核与 HEEDB 团队分类

- 设计建议、EEG/fMRI 查重证据和待补候选见 `WEBSITE_REVIEW_20260906.zh-CN.md`；本轮没有新增候选数据集或删除疑似重复行。
- 根据项目负责人确认，HEEDB（EEG-0012）在本网站归入“意识与状态 / Sleep_Staging”，重点清单分组为“睡眠”。这是团队分类，官方临床人群描述、原始任务与访问限制保留。
- 当前网页的医疗与疾病大类为 96，意识与状态为 64；疾病/临床汇总为 109 个单元、75 个有时长，已知时长约 541,757.5 h。HEEDB 移出后，I-CARE 在疾病范围内不再被扣除；全目录来源级既有估计仍为 3,821,689.4 h。
- `public/catalog-data.json` 是保留的历史快照；`data/eeg-classification.ts` 应用当前分类修订，`data/eeg-duration.ts` 统一导出网页目录与重点清单。不得把原始快照直接当作当前分类。
- 当前 XLSX 入口改为 `public/EEG_catalog_20260906.xlsx`，仅同步分类及其直接影响的说明；其余数据仍是原工作簿快照，不包含网页所有时长叠加证据。`public/download-checklist.csv` 同步 HEEDB 分类。历史工作簿保留。
- 本轮只调整网站分类，不移动或重命名服务器数据目录。既有本地未提交修改保留；线上版本未在本轮发布。

统一的公共脑数据集门户：`/` 保留原有 EEG 数据集总表、下载清单与工作簿功能，`/fmri` 提供来源可追溯的公共人类 fMRI 数据集目录。网站名称已从 **Big EEG Data** 更新为 **Big Data**，两个页面分别为 **Big Data of EEG** 与 **Big Data of fMRI**。

原 EEG 数据文件 `public/catalog-data.json` 没有改动；当前 SHA-256 为 `2945590BBA5D852A1A838431C6861B7BE0623F4BAAC63CC5D3DE83F10D7F54D9`。原 EEG 工作簿、下载清单、分类和统计口径继续保留。

## Portal 架构

- EEG 页面：`app/page.tsx`，继续读取 `public/catalog-data.json`，沿用既有 `CatalogExplorer` 与 `DownloadChecklist`。
- EEG 首页先展示完整目录、临床/健康/睡眠重点下载清单和研究对照，最后才展示“数据预处理”；完整总表与下载执行清单默认均为每页 5 行，仍可分页浏览全部数据。
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
- EEG OpenNeuro 时长审计 overlay：`data/eeg-openneuro-duration-audit.json`（不改原 EEG JSON）
- EEG 论文时长 overlay：`data/eeg-literature-duration-audit.json`（SingLEM Table I 的记录小时；不使用 single-channel hours）
- EEG 独立官网/论文复核：`data/eeg-independent-duration-audit.ts`（BDSP、SleepFM、NeuroLM；同时追加新发布 Neurotech，但不改原始 JSON）
- EEG 基础模型论文口径：`data/eeg-foundation-paper-audit.ts`
- EEG–fMRI 配对数据集 survey：`data/eeg-fmri-pairs.ts`（保留为内部审计资料，不再渲染于 EEG 首页）
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

## 历史下载状态（当前值以文首 2026-09-08 reconciliation 为准）

### 2026-09-01 分类口径与服务器生产表复核

- 网站大类卡片的“医疗与疾病 97”来自原始目录 96 行加证据层新增 Neurotech 1 行；“健康与人群”是另一个完整目录大类，共 21 行。
- 旧版重点下载清单的 147 行不是 97 + 21，而是 96 个医疗与疾病 + 21 个健康与人群 + 30 个意识与状态中的睡眠数据集。按清单的第二轴标签，这 147 行又分成 109 个“疾病/临床”和 38 个“健康/人群”。若把新增 Neurotech 纳入当前重点范围，则是 148 = 110 + 38。
- SeaWulf 生产 registry 有 109 行，其中 8 行是重复项，故有效预处理分母为 101。逐 ID 映射后，其中 81 个属于疾病/临床主题，20 个并非疾病主题：健康与人群 6、认知与情感 8、运动/BCI 5、通用 1。服务器旧目录名是历史生产分组，不能当作医学分类。
- 101 个 canonical 单元中 75 个已完成获取，26 个仍待获取：22 个等待申请/登录，2 个需人工复核，2 个发现失败。生产层级为 55 个 disease-v1、5 个 baseline、11 个待内容审计、4 个 adapter-review-ready、26 个 acquisition-pending；另有 1 个不在当前 catalog 的 EEG-0582 已通过 disease-v1 验证，因此 registry 的严格已验证下限记为 61。
- HEEDB 的约 330 万小时来自 [BDSP Neurotech 官方对照页](https://bdsp.io/content/nf89816gtxbon11kbr9a/1.0/)，是约 329,000 recordings 的整库近似规模；[HEEDB v4.1](https://bdsp.io/content/harvard-eeg-db/4.1/) 则报告 284,343 studies / 109,178 patients，但没有给出精确总小时。该数字不等于本地已下载或可立即用于训练的数据量；完整访问需要 BDSP credentialing、DUA 与许可合规。公开的 [MORGOTH v1.0 release](https://www.bdsp.io/content/morgoth1/1.0.0/) 明确提供的是 9,242 个自监督预训练 EEG 文件，可作为获批后的可操作子集参考。

### 2026-08-31 全类别目录与数据预处理口径

- 原始 EEG catalog 的 563 行 JSON 保持逐字节不变；网页证据层追加 2026 年发布的 Neurotech EEG Dataset，因此当前可检索为 564 个单元。545 个有来源受试者数，已知下界合计 270,544 个 dataset-subject entries；这不是跨数据集去重后的唯一人数。
- 叠加 OpenNeuro 文件审计、SingLEM Table I、NeuroLM、SleepFM 与 BDSP 官方发布后，269/564 个单元有逐行时长证据，原始行相加为 4,033,202.7 h。来源级保守去重覆盖约 3,821,689.4 h；仍有 295 行未知，不能当作 0。
- “疾病/临床”重点范围加新 Neurotech 共 110 个单元，其中 76 个有逐行时长。剔除 TUEG 的五个已知子集，并在加入 HEEDB 约 330 万小时后保守移除全部 I-CARE 56,676 h，当前疾病/临床覆盖约 3,785,081.5 h。这样做可能低估 I-CARE 的非 Harvard 站点，但不会因已知医院重叠抬高总量。
- 将全类别服务器审计、新增疾病/健康下载 overlay 与 563 行 canonical catalog 合并后，273 个唯一目录单元有完成证据；旧审计表在 catalog 去重前有 280 个 `COMPLETED` 状态行。
- SeaWulf `datasets/` 当前约 14 TiB；GPFS 约剩 2.4 TiB。
- 严格终端验证完成 52/101 个预处理目标（47 个 disease-v1 目标 + 5 个 baseline，共 54 adapters）：122,219 outputs、21,319 adapter-level subject entries、42,692.2 signal-hours、1,659,549 event rows、1,607,042,726,768 derivative bytes。
- EEG-0082 spinal SEP（99/399）和 EEG-0523 SFARI（1,590/2,563）仍在 full production，未计入严格完成数；前者当前有一个 SET/FDT 样本数不一致问题待处理。两者 signal matrix 估算约 46.35 GiB，按 50–60 GiB 预留。EEG-0521 older-adult walking 仍因事件/信号时间轴冲突而保持 gated。

这些数字集中定义在 `data/eeg-progress.ts`。EEG 首页公开展示“数据集收集 / 本地获取”两个层级与处理方法，不再展示仅适用于疾病队列的严格生产完成率、events、存储余量或批次预算。

疾病/健康重点清单使用研究队列属性而不是关键词硬分：有临床诊断、患者招募、医院监测、疾病预后/治疗或病例-对照设计的归为“疾病/临床”，其中的健康对照仍随主研究目标归疾病；健康参考、生命周期、流行病学、孕产妇、衰老或风险表型归为“健康/人群”，不会把量表高分直接当作确诊。睡眠分期/PSG 先按任务轴保留睡眠类别，再用第二轴标记临床属性。

旧的 `346,490.7 h` 是 147 个疾病/健康重点单元的来源级去重覆盖估计。OpenNeuro 审计增加 123 个非重点 canonical 条目的 `16,531.41 h`；SingLEM 中不重叠的非重点行增加 `3,064.13 h`。独立复核再带来净新增 `3,455,603.07 h`：HEEDB 约 330 万小时减去全部 I-CARE 56,676 h、Neurotech 212,186 h，以及 NeuroLM 可唯一映射的 7 行 93.07 h。由此得到全目录当前来源级已知覆盖 `3,821,689.4 h`。HSP 的 190,732 h 用于补齐逐行证据，但已在旧睡眠来源并集中，不再次增加来源级总量。

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

## 基础模型论文时长口径

本轮不再只核查用户给出的论文，另外独立检索了 NeuroLM、BrainWave、NeuralBench、BrainOmni、INCEPT、SleepFM 和 EEG foundation-model critical review，并回到 BDSP/HSP/HEEDB 官网交叉验证。结论是论文中的“小时”至少有三种不可混加的口径：

- **原始/连续记录小时**：所有同步通道共享同一时间轴，一段 1 小时的 64 通道 EEG 仍记作 1 recording hour。目录总量使用这一口径。
- **single-channel hours**：记录小时乘可用通道数。SingLEM 摘要约 357,000 h 属于此口径；其 Table I 的 71 个数据集记录小时精确相加为 10,179.98 h。网站只采用后者，并仅映射到 42 个仍缺时长且别名唯一的 canonical 行。
- **处理后模型样本小时**：segment 数 × window 长度。若有重叠窗、过滤或重复采样，它不等于独立原始时长。CBraMod 的 TUEG 从约 27,062 raw h 经筛选后得到 1,109,545 个 30 秒窗，即约 9,246.2 model-sample h；BIOT 也主要按 10/30 秒片段数量报告。

论文比较摘要：REVE 报告 92 来源、24,274 subjects、61,415 h；BrainWave 分列 35,675.5 scalp-EEG h 与 5,231 iEEG h；NeuralBench-EEG v1.0 为 94 数据集、9,478 subjects、13,603 h；NeuroLM 清洗后约 25,000 h，并在 Appendix C 给出逐来源时长；BrainOmni 报告 1,997 EEG h + 656 MEG h；INCEPT 的约 11,000 h 是 TUEG 过滤后保留量。只有 NeuroLM 中 7 个别名、人数和入口都可唯一映射且原行缺失的值进入逐行 overlay；其他聚合值只用于交叉检查，不能整包重复加入 catalog。

新增的大规模官网证据包括：

- Harvard EEG Database：BDSP v4.1 为 284,343 studies / 109,178 patients；BDSP 当前对照页近似报告约 329,000 recordings / 330 万小时。网页采用后者并显式标为官网近似 reported 值。
- Human Sleep Project：与目录 18,973-subject 版本一致的 SleepFM Table 4 报告 25,253 recordings、平均 7.6 ± 1.1 h、总 190,732 h；HSP v3 已扩展到 90,166 patients，但官网没有发布可直接相加的精确总 EEG 小时，所以不拿平均值外推新版。
- Neurotech EEG Dataset v1.0：4,914 patients、23,607 recordings、212,186 h、10.2 TB；受限于 credentialing + DUA，不能标作开放直下。

## 公开 EEG–fMRI 配对数据 survey

参考 Google Sheet 的 21 行经过 canonical 去重、访问核验和第二轮独立检索后，主统计限定为：人类数据、EEG 与 BOLD 同时采集，并且有公开下载或注册后获取机制。当前结果为 **26 个公开/注册后可得的同步数据集、443 个 dataset-subject entries、25/26 个有 reported/calculated/estimated 时长，合计 696.59 h**。受试者是在数据集内去重、跨数据集未去重；唯一仍无法可靠求和的是 5 人 Schrooten 数据，Unknown 不是 0。

首轮确认的 8 个补入/补全项仍是：OpenNeuro `ds002734`（22 人 / 9.38 h）、`ds003574`（18 / 50.37 h）、`ds005127`（16 / 约 256 h）、`ds004478`（6 / 0.40 h）、CineBrain（6 / 36 h）、CMU/Figshare Bondi motor（17 / 4.41 h）、Zenodo Schrooten covert-attention（5 / Unknown），以及原表空白 ATR `atr-EfP-2025`（39 / 约 42.97 h）。这 8 个合计 129 dataset-subject entries，7 个有时长，合计约 399.53 h。

第二轮不依赖参考表的检索又新增 G-Node/GIN `g-node.6269c2` epileptic-focus 数据：10 名难治性癫痫患者，每人 20 min 同步静息 EEG-fMRI，合计 3.33 h，CC0。另发现多个 NDA 控制访问项目（connectome states、ASD rest、ADHD working memory、stress/anxiety）；由于公开页只给 collection-wide subjects，未给“同时拥有完整 EEG + BOLD raw runs”的人数与时长，暂列“范围待核”，不混入 26/443/696.59 的严格总数。

同一轮也补记了 OpenNeuro `ds003688`：51 名患者有 iEEG、30 名有 fMRI，其中 18 名完成两种模态的同一 6.5 min 电影任务；但 fMRI 在植入前、iEEG 在数天或数周后采集，因此归入“同被试分开采集”，不计同步时长。当前次级分类共有 7 个分开采集数据集。

NATVIEW 原先的 5.9 h 已纠正：NEMAR v1.0.0 manifest 中实际有 391 个 scanner-on EEG run 文件，按数据论文 Table 1 的对应 BOLD nominal run lengths 求和为 150,740 s，即 41.87 h；scanner-off 与 outside-scanner EEG 被排除。此前 5.9 h 来自二手汇总表，不代表完整公开同步协议。

以下条目不进入 696.59 h：

- NeuroBOLT 没有核实到公开下载；
- Dryad MSIT 公开记录只有 46.59 KB 汇总工作表，不是 raw EEG/fMRI；
- Gesture–speech Zenodo 只公开 3 个 alpha 结果压缩包（64.4 MB），没有 raw EEG/BOLD；
- Berlin/Charité 50 人 cohort 没有核实到 raw public download；
- LPPHK、LPP Multi-talker、PEARL、旧 inner-speech `ds004196`、VEPCON、Wakeman–Henson 为同被试多模态但分开会话；
- TLE connectomes 与 Zenodo 3905103 仅提供衍生 connectome。

配对时长公式优先级：官方/论文明确总时长 → `TR × volumes × runs × released subjects` → EEG/BOLD 文件头审计外推。只统计 EEG 与 BOLD 同时存在的区间，不含 structural MRI、DWI、fMRI-only、EEG-only 或分开会话。

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
- 3,785,081.5 h 是疾病/临床已知行的当前保守覆盖：剔除明确 TUEG 子集，并在加入 HEEDB 后移除全部 I-CARE 以防 Harvard 医院重叠；未知疾病条目不计为 0。
- 3,821,689.4 h 是全目录当前来源级已知覆盖；3,300,000 h HEEDB 为官网近似 reported 值，OpenNeuro 的部分条目为 BIDS 抽样估算，因此这不是本地文件精确审计。
- 受试者统计为来源报告的 dataset-subject entries，不声称是跨数据集去重后的全球唯一人数。
- REVE 的 61,415 h 是其预训练汇编与预处理口径，两者不可直接相减为下载缺口。
- 未获得官方总时长的条目保持空白，不以“人数 × 假设时长”制造精确值。
- 临床 MDD/确诊病例-对照属于疾病类；一般情绪诱发、情感识别或仅量表风险分层不自动归为抑郁症。

## 协作与部署

- GitHub：<https://github.com/Townzc/Big-EEG-Data>
- Vercel：<https://big-eeg-data.vercel.app>
- 本仓库只保存目录元数据、证据、脚本、工作簿与网页代码；原始 EEG 数据不进入 Git。
- 更新后运行 `npm run lint`、`npm test`，再由 Vercel 构建网页。
