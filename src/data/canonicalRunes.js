import runesData from './runes.json' with { type: 'json' };
import { applyRuneEffectModels } from './runeEffectModels.js';

export const canonicalRuneKey = (name) => {
  const normalized = String(name ?? '').replace(/\+/g, '').replace(/\s+/g, '').trim();
  return normalized === '그음달' ? '그믐달' : normalized;
};

const cloneRune = (rune) => ({
  ...rune,
  stats: { ...(rune.stats ?? {}) },
  cleaned_text: [...(rune.cleaned_text ?? [])],
  raw_text: Array.isArray(rune.raw_text) ? [...rune.raw_text] : rune.raw_text,
  conditionalEffects: rune.conditionalEffects?.map((effect) => ({
    ...effect,
    stats: { ...(effect.stats ?? {}) },
    mechanics: effect.mechanics ? { ...effect.mechanics } : effect.mechanics,
  })),
});

/**
 * 최신 수동 검수 룬 데이터를 계산·표시·감사의 유일한 기준선으로 생성한다.
 * 원문 파서는 설명 감사용이며, 이 함수의 계산 스탯을 덮어쓰지 않는다.
 */
export const createCanonicalRunes = (sourceRunes = runesData) => (
  applyRuneEffectModels(sourceRunes.map(cloneRune))
);

export const resolveCanonicalRune = (name, canonicalRunes = createCanonicalRunes()) => (
  canonicalRunes.find((rune) => canonicalRuneKey(rune.name) === canonicalRuneKey(name)) ?? null
);

export const canonicalRunesEqual = (left, right) => {
  if (!left || !right) return false;
  const leftStats = left.stats ?? {};
  const rightStats = right.stats ?? {};
  const statKeys = new Set([...Object.keys(leftStats), ...Object.keys(rightStats)]);

  return canonicalRuneKey(left.name) === canonicalRuneKey(right.name)
    && [...statKeys].every((key) => Math.abs((leftStats[key] ?? 0) - (rightStats[key] ?? 0)) <= 0.0001);
};
