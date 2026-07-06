import { describe, it, expect } from 'vitest';
import { getModifiedCoeff, calculateDPS } from './calculator';

describe('6스킬 및 보석 세공 연계 격투가 계산기 연산 검증', () => {
  it('스킬 개조 보정 계수 수식 검증', () => {
    // 엑셀 R003 공식 검증
    // 레벨 10인 경우: 1 + 0.03*10 + 0.02*2 (레벨 2, 10 만족) = 1.34
    // 기본계수 1.475 * 1.34 = 1.9765
    const baseCoeff = 1.475;
    const modified = getModifiedCoeff(baseCoeff, 10);
    expect(modified).toBeCloseTo(1.9765, 4);
  });

  it('6스킬 개조 레벨 및 보석 세공 데미지 연동 테스트', () => {
    const stats = {
      baseAttack: 27166.0,
      critScore: 6925.0,
      strongDmg: 2487.0,
      chainDmg: 2989.0,
      comboPower: 1532.0,
      skillPower: 1577.0,
      multiPower: 1082.0,
      extraProb: 987.0,
      fastAtk: 1484.0,
      fastSkill: 1488.0,
      ultScore: 1792.0,
      enchantAtkPct: 6.8,
      critBonusPct: 0.0,
      skillLevel_1: 10,
      skillLevel_2: 30,
      skillLevel_3: 10,
      skillLevel_4: 10,
      skillLevel_5: 10,
      skillLevel_6: 10
    };

    const selectedRunes = []; // 빈 룬 세팅
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

    // 보석 세공 적용 전
    const resultNormal = calculateDPS(stats, selectedRunes, gimmicks, cycles, {}, {});
    
    // 보석 세공 적용 후 (강타계열 35% 증폭)
    const gemStats = {
      strongDmg: 35.0, strongCd: 0.0,
      moveDmg: 0.0, moveCd: 0.0,
      subDmg: 0.0, subCd: 0.0,
      disableDmg: 0.0, disableCd: 0.0,
      saveDmg: 0.0, saveCd: 0.0
    };
    
    const resultGem = calculateDPS(stats, selectedRunes, gimmicks, cycles, {}, gemStats);

    // 보석 세공 강타 뎀증 적용으로 종합 DPS가 유의미하게 상승했는지 검증
    expect(resultGem.weightedDps).toBeGreaterThan(resultNormal.weightedDps);
    expect(resultGem.totalAtk).toBe(resultNormal.totalAtk); // 공격력 자체는 보석세공으로 증가하지 않음
  });
});
