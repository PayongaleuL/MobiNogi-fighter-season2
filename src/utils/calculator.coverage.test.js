import { describe, expect, it } from 'vitest';
import { calculateDPS, getModifiedCoeff } from './calculator';

const baseStats = {
  baseAttack: 30000,
  critScore: 7000,
  strongDmg: 3000,
  chainDmg: 3200,
  comboPower: 1800,
  skillPower: 1900,
  multiPower: 1200,
  extraProb: 1100,
  fastAtk: 1500,
  fastSkill: 1600,
  ultScore: 2100,
  enchantAtkPct: 8,
  critBonusPct: 0.01,
  strongDmgPct: 3,
  chainDmgPct: 4,
  skillLevel_1: 2,
  skillLevel_2: 10,
  skillLevel_3: 15,
  skillLevel_4: 20,
  skillLevel_5: 30,
  skillLevel_6: 30,
  useNightTrace: true,
  useDeadlyImpact: true,
  useHitCombo: true,
  nightBlessingUptime: 50,
  extraAllStat: 20,
  extraFinalDmgPct: 2
};

const activeGimmicks = {
  boss: '글라스기브넨',
  ordinaryTime: 40,
  unarmedTime: 30,
  ultimateTime: 30,
  gimmickDmgPct: 12,
  healerDmgPct: 5,
  skillDebuffDmgPct: 7,
  hasSpdBuff: true
};

const allStatRune = {
  name: '테스트 룬',
  type: '방어구',
  transcendLevel: 2,
  stats: {
    '공격력%': 0.1,
    '조건부공증%': 0.05,
    '주는피해%': 0.07,
    '받는피해%': 0.06,
    '강타피해%': 0.04,
    '연타피해%': 0.03,
    '추가타피해%': 0.02,
    '치명타피해%': 0.08,
    '콤보피해%': 0.04,
    '멀티피해%': 0.03,
    '스킬피해%': 0.02,
    '추가타확률%': 0.04,
    '치명타확률%': 0.03,
    '스킬속도%': 0.02,
    '재사용회복%': 0.01,
    '최종피해%': 0.01,
    '가동률': 0.5,
    '공격력': 100,
    '방어력': 20,
    '마도저항': 300,
    '모든스킬강화': 1,
    '임의스킬강화': 2,
    '밤축_공격력%': 0.1,
    '밤축_주는피해%': 0.02
  }
};

const sealSetup = {
  weapon: { type: 'red_moon', redMoonStatValue: 40 },
  necklace: { type: 'blue_moon', blueStat1Type: 'str', blueStat1Value: 30, blueStat2Type: 'wil', blueStat2Value: 30 },
  emblem: { type: 'blue_moon', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'luk', blueStat2Value: 27 }
};

const gemStats = {
  strongDmg: 10,
  strongCd: 5,
  moveDmg: 8,
  moveCd: 4,
  saveDmg: 6,
  saveCd: 3,
  subDmg: 2,
  subCd: 1
};

function expectFiniteDps(result) {
  expect(result.weightedDps).toBeGreaterThan(0);
  expect(result.totalAtk).toBeGreaterThan(0);
  expect(result.extraProb).toBeGreaterThanOrEqual(0);
  for (const state of Object.values(result.states)) {
    expect(Number.isFinite(state.totalDps)).toBe(true);
    expect(Number.isFinite(state.cycleTime)).toBe(true);
    expect(state.cycleTime).toBeGreaterThan(0);
  }
}

