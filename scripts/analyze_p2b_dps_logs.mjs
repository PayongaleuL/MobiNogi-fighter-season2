import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const logsDirectory = path.resolve('results/p2b_raw_logs');
const reportPath = path.resolve('results/p2b_inverse_analysis.md');

const logDefinitions = [
  { file: 'anchorage_full.json', location: '허상의 정박지 매우 어려움', condition: '잊힌 맹약 장착', group: 'anchorage', analysisId: 'LEGACY-A01' },
  { file: 'anchorage_without_head.json', location: '허상의 정박지 매우 어려움', condition: '머리·잊힌 맹약 제거', group: 'anchorage', analysisId: 'LEGACY-A02' },
  { file: 'cave_full.json', location: '광기의 동굴 매우 어려움', condition: '잊힌 맹약 장착', group: 'cave', analysisId: 'LEGACY-A03' },
  { file: 'cave_without_head.json', location: '광기의 동굴 매우 어려움', condition: '머리·잊힌 맹약 제거', group: 'cave', analysisId: 'LEGACY-A04' },
  { file: 'waterway_full.json', location: '흩어진 물길 매우 어려움', condition: '잊힌 맹약 장착', group: 'waterway', analysisId: 'LEGACY-A05' },
  { file: 'waterway_without_head.json', location: '흩어진 물길 매우 어려움', condition: '머리·잊힌 맹약 제거', group: 'waterway', analysisId: 'LEGACY-A06' },
  { file: 'kabrak_full_1.json', location: '카브락 입문', condition: '잊힌 맹약 장착', group: 'kabrak', analysisId: 'LEGACY-A07' },
  { file: 'kabrak_full_2.json', location: '카브락 입문', condition: '잊힌 맹약 장착', group: 'kabrak', analysisId: 'LEGACY-A08' },
  { file: 'kabrak_without_head.json', location: '카브락 입문', condition: '머리·잊힌 맹약 제거', group: 'kabrak', analysisId: 'LEGACY-A09' },
];

const groupOrder = ['anchorage', 'cave', 'waterway', 'kabrak'];
const groupLabels = {
  anchorage: '허상의 정박지 매우 어려움',
  cave: '광기의 동굴 매우 어려움',
  waterway: '흩어진 물길 매우 어려움',
  kabrak: '카브락 입문',
};

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sum(numbers) {
  return numbers.reduce((total, value) => total + value, 0);
}

function mean(numbers) {
  return numbers.length === 0 ? null : sum(numbers) / numbers.length;
}

function sampleStandardDeviation(numbers) {
  if (numbers.length < 2) return null;
  const average = mean(numbers);
  return Math.sqrt(sum(numbers.map((value) => (value - average) ** 2)) / (numbers.length - 1));
}

function formatInteger(value) {
  return value === null || value === undefined ? '—' : Math.round(value).toLocaleString('ko-KR');
}

function formatDecimal(value, digits = 3) {
  return value === null || value === undefined ? '—' : Number(value).toFixed(digits);
}

function formatPercent(value, digits = 1) {
  return value === null || value === undefined ? '—' : `${(value * 100).toFixed(digits)}%`;
}

function escapeTable(value) {
  return String(value ?? '—').replaceAll('|', '\\|');
}

function selectPrimaryTarget(record) {
  const targets = Array.isArray(record.targets) ? record.targets : [];
  return targets.find((target) => target.targetId === record.targetId)
    ?? targets.find((target) => target.monsterName === record.targetName)
    ?? null;
}

function getDetailStat(stats, label) {
  const item = Array.isArray(stats?.detail) ? stats.detail.find((entry) => entry.label === label) : null;
  return numberOrNull(item?.value);
}

