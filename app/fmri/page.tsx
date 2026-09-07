import type { Metadata } from 'next';
import { CatalogLanding } from '../CatalogLanding';
import { foundationPapers } from '../../data/fmri-papers';
export const metadata:Metadata={title:'Big Data of fMRI',description:'按疾病、人数、BOLD 时长、年龄和采集协议检索 fMRI 数据集；比较与导出有来源证据的结果。'};
export default function FmriPage(){return <CatalogLanding modality="fmri"><details className="db-history" id="evidence"><summary>研究依据与模型论文 <span>从论文反查数据来源</span></summary><div className="paper-grid db-papers">{foundationPapers.map(paper=><article key={paper.title}><span>{paper.venue}</span><h3><a href={paper.url} target="_blank" rel="noreferrer">{paper.title} ↗</a></h3><strong>{paper.datasets}</strong><p>{paper.note}</p></article>)}</div></details></CatalogLanding>;}
