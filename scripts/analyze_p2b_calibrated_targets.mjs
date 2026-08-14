import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createLatestReferencePresets } from '../src/data/latestReferencePresets.js';
import { calculateDPS } from '../src/core/calculator.js';
import { getTargetDefinition } from '../src/data/targets.js';
import { calculateGemStats } from '../src/core/gemCalculator.js';
import parseSkillMarkdown from '../src/utils/skillMdParser.js';

const logsDirectory = path.resolve('results/p2b_raw_logs');
const reportPath = path.resolve('results/p2b_calibrated_target_estimates.md');
const rawSkillPath = path.resolve('results/260710_패시브_액티브_스킬목록.md');

const logDefinitions = [
  { file: 'anchorage_full.json', content: '룬다 어비스 매우 어려움', target: '칼드레드 · 허상의 정박지 매우 어려움', condition: '장착', reference: 'https://mobi-score.com/r/4Qq19MnzmZiC0a7e' },
  { file: 'anchorage_without_head.json', content: '룬다 어비스 매우 어려움', target: '칼드레드 · 허상의 정박지 매우 어려움', condition: '제거', reference: 'https://mobi-score.com/r/WKx26orrtszkzEME' },
  { file: 'cave_full.json', content: '룬다 어비스 매우 어려움', target: '데스펠 · 광기의 동굴 매우 어려움', condition: '장착', reference: 'https://mobi-score.com/r/PeFuIadiNfJVC4sA' },
  { file: 'cave_without_head.json', content: '룬다 어비스 매우 어려움', target: '데스펠 · 광기의 동굴 매우 어려움', condition: '제거', reference: 'https://mobi-score.com/r/1AjC9mmQJHCSw8bD' },
  { file: 'waterway_full.json', content: '룬다 어비스 매우 어려움', target: '테로사 · 흩어진 물길 매우 어려움', condition: '장착', reference: 'https://mobi-score.com/r/uOSkrIy94NhcZfH8' },
  { file: 'waterway_without_head.json', content: '룬다 어비스 매우 어려움', target: '테로사 · 흩어진 물길 매우 어려움', condition: '제거', reference: 'https://mobi-score.com/r/TU0xlhPHmWCBWjCP' },
  { file: 'kabrak_full_1.json', content: '카브락 입문', target: '카브락 · 입문', condition: '장착', reference: 'https://mobi-score.com/r/qEfbzhpgazVcqm2N' },
  { file: 'kabrak_full_2.json', content: '카브락 입문', target: '카브락 · 입문', condition: '장착', reference: 'https://mobi-score.com/r/vGjwTiRp7FlNDokk' },
  { file: 'kabrak_without_head.json', content: '카브락 입문', target: '카브락 · 입문', condition: '제거', reference: 'https://mobi-score.com/r/HlrVreU9CzMZwmlt' },
];

