import fs from 'node:fs';
import { calculateDPS } from '../src/core/calculator.js';
import { calculateGemStats } from '../src/core/gemCalculator.js';
import { createLatestReferencePresets } from '../src/data/latestReferencePresets.js';
import runesData from '../src/data/runes.json' with { type: 'json' };
import { parseRuneMarkdown } from '../src/utils/runeMdParser.js';
import parseSkillMarkdown from '../src/utils/skillMdParser.js';

const OUTPUT_JSON = new URL('../results/cooldown_filler_policy_audit.json', import.meta.url);
const OUTPUT_MD = new URL('../results/cooldown_filler_policy_audit.md', import.meta.url);
const masterRuneText = fs.readFileSync(new URL('../results/260814_룬설명목록.md', import.meta.url), 'utf8');
const masterSkillText = fs.readFileSync(new URL('../results/260710_패시브_액티브_스킬목록.md', import.meta.url), 'utf8');
const parsedRunes = parseRuneMarkdown(masterRuneText);
const parsedSkills = parseSkillMarkdown(masterSkillText);

const coreName = (name = '') => name.replace(/[＋+]/g, '+').replace(/\s+/g, '').trim();
const runeByName = new Map(runesData.map((rune) => [coreName(rune.name), rune]));

function mergedRunes() {
  return parsedRunes.map((parsed) => {
    const original = runeByName.get(coreName(parsed.name)) ?? {};
    const stats = { ...(original.stats ?? {}) };
    const fallbackKeys = new Set(['공격력%', '공격력', '방어력', '모든스킬강화', '임의스킬강화', '가동률']);
    for (const [key, value] of Object.entries(parsed.stats ?? {})) {
      if (!fallbackKeys.has(key) || value !== 0 || stats[key] === undefined) stats[key] = value;
    }
    return { ...original, ...parsed, stats };
  });
}

