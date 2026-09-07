import type { Metadata } from 'next';
import { CatalogLanding } from './CatalogLanding';
import { HistoryPanel } from './HistoryPanel';
export const metadata:Metadata={title:'Big Data of EEG',description:'按疾病、人数、时长和访问条件检索 EEG 数据集；核对来源、比较候选并导出当前目录。'};
export default function Home(){return <CatalogLanding modality="eeg"><HistoryPanel/></CatalogLanding>;}
