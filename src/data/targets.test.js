import { describe, expect, it } from 'vitest';
import { DEFAULT_TARGET_ID, getTargetDefinition, TARGET_DEFINITIONS } from './targets.js';

describe('season 2 target definitions', () => {
  it('excludes the unreleased legacy abyss hell 2 target', () => {
    expect(TARGET_DEFINITIONS.map((target) => target.id)).not.toContain('어비스 지옥2');
  });

  it('keeps the three current Lunda very-hard bosses with official pressure data', () => {
    const lundaTargets = TARGET_DEFINITIONS.filter((target) => target.content === '룬다 어비스');

    expect(lundaTargets.map((target) => target.label)).toEqual([
      '칼드레드 · 허상의 정박지 매우 어려움',
      '데스펠 · 광기의 동굴 매우 어려움',
      '테로사 · 흩어진 물길 매우 어려움',
    ]);
    expect(lundaTargets.every((target) => target.requiredMagicResistance === 2200)).toBe(true);
    expect(lundaTargets.every((target) => target.magicPressure === 2700)).toBe(true);
  });

  it('keeps Kabrak intro official magic values while leaving unidentifiable combat reductions unset', () => {
    expect(getTargetDefinition('카브락 · 입문')).toMatchObject({
      requiredMagicResistance: 2000,
      magicPressure: 2500,
      armor: null,
      critResistance: null,
      defenseStatus: 'P2-B 로그만으로 미확정',
    });
  });

  it('falls back to the stable ship-dummy target for removed or unknown legacy ids', () => {
    expect(getTargetDefinition('어비스 지옥2')?.id).toBe(DEFAULT_TARGET_ID);
  });
});
