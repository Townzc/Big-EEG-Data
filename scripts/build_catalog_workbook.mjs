import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { exportColumns as columns } from '../lib/catalog.ts';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('data/catalog-manifest.json', root)));
const preprocessingBatch = JSON.parse(await fs.readFile(new URL('data/pending-six-preprocessing-20260913.json', root)));
const { preprocessing } = JSON.parse(await fs.readFile(new URL('data/eeg-catalog-reconciliation.json', root)));
const out = new URL(`outputs/catalog-update-${manifest.reviewDate.replaceAll('-', '')}/`, root);
await fs.mkdir(out, { recursive: true });
const workbook = new ExcelJS.Workbook();
workbook.creator = 'Big EEG Data catalog generator';
workbook.created = new Date(`${manifest.reviewDate}T00:00:00Z`);
workbook.modified = workbook.created;
workbook.calcProperties.fullCalcOnLoad = true;

const columnName = (index) => {
  let text = '';
  while (index) {
    index -= 1;
    text = String.fromCharCode(65 + index % 26) + text;
    index = Math.floor(index / 26);
  }
  return text;
};
const sanitize = (value) => typeof value === 'string' && /^\s*[=+@-]/.test(value) ? `'${value}` : value ?? null;
const sheetNames = { eeg: 'EEG目录', fmri: 'fMRI目录' };
const counts = {};
const inputs = {};
const teal = 'FF177F77';
const navy = 'FF173B5E';
const body = 'FF233D46';
const guide = workbook.addWorksheet('说明与修订', { views: [{ state: 'frozen', ySplit: 5, activeCell: 'A6' }] });

for (const modality of ['eeg', 'fmri']) {
  const input = JSON.parse(await fs.readFile(new URL(`public/${modality}-catalog-current.json`, root)));
  if (input.version !== manifest.version) throw new Error(`Stale ${modality} catalog export`);
  const rows = input.rows;
  inputs[modality] = rows;
  counts[modality] = rows.length;
  const sheet = workbook.addWorksheet(sheetNames[modality], { views: [{ state: 'frozen', ySplit: 4, activeCell: 'A5' }] });
  sheet.properties.showGridLines = false;
  sheet.mergeCells('A1:H1');
  sheet.getCell('A1').value = `BIG DATA · ${modality === 'eeg' ? 'EEG' : 'fMRI'} 当前目录`;
  sheet.mergeCells('A2:H2');
  sheet.getCell('A2').value = `${rows.length} 条 · version ${manifest.version} · 目录修订 ${manifest.reviewDate} · 数值范围见 subjectScope / hoursScope`;
  sheet.getRow(4).values = [...columns];
  for (const row of rows) sheet.addRow(columns.map((key) => sanitize(row[key])));
  sheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: rows.length + 4, column: columns.length } };

  sheet.getRow(1).height = 38;
  sheet.getRow(1).font = { name: 'Microsoft YaHei', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } };
  sheet.getRow(2).height = 29;
  sheet.getRow(2).font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF60776B' } };
  sheet.getRow(4).height = 30;
  sheet.getRow(4).font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: teal } };
  sheet.getRow(4).alignment = { vertical: 'middle', wrapText: true };

  columns.forEach((key, index) => {
    const column = sheet.getColumn(index + 1);
    column.width = key === 'name' ? 66
      : ['subjectScope', 'hoursScope', 'relations'].includes(key) ? 74
      : ['url', 'release', 'subcategory', 'aliases', 'acquisitionNote'].includes(key) ? 45
      : 19;
    column.font = { name: 'Microsoft YaHei', size: 10, color: { argb: body } };
    column.alignment = { vertical: 'top', wrapText: true };
    if (['subjects', 'records', 'localFiles', 'localBytes', 'channels', 'channelMax'].includes(key)) column.numFmt = '#,##0';
    if (['hours', 'localHours', 'sampling', 'samplingMax', 'ageMin', 'ageMax'].includes(key)) column.numFmt = '#,##0.00';
  });
}

guide.properties.showGridLines = false;
guide.mergeCells('A1:F1');
guide.getCell('A1').value = 'BIG DATA · 当前研究目录';
guide.mergeCells('A2:F2');
guide.getCell('A2').value = 'EEG / fMRI · 相同来源版本生成网页索引、CSV、JSON 与此工作簿';
guide.getCell('A3').value = '目录版本';
guide.getCell('B3').value = manifest.version;
guide.addRow([]);
guide.getRow(5).values = ['模态', '目录条数', '有受试者值', '有记录小时'];
const subjectColumn = columnName(columns.indexOf('subjects') + 1);
const hoursColumn = columnName(columns.indexOf('hours') + 1);
for (const [offset, modality] of ['eeg', 'fmri'].entries()) {
  const rowNumber = offset + 6;
  const last = counts[modality] + 4;
  guide.getCell(`A${rowNumber}`).value = modality.toUpperCase();
  guide.getCell(`B${rowNumber}`).value = {
    formula: `COUNTA('${sheetNames[modality]}'!A5:A${last})`, result: counts[modality],
  };
  guide.getCell(`C${rowNumber}`).value = {
    formula: `COUNT('${sheetNames[modality]}'!${subjectColumn}5:${subjectColumn}${last})`,
    result: inputs[modality].filter((row) => row.subjects != null).length,
  };
  guide.getCell(`D${rowNumber}`).value = {
    formula: `COUNT('${sheetNames[modality]}'!${hoursColumn}5:${hoursColumn}${last})`,
    result: inputs[modality].filter((row) => row.hours != null).length,
  };
}

