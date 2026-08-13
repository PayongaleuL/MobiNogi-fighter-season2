import { describe, expect, it } from 'vitest';
import { calculateDPS } from './calculator.js';

const activeGimmicks = {
  boss: '카브락 · 입문',
  ordinaryTime: 100,
  unarmedTime: 0,
  ultimateTime: 0,
  gimmickDmgPct: 0,
  healerDmgPct: 0,
  skillDebuffDmgPct: 0,
  hasSpdBuff: false,
};

const cycleText = {
  ordinary: '235212',
  ordinaryBreak: '235212',
  ultimate: '252',
  ultimateBreak: '252',
  inputMode: 'sequence-v2',
};

const buildResult = (magicResistance) => calculateDPS(
  {
    baseAttack: 60607,
    magicResistance,
    critScore: 9530,
    strongDmg: 3980,
    chainDmg: 3644,
    comboPower: 2480,
    skillPower: 2094,
    multiPower: 1082,
    extraProb: 2520,
    fastSkill: 2158,
    ultScore: 1682,
    enchantAtkPct: 6.8,
    skillLevel_1: 10,
    skillLevel_2: 30,
    skillLevel_3: 10,
    skillLevel_4: 30,
    skillLevel_5: 30,
    skillLevel_6: 30,
  },
  [],
  activeGimmicks,
  cycleText,
  {},
  {},
  { skill_1: '순정', skill_2: '도약', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
  {},
);

describe('calculateDPS magic-resistance target integration', () => {
  it('uses Kabrak intro pressure and applies the official 2,000-excess final-damage example exactly once', () => {
    const atPressure = buildResult(2500);
    const withExcess = buildResult(4500);

    expect(atPressure.target).toMatchObject({
      id: '카브락 · 입문',
      requiredMagicResistance: 2000,
      magicPressure: 2500,
      armorApplied: 30,
      critResistanceApplied: null,
    });
    expect(atPressure.magicResistanceEffect).toMatchObject({
      excess: 0,
      excessFinalDamagePct: 0,
      finalDamageMultiplier: 1,
    });
    expect(withExcess.magicResistanceEffect).toMatchObject({
      excess: 2000,
      excessFinalDamagePct: 14.6,
      finalDamageMultiplier: 1.146,
    });
    expect(withExcess.weightedDps / atPressure.weightedDps).toBeCloseTo(1.146, 4);
  });

  it('reports the below-pressure condition without inventing an unpublished damage coefficient', () => {
    const result = buildResult(2000);

    expect(result.magicResistanceEffect).toMatchObject({
      isBelowPressure: true,
      excessFinalDamagePct: 0,
      finalDamageMultiplier: 1,
      belowPressurePenaltyApplied: false,
    });
  });

});
