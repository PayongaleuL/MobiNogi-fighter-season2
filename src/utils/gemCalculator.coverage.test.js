import { describe, expect, it } from 'vitest';
import { calculateGemStats } from './gemCalculator';

const allOptions = [
  '강뎀', '강쿨', '이뎀', '이쿨', '보뎀', '보쿨', '생존뎀', '생존쿨',
  '방해뎀', '방해쿨', '연타뎀', '연타쿨', '소환뎀', '소환쿨', '원소뎀', '원소쿨'
];

describe('calculateGemStats coverage regression suite', () => {
  it('accumulates every standard option and ignores unmounted, empty, and unknown gems', () => {
    const { gemStats } = calculateGemStats([
      null,
      { grade: '미장착', options: allOptions },
      { grade: '온전한 스타프리즘' },
      { grade: '알 수 없는 등급', options: ['강뎀'] },
      { grade: '온전한 스타프리즘', options: [...allOptions, '알 수 없는 옵션'] }
    ]);

    expect(gemStats).toEqual({
      strongDmg: 2.2,
      strongCd: 0.75,
      moveDmg: 2.2,
      moveCd: 0.75,
      subDmg: 2.2,
      subCd: 0.75,
      saveDmg: 2.2,
      saveCd: 0.75,
      disableDmg: 2.2,
      disableCd: 0.75,
      doubleDmg: 2.2,
      doubleCd: 0.75,
      summonDmg: 2.2,
      summonCd: 0.75,
      elementDmg: 2.2,
      elementCd: 0.75
    });
  });

  it('applies every heliodor and green heliodor branch with rounding', () => {
    const result = calculateGemStats([
      { grade: '스타프리즘', options: ['강뎀'] },
      { grade: '스타프리즘S', options: ['강쿨'] },
      { grade: '헬리오도르', options: ['이뎀'] },
      { grade: '정제된 헬리오도르', options: ['이쿨'] },
      { grade: '순수한 헬리오도르', options: ['보뎀'] },
      { grade: '그린 헬리오도르', options: ['보쿨'] },
      { grade: '정제된 그린 헬리오도르', options: ['생존뎀'] },
      { grade: '순수한 그린 헬리오도르', options: ['생존쿨'] }
    ]);

    expect(result.extraAllStat).toBe(268);
    expect(result.extraFinalDmgPct).toBeCloseTo(15.6, 6);
    expect(result.gemStats.strongDmg).toBeCloseTo(7.8, 6);
    expect(result.gemStats.moveDmg).toBeCloseTo(7.9, 6);
    expect(result.gemStats.subDmg).toBeCloseTo(7.9, 6);
    expect(result.gemStats.saveDmg).toBeCloseTo(7.9, 6);
    expect(result.gemStats.disableDmg).toBeCloseTo(5.8, 6);
    expect(result.gemStats.elementDmg).toBeCloseTo(5.8, 6);
    expect(result.gemStats.strongCd).toBeCloseTo(0.7, 6);
    expect(result.gemStats.saveCd).toBeCloseTo(0.7, 6);
  });
});
