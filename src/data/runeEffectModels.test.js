import { describe, expect, it } from 'vitest';
import { applyRuneEffectModels, runeEffectModels } from './runeEffectModels.js';

describe('rune effect models v2', () => {
  it('applies the reviewed models only to their canonical rune names', () => {
    const reviewedNames = [
      '오랜 광기', '억눌린 충동', '거대한 분노', '바위 칼날', '두 갈래 별',
      '추적자', '첫 번째 서약', '아귀', '정복자+', '은빛 찬가', '승전'
    ];
    expect(Object.keys(runeEffectModels)).toEqual(reviewedNames);

    const input = [
      ...reviewedNames.map((name) => ({ name, stats: { '가동률': 0.3 } })),
      { name: '그믐달', stats: { '공격력%': 0.1, '가동률': 0.7 } }
    ];
    const applied = applyRuneEffectModels(input);

    expect(applied.slice(0, reviewedNames.length).every((rune) => rune.effectModelVersion === 2)).toBe(true);
    expect(applied.at(-1)).toEqual(input.at(-1));
  });

  it('keeps permanent victory stats and marks non-event-modeled effects as excluded', () => {
    const [victory, rockBlade, tracker, maw] = applyRuneEffectModels([
      { name: '승전', stats: { '치명타피해%': 0.03, '가동률': 0.3 } },
      { name: '바위 칼날', stats: { '공격력%': 0.16, '가동률': 0.7 } },
      { name: '추적자', stats: { '강타피해%': 0.35, '가동률': 0.4 } },
      { name: '아귀', stats: { '주는피해%': 0.12, '콤보피해%': 0.12 } }
    ]);

    expect(victory.stats['주는피해%']).toBe(0.05);
    expect(victory.stats['치명타피해%']).toBe(0.1);
    expect(victory.conditionalEffects[0]).toMatchObject({
      id: 'nearby-kill-crit-damage',
      defaultUptime: 0,
      modelStatus: 'manual'
    });
    expect(rockBlade.conditionalEffects[0]).toMatchObject({ modelStatus: 'unresolved', includedInDps: false });
    expect(tracker.conditionalEffects[0]).toMatchObject({ modelStatus: 'unresolved', includedInDps: false });
    expect(maw.stats).toMatchObject({ '공격력%': 0.15, '주는피해%': 0, '콤보피해%': 0, '무방비피해%': 0.12 });
    expect(maw.conditionalEffects[0]).toMatchObject({ modelStatus: 'unresolved', includedInDps: false });
  });

  it('preserves empty slots and returns an empty list when the selected rune list is omitted', () => {
    expect(applyRuneEffectModels([null])).toEqual([null]);
    expect(applyRuneEffectModels()).toEqual([]);
  });
});
