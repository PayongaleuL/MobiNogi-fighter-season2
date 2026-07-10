import { describe, it, expect } from 'vitest';
import { calculateSealStats } from './sealCalculator';

describe('sealCalculator 테스트', () => {
  it('인장이 없거나 비어있을 때 기본값들을 반환해야 함', () => {
    const stats = calculateSealStats({});
    expect(stats.sealBaseAtk).toBe(0);
    expect(stats.sealEmblemAtkPct).toBe(0.07);
    expect(stats.sealStr).toBe(0);
    expect(stats.sealAtkFromStats).toBe(0);
    expect(stats.sealCritFromStats).toBe(0);
  });

  it('붉은 달의 인장 장착 시 공격력 가산과 올스탯이 누적되어야 함', () => {
    const mockSeals = {
      weapon: { type: 'red_moon', redMoonStatValue: 60 },
      necklace: { type: 'red_moon', redMoonStatValue: 60 },
      emblem: { type: 'red_moon', redMoonStatValue: 60 }
    };
    const stats = calculateSealStats(mockSeals);
    // 무기(800) + 목걸이(400) = 1200
    expect(stats.sealBaseAtk).toBe(1200);
    expect(stats.sealEmblemAtkPct).toBe(0.12); // emblem red_moon 12%
    // 3부위 올스탯 60 = str 180, wil 180, luk 180
    expect(stats.sealStr).toBe(180);
    // sealAtkFromStats = (180 + 180) * 1.5 = 540
    expect(stats.sealAtkFromStats).toBe(540);
    expect(stats.sealCritFromStats).toBe(180);
  });
});
