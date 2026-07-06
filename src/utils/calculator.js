// 마비노기 모바일 시즌2 격투가 DPS 계산기 연산 엔진 (보석세공 및 6스킬 고도화)

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

// 스킬별 계열 정보 (보석 세공 적용을 위함)
const SKILL_CATEGORIES = {
  "1-1": { dmg: "strong", cd: "strong" }, // 강타
  "1-2": { dmg: "strong", cd: "strong" }, // 강타
  "2-1": { dmg: "strong", cd: "strong" }, // 강타
  "2-2": { dmg: "strong", cd: "strong" }, // 강타
  "3":   { dmg: "save",   cd: "save" },   // 생존/보조 (엑셀에 생존 쿨감 연계)
  "4-1": { dmg: "strong", cd: "strong" }, // 강타
  "4-2": { dmg: "strong", cd: "strong" }, // 강타
  "4-3": { dmg: "strong", cd: "strong" }, // 강타
  "5-1": { dmg: "move",   cd: "move" },   // 이동
  "5-2": { dmg: "move",   cd: "move" },   // 이동
  "5-3": { dmg: "move",   cd: "move" },   // 이동
  "6":   { dmg: "sub",    cd: "sub" }     // 보조 (궁극기는 보조계열 세공 또는 특수 보조로 처리)
};

/**
 * 캐릭터 스탯, 룬 선택 정보, 보석 세공 스탯, 가동률 조절 값을 입력받아 최종 DPS를 계산합니다.
 * @param {Object} characterStats 캐릭터 기본 능력치
 * @param {Array} selectedRunes 선택된 룬 목록
 * @param {Object} activeGimmicks 전투/보스 상태 기믹
 * @param {Object} cycleText 상황별 딜사이클 텍스트
 * @param {Object} conditionalUptimes 조건부 룬 가동률 조절
 * @param {Object} gemStats 보석 세공 입력 수치 (뎀증% / 쿨감%)
 */
