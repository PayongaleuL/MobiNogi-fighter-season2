import runesData from '../data/runes.json';
import skillMdText from '../../results/260710_패시브_액티브_스킬목록.md?raw';
import { calculateDPS } from '../core/calculator.js';
import { calculateGemStats } from '../core/gemCalculator.js';
import parseSkillMarkdown from '../utils/skillMdParser.js';

const parsedSkills = parseSkillMarkdown(skillMdText);

const normalizeRuneName = (name) => String(name ?? '')
  .replace(/\+/g, '')
  .replace(/\s+/g, '')
  .trim();

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
