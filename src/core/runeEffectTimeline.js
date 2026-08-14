const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const percent = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

/**
 * 한 효과의 시간축 평균 상태를 계산한다.
 * 이벤트 빈도는 실제 딜사이클에서 얻은 초당 사용/적중 횟수이며, 외부 상태는 호출자가
 * 명시적으로 전달한다. 이 함수는 임의의 기본 0%를 만들지 않는다.
 */
export function calculateEffectTimeline(effect = {}, context = {}) {
  const explicitUptime = context.uptimePercent ?? context.uptime;
  const duration = Math.max(0, percent(effect.durationSeconds ?? effect.mechanics?.durationSeconds));
  const cooldown = Math.max(0, percent(
    effect.cooldownSeconds
      ?? effect.intervalSeconds
      ?? effect.mechanics?.cooldownSeconds
      ?? effect.mechanics?.intervalSeconds,
  ));
    const triggerRate = Math.max(0, percent(context.triggerRatePerSecond ?? effect.triggerRatePerSecond));
  // 활성 효과의 재사용 대기시간과 그 안에서 반복되는 피해 틱 간격은 별도 값이다.
  // 예: 10초 활성/20초 재사용 중 매 1초 피해는 cooldown 20초가 아니라 1초마다 발생한다.
  const damageInterval = Math.max(0, percent(effect.damageIntervalSeconds ?? effect.mechanics?.damageIntervalSeconds));
  const maxStacks = Math.max(1, percent(effect.maxStacks ?? effect.mechanics?.maxStacks ?? 1));
  const stackGain = Math.max(0, percent(effect.stackGain ?? effect.mechanics?.stackGain ?? 1));
  const directDamage = percent(effect.directDamage ?? effect.mechanics?.directDamage);
  const dotDamage = percent(effect.dotDamage ?? effect.mechanics?.dotDamage);
  const dotTicks = Math.max(0, percent(effect.dotTicks ?? effect.mechanics?.dotTicks));

  let uptime;
  let provenance;
  if (explicitUptime !== undefined && explicitUptime !== null && explicitUptime !== '') {
    uptime = clamp(percent(explicitUptime) > 1 ? percent(explicitUptime) / 100 : percent(explicitUptime), 0, 1);
    provenance = 'explicit-input';
  } else if (effect.forceDefaultUptime && effect.defaultUptime !== undefined) {
    uptime = clamp(percent(effect.defaultUptime), 0, 1);
    provenance = 'forced-declared-default';
  } else if (duration > 0 && cooldown > 0 && triggerRate > 0) {
    uptime = clamp(Math.min(duration / cooldown, duration * triggerRate), 0, 1);
    provenance = 'event-rate-cooldown';
  } else if (duration > 0 && cooldown > 0) {
    uptime = clamp(duration / cooldown, 0, 1);
    provenance = 'duration-cooldown';
  } else if (duration > 0 && triggerRate > 0) {
    uptime = clamp(duration * triggerRate, 0, 1);
    provenance = 'event-rate';
  } else if (effect.defaultUptime !== undefined) {
    uptime = clamp(percent(effect.defaultUptime), 0, 1);
    provenance = 'declared-default';
  } else {
    uptime = 1;
    provenance = 'always-active';
  }

  // 개별 만료 중첩은 유효 창 안에 들어오는 이벤트 수의 기댓값이다.
  const averageStacks = maxStacks > 1
    ? clamp(triggerRate * Math.max(duration, context.evaluationWindowSeconds ?? 0) * stackGain, 0, maxStacks)
    : 1;
  const stackMultiplier = maxStacks > 1 ? averageStacks : 1;
  const triggerInterval = damageInterval || cooldown;
  const triggerCountPerSecond = triggerInterval > 0
    ? Math.min(triggerRate || 1 / triggerInterval, 1 / triggerInterval)
    : triggerRate;
  const damageUptimeMultiplier = effect.damageScalesWithUptime ? uptime : 1;

  return {
    uptime,
    uptimePercent: uptime * 100,
    uptimeProvenance: provenance,
    averageStacks,
    stackMultiplier,
    directDamagePerSecond: triggerCountPerSecond * directDamage * damageUptimeMultiplier,
    dotDamagePerSecond: triggerCountPerSecond * dotDamage * dotTicks * damageUptimeMultiplier,
  };
}

