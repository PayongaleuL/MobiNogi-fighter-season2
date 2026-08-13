const METADATA_ONLY_PATTERNS = [
  /^(?:무기|방어구|장신구|엠블럼)\s*룬:?$/,
  /^(?:무기|방어구|장신구|엠블럼)에\s*각인$/,
  /^전설\s*(?:무기|방어구|장신구|엠블럼)\s*전용\s*룬$/,
  /^거래\s*불가$/,
  /^판매\s*가능$/,
  /^기억\s*가능$/,
  /^유일$/,
  /^하위\s*능력치[<$]?$/,
];

const SAFE_TEXT_REPAIRS = [
  [/아난/g, '아닌'],
  [/타켓에거/g, '타겟에게'],
  [/타켓에게/g, '타겟에게'],
  [/피해름 주고/g, '피해를 주고'],
  [/%의1\s*피해/g, '%의 피해'],
  [/추가 공격올/g, '추가 공격을'],
  [/중되다/g, '중첩된다'],
];

function normalizeLine(line) {
  let text = String(line ?? '')
    .normalize('NFKC')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[•·º]/g, ' ')
    .replace(/[；;]/g, ',');

  // 숫자와 소수점·단위가 줄바꿈 또는 OCR 불릿으로 갈라진 경우를 먼저 결합한다.
  text = text
    .replace(/(\d+)\.\s*(\d+)\s*(%|초|명|회|단계)/g, '$1.$2$3')
    .replace(/(\d+)\s*%/g, '$1%')
    .replace(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)(?=(?:명|%|초|회|단계))/g, '$1/$2/$3')
    .replace(/\s+([,.)%])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  SAFE_TEXT_REPAIRS.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  return text
    .replace(/증가\s+(한다|하다)/g, '증가$1')
    .replace(/감소\s+(한다|하다)/g, '감소$1')
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[가-힣a-zA-Z%)])\.(?=\s|$)/g)
    .map(normalizeLine)
    .filter(Boolean);
}

/**
 * 사용자 검수 cleaned_text를 UI에 안전하게 표시할 문장 배열로 정규화한다.
 * 이 함수는 I/O와 React 의존성이 없는 순수 함수이며 숫자·조건어를 추정하지 않는다.
 */
export function normalizeRuneText(cleanedText, runeName = '') {
  const sourceLines = Array.isArray(cleanedText) ? cleanedText : [cleanedText];

  const contentLines = sourceLines
    .map(normalizeLine)
    .filter((line) => {
      if (!line) return false;
      if (runeName && line === runeName) return false;
      return !METADATA_ONLY_PATTERNS.some((pattern) => pattern.test(line));
    });

  // OCR은 한 문장을 여러 배열 원소로 나누기도 하므로 문장 분리 전 한 번 결합한다.
  return splitSentences(contentLines.join(' '))
    .filter((line) => line.length > 2);
}

/**
 * 88개 데이터 전수 테스트에서 줄분할·숫자 병합 손상을 탐지한다.
 */
export function findRuneTextIssues(lines) {
  const issues = [];

  lines.forEach((line) => {
    if (/^(?:시|중)\s/.test(line)) issues.push({ type: 'ORPHAN_CONDITION', line });
    if (/^\d+(?:\.\d+)?%\s*(?:증가|감소)?$/.test(line)) issues.push({ type: 'ORPHAN_PERCENT', line });
    if (/^\d+\.$/.test(line)) issues.push({ type: 'ORPHAN_DECIMAL', line });
    if (/(?:^|[^\d/])\d{3,}명/.test(line)) issues.push({ type: 'MERGED_NUMERIC_SEQUENCE', line });
    if (/\d+%\d+%/.test(line)) issues.push({ type: 'MERGED_PERCENT_SEQUENCE', line });
    if (line.includes('\uFFFD')) issues.push({ type: 'REPLACEMENT_CHARACTER', line });
  });

  return issues;
}
