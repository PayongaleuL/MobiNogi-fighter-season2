const OFFICIAL_SOURCE = {
  magicResistanceGuide: 'https://mabinogimobile.nexon.com/Info/Guide/3481543',
  lundaInitial: 'https://mabinogimobile.nexon.com/News/Update/3489835',
  lundaVeryHard: 'https://mabinogimobile.nexon.com/News/Update/3495349',
  kabrakIntro: 'https://mabinogimobile.nexon.com/News/Update/3500247',
};

export const TARGET_DEFINITIONS = [
  {
    id: '함선 허수아비',
    label: '함선 허수아비',
    content: '훈련',
    requiredMagicResistance: 0,
    magicPressure: 0,
    armor: 30,
    critResistance: 0,
    defenseStatus: '훈련 기준값',
    source: null,
  },
  {
    id: '허수아비',
    label: '티르코네일 허수아비',
    content: '훈련',
    requiredMagicResistance: 0,
    magicPressure: 0,
    armor: 30,
    critResistance: 0,
    defenseStatus: '훈련 기준값',
    source: null,
  },
  {
    id: '칼드레드 · 허상의 정박지 매우 어려움',
    label: '허상의 정박지 · 매우 어려움',
    content: '룬다 어비스',
    requiredMagicResistance: 2200,
    magicPressure: 2700,
    armor: 8408,
    critResistance: 0,
    defenseStatus: 'P2-B 로그 기반 근사치 · 낮은 신뢰도',
    calibration: {
      source: 'P2-B 로그 기반 근사치',
      sampleCount: 2,
      armorRange: [6561, 10255],
      critResistanceRange: [0, 0],
      confidence: 'low',
      analysisPath: 'results/p2b_calibrated_target_estimates.md',
    },
    source: OFFICIAL_SOURCE.lundaVeryHard,
  },
  {
    id: '데스펠 · 광기의 동굴 매우 어려움',
    label: '광기의 동굴 · 매우 어려움',
    content: '룬다 어비스',
    requiredMagicResistance: 2200,
    magicPressure: 2700,
    armor: 17125,
    critResistance: 0,
    defenseStatus: 'P2-B 로그 기반 근사치 · 낮은 신뢰도',
    calibration: {
      source: 'P2-B 로그 기반 근사치',
      sampleCount: 2,
      armorRange: [15646, 18605],
      critResistanceRange: [0, 0],
      confidence: 'low',
      analysisPath: 'results/p2b_calibrated_target_estimates.md',
    },
    source: OFFICIAL_SOURCE.lundaVeryHard,
  },
  {
    id: '테로사 · 흩어진 물길 매우 어려움',
    label: '흩어진 물길 · 매우 어려움',
    content: '룬다 어비스',
    requiredMagicResistance: 2200,
    magicPressure: 2700,
    armor: 18967,
    critResistance: 0,
    defenseStatus: 'P2-B 로그 기반 근사치 · 낮은 신뢰도',
    calibration: {
      source: 'P2-B 로그 기반 근사치',
      sampleCount: 2,
      armorRange: [16261, 21674],
      critResistanceRange: [0, 0],
      confidence: 'low',
      analysisPath: 'results/p2b_calibrated_target_estimates.md',
    },
    source: OFFICIAL_SOURCE.lundaVeryHard,
  },
  {
    id: '카브락 · 입문',
    label: '카브락 레이드 · 입문',
    content: '카브락 레이드',
    requiredMagicResistance: 2000,
    magicPressure: 2500,
    armor: 7203,
    critResistance: 0,
    defenseStatus: 'P2-B 로그 기반 근사치 · 낮은 신뢰도',
    calibration: {
      source: 'P2-B 로그 기반 근사치',
      sampleCount: 3,
      armorRange: [7039, 9542],
      critResistanceRange: [0, 0],
      confidence: 'low',
      analysisPath: 'results/p2b_calibrated_target_estimates.md',
    },
    source: OFFICIAL_SOURCE.kabrakIntro,
  },
];

export const DEFAULT_TARGET_ID = '함선 허수아비';

export function getTargetDefinition(targetId) {
  return TARGET_DEFINITIONS.find((target) => target.id === targetId)
    ?? TARGET_DEFINITIONS.find((target) => target.id === DEFAULT_TARGET_ID);
}

export const TARGET_SOURCE_URLS = OFFICIAL_SOURCE;