export function calculateDPS(characterStats, selectedRunes, activeGimmicks, cycleText, conditionalUptimes = {}, gemStats = {}) {
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
    const uptime = conditionalUptimes[name] !== undefined ? conditionalUptimes[name] / 100.0 : (rune.stats.가동률 !== undefined ? rune.stats.가동률 : 1.0);
    
    Object.keys(runeStats).forEach(key => {
      if (rune.stats[key]) {
        runeStats[key] += rune.stats[key] * uptime;
      }
    });
  });

  // 2. 캐릭터 스펙 연산
  const baseAtk = characterStats.baseAttack || 27166.0;
  const emblemAtkPct = 0.07; 
  // 캐릭터 스탯창의 빠른공격, 빠른스킬, 궁극기 등 추가 스탯 파싱
  const fastAtkScore = characterStats.fastAtk || 1484.0;
  const fastSkillScore = characterStats.fastSkill || 1488.0;
  const ultScore = characterStats.ultScore || 1792.0;

  // 세공 보석 세고 공격력% 합산
  const totalAtkPct = runeStats["공격력%"] + runeStats["조건부공증%"] + (characterStats.enchantAtkPct || 6.8) / 100.0 + emblemAtkPct;
  const attack = baseAtk * (1 + totalAtkPct);

  // 방어도 계수
  const boss = activeGimmicks.boss || "함선 허수아비";
  let armorVal = 30;
  if (boss === "글라스기브넨" || boss === "화이트서큐버스") armorVal = 6410;
  else if (boss === "어비스 지옥2") armorVal = 9153;
  else if (boss === "바리어비스") armorVal = 15903;
  const armorCoeff = 1 / (1 + armorVal / 10328);

  // 시뮬레이션용 총 주는피해, 받는피해
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
  const baseExtraDmg = 2.0;
  const totalExtraDmg = baseExtraDmg + runeStats["추가타피해%"];

  const baseExtraProb = (characterStats.extraProb || 987.0) / 13000.0;
  const totalExtraProb = (1 + baseExtraProb) * (1 + runeStats["추가타확률%"]) - 1;

  // 치명타
  const baseCritProb = 0.5 * (characterStats.critScore / (characterStats.critScore + 2000)) + (boss === "허수아비" ? 0.3 : 0.0) + (characterStats.critBonusPct || 0);
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
    
    // 룬 활성화 여부
    const isWeakness = selectedRunes.some(r => r && r.name.includes("약점"));
    const isCollision = selectedRunes.some(r => r && r.name.includes("충돌"));
    const isSprint = selectedRunes.some(r => r && r.name.includes("전진"));
    const isQuick = selectedRunes.some(r => r && r.name.includes("순발력"));
    const isBreak = selectedRunes.some(r => r && r.name.includes("격파"));
    const isHotBlood = selectedRunes.some(r => r && r.name.includes("열혈"));

    // 스펙 기반 스킬 기본 쿨타임 및 계수 데이터 셋팅 (6개 스킬 상세 이식)
    const skillData = {
      "1-1": { baseCoeff: isCollision ? 1.775 : (isWeakness ? 0.92 : 1.475), baseCast: isWeakness ? 1.0 : 4.0 },
      "1-2": { baseCoeff: 0.81, baseCast: 1.45 },
      "2-1": { baseCoeff: isSprint ? 0.465 : 0.405, baseCast: 1.0 },
      "2-2": { baseCoeff: 0.525, baseCast: 1.3 },
      "3":   { baseCoeff: isQuick ? 0.24 : 0.085, baseCast: 0.85 },
      "4-1": { baseCoeff: isBreak ? 0.188 : 0.141, baseCast: 0.8 },
      "4-2": { baseCoeff: isBreak ? 0.328 : 0.25,  baseCast: 0.8 },
      "4-3": { baseCoeff: isBreak ? 0.468 : 0.354, baseCast: 0.8 },
      "5-1": { baseCoeff: isHotBlood ? 0.435 : 0.32, baseCast: 1.0 },
      "5-2": { baseCoeff: isHotBlood ? 0.60 : 0.435, baseCast: 1.0 },
      "5-3": { baseCoeff: isHotBlood ? 0.86 : 0.63,  baseCast: 1.0 },
      "6":   { baseCoeff: 16.5, baseCast: 3.0 } // 궁극기
    };

    let totalCycleCoeff = 0.0;
    let totalCycleTime = 0.0;

    // 딜사이클 문자열 쪼개기 매핑
    const listSkills = [];
    for (let char of cycle.replace(/\s+/g, '')) {
      if (char === '1') {
        listSkills.push("1-1", "1-2");
      } else if (char === '2') {
        listSkills.push("2-1", "2-2");
      } else if (char === '3') {
        listSkills.push("3");
      } else if (char === '4') {
        listSkills.push("4-1", "4-2", "4-3"); // 4번 스킬 3타 연타
      } else if (char === '5') {
        listSkills.push("5-1", "5-2", "5-3"); // 5번 스킬 3타 연타
      } else if (char === '6') {
        listSkills.push("6"); // 6번 스킬 궁극기
      }
    }

    listSkills.forEach((skillName) => {
      const sk = skillData[skillName];
      if (!sk) return;

      // 6번 스킬은 스킬 6의 개조레벨, 5-x는 5번, 4-x는 4번, 3은 3번...
      let skillGroup = skillName.charAt(0);
      const level = characterStats[`skillLevel_${skillGroup}`] || 10;
      const coeff = getModifiedCoeff(sk.baseCoeff, level);

      // 빠른스킬 스탯(fastSkill)과 룬의 스킬속도% 반영
      const speedRuneAndStat = runeStats["스킬속도%"] + (fastSkillScore * 0.00007);
      const speedPct = speedRuneAndStat + (activeGimmicks.hasSpdBuff ? 0.10 : 0.0);
      const castTime = sk.baseCast * (1 - speedPct);

      // 보석 세공 데미지 증가% 적용
      const category = SKILL_CATEGORIES[skillName];
      let gemDmgBonus = 0.0;
      if (category && gemStats[`${category.dmg}Dmg`]) {
        gemDmgBonus = gemStats[`${category.dmg}Dmg`] / 100.0;
      }

      totalCycleCoeff += coeff * (1 + gemDmgBonus);
      totalCycleTime += castTime;
    });

    if (totalCycleTime === 0) totalCycleTime = 1;

    // 브레이크시 데미지 배율
    const isUnarmed = state.includes("Break");
    const unarmedDmgCoeff = isUnarmed ? (1 + (characterStats.comboPower || 1532.0) / 5250.0 + 0.4) : 1.0;

    // DPS 계산
    const skillDps = attack * totalCycleCoeff * (1 + totalGetsDmg) * armorCoeff * unarmedDmgCoeff / totalCycleTime;

    // 추가타(직접피해) 계산
    const baseDamageMultiplier = (1 + totalGivesDmg + totalComboDmg) * (1 + totalGetsDmg) * (1 + totalStrongDmg + totalChainDmg + totalExtraDmg);
    const critMultiplier = (1 - totalCritProb) + (totalCritDmg * totalCritProb);
    const extraProbMultiplier = (1 - totalExtraProb) + (totalExtraDmg * totalExtraProb);
    const directDps = baseDamageMultiplier * critMultiplier * extraProbMultiplier * attack * 2 * totalExtraProb;

    // 지속피해 계산
    const dotDps = (1 + totalGivesDmg) * (1 + totalGetsDmg) * totalMultiDmg * attack * 2;

    // 초월 룬 각인 보정
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

  // 상황 비중별 혼합 DPS 연산
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
