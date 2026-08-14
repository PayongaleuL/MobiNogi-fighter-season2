import fs from 'node:fs';
import crypto from 'node:crypto';
import runesData from '../src/data/runes.json' with { type: 'json' };
import { parseRuneMarkdown } from '../src/utils/runeMdParser.js';

const MASTER_RELATIVE_PATH = 'results/260814_룬설명목록.md';
const MASTER_PATH = new URL(`../${MASTER_RELATIVE_PATH}`, import.meta.url);
const OUTPUT_JSON_PATH = new URL('../results/rune_master_source_audit.json', import.meta.url);
const OUTPUT_MD_PATH = new URL('../results/rune_master_source_audit.md', import.meta.url);
const REFERENCE_PATH = new URL('../results/latest_reference_preset_comparison.json', import.meta.url);

const NAME_ALIASES = new Map([
  ['그믐달', '그음달'],
]);

const STAT_KEYS = [
  '공격력%', '조건부공증%', '주는피해%', '받는피해%', '강타피해%',
  '연타피해%', '추가타피해%', '치명타피해%', '콤보피해%', '멀티피해%',
  '스킬피해%', '추가타확률%', '치명타확률%', '스킬속도%', '재사용회복%',
  '최종피해%', '가동률'
];

const CONDITIONAL_PATTERNS = [
  [/적중|공격 시|공격시|스킬 사용|스킬사용|기본 공격|평타/, 'trigger'],
  [/동안|지속 시간|지속시간|재사용 대기시간|재사용대기시간/, 'durationOrCooldown'],
  [/중첩|최대 \d+회|소모|충전/, 'stackOrCharge'],
  [/처치|체력.*미만|자원.*미만|밤의 축복|지속 피해|상태 이상/, 'stateOrTarget'],
  [/궁극기/, 'ultimate'],
];

const DIRECT_DAMAGE_PATTERN = /(?:\d{1,3}(?:,\d{3})+|\d+)의?\s*피해|지속 피해|도트|주변\s*\d+m/i;
const SPEED_TERMS = ['공격 속도', '스킬 사용 속도', '캐스팅 및 차지 속도'];

function normalizedName(name = '') {
  return name
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/[＋+]/g, '+')
    .replace(/\s+/g, '')
    .trim();
}

function stableRuneId(rune) {
  return rune.file || `${rune.type}:${normalizedName(rune.name)}`;
}

function numericDiff(masterStats, currentStats) {
  return STAT_KEYS.flatMap((key) => {
    const master = Number(masterStats?.[key] ?? 0);
    const current = Number(currentStats?.[key] ?? 0);
    return Math.abs(master - current) > 0.000001 ? [{ key, master, current }] : [];
  });
}

function signalsFromText(lines = []) {
  const text = lines.join(' ');
  const signals = [];
  for (const [pattern, signal] of CONDITIONAL_PATTERNS) {
    if (pattern.test(text)) signals.push(signal);
  }
  return [...new Set(signals)];
}

function speedTermsFromText(lines = []) {
  const text = lines.join(' ');
  return SPEED_TERMS.filter((term) => text.includes(term));
}

function conflictCodes(masterRune, currentRune) {
  const codes = [];
  const sourceText = masterRune.cleaned_text.join(' ');
  const signalTypes = signalsFromText(masterRune.cleaned_text);
  const speeds = speedTermsFromText(masterRune.cleaned_text);
  const effects = currentRune?.conditionalEffects ?? [];

  if (!currentRune) codes.push('MISSING_IN_JSON');
  if (currentRune && numericDiff(masterRune.stats, currentRune.stats).length > 0) codes.push('MANUAL_STAT_DIFFERENCE');
  if (signalTypes.length > 0 && effects.length === 0) codes.push('CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL');
  if (DIRECT_DAMAGE_PATTERN.test(sourceText)) codes.push('DIRECT_DAMAGE_POLICY_REQUIRED');
  if (speeds.length > 1) codes.push('MULTIPLE_SPEED_CHANNELS_COLLAPSED');
  if (/\d+(?:\.\d+)?%\d+/.test(sourceText) || /\d+\/\d+\/\d+명/.test(sourceText)) codes.push('OCR_OR_TIER_TEXT_REVIEW_REQUIRED');
  if (/중첩/.test(sourceText) && !effects.some((effect) => /stack|중첩|충전|charge/i.test(`${effect.id ?? ''} ${effect.label ?? ''} ${effect.source ?? ''}`))) {
    codes.push('STACK_POLICY_REQUIRED');
  }
  if (/재사용\s*대기시간/.test(sourceText) && !effects.some((effect) => /cooldown|재사용|대기시간/i.test(`${effect.id ?? ''} ${effect.label ?? ''} ${effect.source ?? ''}`))) {
    codes.push('COOLDOWN_POLICY_REQUIRED');
  }

  return [...new Set(codes)];
}

