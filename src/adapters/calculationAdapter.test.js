import { describe, expect, it } from 'vitest';
import runesData from '../data/runes.json';
import { createLatestReferencePresets } from '../data/latestReferencePresets.js';
import { calculateDPS } from '../core/calculator.js';
import { calculateGemStats } from '../core/gemCalculator.js';
import parseSkillMarkdown from '../utils/skillMdParser.js';
import skillMdText from '../../results/260710_패시브_액티브_스킬목록.md?raw';
import { calculateDpsResult, flattenSelectedRunes } from './calculationAdapter.js';

const parsedSkills = parseSkillMarkdown(skillMdText);

describe('calculation application adapter', () => {
  it('resolves current rune data and keeps transcend levels at their selected slots', () => {
    const flattened = flattenSelectedRunes({
      selectedRunes: { '무기': [{ name: '타오르는 영광', stats: {} }] },
      customRunes: runesData,
      transcendLevels: { '무기': [2] },
    });

    expect(flattened).toHaveLength(1);
    expect(flattened[0]).toMatchObject({
      name: '타오르는 영광',
      transcendLevel: 2,
      stats: expect.objectContaining({ '공격력%': 0.235 }),
    });
  });

  it('assembles the same core calculation input without involving a React component', () => {
    const { data } = createLatestReferencePresets()[0];
    const adapterResult = calculateDpsResult({
      ...data,
      customRunes: runesData,
      transcendLevels: data.transcendLevels,
    });
    const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats(data.gems);
    const directResult = calculateDPS(
      { ...data.stats, extraAllStat, extraFinalDmgPct },
      flattenSelectedRunes({
        selectedRunes: data.selectedRunes,
        customRunes: runesData,
        transcendLevels: data.transcendLevels,
      }),
      data.gimmicks,
      data.cycles,
      data.conditionalUptimes,
      gemStats,
      data.skillStances,
      data.seals,
      parsedSkills,
    );

    expect(adapterResult).toEqual(directResult);
    expect(adapterResult).toMatchObject({ status: 'ok', totalAtk: 108947 });
  });
});