describe('calculateDPS coverage regression suite', () => {
  it('applies every skill-level threshold in the modification coefficient', () => {
    const base = 1.5;
    expect(getModifiedCoeff(base, 0)).toBe(base);
    expect(getModifiedCoeff(base, 1)).toBeCloseTo(1.545, 6);
    expect(getModifiedCoeff(base, 2)).toBeCloseTo(1.62, 6);
    expect(getModifiedCoeff(base, 10)).toBeCloseTo(2.01, 6);
    expect(getModifiedCoeff(base, 15)).toBeCloseTo(2.265, 6);
    expect(getModifiedCoeff(base, 20)).toBeCloseTo(2.52, 6);
    expect(getModifiedCoeff(base, 30)).toBeCloseTo(3.0, 6);
  });

  it('calculates a finite result for a fully configured Korean-named skill cycle', () => {
    const result = calculateDPS(
      baseStats,
      [
        null,
        { ...allStatRune, name: '거대한 분노' },
        { ...allStatRune, name: '보조 룬', type: '장신구', transcendLevel: 2 }
      ],
      activeGimmicks,
      {
        ordinary: '차징 연환 순발력 격파 비룡 궁극',
        ordinaryBreak: '약점 도약 순발력 승천 섬머솔트 궁극',
        ultimate: '충돌 전진 소닉 강격 궁극',
        ultimateBreak: '123456'
      },
      { '거대한 분노': 75 },
      gemStats,
      { skill_1: '충돌+', skill_2: '도약+', skill_3: '순발력', skill_4: '승천', skill_5: '섬머솔트' },
      sealSetup
    );

    expectFiniteDps(result);
    expect(result.totalResist).toBeGreaterThan(0);
  });

  it.each([
    ['허수아비', 0, 0, 0],
    ['화이트서큐버스', 10, 0, 10],
    ['어비스 지옥2', 10, 20, 10],
    ['바리어비스', 20, 10, 20],
    ['알 수 없는 보스', 10, 10, 10]
  ])('handles the %s boss branch without invalid DPS', (boss, ordinaryTime, unarmedTime, ultimateTime) => {
    const result = calculateDPS(
      { ...baseStats, useNightTrace: false, useDeadlyImpact: false, useHitCombo: false, nightBlessingUptime: 0 },
      [],
      { ...activeGimmicks, boss, ordinaryTime, unarmedTime, ultimateTime, hasSpdBuff: false },
      { ordinary: '235212', ordinaryBreak: '235212', ultimate: '252', ultimateBreak: '252' },
      {},
      {},
      {},
      {}
    );

    expectFiniteDps(result);
  });

  it('uses fallback values for empty and malformed cycle input', () => {
    const result = calculateDPS(
      { ...baseStats, baseAttack: 0, critScore: 0, fastSkill: 0, extraProb: 0 },
      [{ name: '가동률 룬', type: '무기', transcendLevel: 1, stats: { '가동률': 1, '공격력': 0, '마도저항': 0 } }],
      { ...activeGimmicks, boss: '함선 허수아비', ordinaryTime: 0, unarmedTime: 0, ultimateTime: 0 },
      { ordinary: '', ordinaryBreak: '알 수 없음', ultimate: '---', ultimateBreak: ' ' },
      {},
      {},
      { skill_1: '', skill_2: '', skill_3: '', skill_4: '', skill_5: '' },
      {},
      { passives: {}, skills: {} }
    );

    expectFiniteDps(result);
  });

  it('uses the spreadsheet village-attack contract without double-counting status-included equipment', () => {
    const result = calculateDPS(
      {
        ...baseStats,
        baseAttack: 60607,
        enchantAtkPct: 6.8,
        useNightTrace: true,
        nightBlessingUptime: 25,
        extraAllStat: 999
      },
      [
        { name: '상시 무기 룬', type: '무기', transcendLevel: 2, stats: { '공격력%': 0.235, '공격력': 1038, '가동률': 0.13 } },
        { name: '상시 방어구 룬1', type: '방어구', transcendLevel: 1, stats: { '공격력%': 0.15, '가동률': 1 } },
        { name: '상시 방어구 룬2', type: '방어구', transcendLevel: 1, stats: { '공격력%': 0.15, '가동률': 1 } },
        { name: '상시 방어구 룬3', type: '방어구', transcendLevel: 0, stats: { '공격력%': 0.14, '가동률': 1 } }
      ],
      activeGimmicks,
      { ordinary: '123', ordinaryBreak: '123', ultimate: '123', ultimateBreak: '123' },
      { '상시 무기 룬': 13 },
      {},
      {},
      {
        weapon: { type: 'red_moon', baseAtkOverride: 800, redMoonStatValue: 60 },
        necklace: { type: 'red_moon', baseAtkOverride: 400, redMoonStatValue: 45 },
        ring1: { type: 'red_moon', baseAtkOverride: 400, redMoonStatValue: 45 },
        emblem: { type: 'red_moon', redMoonStatValue: 50 }
      }
    );

    expect(result.totalAtk).toBe(105638);
    expect(result.attackBreakdown.runeAtkPct).toBeCloseTo(0.675, 10);
    expect(result.attackBreakdown.totalAtkPct).toBeCloseTo(0.743, 10);
    expect(result.attackBreakdown.sealBaseAtk).toBe(1600);
    expect(result.attackBreakdown.sealAtkFromStats).toBe(600);
    expect(result.attackBreakdown.gemAtk).toBe(1498.5);
  });

  it('changes output when special seasonal passives and rune scaling are enabled', () => {
    const cycles = { ordinary: '333456', ordinaryBreak: '333456', ultimate: '333456', ultimateBreak: '333456' };
    const disabled = calculateDPS(
      { ...baseStats, useNightTrace: false, useDeadlyImpact: false, useHitCombo: false, nightBlessingUptime: 0 },
      [],
      activeGimmicks,
      cycles,
      {},
      {},
      {},
      {}
    );
    const enabled = calculateDPS(baseStats, [allStatRune], activeGimmicks, cycles, {}, gemStats, {}, sealSetup);

    expect(enabled.weightedDps).toBeGreaterThan(disabled.weightedDps);
    expect(enabled.totalAtk).toBeGreaterThan(disabled.totalAtk);
  });
});