const detailValue = (stats, label) => Number(stats?.detail?.find((entry) => entry.label === label)?.value ?? 0);
const sum = (values) => values.reduce((total, value) => total + value, 0);
const median = (values) => {
  const ordered = [...values].sort((a, b) => a - b);
  if (ordered.length === 0) return null;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
};
const quantile = (values, probability) => {
  const ordered = [...values].sort((a, b) => a - b);
  if (ordered.length === 0) return null;
  const index = (ordered.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return ordered[lower] + (ordered[upper] - ordered[lower]) * (index - lower);
};
const formatInteger = (value) => value === null || value === undefined ? '—' : Math.round(value).toLocaleString('ko-KR');
const formatPct = (value, digits = 1) => value === null || value === undefined ? '—' : `${(value * 100).toFixed(digits)}%`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function deterministicBootstrap(values, samples = 4096) {
  if (values.length === 0) return [null, null];
  let seed = 0x9e3779b9;
  const medians = [];
  for (let sample = 0; sample < samples; sample += 1) {
    const resample = [];
    for (let index = 0; index < values.length; index += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      resample.push(values[(seed >>> 8) % values.length]);
    }
    medians.push(median(resample));
  }
  return [quantile(medians, 0.10), quantile(medians, 0.90)];
}

function solveUnarmedTime(duration, unguardedShare, comboPower) {
  const multiplier = 1 + comboPower / 5250 + 0.45;
  const share = clamp(unguardedShare ?? 0, 0, 0.95);
  const timeShare = share / (multiplier - share * (multiplier - 1));
  return duration * clamp(timeShare, 0, 0.85);
}

function mapStats(record) {
  const status = record.characterStatus?.stats ?? {};
  return {
    baseAttack: Number(status.attack ?? 0),
    magicResistance: Number(status.arcaneResistance ?? 0),
    critScore: detailValue(status, '치명타'),
    strongDmg: detailValue(status, '강타 강화'),
    chainDmg: detailValue(status, '연타 강화'),
    comboPower: detailValue(status, '콤보 강화'),
    skillPower: detailValue(status, '스킬 위력'),
    multiPower: detailValue(status, '광역 강화'),
    extraProb: detailValue(status, '추가타'),
    fastAtk: detailValue(status, '빠른 공격'),
    fastSkill: detailValue(status, '빠른 스킬'),
    ultScore: detailValue(status, '궁극기'),
    enchantAtkPct: 6.8,
    manualFinalDmgPct: 4.7,
    useNightTrace: true,
    useDeadlyImpact: true,
    useHitCombo: true,
    nightBlessingUptime: 25,
  };
}

function directObservation(target) {
  const directSkills = (target.skills ?? []).filter((skill) => Number(skill.directDamage) > 0 && Number(skill.hitCount) > 0);
  const hits = sum(directSkills.map((skill) => Number(skill.hitCount ?? 0)));
  const crits = sum(directSkills.map((skill) => Number(skill.critCount ?? 0)));
  const directDamage = sum(directSkills.map((skill) => Number(skill.directDamage ?? 0)));
  const unguardedDamage = sum(directSkills.map((skill) => Number(skill.unguardedDamage ?? 0)));
  const breakDamage = sum(directSkills.map((skill) => Number(skill.breakDamage ?? 0)));
  return {
    hits,
    crits,
    directCritRate: hits > 0 ? crits / hits : 0,
    unguardedShare: directDamage > 0 ? unguardedDamage / directDamage : 0,
    breakShare: directDamage > 0 ? breakDamage / directDamage : 0,
  };
}

const skillMdText = await readFile(rawSkillPath, 'utf8');
const parsedSkills = parseSkillMarkdown(skillMdText);
const anchor = createLatestReferencePresets()[2].data;
const gemResult = calculateGemStats(anchor.gems);

function getRunes(condition) {
  const selected = structuredClone(anchor.selectedRunes);
  if (condition === '제거') {
    selected['방어구'] = selected['방어구'].filter((rune) => rune?.name !== '잊힌 맹약');
  }
  return Object.entries(selected).flatMap(([type, runes]) => (runes ?? [])
    .filter(Boolean)
    .map((rune, index) => ({
      ...rune,
      stats: rune.stats ?? {},
      transcendLevel: anchor.transcendLevels[type]?.[index] ?? 0,
    })));
}

function calculateArmorZeroDps(observation) {
  const duration = observation.targetDuration;
  const unarmedTime = solveUnarmedTime(duration, observation.unguardedShare, observation.stats.comboPower);
  const ultimateTime = duration * 0.25;
  const ordinaryTime = Math.max(0, duration - unarmedTime - ultimateTime);
  const result = calculateDPS(
    { ...observation.stats, extraAllStat: gemResult.extraAllStat, extraFinalDmgPct: gemResult.extraFinalDmgPct },
    getRunes(observation.condition),
    {
      boss: observation.target,
      ordinaryTime,
      unarmedTime,
      ultimateTime,
      gimmickDmgPct: 0,
      healerDmgPct: 0,
      skillDebuffDmgPct: 10,
      hasSpdBuff: false,
    },
    {
      ordinary: '1342235(444)2',
      ordinaryBreak: '1342235(444)2',
      ultimate: '445445445',
      ultimateBreak: '445445445',
    },
    { '흐릿한 형상': 70, '타오르는 영광': 13 },
    gemResult.gemStats,
    { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
    {},
    parsedSkills,
  );
  const appliedArmor = getTargetDefinition(observation.target)?.armor ?? 30;
  const appliedArmorCoefficient = 1 / (1 + appliedArmor / 10328);
  return result.weightedDps / appliedArmorCoefficient;
}

async function loadObservation(definition) {
  const outer = JSON.parse(await readFile(path.join(logsDirectory, definition.file), 'utf8'));
  const record = JSON.parse(outer.recordJson);
  const target = record.targets.find((entry) => entry.targetId === record.targetId) ?? record.targets[0];
  const stats = mapStats(record);
  const direct = directObservation(target);
  const preResistanceCritProbability = 0.5 * ((stats.critScore + 71) / (stats.critScore + 71 + 2000));
  const rawCritResistance = Math.max(0, preResistanceCritProbability - direct.directCritRate);
  const armorZeroDps = calculateArmorZeroDps({
    ...definition,
    stats,
    targetDuration: Number(target.duration),
    targetDps: Number(target.dps),
    unguardedShare: direct.unguardedShare,
  });
  const armor = Math.max(0, 10328 * (armorZeroDps / Number(target.dps) - 1));

  return {
    ...definition,
    stats,
    targetDps: Number(target.dps),
    targetDuration: Number(target.duration),
    armorZeroDps,
    armor,
    preResistanceCritProbability,
    rawCritResistance,
    ...direct,
  };
}

function groupBy(entries, key) {
  return entries.reduce((groups, entry) => {
    const groupKey = entry[key];
    groups[groupKey] ??= [];
    groups[groupKey].push(entry);
    return groups;
  }, {});
}

function summarize(entries) {
  const armorValues = entries.map((entry) => entry.armor);
  const critValues = entries.map((entry) => entry.rawCritResistance);
  const [armorLow, armorHigh] = deterministicBootstrap(armorValues);
  const [critLow, critHigh] = deterministicBootstrap(critValues);
  return {
    sampleCount: entries.length,
    armor: Math.round(median(armorValues) ?? 0),
    armorRange: [Math.max(0, Math.round(armorLow ?? 0)), Math.max(0, Math.round(armorHigh ?? 0))],
    critResistance: Number((median(critValues) ?? 0).toFixed(4)),
    critRange: [Number((critLow ?? 0).toFixed(4)), Number((critHigh ?? 0).toFixed(4))],
  };
}

const observations = await Promise.all(logDefinitions.map(loadObservation));
const byTarget = groupBy(observations, 'target');
const targetSummaries = Object.fromEntries(Object.entries(byTarget).map(([target, entries]) => [target, summarize(entries)]));
const abyssEntries = observations.filter((entry) => entry.content === '룬다 어비스 매우 어려움');
const abyssSummary = summarize(abyssEntries);
const abyssResiduals = abyssEntries.map((entry) => {
  const commonCoeff = 1 / (1 + abyssSummary.armor / 10328);
  const entryCoeff = 1 / (1 + entry.armor / 10328);
  return commonCoeff / entryCoeff - 1;
});
const maxAbyssResidual = Math.max(...abyssResiduals.map((value) => Math.abs(value)));
const abyssRangeOverlap = Math.max(...Object.values(targetSummaries)
  .filter((summary) => summary.sampleCount === 2)
  .map((summary) => summary.armorRange[0])) <= Math.min(...Object.values(targetSummaries)
  .filter((summary) => summary.sampleCount === 2)
  .map((summary) => summary.armorRange[1]));
const consolidateAbyss = abyssRangeOverlap && maxAbyssResidual <= 0.10;

const rows = observations.map((entry, index) => `| ${index + 1} | ${entry.target} | ${entry.condition} | ${formatInteger(entry.targetDps)} | ${formatInteger(entry.armorZeroDps)} | ${formatInteger(entry.armor)} | ${formatPct(entry.preResistanceCritProbability)} | ${formatPct(entry.directCritRate)} | ${formatPct(entry.rawCritResistance)} | ${formatPct(entry.unguardedShare)} | ${formatPct(entry.breakShare)} |`).join('\n');
const summaryRows = Object.entries(targetSummaries).map(([target, summary]) => `| ${target} | ${summary.sampleCount} | ${formatInteger(summary.armor)} | ${formatInteger(summary.armorRange[0])}–${formatInteger(summary.armorRange[1])} | ${formatPct(summary.critResistance)} | ${formatPct(summary.critRange[0])}–${formatPct(summary.critRange[1])} |`).join('\n');

const report = `# P2-B 로그 기반 보스 근사 보정 분석\n\n> **용도:** 이 보고서는 사용자가 제공한 9개 전투 기록을 현재 계산 코어의 입력 계약으로 다시 투입해 얻은 **근사 보정값**이다. 넥슨이 공개한 공식 방어도·치명타저항 수치가 아니며, UI와 데이터에서 반드시 \`P2-B 로그 기반 근사치\`로 표시한다.\n\n## 입력 복원과 방법\n\n각 로그의 상태창 공격력·마도저항·치명타·강타 강화·연타 강화·콤보 강화·스킬 위력·광역 강화·추가타·빠른 공격·빠른 스킬·궁극기를 현재 코어에 매핑했다. 사용자 고정 조건인 **깊어지는 어둠 최종피해 +4.7%**, 흐릿한 형상 70%, 타오르는 영광 13%를 적용했다. 전투 사이클은 사용자가 지정한 \`1342235(444)2\`, 궁극기 \`445445445\`로 고정했다.\n\n무방비 직접피해 비중은 코어의 무방비 배율에 맞춰 시간 비중으로 환산했다. 방어도 0 기준 모델 DPS와 기록 대상 DPS의 비율을 \`armor = 10,328 × (modelAtArmor0 / observed - 1)\`로 변환했다. 치명타저항은 보스 저항 전 코어 확률과 대상 직접 적중 치명률의 차이로 계산하되, 음수는 0으로 절단했다. 이는 보스 저항이 음수가 될 수 없고 전투 버프·확정 치명의 영향을 저항으로 오해하지 않기 위함이다.\n\n## 로그별 후보\n\n| 기록 | 대상 | 장비 조건 | 대상 DPS | 방어도 0 모델 DPS | 후보 방어도 | 저항 전 치명 확률 | 직접 치명률 | 후보 치명타저항 | 무방비 직접피해 | 브레이크 직접피해 |\n| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${rows}\n\n## 대상별 강건 집계\n\n부트스트랩 80% 구간은 실제 로그 표본을 고정 시드로 재표본화한 중앙값 분포의 10~90 분위다. 표본이 작으므로 범위는 정확한 통계적 신뢰구간이 아니라 **근사값의 불안정성을 보여 주는 범위**다.\n\n| 대상 | 로그 수 | 적용 후보 방어도 | 방어도 80% 범위 | 적용 후보 치명타저항 | 치명타저항 80% 범위 |\n| --- | ---: | ---: | ---: | ---: | ---: |\n${summaryRows}\n\n## 룬다 어비스 매우 어려움 공통 모델 판정\n\n룬다 어비스 3종의 공통 방어도 중앙값은 **${formatInteger(abyssSummary.armor)}**이며, 80% 범위는 **${formatInteger(abyssSummary.armorRange[0])}–${formatInteger(abyssSummary.armorRange[1])}**다. 대상별 방어도 범위의 공통 교집합은 **${abyssRangeOverlap ? '있음' : '없음'}**이며, 공통 방어도 적용 시 로그별 최대 방어계수 잔차는 **${formatPct(maxAbyssResidual)}**다.\n\n**판정: ${consolidateAbyss ? '공통 모델 채택 — 대상 선택을 룬다 어비스 매우 어려움 하나로 통합' : '공통 모델 미채택 — 세 대상 선택을 유지'}**. 통합 기준은 대상별 방어도 80% 범위 교집합과 최대 방어계수 잔차 10% 이하를 동시에 만족하는 것이다.\n\n## 적용 한계\n\n로그의 장비 제거는 공격력·치명타·마도저항·세공을 동시에 바꾸며, 실제 전투에는 버프·무방비·브레이크 차이가 있다. 그러므로 본 값은 **입력한 상태창·동일 딜사이클의 현실적인 근사 출력**을 위한 값이지, 보스의 공식 스탯을 확정하는 값이 아니다. 마도저항 요구치·초과 최종피해는 공식 안내에 따른 기존 계약을 유지하며 이 역산으로 변경하지 않는다.\n\n## References\n\n${observations.map((entry, index) => `[${index + 1}]: ${entry.reference} "${entry.target} · ${entry.condition} 공개 전투 기록"`).join('\n')}\n`;

await writeFile(reportPath, report, 'utf8');
console.log(JSON.stringify({
  targetSummaries,
  abyssSummary,
  abyssRangeOverlap,
  maxAbyssResidual,
  consolidateAbyss,
}, null, 2));
