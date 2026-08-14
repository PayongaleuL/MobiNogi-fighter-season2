const normalizeId = (text) => text
  .replace(/\+/g, 'plus')
  .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const percentPatterns = [
  ['공격력', '조건부공증%'],
  ['적에게 주는 피해', '주는피해%'],
  ['주는 피해', '주는피해%'],
  ['강타 피해', '강타피해%'],
  ['연타 피해', '연타피해%'],
  ['추가타 피해', '추가타피해%'],
  ['치명타 피해', '치명타피해%'],
  ['스킬 피해', '스킬피해%'],
  ['콤보스킬 피해', '콤보피해%'],
  ['추가타 확률', '추가타확률%'],
  ['치명타 확률', '치명타확률%'],
  ['재사용 대기시간 회복 속도', '재사용회복%'],
  ['재사용 대기시간 회복속도', '재사용회복%'],
  ['스킬 사용 속도', '스킬속도%'],
  ['스킬 사용속도', '스킬속도%'],
  ['캐스팅 및 차지 속도', '스킬속도%'],
  ['최종 피해량', '최종피해%'],
];

const hasConditionSignal = (text) => /(시|경우|동안|마다|중첩|재사용 대기시간|처치|적중|사용|활성화|소모|보유|전투|무방비|브레이크|체력|자원|지속 피해|대상|주변|범위)/.test(text);

const findPercentStats = (text) => percentPatterns.reduce((stats, [phrase, key]) => {
  const regex = new RegExp(`${phrase}[^0-9]{0,20}(\\d+(?:\\.\\d+)?)%`, 'g');
  for (const match of text.matchAll(regex)) {
    stats[key] = (stats[key] ?? 0) + Number(match[1]) / 100;
  }
  return stats;
}, {});

const findNumber = (text, pattern) => {
  const match = text.match(pattern);
  return match ? Number(match[1].replaceAll(',', '')) : undefined;
};

const inferTriggerScope = (text) => {
  if (/무방비 공격 적중/.test(text)) return 'unarmedHit';
  if (/방어구 파괴/.test(text) && /공격 시|공격시/.test(text)) return 'attackArmorBreak';
  if (/궁극기 사용|궁극기 스킬/.test(text)) return 'ultimateUse';
  if (/기본 공격/.test(text)) return 'basicAttack';
  if (/스킬 사용|스킬 사용시|스킬 사용 시/.test(text)) return 'skillUse';
  if (/공격 시|공격시|공격 적중|공격이 적중/.test(text)) return 'attack';
  if (/밤의 축복/.test(text)) return 'nightBlessing';
  if (/처치/.test(text)) return 'nearbyKill';
  if (/브레이크/.test(text)) return 'break';
  if (/무방비/.test(text)) return 'unarmed';
  return 'externalScenario';
};

const inferDefaultUptime = (rune, text) => {
  if (Number.isFinite(rune.stats?.['가동률']) && rune.stats['가동률'] !== 1) return rune.stats['가동률'];
  if (/방어구 파괴/.test(text) && /공격 시|공격시/.test(text)) return 1;
  if (/스킬 사용/.test(text) && /최대 \d+회까지 중첩/.test(text)) return 1;
  return 0;
};

export function deriveRuneDescriptionEffects(rune = {}) {
  const lines = rune.cleaned_text ?? [];
  return lines.flatMap((source, index) => {
    if (!hasConditionSignal(source)) return [];
    const stats = findPercentStats(source);
    const durationSeconds = findNumber(source, /(\d+(?:\.\d+)?)초\s*동안/);
    const cooldownSeconds = findNumber(source, /재사용\s*대기시간\s*:?\s*(\d+(?:\.\d+)?)초/)
      ?? findNumber(lines[index + 1] ?? '', /재사용\s*대기시간\s*:?\s*(\d+(?:\.\d+)?)초/);
    const intervalSeconds = findNumber(source, /(\d+(?:\.\d+)?)초마다/);
    const maxStacks = findNumber(source, /최대\s*(\d+)회까지\s*중첩/);
    const directDamage = findNumber(source, /(\d{4,}|\d{1,3}(?:,\d{3})+)의\s*(?!지속\s*피해)피해/);
    const dotDamage = findNumber(source, /(\d{4,}|\d{1,3}(?:,\d{3})+)의\s*지속\s*피해/);
    const tickInterval = findNumber(source, /(\d+(?:\.\d+)?)초마다\s*\d+(?:,\d+)?의/);
    const dotTicks = durationSeconds && tickInterval ? durationSeconds / tickInterval : undefined;
    const triggerScope = inferTriggerScope(source);

    // 상시 수치만 담긴 문장은 canonical stats가 담당한다. 조건부·이벤트 문장만 효과로 전환한다.
    const hasEffectPayload = Object.keys(stats).length > 0 || directDamage || dotDamage || durationSeconds || cooldownSeconds || maxStacks;
    if (!hasEffectPayload) return [];

    return [{
      id: `${normalizeId(rune.name)}-source-${index + 1}-${normalizeId(source).slice(0, 32)}`,
      label: `${rune.name} 원문 효과 ${index + 1}`,
      source,
      stats,
      directDamage,
      dotDamage,
      dotTicks,
      durationSeconds,
      cooldownSeconds,
      intervalSeconds,
      maxStacks,
      perStack: Boolean(maxStacks && /중첩/.test(source)),
      defaultUptime: inferDefaultUptime(rune, source),
      uptimeStep: 1,
      modelStatus: 'source-derived',
      triggerScope,
      dynamicByCycle: ['skillUse', 'attack', 'attackArmorBreak', 'unarmedHit', 'ultimateUse'].includes(triggerScope),
      resultKind: directDamage || dotDamage ? 'directDamageEvent' : 'timelineModifier',
    }];
  });
}

export function mergeRuneDescriptionEffects(rune, explicitEffects = []) {
  const derived = deriveRuneDescriptionEffects(rune);
  const explicitSources = new Set(explicitEffects.map((effect) => effect.source));
  const merged = [...explicitEffects];
  derived.forEach((effect) => {
    if (!explicitSources.has(effect.source)) merged.push(effect);
  });
  return merged;
}
