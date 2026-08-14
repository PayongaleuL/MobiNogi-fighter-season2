import { describe, expect, it } from 'vitest';
import { calculateDPS } from './calculator.js';
import { calculateDpsResult } from '../adapters/calculationAdapter.js';
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
  { weightedDps: 9522617, totalAtk: 108947 },
  { weightedDps: 9522617, totalAtk: 108947 },
  { weightedDps: 10916735, totalAtk: 108947 },
  { weightedDps: 10916735, totalAtk: 108947 },
  { weightedDps: 10916735, totalAtk: 108947 },
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

  it('applies timeline-weighted conditional attack to DPS and exposes the effect result', () => {
    const { data } = createLatestReferencePresets()[0];
    const timedConditionalAttack = {
      id: 'test-timed-conditional-attack',
      name: '시간축 조건부공증 검증',
      type: '방어구',
      effectModelVersion: 2,
      stats: { '가동률': 1 },
      conditionalEffects: [{
        id: 'ten-of-twenty',
        label: '10초/20초 조건부 공격력',
        durationSeconds: 10,
        cooldownSeconds: 20,
        stats: { '조건부공증%': 0.2 },
      }],
    };
    const baseline = calculateDPS(data.stats, [], data.gimmicks, data.cycles, {}, {}, data.skillStances, data.seals);
    const modeled = calculateDPS(data.stats, [timedConditionalAttack], data.gimmicks, data.cycles, {}, {}, data.skillStances, data.seals);

    expect(modeled.attackBreakdown.conditionalAtkPct).toBeCloseTo(0.1, 8);
    expect(modeled.totalAtk).toBeGreaterThan(baseline.totalAtk);
    expect(modeled.weightedDps).toBeGreaterThan(baseline.weightedDps);
    expect(modeled.runeEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        effectKey: 'test-timed-conditional-attack:ten-of-twenty',
        uptime: 0.5,
        uptimeProvenance: 'duration-cooldown',
      }),
    ]));
  });

  it('applies 아귀의 무방비 피해 only during a break state', () => {
    const { data } = createLatestReferencePresets()[0];
    const maw = runesData.find((rune) => rune.name === '아귀');
    const mawWithoutBreakBonus = { ...maw, name: '아귀_상시', stats: { ...maw.stats, '무방비피해%': 0 } };
    const withoutBreakBonus = calculateDPS(data.stats, [mawWithoutBreakBonus], data.gimmicks, data.cycles, data.conditionalUptimes, {}, data.skillStances, data.seals);
    const withBreakBonus = calculateDPS(data.stats, [maw], data.gimmicks, data.cycles, data.conditionalUptimes, {}, data.skillStances, data.seals);

    // 5초 직접 피해는 모든 상태에 반영하고, 무방비 피해 12%는 브레이크 상태에서만 추가 적용한다.
    expect(withBreakBonus.states.ordinary.runeEffectDps).toBeGreaterThan(withoutBreakBonus.states.ordinary.runeEffectDps);
    expect(withBreakBonus.states.ordinaryBreak.totalDps).toBeGreaterThan(withoutBreakBonus.states.ordinaryBreak.totalDps);
  });

  it('keeps the five reference presets byte-for-byte equivalent at the public result boundary', () => {
    const results = createLatestReferencePresets().map(({ data }) => {
      // UI와 동일한 어댑터를 사용한다. 이 경로는 최신 스킬 원문 파서, 보석 입력,
      // 룬 정규화·초월 조립을 함께 적용하므로 골든 값이 실제 배포 결과와 일치한다.
      const result = calculateDpsResult({
        ...data,
        customRunes: runesData,
      });

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
