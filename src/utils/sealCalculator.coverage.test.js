import { describe, expect, it } from 'vitest';
import { calculateSealStats } from './sealCalculator';

describe('calculateSealStats coverage regression suite', () => {
  it('handles no seals, none seals, and each non-attack equipment slot', () => {
    expect(calculateSealStats()).toMatchObject({ sealBaseAtk: 0, sealEmblemAtkPct: 0.07, sealStr: 0, sealWil: 0, sealLuk: 0 });

    const stats = calculateSealStats({
      weapon: { type: 'none' },
      ring1: { type: 'blue_moon', blueStat1Type: 'str', blueStat1Value: 10, blueStat2Type: 'luk', blueStat2Value: 11 },
      ring2: { type: 'blue_moon', blueStat1Type: 'other', blueStat2Type: 'wil', blueStat2Value: 12 },
      hat: { type: 'red_moon', redMoonStatValue: 13 },
      top: { type: 'red_moon', redMoonStatValue: 14 },
      bottom: { type: 'red_moon', redMoonStatValue: 15 },
      gloves: { type: 'red_moon', redMoonStatValue: 16 },
      shoes: { type: 'red_moon', redMoonStatValue: 17 }
    });

    expect(stats).toMatchObject({
      sealBaseAtk: 0,
      sealEmblemAtkPct: 0.07,
      sealStr: 85,
      sealWil: 87,
      sealLuk: 86,
      sealAtkFromStats: 258,
      sealCritFromStats: 86
    });
  });

  it.each([
    [{ weapon: { type: 'star' } }, 300, 0.07],
    [{ weapon: { type: 'blue_moon', blueStat1Type: 'str', blueStat1Value: 27, blueStat2Type: 'wil', blueStat2Value: 27 } }, 500, 0.07],
    [{ weapon: { type: 'red_moon' } }, 800, 0.07],
    [{ necklace: { type: 'star' } }, 150, 0.07],
    [{ necklace: { type: 'blue_moon', blueStat1Type: 'str', blueStat2Type: 'luk' } }, 250, 0.07],
    [{ necklace: { type: 'red_moon' } }, 400, 0.07],
    [{ emblem: { type: 'star' } }, 0, 0.1],
    [{ emblem: { type: 'blue_moon', blueStat1Type: 'str', blueStat2Type: 'wil' } }, 0, 0.11],
    [{ emblem: { type: 'red_moon' } }, 0, 0.12]
  ])('applies slot enhancement for %o', (seals, baseAttack, emblemPct) => {
    const stats = calculateSealStats(seals);
    expect(stats.sealBaseAtk).toBe(baseAttack);
    expect(stats.sealEmblemAtkPct).toBe(emblemPct);
  });
});
