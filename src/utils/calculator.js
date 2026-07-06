// 마비노기 모바일 시즌2 격투가 DPS 계산기 연산 엔진

/**
 * 스킬 개조 레벨에 따른 스킬 계수 보정치 계산 (엑셀 R003 수식 참고)
 * level: 개조 레벨 (0 ~ 30)
 * baseCoeff: 기본 계수
 */
export function getModifiedCoeff(baseCoeff, level) {
  if (!level) return baseCoeff;
  const bonus = 0.02 * ((level >= 2 ? 1 : 0) + (level >= 10 ? 1 : 0) + (level >= 15 ? 1 : 0) + (level >= 20 ? 1 : 0) + (level >= 30 ? 1 : 0));
  return baseCoeff * (1 + 0.03 * level + bonus);
}

/**
 * 캐릭터 스탯, 룬 선택 정보, 가동률 조절 값을 입력받아 최종 DPS를 계산합니다.
 * @param {Object} characterStats 캐릭터 기본 능력치
 * @param {Array} selectedRunes 선택된 룬 목록
 * @param {Object} activeGimmicks 전투/보스 상태 기믹
 * @param {Object} cycleText 4가지 상황별 딜사이클 텍스트
 * @param {Object} conditionalUptimes 조건부 룬 가동률 조절 슬라이더 상태
 */
