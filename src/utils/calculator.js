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

const fallbackParsedSkills = {
  passives: {
    waveBaseDmg: 39019,
    crashBaseDmg: 70945
  },
  skills: {
    "1-1": {
      "순정": { baseDamage: 122084, refLevel: 12, baseCast: 4.0, cooldown: 15 },
      "약점": { baseDamage: 76147, refLevel: 12, baseCast: 0.5, cooldown: 12 },
      "충돌": { baseDamage: 146914, refLevel: 12, baseCast: 4.0, cooldown: 15 }
    },
    "1-2": {
      "순정": { baseDamage: 67043, refLevel: 12, baseCast: 1.45 }
    },
    "2-1": {
      "순정": { baseDamage: 32084, refLevel: 10, baseCast: 1.0, cooldown: 14 },
      "전진": { baseDamage: 36838, refLevel: 10, baseCast: 1.0, cooldown: 14 },
      "도약": { baseDamage: 50700, refLevel: 10, baseCast: 1.0, cooldown: 14 }
    },
    "2-2": {
      "순정": { baseDamage: 41580, refLevel: 10, baseCast: 1.3 }
    },
    "3": {
      "순정": { baseDamage: 7035, refLevel: 12, baseCast: 0.85, cooldown: 10 },
      "순발력": { baseDamage: 49661, refLevel: 12, baseCast: 0.85, cooldown: 10 }
    },
    "4-1": {
      "순정": { baseDamage: 16672, refLevel: 30, baseCast: 0.8, cooldown: 15 },
      "격파": { baseDamage: 22228, refLevel: 30, baseCast: 0.8, cooldown: 15 }
    },
    "4-2": {
      "순정": { baseDamage: 29560, refLevel: 30, baseCast: 0.8 },
      "격파": { baseDamage: 38783, refLevel: 30, baseCast: 0.8 }
    },
    "4-3": {
      "순정": { baseDamage: 41857, refLevel: 30, baseCast: 0.8 },
      "격파": { baseDamage: 55338, refLevel: 30, baseCast: 0.8 }
    },
    "sonic": {
      "승천": { baseDamage: 135978, refLevel: 30, baseCast: 2.584, cooldown: 12 },
      "순정": { baseDamage: 135978, refLevel: 30, baseCast: 2.584, cooldown: 12 }
    },
    "5-1": {
      "순정": { baseDamage: 36323, refLevel: 28, baseCast: 1.0, cooldown: 14 },
      "열혈": { baseDamage: 42567, refLevel: 28, baseCast: 1.0, cooldown: 15 }
    },
    "5-2": {
      "순정": { baseDamage: 49377, refLevel: 28, baseCast: 1.0 },
      "열혈": { baseDamage: 57891, refLevel: 28, baseCast: 1.0 }
    },
    "5-3": {
      "순정": { baseDamage: 71512, refLevel: 28, baseCast: 1.0 },
      "열혈": { baseDamage: 83999, refLevel: 28, baseCast: 1.0 }
    },
    "somersault": {
      "강격": { baseDamage: 183322, refLevel: 28, baseCast: 1.0, cooldown: 13.5 },
      "순정": { baseDamage: 183322, refLevel: 28, baseCast: 1.0, cooldown: 13.5 }
    },
    "6": {
      "순정": { baseDamage: 0, refLevel: 28, baseCast: 3.0 }
    }
  }
};

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
export function calculateDPS(characterStats, selectedRunes, activeGimmicks, cycleText, enchantStats = {}, gemStats = {}, skillStances = {}, seals = {}, parsedSkills) {
  const conditionalUptimes = enchantStats;
  const parsed = (parsedSkills && Object.keys(parsedSkills).length > 0) ? parsedSkills : fallbackParsedSkills;
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

    Object.keys(rune.stats).forEach(key => {
      let val = rune.stats[key];
      if (val === undefined || val === 0) return;

      const isMetaKey = ['가동률', '모든스킬강화', '임의스킬강화', '마도저항'].includes(key);
      const finalVal = isMetaKey ? val : val * scale;

      if (key.startsWith("밤축_")) {
        const targetKey = key.replace("밤축_", "");
        const nbUptime = (characterStats.nightBlessingUptime || 0) / 100.0;
        if (runeStats[targetKey] !== undefined) {
          runeStats[targetKey] += finalVal * uptime * nbUptime;
        }
      } else {
        if (name === '거대한 분노' && key === '스킬피해%') {
          runeStats[key] += 0.12 * uptime;
        } else if (runeStats[key] !== undefined) {
          runeStats[key] += finalVal * uptime;
        }
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

  // 스탠스 키워드 매칭 보조 함수 (유저가 도약+, 도약, 강격+, 강격 등을 셋팅하더라도 정교하게 매칭)
  const matchStance = (val, keyword) => {
    if (!val) return false;
    return val.replace(/\+/g, '').replace(/\s+/g, '').trim().includes(keyword);
  };

  // 3. 상황별 딜사이클 연산
  const states = ["ordinary", "ordinaryBreak", "ultimate", "ultimateBreak"];
  const results = {};

  states.forEach(state => {
    let cycle = cycleText[state] || "235212";

    // 스펙 기반 스킬 기본 쿨타임 및 계수 데이터 셋팅
    const skillData = {
      // 1번 스킬 (차징 피스트)
      "1-1": { 
        baseCoeff: matchStance(s1Stance, '충돌') ? 1.775 : (matchStance(s1Stance, '약점') ? 0.92 : 1.475), 
        baseCast: matchStance(s1Stance, '약점') ? 1.0 : 4.0 
      },
      "1-2": { baseCoeff: 0.81, baseCast: 1.45 },
      
      // 2번 스킬 (연환격)
      "2-1": { 
        baseCoeff: matchStance(s2Stance, '전진') ? 0.465 : (matchStance(s2Stance, '도약') ? 0.64 : 0.405), 
        baseCast: 1.0 
      },
      "2-2": { baseCoeff: 0.525, baseCast: 1.3 },
      
      // 3번 스킬 (섬격)
      "3": { 
        baseCoeff: matchStance(s3Stance, '순발력') ? 0.24 : 0.085, 
        baseCast: 0.85 
      },
      
      // 4번 스킬 (버스트 펀치 / 소닉 피스트)
      "4-1": { 
        baseCoeff: matchStance(s4Stance, '격파') ? 0.188 : 0.141, 
        baseCast: 0.8 
      },
      "4-2": { 
        baseCoeff: matchStance(s4Stance, '격파') ? 0.328 : 0.25, 
        baseCast: 0.8 
      },
      "4-3": { 
        baseCoeff: matchStance(s4Stance, '격파') ? 0.468 : 0.354, 
        baseCast: 0.8 
      },
      
      // 소닉 피스트 단일 콤보 치환 정보 (승천+)
      "sonic": {
        baseCoeff: 1.09 * 2.98, // 1타 100% + 추가 3타 (90% + 75% + 60%) 기댓값 합산 2.98배
        baseCast: 1.0 + (0.90 * 0.8) + (0.90 * 0.75 * 0.8) + (0.90 * 0.75 * 0.60 * 0.8) // 기댓값 시전속도 2.584초
      },

      // 5번 스킬 (비룡격 / 섬머솔트)
      "5-1": { 
        baseCoeff: matchStance(s5Stance, '열혈') ? 0.435 : 0.32, 
        baseCast: 1.0 
      },
      "5-2": { 
        baseCoeff: matchStance(s5Stance, '열혈') ? 0.60 : 0.435, 
        baseCast: 1.0 
      },
      "5-3": { 
        baseCoeff: matchStance(s5Stance, '열혈') ? 0.86 : 0.63, 
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


    let totalCycleBaseDmg = 0.0;
    let totalCycleTime = 0.0;
    let nonUltSkillCount = 0; // 패시브 '충격파' 기댓값 스택 카운트
    let totalHits = 0;        // 딜사이클 당 누적 적중 타수
    let s3Count = 0;          // 딜사이클 내 백 스텝 시전 수

    // 딜사이클 문자열 쪼개기 매핑 (한글 스탠스명 및 특수기호 혼용 지원 보정)
    const listSkills = [];
    let parsedCycle = cycle.replace(/\s+/g, '');
    
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(parsedCycle)) {
      const tokens = parsedCycle.match(/(도약|승천|강격|격파|약점|충돌|전진|순발력|열혈|섬머솔트|소닉|비룡|연환|차징|궁극)/g) || [];
      if (tokens.length > 0) {
        let tempCycleStr = "";
        tokens.forEach(tok => {
          if (tok === '약점' || tok === '충돌' || tok === '차징') tempCycleStr += "1";
          else if (tok === '도약' || tok === '전진' || tok === '연환') tempCycleStr += "2";
          else if (tok === '순발력') tempCycleStr += "3";
          else if (tok === '승천' || tok === '격파' || tok === '소닉') tempCycleStr += "4";
          else if (tok === '강격' || tok === '열혈' || tok === '섬머솔트' || tok === '비룡') tempCycleStr += "5";
          else if (tok === '궁극') tempCycleStr += "6";
        });
        parsedCycle = tempCycleStr;
      }
    } else {
      parsedCycle = parsedCycle.replace(/[^1-6]/g, '');
    }

    for (let char of parsedCycle) {
      if (char === '1') {
        listSkills.push("1-1", "1-2");
      } else if (char === '2') {
        if (matchStance(s2Stance, '도약') || matchStance(s2Stance, '전진')) {
          listSkills.push("2-1"); // 단일 격투 콤보형
        } else {
          listSkills.push("2-1", "2-2");
        }
      } else if (char === '3') {
        listSkills.push("3");
      } else if (char === '4') {
        if (matchStance(s4Stance, '소닉') || matchStance(s4Stance, '승천')) {
          listSkills.push("sonic");
        } else {
          listSkills.push("4-1", "4-2", "4-3");
        }
      } else if (char === '5') {
        if (matchStance(s5Stance, '섬머') || matchStance(s5Stance, '강격')) {
          listSkills.push("somersault");
        } else {
          listSkills.push("5-1", "5-2", "5-3");
        }
      } else if (char === '6') {
        listSkills.push("6");
      }
    }

    listSkills.forEach((skillName) => {
      // 6번 스킬은 스킬 6의 개조레벨, 5-x는 5번, 4-x는 4번, 3은 3번...
      let skillGroup = skillName.startsWith("sonic") ? "4" : (skillName.startsWith("somersault") ? "5" : skillName.charAt(0));
      // 모든스킬강화 및 임의스킬강화(3개 스킬 2강화 기댓값 60%) 누적 반영
      const allSkillBoost = runeStats["모든스킬강화"] || 0;
      const randSkillBoost = (runeStats["임의스킬강화"] || 0) * 0.6;
      const userLevel = (characterStats[`skillLevel_${skillGroup}`] || 10) + allSkillBoost + randSkillBoost;

      // parsedSkills 에서 스킬 정보를 가져옴
      const skillGroupObj = parsed.skills[skillName] || {};
      let targetStance = '순정';
      if (skillName === "1-1") {
        targetStance = matchStance(s1Stance, '약점') ? '약점' : (matchStance(s1Stance, '충돌') ? '충돌' : '순정');
      } else if (skillName === "2-1") {
        targetStance = matchStance(s2Stance, '전진') ? '전진' : (matchStance(s2Stance, '도약') ? '도약' : '순정');
      } else if (skillName === "3") {
        targetStance = matchStance(s3Stance, '순발력') ? '순발력' : '순정';
      } else if (skillName === "4-1" || skillName === "4-2" || skillName === "4-3") {
        targetStance = matchStance(s4Stance, '격파') ? '격파' : '순정';
      } else if (skillName === "sonic") {
        targetStance = (matchStance(s4Stance, '승천') || matchStance(s4Stance, '소닉')) ? '승천' : '순정';
      } else if (skillName === "5-1" || skillName === "5-2" || skillName === "5-3") {
        targetStance = matchStance(s5Stance, '열혈') ? '열혈' : '순정';
      } else if (skillName === "somersault") {
        targetStance = (matchStance(s5Stance, '강격') || matchStance(s5Stance, '섬머')) ? '강격' : '순정';
      }

      let skillInfo = skillGroupObj[targetStance];
      if (!skillInfo) {
        skillInfo = skillGroupObj["순정"] || Object.values(skillGroupObj)[0] || {};
      }

      const baseDamage = skillInfo.baseDamage !== undefined ? skillInfo.baseDamage : 0;
      const refLevel = skillInfo.refLevel !== undefined ? skillInfo.refLevel : 12;
      const baseCast = skillInfo.baseCast !== undefined ? skillInfo.baseCast : 1.0;

      // getBonus 헬퍼 정의
      const getBonus = (lv) => {
        return 0.02 * ((lv >= 2 ? 1 : 0) + (lv >= 10 ? 1 : 0) + (lv >= 15 ? 1 : 0) + (lv >= 20 ? 1 : 0) + (lv >= 30 ? 1 : 0));
      };
      const bonusDiff = getBonus(userLevel) - getBonus(refLevel);
      const atkScale = attack / 27166.0;
      const modifiedDamage = baseDamage * (1 + 0.03 * (userLevel - refLevel) + bonusDiff) * atkScale;

      // 스킬속도% 및 빠른스킬 스탯(fastSkill) 반영
      const speedRuneAndStat = runeStats["스킬속도%"] + (fastSkillScore * 0.00007);
      const speedPct = speedRuneAndStat + (activeGimmicks.hasSpdBuff ? 0.10 : 0.0);
      const castTime = baseCast * (1 - speedPct);

      // 보석 세공 데미지 증가% 적용
      const category = SKILL_CATEGORIES[skillName];
      let gemDmgBonus = 0.0;
      if (category && gemStats[`${category.dmg}Dmg`]) {
        gemDmgBonus = gemStats[`${category.dmg}Dmg`] / 100.0;
      }

      // 스킬 유형별 증폭 배율 계산 (스킬피해%, 콤보피해%, 강타/연타피해% 시너지 결합)
      let typeMult = 1.0;
      if (category) {
        if (category.dmg === 'strong') {
          typeMult = 1 + totalStrongDmg;
        } else if (category.dmg === 'chain' || category.dmg === 'move') {
          typeMult = 1 + totalChainDmg;
        } else if (category.dmg === 'double' || skillName === 'somersault') {
          typeMult = 1 + totalChainDmg;
        }
      } else if (skillGroup === '6') {
        const ultBoost = (characterStats.ultScore || 1792.0) / 5000.0;
        typeMult = 1 + ultBoost;
      }

      const skillComboMult = (1 + totalSkillDmg) * (1 + totalComboDmg);

      totalCycleBaseDmg += modifiedDamage * (1 + gemDmgBonus) * typeMult * skillComboMult;
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

    // DPS 계산 (주는피해% 및 치명타 기댓값 배율 반영 - 물리 피해 200% 배율 복원)
    let skillDps = (totalCycleBaseDmg * 2) * (1 + totalGivesDmg) * (1 + totalGetsDmg) * critMultiplier * armorCoeff * unarmedDmgCoeff / totalCycleTime;

    // 3) 충격파 패시브 가산
    const waveCount = Math.floor(nonUltSkillCount / 3);
    const waveBaseDmg = parsed.passives.waveBaseDmg !== undefined ? parsed.passives.waveBaseDmg : 39019;
    const waveDmg = ((waveBaseDmg * (attack / 27166.0)) * 2) * (1 + totalGivesDmg) * (1 + totalGetsDmg) * (1 + totalSkillDmg) * (1 + totalComboDmg) * armorCoeff * unarmedDmgCoeff;
    if (waveCount > 0) {
      skillDps += (waveDmg * waveCount) / totalCycleTime;
    }

    // 4) 파쇄권 패시브 가산
    const crashBaseDmg = parsed.passives.crashBaseDmg !== undefined ? parsed.passives.crashBaseDmg : 70945;
    const crashDps = (((crashBaseDmg * (attack / 27166.0)) * 2) * (1 + totalGivesDmg) * (1 + totalGetsDmg) * (1 + totalSkillDmg) * (1 + totalComboDmg) * armorCoeff * unarmedDmgCoeff) / 3;
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

    const scaleFactor = 1.0;
    results[state] = {
      skillDps: Math.round(skillDps * scaleFactor),
      directDps: Math.round(directDps * scaleFactor),
      dotDps: Math.round(dotDps * scaleFactor),
      totalDps: Math.round(totalDps * scaleFactor),
      cycleTime: parseFloat(totalCycleTime.toFixed(2)),
      cycleCoeff: parseFloat(totalCycleBaseDmg.toFixed(3)),
      cycleBaseDmg: Math.round(totalCycleBaseDmg)
    };
  });

  // 상황 비중별 혼합 DPS 연산
  let ordTime = activeGimmicks.ordinaryTime || 87;
  let breakTime = activeGimmicks.unarmedTime || 0;
  let ultTime = activeGimmicks.ultimateTime || 33;

  if (boss === "허수아비") {
    // 그냥 허수아비는 실전 데이터 기준 90% 이상 무방비(Break) 상태가 유지됨
    const total = ordTime + breakTime + ultTime || 120;
    breakTime = total * 0.90;
    ordTime = total * 0.10;
    ultTime = 0.0;
  }
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
