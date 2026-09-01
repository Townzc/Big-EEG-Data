export type FoundationPaperAudit = {
  model: string;
  paperUrl: string;
  datasets: string;
  subjects: string;
  headlineHours: string;
  comparableRecordingHours: number | null;
  basis: "recording" | "channel" | "processed-window" | "unavailable";
  interpretation: string;
};

export const foundationPaperAudits: FoundationPaperAudit[] = [
  {
    model: "SingLEM",
    paperUrl: "https://arxiv.org/pdf/2509.17920",
    datasets: "71 public datasets",
    subjects: "≈9,200",
    headlineHours: "≈357,000 single-channel h; Table I sums to 10,179.98 recording h",
    comparableRecordingHours: 10179.98,
    basis: "channel",
    interpretation: "35.7 万是每条记录时长乘通道数后的 channel-hours；网页只采用 Table I 的多通道记录小时，并仅补入可唯一映射的行。",
  },
  {
    model: "REVE",
    paperUrl: "https://proceedings.neurips.cc/paper_files/paper/2025/file/20a917f77773ac0fa8bea2bdd6606b66-Paper-Conference.pdf",
    datasets: "92 sources",
    subjects: "24,274",
    headlineHours: "61,415 h after collection/filtering",
    comparableRecordingHours: 61415,
    basis: "recording",
    interpretation: "论文给出预训练汇编总时长及平台/类别汇总，但不逐数据集给小时；与目录存在重叠，不能再整体加到网站总数。",
  },
  {
    model: "CBraMod",
    paperUrl: "https://arxiv.org/pdf/2412.07236",
    datasets: "TUEG",
    subjects: "14,987",
    headlineHours: "27,062 raw h → 1,109,545 × 30 s = 9,246.2 processed h",
    comparableRecordingHours: 27062,
    basis: "processed-window",
    interpretation: "先删短记录、首尾各 1 分钟和异常片段，再按保留的 30 秒窗计量；网页保留 TUEG 原始记录小时。",
  },
  {
    model: "LaBraM",
    paperUrl: "https://arxiv.org/pdf/2405.18765",
    datasets: "≈20 public + self-collected sources",
    subjects: "paper-specific cohort mix",
    headlineHours: "2,534.78 h",
    comparableRecordingHours: 2534.78,
    basis: "recording",
    interpretation: "附录逐来源报告小时；包含 TUH 子集和 342.23 h 自采数据，整表不可与目录总量重复相加。",
  },
  {
    model: "Neuro-GPT",
    paperUrl: "https://arxiv.org/pdf/2311.03764",
    datasets: "selected TUH subset",
    subjects: "20,000 recordings",
    headlineHours: "5,656 processed h",
    comparableRecordingHours: null,
    basis: "processed-window",
    interpretation: "这是选取并处理后的 20,000 条 TUH 记录，不是完整 TUEG 官方总时长。",
  },
  {
    model: "BIOT",
    paperUrl: "https://arxiv.org/pdf/2305.10351",
    datasets: "SHHS, TUAB, TUEV, CHB-MIT + proprietary PREST",
    subjects: "varies by benchmark",
    headlineHours: "reports segment counts × 10/30 s, not raw corpus hours",
    comparableRecordingHours: null,
    basis: "processed-window",
    interpretation: "如 SHHS 5,093,522 个 30 秒样本可换算为 42,446 个模型样本小时，但可能受切窗/纳入规则影响，不能冒充原始记录总时长。",
  },
  {
    model: "BENDR",
    paperUrl: "https://arxiv.org/pdf/2101.12037",
    datasets: "TUEG v1.1/v1.2",
    subjects: ">10,000",
    headlineHours: "not reported (≈1.5 TB reported)",
    comparableRecordingHours: null,
    basis: "unavailable",
    interpretation: "论文给容量和人数但没有小时；不能用数据大小直接反推可靠时长。",
  },
  {
    model: "EEGPT",
    paperUrl: "https://proceedings.neurips.cc/paper_files/paper/2024/hash/4540d267eeec4e5dbd9dae9448f0b739-Abstract-Conference.html",
    datasets: "PhysioMI, HGD, TSU, SEED, M3CV",
    subjects: "279 dataset-subject entries",
    headlineHours: "not reported",
    comparableRecordingHours: null,
    basis: "unavailable",
    interpretation: "论文列出预训练数据集和人数，没有提供可复算的总记录小时。",
  },
];
