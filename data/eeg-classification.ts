// Team taxonomy is independent of the source's clinical population description.
// Confirmed by the project owner on 2026-09-06; the original snapshot is retained.
export const heedbClassification = {
  id: "EEG-0012",
  largeCategory: "03_Consciousness_and_State",
  smallCategory: "Sleep_Staging",
  focusType: "睡眠",
  note: "2026-09-06 团队分类：归入睡眠，不计入疾病汇总；官方来源仍为临床 EEG 库，此分类不表示全部记录为睡眠/PSG。",
  sourceUrl: "https://bdsp.io/content/harvard-eeg-db/4.1/",
} as const;

export function applyCatalogClassification<T extends { id: string; largeCategory: string; smallCategory: string; verification: string | null }>(row: T): T {
  if (row.id !== heedbClassification.id) return row;
  return {
    ...row,
    largeCategory: heedbClassification.largeCategory,
    smallCategory: heedbClassification.smallCategory,
    verification: `${row.verification ?? ""} ${heedbClassification.note}`.trim(),
  };
}

export function applyChecklistClassification<T extends { id: string; focusType: string; focusSubtype: string; nextAction: string }>(row: T): T {
  if (row.id !== heedbClassification.id) return row;
  return {
    ...row,
    focusType: heedbClassification.focusType,
    focusSubtype: heedbClassification.smallCategory,
    nextAction: `${row.nextAction} ${heedbClassification.note}`,
  };
}
