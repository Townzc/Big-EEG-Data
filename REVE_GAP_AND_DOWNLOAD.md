# REVE 精确缺口、类别与下载

复核日期：2026-08-11。

## 结论

把原 548 行目录与 REVE Appendix B 按数据集别名、OpenNeuro accession、父库/子集关系去重后，REVE 明示而原目录真正没有的独立来源只有下面 8 个。它们都是 Healthy Brain Network EEG 的独立 OpenNeuro 发布版，现已作为 EEG-0594 至 EEG-0601 加入总表。

| OpenNeuro | 数据集 | 大类 / 小类 | Subjects | Recordings | REVE/发布页时长 | 访问 |
|---|---|---|---:|---:|---:|---|
| ds005506 | HBN-EEG Release 2 | 健康与人群 / 发育与临床表型队列 | 150 | 1,405 | 127.5 h | Public |
| ds005507 | HBN-EEG Release 3 | 健康与人群 / 发育与临床表型队列 | 184 | 1,812 | 158.8 h | Public |
| ds005508 | HBN-EEG Release 4 | 健康与人群 / 发育与临床表型队列 | 324 | 3,342 | 261.8 h | Public |
| ds005509 | HBN-EEG Release 5 | 健康与人群 / 发育与临床表型队列 | 330 | 3,326 | 255.3 h | Public |
| ds005510 | HBN-EEG Release 6 | 健康与人群 / 发育与临床表型队列 | 135 | 1,227 | 103.5 h | Public |
| ds005511 | HBN-EEG Release 7 | 健康与人群 / 发育与临床表型队列 | 381 | 3,100 | 未给出 | Public |
| ds005512 | HBN-EEG Release 8 | 健康与人群 / 发育与临床表型队列 | 257 | 2,320 | 179.1 h | Public |
| ds005514 | HBN-EEG Release 9 | 健康与人群 / 发育与临床表型队列 | 295 | 2,885 | 210.8 h | Public |

分类理由：HBN 面向儿童青少年发育、认知和精神健康的广泛表型研究，包含临床表型不等于所有参与者都有同一种确诊疾病。因此主类归为“健康与人群”，小类明确保留其“发育与临床表型队列”属性；不能为了增加疾病类规模而把它整体标成某一种疾病。

8 个发布版的已知时长合计 1,296.8 h；Release 7 没有可靠官方总时长，所以留空，不用人数或 recording 数量推算。

## 为什么原来只有四万多小时

43,627.8 h 是“当前已下载文件审计”口径，REVE 的 61,415 h 是其完整预训练汇编口径，不能把两者直接相减后理解为 8 个遗漏数据集。

主要差别如下：

| 差异来源 | 类别 | REVE 口径/作用 | 我们原来的情况 |
|---|---|---|---|
| I-CARE | 疾病与医疗 / 重症监护与昏迷 | 与 Siena 合计构成 REVE 的 PhysioNet/BDSP 约 22,707 h | 已有目录项，但原先分类和本地下载审计没有完整纳入；当前完整版本受限访问 |
| OpenNeuro 56 个来源 | 认知、运动、情感、健康人群、临床疾病等混合 | REVE 合计约 10,194 h | 多数来源早已在目录中，但不少行没有可复核总时长或本地文件，因而没有进入“已下载时长” |
| TUH/TUEG | 疾病与医疗 / 临床常规 EEG | REVE 约 26,847 h | 我们的本地版本审计约 27,077.3 h，版本与预处理口径不同；不能重复叠加 TUAB/TUAR/TUEP/TUEV/TUSZ/TUSL 子集 |
| HBN Release 2–9 | 健康与人群 / 发育与临床表型队列 | 8 个真正源级漏项 | 现已补入；已知 1,296.8 h，Release 7 时长未知 |

REVE Table 7 的平台分项相加为 61,382 h，与正文 61,415 h 相差 33 h，属于论文内部的舍入或版本差异。我们在网页中保留下界和口径说明，不人为补齐这 33 h。

## 下载 8 个 OpenNeuro 发布版

### 1. 安装官方工具

先安装 Deno、Git、git-annex 和 DataLad，然后安装 OpenNeuro CLI：

```powershell
deno install -A --global jsr:@openneuro/cli -n openneuro
deno run -A jsr:@openneuro/cli login
```

登录命令会配置 OpenNeuro API key。也可以在当前终端临时设置 `OPENNEURO_API_KEY`，但不要把密钥写入仓库、脚本或日志。

OpenNeuro CLI 使用 DataLad/git-annex；官方的 `git-annex-remote-openneuro` 包装脚本也需要在 `PATH` 中。安装和更新方式以 OpenNeuro CLI 官方文档为准：<https://docs.openneuro.org/packages/openneuro-cli.html>。

### 2. 先检查计划

```powershell
.\scripts\download_hbn_reve_gap.ps1 -PlanOnly
```

### 3. 下载元数据与全部 annex 文件

建议把 TB 级原始数据放在容量足够、且位于 Git 仓库外的磁盘：

```powershell
.\scripts\download_hbn_reve_gap.ps1 -OutputRoot 'D:\EEG\REVE_HBN_gap'
```

脚本对每个 accession 先执行：

```text
openneuro download <accession> <destination>
```

然后进入相应 DataLad 数据集执行 `datalad get -r .`，取得 git-annex 管理的大文件。只创建数据集结构而暂不拉取所有 annex 文件时可使用：

```powershell
.\scripts\download_hbn_reve_gap.ps1 -OutputRoot 'D:\EEG\REVE_HBN_gap' -MetadataOnly
```

OpenNeuro 公共数据集也可从网页下载；官方用户指南列出了浏览器、S3、DataLad 和 CLI 等方式：<https://docs.openneuro.org/user_guide.html>。

## I-CARE 如何下载

I-CARE Complete v2.0 是疾病类临床重症监护数据，不是匿名公共直链下载：

1. 在 BDSP 注册并登录。
2. 打开 <https://bdsp.io/content/bdsp-icare/2.0/>。
3. 阅读并签署 Data Use Agreement。
4. 获批后按页面 Files 区域提供的官方方式下载。

该版本包含 1,020 名患者，训练/验证/测试分别为 607/107/306；提供 18 通道双极 EEG 的按小时 5 分钟片段，最长覆盖 72 小时。没有授权时不能用脚本绕过 DUA，也不能把获批文件、账号或访问凭据上传到 GitHub。

## 复核原则

- “目录已有”不等于“数据已完整下载”。
- “REVE 使用”不等于“来源当前仍公开无门槛”。
- 父库与任务子集不重复相加。
- 只有可追溯的官方/论文时长进入总时长；未知值保持空白。
- GitHub 仅承载元数据、证据、下载脚本、工作簿和网站代码，不承载原始 EEG。
