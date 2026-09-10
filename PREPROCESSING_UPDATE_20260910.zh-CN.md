# VitalDB 与 EEG-0053 预处理完成记录（2026-09-10）

沿用既有流程：完整记录/连续段保存、200 Hz、float32、JSON 来源与 QC、按受试者划分、1 秒 patch 仅在 dataloader 生成。两者原始采样率均为 128 Hz，因此沿用奈奎斯特保护，将请求的 0.1–75 Hz 限制为 0.1–62.72 Hz。没有增加 z-score、ICA、ASR、平均重参考或按幅值删样本。

| 数据集 | 完成范围 | 输出 | 处理方式 |
| --- | --- | --- | --- |
| VitalDB / EEG-0609 | 5,565 个病例 / 5,344 名患者 | 16,785 个连续段，18,097.513249 信号小时，96,852,696,463 bytes | 60 Hz 陷波、200 Hz、已核实 μV/100；意识与状态 / 麻醉 |
| EEG-0053 ADHD/Control | 121 人：61 ADHD / 60 Control | 121 份完整记录，4.701360 小时，240,201,245 bytes | 50 Hz 陷波、200 Hz；单位未核实，保留原数值尺度并隔离 |

VitalDB 的全部 6,388 个源病例都已核对：标准处理 5,565 例、无 EEG 波形 822 例、时钟隔离 1 例。本地含 EEG 的原始范围为 5,566 个病例 / 5,345 名患者。本次使用 PhysioNet 1.0.0 静态文件；2026-09-10 的 API 清单为 5,871 病例 / 5,623 患者，是另一份快照。每个源文件均与发布者 SHA-256 清单一致；正常分支逐份检查数据内容和信号哈希，并核对患者及完全相同信号没有跨训练/验证/测试集合。

读取器仅删除“同一时间戳且原始字节完全相同”的重复数据包；不同原生时钟的交错序列各自保存，断点不插值。剔除的单侧未配对采样数为 EEG1 32 / EEG2 80，原包仍保留在源文件。存储信号小时分别统计各条连续序列；病例时间轴取并集后的覆盖为 18,084.629427 小时。病例 **4552** 无法唯一确定包衔接，全部原始值、时间戳和包长已无损保存到单独隔离 NPZ，并通过逐字节检查，按原生数据包格式单独记录。病例 2155 的每路 112 个极大数值按官方 `vitaldb==1.7.2` 波形读取规则（正值大于 4e9 或无穷值转为缺失）在滤波前标记缺失并断开；没有增加普通 EEG 幅值删样本规则。原生 BIS 导联名称和参考保留，未猜测标准头皮电极映射。

ADHD 的 121 个 MAT 来自固定 commit 的公开镜像，官方 S3 此次仍为 403，不能声称与官方源逐字节一致。随后补回的 `Channel_Labels.docx` 镜像明确了 19 列顺序：Fp1、Fp2、F3、F4、C3、C4、P3、P4、O1、O2、F7、F8、T7、T8、P7、P8、Fz、Cz、Pz。幅值单位和增益仍没有可靠说明，坐标 CED 也未取得，因此未套用 μV/100。划分为 98/7/16 人，保留 121 个诊断队列事件；原始总时长为 4.7013519965 小时，重采样舍入合计仅增加 0.0278125 秒。

两套全量校验通过：VitalDB 16,785/16,785，ADHD 121/121，均为零校验错误。VitalDB 保留的 20 组完全相同信号已完成划分隔离。另有 12 项读取/幅值回归检查，以及 10 个密集重叠病例的原始时钟累计误差与包守恒检查。未知单位、未知导联推导和时钟隔离范围均保留，不计入历史 63/99 严格疾病预处理 KPI。

服务器项目：`/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/EEG-data-process/`。主 README、`results/new_datasets_preprocessing_20260910.md`、配置 `configs/new_datasets_batch112.yaml` / `new_datasets_batch113.yaml` 和全部校验报告已更新。完整数字与代码/config 哈希见 [机器可读证据](data/new-datasets-preprocessing-20260910.json)。

来源：[VitalDB / PhysioNet](https://physionet.org/content/vitaldb/1.0.0/)、[ADHD 原始发布页](https://ieee-dataport.org/open-access/eeg-data-adhd-control-children)、[ADHD 信号镜像](https://github.com/Ojesh-Mundale/AI-based-ADHD-detection/tree/994b10f0293b355a1ab7e0e4e9707c8efde3aac8/data)、[通道文档镜像](https://github.com/Mahendraydv/Diagnosis-and-prediction-of-ADHD-disease-using-Machine-Learning-method-on-EEG-data/blob/f94767e87d03a45e65c4a18730de6af5cf880e4f/Channel_Labels.docx)。
