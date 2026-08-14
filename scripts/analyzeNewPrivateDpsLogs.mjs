import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createLatestReferencePresets } from '../src/data/latestReferencePresets.js';
import { calculateDPS } from '../src/core/calculator.js';
import { calculateGemStats } from '../src/core/gemCalculator.js';
import { getTargetDefinition } from '../src/data/targets.js';
import parseSkillMarkdown from '../src/utils/skillMdParser.js';

const privateRoot = path.resolve('results/private_dps_logs');
const reportPath = path.resolve('results/new_private_log_candidate_estimates.md');
const rawSkillPath = path.resolve('results/260710_패시브_액티브_스킬목록.md');
const analysisDefinitions = [
  { analysisId: 'A-01', target: '칼드레드 · 허상의 정박지 매우 어려움', role: '스킬 로그' },
  { analysisId: 'A-02', target: '칼드레드 · 허상의 정박지 매우 어려움', role: '평타 로그' },
  { analysisId: 'A-03', target: '데스펠 · 광기의 동굴 매우 어려움', role: '스킬 로그' },
  { analysisId: 'A-04', target: '데스펠 · 광기의 동굴 매우 어려움', role: '평타 로그' },
  { analysisId: 'A-05', target: '테로사 · 흩어진 물길 매우 어려움', role: '스킬 로그' },
  { analysisId: 'A-06', target: '테로사 · 흩어진 물길 매우 어려움', role: '평타 로그' },
  { analysisId: 'A-08', target: '카브락 · 입문', role: '스킬 로그' },
  { analysisId: 'A-09', target: '카브락 · 입문', role: '평타 로그' },
];

const numeric = (value) => Number(value ?? 0);
const detailValue = (stats, label) => numeric(stats?.detail?.find((entry) => entry.label === label)?.value);
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const formatInteger = (value) => value === null || value === undefined ? '—' : Math.round(value).toLocaleString('ko-KR');
const formatPct = (value, digits = 1) => value === null || value === undefined ? '—' : `${(value * 100).toFixed(digits)}%`;

