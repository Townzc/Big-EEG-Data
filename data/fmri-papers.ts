export const foundationPapers = [
  {
    venue: "ICLR 2024",
    title: "BrainLM: a foundation model for brain activity recordings",
    url: "https://openreview.net/pdf/9b47441fd8280d26dca4ee62f9ee211888cd42d6.pdf",
    datasets: "UK Biobank · HCP Young Adult",
    note: "77,298 recordings、约 6,700 fMRI 小时；为本目录的大规模时长核查提供重要交叉参照。",
  },
  {
    venue: "NeurIPS 2024",
    title: "Brain-JEPA: Brain Dynamics Foundation Model",
    url: "https://papers.neurips.cc/paper_files/paper/2024/file/9c3828adf1500f5de3c56f6550dfe43c-Paper-Conference.pdf",
    datasets: "UK Biobank · HCP Aging · ADNI",
    note: "预训练使用 40,162 名 UKB 参与者，并在 HCP-Aging 与 ADNI 外部队列验证。",
  },
  {
    venue: "NeurIPS 2023",
    title: "SwiFT: Swin 4D fMRI Transformer",
    url: "https://papers.neurips.cc/paper_files/paper/2023/file/8313b1920ee9c78d846c5798c1ce48be-Paper-Conference.pdf",
    datasets: "ABCD · HCP Young Adult · UK Biobank",
    note: "报告的建模队列为 ABCD 9,128、HCP 1,084、UKB 5,935；提示总发布人数与实际建模样本必须分开记录。",
  },
  {
    venue: "Nature Biomedical Engineering 2026",
    title: "NeuroSTORM: a foundation model for human brain dynamics",
    url: "https://doi.org/10.1038/s41551-026-01666-y",
    datasets: "UKB · ABCD · HCP · ADHD-200 · ABIDE · CNP · COBRE · HBN · PNC · REST-meta-MDD + task cohorts",
    note: "覆盖人群、临床、药理和任务态数据，是这次补充临床与干预类别的重要数据集路线图。",
  },
  {
    venue: "NeuroImage 2021",
    title: "Scan Once, Analyse Many: Using large open-access neuroimaging datasets",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8111663/",
    datasets: "HCP · UK Biobank · ABCD · CamCAN · OpenNeuro · INDI families",
    note: "用于交叉检查主要公共倡议、访问边界和队列差异；目录仍优先引用各项目官网与原始数据论文。",
  },
] as const;
