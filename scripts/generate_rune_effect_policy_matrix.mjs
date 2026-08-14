import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import runes from '../src/data/runes.json' with { type: 'json' };
import { runeEffectModels } from '../src/data/runeEffectModels.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const auditPath = path.join(root, 'results', 'rune_master_source_audit.json');
const outputPath = path.join(root, 'results', 'rune_effect_policy_matrix.md');
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const codesByRune = new Map();

for (const [code, names] of Object.entries(audit.conflictsByCode || {})) {
  for (const name of names) {
    const codes = codesByRune.get(name) || [];
    codes.push(code);
    codesByRune.set(name, codes);
  }
}

const has = (codes, code) => codes.includes(code);
const escapeCell = (value) => String(value).replaceAll('|', '\\|');
const modelSummary = (model) => (model.conditionalEffects || [])
  .map((effect) => `${effect.label}: ${effect.modelStatus === 'unresolved' || effect.includedInDps === false ? '미반영' : `${Math.round((effect.defaultUptime ?? 0) * 100)}%`}`)
  .join('<br>') || '상시 효과만';

const rows = runes.map((rune) => {
  const codes = codesByRune.get(rune.name) || [];
  const model = runeEffectModels[rune.name];
  if (model) {
    const unresolved = (model.conditionalEffects || []).some((effect) => effect.modelStatus === 'unresolved' || effect.includedInDps === false);
    return {
      type: rune.type,
      name: rune.name,
      policy: unresolved ? 'v2: 상시 적용 + 미확정 효과 미반영' : 'v2: 상시·효과별 가동률 분리',
      effect: modelSummary(model),
      review: codes.join(', ') || '원문·수동 데이터 일치'
    };
  }

  const isConditional = has(codes, 'CONDITIONAL_TEXT_WITHOUT_EFFECT_MODEL');
  const hasMechanicHold = [
    'DIRECT_DAMAGE_POLICY_REQUIRED',
    'MULTIPLE_SPEED_CHANNELS_COLLAPSED',
    'STACK_POLICY_REQUIRED',
    'COOLDOWN_POLICY_REQUIRED'
  ].some((code) => has(codes, code));
  return {
    type: rune.type,
    name: rune.name,
    policy: isConditional ? 'v1: 기존 룬 단위 가동률 유지 (v2 전환 대기)' : '상시·기존 계산값 유지',
    effect: hasMechanicHold ? '별도 이벤트/속도/스택 정책 확정 전 재해석 금지' : '현행 수동 보정 스탯 적용',
    review: codes.join(', ') || '원문·수동 데이터 일치'
  };
});

const v2Count = rows.filter((row) => row.policy.startsWith('v2:')).length;
const legacyConditionalCount = rows.filter((row) => row.policy.startsWith('v1:')).length;
const permanentCount = rows.length - v2Count - legacyConditionalCount;
const unresolvedEffects = Object.values(runeEffectModels)
  .flatMap((model) => model.conditionalEffects || [])
  .filter((effect) => effect.modelStatus === 'unresolved' || effect.includedInDps === false).length;

const markdown = `# 시즌2 룬 효과 정책 매트릭스\n\n**생성 기준:** ${new Date().toISOString()}  \n**권위 원문:** \`${audit.master.path}\` (SHA-256: \`${audit.master.sha256}\`)  \n**범위:** 원문 룬 ${audit.master.parsedRuneCount}개 / 현재 계산 데이터 ${audit.currentData.runeCount}개\n\n> 이 표는 원문을 수정하지 않고, 각 룬이 현재 DPS 엔진에서 어떤 정책으로 해석되는지 기록한다. v2는 상시 스탯을 항상 적용하고 조건부 효과만 개별 가동률을 쓴다. 직접 피해·평타/적중 이벤트·복수 속도 채널·스택/쿨다운 전이가 확정되지 않은 효과는 숫자 0으로 대체하지 않고 **계산 미반영** 또는 **v1 동결**로 남긴다.\n\n| 정책 | 룬 수 | 의미 |\n| --- | ---: | --- |\n| 효과 모델 v2 | ${v2Count} | 상시 스탯과 조건부 효과를 분리했다. |\n| v1 조건부 동결 | ${legacyConditionalCount} | 기존 검증 수치를 보존하되 효과별 재판정 전 새 DPS 추정을 추가하지 않는다. |\n| 상시·기존 값 | ${permanentCount} | 현행 수동 보정과 계산 계약을 유지한다. |\n| v2 미확정 효과 | ${unresolvedEffects}개 효과 | 평타/적중/직접 피해 이벤트는 DPS에 미포함이다. |\n\n## 룬별 적용 정책\n\n| 부위 | 룬 | 현재 DPS 정책 | 효과별 기본값 또는 보류 사유 | 원문 감사 코드 |\n| --- | --- | --- | --- | --- |\n${rows.map((row) => `| ${escapeCell(row.type)} | ${escapeCell(row.name)} | ${escapeCell(row.policy)} | ${escapeCell(row.effect)} | ${escapeCell(row.review)} |`).join('\n')}\n\n## 해석 경계\n\n| 범주 | 적용 규칙 |\n| --- | --- |\n| 상시 공격력%·주는 피해·치명타 피해·재사용 회복 | v2 룬은 어떤 룬 단위 가동률 override에도 축소하지 않는다. |\n| 조건부 효과 | \`runeId:effectId\` 키가 최우선이며, 기존 \`룬명:effectId\` 및 \`룬명\`은 읽기 호환만 유지한다. |\n| 공격 속도·스킬 사용 속도·캐스팅/차지 속도 | 서로 다른 채널로 보존하며, 평타 이벤트와 시전시간 적용 범위가 확정되기 전 임의 합산하지 않는다. |\n| 직접 피해·도트 | 발동 주기·대상수·치명/방어/마도저항·딜사이클 시간 반영이 확정되기 전 전역 DPS에 합산하지 않는다. |\n| v1 조건부 동결 | 기존 참조 DPS와 사용자 검수 수치를 보존한다. 원문 문구만으로 효과별 신규 기댓값을 가정하지 않는다. |\n`;

fs.writeFileSync(outputPath, markdown, 'utf8');
console.log(JSON.stringify({ output: path.relative(root, outputPath), total: rows.length, v2Count, legacyConditionalCount, permanentCount, unresolvedEffects }, null, 2));