/**
 * 조건부 효과의 스탯을 평균 가동률·평균 스택으로 적용한다. 상시 공격력%는 이 함수를
 * 통과하지 않으며, 조건부 공격력은 `조건부공증%`에만 기록해 적용 공격력 계약을 지킨다.
 */
export function calculateEffectStats(effect = {}, context = {}) {
  const timeline = calculateEffectTimeline(effect, context);
  const stats = {};

  Object.entries(effect.stats ?? {}).forEach(([key, value]) => {
    if (!Number.isFinite(Number(value)) || Number(value) === 0) return;
    const multiplier = effect.perStack ? timeline.stackMultiplier : 1;
    stats[key] = Number(value) * timeline.uptime * multiplier;
  });

  return { ...timeline, stats };
}

export function aggregateRuneEffectTimeline(effects = [], contextByEffect = {}) {
  return effects.reduce((aggregate, effect) => {
    const context = contextByEffect[effect.id] ?? {};
    const result = calculateEffectStats(effect, context);
    Object.entries(result.stats).forEach(([key, value]) => {
      aggregate.stats[key] = (aggregate.stats[key] ?? 0) + value;
    });
    aggregate.directDamagePerSecond += result.directDamagePerSecond;
    aggregate.dotDamagePerSecond += result.dotDamagePerSecond;
    aggregate.effects.push({ id: effect.id, ...result });
    return aggregate;
  }, { stats: {}, directDamagePerSecond: 0, dotDamagePerSecond: 0, effects: [] });
}

/**
 * 기존 상시 스탯으로 계산된 DPS에 효과 시간축 평균 스탯을 중복 없이 반영하는 비율을 반환한다.
 * 계산 코어는 이 비율과 직접 피해 이벤트를 분리해 결과 객체에 노출한다.
 */
export function calculateEffectDpsMultiplier(effectStats = {}, baseline = {}) {
  const attackBase = 1 + percent(baseline.totalAtkPct);
  const givesBase = 1 + percent(baseline.totalGivesDmg);
  const targetReceivesBase = 1 + percent(baseline.totalTargetReceivesDmg);
  const strongBase = 1 + percent(baseline.totalStrongDmg);
  const chainBase = 1 + percent(baseline.totalChainDmg);
  const skillBase = 1 + percent(baseline.totalSkillDmg) + percent(baseline.totalComboDmg);
  const critProbability = clamp(percent(baseline.critProbability), 0, 1);
  const critDamage = percent(baseline.critDamage);
  const critBase = (1 - critProbability) + (critDamage * critProbability);

  const attackMultiplier = (attackBase + percent(effectStats['조건부공증%'])) / attackBase;
  const givesMultiplier = (givesBase + percent(effectStats['주는피해%'])) / givesBase;
  const targetReceivesMultiplier = (targetReceivesBase + percent(effectStats['대상받는피해%'])) / targetReceivesBase;
  const strongMultiplier = (strongBase + percent(effectStats['강타피해%'])) / strongBase;
  const chainMultiplier = (chainBase + percent(effectStats['연타피해%'])) / chainBase;
  const skillMultiplier = (skillBase + percent(effectStats['스킬피해%']) + percent(effectStats['콤보피해%'])) / skillBase;
  const effectCritDamage = critDamage * (1 + percent(effectStats['치명타피해%']));
  const effectCritProbability = clamp(critProbability + percent(effectStats['치명타확률%']), 0, 1);
  const critMultiplier = ((1 - effectCritProbability) + (effectCritDamage * effectCritProbability)) / critBase;

  return attackMultiplier
    * givesMultiplier
    * targetReceivesMultiplier
    * strongMultiplier
    * chainMultiplier
    * skillMultiplier
    * critMultiplier
    * (1 + percent(effectStats['최종피해%']));
}
