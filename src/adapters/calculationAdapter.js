import runesData from '../data/runes.json';
import skillMdText from '../../results/260710_패시브_액티브_스킬목록.md?raw';
import { calculateDPS } from '../core/calculator.js';
import { calculateGemStats } from '../core/gemCalculator.js';
import parseSkillMarkdown from '../utils/skillMdParser.js';

const parsedSkills = parseSkillMarkdown(skillMdText);

const normalizeRuneName = (name) => {
  const normalized = String(name ?? '')
    .replace(/\+/g, '')
    .replace(/\s+/g, '')
    .trim();
  // 최신 260814 마스터 원문의 정식 표기를 우선하며, 이전 저장 프리셋의 OCR 오타만 읽기 호환한다.
  return normalized === '그음달' ? '그믐달' : normalized;
};

export function flattenSelectedRunes({ selectedRunes = {}, customRunes = [], transcendLevels = {} }) {
  const flattened = [];

  Object.entries(selectedRunes).forEach(([type, selected]) => {
    (selected || []).forEach((rune, index) => {
      if (!rune) return;

      const normalizedName = normalizeRuneName(rune.name);
      const latestRune = customRunes.find((candidate) => normalizeRuneName(candidate.name) === normalizedName)
        || runesData.find((candidate) => normalizeRuneName(candidate.name) === normalizedName)
        || rune;

      flattened.push({
        ...latestRune,
        stats: latestRune.stats || {},
        transcendLevel: transcendLevels[type]?.[index] ?? 0,
      });
    });
  });

  return flattened;
}

export function calculateDpsResult({
  stats,
  selectedRunes,
  customRunes,
  transcendLevels,
  gems,
  gimmicks,
  cycles,
  conditionalUptimes,
  skillStances,
  seals,
}) {
  const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats(gems);
  const flattenedRunes = flattenSelectedRunes({ selectedRunes, customRunes, transcendLevels });

  return calculateDPS(
    { ...stats, extraAllStat, extraFinalDmgPct },
    flattenedRunes,
    gimmicks,
    cycles,
    conditionalUptimes,
    gemStats,
    skillStances,
    seals,
    parsedSkills,
  );
}
