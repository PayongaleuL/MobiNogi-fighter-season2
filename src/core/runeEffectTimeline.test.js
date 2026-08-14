import { describe, expect, it } from 'vitest';
import {
  aggregateRuneEffectTimeline,
  calculateEffectDpsMultiplier,
  calculateEffectStats,
  calculateEffectTimeline,
} from './runeEffectTimeline';

describe('rune effect timeline', () => {
  it('calculates deterministic duration-to-cooldown uptime', () => {
    const result = calculateEffectTimeline({ durationSeconds: 10, cooldownSeconds: 20 });

    expect(result.uptime).toBe(0.5);
    expect(result.uptimeProvenance).toBe('duration-cooldown');
  });

  it('caps event-driven uptime by both trigger frequency and cooldown', () => {
    const result = calculateEffectTimeline(
      { durationSeconds: 10, cooldownSeconds: 20 },
      { triggerRatePerSecond: 0.02 },
    );

    expect(result.uptime).toBeCloseTo(0.2, 8);
    expect(result.uptimeProvenance).toBe('event-rate-cooldown');
  });

  it('uses a supplied effect input before automatic uptime rules', () => {
    const result = calculateEffectTimeline(
      { durationSeconds: 10, cooldownSeconds: 20 },
      { uptimePercent: 73 },
    );

    expect(result.uptime).toBe(0.73);
    expect(result.uptimeProvenance).toBe('explicit-input');
  });

  it('honors a reviewed forced default uptime before an internal effect interval', () => {
    const result = calculateEffectTimeline({
      durationSeconds: 15,
      intervalSeconds: 5,
      defaultUptime: 0.13,
      forceDefaultUptime: true,
    });

    expect(result.uptime).toBe(0.13);
    expect(result.uptimeProvenance).toBe('forced-declared-default');
  });

  it('derives individual-expiry stack expectation from actual event rate', () => {
    const result = calculateEffectTimeline({
      durationSeconds: 10,
      maxStacks: 30,
      stackGain: 1,
    }, { triggerRatePerSecond: 2 });

    expect(result.averageStacks).toBe(20);
    expect(result.stackMultiplier).toBe(20);
  });

  it('maps conditional attack to the dedicated conditional-attack channel', () => {
    const result = calculateEffectStats({
      stats: { '조건부공증%': 0.35 },
      durationSeconds: 15,
      cooldownSeconds: 30,
    });

    expect(result.stats['조건부공증%']).toBeCloseTo(0.175, 8);
  });

  it('adds uptime-weighted conditional attack exactly once to the DPS multiplier', () => {
    const multiplier = calculateEffectDpsMultiplier(
      { '조건부공증%': 0.175 },
      {
        totalAtkPct: 0.4,
        totalGivesDmg: 0,
        totalStrongDmg: 0,
        totalChainDmg: 0,
        totalSkillDmg: 0,
        totalComboDmg: 0,
        critProbability: 0,
        critDamage: 1.4,
      },
    );

    expect(multiplier).toBeCloseTo(1.125, 8);
  });

  it('calculates direct and dot damage events from trigger frequency', () => {
    const result = calculateEffectTimeline({
      directDamage: 1000,
      dotDamage: 200,
      dotTicks: 4,
    }, { triggerRatePerSecond: 0.5 });

    expect(result.directDamagePerSecond).toBe(500);
    expect(result.dotDamagePerSecond).toBe(400);
  });

  it('uses intervalSeconds when the master sentence says the effect occurs every N seconds', () => {
    const result = calculateEffectTimeline({ directDamage: 12413, intervalSeconds: 5 });

    expect(result.directDamagePerSecond).toBeCloseTo(2482.6, 8);
  });

  it('scales periodic damage inside an active window by its declared availability while retaining the damage tick interval', () => {
    const result = calculateEffectTimeline({
      durationSeconds: 10,
      cooldownSeconds: 20,
      damageIntervalSeconds: 1,
      damageScalesWithUptime: true,
      directDamage: 100,
    });

    expect(result.uptime).toBeCloseTo(0.5, 8);
    expect(result.directDamagePerSecond).toBeCloseTo(50, 8);
  });

  it('aggregates effects with per-stack stats and direct damage', () => {
    const result = aggregateRuneEffectTimeline([
      {
        id: 'stacked-attack',
        stats: { '조건부공증%': 0.01 },
        durationSeconds: 5,
        maxStacks: 5,
        perStack: true,
      },
      {
        id: 'pulse',
        directDamage: 1200,
        cooldownSeconds: 3,
      },
    ], {
      'stacked-attack': { triggerRatePerSecond: 1 },
      pulse: { triggerRatePerSecond: 1 },
    });

    expect(result.stats['조건부공증%']).toBeCloseTo(0.05, 8);
    expect(result.directDamagePerSecond).toBeCloseTo(400, 8);
    expect(result.effects).toHaveLength(2);
  });
});