const activeRunes = mergedRunes();
const presets = createLatestReferencePresets();
const evidence = presets.map((preset) => {
  const data = preset.data;
  const selectedRunes = Object.entries(data.selectedRunes).flatMap(([type, entries]) => entries.map((rune, index) => {
    const latest = activeRunes.find((item) => coreName(item.name) === coreName(rune.name))
      ?? runeByName.get(coreName(rune.name))
      ?? rune;
    return { ...latest, stats: latest.stats ?? {}, transcendLevel: data.transcendLevels[type]?.[index] ?? 0 };
  }));
  const { gemStats, extraAllStat, extraFinalDmgPct } = calculateGemStats(data.gems);
  const result = calculateDPS(
    { ...data.stats, extraAllStat, extraFinalDmgPct },
    selectedRunes,
    data.gimmicks,
    data.cycles,
    data.conditionalUptimes,
    gemStats,
    data.skillStances,
    data.seals,
    parsedSkills,
  );

  return {
    name: preset.name,
    referenceId: data.reference.referenceId,
    cycleInput: data.cycles,
    normalizedCycles: result.normalizedCycles,
    stateCycleTimes: Object.fromEntries(Object.entries(result.states).map(([state, value]) => [state, value.cycleTime])),
    engineReportedDamageChannels: ['skillDps', 'directDps', 'dotDps'],
    baseAttackChannelReported: false,
    fillerPolicyStatus: 'unresolved',
    reason: '현행 코어는 스킬 토큰의 시전 시간 합계와 평균 보석 쿨감 압축만 계산하며, 스킬별 실제 쿨다운 준비 시점·공백·기본 공격 행동·기본 공격 시간을 추적하지 않는다.',
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  conclusion: {
    modelStatus: 'unresolved',
    includedInDps: false,
    impact: 'N/A',
    reason: '게임 내 평타 필러 현상은 사용자 확인으로 존재하지만, 현행 엔진에는 공백 기반 기본 공격 이벤트가 구현돼 있지 않아 빈도·피해·트리거를 안전하게 산출할 수 없다.',
  },
  currentEngineFacts: [
    {
      fact: '딜사이클 입력은 스킬 토큰만 정규화한다.',
      evidence: 'src/core/calculator.js:404-464',
      consequence: '기본 공격 토큰이나 자동 삽입 이벤트가 없다.',
    },
    {
      fact: '총 사이클 시간은 스킬 시전 시간 합계와 평균 보석 쿨감 압축으로 계산한다.',
      evidence: 'src/core/calculator.js:518-572',
      consequence: '스킬별 쿨다운 준비 시점과 공백 길이를 계산하지 않는다.',
    },
    {
      fact: '계산 결과의 피해 채널은 skillDps, directDps, dotDps다.',
      evidence: 'src/core/calculator.js:581-639',
      consequence: '기본 공격 DPS 채널과 기본 공격 적중 트리거가 없다.',
    },
    {
      fact: '룬의 공격 속도·스킬 사용 속도·캐스팅 및 차지 속도는 현재 단일 스킬속도%로 합산된다.',
      evidence: 'src/utils/runeMdParser.js:203-208; src/core/calculator.js:518-521',
      consequence: '공격 속도를 평타 필러에만 적용하는 정책은 아직 구현되지 않았다.',
    },
  ],
  referencePresetEvidence: evidence,
  holdRequirements: [
    '기본 공격 1회의 피해 계수·타수·유효 시간·공격 속도 공식',
    '스킬별 실제 쿨다운 시작 시점·충전·재사용 회복·연계 잠금 규칙',
    '공백이 평타 1회보다 짧을 때의 대기·캔슬·예약 스킬 우선 규칙',
    '기본 공격 적중, 다음 기본 공격, 공격 적중, 스킬 사용의 트리거 자격 매트릭스',
    '기본 공격·스킬·룬 직접 발동 피해의 치명타·방어도·마도저항·무방비·대상 수 적용 정책',
  ],
};

const table = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map((value) => String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>')).join(' | ')} |`),
].join('\n');

const markdown = `# 쿨다운 공백 기반 평타 필러 감사\n\n**생성 시각:** ${report.generatedAt}\n\n> **결론:** 게임 내 평타 필러 현상은 확인됐지만, 현행 계산기는 스킬 토큰·스킬 시전 시간·평균 보석 쿨감만 모델링한다. 기본 공격 행동, 실제 스킬 쿨다운 공백, 평타 피해, 평타 적중 트리거는 엔진에 존재하지 않는다. 그러므로 평타 관련 룬을 0%로 표시하거나 스킬 DPS에 전용하는 대신, P2 결정 테이블 전까지 \`modelStatus: unresolved\`, \`includedInDps: false\`, \`impact: N/A\`로 보존해야 한다.\n\n## 현행 코어 근거\n\n${table(['사실', '코드 근거', '결론'], report.currentEngineFacts.map((fact) => [fact.fact, fact.evidence, fact.consequence]))}\n\n## 참조 프리셋 관찰\n\n${table(['프리셋', '일반 사이클 입력', '정규화된 일반 스킬', '일반 사이클 시간', '기본 공격 채널'], evidence.map((item) => [item.name, item.cycleInput.ordinary, item.normalizedCycles.ordinary.join(' → '), `${item.stateCycleTimes.ordinary}s`, '미구현']))}\n\n## P2 HOLD 해소에 필요한 입력\n\n${report.holdRequirements.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\n## 금지되는 단축 해석\n\n- 평타를 스킬마다 1회 고정 삽입하지 않는다.\n- 공격 속도를 스킬 사용 속도·캐스팅 및 차지 속도와 합산하지 않는다.\n- 공격 속도가 스킬 쿨다운이나 스킬 타격당 피해를 직접 줄이거나 높인다고 가정하지 않는다.\n- 실제 평타 공백·피해·트리거 정책이 없는 상태에서 기본 공격 룬을 0%·100%·스킬 피해로 대체하지 않는다.\n`;

fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(OUTPUT_MD, markdown);
console.log(JSON.stringify({ conclusion: report.conclusion, evidenceCount: evidence.length, outputs: ['results/cooldown_filler_policy_audit.json', 'results/cooldown_filler_policy_audit.md'] }, null, 2));
