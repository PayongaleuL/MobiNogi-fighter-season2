import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const masterPath = path.join(root, 'results', '260814_룬설명목록.md');
const jsonOutputPath = path.join(root, 'results', 'rune_sentence_inventory.json');
const markdownOutputPath = path.join(root, 'results', 'rune_sentence_inventory.md');
const masterText = fs.readFileSync(masterPath, 'utf8');
const masterHash = crypto.createHash('sha256').update(masterText).digest('hex').toUpperCase();

const normalizeName = (name) => name.replace(/\+/g, '').replace(/\s+/g, '').trim();
const sentenceParts = (text) => text
  .split(/(?<!\d)\.(?!\d)/)
  .map((part) => part.trim())
  .filter(Boolean);

const classifySentence = (sentence) => {
  const signals = {
    stat: /(공격력|주는 피해|받는 피해|강타 피해|연타 피해|추가타 피해|치명타 피해|콤보 피해|멀티 피해|스킬 피해|최종 피해|치명타 확률|추가타 확률|재사용 대기시간 회복|공격 속도|스킬 사용 속도|캐스팅 및 차지 속도)/.test(sentence),
    trigger: /(공격 시|적중 시|사용 시|사용하면|사용할 경우|발동 시|처치될 경우|처치 시|전투 시|전투 중|기본 공격|스킬 \d+회|궁극기|밤의 축복|무방비|브레이크|지속 피해|보유한 적|대상에게)/.test(sentence),
    duration: /(\d+(?:\.\d+)?초 동안|지속 시간)/.test(sentence),
    cooldown: /(재사용 대기시간|쿨타임)/.test(sentence),
    stack: /(중첩|스택|회까지|횟수)/.test(sentence),
    consume: /(소모|해제|제거)/.test(sentence),
    directDamage: /(\d{1,3}(?:,\d{3})+(?:의)? 피해|피해를 추가로|직접 피해)/.test(sentence),
    dot: /(지속 피해|화상|빙결|감전|심판|중독|상처|두려움|절망)/.test(sentence),
    speed: /(공격 속도|스킬 사용 속도|캐스팅 및 차지 속도|이동 속도)/.test(sentence),
    recovery: /(재사용 대기시간 회복)/.test(sentence),
    kill: /(처치)/.test(sentence),
    probability: /(확률|확정)/.test(sentence),
    targetState: /(적에게|대상|주위|범위|무방비|브레이크|지속 피해.*보유)/.test(sentence),
    defensive: /(방어력|받는 피해 감소|피해를 감소|회복량|회복|보호막|체력)/.test(sentence),
  };

  const isSimplePermanentStat = signals.stat
    && !signals.trigger
    && !signals.duration
    && !signals.cooldown
    && !signals.stack
    && !signals.consume
    && !signals.directDamage
    && !signals.dot
    && !signals.kill
    && !signals.probability
    && !signals.targetState;

  let modelFamily = 'permanentStat';
  if (signals.directDamage || signals.dot) modelFamily = 'directDamage';
  else if (signals.stack || signals.consume) modelFamily = 'stackOrConsume';
  else if (signals.duration || signals.cooldown) modelFamily = 'durationCooldown';
  else if (signals.speed || signals.recovery) modelFamily = 'speedOrRecovery';
  else if (signals.kill || signals.targetState || signals.probability || signals.trigger) modelFamily = 'contextOrTrigger';
  else if (signals.defensive) modelFamily = 'nonOutgoingDamage';

  return {
    signals,
    isSimplePermanentStat,
    modelFamily,
    requiredResult: isSimplePermanentStat
      ? 'appliedModifier'
      : signals.defensive && !signals.stat
        ? 'verifiedZeroDpsDeltaOrTimeConstraint'
        : 'effectDpsDelta',
  };
};

const lines = masterText.split(/\r?\n/);
const runes = [];
let current = null;
let inCleanedText = false;

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) continue;

  const header = line.match(/^###\s+(?:(?:\[([^\]]+)\]\s+)?(\d+)\.\s*)?(.+?)\s*\((.+?)\s*\/\s*속성:\s*(.+?)\)/);
  if (header) {
    if (current) runes.push(current);
    current = {
      name: header[1] ? `[${header[1]}] ${header[3].trim()}` : header[3].trim(),
      type: header[4].trim(),
      element: header[5].trim(),
      sourceLines: [],
    };
    inCleanedText = false;
    continue;
  }

  if (!current) continue;
  if (line.includes('**인게임 정제 문장 (cleaned_text)**')) {
    inCleanedText = true;
    continue;
  }
  if (line.startsWith('##')) {
    inCleanedText = false;
    continue;
  }
  if (inCleanedText && line.startsWith('-')) {
    const text = line.replace(/^[-*]\s*/, '').replace(/^\*\*?[^*]+\*\*?:?\s*/, '').trim();
    if (text) current.sourceLines.push(text);
  }
}
if (current) runes.push(current);

const records = runes.flatMap((rune) => rune.sourceLines.flatMap((sourceLine, sourceLineIndex) => (
  sentenceParts(sourceLine).map((sentence, sentenceIndex) => {
    const classification = classifySentence(sentence);
    return {
      id: `${normalizeName(rune.name)}:line-${sourceLineIndex + 1}:part-${sentenceIndex + 1}`,
      runeName: rune.name,
      slotType: rune.type,
      element: rune.element,
      sourceLine,
      sentence,
      ...classification,
      implementationStatus: classification.isSimplePermanentStat ? 'canonical-stat' : 'needs-effect-model',
      evidence: 'results/260814_룬설명목록.md',
    };
  })
)));

const summary = {
  runeCount: runes.length,
  sentenceCount: records.length,
  simplePermanentStats: records.filter((record) => record.isSimplePermanentStat).length,
  needsEffectModel: records.filter((record) => !record.isSimplePermanentStat).length,
  byModelFamily: Object.fromEntries([...new Set(records.map((record) => record.modelFamily))]
    .map((family) => [family, records.filter((record) => record.modelFamily === family).length])),
};

const report = {
  generatedAt: new Date().toISOString(),
  master: {
    path: 'results/260814_룬설명목록.md',
    sha256: masterHash,
  },
  summary,
  records,
};

fs.writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`);

const markdown = [
  '# 룬 설명 문장 전수 인벤토리',
  '',
  `- 원문: \`results/260814_룬설명목록.md\``,
  `- SHA-256: \`${masterHash}\``,
  `- 룬: **${summary.runeCount}개**, 문장 레코드: **${summary.sentenceCount}개**`,
  `- 단순 상시 스탯: **${summary.simplePermanentStats}건**, 효과 모델 필요: **${summary.needsEffectModel}건**`,
  '',
  '## 모델 가족 집계',
  '',
  '| 모델 가족 | 문장 수 |',
  '| --- | ---: |',
  ...Object.entries(summary.byModelFamily).map(([family, count]) => `| ${family} | ${count} |`),
  '',
  '## 문장별 인벤토리',
  '',
  '| 룬 | ID | 모델 가족 | 결과 유형 | 문장 |',
  '| --- | --- | --- | --- | --- |',
  ...records.map((record) => `| ${record.runeName} | \`${record.id}\` | ${record.modelFamily} | ${record.requiredResult} | ${record.sentence.replaceAll('|', '\\|')} |`),
  '',
].join('\n');
fs.writeFileSync(markdownOutputPath, markdown);

console.log(JSON.stringify({ ...summary, jsonOutputPath, markdownOutputPath }, null, 2));
