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

  it('스탠스 변형(소닉 피스트, 섬머솔트) 및 4대 패시브 연산 동작 검증', () => {
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

    const selectedRunes = [];
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
      ordinary: '45',
      ordinaryBreak: '45',
      ultimate: '45',
      ultimateBreak: '45'
    };

    // 1) 순정 스탠스
    const stancesNormal = {
      skill_4: '순정',
      skill_5: '순정'
    };
    const resNormal = calculateDPS(stats, selectedRunes, gimmicks, cycles, {}, {}, stancesNormal);

    // 2) 소닉 피스트 & 섬머솔트 장착 스탠스
    const stancesTransformed = {
      skill_4: '소닉 피스트',
      skill_5: '섬머솔트'
    };
    const resTransformed = calculateDPS(stats, selectedRunes, gimmicks, cycles, {}, {}, stancesTransformed);

    // 소닉 피스트(2.98배 기댓값) 및 섬머솔트(1.53배 계수)는 순정 4번(버스트)/5번(비룡격)에 비해 단일 피해와 기대 DPS가 월등히 상승함
    expect(resTransformed.weightedDps).toBeGreaterThan(resNormal.weightedDps);
  });

  it('시즌2 격투가 시즌스킬(데들리 임팩트, 히트 콤보, 밤의 축복) 적용 검증', () => {
    const baseStats = {
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
      skillLevel_6: 10,
      // 시즌2 기능 비활성화 상태
      useNightTrace: false,
      useDeadlyImpact: false,
      useHitCombo: false,
      nightBlessingUptime: 0
    };

    const selectedRunes = [];
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
      ordinary: '123456',
      ordinaryBreak: '123456',
      ultimate: '123456',
      ultimateBreak: '123456'
    };

    // 1. 시즌2 기능 비활성화
    const resNormal = calculateDPS(baseStats, selectedRunes, gimmicks, cycles, {}, {});

    // 2. 밤의 흔적 패시브 적용 (+71 스탯 가산)
    const statsWithPassive = { ...baseStats, useNightTrace: true };
    const resPassive = calculateDPS(statsWithPassive, selectedRunes, gimmicks, cycles, {}, {});
    expect(resPassive.totalAtk).toBeGreaterThan(resNormal.totalAtk);

    // 3. 밤의 축복 활성화 (공격력 15% 버프 * 25% 가동률)
    const statsWithBlessing = { ...baseStats, nightBlessingUptime: 25 };
    const resBlessing = calculateDPS(statsWithBlessing, selectedRunes, gimmicks, cycles, {}, {});
    expect(resBlessing.totalAtk).toBeGreaterThan(resNormal.totalAtk);

    // 4. 데들리 임팩트 활성화 (3번 스텝 추가 피해)
    const statsWithDeadly = { ...baseStats, useDeadlyImpact: true };
    const resDeadly = calculateDPS(statsWithDeadly, selectedRunes, gimmicks, cycles, {}, {});
    expect(resDeadly.weightedDps).toBeGreaterThan(resNormal.weightedDps);

    // 5. 히트 콤보 활성화 (10중첩 시 폭발 피해)
    const statsWithCombo = { ...baseStats, useHitCombo: true };
    const resCombo = calculateDPS(statsWithCombo, selectedRunes, gimmicks, cycles, {}, {});
    expect(resCombo.weightedDps).toBeGreaterThan(resNormal.weightedDps);
  });
});

