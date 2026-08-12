import { describe, expect, it } from 'vitest';
import runes from '../data/runes.json';
import { calculateDPS } from './calculator';
import parseSkillMarkdown from './skillMdParser';
import skillMdText from '../../results/260710_패시브_액티브_스킬목록.md?raw';

const parsedSkills = parseSkillMarkdown(skillMdText);

const gemStats = {
  strongDmg: 48.4,
  strongCd: 4.5,
  moveDmg: 48.4,
  moveCd: 3.0,
  subDmg: 6.6,
  subCd: 2.3,
  summonDmg: 2.2,
  summonCd: 1.5,
  elementDmg: 2.2,
  elementCd: 0.8,
  doubleDmg: 2.2
};

const profiles = [
  {
    id: 'A',
    observedDps: 8265000,
    normalizedBaseAttack: 31197,
    observedAttack: 58566,
    critScore: 8604,
    extraProb: 2492,
    strongDmg: 3887,
    chainDmg: 3453,
    comboPower: 3245,
    skillPower: 2573,
    multiPower: 1574,
    fastAtk: 2874,
    fastSkill: 2108,
    ultScore: 1638,
    nightBlessingUptime: 24,
    runes: ['타오르는 영광', '고결함', '승천+', '강격+', '전진+', '공허', '흐릿한 형상', '아귀', '별바라기', '교차하는 사슬'],
    stances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' }
  },
  {
    id: 'B',
    observedDps: 10356000,
    normalizedBaseAttack: 29815,
    observedAttack: 56039,
    critScore: 8604,
    extraProb: 2492,
    strongDmg: 3737,
    chainDmg: 3453,
    comboPower: 3245,
    skillPower: 2017,
    multiPower: 1574,
    fastAtk: 2874,
    fastSkill: 2108,
    ultScore: 1638,
    nightBlessingUptime: 24,
    runes: ['타오르는 영광', '고결함', '승천+', '강격+', '전진+', '공허', '흐릿한 형상', '아귀', '별바라기', '교차하는 사슬'],
    stances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' }
  },
  {
    id: 'C',
    observedDps: 10144000,
    normalizedBaseAttack: 30426,
    observedAttack: 55547,
    critScore: 8635,
    extraProb: 2505,
    strongDmg: 3910,
    chainDmg: 4391,
    comboPower: 2466,
    skillPower: 2244,
    multiPower: 1604,
    fastAtk: 2095,
    fastSkill: 2933,
    ultScore: 1674,
    nightBlessingUptime: 23,
    runes: ['타오르는 영광', '위대함', '승천+', '열혈+', '전진+', '잊힌 맹약', '흐릿한 형상', '아귀', '별바라기', '승전'],
    stances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '열혈' }
  },
  {
    id: 'D',
    observedDps: 10793000,
    normalizedBaseAttack: 30373,
    observedAttack: 55547,
    critScore: 8635,
    extraProb: 2505,
    strongDmg: 3910,
    chainDmg: 4391,
    comboPower: 2466,
    skillPower: 2244,
    multiPower: 1604,
    fastAtk: 2095,
    fastSkill: 2933,
    ultScore: 1674,
    nightBlessingUptime: 25,
    runes: ['타오르는 영광', '위대함', '승천+', '열혈+', '전진+', '잊힌 맹약', '흐릿한 형상', '아귀', '별바라기', '승전'],
    stances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '열혈' }
  }
];

function resolveRunes(names) {
  return names.map((name) => {
    const rune = runes.find((item) => item.name === name);
    expect(rune, `룬 데이터 누락: ${name}`).toBeDefined();
    return { ...rune, transcendLevel: 0 };
  });
}

describe('함선 허수아비 외부 측정스펙 회귀', () => {
  it.each(profiles)('$id 프로필의 능력치·룬·세공을 손실 없이 반영한다', (profile) => {
    const result = calculateDPS(
      {
        ...profile,
        baseAttack: profile.normalizedBaseAttack,
        useNightTrace: true,
        useDeadlyImpact: true,
        useHitCombo: true,
        enchantAtkPct: 6.8,
        strongDmgPct: 0,
        chainDmgPct: 0,
        skillLevel_1: 10,
        skillLevel_2: 10,
        skillLevel_3: 10,
        skillLevel_4: 10,
        skillLevel_5: 10,
        skillLevel_6: 10
      },
      resolveRunes(profile.runes),
      {
        boss: '함선 허수아비',
        ordinaryTime: 100,
        unarmedTime: 0,
        ultimateTime: 0,
        gimmickDmgPct: 0,
        healerDmgPct: 0,
        skillDebuffDmgPct: 10,
        hasSpdBuff: false
      },
      { ordinary: '423512', ordinaryBreak: '423512', ultimate: '423512', ultimateBreak: '423512' },
      {},
      gemStats,
      profile.stances,
      {},
      parsedSkills
    );

    expect(Math.abs(result.totalAtk - profile.observedAttack)).toBeLessThanOrEqual(1);
    expect(result.weightedDps).toBeGreaterThan(0);
    expect(result.weightedDps).toBeLessThan(profile.observedDps);
    expect(result.critProb).toBeGreaterThan(40);
    expect(result.extraProb).toBeGreaterThan(19);
    expect(result.states.ordinary.cycleTime).toBeGreaterThan(0);
  });
});
