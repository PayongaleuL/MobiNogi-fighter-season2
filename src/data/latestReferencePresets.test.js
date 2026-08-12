import { describe, expect, it } from 'vitest';
import { createLatestReferencePresets } from './latestReferencePresets';

describe('latest ship-dummy reference presets', () => {
  it('stores five measured builds with the spreadsheet village-attack input contract', () => {
    const presets = createLatestReferencePresets();

    expect(presets).toHaveLength(5);
    for (const preset of presets) {
      expect(preset.data.stats.baseAttack).toBe(60607);
      expect(preset.data.stats.enchantAtkPct).toBe(6.8);
      expect(preset.data.gimmicks).toMatchObject({ boss: '함선 허수아비', unarmedTime: 0 });
      expect(preset.data.seals.weapon).toMatchObject({ type: 'red_moon', baseAtkOverride: 800 });
    }
  });

  it('stores the actual prestige accessory runes and executable cycle separately from the 444 note', () => {
    const prestigePreset = createLatestReferencePresets()[2].data;

    expect(prestigePreset.selectedRunes.장신구.map((rune) => rune.name)).toEqual(['승천+', '전진+', '강격+']);
    expect(prestigePreset.skillStances).toMatchObject({ skill_2: '전진', skill_4: '승천', skill_5: '강격' });
    expect(prestigePreset.cycles.ordinary).toBe('1-1 3 4 2-2 2 3 5 (444) 2');
    expect(prestigePreset.cycles.ultimate).toBe('445 (반복)');
  });
});
