const OFFICIAL_EXCESS_POINTS = [
  { excess: 0, finalDamagePct: 0 },
  { excess: 500, finalDamagePct: 4.1 },
  { excess: 1000, finalDamagePct: 7.9 },
  { excess: 2000, finalDamagePct: 14.6 },
  { excess: 4000, finalDamagePct: 25 },
  { excess: 8000, finalDamagePct: 37.5 },
];

export const MAX_MAGIC_RESISTANCE_FINAL_DAMAGE_PCT = 50;

function asNonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

/**
 * 넥슨 공식 가이드의 예시점을 구간별 선형 보간한다.
 * 공식은 체감 곡선·50% 상한을 공개했지만 연속 함수를 제공하지 않으므로,
 * 예시점 밖(8,000 초과)은 수치 추정을 하지 않고 마지막 공개값에서 고정한다.
 */
export function getMagicResistanceExcessFinalDamagePct(excessResistance) {
  const excess = asNonNegativeNumber(excessResistance);
  const lastPoint = OFFICIAL_EXCESS_POINTS.at(-1);

  if (excess >= lastPoint.excess) return lastPoint.finalDamagePct;

  for (let index = 1; index < OFFICIAL_EXCESS_POINTS.length; index += 1) {
    const upper = OFFICIAL_EXCESS_POINTS[index];
    const lower = OFFICIAL_EXCESS_POINTS[index - 1];
    if (excess <= upper.excess) {
      const progress = (excess - lower.excess) / (upper.excess - lower.excess);
      return lower.finalDamagePct + (upper.finalDamagePct - lower.finalDamagePct) * progress;
    }
  }

  return 0;
}

/**
 * 장비·룬 합산 마도저항과 대상 마도압력의 차이를 계산한다.
 * 미달 페널티의 정량식은 공식 비공개이므로 피해 배율을 변경하지 않고 상태만 표기한다.
 */
export function calculateMagicResistanceEffect(magicResistance, magicPressure) {
  const resistance = asNonNegativeNumber(magicResistance);
  const pressure = asNonNegativeNumber(magicPressure);
  const difference = resistance - pressure;
  const excess = Math.max(0, difference);
  const isBelowPressure = difference < 0;
  const excessFinalDamagePct = getMagicResistanceExcessFinalDamagePct(excess);

  return {
    magicResistance: resistance,
    magicPressure: pressure,
    difference,
    excess,
    isBelowPressure,
    excessFinalDamagePct,
    finalDamageMultiplier: 1 + excessFinalDamagePct / 100,
    belowPressurePenaltyApplied: false,
    maxFinalDamagePct: MAX_MAGIC_RESISTANCE_FINAL_DAMAGE_PCT,
  };
}
