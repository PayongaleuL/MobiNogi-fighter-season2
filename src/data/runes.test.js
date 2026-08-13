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
  });
});
