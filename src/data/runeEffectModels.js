const models = {
  '오랜 광기': {
    id: 'weapon-old-madness',
    effectModelVersion: 2,
    stats: { '스킬속도%': 0, '가동률': 1 },
    mechanics: {
      attackSpeedPct: 0.10,
      skillUseSpeedPct: 0,
      castChargeSpeedPct: 0.10,
      notes: '공격 속도·캐스팅 및 차지 속도는 평타·스킬 시전 이벤트 정책이 확정되기 전 DPS에 합산하지 않는다.'
    }
  },
  '억눌린 충동': {
    id: 'weapon-suppressed-impulse',
    effectModelVersion: 2,
    stats: { '공격력%': 0.30, '치명타피해%': 0.05, '가동률': 1 },
    mechanics: { moveSpeedPct: -0.15 }
  },
  '거대한 분노': {
    id: 'weapon-great-rage',
    effectModelVersion: 2,
    stats: { '주는피해%': 0.21, '스킬피해%': 0, '가동률': 1 },
    conditionalEffects: [{
      id: 'strong-hit-stack-skill-damage',
      label: '강타 적중 4중첩 스킬 피해',
      source: '강타 적중 시 스킬 피해가 3% 증가하며 최대 4회 중첩된다. 강타가 아닌 공격 적중 시 즉시 해제된다.',
      stats: { '스킬피해%': 0.12 },
      defaultUptime: 1,
      uptimeStep: 1,
      forceUptimeControl: true,
      modelStatus: 'manual',
      triggerScope: 'strongHitStack'
    }]
  },
  '바위 칼날': {
    id: 'weapon-rock-blade',
    effectModelVersion: 2,
    stats: { '공격력%': 0, '치명타확률%': 0, '가동률': 1 },
    conditionalEffects: [{
      id: 'hit-stack-attack-crit',
      label: '적중 30중첩 공격력·치명타',
      source: '공격 적중마다 10초 동안 공격력 0.7%, 치명타 확률 0.5%가 증가하며 최대 30회 중첩되고 각 중첩은 개별 유지된다.',
      stats: {},
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'unresolved',
      triggerScope: 'hitStack',
      maxStacks: 30,
      includedInDps: false,
      impact: 'N/A'
    }]
  },
  '두 갈래 별': {
    id: 'weapon-twin-star',
    effectModelVersion: 2,
    stats: { '공격력%': 0.16, '스킬속도%': 0, '가동률': 1 },
    conditionalEffects: [{
      id: 'basic-attack-skill-use-speed',
      label: '기본 공격 후 스킬 사용 속도',
      source: '기본 공격 사용 시 5초 동안 스킬 사용 속도가 15% 증가한다.',
      stats: {},
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'unresolved',
      triggerScope: 'basicAttack',
      mechanics: { skillUseSpeedPct: 0.15, durationSeconds: 5 },
      includedInDps: false,
      impact: 'N/A'
    }, {
      id: 'skill-use-attack-speed',
      label: '스킬 사용 후 공격 속도',
      source: '스킬 사용 시 5초 동안 공격 속도가 15% 증가한다.',
      stats: {},
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'unresolved',
      triggerScope: 'skillUse',
      mechanics: { attackSpeedPct: 0.15, durationSeconds: 5 },
      includedInDps: false,
      impact: 'N/A'
    }]
  },
  '추적자': {
    id: 'weapon-tracker',
    effectModelVersion: 2,
    stats: { '강타피해%': 0.35, '가동률': 1 },
    conditionalEffects: [{
      id: 'eight-skill-direct-damage-and-strong-penalty',
      label: '스킬 8회 직접 피해·강타 피해 감소',
      source: '스킬 8회 사용 시 주변 10m 적에게 66,395 피해를 주고 6초 동안 강타 피해가 20% 감소한다.',
      stats: {},
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'unresolved',
      triggerScope: 'eightSkillUse',
      mechanics: { directDamage: 66395, strongDamagePenaltyPct: -0.20, durationSeconds: 6, radiusMeters: 10 },
      includedInDps: false,
      impact: 'N/A'
    }]
  },
  '첫 번째 서약': {
    id: 'armor-first-oath',
    effectModelVersion: 2,
    stats: { '공격력%': 0.15, '가동률': 1 },
    conditionalEffects: [{
      id: 'night-blessing-strong-crit-attack',
      label: '밤의 축복 강타·치명타·공격력',
      source: '밤의 축복 스킬 활성화 시 강타 피해, 치명타 확률, 공격력이 11% 증가한다.',
      stats: { '밤축_강타피해%': 0.11, '밤축_치명타확률%': 0.11, '밤축_조건부공증%': 0.11 },
      defaultUptime: 1,
      uptimeStep: 1,
      modelStatus: 'modeled',
      triggerScope: 'nightBlessing'
    }]
  },
  '아귀': {
    id: 'armor-maw',
    effectModelVersion: 2,
    // 원문: 공격력 15%, 무방비 피해 12%. 주는 피해·콤보 피해가 아니다.
    stats: { '공격력%': 0.15, '주는피해%': 0, '콤보피해%': 0, '무방비피해%': 0.12, '가동률': 1 },
    conditionalEffects: [{
      id: 'five-second-next-hit-direct-damage',
      label: '5초마다 다음 공격 직접 피해·상처',
      source: '매 5초마다 다음 공격 시 12,413의 피해와 31,328의 지속 피해: 상처를 추가로 준다.',
      stats: {},
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'unresolved',
      triggerScope: 'fiveSecondNextHit',
      mechanics: { directDamage: 12413, dotDamage: 31328, intervalSeconds: 5 },
      includedInDps: false,
      impact: 'N/A'
    }]
  },
  '정복자+': {
    id: 'armor-conqueror-plus',
    effectModelVersion: 2,
    stats: { '공격력%': 0.05, '주는피해%': 0.09, '가동률': 1 },
    conditionalEffects: [{
      id: 'nearby-kill-gives-damage',
      label: '주변 처치 주는 피해',
      source: '주위에서 적이 5/10/20명 처치될 경우 주는 피해가 3%/6%/12% 증가한다.',
      stats: { '주는피해%': 0.12 },
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'manual',
      triggerScope: 'nearbyKill'
    }]
  },
  '은빛 찬가': {
    id: 'armor-silver-hymn',
    effectModelVersion: 2,
    stats: { '공격력%': 0.05, '재사용회복%': 0.06, '가동률': 1 },
    conditionalEffects: [{
      id: 'nearby-kill-cooldown-recovery',
      label: '주변 처치 재사용 회복',
      source: '주위에서 적이 5/10/20명 처치될 경우 재사용 대기시간 회복 속도가 3%/6%/12% 증가한다.',
      stats: { '재사용회복%': 0.12 },
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'manual',
      triggerScope: 'nearbyKill'
    }]
  },
  '승전': {
    id: 'armor-victory',
    effectModelVersion: 2,
    stats: { '주는피해%': 0.05, '치명타피해%': 0.10, '가동률': 1 },
    conditionalEffects: [{
      id: 'nearby-kill-crit-damage',
      label: '주변 처치 치명타 피해',
      source: '주위에서 적이 5/10/20명 처치될 경우 치명타 피해가 3%/6%/12% 증가한다.',
      stats: { '치명타피해%': 0.12 },
      defaultUptime: 0,
      uptimeStep: 1,
      modelStatus: 'manual',
      triggerScope: 'nearbyKill'
    }]
  }
};

export function applyRuneEffectModels(runes = []) {
  return runes.map((rune) => {
    if (!rune) return rune;
    const model = models[rune.name];
    if (!model) return rune;
    return {
      ...rune,
      ...model,
      stats: { ...(rune.stats || {}), ...(model.stats || {}) },
      conditionalEffects: model.conditionalEffects ?? rune.conditionalEffects ?? []
    };
  });
}

export const runeEffectModels = models;
