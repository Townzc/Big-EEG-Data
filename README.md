# BIG DATA · EEG + fMRI

统一的公共脑数据集门户：`/` 保留原有 EEG 数据集总表、下载清单与工作簿功能，`/fmri` 提供来源可追溯的公共人类 fMRI 数据集目录。网站名称已从 **Big EEG Data** 更新为 **Big Data**，两个页面分别为 **Big Data of EEG** 与 **Big Data of fMRI**。

原 EEG 数据文件 `public/catalog-data.json` 没有改动；当前 SHA-256 为 `2945590BBA5D852A1A838431C6861B7BE0623F4BAAC63CC5D3DE83F10D7F54D9`。原 EEG 工作簿、下载清单、分类和统计口径继续保留。

## Portal 架构

- EEG 页面：`app/page.tsx`，继续读取 `public/catalog-data.json`，沿用既有 `CatalogExplorer` 与 `DownloadChecklist`。
- fMRI 页面：`app/fmri/page.tsx`；交互目录与详情面板位于 `app/fmri/FmriExplorer.tsx`。
- 模态切换：`app/ModalitySwitcher.tsx`，在 EEG / fMRI 页面共享。
- fMRI 完整 schema：`data/fmri-schema.ts`。
- fMRI canonical catalog：`data/fmri-catalog.ts`。同一队列的 OpenNeuro、DataLad、NITRC、云镜像和机构入口记录在一个条目里，不按镜像重复建行。

## fMRI 目录范围

当前目录收录 96 个 canonical fMRI 数据集/队列，覆盖：

- HCP Young Adult、HCP Development、AABC/HCP Aging、BCP、dHCP，以及 HCP-EP、BANDA、PDC、DCAM 等疾病相关 HCP 项目；
- ABCD、HBCD、UK Biobank、ADNI、OASIS-3、CamCAN、NKI-Rockland、Healthy Brain Network；
- 1000FCP、ADHD-200、ABIDE I/II、COBRE、SchizConnect 下的 FBIRN Phase II 与 MCIC、PING、PNC、IMAGEN、CoRR、GSP；
- Midnight Scan Club、Natural Scenes Dataset、StudyForrest、IBC、Narratives 等高密度/自然刺激数据；
- OpenNeuro 大样本人类 fMRI 数据集。发现阶段使用 OpenNeuro 公共 GraphQL API v5.6.0，筛选公开 MRI、至少 100 位 BIDS participants 且含 functional task entity 的数据，随后排除非人类数据并合并相关 release。

目录优先使用项目官方网站、官方 repository metadata 和原始 dataset paper。`Last Verified` 当前为 2026-08-30。受试者数可能指发布人数、BIDS participants 或整队列人数；每条记录的 Notes / Limitations 会说明它是否等同于可用/QC-passed fMRI 人数。

## fMRI 标准 schema

每个 `FmriDataset` 都包含下列固定分组，缺失值显式使用 `null` / `Unknown`，不会用 0 代替：

- `identification`：名称、缩写、官网、repository、所有 access URL、paper/DOI、机构和地区；
- `scale`：subjects、sessions、fMRI runs、总分钟/小时、每受试者小时数、数据容量；
- `fmriComposition`：rest、task、movie/naturalistic、task names、分项时长和 longitudinal；
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

时长只统计 BOLD fMRI，不含 structural MRI、DWI、PET、EEG 等。`calculated` 必须可由 TR、volumes、runs、sessions/subjects 等复算；`estimated` 必须在 note 里写明假设。聚合卡只累加非空值，并显示 `known X / 96`，因此缺失数据不会被误当作 0。

## 添加或修订 fMRI 数据集

1. 先确认它包含 human fMRI 且存在可说明的研究者获取机制。
2. 检查 `id`、cohort 名称、DOI、accession 和 participant population，避免与现有镜像或 release 重复。
3. 在 `data/fmri-catalog.ts` 通过 `defineDataset(...)` 添加条目；OpenNeuro 大样本条目可使用同文件的 `openNeuro(...)` helper。
4. 所有已知 numeric metric 必须附 HTTPS `sourceUrl`；找不到可靠值时保持 unavailable。
5. 对 derived duration 在 note 中写出公式与分母，例如 `TR × volumes × runs × subjects / 3600`。
6. 至少提供一个 `sources` 条目，优先 official release page，再补 primary paper。
7. 运行 `npm run lint` 和 `npm test`。catalog 在 module load 时检查重复 ID、缺失来源、非 HTTPS provenance 以及数值/证据状态不一致。

## 主要文件

- 工作簿：`EEG_healthcare_disease_catalog_20260823.xlsx`（仅保留 README、最终唯一下载清单、修订记录 3 个工作表）
- 网页入口：`app/page.tsx`
- 网页数据：`public/catalog-data.json`
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

### 2026-08-30 全类别与严格预处理快照

- 完整 EEG catalog 为 563 个 canonical 下载单元；544 个有可解释的来源受试者数，已知下界合计 265,630 个 dataset-subject entries。该数字不声称是跨数据集去重后的唯一人数。
- 94/563 个单元有可相加的时长证据，逐行原始合计 308,233.5 h；这94行全部属于147个疾病/健康重点单元，其余416个非重点单元目前没有可加总时长。综合来源级去重证据，当前可报告的已知覆盖约为 346,490.7 h；563个单元的实际总时长尚未闭合，预计更高。30.82万小时只用于逐行证据核对，不应作为全目录最终总时长。
- 将全类别服务器审计、新增疾病/健康下载 overlay 与 563 行 canonical catalog 合并后，273 个唯一目录单元有完成证据；旧审计表在 catalog 去重前有 280 个 `COMPLETED` 状态行。
- SeaWulf `datasets/` 当前约 14 TiB；GPFS 约剩 2.4 TiB。
- 严格终端验证完成 52/101 个预处理目标（47 个 disease-v1 目标 + 5 个 baseline，共 54 adapters）：122,219 outputs、21,319 adapter-level subject entries、42,692.2 signal-hours、1,659,549 event rows、1,607,042,726,768 derivative bytes。
- EEG-0082 spinal SEP（99/399）和 EEG-0523 SFARI（1,590/2,563）仍在 full production，未计入严格完成数；前者当前有一个 SET/FDT 样本数不一致问题待处理。两者 signal matrix 估算约 46.35 GiB，按 50–60 GiB 预留。EEG-0521 older-adult walking 仍因事件/信号时间轴冲突而保持 gated。

这些数字集中定义在 `data/eeg-progress.ts`，EEG 首页以“全目录来源规模 / 本地获取证据 / 严格预处理结果”三个层级展示，避免把 catalog coverage、服务器下载状态与验证后训练数据混成一个总数。

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
- 346,490.7 h 是疾病/健康数据源级去重覆盖估计；其中约 302,862.9 h 尚未进入本地文件审计。
- 受试者统计为来源报告的 dataset-subject entries，不声称是跨数据集去重后的全球唯一人数。
- REVE 的 61,415 h 是其预训练汇编与预处理口径，两者不可直接相减为下载缺口。
- 未获得官方总时长的条目保持空白，不以“人数 × 假设时长”制造精确值。
- 临床 MDD/确诊病例-对照属于疾病类；一般情绪诱发、情感识别或仅量表风险分层不自动归为抑郁症。

## 协作与部署

- GitHub：<https://github.com/Townzc/Big-EEG-Data>
- Vercel：<https://big-eeg-data.vercel.app>
- 本仓库只保存目录元数据、证据、脚本、工作簿与网页代码；原始 EEG 数据不进入 Git。
- 更新后运行 `npm run lint`、`npm test`，再由 Vercel 构建网页。