function wilsonInterval(successes, trials, z = 1.96) {
  if (trials <= 0) return [null, null];
  const estimate = successes / trials;
  const zSquared = z ** 2;
  const denominator = 1 + zSquared / trials;
  const center = (estimate + zSquared / (2 * trials)) / denominator;
  const margin = (z / denominator) * Math.sqrt((estimate * (1 - estimate) + zSquared / (4 * trials)) / trials);
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

function mapStats(record) {
  const status = record.characterStatus?.stats ?? {};
  return {
    baseAttack: numeric(status.attack),
    magicResistance: numeric(status.arcaneResistance),
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
  const directSkills = (target.skills ?? []).filter((skill) => numeric(skill.directDamage) > 0 && numeric(skill.hitCount) > 0);
  const hits = directSkills.reduce((total, skill) => total + numeric(skill.hitCount), 0);
  const crits = directSkills.reduce((total, skill) => total + numeric(skill.critCount), 0);
  const directDamage = directSkills.reduce((total, skill) => total + numeric(skill.directDamage), 0);
  const unguardedDamage = directSkills.reduce((total, skill) => total + numeric(skill.unguardedDamage), 0);
  const breakDamage = directSkills.reduce((total, skill) => total + numeric(skill.breakDamage), 0);
  const normalAttack = (target.skills ?? []).find((skill) => skill.skillName === '공격');
  const normalHits = numeric(normalAttack?.hitCount);
  const normalCrits = numeric(normalAttack?.critCount);
  const normalDirectDamage = numeric(normalAttack?.directDamage);
  return {
    hits,
    crits,
    directCritRate: hits > 0 ? crits / hits : null,
    unguardedShare: directDamage > 0 ? unguardedDamage / directDamage : 0,
    breakShare: directDamage > 0 ? breakDamage / directDamage : 0,
    normalHits,
    normalCrits,
    normalCritRate: normalHits > 0 ? normalCrits / normalHits : null,
    normalAverageDamage: normalHits > 0 ? normalDirectDamage / normalHits : null,
  };
}

function solveUnarmedTime(duration, unguardedShare, comboPower) {
  const multiplier = 1 + comboPower / 5250 + 0.45;
  const share = clamp(unguardedShare ?? 0, 0, 0.95);
  const timeShare = share / (multiplier - share * (multiplier - 1));
  return duration * clamp(timeShare, 0, 0.85);
}

function referenceRunes(reference) {
  return Object.entries(reference.selectedRunes).flatMap(([type, runes]) => (runes ?? [])
    .filter(Boolean)
    .map((rune, index) => ({
      ...rune,
      stats: rune.stats ?? {},
      transcendLevel: reference.transcendLevels[type]?.[index] ?? 0,
    })));
}

function calculateArmorZeroDps({ definition, target, stats, parsedSkills, gemResult, runes }) {
  const duration = numeric(target.duration);
  const direct = directObservation(target);
  const unarmedTime = solveUnarmedTime(duration, direct.unguardedShare, stats.comboPower);
  const ultimateTime = duration * 0.25;
  const ordinaryTime = Math.max(0, duration - unarmedTime - ultimateTime);
  const result = calculateDPS(
    { ...stats, extraAllStat: gemResult.extraAllStat, extraFinalDmgPct: gemResult.extraFinalDmgPct },
    runes,
    {
      boss: definition.target,
      ordinaryTime,
      unarmedTime,
      ultimateTime,
      gimmickDmgPct: 0,
      healerDmgPct: 0,
      skillDebuffDmgPct: 10,
      hasSpdBuff: false,
    },
    {
      ordinary: '1-1 3 4 2-2 2 3 5 (444) 2',
      ordinaryBreak: '1-1 3 4 2-2 2 3 5 (444) 2',
      ultimate: '445 (반복)',
      ultimateBreak: '445 (반복)',
    },
    { '흐릿한 형상': 70, '타오르는 영광': 13 },
    gemResult.gemStats,
    { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
    {},
    parsedSkills,
  );
  const appliedArmor = getTargetDefinition(definition.target)?.armor ?? 30;
  return result.weightedDps / (1 / (1 + appliedArmor / 10328));
}

const manifest = JSON.parse(await readFile(path.join(privateRoot, 'manifest.local.json'), 'utf8'));
const recordById = new Map();
for (const entry of manifest.records ?? []) {
  const outer = JSON.parse(await readFile(path.join(privateRoot, 'sources', `${entry.analysisId}.json`), 'utf8'));
  recordById.set(entry.analysisId, JSON.parse(outer.recordJson));
}

const parsedSkills = parseSkillMarkdown(await readFile(rawSkillPath, 'utf8'));
const reference = createLatestReferencePresets()[2].data;
const gemResult = calculateGemStats(reference.gems);
const runes = referenceRunes(reference);

const entries = analysisDefinitions.map((definition) => {
  const record = recordById.get(definition.analysisId);
  if (!record) throw new Error(`Missing private record for ${definition.analysisId}`);
  const target = record.targets?.find((entry) => entry.targetId === record.targetId) ?? record.targets?.[0];
  if (!target) throw new Error(`Missing primary target for ${definition.analysisId}`);
  const stats = mapStats(record);
  const direct = directObservation(target);
  const observedDps = numeric(target.dps);
  const armorZeroDps = definition.role === '스킬 로그'
    ? calculateArmorZeroDps({ definition, target, stats, parsedSkills, gemResult, runes })
    : null;
  const candidateArmor = armorZeroDps === null
    ? null
    : Math.max(0, 10328 * (armorZeroDps / observedDps - 1));
  const provisionalResult = calculateDPS(
    { ...stats, extraAllStat: gemResult.extraAllStat, extraFinalDmgPct: gemResult.extraFinalDmgPct },
    runes,
    { boss: definition.target, ordinaryTime: 1, unarmedTime: 0, ultimateTime: 0 },
    { ordinary: '1', ordinaryBreak: '1', ultimate: '1', ultimateBreak: '1' },
    { '흐릿한 형상': 70, '타오르는 영광': 13 },
    gemResult.gemStats,
    { skill_1: '순정', skill_2: '전진', skill_3: '순정', skill_4: '승천', skill_5: '강격' },
    {},
    parsedSkills,
  );
  const [critRateLow, critRateHigh] = wilsonInterval(direct.normalCrits, direct.normalHits);
  const expectedCritRate = definition.role === '평타 로그' ? provisionalResult.critProb / 100 : null;
  const candidateCritResistance = expectedCritRate === null
    ? null
    : Math.max(0, expectedCritRate - (direct.normalCritRate ?? expectedCritRate));
  const candidateCritRange = expectedCritRate === null
    ? [null, null]
    : [
      Math.max(0, expectedCritRate - (critRateHigh ?? expectedCritRate)),
      Math.max(0, expectedCritRate - (critRateLow ?? expectedCritRate)),
    ];
  return {
    ...definition,
    targetName: target.monsterName,
    targetTemplateId: target.targetTemplateId,
    maxHp: numeric(target.maxHp),
    observedDps,
    armorZeroDps,
    candidateArmor,
    expectedCritRate,
    candidateCritResistance,
    candidateCritRange,
    ...direct,
  };
});

const soloByTarget = Object.groupBy(entries, (entry) => entry.target);
const comparisonRows = Object.entries(soloByTarget).map(([target, targetEntries]) => {
  const skill = targetEntries.find((entry) => entry.role === '스킬 로그');
  const auto = targetEntries.find((entry) => entry.role === '평타 로그');
  const legacy = getTargetDefinition(target);
  return {
    target,
    soloArmorCandidate: skill?.candidateArmor ?? null,
    legacyArmor: legacy?.armor ?? null,
    armorDifference: skill && legacy ? skill.candidateArmor - legacy.armor : null,
    soloCritCandidate: auto?.candidateCritResistance ?? null,
    soloCritRange: auto?.candidateCritRange ?? [null, null],
    legacyCrit: legacy?.critResistance ?? null,
    normalAverageDamage: auto?.normalAverageDamage ?? null,
    normalCritRate: auto?.normalCritRate ?? null,
    normalHits: auto?.normalHits ?? 0,
    reason: '각 대상별 평타·스킬 로그가 각 1건뿐이고 스킬·평타 로그는 방어도와 치명타저항을 독립적으로 교차 검증하지 못하므로 후보값을 적용하지 않음',
  };
});

const detailRows = entries.map((entry) => `| ${entry.analysisId} | ${entry.targetName} | ${entry.role} | ${formatInteger(entry.observedDps)} | ${formatInteger(entry.armorZeroDps)} | ${formatInteger(entry.candidateArmor)} | ${formatInteger(entry.normalHits)} | ${formatPct(entry.normalCritRate)} | ${formatInteger(entry.normalAverageDamage)} | ${formatPct(entry.expectedCritRate)} | ${formatPct(entry.candidateCritResistance)} | ${formatPct(entry.candidateCritRange[0])}–${formatPct(entry.candidateCritRange[1])} |`).join('\n');
const comparisonMarkdown = comparisonRows.map((entry) => `| ${entry.target} | ${formatInteger(entry.soloArmorCandidate)} | ${formatInteger(entry.legacyArmor)} | ${formatInteger(entry.armorDifference)} | ${formatPct(entry.soloCritCandidate)} | ${formatPct(entry.soloCritRange[0])}–${formatPct(entry.soloCritRange[1])} | ${formatPct(entry.legacyCrit)} | ${formatInteger(entry.normalAverageDamage)} | ${formatPct(entry.normalCritRate)} (${formatInteger(entry.normalHits)}타) |`).join('\n');

const report = `# 신규 1인 DPS 로그 기반 대상 보정 후보 분석\n\n> **판정:** 이 분석은 혼자하기 1인 기록의 방어도·치명타저항 **후보값**을 계산하되, 대상별 독립 반복이 1회뿐이고 평타·스킬 로그가 서로 다른 피해 구조를 가지므로 어느 후보도 제품 데이터에 채택하지 않는다. 현행 대상 데이터의 함께하기 기반 P2-B 근사치는 유지한다.\n\n## 데이터 범위와 확인 상태\n\n신규 기록은 비식별 ID ‘A-01’부터 ‘A-09’로만 관리했다. 원본 URL과 원시 응답은 버전 관리 대상이 아니며, 이 보고서는 저장소에 보관 가능한 파생 수치만 사용한다. 신규 9건의 요약·장비·세공·프리즘·인챈트·증폭 값은 실제 렌더링 화면으로 대조했다. 모든 신규 기록은 공격력 55,786, 마도저항 4,540, 치명타 9,483, 강타 강화 3,830을 공통으로 보고했으나, 기존 함께하기 기록과는 강타 강화와 일부 세부 능력치가 일치하지 않는다.\n\n| 분석 범위 | 입력 출처 | 실제 렌더링 대조 | 확인 시점 | 원본 주소 처리 | 누락·불일치 |\n| --- | --- | --- | --- | --- | --- |\n| 신규 A-01~A-09 | 구조화 로그의 SHA-256 검증 파생값 | 요약·장비·세공·프리즘·인챈트·증폭 전수 | 2026-08-14 GMT+9 | 로컬 매니페스트에만 보관, Git 제외 | 보스별 독립 반복 1회뿐 |\n| 기존 LEGACY-A01~A04 | 구조화 로그 + 실제 렌더링 측정 스펙 | 요약·장비·세공·프리즘·인챈트·증폭 전수 | 2026-08-14 GMT+9 | 저장소 미보관 | 신규와 강타 강화·세공·프리즘·인챈트·증폭 등이 완전 동일하지 않음 |\n| 기존 LEGACY-A05~A09 | 구조화 로그 파생값 | 이번 분석에서 추가 화면 대조 없음 | 2026-08-14 GMT+9 | 저장소 미보관 | 이번 혼자하기 후보 채택의 직접 근거에서 제외 |\n\n카브락 ‘A-07’은 잡몹방을 포함하므로 보스룸 보정 후보에서 제외했고, 보스룸 전용 ‘A-08’만 사용했다. 평타 로그는 정확히 ‘공격’ 스킬명으로 집계되는 직접피해만 치명타 관측에 사용했으며, 특수 피해와 도트는 평타 기본피해·치명타저항 추정에서 제외했다.\n\n## 계산 방법과 제약\n\n방어도 후보는 현재 계산 코어에 기록별 상태창 수치와 사용자 고정 조건(깊어지는 어둠 최종피해 +4.7%, 흐릿한 형상 70%, 타오르는 영광 13%, 전승강 딜사이클)을 투입해 방어도 0 기준의 모델 DPS를 만들고, ‘10,328 × (모델 DPS / 관측 DPS - 1)’로 환산했다. 다만 세공의 정확한 수치, 보석 옵션·등급, 전투 중 실제 버프와 무방비·브레이크 시간은 상태창 및 집계 로그만으로 완전히 재구성할 수 없으므로, 이 값은 보스 고유 방어도의 확정값이 아니다.\n\n치명타저항 후보는 동일한 평타 로그에서 엔진의 저항 전 치명 확률과 ‘공격’ 직접피해의 관측 치명률 차이를 0 미만 절단해 계산했다. 괄호의 95% Wilson 구간은 **적중 표본에 따른 관측 치명률의 불확실성**만 표현하며, 스킬·버프·공격 타수 모델 오차는 포함하지 않는다. 따라서 통계 구간을 보스 스탯의 신뢰구간으로 해석하면 안 된다.\n\n## 로그별 후보\n\n| 기록 | 보스 | 용도 | 관측 DPS | 방어도 0 모델 DPS | 방어도 후보 | 평타 직접 적중 | 평타 치명률 | 평타 평균 직접피해 | 저항 전 치명확률 | 치명타저항 후보 | 치명타저항 관측 구간 |\n| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${detailRows}\n\n## 혼자하기 후보와 현행 함께하기 근사치 비교\n\n| 대상 | 1인 방어도 후보 | 현행 함께하기 근사치 | 후보 차이 | 1인 치명타저항 후보 | 평타 표본 구간 | 현행 치명타저항 | 평타 평균 직접피해 | 평타 치명률 |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${comparisonMarkdown}\n\n## 채택 판정\n\n혼자하기와 함께하기는 대상 최대 체력 및 대상 템플릿 ID가 달라 서로 다른 인스턴스임이 확인됐지만, 현 로그만으로 방어도·치명타저항도 다르다고 **확정할 수는 없다**. 이유는 다음과 같다. 첫째, 각 보스의 보스룸 평타 로그와 스킬 로그는 각각 1건뿐이다. 둘째, 방어도 후보는 스킬 로그의 모델 재구성 오차와 무방비·브레이크 시간을 포함한다. 셋째, 치명타저항 후보는 평타 113~129타의 단일 표본이며, 평타 이외 자동 특수피해와 조건부 효과를 분리해야 한다. 넷째, 기존 함께하기 기록은 신규 1인 기록과 장비 제거·세공·프리즘·인챈트·증폭·강타 강화의 상태가 완전히 동일하지 않다.\n\n따라서 **현행 대상 데이터는 변경하지 않고**, 혼자하기 전용 대상 분리도 보류한다. 이 판단은 차이가 없다는 결론이 아니라, 차이를 정직하게 식별할 충분한 통제 반복이 아직 없다는 결론이다. 어비스 잡몹방은 평타 대조 기록이 없으므로 보스룸과의 방어도·치명타저항 차이도 **미확정**으로 유지한다.\n\n## 다음 검증 조건\n\n각 대상·모드별로 동일한 상태창, 동일 딜사이클, 동일 무방비·브레이크 관리 조건에서 평타 2회 이상과 스킬 2회 이상을 확보해야 한다. 치명타 수치만 의도적으로 바꾼 추가 대조군이 있으면 치명타저항 후보를 별도로 교차 검증할 수 있다. 이 조건을 만족한 뒤 대상별 중앙값·불확실성·모드 차이를 다시 산출하며, 혼자하기와 함께하기의 차이가 재현되면 사용자 승인 후에만 전용 대상 데이터와 UI 분리를 적용한다.\n`;

await writeFile(reportPath, report, 'utf8');
console.log(JSON.stringify({
  reportPath,
  adoption: 'defer',
  comparisons: comparisonRows,
}, null, 2));
