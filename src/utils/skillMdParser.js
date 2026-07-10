/**
 * 마비노기 모바일 격투가 패시브 및 액티브 스킬 목록 마크다운 파일을 파싱하여 구조화된 데이터로 변환합니다.
 */

const DEFAULT_BASE_CAST = {
  "1-1": 1.0,
  "1-2": 1.45,
  "2-1": 1.0,
  "2-2": 1.3,
  "3": 0.85,
  "4-1": 0.8,
  "4-2": 0.8,
  "4-3": 0.8,
  "sonic": 2.584,
  "5-1": 1.0,
  "5-2": 1.0,
  "5-3": 1.0,
  "somersault": 1.0,
  "6": 3.0
};

export default function parseSkillMarkdown(mdText) {
  if (!mdText) {
    return {
      passives: {
        waveBaseDmg: 0,
        crashBaseDmg: 0
      },
      skills: {}
    };
  }

  const lines = mdText.split(/\r?\n/);
  const result = {
    passives: {
      waveBaseDmg: 0,
      crashBaseDmg: 0
    },
    skills: {}
  };

  let currentSection = null;
  let currentPassive = null;
  let currentSkillInfo = null;

  function finalizeCurrentSkill() {
    if (!currentSkillInfo) return;

    const { skillId, stance, level, damages, baseCast, cooldown } = currentSkillInfo;
    const baseDamage = damages.length > 0 ? Math.max(...damages) : 0;
    
    // 캐스팅 시간이 정의되지 않은 경우 디폴트 테이블 활용
    const finalCast = baseCast !== undefined ? baseCast : (DEFAULT_BASE_CAST[skillId] || 1.0);

    const skillData = {
      baseDamage,
      refLevel: level,
      baseCast: finalCast
    };

    if (cooldown !== undefined) {
      skillData.cooldown = cooldown;
    }

    if (!result.skills[skillId]) {
      result.skills[skillId] = {};
    }

    const existing = result.skills[skillId][stance];
    if (!existing || level >= existing.refLevel) {
      result.skills[skillId][stance] = skillData;
    }

    currentSkillInfo = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 섹션 감지
    if (line.startsWith('# 패시브 스킬')) {
      finalizeCurrentSkill();
      currentSection = 'passive';
      continue;
    } else if (line.startsWith('# 액티브 스킬')) {
      finalizeCurrentSkill();
      currentSection = 'active';
      continue;
    }

    if (currentSection === 'passive') {
      if (line.startsWith('# 5.충격파')) {
        currentPassive = '충격파';
        continue;
      } else if (line.startsWith('# 6. (NEW)파쇄권') || line.startsWith('# 6. (NEW) 파쇄권')) {
        currentPassive = '파쇄권';
        continue;
      } else if (line.startsWith('#')) {
        currentPassive = null;
        continue;
      }

      if (currentPassive === '충격파') {
        const match = line.match(/^-\s*(?:초기화\s+)?대미지\s*:\s*(\d+)/);
        if (match) {
          result.passives.waveBaseDmg = parseInt(match[1], 10);
        }
      } else if (currentPassive === '파쇄권') {
        const match = line.match(/^-\s*(?:초기화\s+)?대미지\s*:\s*(\d+)/);
        if (match) {
          result.passives.crashBaseDmg = parseInt(match[1], 10);
        }
      }
    } else if (currentSection === 'active') {
      if (line.startsWith('#')) {
        finalizeCurrentSkill();

        // 헤더 파싱
        const headerText = line.substring(1).trim();

        // 스탠스 추출 (대괄호 안의 텍스트)
        const stanceMatch = headerText.match(/\[([^\]]+)\]/);
        const stance = stanceMatch ? stanceMatch[1].trim() : '순정';

        // 레벨 추출 (+숫자 또는 제목 끝에 단독 숫자)
        let level = 0;
        const levelPlusMatch = headerText.match(/\+(\d+)/);
        if (levelPlusMatch) {
          level = parseInt(levelPlusMatch[1], 10);
        } else {
          // 스킬 명 뒤에 단독으로 오는 숫자 예: "차징 피스트 0"
          const levelNumMatch = headerText.match(/(?:스킬|피스트|어퍼|킥|스텝|펀치|섬머솔트)\s+(\d+)(?:\s|$|#)/);
          if (levelNumMatch) {
            level = parseInt(levelNumMatch[1], 10);
          }
        }

        // 스킬 ID 결정
        let skillId = null;
        if (headerText.includes('소닉 피스트') || stance === '승천') {
          skillId = 'sonic';
        } else if (headerText.includes('섬머솔트') && stance === '강격') {
          skillId = 'somersault';
        } else {
          const idMatch = headerText.match(/(\d+-\d+|\d+)스킬/);
          if (idMatch) {
            skillId = idMatch[1];
          }
        }

        if (skillId) {
          currentSkillInfo = {
            skillId,
            stance,
            level,
            damages: [],
            baseCast: undefined,
            cooldown: undefined
          };
        }
        continue;
      }

      if (currentSkillInfo) {
        // 대미지 매칭
        const dmgMatch = line.match(/^-\s*(?:기본\s+|1단계\s+|2단계\s+|3단계\s+)?대미지\s*(?::\s*)?(\d+)/);
        if (dmgMatch) {
          currentSkillInfo.damages.push(parseInt(dmgMatch[1], 10));
        }

        // 캐스팅 시간 매칭
        const castMatch = line.match(/^-\s*캐스팅\s*시간\s*:\s*(\d+(?:\.\d+)?)\s*초/);
        if (castMatch) {
          currentSkillInfo.baseCast = parseFloat(castMatch[1]);
        }

        // 단계별 차징 시간 매칭
        const chargeMatch = line.match(/^-\s*단계별\s*차징\s*시간\s*(\d+(?:\.\d+)?)\s*초/);
        if (chargeMatch) {
          currentSkillInfo.baseCast = parseFloat(chargeMatch[1]) * 5;
        }

        // 재사용 대기 시간 매칭
        const cdMatch = line.match(/^-\s*재사용\s*대기\s*시간\s*:\s*(\d+(?:\.\d+)?)\s*초?/);
        if (cdMatch) {
          currentSkillInfo.cooldown = parseFloat(cdMatch[1]);
        }
      }
    }
  }

  finalizeCurrentSkill();

  return result;
}
