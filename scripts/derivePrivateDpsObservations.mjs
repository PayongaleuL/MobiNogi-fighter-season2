import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const privateRoot = path.resolve('results/private_dps_logs');
const manifest = JSON.parse(await readFile(path.join(privateRoot, 'manifest.local.json'), 'utf8'));
const numeric = (value) => Number(value ?? 0);
const directSummary = (skills = []) => skills.reduce((summary, skill) => ({
  hits: summary.hits + numeric(skill.hitCount),
  crits: summary.crits + numeric(skill.critCount),
  directDamage: summary.directDamage + numeric(skill.directDamage),
  totalDamage: summary.totalDamage + numeric(skill.totalDamage),
  unguardedDamage: summary.unguardedDamage + numeric(skill.unguardedDamage),
  breakDamage: summary.breakDamage + numeric(skill.breakDamage),
}), { hits: 0, crits: 0, directDamage: 0, totalDamage: 0, unguardedDamage: 0, breakDamage: 0 });

const observations = [];
for (const source of manifest.records ?? []) {
  const outer = JSON.parse(await readFile(path.join(privateRoot, 'sources', `${source.analysisId}.json`), 'utf8'));
  const record = JSON.parse(outer.recordJson);
  const status = record.characterStatus?.stats ?? {};
  observations.push({
    analysisId: source.analysisId,
    sourceSha256: source.sourceSha256,
    recordJsonSha256: source.recordJsonSha256,
    context: {
      mapCode: record.mapCode ?? null,
      recordType: record.type ?? null,
      roomIndex: record._serverRoomIndex ?? null,
      targetTemplateId: record.targets?.find((target) => target.targetId === record.targetId)?.targetTemplateId ?? null,
    },
    stats: {
      attack: numeric(status.attack),
      arcaneResistance: numeric(status.arcaneResistance),
      detail: (status.detail ?? []).map(({ label, value }) => ({ label, value: numeric(value) })),
    },
    targets: (record.targets ?? []).map((target) => {
      const direct = directSummary(target.skills);
      return {
        monsterName: target.monsterName ?? null,
        targetTemplateId: target.targetTemplateId ?? null,
        duration: numeric(target.duration),
        dps: numeric(target.dps),
        totalDamage: numeric(target.totalDamage),
        hitCount: numeric(target.hitCount),
        critCount: numeric(target.critCount),
        direct,
        skillCount: target.skills?.length ?? 0,
      };
    }),
  });
}

const output = { schemaVersion: 1, source: 'private-derived', records: observations };
await writeFile(path.resolve('results/private_dps_log_cache/observations.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
