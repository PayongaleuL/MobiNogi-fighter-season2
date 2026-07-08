/**
 * 마비노기 모바일 격투가 룬 마스터 마크다운 파일을 파싱하여 구조화된 데이터로 변환합니다.
 */

export function parseRuneMarkdown(mdText) {
  if (!mdText) return [];

  const lines = mdText.split(/\r?\n/);
  const runes = [];
  let currentRune = null;
  let inCleanedText = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 룬 정보 매칭 (예: "### 1. 눈부신 잔영 (무기 / 속성: 빛)" 또는 "### [신화] 용 사냥꾼 (방어구 / 속성: 없음)")
    // ### [타입/번호] 이름 (부위 / 속성: 속성값)
    const headerMatch = line.match(/^###\s+(?:(?:\[([^\]]+)\]\s+)?(\d+)\.\s*)?(.+?)\s*\((.+?)\s*\/\s*속성:\s*(.+?)\)/);

    if (headerMatch) {
      if (currentRune) {
        runes.push(finalizeRune(currentRune));
      }

      const category = headerMatch[1]; // '신화' 등
      const indexStr = headerMatch[2]; // '1' 등
      const name = category ? `[${category}] ${headerMatch[3].trim()}` : headerMatch[3].trim();
      const type = headerMatch[4].trim(); // 무기, 방어구, 장신구, 엠블럼
      const element = headerMatch[5].trim(); // 빛, 어둠, 용, 없음

      currentRune = {
        name,
        type,
        element,
        cleaned_text: [],
        raw_text: [] // UI 호환용 빈 배열
      };
      inCleanedText = false;
      continue;
    }

    if (currentRune) {
      if (line.includes('**인게임 정제 문장 (cleaned_text)**')) {
        inCleanedText = true;
        continue;
      }

      // 다른 섹션 구분자가 나올 경우 cleaned_text 수집 중단
      if (line.startsWith('##')) {
        inCleanedText = false;
        continue;
      }

      // 글머리 기호 형태의 cleaned_text 내용 수집
      if (inCleanedText && line.startsWith('-')) {
        const textContent = line.replace(/^-\s*\*\*?[^*]+\*\*?:?\s*/, '') // - **인게임 정제 문장 (cleaned_text)**: 형태 등을 걸러내기 위함
          .replace(/^-\s*/, '')
          .trim();
        if (textContent) {
          currentRune.cleaned_text.push(textContent);
        }
      }
    }
  }

  if (currentRune) {
    runes.push(finalizeRune(currentRune));
  }

  return runes;
}

function finalizeRune(rune) {
  // 수집된 cleaned_text 기반으로 스탯 파싱 진행
  const combinedText = rune.cleaned_text.join(' ');
  rune.stats = parseStatsFromText(combinedText);
  
  // 무기, 방어구, 장신구 룬의 마도저항 기본값은 300 (엠블럼 룬은 0)
  if (rune.type === '무기' || rune.type === '방어구' || rune.type === '장신구') {
    rune.stats["마도저항"] = 300.0;
  }
  
  return rune;
}

