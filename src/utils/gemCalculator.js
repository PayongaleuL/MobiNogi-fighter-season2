// 보석 등급 및 세공 옵션 합산 연산 유틸리티

const gradeValues = {
  '스타프리즘': { dmg: 2.00, cd: 0.65 },
  '스타프리즘S': { dmg: 2.10, cd: 0.70 },
  '온전한 스타프리즘': { dmg: 2.20, cd: 0.75 },
  
  // 특수 보석 계열 (세공 기본 효율은 스타프리즘S와 동일하게 뎀증 2.1%, 쿨감 0.70% 상속)
  '헬리오도르': { dmg: 2.10, cd: 0.70 },
  '정제된 헬리오도르': { dmg: 2.10, cd: 0.70 },
  '순수한 헬리오도르': { dmg: 2.10, cd: 0.70 },
  '그린 헬리오도르': { dmg: 2.10, cd: 0.70 },
  '정제된 그린 헬리오도르': { dmg: 2.10, cd: 0.70 },
  '순수한 그린 헬리오도르': { dmg: 2.10, cd: 0.70 }
};

/**
 * 22개 보석 데이터를 받아 세공 스탯 및 특수보석 가산 올스탯/최종뎀증%을 산출합니다.
 * @param {Array} gems 보석 데이터 리스트
 * @returns {Object} { gemStats, extraAllStat, extraFinalDmgPct }
 */
export function calculateGemStats(gems = []) {
  const calculatedGemStats = {
    strongDmg: 0.0, strongCd: 0.0,
    moveDmg: 0.0, moveCd: 0.0,
    subDmg: 0.0, subCd: 0.0,
    saveDmg: 0.0, saveCd: 0.0,
    disableDmg: 0.0, disableCd: 0.0,
    doubleDmg: 0.0, doubleCd: 0.0,
    summonDmg: 0.0, summonCd: 0.0,
    elementDmg: 0.0, elementCd: 0.0
  };

  let extraAllStat = 0;
  let extraFinalDmgPct = 0.0;
  let emblemSkillTagBoost = 0.0;

  gems.forEach(gem => {
    if (!gem || gem.grade === '미장착') return;

    // 1. 특수 보석 고유 능력치 파싱
    if (gem.grade === '헬리오도르') {
      extraAllStat += 36;
      extraFinalDmgPct += 5.0;
    } else if (gem.grade === '정제된 헬리오도르') {
      extraAllStat += 44;
      extraFinalDmgPct += 5.2;
    } else if (gem.grade === '순수한 헬리오도르') {
      extraAllStat += 54;
      extraFinalDmgPct += 5.4;
    } else if (gem.grade === '그린 헬리오도르') {
      extraAllStat += 36;
      emblemSkillTagBoost += 1.50;
    } else if (gem.grade === '정제된 그린 헬리오도르') {
      extraAllStat += 44;
      emblemSkillTagBoost += 2.10;
    } else if (gem.grade === '순수한 그린 헬리오도르') {
      extraAllStat += 54;
      emblemSkillTagBoost += 2.20;
    }

    // 2. 세공 옵션 누적
    if (!gem.options || gem.options.length === 0) return;
    const values = gradeValues[gem.grade];
    if (!values) return;

    gem.options.forEach(opt => {
      if (opt === '강뎀') calculatedGemStats.strongDmg += values.dmg;
      else if (opt === '강쿨') calculatedGemStats.strongCd += values.cd;
      else if (opt === '이뎀') calculatedGemStats.moveDmg += values.dmg;
      else if (opt === '이쿨') calculatedGemStats.moveCd += values.cd;
      else if (opt === '보뎀') calculatedGemStats.subDmg += values.dmg;
      else if (opt === '보쿨') calculatedGemStats.subCd += values.cd;
      else if (opt === '생존뎀') calculatedGemStats.saveDmg += values.dmg;
      else if (opt === '생존쿨') calculatedGemStats.saveCd += values.cd;
      else if (opt === '방해뎀') calculatedGemStats.disableDmg += values.dmg;
      else if (opt === '방해쿨') calculatedGemStats.disableCd += values.cd;
      else if (opt === '연타뎀') calculatedGemStats.doubleDmg += values.dmg;
      else if (opt === '연타쿨') calculatedGemStats.doubleCd += values.cd;
      else if (opt === '소환뎀') calculatedGemStats.summonDmg += values.dmg;
      else if (opt === '소환쿨') calculatedGemStats.summonCd += values.cd;
      else if (opt === '원소뎀') calculatedGemStats.elementDmg += values.dmg;
      else if (opt === '원소쿨') calculatedGemStats.elementCd += values.cd;
    });
  });

  // 3. 그린 헬리오도르의 모든 스킬태그 데미지 강화% 일괄 누적
  if (emblemSkillTagBoost > 0) {
    calculatedGemStats.strongDmg += emblemSkillTagBoost;
    calculatedGemStats.moveDmg += emblemSkillTagBoost;
    calculatedGemStats.subDmg += emblemSkillTagBoost;
    calculatedGemStats.saveDmg += emblemSkillTagBoost;
    calculatedGemStats.disableDmg += emblemSkillTagBoost;
    calculatedGemStats.doubleDmg += emblemSkillTagBoost;
    calculatedGemStats.summonDmg += emblemSkillTagBoost;
    calculatedGemStats.elementDmg += emblemSkillTagBoost;
  }

  // 소수점 2자리 반올림
  Object.keys(calculatedGemStats).forEach(k => {
    calculatedGemStats[k] = parseFloat(calculatedGemStats[k].toFixed(2));
  });

  return { gemStats: calculatedGemStats, extraAllStat, extraFinalDmgPct };
}
