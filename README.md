# BIG EEG DATA

本目录包含 2026-08-23 版 EEG 数据集总表、可检索网页与可复现的数据/工作簿构建脚本。

## 主要文件

- 工作簿：`EEG_healthcare_disease_catalog_20260823.xlsx`（仅保留 README、最终唯一下载清单、修订记录 3 个工作表）
- 网页入口：`app/page.tsx`
- 网页数据：`public/catalog-data.json`
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

- 疾病/健康重点范围共 146 个下载单元；其中 128 个有来源报告的受试者数，合计 99,515 个 dataset-subject entries（非跨数据集去重人数）。
- 服务器完成目录/下载单元：74（含 TUH 重叠子集及非 raw 排除项）。
- 独立 raw EEG 已获取：67（疾病 55、Health 12）。
- 已有精确时长审计：57 个 / 43,627.8 h；另 10 个已下载目录待信号与时长审计，不重复下载。
- 当前仍可推进下载：68；明确舍弃 4 个（EPILEPSIAE、B-SNIP1、IEEE ADHD、SeizeIT1），但保留总目录证据。
- 68 项中正式需要申请 41 项：19 项已申请等待访问，22 项尚需申请；MODMA 与 CHBMP 已从“等待审批”移到“已获批/可登录下载”。
- SeizeIT2（EEG-0031）已经下载并精确审计 11,626.25 h，不在待下载清单；待舍弃的是 SeizeIT1。
- PD-Mortality 已更新为 OpenNeuro ds007020 公开下载；DOD-H 已更新为 Dreem 官方 Zenodo 记录 15900394，不再列为申请项。
- CHBMP 账号已开通，官方项目队列为 282 人，当前 LORIS 可见 250 条 raw EEG session；首批 32 条已下载并在服务器解包，后续批次可续传。
- MODMA 三个获批包（ID 13/14/17）当前官网不可达，保留为“已获批、入口待恢复”，不重复申请。

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
