// 마비노기 모바일 시즌2 격투가 DPS 계산기 연산 엔진 (보석세공, 6스킬, 스탠스 및 패시브 고도화)

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
  "3":   { dmg: "save",   cd: "save" },   // 생존
  "4-1": { dmg: "strong", cd: "strong" }, // 강타
  "4-2": { dmg: "strong", cd: "strong" }, // 강타
  "4-3": { dmg: "strong", cd: "strong" }, // 강타
  "5-1": { dmg: "move",   cd: "move" },   // 이동
  "5-2": { dmg: "move",   cd: "move" },   // 이동
  "5-3": { dmg: "move",   cd: "move" },   // 이동
  "6":   { dmg: "sub",    cd: "sub" },    // 보조
  "sonic": { dmg: "strong", cd: "strong" }, // 소닉피스트 (강타)
  "somersault": { dmg: "strong", cd: "strong" } // 섬머솔트 (강타)
};

// 스킬별 히트 수(적중 타수) 매핑 테이블 (시즌2 히트콤보 연산 용)
const SKILL_HITS = {
  "1-1": 1,
  "1-2": 1,
  "2-1": 1,
  "2-2": 1,
  "3": 0,
  "4-1": 1,
  "4-2": 1,
  "4-3": 1,
  "sonic": 4,
  "5-1": 1,
  "5-2": 1,
  "5-3": 2,
  "somersault": 2,
  "6": 10
};

/**
 * 캐릭터 스탯, 룬 선택 정보, 보석 세공 스탯, 가동률 조절 값을 입력받아 최종 DPS를 계산합니다.
 * @param {Object} characterStats 캐릭터 기본 능력치
 * @param {Array} selectedRunes 선택된 룬 목록
 * @param {Object} activeGimmicks 전투/보스 상태 기믹
 * @param {Object} cycleText 상황별 딜사이클 텍스트
 * @param {Object} conditionalUptimes 조건부 룬 가동률 조절
 * @param {Object} gemStats 보석 세공 입력 수치 (뎀증% / 쿨감%)
 * @param {Object} skillStances 스킬별 스탠스(Stance) 선택값
 */
