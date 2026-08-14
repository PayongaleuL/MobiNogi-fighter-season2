import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const groups = [
  { sourceSet: 'legacy', directory: path.resolve('results/p2b_raw_logs') },
  { sourceSet: 'new', directory: path.resolve('results/private_dps_logs/sources') },
];

const records = [];
for (const group of groups) {
  const files = (await readdir(group.directory)).filter((file) => file.endsWith('.json')).sort();
  for (const file of files) {
    const outer = JSON.parse(await readFile(path.join(group.directory, file), 'utf8'));
    const record = JSON.parse(outer.recordJson);
    const primary = record.targets?.find((target) => target.targetId === record.targetId)
      ?? record.targets?.find((target) => target.monsterName === record.targetName)
      ?? record.targets?.[0]
      ?? {};
    records.push({
      sourceSet: group.sourceSet,
      analysisId: group.sourceSet === 'new' ? path.basename(file, '.json') : `LEGACY-${path.basename(file, '.json')}`,
      title: record.title ?? null,
      mapCode: record.mapCode ?? null,
      type: record.type ?? null,
      serverRecordType: record._serverRecordType ?? null,
      roomIndex: record._serverRoomIndex ?? null,
      primaryTarget: primary.monsterName ?? record.targetName ?? null,
      targetTemplateId: primary.targetTemplateId ?? null,
      maxHp: Number(primary.maxHp ?? 0),
      targetCount: record.targets?.length ?? 0,
      primaryDuration: Number(primary.duration ?? 0),
      primaryDps: Number(primary.dps ?? 0),
    });
  }
}

const output = { schemaVersion: 1, recordCount: records.length, records };
await writeFile(path.resolve('results/private_dps_log_cache/context_comparison.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
