// 달의 인장 설정 합산 연산 유틸리티

const sealSlots = [
  'weapon', 'necklace', 'ring1', 'ring2', 'emblem', 
  'hat', 'top', 'bottom', 'gloves', 'shoes'
];

/**
 * 10개 부위의 인장 데이터를 받아 최종 공격력 가산치, 엠블럼 기본 공격력%, 힘/의지/행운 가산 스탯을 연산합니다.
 * @param {Object} seals 인장 데이터 객체
 * @returns {Object} { sealBaseAtk, sealEmblemAtkPct, sealStr, sealWil, sealLuk, sealAtkFromStats, sealCritFromStats }
 */
export function calculateSealStats(seals = {}) {
  let sealBaseAtk = 0; // 인장 장비 슬롯 강화로 인한 깡공 가산
  let sealEmblemAtkPct = 0.07; // 엠블럼 기본 7%
  let sealStr = 0, sealWil = 0, sealLuk = 0; // 인장 추가 옵션 스탯 합산

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

  return {
    sealBaseAtk,
    sealEmblemAtkPct,
    sealStr,
    sealWil,
    sealLuk,
    sealAtkFromStats,
    sealCritFromStats
  };
}