function parseStatsFromText(text) {
  const stats = {
    "공격력%": 0.0,
    "조건부공증%": 0.0,
    "주는피해%": 0.0,
    "받는피해%": 0.0,
    "강타피해%": 0.0,
    "연타피해%": 0.0,
    "추가타피해%": 0.0,
    "치명타피해%": 0.0,
    "콤보피해%": 0.0,
    "멀티피해%": 0.0,
    "스킬피해%": 0.0,
    "추가타확률%": 0.0,
    "치명타확률%": 0.0,
    "스킬속도%": 0.0,
    "재사용회복%": 0.0,
    "최종피해%": 0.0,
    "가동률": 1.0,
    "공격력": 0.0,
    "방어력": 0.0,
    "마도저항": 0.0,
    "모든스킬강화": 1.0,
    "임의스킬강화": 2.0
  };

  if (!text) return stats;

  // 1. 공격력% (예: "공격력이 16% 증가", "공격력이 5% 증가", "공격력을 5%만큼 증가")
  const atkMatches = [...text.matchAll(/공격력(?:이|을|은)?\s*([\d\.]+)%/g)];
  if (atkMatches.length > 0) {
    stats["공격력%"] = parseFloat(atkMatches[0][1]) / 100.0;
  }

  // 2. 주는피해% (예: "적에게 주는 피해가 20% 증가", "피해가 22% 증가", "주는 피해가 14% 증가")
  // 강타피해, 연타피해, 치명타피해, 추가타피해, 스킬피해 등은 제외하고 매칭
  const dmgMatches = [...text.matchAll(/(?<!강타\s*|연타\s*|추가타\s*|치명타\s*|콤보\s*|멀티\s*|스킬\s*|받는\s*|최종\s*)피해(?:가|량)?\s*([\d\.]+)%/g)];
  if (dmgMatches.length > 0) {
    stats["주는피해%"] = parseFloat(dmgMatches[0][1]) / 100.0;
  }

  // 3. 강타피해%
  const strongMatches = [...text.matchAll(/강타\s*피해(?:가|량)?\s*([\d\.]+)%/g)];
  if (strongMatches.length > 0) {
    stats["강타피해%"] = parseFloat(strongMatches[0][1]) / 100.0;
  }

  // 4. 연타피해%
  const chainMatches = [...text.matchAll(/연타\s*피해(?:가|량)?\s*([\d\.]+)%/g)];
  if (chainMatches.length > 0) {
    stats["연타피해%"] = parseFloat(chainMatches[0][1]) / 100.0;
  }

  // 5. 추가타피해%
  const extraDmgMatches = [...text.matchAll(/추가타\s*피해(?:가|량)?\s*([\d\.]+)%/g)];
  if (extraDmgMatches.length > 0) {
    stats["추가타피해%"] = parseFloat(extraDmgMatches[0][1]) / 100.0;
  }

  // 6. 치명타피해%
  const critDmgMatches = [...text.matchAll(/치명타\s*피해(?:가|량)?\s*([\d\.]+)%/g)];
  if (critDmgMatches.length > 0) {
    stats["치명타피해%"] = parseFloat(critDmgMatches[0][1]) / 100.0;
  }

  // 7. 스킬피해%
  const skillDmgMatches = [...text.matchAll(/스킬\s*피해(?:가|량)?\s*([\d\.]+)%/g)];
  if (skillDmgMatches.length > 0) {
    stats["스킬피해%"] = parseFloat(skillDmgMatches[0][1]) / 100.0;
  }

  // 8. 추가타확률%
  const extraProbMatches = [...text.matchAll(/추가타\s*확률이?\s*([\d\.]+)%/g)];
  if (extraProbMatches.length > 0) {
    stats["추가타확률%"] = parseFloat(extraProbMatches[0][1]) / 100.0;
  }

  // 9. 치명타확률%
  const critProbMatches = [...text.matchAll(/치명타\s*확률이?\s*([\d\.]+)%/g)];
  if (critProbMatches.length > 0) {
    stats["치명타확률%"] = parseFloat(critProbMatches[0][1]) / 100.0;
  }

  // 10. 스킬속도% (공격속도, 스킬사용속도, 캐스팅속도 중 최댓값 적용)
  const speedMatches = [...text.matchAll(/(공격\s*속도|스킬\s*사용\s*속도|캐스팅\s*및\s*차지\s*속도)(?:가|가\s*추가로|가\s*5초\s*동안|가\s*6초\s*동안|가\s*7초\s*동안|이)?\s*([\d\.]+)%/g)];
  if (speedMatches.length > 0) {
    const maxVal = Math.max(...speedMatches.map(m => parseFloat(m[2])));
    stats["스킬속도%"] = maxVal / 100.0;
  }

  // 11. 재사용회복%
  const cdMatches = [...text.matchAll(/재사용\s*대기시간\s*회복\s*속도가?\s*([\d\.]+)%/g)];
  if (cdMatches.length > 0) {
    stats["재사용회복%"] = parseFloat(cdMatches[0][1]) / 100.0;
  }

  // 12. 최종피해% (장신구 단계별)
  const finalMatches = [...text.matchAll(/최종\s*피해량이?\s*단계마다\s*([\d\.]+)%/g)];
  if (finalMatches.length > 0) {
    stats["최종피해%"] = parseFloat(finalMatches[0][1]) / 100.0;
  }

  return stats;
}
