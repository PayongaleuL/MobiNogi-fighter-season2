import { describe, it, expect } from 'vitest';
import { getModifiedCoeff, calculateDPS } from './calculator';

describe('격투가 DPS 계산 엔진 검증', () => {
  it('스킬 개조 단계별 계수 연산 검증', () => {
    // 엑셀 R003 공식 검증
    // 레벨 10인 경우: 1 + 0.03*10 + 0.02*2 (레벨 2, 10 만족) = 1.34
    // 기본계수 1.475 * 1.34 = 1.9765
    const baseCoeff = 1.475;
    const modified = getModifiedCoeff(baseCoeff, 10);
    expect(modified).toBeCloseTo(1.9765, 4);
  });

  it('기본 스탯 기준 시뮬레이션 동작 검증', () => {
    const stats = {
      baseAttack: 27166.0,
      critScore: 6925.0,
      strongDmg: 2487.0,
      chainDmg: 2989.0,
      comboPower: 1532.0,
      skillPower: 1577.0,
      multiPower: 1082.0,
      extraProb: 987.0,
      enchantAtkPct: 6.8,
      critBonusPct: 0.0,
      skillLevel_1: 10,
      skillLevel_2: 30,
      skillLevel_3: 10,
      skillLevel_4: 10
    };

    const selectedRunes = []; // 빈 룬 셋팅
    const gimmicks = {
      boss: '함선 허수아비',
      ordinaryTime: 87,
      unarmedTime: 0,
      ultimateTime: 33,
      gimmickDmgPct: 0.0,
      healerDmgPct: 0.0,
      skillDebuffDmgPct: 10.0,
      hasSpdBuff: false
    };

    const cycles = {
      ordinary: '235212',
      ordinaryBreak: '235212',
      ultimate: '252',
      ultimateBreak: '252'
    };

    const result = calculateDPS(stats, selectedRunes, gimmicks, cycles);
    
    // 연산이 에러 없이 무언가 유효한 숫자를 도출하는지 검증
    expect(result.weightedDps).toBeGreaterThan(0);
    expect(result.totalAtk).toBeGreaterThan(27166.0);
    expect(result.extraProb).toBeCloseTo(7.6, 1); // 기본 추가타 확률 기댓값 (987 / 13000)
  });
});
