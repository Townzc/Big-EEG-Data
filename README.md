# BIG EEG DATA

本目录包含 2026-08-11 版 EEG 数据集总表、可检索网页与可复现的数据/工作簿构建脚本。

## 主要文件

- 工作簿：`EEG_healthcare_disease_catalog_20260811.xlsx`
- 网页入口：`app/page.tsx`
- 网页数据：`public/catalog-data.json`
- REVE 缺口分析：`work_spreadsheet/reve_gap_analysis.json`

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
& $node work_spreadsheet/build_final_workbook_20260811.mjs
& $node work_spreadsheet/verify_final_workbook_20260811.mjs
```

## 统计口径

- 43,627.8 h 是当前已下载文件审计口径。
- REVE 的 61,415 h 是其预训练汇编与预处理口径，两者不可直接相减为下载缺口。
- 未获得官方总时长的条目保持空白，不以“人数 × 假设时长”制造精确值。
- 临床 MDD/确诊病例-对照属于疾病类；一般情绪诱发、情感识别或仅量表风险分层不自动归为抑郁症。
