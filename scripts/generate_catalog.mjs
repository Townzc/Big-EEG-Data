import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createServer } from 'vite';

const root = new URL('../', import.meta.url);
const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });

const batch = async (values, worker, concurrency = 32) => {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++;
      await worker(values[index], index);
    }
  }));
};
const csvCell = (value) => {
  let text = value == null ? '' : String(value);
  if (/^\s*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
const checklistColumns = [
  ['ID', 'id'], ['优先级', 'priority'], ['下载决策', 'decision'], ['队列属性', 'focusType'],
  ['二级分类', 'focusSubtype'], ['数据集', 'name'], ['服务器状态', 'serverStatus'],
  ['已取得独立raw', 'independentAcquired'], ['精确时长已审计', 'exactDurationAudited'],
  ['已审计时长(h)', 'auditedHours'], ['文献时长(h)', 'documentedHours'], ['实体大小(GB)', 'physicalSizeGB'],
  ['访问方式', 'accessLabel'], ['下载方法', 'downloadMethod'], ['官方入口', 'url'],
  ['申请/登录页面', 'applicationPage'], ['建议路径', 'suggestedPath'], ['决策理由/下一步', 'nextAction'],
];
const checklistCsv = (rows) => [
  checklistColumns.map(([label]) => csvCell(label)).join(','),
  ...rows.map((row) => checklistColumns.map(([, key]) => csvCell(
    typeof row[key] === 'boolean' ? (row[key] ? '是' : '否') : row[key],
  )).join(',')),
].join('\n') + '\n';

try {
  const { currentCatalog } = await server.ssrLoadModule('/data/current-catalog.ts');
  const { eegDownloadChecklistRows, eegExcludedRows, eegReconciliation } = await server.ssrLoadModule('/data/eeg-duration.ts');
  const { eegProgress } = await server.ssrLoadModule('/data/eeg-progress.ts');
  const { catalogCsv, catalogDetailShard, catalogDetailShardCount, summarize, exportRows, exportColumns, safeExternalUrl } = await server.ssrLoadModule('/lib/catalog.ts');
  const version = crypto.createHash('sha256').update(JSON.stringify({
    columns: exportColumns,
    records: currentCatalog,
    reconciliation: eegReconciliation,
  })).digest('hex').slice(0, 12);
  const manifest = {
    schemaVersion: 2,
    version,
    reviewDate: eegReconciliation.reconciledAt,
    reconciliation: {
      historicalEegSnapshotRows: 563,
      aliases: eegReconciliation.aliases,
      exclusions: eegReconciliation.exclusions,
      sourcePackages: eegReconciliation.sourcePackages,
    },
    modalities: {},
  };

  for (const modality of ['eeg', 'fmri']) {
    const details = currentCatalog.filter((entry) => entry.item.modality === modality);
    const ids = new Set();
    const aliases = new Map();
    for (const detail of details) {
      const item = detail.item;
      if (ids.has(item.id) || !/^[A-Za-z0-9_-]+$/.test(item.id)) throw new Error(`Invalid/duplicate ID: ${item.id}`);
      ids.add(item.id);
      for (const key of ['subjects', 'hours', 'records', 'localHours', 'localFiles', 'localBytes', 'ageMin', 'ageMax']) {
        if (item[key] != null && (!Number.isFinite(item[key]) || item[key] < 0)) throw new Error(`Invalid ${key}: ${item.id}`);
      }
      if (item.hours == null) item.evidence = 'unavailable';
      for (const alias of item.aliases.filter((value) => /^(?:ds\d{6}|EEG-[A-Z0-9-]+)$/.test(value))) {
        if (aliases.has(alias) && aliases.get(alias) !== item.id) throw new Error(`Duplicate alias: ${alias}`);
        aliases.set(alias, item.id);
      }
      detail.sources = detail.sources.filter((source) => safeExternalUrl(source.url));
      detail.sources = [...new Map(detail.sources.map((source) => [source.url + '|' + source.label, source])).values()];
    }
    for (const item of details.map((entry) => entry.item)) {
      for (const relation of item.relations) {
        if (relation.kind !== 'multimodal' && !ids.has(relation.id)) throw new Error(`Broken relationship ${item.id} -> ${relation.id}`);
      }
    }

    const rows = details.map((entry) => entry.item).sort((left, right) => left.id.localeCompare(right.id));
    manifest.modalities[modality] = { count: rows.length, ...summarize(rows) };
    if (modality === 'eeg') {
      manifest.modalities.eeg.rawRows = {
        knownSubjects: eegProgress.catalog.rawSubjectKnownUnits,
        subjects: eegProgress.catalog.rawSubjectEntrySum,
        knownHours: eegProgress.catalog.rawDurationKnownUnits,
        hours: eegProgress.catalog.rawDurationRowSum,
      };
      manifest.modalities.eeg.categories = eegProgress.categories;
      manifest.modalities.eeg.acquisition = eegProgress.acquisition;
      manifest.modalities.eeg.preprocessing = eegProgress.preprocessing;
    }

    const dir = new URL(`public/catalog/${modality}/`, root);
    await fs.mkdir(dir, { recursive: true });
    const shardNames = new Set(Array.from({ length: catalogDetailShardCount }, (_, index) => `details-${String(index).padStart(2, '0')}.json`));
    const obsolete = (await fs.readdir(dir)).filter((name) =>
      /^[A-Za-z0-9_-]+\.json$/.test(name)
      && !['index.json', 'aliases.json', 'excluded.json'].includes(name)
      && !shardNames.has(name)
    );
    await batch(obsolete, (name) => fs.unlink(new URL(name, dir)));
    await Promise.all([
      fs.writeFile(new URL('index.json', dir), JSON.stringify({ version, rows }) + '\n'),
      fs.writeFile(new URL('aliases.json', dir), JSON.stringify(Object.fromEntries(aliases)) + '\n'),
      fs.writeFile(new URL(`public/${modality}-catalog-current.csv`, root), catalogCsv(rows)),
      fs.writeFile(new URL(`public/${modality}-catalog-current.json`, root), JSON.stringify({ schemaVersion: 2, version, rows: exportRows(rows) }, null, 2) + '\n'),
    ]);
    const detailShards = Array.from({ length: catalogDetailShardCount }, () => ({}));
    for (const detail of details) detailShards[Number(catalogDetailShard(detail.item.id))][detail.item.id] = detail;
    await batch(detailShards, (shard, index) => fs.writeFile(
      new URL(`details-${String(index).padStart(2, '0')}.json`, dir),
      JSON.stringify({ version, details: shard }) + '\n',
    ));
  }

  await Promise.all([
    fs.writeFile(new URL('public/catalog/eeg/excluded.json', root), JSON.stringify({
      schemaVersion: 1,
      version,
      rows: eegExcludedRows,
    }, null, 2) + '\n'),
    fs.writeFile(new URL('public/download-checklist.csv', root), checklistCsv(eegDownloadChecklistRows)),
    fs.writeFile(new URL('data/catalog-manifest.json', root), JSON.stringify(manifest, null, 2) + '\n'),
    fs.writeFile(new URL('public/catalog/manifest.json', root), JSON.stringify(manifest, null, 2) + '\n'),
  ]);

  if (process.argv.includes('--check-workbook')) {
    const workbook = JSON.parse(await fs.readFile(new URL('data/catalog-workbook-version.json', root)));
    if (workbook.version !== version || ['eeg', 'fmri'].some((modality) => workbook.counts[modality] !== manifest.modalities[modality].count)) {
      throw new Error('Workbook is stale. Run npm run catalog:workbook before building.');
    }
    await fs.access(new URL('public/brain-data-catalog-current.xlsx', root));
  }
  console.log(`Catalog ${version}: ${manifest.modalities.eeg.count} EEG / ${manifest.modalities.fmri.count} fMRI`);
} finally {
  await server.close();
}
