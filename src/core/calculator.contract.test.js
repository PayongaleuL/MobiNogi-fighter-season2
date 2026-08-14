import { describe, expect, it } from 'vitest';
import { calculateDPS } from './calculator.js';
import { calculateGemStats } from './gemCalculator.js';
import { createLatestReferencePresets } from '../data/latestReferencePresets.js';
import runesData from '../data/runes.json';

const flattenReferenceRunes = (data) => Object.entries(data.selectedRunes).flatMap(([type, runes]) => (
  runes.filter(Boolean).map((rune, index) => ({
    ...rune,
    stats: { ...rune.stats },
    transcendLevel: data.transcendLevels[type]?.[index] ?? 0,
  }))
));

const GOLDEN_MASTER = [
  { weightedDps: 10007182, totalAtk: 108947 },
  { weightedDps: 10007182, totalAtk: 108947 },
  { weightedDps: 10896724, totalAtk: 108947 },
  { weightedDps: 10896724, totalAtk: 108947 },
  { weightedDps: 10896724, totalAtk: 108947 },
];

describe('core DPS calculation contract', () => {
  it('keeps a v2 rune permanent stat at 100% while applying its conditional effect separately', () => {
    const { data } = createLatestReferencePresets()[0];
    const victory = runesData.find((rune) => rune.name === '승전');
    const args = [
      data.stats,
      data.gimmicks,
      data.cycles,
      data.gemStats,
      data.skillStances,
      data.seals,
    ];
    const permanentDefault = calculateDPS(
      args[0], [victory], args[1], args[2],
      { ...data.conditionalUptimes, 'armor-victory:nearby-kill-crit-damage': 0 },
      args[3], args[4], args[5]
    );
    const permanentWithLegacyRuneUptime = calculateDPS(
      args[0], [victory], args[1], args[2],
      { ...data.conditionalUptimes, '승전': 30, 'armor-victory:nearby-kill-crit-damage': 0 },
      args[3], args[4], args[5]
    );
    const permanentAndConditional = calculateDPS(
      args[0], [victory], args[1], args[2],
      { ...data.conditionalUptimes, 'armor-victory:nearby-kill-crit-damage': 100 },
      args[3], args[4], args[5]
    );

    expect(permanentWithLegacyRuneUptime.critDmg).toBe(permanentDefault.critDmg);
    expect(permanentAndConditional.critDmg).toBeCloseTo(permanentDefault.critDmg * (1.22 / 1.10), 0);
  });

  it('applies 아귀의 무방비 피해 only during a break state', () => {
    const { data } = createLatestReferencePresets()[0];
    const maw = runesData.find((rune) => rune.name === '아귀');
    const mawWithoutBreakBonus = { ...maw, name: '아귀_상시', stats: { ...maw.stats, '무방비피해%': 0 } };
    const withoutBreakBonus = calculateDPS(data.stats, [mawWithoutBreakBonus], data.gimmicks, data.cycles, data.conditionalUptimes, {}, data.skillStances, data.seals);
    const withBreakBonus = calculateDPS(data.stats, [maw], data.gimmicks, data.cycles, data.conditionalUptimes, {}, data.skillStances, data.seals);

    expect(withBreakBonus.states.ordinary.totalDps).toBe(withoutBreakBonus.states.ordinary.totalDps);
    expect(withBreakBonus.states.ordinaryBreak.totalDps).toBeGreaterThan(withoutBreakBonus.states.ordinaryBreak.totalDps);
  });

  it('keeps the five reference presets byte-for-byte equivalent at the public result boundary', () => {
    const results = createLatestReferencePresets().map(({ data }) => {
      const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats(data.gems);
      const result = calculateDPS(
        { ...data.stats, extraAllStat, extraFinalDmgPct },
        flattenReferenceRunes(data),
        data.gimmicks,
        data.cycles,
        data.conditionalUptimes,
        gemStats,
        data.skillStances,
        data.seals,
      );

      return {
        weightedDps: result.weightedDps,
        totalAtk: result.totalAtk,
        status: result.status,
        normalizedCycles: result.normalizedCycles,
      };
    });

    expect(results.map(({ weightedDps, totalAtk }) => ({ weightedDps, totalAtk }))).toEqual(GOLDEN_MASTER);
    expect(results.every(({ status }) => status === 'ok')).toBe(true);
    expect(results.every(({ normalizedCycles }) => normalizedCycles.ordinary.length > 0)).toBe(true);
  });
});
