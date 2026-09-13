"use client";
import { lazy, Suspense, useState } from 'react';
const LegacyEegProgress=lazy(()=>import('./LegacyEegProgress'));
export function HistoryPanel() {
  const [loaded,setLoaded]=useState(false);
  return <details id="progress" className="db-history" onToggle={event=>{if(event.currentTarget.open)setLoaded(true);}}><summary>采集记录与数据预处理复核 <span>2026-09-13 当前复核 · 附历史记录</span></summary>{loaded&&<Suspense fallback={<p className="db-loading">加载复核记录…</p>}><LegacyEegProgress/></Suspense>}</details>;
}
