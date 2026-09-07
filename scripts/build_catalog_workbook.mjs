import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exportColumns as columns } from '../lib/catalog.ts';
const {Workbook,SpreadsheetFile}=await import(process.env.CATALOG_ARTIFACT_TOOL_MODULE?pathToFileURL(process.env.CATALOG_ARTIFACT_TOOL_MODULE).href:'@oai/artifact-tool');
const root=new URL('../',import.meta.url);const out=new URL('outputs/catalog-update-20260906/',root);
await fs.mkdir(out,{recursive:true});
const manifest=JSON.parse(await fs.readFile(new URL('data/catalog-manifest.json',root)));
const workbook=Workbook.create();const guide=workbook.worksheets.add('说明与修订');
const col=n=>{let text='';while(n){n--;text=String.fromCharCode(65+n%26)+text;n=Math.floor(n/26);}return text;};
const sheetNames={eeg:'EEG目录',fmri:'fMRI目录'};const counts={};
for(const modality of ['eeg','fmri']) {
  const input=JSON.parse(await fs.readFile(new URL(`public/${modality}-catalog-current.json`,root)));
  if(input.version!==manifest.version)throw new Error('Stale catalog export');
  const rows=input.rows;counts[modality]=rows.length;const sheet=workbook.worksheets.add(sheetNames[modality]);
  sheet.showGridLines=false;sheet.tabColor='#177F77';
  sheet.getRange('A1:H1').merge();sheet.getRange('A1').values=[[`BIG DATA · ${modality==='eeg'?'EEG':'fMRI'} 当前目录`]];
  sheet.getRange('A2:H2').merge();sheet.getRange('A2').values=[[`${rows.length} 条 · version ${manifest.version} · 目录修订 ${manifest.reviewDate} · 数值范围见 subjectScope / hoursScope`]];
  sheet.getRange(`A4:${col(columns.length)}4`).values=[columns];
  const matrix=rows.map(row=>columns.map(key=>{const value=row[key];return typeof value==='string'&&/^\s*[=+@-]/.test(value)?`'${value}`:value??null;}));
  sheet.getRange(`A5:${col(columns.length)}${rows.length+4}`).values=matrix;
  const used=sheet.getRange(`A1:${col(columns.length)}${rows.length+4}`);used.format.font={name:'Microsoft YaHei',size:10,color:'#233D46'};used.format.verticalAlignment='top';
  used.format.columnWidth=19;
  sheet.getRange(`C1:C${rows.length+4}`).format.columnWidth=66;
  for(const key of ['subjectScope','hoursScope','relations'])sheet.getRange(`${col(columns.indexOf(key)+1)}1:${col(columns.indexOf(key)+1)}${rows.length+4}`).format.columnWidth=74;
  for(const key of ['url','release','subcategory','aliases'])sheet.getRange(`${col(columns.indexOf(key)+1)}1:${col(columns.indexOf(key)+1)}${rows.length+4}`).format.columnWidth=45;
  sheet.getRange(`A4:${col(columns.length)}${rows.length+4}`).format.wrapText=true;
  sheet.getRange(`A5:${col(columns.length)}${rows.length+4}`).format.autofitRows();
  sheet.getRange('A1:H1').format={fill:'#173B5E',font:{name:'Microsoft YaHei',size:18,bold:true,color:'#FFFFFF'},rowHeight:38};
  sheet.getRange('A2:H2').format={font:{name:'Microsoft YaHei',size:10,color:'#60776B'},rowHeight:29};
  sheet.getRange(`A4:${col(columns.length)}4`).format={fill:'#177F77',font:{name:'Microsoft YaHei',bold:true,color:'#FFFFFF'},rowHeight:30,wrapText:true};
  const table=sheet.tables.add(`A4:${col(columns.length)}${rows.length+4}`,true,`${modality.toUpperCase()}CurrentCatalog`);table.showFilterButton=true;
  sheet.freezePanes.freezeRows(4);
  for(const key of ['subjects','records','channels','channelMax'])sheet.getRange(`${col(columns.indexOf(key)+1)}5:${col(columns.indexOf(key)+1)}${rows.length+4}`).setNumberFormat('#,##0');
  for(const key of ['hours','localHours','sampling','samplingMax','ageMin','ageMax'])sheet.getRange(`${col(columns.indexOf(key)+1)}5:${col(columns.indexOf(key)+1)}${rows.length+4}`).setNumberFormat('#,##0.00');
}
guide.showGridLines=false;guide.getRange('A1:F1').merge();guide.getRange('A1').values=[['BIG DATA · 当前研究目录']];
guide.getRange('A2:F2').merge();guide.getRange('A2').values=[['EEG / fMRI · 相同来源版本生成网页索引、CSV、JSON 与此工作簿']];
guide.getRange('A3:B3').values=[['目录版本',manifest.version]];
guide.getRange('A5:D7').values=[['模态','目录条数','有受试者值','有记录小时'],['EEG',null,null,null],['fMRI',null,null,null]];
for(const [offset,modality]of ['eeg','fmri'].entries())guide.getRange(`B${offset+6}:D${offset+6}`).formulas=[[`=COUNTA('${sheetNames[modality]}'!A5:A${counts[modality]+4})`,`=COUNT('${sheetNames[modality]}'!J5:J${counts[modality]+4})`,`=COUNT('${sheetNames[modality]}'!M5:M${counts[modality]+4})`]];
const notes=[
 ['统计范围','此处覆盖行数与网页相同。网页筛选汇总会按当前范围处理已确认父子集；不要直接对全部行的小时或人数求和并称为全站去重值。'],
 ['未知值','空白代表未知；人数不一定是确诊患者数。subjectScope、hoursScope 与 evidence 共同解释数值。'],
 ['时长证据','reported=来源报告；calculated=文件/协议计算；estimated=抽样或完成率假设估算；unavailable=未知。多回波同次采集计一次。'],
 ['HEEDB','按团队口径归入睡眠，官方属性仍为临床 EEG。v4.1 人数与未标版本的约330万小时分别标注。'],
 ['版本修正','HSP v3.0 含无 EEG 的 HSAT；不将旧版190,732小时与新版人数混用。BrainLat 全模态780人不当作EEG人数。'],
 ['重复处理','bigP3BCI / Mainsah2025 合并；ds002366 归并至 ds002620。TUH、HEEDB派生任务、Iowa PD死亡结局子集保留关系。'],
 ['临床优先新增','EEG：PD静息、ValidPain2、OSA、抑郁症状分层；fMRI：ADHD Dualcontrol、BrainLat。另补 HBN10/11、THINGS-fMRI。'],
 ['数据来源','每行 url 指向数据入口；网页详情提供原始论文、数值证据、核查日期与许可。不是所有公开元数据都能直接下载信号。'],
 ['历史快照','原563行 catalog-data.json 和旧工作簿独立保存。此工作簿只使用当前修订后的目录，不覆盖历史快照。'],
 ['后续核查','优先补齐临床未知小时；核对受控库实际发布清单、HBN11/ValidPain2信号访问及其他多回波、纵向协议。'],
];
for(let i=0;i<notes.length;i++){guide.getRange(`B${i+10}:F${i+10}`).merge();guide.getRange(`A${i+10}`).values=[[notes[i][0]]];guide.getRange(`B${i+10}`).values=[[notes[i][1]]];}
guide.getRange('A1:F20').format.font={name:'Microsoft YaHei',size:11,color:'#243F48'};guide.getRange('A1:F20').format.columnWidth=18;guide.getRange('A1:F20').format.verticalAlignment='center';guide.getRange('A1:F20').format.wrapText=true;
guide.getRange('A1:F1').format={fill:'#173B5E',font:{name:'Microsoft YaHei',size:21,bold:true,color:'#FFFFFF'},rowHeight:46};
guide.getRange('A2:F2').format.rowHeight=32;guide.getRange('A3:F3').format.rowHeight=26;guide.getRange('A5:D7').format.rowHeight=29;
guide.getRange('A5:D5').format={fill:'#177F77',font:{bold:true,color:'#FFFFFF'}};guide.getRange('A10:A19').format.fill='#E7F1EB';guide.getRange('A10:F19').format.rowHeight=58;
workbook.recalculate();
for(const [name,sheetName,range]of [['workbook-guide.png','说明与修订','A1:F19'],['workbook-eeg.png','EEG目录','A4:J7'],['workbook-fmri.png','fMRI目录','A4:J7']]){const image=await workbook.render({sheetName,range,scale:1,format:'png'});await fs.writeFile(new URL(name,out),new Uint8Array(await image.arrayBuffer()));}
console.log((await workbook.inspect({kind:'table',range:"'说明与修订'!A5:D7",include:'values,formulas',tableMaxRows:3,tableMaxCols:4,maxChars:1800})).ndjson);
console.log((await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:5},maxChars:1000})).ndjson);
const file=await SpreadsheetFile.exportXlsx(workbook);await file.save(fileURLToPath(new URL('brain-data-catalog-current.xlsx',out)));
await fs.copyFile(new URL('brain-data-catalog-current.xlsx',out),new URL('public/brain-data-catalog-current.xlsx',root));
await fs.writeFile(new URL('data/catalog-workbook-version.json',root),JSON.stringify({version:manifest.version,counts},null,2)+'\n');
console.log(`Workbook exported: ${counts.eeg} EEG / ${counts.fmri} fMRI; ${manifest.version}`);