export function calculateDPS(characterStats, selectedRunes, activeGimmicks, cycleText, conditionalUptimes = {}, gemStats = {}, skillStances = {}, seals = {}) {
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
    "최종피해%": 0.0,
    // 깡 스탯 및 스킬 강화 추가
    "공격력": 0.0,
    "방어력": 0.0,
    "마도저항": 0.0,
    "모든스킬강화": 0.0,
    "임의스킬강화": 0.0
  };

  selectedRunes.forEach(rune => {
    if (!rune) return;
    const name = rune.name;
    const uptime = conditionalUptimes[name] !== undefined ? conditionalUptimes[name] / 100.0 : (rune.stats.가동률 !== undefined ? rune.stats.가동률 : 1.0);
    
    // 장신구가 아닌 룬들의 초월(1: 1.1배, 2: 1.25배) 스케일링 배율 계산
    let scale = 1.0;
    if (rune.type !== '장신구' && rune.transcendLevel) {
      if (rune.transcendLevel === 1) scale = 1.10;
      else if (rune.transcendLevel === 2) scale = 1.25;
    }

    Object.keys(runeStats).forEach(key => {
      if (rune.stats[key] !== undefined) {
        let val = rune.stats[key];
        if (name === '거대한 분노' && key === '스킬피해%') {
          val = 0.12; // 거대한 분노 최대 4회 중첩 시 스킬피해 12.0% 증가 반영
        }
        
        const isMetaKey = ['가동률', '모든스킬강화', '임의스킬강화', '마도저항'].includes(key);
        const finalVal = isMetaKey ? val : val * scale;
        runeStats[key] += finalVal * uptime;
      }
    });
  });

  // 2. 캐릭터 스펙 연산 (시즌2 격투가 패시브: 밤의 흔적 활성 시 힘/의지/행운 +71에 따른 공격력 보정 추가)
  const nightTraceAtk = characterStats.useNightTrace ? 106.5 : 0.0;

  // 2-1. 시즌2 달의 인장 (별의 인장, 푸른 달, 붉은 달) 스탯 연산
  let sealBaseAtk = 0; // 인장 장비 슬롯 강화로 인한 깡공 가산
  let sealEmblemAtkPct = 0.07; // 엠블럼 기본 7%
  let sealStr = 0, sealWil = 0, sealLuk = 0; // 인장 추가 옵션 스탯 합산

  const sealSlots = [
    'weapon', 'necklace', 'ring1', 'ring2', 'emblem', 
    'hat', 'top', 'bottom', 'gloves', 'shoes'
  ];

  sealSlots.forEach(slot => {
    const seal = seals && seals[slot];
    if (!seal || seal.type === 'none') return;

    // A. 장비 슬롯 강화 효과
    if (slot === 'weapon') {
      if (seal.type === 'star') sealBaseAtk += 300;
      else if (seal.type === 'blue_moon') sealBaseAtk += 500;
      else if (seal.type === 'red_moon') sealBaseAtk += 800;
    } else if (slot === 'necklace') {
      if (seal.type === 'star') sealBaseAtk += 150;
      else if (seal.type === 'blue_moon') sealBaseAtk += 250;
      else if (seal.type === 'red_moon') sealBaseAtk += 400;
    } else if (slot === 'emblem') {
      if (seal.type === 'star') sealEmblemAtkPct = 0.10;
      else if (seal.type === 'blue_moon') sealEmblemAtkPct = 0.11;
      else if (seal.type === 'red_moon') sealEmblemAtkPct = 0.12;
    }

    // B. 추가 능력치 가산
    if (seal.type === 'blue_moon') {
      // 1군 스탯 (힘/솜씨/지력) 중 1종
      if (seal.blueStat1Type === 'str') sealStr += seal.blueStat1Value || 27;
      // 2군 스탯 (의지/행운) 중 1종
      if (seal.blueStat2Type === 'wil') sealWil += seal.blueStat2Value || 27;
      else if (seal.blueStat2Type === 'luk') sealLuk += seal.blueStat2Value || 27;
    } else if (seal.type === 'red_moon') {
      // 모든 능력치 가산
      const redVal = seal.redMoonStatValue || 40;
      sealStr += redVal;
      sealWil += redVal;
      sealLuk += redVal;
    }
  });

  // 스탯의 공격력 및 치명타 수치 환산
  const sealAtkFromStats = (sealStr + sealWil) * 1.5;
  const sealCritFromStats = sealLuk * 1.0;

  const baseAtk = (characterStats.baseAttack || 27166.0) + nightTraceAtk + sealBaseAtk + sealAtkFromStats;
  // 특수 보석(헬리오도르, 그린 헬리오도르)으로 인한 모든능력치 공격력 환산 (1당 1.5 공격력 가산)
  const extraGemAtk = (characterStats.extraAllStat || 0) * 1.5;
  const emblemAtkPct = sealEmblemAtkPct; 
  const fastAtkScore = characterStats.fastAtk || 1484.0;
  const fastSkillScore = characterStats.fastSkill || 1488.0;
  const ultScore = characterStats.ultScore || 1792.0;

  // 시즌2 격투가 시즌스킬: 밤의 축복 (15% 공격력 증가 버프 * 가동률 반영)
  const nightBlessingBoost = ((characterStats.nightBlessingUptime || 0) / 100.0) * 0.15;
  const totalAtkPct = runeStats["공격력%"] + runeStats["조건부공증%"] + (characterStats.enchantAtkPct || 6.8) / 100.0 + emblemAtkPct + nightBlessingBoost;
  // 룬의 깡 공격력 추가 가산
  const attack = (baseAtk + extraGemAtk + runeStats["공격력"]) * (1 + totalAtkPct);

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
  
  // 특수 보석(무기 헬리오도르 등)으로 인한 최종 주는피해% 증가 연동
  const gemFinalDmgPct = (characterStats.extraFinalDmgPct || 0.0) / 100.0;
  const totalGivesDmg = runeStats["주는피해%"] + gimmicksDmgPct + gemFinalDmgPct;
  const totalGetsDmg = runeStats["받는피해%"] + healerDmgPct + (activeGimmicks.skillDebuffDmgPct || 10.0) / 100.0;

  // 강타/연타피해
  const baseStrongDmg = (characterStats.strongDmg || 2487.0) / 8500.0;
  // 추가 인챈트 강타피해% 가산 연동
  const enchantStrongPct = (characterStats.strongDmgPct || 0.0) / 100.0;
  const totalStrongDmg = baseStrongDmg * (1 + runeStats["강타피해%"]) + runeStats["강타피해%"] + enchantStrongPct;
  
  const baseChainDmg = (characterStats.chainDmg || 2989.0) / 8500.0;
  // 추가 인챈트 연타피해% 가산 연동
  const enchantChainPct = (characterStats.chainDmgPct || 0.0) / 100.0;
  const totalChainDmg = baseChainDmg * (1 + runeStats["연타피해%"]) + runeStats["연타피해%"] + enchantChainPct;

  // 추가타
  const baseExtraDmg = 2.0;
  const totalExtraDmg = baseExtraDmg + runeStats["추가타피해%"];

  const baseExtraProb = (characterStats.extraProb || 987.0) / 13000.0;
  const totalExtraProb = (1 + baseExtraProb) * (1 + runeStats["추가타확률%"]) - 1;

  // 치명타 (시즌2 격투가 패시브: 밤의 흔적 활성 시 행운 +71 및 달의 인장 스탯 보정 추가)
  const nightTraceCrit = characterStats.useNightTrace ? 71.0 : 0.0;
  const effectiveCritScore = (characterStats.critScore || 6925.0) + nightTraceCrit + (sealCritFromStats || 0.0);
  const baseCritProb = 0.5 * (effectiveCritScore / (effectiveCritScore + 2000)) + (boss === "허수아비" ? 0.3 : 0.0) + (characterStats.critBonusPct || 0);
  const totalCritProb = Math.min(1.0, baseCritProb + runeStats["치명타확률%"]);
  
  const baseCritDmg = 1.4 + (effectiveCritScore / 5000.0);
  const totalCritDmg = baseCritDmg * (1 + runeStats["치명타피해%"]);
  const critMultiplier = (1 - totalCritProb) + (totalCritDmg * totalCritProb);

  // 4대 패시브 스킬 기댓값 통합
  // 1) 연계 공격: 스킬피해 상시 +5% 보정
  const totalSkillDmg = (characterStats.skillPower || 1577.0) / 8500.0 + runeStats["스킬피해%"] + 0.05;
  const totalComboDmg = (characterStats.comboPower || 1532.0) / 17500.0 + runeStats["콤보피해%"];
  const totalMultiDmg = 0.08 + ((characterStats.multiPower || 1082.0) / 8500.0) + runeStats["멀티피해%"];

  // 스킬 스탠스 셋팅 병합
  const stances = skillStances || {};
  const s1Stance = stances.skill_1 || '순정';
  const s2Stance = stances.skill_2 || '순정';
  const s3Stance = stances.skill_3 || '순정';
  const s4Stance = stances.skill_4 || '순정';
  const s5Stance = stances.skill_5 || '순정';

  // 3. 상황별 딜사이클 연산
  const states = ["ordinary", "ordinaryBreak", "ultimate", "ultimateBreak"];
  const results = {};

  states.forEach(state => {
    let cycle = cycleText[state] || "235212";

    // 스펙 기반 스킬 기본 쿨타임 및 계수 데이터 셋팅
    const skillData = {
      // 1번 스킬 (차징 피스트)
      "1-1": { 
        baseCoeff: s1Stance === '충돌' ? 1.775 : (s1Stance === '약점' ? 0.92 : 1.475), 
        baseCast: s1Stance === '약점' ? 1.0 : 4.0 
      },
      "1-2": { baseCoeff: 0.81, baseCast: 1.45 },
      
      // 2번 스킬 (연환격)
      "2-1": { 
        baseCoeff: s2Stance === '전진' ? 0.465 : (s2Stance === '도약' ? 0.64 : 0.405), 
        baseCast: 1.0 
      },
      "2-2": { baseCoeff: 0.525, baseCast: 1.3 },
      
      // 3번 스킬 (섬격)
      "3": { 
        baseCoeff: s3Stance === '순발력' ? 0.24 : 0.085, 
        baseCast: 0.85 
      },
      
      // 4번 스킬 (버스트 펀치 / 소닉 피스트)
      "4-1": { 
        baseCoeff: s4Stance === '격파' ? 0.188 : 0.141, 
        baseCast: 0.8 
      },
      "4-2": { 
        baseCoeff: s4Stance === '격파' ? 0.328 : 0.25, 
        baseCast: 0.8 
      },
      "4-3": { 
        baseCoeff: s4Stance === '격파' ? 0.468 : 0.354, 
        baseCast: 0.8 
      },
      
      // 소닉 피스트 단일 콤보 치환 정보 (승천+)
      "sonic": {
        baseCoeff: 1.09 * 2.98, // 1타 100% + 추가 3타 (90% + 75% + 60%) 기댓값 합산 2.98배
        baseCast: 1.0 + (0.90 * 0.8) + (0.90 * 0.75 * 0.8) + (0.90 * 0.75 * 0.60 * 0.8) // 기댓값 시전속도 2.584초
      },

      // 5번 스킬 (비룡격 / 섬머솔트)
      "5-1": { 
        baseCoeff: s5Stance === '열혈' ? 0.435 : 0.32, 
        baseCast: 1.0 
      },
      "5-2": { 
        baseCoeff: s5Stance === '열혈' ? 0.60 : 0.435, 
        baseCast: 1.0 
      },
      "5-3": { 
        baseCoeff: s5Stance === '열혈' ? 0.86 : 0.63, 
        baseCast: 1.0 
      },
      
      // 섬머솔트 단일 콤보 치환 정보 (강격/열혈)
      "somersault": {
        baseCoeff: 1.53,
        baseCast: 1.0
      },

      // 6번 스킬 (궁극기)
      "6": { baseCoeff: 16.5, baseCast: 3.0 }
    };

    let totalCycleCoeff = 0.0;
    let totalCycleTime = 0.0;
    let nonUltSkillCount = 0; // 패시브 '충격파' 기댓값 스택 카운트
    let totalHits = 0;        // 딜사이클 당 누적 적중 타수
    let s3Count = 0;          // 딜사이클 내 백 스텝 시전 수

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
        if (s4Stance === '소닉 피스트' || s4Stance === '승천') {
          listSkills.push("sonic");
        } else {
          listSkills.push("4-1", "4-2", "4-3");
        }
      } else if (char === '5') {
        if (s5Stance === '섬머솔트') {
          listSkills.push("somersault");
        } else {
          listSkills.push("5-1", "5-2", "5-3");
        }
      } else if (char === '6') {
        listSkills.push("6");
      }
    }

    listSkills.forEach((skillName) => {
      const sk = skillData[skillName];
      if (!sk) return;

      // 6번 스킬은 스킬 6의 개조레벨, 5-x는 5번, 4-x는 4번, 3은 3번...
      let skillGroup = skillName.startsWith("sonic") ? "4" : (skillName.startsWith("somersault") ? "5" : skillName.charAt(0));
      // 모든스킬강화 및 임의스킬강화(3개 스킬 2강화 기댓값 60%) 누적 반영
      const allSkillBoost = runeStats["모든스킬강화"] || 0;
      const randSkillBoost = (runeStats["임의스킬강화"] || 0) * 0.6;
      const level = (characterStats[`skillLevel_${skillGroup}`] || 10) + allSkillBoost + randSkillBoost;
      const coeff = getModifiedCoeff(sk.baseCoeff, level);

      // 스킬속도% 및 빠른스킬 스탯(fastSkill) 반영
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

      // 충격파 스택 (궁극기 제외)
      if (skillGroup !== '6') {
        nonUltSkillCount += 1;
      }

      // 시즌2 격투가 신규 시즌스킬을 위한 타수 및 백 스텝(3번스킬) 시전 횟수 집계
      totalHits += SKILL_HITS[skillName] || 0;
      if (skillName === "3") {
        s3Count += 1;
      }
    });

    if (totalCycleTime === 0) totalCycleTime = 1;

    // 2) 전투 숙련: 파멸 적용 (무방비 상태 가해지는 피해량 +5%)
    const isUnarmed = state.includes("Break");
    const unarmedDmgCoeff = isUnarmed ? (1 + (characterStats.comboPower || 1532.0) / 5250.0 + 0.4 + 0.05) : 1.0;

    // DPS 계산 (주는피해% 및 치명타 기댓값 배율 반영)
    let skillDps = attack * totalCycleCoeff * (1 + totalGivesDmg) * (1 + totalGetsDmg) * critMultiplier * armorCoeff * unarmedDmgCoeff / totalCycleTime;

    // 3) 충격파 패시브 가산 (스킬 3회당 공격력의 98% 피해)
    const waveCount = Math.floor(nonUltSkillCount / 3);
    if (waveCount > 0) {
      const waveDmg = attack * 0.98 * (1 + totalGivesDmg) * (1 + totalGetsDmg) * armorCoeff * unarmedDmgCoeff;
      skillDps += (waveDmg * waveCount) / totalCycleTime;
    }

    // 4) 파쇄권 패시브 가산 (3초 쿨타임마다 공격력의 1.78배 피해 상시 발생)
    const crashDps = (attack * 1.78 * (1 + totalGivesDmg) * (1 + totalGetsDmg) * armorCoeff * unarmedDmgCoeff) / 3;
    skillDps += crashDps;

    // 5) 시즌2 시즌스킬: 데들리 임팩트 가산 (강타강화 수치 strongDmg 비례 추가타, 3번 스킬 사용횟수 연동)
    if (characterStats.useDeadlyImpact && s3Count > 0) {
      const strongRatio = Math.min(1.0, (characterStats.strongDmg || 0) / 5000);
      const deadlyImpactBaseDmg = 15073 + (75365 - 15073) * strongRatio;
      // 일반 주는피해% 및 받는피해% 보정, 치명타 기댓값 배율 및 방어 계수 가산
      const deadlyImpactFinalDmg = deadlyImpactBaseDmg * (1 + totalGivesDmg) * (1 + totalGetsDmg) * critMultiplier * armorCoeff * unarmedDmgCoeff;
      skillDps += (deadlyImpactFinalDmg * s3Count) / totalCycleTime;
    }

    // 6) 시즌2 시즌스킬: 히트 콤보 가산 (10적중 시 100% 확정 치명타 폭발 피해)
    if (characterStats.useHitCombo && totalHits >= 10) {
      const hitComboCount = Math.floor(totalHits / 10);
      // 147777 피해량은 치명타 100% 적용으로, 치명적중과 무관하게 totalCritDmg을 곱연산
      const hitComboBaseDmg = 147777 * totalCritDmg * (1 + totalGivesDmg) * (1 + totalGetsDmg) * armorCoeff * unarmedDmgCoeff;
      skillDps += (hitComboBaseDmg * hitComboCount) / totalCycleTime;
    }

    // 추가타(직접피해) 계산
    const baseDamageMultiplier = (1 + totalGivesDmg + totalSkillDmg) * (1 + totalGetsDmg) * (1 + totalStrongDmg + totalChainDmg + totalComboDmg);
    const extraProbMultiplier = (1 - totalExtraProb) + (totalExtraDmg * totalExtraProb);
    const directDps = baseDamageMultiplier * critMultiplier * extraProbMultiplier * attack * 2 * totalExtraProb * armorCoeff;

    // 지속피해 계산
    const dotDps = (1 + totalGivesDmg + totalSkillDmg) * (1 + totalGetsDmg) * totalMultiDmg * attack * 2 * armorCoeff;

    // 초월 룬 각인 보정 (각 룬의 transcendLevel 누적 합)
    const totalTranscendLevel = selectedRunes.reduce((acc, r) => acc + (r && r.transcendLevel ? r.transcendLevel : 0), 0);
    const transcendCoeff = 1.015 ** totalTranscendLevel;

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
    critDmg: parseFloat((totalCritDmg * 100).toFixed(1)),
    totalResist: Math.round(runeStats["마도저항"]),
    runeAtkAdd: Math.round(runeStats["공격력"])
  };
}