function getTargetDamageBreakdown(target) {
  const skills = Array.isArray(target?.skills) ? target.skills : [];
  const directSkills = skills.filter((skill) => numberOrNull(skill.directDamage) > 0);
  const directDamage = sum(directSkills.map((skill) => numberOrNull(skill.directDamage) ?? 0));
  const directHits = sum(directSkills.map((skill) => numberOrNull(skill.hitCount) ?? 0));
  const directCrits = sum(directSkills.map((skill) => numberOrNull(skill.critCount) ?? 0));
  const unguardedDamage = sum(directSkills.map((skill) => numberOrNull(skill.unguardedDamage) ?? 0));
  const breakDamage = sum(directSkills.map((skill) => numberOrNull(skill.breakDamage) ?? 0));

  return {
    directDamage,
    directHits,
    directCrits,
    directCritRate: directHits > 0 ? directCrits / directHits : null,
    directDamagePerRecordedHit: directHits > 0 ? directDamage / directHits : null,
    unguardedDamage,
    unguardedShare: directDamage > 0 ? unguardedDamage / directDamage : null,
    breakDamage,
    breakShare: directDamage > 0 ? breakDamage / directDamage : null,
  };
}

async function loadObservation(definition) {
  const outer = JSON.parse(await readFile(path.join(logsDirectory, definition.file), 'utf8'));
  const record = JSON.parse(outer.recordJson);
  const target = selectPrimaryTarget(record);
  if (!target) {
    throw new Error(`${definition.file}: record.targetId에 해당하는 대상 데이터를 찾지 못했습니다.`);
  }

  const stats = record.characterStatus?.stats ?? {};
  const targetDps = numberOrNull(target.dps);
  const targetDamage = numberOrNull(target.totalDamage);
  const targetDuration = numberOrNull(target.duration);
  if (targetDps === null || targetDamage === null || targetDuration === null) {
    throw new Error(`${definition.file}: 대상 DPS·피해·시간 중 하나가 누락되었습니다.`);
  }

  const breakdown = getTargetDamageBreakdown(target);
  return {
    ...definition,
    monster: target.monsterName ?? record.targetName ?? '미상',
    targetTemplateId: target.targetTemplateId ?? null,
    attack: numberOrNull(stats.attack),
    arcaneResistance: numberOrNull(stats.arcaneResistance),
    critScore: getDetailStat(stats, '치명타'),
    targetDps,
    targetDamage,
    targetDuration,
    targetHitCount: numberOrNull(target.hitCount),
    targetCritCount: numberOrNull(target.critCount),
    targetCritRate: numberOrNull(target.critRate) === null ? null : numberOrNull(target.critRate) / 100,
    castBuffCount: Array.isArray(record.buffs?.castBuffs) ? record.buffs.castBuffs.length : 0,
    unguardedWindowCount: Array.isArray(record.unguardedWindows) ? record.unguardedWindows.length : 0,
    breakWindowCount: Array.isArray(record.breakWindows) ? record.breakWindows.length : 0,
    ...breakdown,
  };
}

function summarizeCondition(observations, condition) {
  const entries = observations.filter((entry) => entry.condition === condition);
  const dpsValues = entries.map((entry) => entry.targetDps);
  return {
    count: entries.length,
    dps: mean(dpsValues),
    dpsSd: sampleStandardDeviation(dpsValues),
    attack: mean(entries.map((entry) => entry.attack).filter((value) => value !== null)),
    arcaneResistance: mean(entries.map((entry) => entry.arcaneResistance).filter((value) => value !== null)),
    critScore: mean(entries.map((entry) => entry.critScore).filter((value) => value !== null)),
  };
}

function comparePair(group, observations) {
  const full = summarizeCondition(observations, '잊힌 맹약 장착');
  const withoutHead = summarizeCondition(observations, '머리·잊힌 맹약 제거');
  const dpsRatio = full.dps && withoutHead.dps ? full.dps / withoutHead.dps : null;
  const attackRatio = full.attack && withoutHead.attack ? full.attack / withoutHead.attack : null;
  const attackNormalizedFactor = dpsRatio && attackRatio ? dpsRatio / attackRatio : null;
  const canAdopt = full.count >= 2 && withoutHead.count >= 2;

  return {
    group,
    location: groupLabels[group],
    full,
    withoutHead,
    dpsRatio,
    attackRatio,
    attackNormalizedFactor,
    canAdopt,
    decision: canAdopt
      ? '추가 모델 검증 필요'
      : '미채택: 두 장비 조건 모두에서 독립 반복 측정 2회 이상이 아님',
  };
}

