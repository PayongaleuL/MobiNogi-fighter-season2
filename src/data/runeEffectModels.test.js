import { describe, expect, it } from 'vitest';
import { applyRuneEffectModels, runeEffectModels } from './runeEffectModels.js';

describe('rune effect models v2', () => {
  it('applies the reviewed models only to their canonical rune names', () => {
    const reviewedNames = [
      '오랜 광기', '억눌린 충동', '거대한 분노', '바위 칼날', '두 갈래 별',
      '추적자', '암운+', '부패+', '폭염+', '광채+', '타오르는 영광', '긍지', '공세+', '등대지기',
      '첫 번째 서약', '흐릿한 형상', '잿빛 장막', '금 간 봉인', '무너진 경계', '아귀', '정복자+', '은빛 찬가', '승전',
      '거두는 손길', '맹세+', '복수+', '부서진 왕관',
      '별바라기', '황동 날개', '잠들지 않는 불', '번개 숨결', '돌 심장', '용암 비늘', '얼음 발톱',
      '악몽', '[신화] 유폐된 어둠', '[신화] 무형',
      '고결함', '해방', '위대함', '침묵',
      '[신화] 용 사냥꾼', '[신화] 여신', '[신화] 사슬로 묶은 법전', '[신화] 가라앉은 왕국',
      '수호자', '서광', '끓는 피', '숲 길잡이',
      '바다뱀+', '계승자', '잠든 땅', '비늘 덮인 현자',
      '영원한 밤', '빛바랜 별', '초월'
    ];
    expect(Object.keys(runeEffectModels)).toEqual(reviewedNames);

    const input = [
      ...reviewedNames.map((name) => ({ name, stats: { '가동률': 0.3 } })),
      { name: '그믐달', stats: { '공격력%': 0.1, '가동률': 0.7 } }
    ];
    const applied = applyRuneEffectModels(input);

    expect(applied.slice(0, reviewedNames.length).every((rune) => rune.effectModelVersion === 2)).toBe(true);
    expect(applied.at(-1)).toEqual(input.at(-1));
  });

  it('keeps permanent victory stats and marks non-event-modeled effects as excluded', () => {
    const [victory, rockBlade, tracker, maw] = applyRuneEffectModels([
      { name: '승전', stats: { '치명타피해%': 0.03, '가동률': 0.3 } },
      { name: '바위 칼날', stats: { '공격력%': 0.16, '가동률': 0.7 } },
      { name: '추적자', stats: { '강타피해%': 0.35, '가동률': 0.4 } },
      { name: '아귀', stats: { '주는피해%': 0.12, '콤보피해%': 0.12 } }
    ]);

    expect(victory.stats['주는피해%']).toBe(0.05);
    expect(victory.stats['치명타피해%']).toBe(0.1);
    expect(victory.conditionalEffects[0]).toMatchObject({
      id: 'nearby-kill-crit-damage',
      defaultUptime: 0,
      modelStatus: 'manual'
    });
    expect(rockBlade.conditionalEffects[0]).toMatchObject({
      modelStatus: 'modeled',
      dynamicByCycle: true,
      triggerScope: 'hitStack',
      durationSeconds: 10,
      maxStacks: 30,
      perStack: true,
      stats: { '조건부공증%': 0.007, '치명타확률%': 0.005 },
    });
    expect(tracker.conditionalEffects[0]).toMatchObject({ modelStatus: 'modeled', includedInDps: true, directDamage: 66395 });
    expect(maw.stats).toMatchObject({ '공격력%': 0.15, '주는피해%': 0, '콤보피해%': 0, '무방비피해%': 0.12 });
    expect(maw.conditionalEffects[0]).toMatchObject({ modelStatus: 'modeled', includedInDps: true, directDamage: 12413, dotDamage: 31328 });
  });

  it('models the erosion build-up and pollution mechanics at the fixed 70% reference availability', () => {
    const [erosion, crackedSeal] = applyRuneEffectModels([
      { name: '흐릿한 형상', stats: {} },
      { name: '금 간 봉인', stats: {} },
    ]);

    expect(erosion.conditionalEffects[0]).toMatchObject({
      durationSeconds: 60,
      cooldownSeconds: 75,
      defaultUptime: 0.7,
      stats: { '강타피해%': 0.18 },
    });
    expect(crackedSeal.conditionalEffects[0].stats['치명타확률%'] * 0.7).toBeCloseTo(0.1155, 8);
  });

  it('keeps kill, low-health, damage-taken, and magic-circle effects as explicit manual DPS inputs', () => {
    const [reapingTouch, oath, vengeance, crown] = applyRuneEffectModels([
      { name: '거두는 손길', stats: { '주는피해%': 0.26 } },
      { name: '맹세+', stats: { '주는피해%': 0.03 } },
      { name: '복수+', stats: { '공격력%': 0.05 } },
      { name: '부서진 왕관', stats: { '공격력%': 0.04, '강타피해%': 0.045 } },
    ]);

    expect(reapingTouch.stats['주는피해%']).toBe(0);
    expect(oath).toMatchObject({ stats: { '공격력%': 0.10, '주는피해%': 0 } });
    expect(vengeance.conditionalEffects[0]).toMatchObject({
      stats: { '조건부공증%': 0.25 },
      durationSeconds: 12,
      maxStacks: 5,
      forceDefaultUptime: true,
      defaultUptime: 0,
    });
    expect(crown).toMatchObject({ stats: { '공격력%': 0, '강타피해%': 0 } });
    expect(crown.conditionalEffects[0].stats).toEqual({ '조건부공증%': 0.12, '강타피해%': 0.135 });
  });

  it('separates the dragon-mark permanent give-damage bonus from its active effects', () => {
    const [stargazer, brassWings, lavaScale] = applyRuneEffectModels([
      { name: '별바라기', stats: { '공격력%': 0.14, '주는피해%': 0.10 } },
      { name: '황동 날개', stats: { '주는피해%': 0.10 } },
      { name: '용암 비늘', stats: { '주는피해%': 0.10 } },
    ]);

    expect(stargazer).toMatchObject({ stats: { '공격력%': 0.14, '주는피해%': 0.10 } });
    expect(stargazer.conditionalEffects[0]).toMatchObject({
      durationSeconds: 10,
      cooldownSeconds: 20,
      stats: { '조건부공증%': 0.14 },
      replacesBaseStats: { '공격력%': 0.14 },
      defaultUptime: 1,
      forceDefaultUptime: true,
      triggerScope: 'dragonMarkAttack',
    });
    expect(brassWings.conditionalEffects[0].triggerScope).toBe('dragonMarkUltimate');
    expect(lavaScale.conditionalEffects[0]).toMatchObject({
      directDamage: 5911,
      damageIntervalSeconds: 1,
      damageScalesWithUptime: true,
    });
  });

  it('models nightmare and mythic rune direct damage, armor break, and exclusive equipment effects', () => {
    const [nightmare, imprisonedDarkness, formless] = applyRuneEffectModels([
      { name: '악몽', stats: {} },
      { name: '[신화] 유폐된 어둠', stats: {} },
      { name: '[신화] 무형', stats: {} },
    ]);

    expect(nightmare.conditionalEffects[0]).toMatchObject({
      dotDamage: 8275,
      dotTicks: 6,
      intervalSeconds: 4,
      defaultUptime: 1,
    });
    expect(imprisonedDarkness.conditionalEffects[0]).toMatchObject({
      directDamage: 12413,
      intervalSeconds: 3,
      stats: { '대상받는피해%': 0.10 },
    });
    expect(formless).toMatchObject({ stats: { '공격력%': 0.29 } });
    expect(formless.conditionalEffects).toHaveLength(3);
    expect(formless.conditionalEffects.every((effect) => effect.replacesBaseStats['공격력%'] === 0.29)).toBe(true);
  });

  it('maps night-blessing damage and hit effects without shrinking their permanent stats', () => {
    const [nobility, liberation, greatness, silence] = applyRuneEffectModels([
      { name: '고결함', stats: { '주는피해%': 0.48 } },
      { name: '해방', stats: { '연타피해%': 0.25 } },
      { name: '위대함', stats: { '강타피해%': 0.25 } },
      { name: '침묵', stats: { '주는피해%': 0.33 } },
    ]);

    expect(nobility).toMatchObject({ stats: { '스킬속도%': 0.15, '재사용회복%': 0.10, '주는피해%': 0 } });
    expect(nobility.conditionalEffects[0].stats).toEqual({ '밤축_주는피해%': 0.48 });
    expect(liberation.conditionalEffects[1]).toMatchObject({ directDamage: 13004, cooldownSeconds: 1, triggerScope: 'nightBlessingHit' });
    expect(greatness.conditionalEffects[1]).toMatchObject({ directDamage: 10048, cooldownSeconds: 1, triggerScope: 'nightBlessingHit' });
    expect(silence.conditionalEffects[0]).toMatchObject({ directDamage: 229941, damageScalesWithUptime: true, defaultUptime: 0 });
  });

  it('models guardian, dawn, boiling blood, and forest guide conditions without treating restricted bonuses as permanent', () => {
    const [guardian, dawn, boilingBlood, forestGuide] = applyRuneEffectModels([
      { name: '수호자', stats: {} },
      { name: '서광', stats: {} },
      { name: '끓는 피', stats: {} },
      { name: '숲 길잡이', stats: {} },
    ]);

    expect(guardian).toMatchObject({ stats: { '공격력%': 0.24, '주는피해%': 0 } });
    expect(guardian.conditionalEffects[0]).toMatchObject({ modelStatus: 'mechanics-only', includedInDps: false });
    expect(dawn.conditionalEffects[0]).toMatchObject({ stats: { '주는피해%': 0.20 }, defaultUptime: 0.70 });
    expect(boilingBlood.conditionalEffects[0]).toMatchObject({ stats: { '스킬피해%': 0.24 }, defaultUptime: 0 });
    expect(forestGuide.conditionalEffects[0]).toMatchObject({ triggerScope: 'tenHits', hitsPerTrigger: 10, stats: { '주는피해%': 0.21 } });
  });

  it('maps channeling, reset-stack, recovery reduction, and healing triggers to explicit DPS or mechanics paths', () => {
    const [seaSerpent, successor, sleepingLand, scaledSage] = applyRuneEffectModels([
      { name: '바다뱀+', stats: {} },
      { name: '계승자', stats: {} },
      { name: '잠든 땅', stats: {} },
      { name: '비늘 덮인 현자', stats: {} },
    ]);

    expect(seaSerpent).toMatchObject({ stats: { '공격력%': 0.05, '스킬속도%': 0.05, '주는피해%': 0 } });
    expect(seaSerpent.conditionalEffects[0].stats).toEqual({ '주는피해%': 0.31 });
    expect(successor).toMatchObject({ stats: { '주는피해%': 0.13, '스킬피해%': 0 } });
    expect(successor.conditionalEffects[0]).toMatchObject({ maxStacks: 5, perStack: true, stats: { '스킬피해%': 0.065 } });
    expect(sleepingLand).toMatchObject({ stats: { '강타피해%': 0.13, '연타피해%': 0.13 } });
    expect(sleepingLand.conditionalEffects[0]).toMatchObject({ modelStatus: 'mechanics-only', includedInDps: false });
    expect(scaledSage.conditionalEffects).toHaveLength(2);
  });

  it('separates mythic rune permanent DPS stats from manual and mechanics-only conditions', () => {
    const [dragonHunter, goddess, grimoire, sunkenKingdom] = applyRuneEffectModels([
      { name: '[신화] 용 사냥꾼', stats: {} },
      { name: '[신화] 여신', stats: {} },
      { name: '[신화] 사슬로 묶은 법전', stats: {} },
      { name: '[신화] 가라앉은 왕국', stats: {} },
    ]);

    expect(dragonHunter).toMatchObject({ stats: { '치명타확률%': 0.10, '치명타피해%': 0.10, '주는피해%': 0 } });
    expect(dragonHunter.conditionalEffects[0]).toMatchObject({ directDamage: 17142, durationSeconds: 60, cooldownSeconds: 3, defaultUptime: 0 });
    expect(goddess.stats).toMatchObject({ '주는피해%': 0.29 });
    expect(grimoire.stats).toMatchObject({ '주는피해%': 0.29 });
    expect(grimoire.conditionalEffects).toHaveLength(2);
    expect(sunkenKingdom).toMatchObject({ stats: { '공격력%': 0.15, '주는피해%': 0 } });
    expect(sunkenKingdom.conditionalEffects[0]).toMatchObject({ modelStatus: 'mechanics-only', includedInDps: false });
  });

  it('preserves all permanent DPS stats for Eternal Night and Faded Star', () => {
    const [eternalNight, fadedStar] = applyRuneEffectModels([
      { name: '영원한 밤', stats: { '공격력%': 0.07 } },
      { name: '빛바랜 별', stats: { '주는피해%': 0.31 } },
    ]);

    expect(eternalNight.stats).toMatchObject({
      '공격력%': 0.07,
      '강타피해%': 0.07,
      '연타피해%': 0.07,
      '치명타확률%': 0.07,
      '추가타확률%': 0.07,
    });
    expect(eternalNight.conditionalEffects[0]).toMatchObject({
      modelStatus: 'mechanics-only',
      includedInDps: false,
    });
    expect(fadedStar.stats).toMatchObject({ '주는피해%': 0.31, '무방비피해%': 0.31 });
  });

  it('models Transcendence extra-hit and critical-hit threshold effects from the real cycle event rates', () => {
    const [transcendence] = applyRuneEffectModels([{ name: '초월', stats: {} }]);

    expect(transcendence.conditionalEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        triggerScope: 'fiveExtraHit',
        directDamage: 24235,
        durationSeconds: 10,
        cooldownSeconds: 4,
        stats: { '주는피해%': 0.15 },
      }),
      expect.objectContaining({
        triggerScope: 'fiveCritHit',
        directDamage: 24235,
        durationSeconds: 10,
        cooldownSeconds: 4,
        stats: { '치명타피해%': 0.15 },
      }),
    ]));
  });

  it('models Pride armor break and Burning Glory conditional attack as DPS inputs', () => {
    const [pride, burningGlory] = applyRuneEffectModels([
      { name: '긍지', stats: {} },
      { name: '타오르는 영광', stats: {} },
    ]);

    expect(pride.conditionalEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'attack-armor-break-target-damage',
        durationSeconds: 10,
        cooldownSeconds: 1,
        stats: { '대상받는피해%': 0.1 },
      }),
    ]));
    expect(burningGlory.conditionalEffects[0]).toMatchObject({
      id: 'ember-stack-ultimate-conditional-attack',
      durationSeconds: 15,
      intervalSeconds: 5,
      maxStacks: 12,
      defaultUptime: 0.13,
      stats: { '조건부공증%': 0.42 },
    });
  });

  it('preserves empty slots and returns an empty list when the selected rune list is omitted', () => {
    expect(applyRuneEffectModels([null])).toEqual([null]);
    expect(applyRuneEffectModels()).toEqual([]);
  });
});
