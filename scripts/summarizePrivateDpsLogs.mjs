import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const privateRoot = path.resolve('results/private_dps_logs');
const manifest = JSON.parse(await readFile(path.join(privateRoot, 'manifest.local.json'), 'utf8'));
const numeric = (value) => Number(value ?? 0);

const summaries = [];
for (const source of manifest.records ?? []) {
  const outer = JSON.parse(await readFile(path.join(privateRoot, 'sources', `${source.analysisId}.json`), 'utf8'));
  const record = JSON.parse(outer.recordJson);
  const primary = record.targets?.find((target) => target.targetId === record.targetId) ?? record.targets?.[0] ?? {};
  summaries.push({
    analysisId: source.analysisId,
    sourceSha256: source.sourceSha256,
    context: {
      mapCode: record.mapCode ?? null,
      recordType: record.type ?? null,
      roomIndex: record._serverRoomIndex ?? null,
      rootTargetName: record.targetName ?? null,
      rootTargetId: record.targetId ?? null,
    },
    primaryTarget: {
      monsterName: primary.monsterName ?? null,
      targetTemplateId: primary.targetTemplateId ?? null,
      duration: numeric(primary.duration),
      dps: numeric(primary.dps),
      totalDamage: numeric(primary.totalDamage),
      hitCount: numeric(primary.hitCount),
      critCount: numeric(primary.critCount),
      skills: (primary.skills ?? []).map((skill) => ({
        skillId: skill.skillId ?? null,
        skillName: skill.skillName ?? null,
        hitCount: numeric(skill.hitCount),
        critCount: numeric(skill.critCount),
        directDamage: numeric(skill.directDamage),
        totalDamage: numeric(skill.totalDamage),
      })).filter((skill) => skill.totalDamage > 0),
    },
    targetCount: record.targets?.length ?? 0,
  });
}

const output = { schemaVersion: 1, recordCount: summaries.length, records: summaries };
await writeFile(path.resolve('results/private_dps_log_cache/record_index.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
