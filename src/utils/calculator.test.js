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

  it('시즌2 달의 인장 (무기공격력, 붉은달 스탯 가산 등) 적용 연산 검증', () => {
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
      ordinary: '123456',
      ordinaryBreak: '123456',
      ultimate: '123456',
      ultimateBreak: '123456'
    };

    // 1. 인장 미적용
    const resNormal = calculateDPS(baseStats, selectedRunes, gimmicks, cycles, {}, {}, {}, {});

    // 2. 무기에 붉은 달의 인장 장착 (공격력 +800 가산)
    const sealsWeaponRed = {
      weapon: { type: 'red_moon', redMoonStatValue: 40 }
    };
    const resWeaponRed = calculateDPS(baseStats, selectedRunes, gimmicks, cycles, {}, {}, {}, sealsWeaponRed);
    // 무기 자체 공격력 +800과 붉은달 스탯 40(Str/Wil 각 +40 = 합 +80 * 1.5 = +120 공격력) 가산 확인
    expect(resWeaponRed.totalAtk).toBeGreaterThan(resNormal.totalAtk);

    // 3. 엠블럼에 푸른 달의 인장 장착 (추가공격력% 7% -> 11% 상승)
    const sealsEmblemBlue = {
      emblem: { type: 'blue_moon', blueStat1Type: 'str', blueStat1Value: 30, blueStat2Type: 'wil', blueStat2Value: 30 }
    };
    const resEmblemBlue = calculateDPS(baseStats, selectedRunes, gimmicks, cycles, {}, {}, {}, sealsEmblemBlue);
    expect(resEmblemBlue.totalAtk).toBeGreaterThan(resNormal.totalAtk);
  });

  it('동적 스킬 파서 데이터(parsedSkills) 직접 주입 검증', () => {
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
      ordinary: '123456',
      ordinaryBreak: '123456',
      ultimate: '123456',
      ultimateBreak: '123456'
    };

    // 1. 파서 데이터가 없는 경우 (fallback 작동)
    const resultFallback = calculateDPS(stats, selectedRunes, gimmicks, cycles, {}, {}, {}, {}, null);

    // 2. 파서 데이터를 임의로 주입 (대미지를 2배로 증폭한 parsedSkills)
    const customParsedSkills = {
      passives: {
        waveBaseDmg: 39019 * 2,
        crashBaseDmg: 70945 * 2
      },
      skills: {
        "1-1": {
          "순정": { baseDamage: 122084 * 2, refLevel: 12, baseCast: 4.0 },
          "약점": { baseDamage: 76147 * 2, refLevel: 12, baseCast: 0.5, cooldown: 12 }
        },
        "1-2": {
          "순정": { baseDamage: 67043 * 2, refLevel: 12, baseCast: 1.45 }
        },
        "2-1": {
          "순정": { baseDamage: 32084 * 2, refLevel: 10, baseCast: 1.0, cooldown: 14 },
          "전진": { baseDamage: 36838 * 2, refLevel: 10, baseCast: 1.0, cooldown: 14 }
        },
        "2-2": {
          "순정": { baseDamage: 41580 * 2, refLevel: 10, baseCast: 1.3 }
        },
        "3": {
          "순정": { baseDamage: 7035 * 2, refLevel: 12, baseCast: 0.85, cooldown: 10 },
          "순발력": { baseDamage: 49661 * 2, refLevel: 12, baseCast: 0.85, cooldown: 10 }
        },
        "4-1": {
          "순정": { baseDamage: 16672 * 2, refLevel: 30, baseCast: 0.8, cooldown: 15 }
        },
        "4-2": {
          "순정": { baseDamage: 29560 * 2, refLevel: 30, baseCast: 0.8 }
        },
        "4-3": {
          "순정": { baseDamage: 41857 * 2, refLevel: 30, baseCast: 0.8 }
        },
        "sonic": {
          "순정": { baseDamage: 135978 * 2, refLevel: 30, baseCast: 2.584, cooldown: 12 }
        },
        "5-1": {
          "순정": { baseDamage: 36323 * 2, refLevel: 28, baseCast: 1.0, cooldown: 14 },
          "열혈": { baseDamage: 42567 * 2, refLevel: 28, baseCast: 1.0, cooldown: 15 }
        },
        "5-2": {
          "순정": { baseDamage: 49377 * 2, refLevel: 28, baseCast: 1.0 },
          "열혈": { baseDamage: 57891 * 2, refLevel: 28, baseCast: 1.0 }
        },
        "5-3": {
          "순정": { baseDamage: 71512 * 2, refLevel: 28, baseCast: 1.0 },
          "열혈": { baseDamage: 83999 * 2, refLevel: 28, baseCast: 1.0 }
        },
        "somersault": {
          "순정": { baseDamage: 183322 * 2, refLevel: 28, baseCast: 1.0, cooldown: 13.5 }
        },
        "6": {
          "순정": { baseDamage: 0, refLevel: 28, baseCast: 3.0 }
        }
      }
    };

    const resultCustom = calculateDPS(stats, selectedRunes, gimmicks, cycles, {}, {}, {}, {}, customParsedSkills);

    // 대미지가 2배로 증가된 데이터를 넘겼으므로 dps가 더 높아야 함
    expect(resultCustom.weightedDps).toBeGreaterThan(resultFallback.weightedDps);
  });
});