function buildReport(observations, comparisons) {
  const observationRows = observations.map((entry, index) => [
    `[${index + 1}]`,
    escapeTable(entry.location),
    escapeTable(entry.monster),
    escapeTable(entry.condition),
    formatInteger(entry.attack),
    formatInteger(entry.arcaneResistance),
    formatInteger(entry.critScore),
    formatInteger(entry.targetDps),
    `${formatInteger(entry.targetDuration)}초`,
    formatPercent(entry.targetCritRate),
    formatPercent(entry.unguardedShare),
    formatPercent(entry.breakShare),
  ].join(' | '));

  const comparisonRows = comparisons.map((comparison) => [
    escapeTable(comparison.location),
    `${comparison.full.count} / ${comparison.withoutHead.count}`,
    formatInteger(comparison.full.dps),
    formatInteger(comparison.withoutHead.dps),
    formatDecimal(comparison.attackRatio),
    formatDecimal(comparison.dpsRatio),
    formatDecimal(comparison.attackNormalizedFactor),
    escapeTable(comparison.decision),
  ].join(' | '));

  const kabrak = comparisons.find((comparison) => comparison.group === 'kabrak');
  const kabrakFullCi = kabrak?.full.count === 2 && kabrak.full.dpsSd !== null
    ? 12.706 * kabrak.full.dpsSd / Math.sqrt(kabrak.full.count)
    : null;

  const sourceRows = observations.map((entry) => entry.analysisId).join(', ');

  return `# P2-B 실전 DPS 로그 역산 분석\n\n> **결론: 이 9개 로그만으로는 현행 4개 대상의 방어도와 치명타저항을 수치로 식별할 수 없으므로, 계산기 대상 데이터에 추정값을 채택하지 않는다.** 동일 대상이라도 장비 조건별 독립 반복이 부족하고, 실제 전투의 대상 유지 시간·무방비·브레이크·버프·스킬 구성 변화가 방어도 상수와 분리되지 않는다.\n\n## 목적과 보존 원칙\n\n본 분석은 사용자가 제공한 공개 전투 기록 9개에서 **대상 구간**의 상태창·피해·적중·무방비·브레이크 관측치를 재현 가능하게 추출한다. 원본 JSON에는 개인 전투 상세와 장비 정보가 포함되므로 results/p2b_raw_logs/는 버전 관리에서 제외한다. 이 보고서와 scripts/analyze_p2b_dps_logs.mjs만 커밋 가능한 파생 산출물이다.\n\n분석에는 사용자 지정 고정 조건인 시즌 스킬 **깊어지는 어둠 최종피해 +4.7%**를 해석 전제로 두되, 공개 기록에 계산기 입력 튜플(세공 집계, 조건부 가동률, 궁극/평상시 시간 비중, 파티 버프 적용 시점)이 완전하게 보존되지 않으므로 이를 임의로 복원하지 않는다.\n\n## 관측값 추출\n\n각 기록에서 record.targetId와 동일한 대상 항목을 선택하고, 그 대상의 DPS·피해·지속시간·치명타 비율 및 직접피해 기준 무방비/브레이크 비중을 추출했다. 이 방식은 잡몹·다른 대상 구간을 전체 DPS에 섞지 않는다.\n\n| 기록 | 콘텐츠 | 대상 | 장비 조건 | 공격력 | 마도저항 | 치명타 | 대상 DPS | 대상 시간 | 대상 치명타율 | 직접피해 중 무방비 | 직접피해 중 브레이크 |\n| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n| ${observationRows.join(' |\n| ')} |\n\n## 장비 제거 쌍 비교\n\n아래의 **공격력 정규화 계수**는 대상 DPS 비율 ÷ 상태창 공격력 비율이라는 기술적 비교치일 뿐, 방어도·치명타저항 추정값이 아니다. 머리 제거는 잊힌 맹약 외에도 장비·세공·프리즘·인챈트·증폭 효과를 동시에 변경하며, 각 로그의 실제 전투 조건도 일치하지 않는다. 따라서 이 계수가 1에서 벗어난 크기를 대상 방어도나 치명타저항으로 해석하면 안 된다.\n\n| 콘텐츠 | 장착 / 제거 반복 수 | 장착 평균 대상 DPS | 제거 평균 대상 DPS | 공격력 비율 | DPS 비율 | 공격력 정규화 계수 | 채택 판정 |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |\n| ${comparisonRows.join(' |\n| ')} |\n\n카브락의 장착 기록 2건은 평균 ${formatInteger(kabrak?.full.dps)} DPS이며, 표본 표준편차는 ${formatInteger(kabrak?.full.dpsSd)} DPS이다. 표본 2건의 95% t-구간 반폭은 ${formatInteger(kabrakFullCi)} DPS로 매우 넓다. 더구나 제거 조건에는 1건만 있으므로 **조건 간 차이의 신뢰구간은 산출하지 않는다**. 나머지 세 대상은 각 장비 조건이 1건뿐이어서 조건 간 추정 오차 자체를 계산할 수 없다.\n\n## 식별 가능성 판정\n\n| 추정 대상 | 필요한 독립 정보 | 현재 로그의 한계 | 판정 |\n| --- | --- | --- | --- |\n| 방어도 | 동일한 사전방어 피해 모델 또는 동일 세팅·동일 사이클의 반복 실험 | 로그는 실제 전투의 버프·대상 유지·무방비·스킬 분포가 달라, 방어 계수와 전투별 배율을 분리할 수 없음 | **미확정** |\n| 치명타저항 | 치명타 수치/치명 확률만 달라진 대조군과 스킬별 치명 판정 모수 | 머리 제거는 공격력·마도저항·치명타·장비 옵션을 함께 변경하며, 집계 치명타율은 조건부 버프와 스킬 구성의 혼합값임 | **미확정** |\n| 마도저항 초과 보정 | 대상별 공식 필요 마도저항과 초과분의 공식 계수 | 본 로그는 장비 마도저항 차이를 제공하지만, 대상 공식 요구치와 독립적인 초과분 대조군은 아님 | **역산값 미채택, 공식 근거만 사용** |\n\n따라서 P2-C 구현에서는 기존의 시즌2 미출시 대상 및 하드코딩 방어도·치명타저항을 현행 대상의 사실로 표기하거나 재사용하지 않는다. 방어도·치명타저항은 명시적으로 **미확정(보정 미적용)** 상태로 노출해야 하며, 공식 확인이 가능한 대상 필요 마도저항과 초과 보정만 별도 데이터 계약으로 적용한다.\n\n## 재현 방법\n\n프로젝트 루트에서 개인 원본 로그를 results/p2b_raw_logs/에 둔 뒤 아래 명령을 실행한다. 원본 파일이 없으면 스크립트는 실패하며, 임의의 대체값을 만들지 않는다.\n\n    node scripts/analyze_p2b_dps_logs.mjs\n\n## 비식별 데이터 출처\n\n원본 기록 URL과 원시 응답은 저장소에 보관하지 않는다. 이 보고서는 ${sourceRows}의 비식별 분석 ID로 관리한 파생 관측값을 사용한다.\n`;
}

const observations = await Promise.all(logDefinitions.map(loadObservation));
const comparisons = groupOrder.map((group) => comparePair(group, observations.filter((entry) => entry.group === group)));
await writeFile(reportPath, buildReport(observations, comparisons), 'utf8');
console.log(`P2-B 역산 보고서를 생성했습니다: ${path.relative(process.cwd(), reportPath)}`);