const notes = [
  ['统计范围', '此工作簿覆盖行数与网页相同。网页筛选汇总按当前范围处理已确认 parent/child；不要直接对全部行小时或人数求和并称为全站去重值。'],
  ['当前 EEG', `${manifest.modalities.eeg.count} 行、${manifest.modalities.eeg.families} source families、${manifest.modalities.eeg.acquisitionPackages} acquisition packages。关系去重统计由 manifest 提供；未知值保持空白。`],
  ['排除与别名', '眼动-only EEG-0050、无法恢复 EEG 波形的 BEED（EEG-0007）保留在 exclusion ledger，不进入当前 EEG 搜索与统计；EEG-0488 合并为 EEG-0064 alias，EEG-0072/0088 也保留为旧 adapter ID alias。'],
  ['2026-09-10 更新', '新增 VitalDB（EEG-0609）：意识与状态 / Anesthesia，2 通道、128 Hz。EEG-0077 确认归 cognitive。AES、UPenn 的 μV/参考信息依据项目负责人确认登记；MODMA 等待作者邮件回复。EEG-0053 的 121 个原始 MAT 由公开镜像取得，官方 S3 仍为 403。'],
  ['时长证据', 'reported=来源报告；calculated=文件/协议计算；estimated=抽样或完成率假设估算；unavailable=未知。'],
  ['采集包', 'MORGOTH 的 16 个逻辑行保留检索，但只计一个 BDSP acquisition package。逻辑行、family、申请流程和物理下载包不是同一口径。'],
  ['当前疾病预处理', `${preprocessingBatch.catalogEntries} 个疾病条目：${preprocessingBatch.standardProcessedEntries} 个有统一格式产物，${preprocessingBatch.downloadedCalibrationBlockedEntries} 个已下载尚未执行统一格式处理，${preprocessingBatch.notDownloadedEntries} 个未下载。${preprocessing.outputs.toLocaleString('en-US')} 份标准产物 / ${preprocessing.signalHours.toFixed(6)} h。UCDDB 已纳入负责人确认 μV 的产物，EDF 头部量程矛盾及增益证据限制保留；其他单位推断、人物映射与 QC 限制见完整报告。`],
  ['历史预处理口径', '旧 raw-continuous 快照为 62/99 canonical targets，排除重复分支、non-EEG、processed-only 和未通过校验的部分输出；该 99 项跨分类清单与当前 97 个疾病条目不是同一分母。'],
  ['MIPDB', '本地 legacy MAT 118 participants / 1,515 records / 126.0211 h；NEMAR BIDS 111 participants。原 CMI 采集 Cz/vertex，NEMAR reference n/a，本地 MAT 最终参考未解。'],
  ['Kaggle', 'AES/HMS/UPenn/Schizophrenia 全量审计范围与 production gates 见 acquisitionStatus/acquisitionNote；下载完成不自动等于可训练。'],
  ['历史快照', '原 563 行 catalog-data.json 和历史工作簿独立保存。此文件只使用当前修订后的目录，不覆盖历史证据。'],
  ['来源', '每行 url 指向主入口；网页详情另提供数值证据、来源关系、核查日期与许可。'],
];
for (let index = 0; index < notes.length; index += 1) {
  const row = index + 10;
  guide.getCell(`A${row}`).value = notes[index][0];
  guide.mergeCells(`B${row}:F${row}`);
  guide.getCell(`B${row}`).value = notes[index][1];
  guide.getRow(row).height = 58;
  guide.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7F1EB' } };
}
guide.columns.forEach((column, index) => { column.width = index === 0 ? 18 : 25; });
guide.eachRow((row) => {
  row.font = { name: 'Microsoft YaHei', size: 11, color: { argb: 'FF243F48' } };
  row.alignment = { vertical: 'middle', wrapText: true };
});
guide.getRow(1).height = 46;
guide.getRow(1).font = { name: 'Microsoft YaHei', size: 21, bold: true, color: { argb: 'FFFFFFFF' } };
guide.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } };
guide.getRow(2).height = 32;
guide.getRow(5).height = 29;
guide.getRow(5).font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
guide.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: teal } };

const outputUrl = new URL('brain-data-catalog-current.xlsx', out);
await workbook.xlsx.writeFile(outputUrl.pathname);
await fs.copyFile(outputUrl, new URL('public/brain-data-catalog-current.xlsx', root));
await fs.writeFile(new URL('data/catalog-workbook-version.json', root), JSON.stringify({
  version: manifest.version,
  counts,
  generatedAt: manifest.reviewDate,
  generator: 'exceljs',
}, null, 2) + '\n');

const verification = new ExcelJS.Workbook();
await verification.xlsx.readFile(outputUrl.pathname);
assert.equal(verification.getWorksheet('EEG目录').lastRow.number, counts.eeg + 4);
assert.equal(verification.getWorksheet('fMRI目录').lastRow.number, counts.fmri + 4);
assert.match(verification.getWorksheet('说明与修订').getCell('C6').value.formula, new RegExp(`!${subjectColumn}5:`));
assert.match(verification.getWorksheet('说明与修订').getCell('D6').value.formula, new RegExp(`!${hoursColumn}5:`));
console.log(`Workbook exported and verified: ${counts.eeg} EEG / ${counts.fmri} fMRI; ${manifest.version}; subjects=${subjectColumn}, hours=${hoursColumn}`);
