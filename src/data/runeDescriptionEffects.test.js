import { describe, expect, it } from 'vitest';
import runes from './runes.json';
import { deriveRuneDescriptionEffects, mergeRuneDescriptionEffects } from './runeDescriptionEffects.js';

const getRune = (name) => runes.find((rune) => rune.name === name);

describe('master rune description effects', () => {
  it('derives a traceable effect record for every conditional source line', () => {
    const effects = runes.flatMap((rune) => deriveRuneDescriptionEffects(rune));
    const sourceIds = effects.map((effect) => effect.id);

    expect(effects.length).toBeGreaterThan(60);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    expect(effects.every((effect) => effect.source && effect.resultKind)).toBe(true);
  });

  it('extracts Pride armor-break duration, cooldown, and target damage', () => {
    const effects = deriveRuneDescriptionEffects(getRune('긍지'));
    const armorBreak = effects.find((effect) => effect.source.includes('방어구 파괴'));

    expect(armorBreak).toMatchObject({
      durationSeconds: 10,
      cooldownSeconds: 1,
      defaultUptime: 1,
      triggerScope: 'attackArmorBreak',
    });
  });

  it('extracts Avidity direct and dot damage from the master sentence', () => {
    const effects = deriveRuneDescriptionEffects(getRune('아귀'));
    const directDamage = effects.find((effect) => effect.directDamage);

    expect(directDamage).toMatchObject({
      directDamage: 12413,
      dotDamage: 31328,
      intervalSeconds: 5,
      resultKind: 'directDamageEvent',
    });
  });

  it('keeps explicit reviewed models ahead of source-derived duplicates', () => {
    const explicit = [{ id: 'reviewed', source: 'same source', stats: { '주는피해%': 0.1 } }];
    const merged = mergeRuneDescriptionEffects({ name: '검증', cleaned_text: ['same source'] }, explicit);

    expect(merged).toEqual(explicit);
  });
});
