import runesData from './runes.json' with { type: 'json' };

const getRune = (name) => {
  const rune = runesData.find((item) => item.name === name);
  if (!rune) throw new Error(`Reference rune not found: ${name}`);
  return { ...rune, stats: { ...rune.stats } };
};

const createReferenceStats = () => ({
  // 사용자가 제공한 시즌1 종합 계산기 기준 마을 공격력과 최신 측정스펙의 세부 능력치
  baseAttack: 60607,
  critScore: 8688,
  strongDmg: 3980,
  chainDmg: 3644,
  comboPower: 2480,
  skillPower: 2650,
  multiPower: 2419,
  extraProb: 2520,
  fastAtk: 2109,
  fastSkill: 2158,
  ultScore: 1682,
  enchantAtkPct: 6.8,
  critBonusPct: 0,
  strongDmgPct: 0,
  chainDmgPct: 0,
  skillLevel_1: 10,
  skillLevel_2: 10,
  skillLevel_3: 10,
  skillLevel_4: 30,
  skillLevel_5: 30,
  skillLevel_6: 30,
  useNightTrace: true,
  useDeadlyImpact: true,
  useHitCombo: true,
  nightBlessingUptime: 25
});

const createReferenceRunes = (accessoryRunes = ['승천+', '열혈+', '약점+']) => ({
  '무기': [getRune('타오르는 영광')],
  '방어구': [
    getRune('잊힌 맹약'),
    getRune('흐릿한 형상'),
    getRune('아귀'),
    getRune('별바라기'),
    getRune('승전')
  ],
  '장신구': accessoryRunes.map(getRune),
  '엠블럼': [getRune('위대함')]
});

const createReferenceTranscendLevels = () => ({
  '무기': [0],
  '방어구': [1, 1, 1, 0, 0],
  '장신구': [0, 0, 0],
  '엠블럼': [0]
});

const createReferenceGems = () => {
  const options = [
    ['이뎀', '강뎀', '강쿨'], ['이뎀', '강뎀', '강쿨'], ['이뎀', '강뎀', '강쿨'],
    ['이뎀', '강뎀', '강쿨'], ['이뎀', '강뎀', '강쿨'], ['이뎀', '강뎀', '강쿨'],
    ['이뎀', '이쿨', '강뎀'],
    ['이뎀', '이쿨', '강뎀'], ['이뎀', '이쿨', '강뎀'], ['이뎀', '이쿨', '강뎀'],
    ['이뎀', '강뎀', '보뎀'], ['이뎀', '강뎀', '보뎀'], ['이뎀', '강뎀', '보뎀'],
    ['이뎀', '보쿨', '강뎀'], ['이뎀', '보쿨', '강뎀'], ['이뎀', '보쿨', '강뎀'],
    ['이뎀', '원소뎀', '강뎀'], ['이뎀', '강뎀', '원소쿨'], ['이뎀', '강뎀', '소환쿨'],
    ['이뎀', '강뎀', '소환쿨'], ['이뎀', '소환뎀', '강뎀'], ['이뎀', '연타뎀', '강뎀']
  ];

  return options.map((gemOptions, index) => ({
    id: index + 1,
    grade: '온전한 스타프리즘',
    options: gemOptions
  }));
};

const createReferenceSeals = () => ({
  weapon: { type: 'red_moon', baseAtkOverride: 800, redMoonStatValue: 60 },
  necklace: { type: 'red_moon', baseAtkOverride: 400, redMoonStatValue: 45 },
  ring1: { type: 'red_moon', baseAtkOverride: 400, redMoonStatValue: 45 },
  ring2: { type: 'blue_moon', blueStat1Type: 'dex', blueStat1Value: 30, blueStat2Type: 'luk', blueStat2Value: 30 },
  emblem: { type: 'red_moon', redMoonStatValue: 50 },
  hat: { type: 'red_moon', redMoonStatValue: 45 },
  top: { type: 'red_moon', redMoonStatValue: 40 },
  bottom: { type: 'red_moon', redMoonStatValue: 40 },
  gloves: { type: 'red_moon', redMoonStatValue: 45 },
  shoes: { type: 'red_moon', redMoonStatValue: 5 }
});

