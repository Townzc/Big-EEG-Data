# NeuroAtlas 对照与下载说明

核验日期：2026-08-23

论文：Kontras et al., *NeuroAtlas: Benchmarking Foundation Models for Clinical EEG and Brain-Computer Interfaces*, arXiv:2605.14698。

## 结论

- NeuroAtlas 报告 42 个数据集、约 260,000 h。
- 分域口径为：癫痫约 58,000 h、睡眠约 201,000 h、BCI 约 159 h（正文 Figure 1 标为 170 h）。
- 脑龄约 193,000 h 来自 10 个睡眠队列，是复用范围，不能再加到 201,000 h 睡眠总量上。
- 原目录覆盖 36/42；补入下列 6 个来源后为 42/42。
- 疾病/健康来源级去重扩展覆盖约 346,490.7 h，高于 NeuroAtlas 全基准约 86,490.7 h（约 33.3%）。

## 本轮新增的 6 个来源

| 数据源 | NeuroAtlas 域 | 本目录分类 | 规模口径 | 当前访问 | 下载方法 |
|---|---|---|---|---|---|
| SeizeIT1 | Epilepsy | 疾病/临床 | NeuroAtlas 5.9k h；SzCORE 当前基准页 4,211 h；42 benchmark subjects | 当前不可获取 | KU Leuven 官方记录说明伦理批准已过期，不再接受申请；可改用 SeizeIT2 |
| DCSM | Sleep | 疾病/临床 | 255 patients / 255 overnight PSGs | 公开 | 官方 ERDA ZIP；或 `ut fetch --dataset dcsm --out_dir data/dcsm` |
| PN2026 | Sleep / Brain age | 疾病/临床 | public large training 6,600 PSG records / 1.2 TiB；唯一人数未明示 | 公开训练集 | `kaggle datasets download -d physionet/physionetchallenge2026datalargeversion` |
| STAGES | Sleep / Brain age | 疾病/临床 | 1,500 patients | 申请 | NSRR 审批后运行 `nsrr download stages/original` |
| UCDDB | Sleep | 疾病/临床 | 25 subjects / 25 full overnight PSGs | 公开 | `wget -r -N -c -np https://physionet.org/files/ucddb/1.0.0/` |
| ArithmeticTask | BCI / Cognition | 一般认知，不进疾病/健康重点 | 51 included participants、21 EEG electrodes、256 Hz | 公开 | OSF project `gh6q3` |

## 为什么我们的疾病/健康范围可以超过 26 万小时

来源级去重算法如下：

1. NeuroAtlas 癫痫 + 睡眠：`58,000 + 201,000 = 259,000 h`。
2. TUSZ 是 TUEG 的子集，不能两者相加。移除 NeuroAtlas 的 TUSZ 约 1,500 h，换入本地已完成下载的 TUEG 父集 27,077.3 h。
3. 加入 NeuroAtlas 42 源之外的 I-CARE 完整 consortium 文献范围 56,676 h。
4. 核心并集：`259,000 - 1,500 + 27,077.3 + 56,676 = 341,253.3 h`。
5. 再加入与 NeuroAtlas 25 个疾病/睡眠来源不重叠的本地已审计来源约 3,685.1 h、HBN Releases 1–9 已知 1,414.3 h、EEG-Bench 新增 138 h，得到扩展覆盖约 346,490.7 h。

核心并集已经高于 NeuroAtlas，因此超过结论不依赖 HBN 或小型数据集。这里比较的是“已收录且可追溯的来源覆盖”；本地已下载文件审计仍是 43,627.8 h，二者必须分开写。

## 分类复核规则

- 临床确诊、医院患者、疾病预后/治疗、病例-对照研究归“疾病/临床”。临床抑郁症（MDD）属于疾病类。
- 健康参考、流行病学、生命周期、睡眠健康或风险表型归“健康/人群”。仅量表高分不等于临床抑郁症。
- 睡眠分期是任务目录；临床 PSG 可同时进入疾病重点范围，健康/队列 PSG 可进入健康重点范围。
- DREAMER、ASCERTAIN、MAHNOB-HCI 和 ArithmeticTask 是情感/认知实验，不因为使用 EEG 或被 NeuroAtlas 采用就归疾病类。
- 未由官方/论文给出总时长的来源保持空白，下载后再以 EDF/BDF/BrainVision 文件头审计。

## 主要证据入口

- NeuroAtlas: https://arxiv.org/abs/2605.14698
- DCSM: https://erda.ku.dk/public/archives/db553715ecbe1f3ac66c1dc569826eef/published-archive.html
- PhysioNet Challenge 2026: https://moody-challenge.physionet.org/2026/
- STAGES: https://sleepdata.org/datasets/stages
- UCDDB: https://physionet.org/content/ucddb/1.0.0/
- SeizeIT1: https://rdr.kuleuven.be/dataset.xhtml?persistentId=doi:10.48804/P5Q0OJ
- ArithmeticTask paper/data link: https://pmc.ncbi.nlm.nih.gov/articles/PMC6687903/
- I-CARE paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC10841086/
