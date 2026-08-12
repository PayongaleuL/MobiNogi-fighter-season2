import fs from 'node:fs';
import runes from '../src/data/runes.json' with { type: 'json' };
import { calculateDPS } from '../src/utils/calculator.js';
import parseSkillMarkdown from '../src/utils/skillMdParser.js';

const parsedSkills = parseSkillMarkdown(
  fs.readFileSync(new URL('../results/260710_패시브_액티브_스킬목록.md', import.meta.url), 'utf8')
);

const commonGemStats = {
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

const cases = [
  {
    id: 'A', referenceDps: 8265000, duration: 124, nightBlessingUptime: 24,
    baseAttack: 58566, critScore: 8604, extraProb: 2492, strongDmg: 3887, chainDmg: 3453,
    comboPower: 3245, skillPower: 2573, fastAtk: 2874, fastSkill: 2108, multiPower: 1574, ultScore: 1638,
    runeNames: ['타오르는 영광', '고결함', '승천+', '강격+', '전진+', '공허', '흐릿한 형상', '아귀', '별바라기', '교차하는 사슬'],
    skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' }
  },
  {
    id: 'B', referenceDps: 10356000, duration: 126, nightBlessingUptime: 24,
    baseAttack: 56039, critScore: 8604, extraProb: 2492, strongDmg: 3737, chainDmg: 3453,
    comboPower: 3245, skillPower: 2017, fastAtk: 2874, fastSkill: 2108, multiPower: 1574, ultScore: 1638,
    runeNames: ['타오르는 영광', '고결함', '승천+', '강격+', '전진+', '공허', '흐릿한 형상', '아귀', '별바라기', '교차하는 사슬'],
    skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' }
  },
  {
    id: 'C', referenceDps: 10144000, duration: 128, nightBlessingUptime: 23,
    baseAttack: 55547, critScore: 8635, extraProb: 2505, strongDmg: 3910, chainDmg: 4391,
    comboPower: 2466, skillPower: 2244, fastAtk: 2095, fastSkill: 2933, multiPower: 1604, ultScore: 1674,
    runeNames: ['타오르는 영광', '위대함', '승천+', '열혈+', '전진+', '잊힌 맹약', '흐릿한 형상', '아귀', '별바라기', '승전'],
    skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '열혈' }
  },
  {
    id: 'D', referenceDps: 10793000, duration: 119, nightBlessingUptime: 25,
    baseAttack: 55547, critScore: 8635, extraProb: 2505, strongDmg: 3910, chainDmg: 4391,
    comboPower: 2466, skillPower: 2244, fastAtk: 2095, fastSkill: 2933, multiPower: 1604, ultScore: 1674,
    runeNames: ['타오르는 영광', '위대함', '승천+', '열혈+', '전진+', '잊힌 맹약', '흐릿한 형상', '아귀', '별바라기', '승전'],
    skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '열혈' }
  }
];

function buildRunes(names, transcendLevel) {
  return names.map((name) => {
    const rune = runes.find((item) => item.name === name);
    if (!rune) throw new Error(`룬을 찾지 못했습니다: ${name}`);
    return { ...rune, transcendLevel };
  });
}

function runCase(reference, transcendLevel, baseAttack = reference.baseAttack, applyRunes = true) {
  const cycle = '423512';
  const result = calculateDPS(
    {
      ...reference,
      baseAttack,
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
    applyRunes ? buildRunes(reference.runeNames, transcendLevel) : [],
    {
      boss: '함선 허수아비',
      ordinaryTime: reference.duration,
      unarmedTime: 0,
      ultimateTime: 0,
      gimmickDmgPct: 0,
      healerDmgPct: 0,
      skillDebuffDmgPct: 10,
      hasSpdBuff: false
    },
    { ordinary: cycle, ordinaryBreak: cycle, ultimate: cycle, ultimateBreak: cycle },
    {},
    commonGemStats,
    reference.skillStances,
    {},
    parsedSkills
  );

  return {
    id: reference.id,
    referenceDps: reference.referenceDps,
    modeledDps: result.weightedDps,
    variancePct: Number((((result.weightedDps - reference.referenceDps) / reference.referenceDps) * 100).toFixed(1)),
    appliedAttack: result.totalAtk,
    referenceAttack: reference.baseAttack,
    critPct: result.critProb,
    extraPct: result.extraProb,
    cycleSeconds: result.states.ordinary.cycleTime
  };
}

function normalizeBaseAttack(reference, transcendLevel) {
  let low = 0;
  let high = reference.baseAttack;
  for (let index = 0; index < 32; index += 1) {
    const mid = (low + high) / 2;
    if (runCase(reference, transcendLevel, mid).appliedAttack > reference.baseAttack) high = mid;
    else low = mid;
  }
  return Math.round((low + high) / 2);
}

const normalizedNoTranscend = cases.map((reference) => {
  const normalizedBaseAttack = normalizeBaseAttack(reference, 0);
  return { ...runCase(reference, 0, normalizedBaseAttack), normalizedBaseAttack };
});

const comparison = {
  assumptions: {
    target: '함선 허수아비',
    cycle: '423512',
    externalStatMapping: '공격력 및 능력치 수치를 그대로 입력하고, 외부 기록의 룬·세공·스탠스를 계산기에 별도로 적용',
    missingData: ['달의 인장 세부 설정', '스킬 개조 단계', '룬 초월 단계', '전투 중 버프별 정확한 계수와 가동률', '실제 행동 순서']
  },
  noTranscend: cases.map((reference) => runCase(reference, 0)),
  normalizedNoTranscend,
  finalAttackWithoutRunes: cases.map((reference) => runCase(reference, 0, reference.baseAttack, false)),
  allLevel2Transcend: cases.map((reference) => runCase(reference, 2))
};

console.log(JSON.stringify(comparison, null, 2));
