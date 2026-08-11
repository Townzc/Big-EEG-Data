# EEG Healthcare & Disease Data Atlas

本目录包含 2026-08-10 版 EEG 数据集总表、Healthcare/Disease 可视化网页与可复现审计脚本。

## 直接查看

- 工作簿：`EEG_healthcare_disease_catalog_20260810.xlsx`
- 网页入口：`app/page.tsx`
- 分类与统计报告：`CLASSIFICATION_AND_AUDIT_REPORT.md`

开发服务器已在本机启动：<http://127.0.0.1:3000/>

重新启动：

```powershell
cd C:\Users\tangzhice\Desktop\SBU_remote_intern\data_collect_web
npm run dev
```

生产检查：

```powershell
npm run build
node --test tests/rendered-html.test.mjs
```

## 重新生成数据和工作簿

数据准备与统计复核：

```powershell
$node = 'C:\Users\tangzhice\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node scripts/prepare_catalog.mjs
& $node scripts/verify_metrics.mjs
```

工作簿生成与渲染复核：

```powershell
& $node work_spreadsheet/build_final_workbook.mjs
& $node work_spreadsheet/verify_final_workbook.mjs
```

## 关键口径

- 当前 raw EEG 主指标只纳入服务器审计确认 `EEG_SIGNAL_PRESENT` 的单元。
- BEED 只有 processed features/protocol，单列，不计入 raw EEG 主指标。
- EEG-0050 与 EEG-0101 当前下载内容未发现 EEG signal，排除。
- TUEG 是父库；TUAB/TUAR/TUEP/TUEV/TUSZ/TUSL 与其重叠，不重复相加。
- 受试者总量是 `participant-row count`，不是跨独立数据集的全球唯一人数。
- 未获得官方总时长的 PSG 队列不按“人数 × 每夜时长”估算；预计时长只报告下界。

## 可访问性

网页提供跳转链接、语义标题与表格、键盘焦点、表单标签、横向滚动提示、移动端布局、减少动画偏好及高对比度偏好支持。
