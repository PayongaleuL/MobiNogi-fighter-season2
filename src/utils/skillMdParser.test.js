import { describe, it, expect } from 'vitest';
import parseSkillMarkdown from './skillMdParser.js';
import fs from 'fs';
import path from 'path';

describe('skillMdParser 테스트', () => {
  it('비어 있는 입력을 주었을 때 기본 구조를 반환한다', () => {
    const result = parseSkillMarkdown('');
    expect(result).toEqual({
      passives: {
        waveBaseDmg: 0,
        crashBaseDmg: 0
      },
      skills: {}
    });
  });

  it('results/260710_패시브_액티브_스킬목록.md 마크다운 마스터 문서를 정상 파싱한다', () => {
    // 마크다운 파일 경로
    const mdPath = path.resolve(__dirname, '../../results/260710_패시브_액티브_스킬목록.md');
    const mdText = fs.readFileSync(mdPath, 'utf8');

    const result = parseSkillMarkdown(mdText);

    // 1. 패시브 검증
    expect(result.passives).toEqual({
      waveBaseDmg: 39019,
      crashBaseDmg: 70945
    });

    // 2. 1-1스킬 검증 (차징 피스트 순정 & 약점)
    expect(result.skills['1-1']).toBeDefined();
    expect(result.skills['1-1']['순정']).toEqual({
      baseDamage: 122084,
      refLevel: 12,
      baseCast: 4.0,
      cooldown: 15
    });
    expect(result.skills['1-1']['약점']).toEqual({
      baseDamage: 76147,
      refLevel: 12,
      baseCast: 0.5,
      cooldown: 12
    });

    // 3. 1-2스킬 검증 (스크류 어퍼 순정)
    expect(result.skills['1-2']).toBeDefined();
    expect(result.skills['1-2']['순정']).toEqual({
      baseDamage: 67043,
      refLevel: 12,
      baseCast: 1.45
    });
    expect(result.skills['1-2']['순정'].cooldown).toBeUndefined();

    // 4. 2-1스킬 검증 (스러스트 킥 순정 & 전진)
    expect(result.skills['2-1']).toBeDefined();
    expect(result.skills['2-1']['순정']).toEqual({
      baseDamage: 32084,
      refLevel: 10,
      baseCast: 1.0,
      cooldown: 14
    });
    expect(result.skills['2-1']['전진']).toEqual({
      baseDamage: 36838,
      refLevel: 10,
      baseCast: 1.0,
      cooldown: 14
    });

    // 5. 4스킬 (소닉 피스트 [승천]) 검증
    expect(result.skills['sonic']).toBeDefined();
    expect(result.skills['sonic']['승천']).toEqual({
      baseDamage: 135978,
      refLevel: 30,
      baseCast: 2.584,
      cooldown: 12
    });

    // 6. 5스킬 (섬머솔트 [강격]) 검증
    expect(result.skills['somersault']).toBeDefined();
    expect(result.skills['somersault']['강격']).toEqual({
      baseDamage: 183322,
      refLevel: 28,
      baseCast: 1.0,
      cooldown: 13.5
    });
  });
});
