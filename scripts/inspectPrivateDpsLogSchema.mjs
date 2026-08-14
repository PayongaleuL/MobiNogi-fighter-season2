import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const privateRoot = path.resolve('results/private_dps_logs');
const manifest = JSON.parse(await readFile(path.join(privateRoot, 'manifest.local.json'), 'utf8'));
const sortedKeys = (value) => Object.keys(value ?? {}).sort();

const summaries = [];
for (const entry of manifest.records ?? []) {
  const outer = JSON.parse(await readFile(path.join(privateRoot, 'sources', `${entry.analysisId}.json`), 'utf8'));
  const record = JSON.parse(outer.recordJson);
  const targets = (record.targets ?? []).map((target) => ({
    targetKeys: sortedKeys(target),
    targetIdType: typeof target.targetId,
    skillCount: Array.isArray(target.skills) ? target.skills.length : 0,
    skillKeys: sortedKeys(target.skills?.[0]),
  }));
  summaries.push({
    analysisId: entry.analysisId,
    recordKeys: sortedKeys(record),
    characterStatusKeys: sortedKeys(record.characterStatus),
    statsKeys: sortedKeys(record.characterStatus?.stats),
    targetCount: targets.length,
    targets,
    unguardedWindowKeys: sortedKeys(record.unguardedWindows?.[0]),
    breakWindowKeys: sortedKeys(record.breakWindows?.[0]),
    buffKeys: sortedKeys(record.buffs?.[0]),
  });
}

const output = { schemaVersion: 1, recordCount: summaries.length, records: summaries };
await writeFile(path.resolve('results/private_dps_log_cache/schema_overview.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
