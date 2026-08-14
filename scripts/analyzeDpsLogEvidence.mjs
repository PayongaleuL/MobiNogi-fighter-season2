import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const privateCacheDir = path.join(root, 'results', 'private_dps_log_cache');
const comparisonPath = path.join(privateCacheDir, 'context_comparison.json');
const indexPath = path.join(privateCacheDir, 'record_index.json');
const outputPath = path.join(root, 'results', 'dps_log_evidence_reassessment.md');

const TARGETS = [
  {
    dungeon: '허상의 정박지 · 매우 어려움',
    boss: '칼드레드',
    legacyIds: ['LEGACY-anchorage_full', 'LEGACY-anchorage_without_head'],
    skillId: 'A-01',
    normalId: 'A-02',
  },
  {
    dungeon: '광기의 동굴 · 매우 어려움',
    boss: '데스펠',
    legacyIds: ['LEGACY-cave_full', 'LEGACY-cave_without_head'],
    skillId: 'A-03',
    normalId: 'A-04',
  },
  {
    dungeon: '흩어진 물길 · 매우 어려움',
    boss: '테로사',
    legacyIds: ['LEGACY-waterway_full', 'LEGACY-waterway_without_head'],
    skillId: 'A-05',
    normalId: 'A-06',
  },
  {
    dungeon: '카브락 레이드 · 입문',
    boss: '카브락',
    legacyIds: ['LEGACY-kabrak_full_1', 'LEGACY-kabrak_full_2', 'LEGACY-kabrak_without_head'],
    skillId: 'A-08',
    normalId: 'A-09',
    excludedId: 'A-07',
  },
];

