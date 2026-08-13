import { describe, expect, it } from 'vitest';
import { calculateDPS } from './calculator.js';
import { calculateGemStats } from './gemCalculator.js';
import { createLatestReferencePresets } from '../data/latestReferencePresets.js';

const flattenReferenceRunes = (data) => Object.entries(data.selectedRunes).flatMap(([type, runes]) => (
  runes.filter(Boolean).map((rune, index) => ({
    ...rune,
    stats: { ...rune.stats },
    transcendLevel: data.transcendLevels[type]?.[index] ?? 0,
  }))
));

const GOLDEN_MASTER = [
  { weightedDps: 12091085, totalAtk: 108947 },
  { weightedDps: 12091085, totalAtk: 108947 },
  { weightedDps: 13169249, totalAtk: 108947 },
  { weightedDps: 13169249, totalAtk: 108947 },
  { weightedDps: 13169249, totalAtk: 108947 },
];

describe('core DPS calculation contract', () => {
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
