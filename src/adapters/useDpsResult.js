import { useMemo } from 'react';
import { calculateDpsResult } from './calculationAdapter.js';

export function useDpsResult({
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
  return useMemo(() => calculateDpsResult({
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
  }), [
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
  ]);
}
