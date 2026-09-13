# UCDDB 微伏确认与统一预处理（2026-09-13 / batch118）

负责人本次确认：“EEG-0606 UCDDB  也是uv”。已将物理单位依据登记为 **项目负责人确认 μV**，从原始 REC 重跑全部 25 份信号，并完成独立校验。此前 25 份 native_ADC_count 是历史比对副本，保留但不重复计数。

**结果：25 人、25 份、173.360556 信号小时，2 路 EEG（C3-A2、C4-A1），128→200 Hz，3,428 条呼吸事件。** 输出为 float32 `[channel,time]` NPZ + 同名 JSON，并有记录/事件 CSV 清单，幅值采用 μV/100。

**换算依据**

单位的确认适用于物理量。源 EDF 的 EEG 存储是 int16 ADC，头部仍写 NV、physical min/max=0/1、digital min/max=-2048/2047。依照 [EDF 规范](https://www.edfplus.info/specs/edf.html)，物理量需使用头部增益和偏移：

```text
x_uV = (ADC - digital_min) * (physical_max - physical_min)
       / (digital_max - digital_min) + physical_min
     = (ADC + 2048) / 4095
x_model = processed_x_uV / 100
```

没有假定一个 ADC 计数等于 1 μV。仅修正读取时的物理单位解释；源文件没有改写。头部给出的 0..1 μV 范围保留并标记 `source_header_physical_span_le_1uv`，不根据波形幅值猜测额外增益。

**25 份源记录均存在头部量程矛盾**：实际 ADC 最大绝对值为 11,600–13,632，超出声明的 -2048..2047，已逐份标记 `source_exceeds_declared_edf_digital_range`。本次沿用声明增益；物理单位已确认，但头部模拟增益本身仍缺独立校准证据。下述读取器与逐点对照验证的是换算实现一致，不能消除这项源数据限制。

**处理与核验**

保留 0.3–35 Hz 采集带宽和原参考，沿用补低通、50 Hz notch、200 Hz 与一次 /100 缩放；不做 z-score、幅值裁剪或额外重参考。全部产物逐值检查有限性并重算信号 SHA-256，核对形状、采样率、导联顺序、完整源样点、patch、身份和事件范围。

25 个源 REC 均与发布者 SHA-256 一致。每份临时 EDF 仅修改两路 EEG 的单位字段，分别在开头、中间、结尾用 MNE 独立读取，与直接 ADC→μV 公式对照，全部通过。新旧产物还进行了全部样点的线性换算对照，核验增益、偏移及 /100，没有重复缩放。临时副本已清理，源文件和历史隔离产物均保留。

**保留的 QC 与标签限制**

除上述两项头部量程 QC 外，2 份产物保留 `flatline_ge_5s` 低变化标记。所有这些标记均进入 JSON、CSV 和汇总；联合清单按既有单位/身份规则纳入记录，未将其宣称为无 QC 问题的数据。

睡眠分期文件没有明确 epoch 起点，序列完整保留；不臆造与 EEG 的时间对齐。2 份文件共 15 个代码 8 在 [发布者说明](https://physionet.org/content/ucddb/1.0.0/) 中没有定义，继续标记。AHI 与人口学字段保留，未套用自行设定的二分类阈值。这些标签限制与本次单位修正分别记录。

**当前汇总**

当前 97 项疾病条目为 **68 项有统一格式产物、0 项已下载仍待执行、29 项未下载**。标准疾病产物合计 189,944 份 / 45,487.667001 h；各库可追踪身份合计 28,938，按有证据共享关系合并后 25,494，含对照且不保证跨匿名库全球唯一。单位有依据且身份可追踪的联合视图为 48 项 / 156,159 份 / 44,742.894685 h，其他 QC 仍保留。

标准产物：`results/disease_v1/batch118/ucddb/`。当前联合清单：`results/disease_audit_20260913_batch118/disease_unit_confirmed_joint_manifest.csv`；使用 `disease_manifest_loader114.load_record`，以联合 CSV split 为准。旧 67 项的有效 split 完全保留；确认身份、完全重复信号及 Iowa 候选组跨 split 均为 0。

复现：`eeg_preprocess_batch118.py`、`configs/disease_v1_batch118.yaml`、`validate_ucddb118.py`、`consolidate_ucddb118.py`；证据在 `provenance/ucddb118/`。计算任务 2173617，合并任务 2173619，补充量程 QC 后最终复核与合并任务 2173629，均正常完成。
