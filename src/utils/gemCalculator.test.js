import { describe, it, expect } from 'vitest';
import { calculateGemStats } from './gemCalculator';

describe('gemCalculator 테스트', () => {
  it('보석이 미장착이거나 비어있을 때 기본 스탯을 반환해야 함', () => {
    const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats([]);
    expect(gemStats.strongDmg).toBe(0);
    expect(extraAllStat).toBe(0);
    expect(extraFinalDmgPct).toBe(0);
  });

  it('스타프리즘 세공 강타/연타 세공 옵션을 누적하여 정상 연산해야 함', () => {
    const mockGems = [
      { id: 1, grade: '온전한 스타프리즘', options: ['강뎀', '이뎀'] },
      { id: 2, grade: '온전한 스타프리즘', options: ['강뎀'] }
    ];
    const { gemStats } = calculateGemStats(mockGems);
    expect(gemStats.strongDmg).toBe(4.4); // 2.2 * 2 = 4.4
    expect(gemStats.moveDmg).toBe(2.2);   // 2.2 * 1 = 2.2
  });

  it('특수 보석 헬리오도르가 장착되었을 때 올스탯과 최종뎀증%가 적용되어야 함', () => {
    const mockGems = [
      { id: 1, grade: '순수한 헬리오도르', options: ['강뎀'] }
    ];
    const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats(mockGems);
    expect(extraAllStat).toBe(54);
    expect(extraFinalDmgPct).toBe(5.4);
    expect(gemStats.strongDmg).toBe(2.1); // 헬리오도르는 기본 세공 효율 2.1% 적용
  });
});
