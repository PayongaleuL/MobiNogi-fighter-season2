import { describe, expect, it } from 'vitest';
import { DEFAULT_TARGET_ID, getTargetDefinition, TARGET_DEFINITIONS } from './targets.js';

describe('season 2 target definitions', () => {
  it('excludes the unreleased legacy abyss hell 2 target', () => {
    expect(TARGET_DEFINITIONS.map((target) => target.id)).not.toContain('어비스 지옥2');
  });

  it('keeps the three Lunda very-hard bosses separate because the calibrated common-defense model failed', () => {
    const lundaTargets = TARGET_DEFINITIONS.filter((target) => target.content === '룬다 어비스');

    expect(lundaTargets.map((target) => target.label)).toEqual([
      '칼드레드 · 허상의 정박지 매우 어려움',
      '데스펠 · 광기의 동굴 매우 어려움',
      '테로사 · 흩어진 물길 매우 어려움',
    ]);
    expect(lundaTargets.every((target) => target.requiredMagicResistance === 2200)).toBe(true);
    expect(lundaTargets.every((target) => target.magicPressure === 2700)).toBe(true);
    expect(lundaTargets.map((target) => target.armor)).toEqual([8408, 17125, 18967]);
    expect(lundaTargets.every((target) => target.critResistance === 0)).toBe(true);
    expect(lundaTargets.every((target) => target.calibration?.confidence === 'low')).toBe(true);
  });

  it('keeps Kabrak intro official magic values and applies the separate log-calibrated defense proxy', () => {
    expect(getTargetDefinition('카브락 · 입문')).toMatchObject({
      requiredMagicResistance: 2000,
      magicPressure: 2500,
      armor: 7203,
      critResistance: 0,
      defenseStatus: 'P2-B 로그 기반 근사치 · 낮은 신뢰도',
      calibration: {
        source: 'P2-B 로그 기반 근사치',
        sampleCount: 3,
        armorRange: [7039, 9542],
        critResistanceRange: [0, 0],
        confidence: 'low',
      },
    });
  });

  it('falls back to the stable ship-dummy target for removed or unknown legacy ids', () => {
    expect(getTargetDefinition('어비스 지옥2')?.id).toBe(DEFAULT_TARGET_ID);
  });
});