function readJsonOrFail(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`비공개 파생 캐시가 없습니다: ${path.relative(root, filePath)}. 원본 URL·응답을 저장소에 넣지 말고, 로컬 수집·파생 절차를 먼저 실행하세요.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function quote(value) {
  return String(value).replaceAll('|', '\\|');
}

function recordsById(records) {
  return new Map(records.map((record) => [record.analysisId, record]));
}

function primarySkill(indexRecord, skillName) {
  return indexRecord?.primaryTarget?.skills?.find((skill) => skill.skillName === skillName) ?? null;
}

function writeReport(comparison, index) {
  const byComparisonId = recordsById(comparison.records);
  const byIndexId = recordsById(index.records);
  const legacyCount = comparison.records.filter((record) => record.sourceSet === 'legacy').length;
  const newCount = comparison.records.filter((record) => record.sourceSet === 'new').length;
  const trainingCount = 5;
  const totalCount = trainingCount + legacyCount + newCount;

  const targetRows = TARGETS.map((target) => {
    const legacyRecords = target.legacyIds.map((id) => byComparisonId.get(id)).filter(Boolean);
    const skillRecord = byComparisonId.get(target.skillId);
    const normalRecord = byComparisonId.get(target.normalId);
    const normalSkill = primarySkill(byIndexId.get(target.normalId), '공격');
    const templateIds = new Set([
      ...legacyRecords.map((record) => record.targetTemplateId),
      skillRecord?.targetTemplateId,
      normalRecord?.targetTemplateId,
    ].filter(Boolean));

    return {
      ...target,
      legacyRecords,
      skillRecord,
      normalRecord,
      normalSkill,
      templateIdCount: templateIds.size,
      armorCandidateInputs: legacyRecords.length + (skillRecord ? 1 : 0),
      critCandidateInputs: normalSkill ? 1 : 0,
      normalHits: normalSkill?.hitCount ?? 0,
      normalCrits: normalSkill?.critCount ?? 0,
    };
  });

  const lines = [
    '# DPS 로그 증거력 재평가',
    '',
    `- 생성 시점: ${new Date().toISOString()}`,
    '- 원본 기록 주소·URL 매핑·원시 응답은 이 보고서와 저장소에 포함하지 않는다.',
    '- 입력 출처: 비식별 파생 캐시 `context_comparison.json`, `record_index.json`, 기존 P2-B 분석 문서, 참조 허수아비 프리셋.',
    '',
    '## 결론',
    '',
    `확인 가능한 기록은 **총 ${totalCount}건**(함선 허수아비 ${trainingCount}건, 기존 함께하기 ${legacyCount}건, 신규 혼자하기 ${newCount}건)이다. 이 수는 계산기 검증과 후보 범위 파악의 근거를 분명히 강화한다. 그러나 보스 방어도·치명타저항을 하나의 수치로 식별하는 데 사용할 수 있는 통제된 독립 반복은 대상별 0건이다. 따라서 현행 P2-B 보정의 신뢰도는 **낮음**으로 유지하며, 혼자하기·함께하기 전용 보정은 만들지 않고 후보값도 계산기에 채택하지 않는다.`,
    '',
    '> 기록 수는 신뢰도를 자동으로 높이지 않는다. 같은 대상·난이도에서 상태창, 장비, 세공, 프리즘, 인챈트, 증폭, 마도저항, 딜사이클, 무방비·브레이크 조건이 대조된 반복만 방어도 또는 치명타저항의 독립 식별 표본으로 센다.',
    '',
    '## 전체 자료군 분류',
    '',
    '| 자료군 | 기록 수 | 방어도 기여 | 치명타저항 기여 | 독립 표본 여부 | 판정 |',
    '| --- | ---: | --- | --- | --- | --- |',
    `| 함선 허수아비 참조 | ${trainingCount} | 보스 보정에는 없음 | 보스 보정에는 없음 | 해당 없음 | 계산 엔진·참조 DPS 회귀용 |`,
    `| 기존 함께하기 | ${legacyCount} | 대상별 복합 장비 변화 후보 | 평타 대조 없음 | 아니오 | P2-B 후보 범위 보강 |`,
    `| 신규 혼자하기 스킬 | 4 | 보스별 대상 구간 후보 | 직접 근거 아님 | 아니오, 각 보스 1회 | 후보 범위 보강 |`,
    `| 신규 혼자하기 평타 | 4 | 직접 근거 아님 | 보스별 평타 치명률 후보 | 아니오, 각 보스 1회 | 치명타저항 후보·구간 산출 |`,
    '| 신규 카브락 잡몹방 포함 | 1 | 보스룸 값에 사용 안 함 | 보스룸 값에 사용 안 함 | 아니오 | 제외 |',
    '',
    '## 대상별 유효성 판정',
    '',
    '| 던전·난이도 | 기존 함께하기 보조 기록 | 신규 스킬 후보 | 신규 평타 후보 | 평타 직접 적중 | 독립 방어도 반복 | 독립 치명저항 반복 | 대상 템플릿 수 | 판정 |',
    '| --- | ---: | --- | --- | ---: | ---: | ---: | ---: | --- |',
  ];

  for (const row of targetRows) {
    lines.push(`| ${quote(row.dungeon)} | ${row.legacyRecords.length} | ${row.skillRecord ? `\`${row.skillId}\`` : '—'} | ${row.normalRecord ? `\`${row.normalId}\`` : '—'} | ${row.normalHits} (${row.normalCrits} 치명) | 0 | 0 | ${row.templateIdCount} | 후보는 존재하나 현행 적용값 유지 |`);
  }

  lines.push(
    '',
    '## 왜 20건 이상을 그대로 합산하지 않는가',
    '',
    '기존 함께하기 기록은 머리 장비 제거 과정에서 공격력, 마도저항, 치명타, 세공, 프리즘, 인챈트, 증폭이 동시에 바뀌었다. 따라서 두 기록의 DPS 차이를 방어도 하나의 변화로 해석할 수 없다. 신규 혼자하기 기록은 보스별로 스킬 로그와 평타 로그를 하나씩 제공해 서로 다른 역할을 수행한다. 스킬 로그는 방어도 후보를, 평타 로그는 치명타저항 후보를 보강하지만, 같은 조건의 두 번째 반복이 없으므로 표본 오차와 전투 변수를 분리할 수 없다.',
    '',
    '또한 기존 함께하기와 신규 혼자하기에서는 최대 체력과 대상 템플릿 ID가 서로 다르다. 이는 서로 다른 인스턴스일 가능성을 뒷받침하지만, 사용자의 요구대로 이를 별도 보정 데이터로 분리하지 않는다. 이 차이는 공통 난이도 보정값의 일관성 검사에만 사용한다.',
    '',
    '## 6개 측정 스펙 탭의 증거 등급',
    '',
    '| 자료 | 요약·장비·세공·프리즘·인챈트·증폭 확인 | 이 재평가에서의 역할 |',
    '| --- | --- | --- |',
    '| 신규 A-01~A-09 | 실제 렌더링 탭 대조 완료 | 후보 분석에 사용 |',
    '| 기존 LEGACY-A01~A04 | 실제 렌더링 탭 대조 완료 | P2-B 보조 근거로 사용 |',
    '| 기존 LEGACY-A05~A09 | 구조화 파생값만 보유 | 고신뢰도 상향 판단에서는 제외, 기존 후보 범위 참고용 |',
    '',
    '## 현재 데이터 계약',
    '',
    '계산기는 기존 함께하기 로그에서 나온 P2-B 근사치를 계속 사용한다. 이 값은 공식 공개 스탯이 아니며 낮은 신뢰도라는 상태를 UI와 문서에 유지한다. 혼자하기 후보는 공통 난이도 보정과 얼마나 일관적인지 확인하는 보조 근거로만 보존한다.',
    '',
    '다음 단계에서 신뢰도를 올리려면 대상별로 동일 난이도·동일 상태창·동일 장비/세공/프리즘/인챈트/증폭·동일 딜사이클·동일 무방비/브레이크 운영을 유지한 반복 기록이 최소 2건 필요하다. 치명타저항은 같은 조건의 평타 기록을 대상별 2건 이상 확보해 직접 평타 적중을 합산해야 한다.',
  );

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

const comparison = readJsonOrFail(comparisonPath);
const index = readJsonOrFail(indexPath);
writeReport(comparison, index);
console.log(`생성 완료: ${path.relative(root, outputPath)}`);