function confidenceFor(codes) {
  if (codes.includes('MISSING_IN_JSON')) return 'blocked';
  if (codes.some((code) => code.endsWith('_REQUIRED') || code === 'CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL')) return 'review';
  if (codes.includes('MANUAL_STAT_DIFFERENCE')) return 'manual-review';
  return 'mapped';
}

function markdownTable(rows, headers) {
  const escape = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escape).join(' | ')} |`).join('\n');
  return [head, divider, body].filter(Boolean).join('\n');
}

const masterText = fs.readFileSync(MASTER_PATH, 'utf8');
const masterHash = crypto.createHash('sha256').update(masterText).digest('hex').toUpperCase();
const parsedMasterRunes = parseRuneMarkdown(masterText);
const currentByName = new Map(runesData.map((rune) => [normalizedName(rune.name), rune]));
const resolvedCurrentName = (masterName) => normalizedName(NAME_ALIASES.get(masterName) ?? masterName);

const records = parsedMasterRunes.map((masterRune) => {
  const currentRune = currentByName.get(resolvedCurrentName(masterRune.name));
  const conflicts = conflictCodes(masterRune, currentRune);
  const currentEffects = (currentRune?.conditionalEffects ?? []).map((effect) => ({
    id: effect.id ?? null,
    label: effect.label ?? null,
    defaultUptime: effect.defaultUptime ?? null,
    uptimeStep: effect.uptimeStep ?? null,
    stats: effect.stats ?? {},
    source: effect.source ?? null,
  }));

  return {
    runeId: currentRune ? stableRuneId(currentRune) : null,
    displayName: masterRune.name,
    matchedDataName: currentRune?.name ?? null,
    slotType: masterRune.type,
    masterSourcePath: MASTER_RELATIVE_PATH,
    masterSourceHash: masterHash,
    rawSourceExcerpt: masterRune.cleaned_text,
    cleanedText: masterRune.cleaned_text,
    currentManualStats: currentRune?.stats ?? null,
    parsedMasterStats: masterRune.stats,
    correctionLabDefaults: currentRune?.stats ?? null,
    serializedOverrideKeys: currentEffects.map((effect) => `${currentRune?.name ?? masterRune.name}:${effect.id ?? 'MISSING_ID'}`),
    currentEffects,
    signalTypes: signalsFromText(masterRune.cleaned_text),
    speedTerms: speedTermsFromText(masterRune.cleaned_text),
    numericDifferences: currentRune ? numericDiff(masterRune.stats, currentRune.stats) : [],
    validationStatus: confidenceFor(conflicts),
    conflictCodes: conflicts,
    confidence: confidenceFor(conflicts),
    missingInputReason: conflicts.length === 0 ? null : '원문 효과 구조와 현행 수동 보정·계산 모델의 연결을 다음 P2 결정 테이블에서 재판정해야 합니다.',
  };
});

const masterNamesWithAliases = new Set(parsedMasterRunes.map((rune) => resolvedCurrentName(rune.name)));
const jsonOnly = runesData
  .filter((rune) => !masterNamesWithAliases.has(normalizedName(rune.name)))
  .map((rune) => ({ runeId: stableRuneId(rune), displayName: rune.name, slotType: rune.type }));

const conflictsByCode = Object.fromEntries(
  [...new Set(records.flatMap((record) => record.conflictCodes))]
    .sort()
    .map((code) => [code, records.filter((record) => record.conflictCodes.includes(code)).map((record) => record.displayName)])
);

const referencePresets = fs.existsSync(REFERENCE_PATH)
  ? JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8')).map((item) => ({
      name: item.name,
      modeledDps: item.modeledDps,
      variancePct: item.variancePct,
    }))
  : [];

const report = {
  generatedAt: new Date().toISOString(),
  master: {
    path: MASTER_RELATIVE_PATH,
    sha256: masterHash,
    parsedRuneCount: parsedMasterRunes.length,
    expectedApprovedSha256: 'A86E44F39200A2872DD15A9C8B2C577B2EAA052F6BF9476B5A2254D61908B93A',
    approvedHashMatches: masterHash === 'A86E44F39200A2872DD15A9C8B2C577B2EAA052F6BF9476B5A2254D61908B93A',
  },
  currentData: { runeCount: runesData.length },
  summary: {
    matchedByName: records.filter((record) => record.runeId).length,
    aliasMappings: records.filter((record) => record.displayName !== record.matchedDataName).length,
    missingInJson: records.filter((record) => !record.runeId).length,
    jsonOnly: jsonOnly.length,
    recordsWithConflicts: records.filter((record) => record.conflictCodes.length > 0).length,
    manualStatDifferences: records.filter((record) => record.conflictCodes.includes('MANUAL_STAT_DIFFERENCE')).length,
    conditionalModelReview: records.filter((record) => record.conflictCodes.includes('CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL')).length,
    speedChannelReview: records.filter((record) => record.conflictCodes.includes('MULTIPLE_SPEED_CHANNELS_COLLAPSED')).length,
    directDamageReview: records.filter((record) => record.conflictCodes.includes('DIRECT_DAMAGE_POLICY_REQUIRED')).length,
    stackPolicyReview: records.filter((record) => record.conflictCodes.includes('STACK_POLICY_REQUIRED')).length,
    cooldownPolicyReview: records.filter((record) => record.conflictCodes.includes('COOLDOWN_POLICY_REQUIRED')).length,
    ocrOrTierReview: records.filter((record) => record.conflictCodes.includes('OCR_OR_TIER_TEXT_REVIEW_REQUIRED')).length,
  },
  conflictsByCode,
  records,
  jsonOnly,
  referencePresets,
};

const summaryRows = Object.entries(report.summary).map(([key, value]) => [key, value]);
const aliasRows = records
  .filter((record) => record.displayName !== record.matchedDataName)
  .map((record) => [record.displayName, record.matchedDataName, '사용자 검수 이름 정규화 별칭']);
const conflictRows = Object.entries(conflictsByCode).map(([code, names]) => [code, names.length, names.join(', ')]);
const reviewRows = records
  .filter((record) => record.conflictCodes.length > 0)
  .map((record) => [
    record.displayName,
    record.slotType,
    record.conflictCodes.join(', '),
    record.numericDifferences.map((difference) => `${difference.key}: ${difference.master} → ${difference.current}`).join('; ') || '—',
    record.speedTerms.join(', ') || '—',
    record.currentEffects.length,
  ]);
const referenceRows = referencePresets.map((preset) => [preset.name, preset.modeledDps, `${preset.variancePct}%`]);

const markdown = `# 시즌2 룬 마스터 원문 읽기 전용 감사\n\n**생성 시각:** ${report.generatedAt}\n\n**권위 원문:** \`${MASTER_RELATIVE_PATH}\` (SHA-256: \`${masterHash}\`)\n\n> 이 보고서는 원문과 계산 데이터를 변경하지 않는다. 충돌은 오류 확정이 아니라, P2의 효과 ID·단위·쿨다운·스택·속도·직접 피해 결정 테이블에서 재판정할 입력이다. \`unresolved\` 효과는 숫자 0%가 아니라 DPS 미포함 및 영향 N/A로 처리해야 한다.\n\n## 범위 요약\n\n${markdownTable(summaryRows, ['항목', '값'])}\n\n## 이름 정규화 별칭\n\n${markdownTable(aliasRows, ['마스터 원문명', '현행 데이터명', '근거'])}\n\n## 충돌 코드별 대상\n\n${markdownTable(conflictRows, ['코드', '대상 수', '대상'])}\n\n## 재판정 필요 항목\n\n${markdownTable(reviewRows, ['룬', '부위', '감사 코드', '수치 차이(원문 파서 → 현행)', '원문 속도 용어', '현행 조건부 효과 수'])}\n\n## 현재 골든 기준선\n\n${markdownTable(referenceRows, ['참조 프리셋', '계산 DPS', '실전 대비 편차'])}\n\n## 다음 HOLD 게이트\n\n상시 효과·수동 보정의 차이는 이 보고서만으로 자동 교정하지 않는다. 먼저 효과별 불변 \`runeId:effectCode\`, override 단위, 쿨다운·충전·스택·패널티 상태 전이, 평타/스킬 속도 채널, 직접 피해의 스케일링·치명·방어·마도저항·대상 수 정책을 결정 테이블과 단위 테스트로 확정해야 한다.\n`;

fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(OUTPUT_MD_PATH, markdown);
console.log(JSON.stringify({ master: report.master, summary: report.summary, outputs: ['results/rune_master_source_audit.json', 'results/rune_master_source_audit.md'] }, null, 2));
