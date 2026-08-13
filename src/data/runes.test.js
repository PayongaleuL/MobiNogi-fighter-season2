import { describe, expect, it } from "vitest";
import runes from "./runes.json";
import { calculateDPS } from "../utils/calculator";

const baseStats = {
  baseAttack: 60607, critScore: 7000, strongDmg: 3000, chainDmg: 3200, comboPower: 1800,
  skillPower: 1900, multiPower: 1200, extraProb: 1100, fastAtk: 1500, fastSkill: 1600,
  enchantAtkPct: 0, useNightTrace: false, useDeadlyImpact: false, useHitCombo: false
};

describe("season2 rune data contract", () => {
  it("contains 88 unique reviewed season2 runes with numeric stats and descriptions", () => {
    expect(runes).toHaveLength(88);
    expect(new Set(runes.map((rune) => rune.name)).size).toBe(88);
    for (const rune of runes) {
      expect(rune.description.length).toBeGreaterThan(0);
      expect(typeof rune.stats["가동률"]).toBe("number");
      for (const value of Object.values(rune.stats)) expect(typeof value).toBe("number");
    }
  });

  it("computes finite DPS for every reviewed rune without dropping a stat schema", () => {
    for (const rune of runes) {
      const result = calculateDPS(baseStats, [rune], { boss: "함선 허수아비" }, {}, {}, {}, {}, {});
      expect(Number.isFinite(result.weightedDps)).toBe(true);
      expect(Number.isFinite(result.totalAtk)).toBe(true);
    }
  });

  it("keeps fixed uptime contracts and the burning glory stack attack model", () => {
    const blurredForm = runes.find((rune) => rune.name === "흐릿한 형상");
    const burningGlory = runes.find((rune) => rune.name === "타오르는 영광");
    expect(blurredForm.stats["가동률"]).toBeCloseTo(0.7, 10);
    expect(burningGlory.stats["가동률"]).toBeCloseTo(0.13, 10);
    expect(burningGlory.conditionalEffects[0].stats["조건부공증%"]).toBeCloseTo(0.42, 10);
    expect(burningGlory.conditionalEffects[0].uptimeStep).toBe(1);
  });
});

describe('condition label data contract', () => {
  it('does not retain an isolated 시 condition token and assigns every modeled effect a label', () => {
    for (const rune of runes) {
      expect(rune.raw_text).not.toContain('시');
      for (const text of [...(rune.cleaned_text || []), rune.description]) {
        expect(text).not.toMatch(/^\s*~?시\s/);
      }
      for (const effect of rune.conditionalEffects || []) {
        expect(effect.id).toMatch(/\S/);
        expect(effect.label).toMatch(/\S/);
        expect(effect.label).not.toMatch(/^\s*(~?시|조건부|효과)\s*$/);
        expect(effect.source).not.toMatch(/^\s*~?시\s/);
        if (effect.uptimeStep !== undefined) {
          expect(Number.isInteger(effect.uptimeStep)).toBe(true);
          expect(effect.uptimeStep).toBeGreaterThan(0);
        }
      }
    }
  });

  it('models 광채+ as a named elemental-status conditional effect', () => {
    const glow = runes.find((rune) => rune.name === '광채+');
    expect(glow.description).not.toMatch(/^시/);
    expect(glow.stats['주는피해%']).toBe(0);
    expect(glow.stats['치명타피해%']).toBe(0);
    expect(glow.conditionalEffects).toEqual([expect.objectContaining({
      id: 'elemental-status-target',
      label: '원소 지속 피해 대상',
      defaultUptime: 0.7,
      stats: { '주는피해%': 0.2, '치명타피해%': 0.15 }
    })]);
  });
});

describe('광채+ conditional DPS migration', () => {
  it('preserves the legacy 70% weighted DPS at its default elemental-status uptime', () => {
    const glow = runes.find((rune) => rune.name === '광채+');
    const legacyGlow = {
      ...glow,
      conditionalEffects: [],
      stats: { ...glow.stats, '주는피해%': 0.2, '치명타피해%': 0.15, '가동률': 0.7 }
    };
    const activeGimmicks = { boss: '함선 허수아비' };
    const current = calculateDPS(baseStats, [glow], activeGimmicks, '', {}, {}, {}, {});
    const legacy = calculateDPS(baseStats, [legacyGlow], activeGimmicks, '', {}, {}, {}, {});
    expect(current.weightedDps).toBeCloseTo(legacy.weightedDps, 10);
  });
});
