import fs from 'node:fs';
import { calculateDPS } from '../src/utils/calculator.js';
import { calculateGemStats } from '../src/utils/gemCalculator.js';
import { createLatestReferencePresets } from '../src/data/latestReferencePresets.js';
import runesData from '../src/data/runes.json' with { type: 'json' };
import { parseRuneMarkdown } from '../src/utils/runeMdParser.js';
import parseSkillMarkdown from '../src/utils/skillMdParser.js';

const runeMarkdown = fs.readFileSync(new URL('../results/260814_룬설명목록.md', import.meta.url), 'utf8');
const skillMarkdown = fs.readFileSync(new URL('../results/260710_패시브_액티브_스킬목록.md', import.meta.url), 'utf8');
const parsedRunes = parseRuneMarkdown(runeMarkdown);
const parsedSkills = parseSkillMarkdown(skillMarkdown);
const coreName = (name) => (name ?? '').replace(/\+/g, '').replace(/\s+/g, '').trim();

function calculatorRunes() {
  return parsedRunes.map((parsed) => {
    const original = runesData.find((item) => coreName(item.name) === coreName(parsed.name)) ?? {};
    // 계산기 UI의 mergeMasterRunes와 같은 계약: 최신 원문은 이름·문구의 기준,
    // runes.json은 사용자가 검수한 계산 스탯의 기준이다. 원문 OCR 파서가
    // 승전 치명타 피해 10% 같은 수동 보정을 다시 3%로 축소해서는 안 된다.
    const mergedStats = { ...(parsed.stats ?? {}), ...(original.stats ?? {}) };
    return { ...original, ...parsed, stats: mergedStats };
  });
}

const appRunes = calculatorRunes();
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
