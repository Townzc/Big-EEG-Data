# 2026-09-10 数据下载与网站更新

VitalDB 新增为 **EEG-0609**，归入 **意识与状态 / Anesthesia**。这是以任务为依据的分类，仍保留围术期临床患者的人群说明。EEG-0077 已在 cognitive 类，本次明确保留“认知与情感 / Attention_and_ERP”。BEED（EEG-0007）按项目负责人确认，从当前搜索、下载清单和统计中删除；历史原始 JSON 和排除审计记录保留。

## VitalDB 的范围

- [PhysioNet 1.0.0](https://physionet.org/content/vitaldb/1.0.0/) 全库为 6,388 次手术、6,090 名独立患者；下载全部 `.vital` 和附属临床/实验室元数据。
- 2026-09-10 [官方 API 轨道清单](https://api.vitaldb.net/trks)中，`BIS/EEG1_WAV` 和 `BIS/EEG2_WAV` 各对应 5,871 个病例，两组病例集合相同。按 `clinical_data.csv` 的 `subjectid` 合并，为 5,623 名患者。`BIS/BIS` 数值轨道为 5,867 个病例。早期约 5,566 的描述未作为当前准确计数。
- [官方通道定义](https://physionet.org/files/vitaldb/1.0.0/track_names.csv)确认两路 EEG 为 128 Hz、μV。BIS 数值是派生指标，不能替代 EEG 波形。
- API 的轨道存在计数与 PhysioNet 静态文件范围分别记录。此轮没有将病例数换算成 EEG 小时，也没有宣称全部轨道通过信号质量审计。
- 下载目录：`EEG-dataset-collection/datasets/03_Consciousness_and_State/Anesthesia/VitalDB/`。脚本使用官方 `s3://physionet-open/vitaldb/1.0.0/` 镜像，并对每个文件验证发布者 SHA-256。

**下载终态：** 6,395/6,395 个源文件（含 6,388 个 `.vital`）全部通过发布者 SHA-256，失败 0；共 102,456,727,132 bytes，约 102.457 GB / 95.420 GiB。终态时间 `2026-09-10T07:57:21.624101+00:00`，Slurm `2162561`。

## EEG-0053 的下载来源

服务器和计算节点对用户提供的 6 个 IEEE S3 ZIP 均返回 HTTP 403；对单个 MAT、区域地址及对象列表的匿名请求也被拒绝。该结果不证明必须购买学校订阅，因此取消此前“舍弃下载 / 需要学校订阅”的判断。

随后从[公开 GitHub 镜像的固定提交](https://github.com/Ojesh-Mundale/AI-based-ADHD-detection/tree/994b10f0293b355a1ab7e0e4e9707c8efde3aac8/data)取得 **121 个原始命名 MAT**，与用户清单逐名匹配：61 ADHD、60 Control。所有文件通过 Git blob 哈希、SHA-256、MAT 可读性、19 通道及有限数值检查，共 **33,110,477 bytes**。按来源公布的 128 Hz，2,166,383 个每通道采样点对应 **4.7013519965 记录小时**，不乘通道数。

目录为 `EEG-dataset-collection/datasets/02_Biometrics_and_Disease/Mental_and_Developmental_Disorders/EEG_Data_for_ADHD/`。这是第三方镜像；无法与不可访问的 IEEE 对象做字节比较。`Channel_Labels.docx` 和 `Standard-10-20-Cap19new.ced` 未在镜像中提供，尚未取得；不要据其他论文的列举顺序直接重排矩阵通道。官方失败记录与镜像成功记录分别保存在 `manifests/current/EEG-0053/`。

## 预处理备注

| 数据集 | 本次登记 | 尚未执行/确认的内容 |
| --- | --- | --- |
| EEG-0006 AES | 项目负责人确认 μV、颅外/颅骨固定单极参考，建议 Bipolar 或 CAR；犬/人分别处理，400/5000 Hz 为概括值，实际按文件采样率 | 不将用户提供的信息冒充 MAT 头或发布者声明；本次不标记预处理完成 |
| EEG-0018 UPenn | 项目负责人确认 μV、数据已乘增益、单极参考，建议 Bipolar 或 CAR；通道跨度大，需重采样对齐时钟 | 不重复施加增益；本次不标记预处理完成 |
| EEG-0058 MODMA | 已下载；项目负责人已发邮件询问单位、参考等细节 | 等待作者回复 |
| EEG-0609 VitalDB | 保留发布者参考；两路 EEG 使用 1/128 s 采样间隔 | 原始 Nyquist 频率为 64 Hz，不直接套用 75 Hz 滤波上限；具体参考映射、有效信号时长仍需审计 |

源元数据摘要及 SHA-256 见 `data/catalog-update-20260910-evidence.json`。网站、详情分片、CSV、JSON 和当前 Excel 由同一修订数据生成。不可变历史文件 `public/catalog-data.json` 未修改。

验证包括项目 24 项测试、目录指标检查、ESLint、TypeScript，以及 Sites / Vercel 两种生产构建。下载完成状态以服务器终端 manifest 为依据，SHA-256 校验完成不等同于预处理完成。
