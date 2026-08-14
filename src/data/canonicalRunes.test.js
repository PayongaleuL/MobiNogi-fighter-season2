import { describe, expect, it } from 'vitest';
import runesData from './runes.json';
import {
  canonicalRuneKey,
  canonicalRunesEqual,
  createCanonicalRunes,
  resolveCanonicalRune,
} from './canonicalRunes';

describe('canonical rune baseline', () => {
  it('creates all approved runes as an independent effect-model baseline', () => {
    const canonicalRunes = createCanonicalRunes();

    expect(canonicalRunes).toHaveLength(88);
    expect(canonicalRunes).not.toBe(runesData);
    expect(canonicalRunes[0]).not.toBe(runesData[0]);
    expect(canonicalRunes[0].stats).not.toBe(runesData[0].stats);
  });

  it('preserves reviewed Victory and Avidity calculations in the baseline', () => {
    const canonicalRunes = createCanonicalRunes();
    const victory = resolveCanonicalRune('승전', canonicalRunes);
    const avidity = resolveCanonicalRune('아귀', canonicalRunes);

    expect(victory.stats['치명타피해%']).toBe(0.1);
    expect(avidity.stats['공격력%']).toBe(0.15);
    expect(avidity.stats['무방비피해%']).toBe(0.12);
  });

  it('uses the current 그믐달 spelling as the canonical compatibility key', () => {
    expect(canonicalRuneKey('그믐달')).toBe('그믐달');
    expect(canonicalRuneKey('그음달')).toBe('그믐달');
  });

  it('compares current calculation input against canonical data rather than parser output', () => {
    const canonicalRune = resolveCanonicalRune('승전');

    expect(canonicalRunesEqual(canonicalRune, { ...canonicalRune, stats: { ...canonicalRune.stats } })).toBe(true);
    expect(canonicalRunesEqual(canonicalRune, {
      ...canonicalRune,
      stats: { ...canonicalRune.stats, '치명타피해%': 0.03 },
    })).toBe(false);
  });
});
