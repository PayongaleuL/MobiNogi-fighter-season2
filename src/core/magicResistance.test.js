import { describe, expect, it } from 'vitest';
import {
  calculateMagicResistanceEffect,
  getMagicResistanceExcessFinalDamagePct,
  MAX_MAGIC_RESISTANCE_FINAL_DAMAGE_PCT,
} from './magicResistance.js';

describe('getMagicResistanceExcessFinalDamagePct', () => {
  it.each([
    [0, 0],
    [500, 4.1],
    [1000, 7.9],
    [2000, 14.6],
    [4000, 25],
    [8000, 37.5],
  ])('returns the official example value at %i excess resistance', (excess, expectedPct) => {
    expect(getMagicResistanceExcessFinalDamagePct(excess)).toBe(expectedPct);
  });

  it('linearly interpolates only between adjacent official example points', () => {
    expect(getMagicResistanceExcessFinalDamagePct(750)).toBeCloseTo(6, 8);
    expect(getMagicResistanceExcessFinalDamagePct(3000)).toBeCloseTo(19.8, 8);
  });

  it('does not invent the unpublished curve beyond the last official example point', () => {
    expect(getMagicResistanceExcessFinalDamagePct(8001)).toBe(37.5);
    expect(getMagicResistanceExcessFinalDamagePct(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('calculateMagicResistanceEffect', () => {
  it('applies final damage only for resistance above pressure', () => {
    const result = calculateMagicResistanceEffect(4500, 2500);

    expect(result).toMatchObject({
      magicResistance: 4500,
      magicPressure: 2500,
      difference: 2000,
      excess: 2000,
      isBelowPressure: false,
      excessFinalDamagePct: 14.6,
      finalDamageMultiplier: 1.146,
      belowPressurePenaltyApplied: false,
      maxFinalDamagePct: MAX_MAGIC_RESISTANCE_FINAL_DAMAGE_PCT,
    });
  });

  it('reports below-pressure status without inventing an unpublished DPS penalty', () => {
    const result = calculateMagicResistanceEffect(2000, 2500);

    expect(result).toMatchObject({
      difference: -500,
      excess: 0,
      isBelowPressure: true,
      excessFinalDamagePct: 0,
      finalDamageMultiplier: 1,
      belowPressurePenaltyApplied: false,
    });
  });

  it('normalizes malformed values to zero', () => {
    expect(calculateMagicResistanceEffect('not-a-number', -10)).toMatchObject({
      magicResistance: 0,
      magicPressure: 0,
      difference: 0,
      finalDamageMultiplier: 1,
    });
  });
});