const createReferenceData = ({ cycle, label, sourceUrl, observedDps, skillStances, accessoryRunes }) => ({
  stats: createReferenceStats(),
  selectedRunes: createReferenceRunes(accessoryRunes),
  transcendLevels: createReferenceTranscendLevels(),
  gems: createReferenceGems(),
  skillStances,
  cycles: cycle,
  conditionalUptimes: {
    '흐릿한 형상': 70,
    '타오르는 영광': 13
  },
  gimmicks: {
    boss: '함선 허수아비',
    ordinaryTime: 87,
    unarmedTime: 0,
    ultimateTime: 32,
    gimmickDmgPct: 0,
    healerDmgPct: 0,
    skillDebuffDmgPct: 10,
    hasSpdBuff: false
  },
  seals: createReferenceSeals(),
  reference: { label, sourceUrl, observedDps }
});

export const createLatestReferencePresets = () => [
  {
    name: '예시 1 · 함선허수 약승열 풀오토 (991.7만)',
    data: createReferenceData({
      label: '함선허수1 약승열 풀오토',
      sourceUrl: 'https://mobi-score.com/r/2rA4Ozk3cs5UQPtK',
      observedDps: 9916757,
      skillStances: { skill_1: '약점', skill_2: '순정', skill_3: '순정', skill_4: '승천', skill_5: '열혈' },
      cycle: { ordinary: '1 3 4 2 3 5 2', ordinaryBreak: '1 3 4 2 3 5 2', ultimate: '445', ultimateBreak: '445' }
    })
  },
  {
    name: '예시 2 · 함선허수 약승열 풀오토 (946.2만)',
    data: createReferenceData({
      label: '함선허수2 약승열 풀오토',
      sourceUrl: 'https://mobi-score.com/r/a45ep94tqYHtjSVZ',
      observedDps: 9462052,
      skillStances: { skill_1: '약점', skill_2: '순정', skill_3: '순정', skill_4: '승천', skill_5: '열혈' },
      cycle: { ordinary: '1 3 4 2 3 5 2', ordinaryBreak: '1 3 4 2 3 5 2', ultimate: '445', ultimateBreak: '445' }
    })
  },
  {
    name: '예시 3 · 함선허수 전승강 (1059.4만)',
    data: createReferenceData({
      label: '함선허수3 전승강',
      sourceUrl: 'https://mobi-score.com/r/08aQG7NnfNXVpTVj',
      observedDps: 10593957,
      skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
      accessoryRunes: ['승천+', '전진+', '강격+'],
      cycle: { ordinary: '1-1 3 4 2-2 2 3 5 (444) 2', ordinaryBreak: '1-1 3 4 2-2 2 3 5 (444) 2', ultimate: '445 (반복)', ultimateBreak: '445 (반복)' }
    })
  },
  {
    name: '예시 4 · 함선허수 전승강 (1117.8만)',
    data: createReferenceData({
      label: '함선허수4 전승강',
      sourceUrl: 'https://mobi-score.com/r/bA903LtPSxYhtcst',
      observedDps: 11177554,
      skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
      accessoryRunes: ['승천+', '전진+', '강격+'],
      cycle: { ordinary: '1-1 3 4 2-2 2 3 5 (444) 2', ordinaryBreak: '1-1 3 4 2-2 2 3 5 (444) 2', ultimate: '445 (반복)', ultimateBreak: '445 (반복)' }
    })
  },
  {
    name: '예시 5 · 함선허수 전승강 (1083.5만)',
    data: createReferenceData({
      label: '함선허수5 전승강',
      sourceUrl: 'https://mobi-score.com/r/4GlO5T5ex5GeNlOf',
      observedDps: 10835203,
      skillStances: { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
      accessoryRunes: ['승천+', '전진+', '강격+'],
      cycle: { ordinary: '1-1 3 4 2-2 2 3 5 (444) 2', ordinaryBreak: '1-1 3 4 2-2 2 3 5 (444) 2', ultimate: '445 (반복)', ultimateBreak: '445 (반복)' }
    })
  }
];
