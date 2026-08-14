import fs from 'node:fs';
import { calculateDPS } from '../src/utils/calculator.js';
import { calculateGemStats } from '../src/utils/gemCalculator.js';
import { createLatestReferencePresets } from '../src/data/latestReferencePresets.js';
import runesData from '../src/data/runes.json' with { type: 'json' };
import { createCanonicalRunes } from '../src/data/canonicalRunes.js';
import parseSkillMarkdown from '../src/utils/skillMdParser.js';

const skillMarkdown = fs.readFileSync(new URL('../results/260710_패시브_액티브_스킬목록.md', import.meta.url), 'utf8');
const parsedSkills = parseSkillMarkdown(skillMarkdown);
const coreName = (name) => (name ?? '').replace(/\+/g, '').replace(/\s+/g, '').trim();

// UI의 mergeMasterRunes와 동일하게, 계산 스탯은 canonical 수동 검수 기준선을 사용한다.
// 원문 파서는 화면 문구 감사용일 뿐 계산 스탯을 덮어쓰지 않는다.
const appRunes = createCanonicalRunes(runesData);
const result = createLatestReferencePresets().map((preset) => {
  const data = preset.data;
  const flattenedRunes = Object.entries(data.selectedRunes).flatMap(([type, selected]) => selected.map((rune, index) => {
    const latest = appRunes.find((item) => coreName(item.name) === coreName(rune.name))
      ?? runesData.find((item) => coreName(item.name) === coreName(rune.name))
      ?? rune;
    return { ...latest, stats: latest.stats ?? {}, transcendLevel: data.transcendLevels[type]?.[index] ?? 0 };
  }));
  const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats(data.gems);
  const output = calculateDPS({ ...data.stats, extraAllStat, extraFinalDmgPct }, flattenedRunes, data.gimmicks, data.cycles, data.conditionalUptimes, gemStats, data.skillStances, data.seals, parsedSkills);
  const observed = data.reference.observedDps;
  return {
    name: preset.name,
    referenceId: data.reference.referenceId,
    observedDps: observed,
    modeledDps: output.weightedDps,
    variancePct: Number((((output.weightedDps - observed) / observed) * 100).toFixed(2)),
    totalAtk: output.totalAtk,
    attackBreakdown: output.attackBreakdown,
    states: output.states,
    gems: gemStats
  };
});

fs.writeFileSync(new URL('../results/latest_reference_preset_comparison.json', import.meta.url), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.map(({ name, observedDps, modeledDps, variancePct, totalAtk, attackBreakdown }) => ({ name, observedDps, modeledDps, variancePct, totalAtk, attackBreakdown })), null, 2));