describe('ultimate score regression', () => {
  it('applies ultimate score only through the sixth-skill multiplier', () => {
    const cycle = { ordinary: '6', ordinaryBreak: '6', ultimate: '6', ultimateBreak: '6' };
    const commonGimmicks = { ...activeGimmicks, ordinaryTime: 100, unarmedTime: 0, ultimateTime: 0 };
    const parsedSkills = {
      passives: { waveBaseDmg: 0, crashBaseDmg: 0 },
      skills: { '6': { 순정: { baseDamage: 100000, refLevel: 28, baseCast: 3 } } }
    };
    const lowUltimate = calculateDPS(
      { ...baseStats, ultScore: 0, useDeadlyImpact: false, useHitCombo: false },
      [],
      commonGimmicks,
      cycle,
      {},
      {},
      {},
      {},
      parsedSkills
    );
    const highUltimate = calculateDPS(
      { ...baseStats, ultScore: 5000, useDeadlyImpact: false, useHitCombo: false },
      [],
      commonGimmicks,
      cycle,
      {},
      {},
      {},
      {},
      parsedSkills
    );

    expect(highUltimate.states.ordinary.skillDps).toBeGreaterThan(lowUltimate.states.ordinary.skillDps);
    expect(highUltimate.weightedDps).toBeGreaterThan(lowUltimate.weightedDps);
  });
});


describe('DPS default and stance branch regression', () => {
  it.each([
    [{ skill_1: '약점', skill_2: '순정', skill_3: '순정', skill_4: '격파', skill_5: '열혈' }, '12345'],
    [{ skill_1: '순정', skill_2: '전진', skill_3: '순발력', skill_4: '순정', skill_5: '강격' }, '12345'],
    [{ skill_1: '충돌', skill_2: '도약', skill_3: '순정', skill_4: '소닉', skill_5: '섬머' }, '123456']
  ])('keeps every stance combination finite for cycle %s', (stances, cycle) => {
    const result = calculateDPS(
      baseStats,
      [{ name: '1단계 초월 룬', type: '무기', transcendLevel: 1, stats: { '공격력%': 0.01, '가동률': 1 } }],
      activeGimmicks,
      { ordinary: cycle, ordinaryBreak: cycle, ultimate: cycle, ultimateBreak: cycle },
      {},
      {},
      stances,
      {}
    );

    expectFiniteDps(result);
  });

  it('uses documented fallback values when optional calculator inputs are omitted', () => {
    const result = calculateDPS(
      { useNightTrace: false, useDeadlyImpact: false, useHitCombo: false },
      [{
        name: '미정 조건 룬',
        type: '방어구',
        transcendLevel: 0,
        stats: { '밤축_알수없는스탯': 1, '마도저항': 0, '가동률': 1 }
      }],
      { boss: '함선 허수아비' },
      {},
      {},
      {},
      null,
      {},
      { passives: {}, skills: {} }
    );

    expectFiniteDps(result);
  });
});


