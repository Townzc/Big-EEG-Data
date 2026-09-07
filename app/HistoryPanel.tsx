"use client";
import { lazy, Suspense, useState } from 'react';
const LegacyEegProgress=lazy(()=>import('./LegacyEegProgress'));
export function HistoryPanel() {
  const [loaded,setLoaded]=useState(false);
  return <details id="progress" className="db-history" onToggle={event=>{if(event.currentTarget.open)setLoaded(true);}}><summary>历史采集记录与数据预处理方法 <span>2026-08 / 09 原快照</span></summary>{loaded&&<Suspense fallback={<p className="db-loading">加载历史记录…</p>}><LegacyEegProgress/></Suspense>}</details>;
}