export function calculateDPS(characterStats, selectedRunes, activeGimmicks, cycleText, conditionalUptimes = {}) {
  // 1. 적용된 룬의 스탯 합산
  const runeStats = {
    "공격력%": 0.0,
    "조건부공증%": 0.0,
    "주는피해%": 0.0,
    "받는피해%": 0.0,
    "강타피해%": 0.0,
    "연타피해%": 0.0,
    "추가타피해%": 0.0,
    "치명타피해%": 0.0,
    "콤보피해%": 0.0,
    "멀티피해%": 0.0,
    "스킬피해%": 0.0,
    "추가타확률%": 0.0,
    "치명타확률%": 0.0,
    "스킬속도%": 0.0,
    "재사용회복%": 0.0,
    "최종피해%": 0.0
  };

  selectedRunes.forEach(rune => {
    if (!rune) return;
    const name = rune.name;
    // 사용자 수동 가동률이 설정되어 있다면 가중치 대입, 없으면 룬 기본 가동률 대입
    const uptime = conditionalUptimes[name] !== undefined ? conditionalUptimes[name] / 100.0 : (rune.stats.가동률 !== undefined ? rune.stats.가동률 : 1.0);
    
    Object.keys(runeStats).forEach(key => {
      if (rune.stats[key]) {
        runeStats[key] += rune.stats[key] * uptime;
      }
    });
  });

  // 2. 캐릭터 스펙 연산
  const baseAtk = characterStats.baseAttack || 27166.0;
  const emblemAtkPct = 0.07; // 기본 엠블럼 효과 (7%)
  const totalAtkPct = runeStats["공격력%"] + runeStats["조건부공증%"] + (characterStats.enchantAtkPct || 6.8) / 100.0 + emblemAtkPct;
  const attack = baseAtk * (1 + totalAtkPct);

  // 방어도 계수 (허수아비 기준)
  const boss = activeGimmicks.boss || "함선 허수아비";
  let armorVal = 30;
  if (boss === "글라스기브넨" || boss === "화이트서큐버스") armorVal = 6410;
  else if (boss === "어비스 지옥2") armorVal = 9153;
  else if (boss === "바리어비스") armorVal = 15903;
  const armorCoeff = 1 / (1 + armorVal / 10328);

  // 스탯 증가치 합산
  const gimmicksDmgPct = (activeGimmicks.gimmickDmgPct || 0.0) / 100.0;
  const healerDmgPct = (activeGimmicks.healerDmgPct || 0.0) / 100.0;
  
  const totalGivesDmg = runeStats["주는피해%"] + gimmicksDmgPct;
  const totalGetsDmg = runeStats["받는피해%"] + healerDmgPct + (activeGimmicks.skillDebuffDmgPct || 10.0) / 100.0;

  // 강타/연타피해
  const baseStrongDmg = (characterStats.strongDmg || 2487.0) / 8500.0;
  const totalStrongDmg = baseStrongDmg * (1 + runeStats["강타피해%"]) + runeStats["강타피해%"];
  
  const baseChainDmg = (characterStats.chainDmg || 2989.0) / 8500.0;
  const totalChainDmg = baseChainDmg * (1 + runeStats["연타피해%"]) + runeStats["연타피해%"];

  // 추가타
  const baseExtraDmg = 2.0; // 기본 추가타 배율 2.0
  const totalExtraDmg = baseExtraDmg + runeStats["추가타피해%"];

  const baseExtraProb = (characterStats.extraProb || 987.0) / 13000.0;
  const totalExtraProb = (1 + baseExtraProb) * (1 + runeStats["추가타확률%"]) - 1;

  // 치명타
  const baseCritProb = 0.5 * (characterStats.critScore / (characterStats.critScore + 2000)) + (boss === "허수아비" ? 0.3 : 0.0);
  const totalCritProb = Math.min(1.0, baseCritProb + runeStats["치명타확률%"]);
  
  const baseCritDmg = 1.4 + ((characterStats.critScore || 6925.0) / 5000.0);
  const totalCritDmg = baseCritDmg * (1 + runeStats["치명타피해%"]);

  // 스킬피해 및 기타
  const totalSkillDmg = (characterStats.skillPower || 1577.0) / 8500.0 + runeStats["스킬피해%"];
  const totalComboDmg = (characterStats.comboPower || 1532.0) / 17500.0 + runeStats["콤보피해%"];
  const totalMultiDmg = 0.08 + ((characterStats.multiPower || 1082.0) / 8500.0) + runeStats["멀티피해%"];

  // 3. 상황별 딜사이클 연산
  const states = ["ordinary", "ordinaryBreak", "ultimate", "ultimateBreak"];
  const results = {};

  states.forEach(state => {
    let cycle = cycleText[state] || "235212";
    // 스킬 Stance 유도
    const isWeakness = selectedRunes.some(r => r && r.name.includes("약점"));
    const isCollision = selectedRunes.some(r => r && r.name.includes("충돌"));
    const isSprint = selectedRunes.some(r => r && r.name.includes("전진"));
    const isQuick = selectedRunes.some(r => r && r.name.includes("순발력"));
    const isBreak = selectedRunes.some(r => r && r.name.includes("격파"));

    // 스킬 기본 데이터 셋팅
    const skillData = {
      "1-1": { baseCoeff: isCollision ? 1.775 : (isWeakness ? 0.92 : 1.475), baseCast: isWeakness ? 1.0 : 4.0 },
      "1-2": { baseCoeff: 0.81, baseCast: 1.45 },
      "2-1": { baseCoeff: isSprint ? 0.465 : 0.405, baseCast: 1.0 },
      "2-2": { baseCoeff: 0.525, baseCast: 1.3 },
      "3": { baseCoeff: isQuick ? 0.24 : 0.085, baseCast: 0.85 },
      "4-1": { baseCoeff: isBreak ? 0.188 : 0.141, baseCast: 0.8 },
      "4-2": { baseCoeff: 0.25, baseCast: 0.8 }
    };

    let totalCycleCoeff = 0.0;
    let totalCycleTime = 0.0;

    // 딜사이클 파싱 루프 (235212 -> 2, 3, 5, 2, 1, 2)
    // 1 -> 1-1, 1-2 연달아 사용
    // 2 -> 2-1, 2-2 연달아 사용
    // 3 -> 3 사용
    // 4 -> 4-1, 4-2 연달아 사용
    // 5 -> 궁극기
    const listSkills = [];
    for (let char of cycle.replace(/\s+/g, '')) {
      if (char === '1') {
        listSkills.push("1-1", "1-2");
      } else if (char === '2') {
        listSkills.push("2-1", "2-2");
      } else if (char === '3') {
        listSkills.push("3");
      } else if (char === '4') {
        listSkills.push("4-1", "4-2");
      } else if (char === '5') {
        listSkills.push("5");
      }
    }

    listSkills.forEach((skillName, index) => {
      // 5 (궁극기) 특수 처리
      if (skillName === "5") {
        totalCycleCoeff += 5.0; // 궁극기 임시 500% 계수
        totalCycleTime += 3.0 * (1 - runeStats["스킬속도%"]); // 시전 시간 3.0초
        return;
      }

      const sk = skillData[skillName];
      if (!sk) return;

      const level = characterStats[`skillLevel_${skillName.charAt(0)}`] || 10;
      const coeff = getModifiedCoeff(sk.baseCoeff, level);

      // 시전 속도 반영
      const speedPct = runeStats["스킬속도%"] + (activeGimmicks.hasSpdBuff ? 0.10 : 0.0);
      const castTime = sk.baseCast * (1 - speedPct);

      totalCycleCoeff += coeff;
      totalCycleTime += castTime;
    });

    if (totalCycleTime === 0) totalCycleTime = 1;

    // 브레이크(무방비) 시 콤보강화변수 및 무방비피해증가 반영
    const isUnarmed = state.includes("Break");
    const unarmedDmgCoeff = isUnarmed ? (1 + (characterStats.comboPower || 1532.0) / 5250.0 + 0.4) : 1.0;

    // DPS 수식 계산
    // 1) 평타/스킬 기본 데미지
    const skillDps = attack * totalCycleCoeff * (1 + totalGetsDmg) * armorCoeff * unarmedDmgCoeff / totalCycleTime;

    // 2) 직접피해 데미지
    // (1 + 주는피해 + 콤보피해) * (1 + 받는피해) * (1 + 강타피해 + 연타피해 + 추가타피해) * (1 - 치명타확률 + 치명타피해 * 치명타확률) * (1 - 추가타확률 + 추가타피해 * 추가타확률) * 공격력 * 2
    const baseDamageMultiplier = (1 + totalGivesDmg + totalComboDmg) * (1 + totalGetsDmg) * (1 + totalStrongDmg + totalChainDmg + totalExtraDmg);
    const critMultiplier = (1 - totalCritProb) + (totalCritDmg * totalCritProb);
    const extraProbMultiplier = (1 - totalExtraProb) + (totalExtraDmg * totalExtraProb);
    const directDps = baseDamageMultiplier * critMultiplier * extraProbMultiplier * attack * 2 * totalExtraProb;

    // 3) 지속피해 데미지
    const dotDps = (1 + totalGivesDmg) * (1 + totalGetsDmg) * totalMultiDmg * attack * 2;

    // 4) 최종 예상 DPS
    // 초월룬 스택 보정
    const transcendCount = selectedRunes.filter(r => r && (r.name.includes("초월+") || r.name.includes("초월++"))).length;
    const transcendCoeff = 1.015 ** transcendCount;

    const totalDps = (skillDps + directDps + dotDps) * transcendCoeff;

    results[state] = {
      skillDps: Math.round(skillDps),
      directDps: Math.round(directDps),
      dotDps: Math.round(dotDps),
      totalDps: Math.round(totalDps),
      cycleTime: parseFloat(totalCycleTime.toFixed(2)),
      cycleCoeff: parseFloat(totalCycleCoeff.toFixed(3))
    };
  });

  // 4개 상태의 비중별 최종 혼합 DPS (합산)
  // 엑셀 R38~R44 비중 공식 적용:
  //ordinary_ratio = ordinary_time / total_time
  const ordTime = activeGimmicks.ordinaryTime || 87;
  const breakTime = activeGimmicks.unarmedTime || 0;
  const ultTime = activeGimmicks.ultimateTime || 33;
  const totalTime = ordTime + breakTime + ultTime;

  let weightedDps = 0.0;
  if (totalTime > 0) {
    weightedDps = (
      results["ordinary"].totalDps * ordTime +
      results["ordinaryBreak"].totalDps * breakTime +
      results["ultimate"].totalDps * ultTime
    ) / totalTime;
  }

  return {
    states: results,
    weightedDps: Math.round(weightedDps),
    totalAtk: Math.round(attack),
    extraProb: parseFloat((totalExtraProb * 100).toFixed(1)),
    critProb: parseFloat((totalCritProb * 100).toFixed(1)),
    critDmg: parseFloat((totalCritDmg * 100).toFixed(1))
  };
}