describe('final damage rune regression', () => {
  it('multiplies the complete DPS result by final-damage rune effects', () => {
    const cycle = { ordinary: '1', ordinaryBreak: '1', ultimate: '1', ultimateBreak: '1' };
    const parsedSkills = {
      passives: { waveBaseDmg: 0, crashBaseDmg: 0 },
      skills: {
        '1-1': { 순정: { baseDamage: 100000, refLevel: 10, baseCast: 1 } },
        '1-2': { 순정: { baseDamage: 0, refLevel: 10, baseCast: 1 } }
      }
    };
    const input = { ...baseStats, useDeadlyImpact: false, useHitCombo: false, nightBlessingUptime: 0 };
    const gimmicks = { ...activeGimmicks, boss: '함선 허수아비', ordinaryTime: 100, unarmedTime: 0, ultimateTime: 0, hasSpdBuff: false };
    const withoutFinalDamage = calculateDPS(input, [], gimmicks, cycle, {}, {}, {}, {}, parsedSkills);
    const withFinalDamage = calculateDPS(
      input,
      [{ name: '최종피해 룬', type: '장신구', transcendLevel: 0, stats: { '최종피해%': 0.1, '가동률': 1, '마도저항': 0 } }],
      gimmicks,
      cycle,
      {},
      {},
      {},
      {},
      parsedSkills
    );

    expect(withFinalDamage.weightedDps).toBeCloseTo(withoutFinalDamage.weightedDps * 1.1, -2);
  });
});


describe('explicit cycle token regression', () => {
  const parsedSkills = {
    passives: { waveBaseDmg: 0, crashBaseDmg: 0 },
    skills: {
      '1-1': { 순정: { baseDamage: 100000, refLevel: 10, baseCast: 1 } },
      '1-2': { 순정: { baseDamage: 50000, refLevel: 10, baseCast: 1 } },
      '2-1': { 순정: { baseDamage: 40000, refLevel: 10, baseCast: 1 } },
      '2-2': { 순정: { baseDamage: 30000, refLevel: 10, baseCast: 1 } },
      '3': { 순정: { baseDamage: 20000, refLevel: 10, baseCast: 1 } },
      '4-1': { 순정: { baseDamage: 10000, refLevel: 10, baseCast: 1 } },
      '4-2': { 순정: { baseDamage: 10000, refLevel: 10, baseCast: 1 } },
      '4-3': { 순정: { baseDamage: 10000, refLevel: 10, baseCast: 1 } },
      '5-1': { 순정: { baseDamage: 10000, refLevel: 10, baseCast: 1 } },
      '5-2': { 순정: { baseDamage: 10000, refLevel: 10, baseCast: 1 } },
      '5-3': { 순정: { baseDamage: 10000, refLevel: 10, baseCast: 1 } }
    }
  };
  const input = { ...baseStats, useDeadlyImpact: false, useHitCombo: false, nightBlessingUptime: 0 };
  const gimmicks = { ...activeGimmicks, boss: '함선 허수아비', ordinaryTime: 100, unarmedTime: 0, ultimateTime: 0, hasSpdBuff: false };

  it('treats explicit 1-1 and 1-2 tokens as the same pair as legacy token 1', () => {
    const legacy = calculateDPS(input, [], gimmicks, { ordinary: '1', ordinaryBreak: '1', ultimate: '1', ultimateBreak: '1' }, {}, {}, {}, {}, parsedSkills);
    const explicit = calculateDPS(input, [], gimmicks, { ordinary: '1-1 1-2', ordinaryBreak: '1-1 1-2', ultimate: '1-1 1-2', ultimateBreak: '1-1 1-2' }, {}, {}, {}, {}, parsedSkills);

    expect(explicit.states.ordinary.cycleBaseDmg).toBe(legacy.states.ordinary.cycleBaseDmg);
    expect(explicit.states.ordinary.cycleTime).toBe(legacy.states.ordinary.cycleTime);
  });

  it('ignores human-readable parenthetical probability notes while preserving the executable cycle', () => {
    const plain = calculateDPS(input, [], gimmicks, { ordinary: '1-1 3 4 2-2 2 3 5 2', ordinaryBreak: '1-1 3 4 2-2 2 3 5 2', ultimate: '445', ultimateBreak: '445' }, {}, {}, {}, {}, parsedSkills);
    const annotated = calculateDPS(input, [], gimmicks, { ordinary: '1-1 3 4 2-2 2 3 5 (444) 2', ordinaryBreak: '1-1 3 4 2-2 2 3 5 (444) 2', ultimate: '445(반복)', ultimateBreak: '445(반복)' }, {}, {}, {}, {}, parsedSkills);

    expect(annotated.states.ordinary.cycleBaseDmg).toBe(plain.states.ordinary.cycleBaseDmg);
    expect(annotated.states.ordinary.cycleTime).toBe(plain.states.ordinary.cycleTime);
  });
});
