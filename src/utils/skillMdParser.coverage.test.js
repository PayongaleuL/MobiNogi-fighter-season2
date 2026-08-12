import { describe, expect, it } from 'vitest';
import parseSkillMarkdown from './skillMdParser';

describe('parseSkillMarkdown coverage regression suite', () => {
  it('parses passive damage, active stances, defaults, charge time, and cooldown', () => {
    const parsed = parseSkillMarkdown(`
# 패시브 스킬
# 5.충격파
- 초기화 대미지 : 111
# 6. (NEW) 파쇄권
- 대미지 : 222
# 기타 패시브
- 대미지 : 999
# 액티브 스킬
# 1-1스킬 [약점] +10
- 기본 대미지: 100
- 1단계 대미지: 200
- 캐스팅 시간 : 1.25초
- 재사용 대기 시간 : 12초
# 1-1스킬 [약점] +5
- 대미지 999
# 2-2스킬 순정 7
- 대미지: 300
# 4스킬 [승천] +20
- 대미지: 400
# 5스킬 [강격] 섬머솔트 +30
- 대미지: 500
- 단계별 차징 시간 0.5초
# 알 수 없는 제목
- 대미지: 999
`);

    expect(parsed.passives).toEqual({ waveBaseDmg: 111, crashBaseDmg: 222 });
    expect(parsed.skills['1-1'].약점).toEqual({ baseDamage: 200, refLevel: 10, baseCast: 1.25, cooldown: 12 });
    expect(parsed.skills['2-2'].순정).toEqual({ baseDamage: 300, refLevel: 0, baseCast: 1.3 });
    expect(parsed.skills.sonic.승천).toEqual({ baseDamage: 400, refLevel: 20, baseCast: 2.584 });
    expect(parsed.skills.somersault.강격).toEqual({ baseDamage: 500, refLevel: 30, baseCast: 2.5 });
  });

  it('keeps the highest-level definition of a duplicated stance', () => {
    const parsed = parseSkillMarkdown(`
# 액티브 스킬
# 3스킬 [순정] +5
- 대미지: 100
# 3스킬 [순정] +10
- 대미지: 200
`);

    expect(parsed.skills['3'].순정).toEqual({ baseDamage: 200, refLevel: 10, baseCast: 0.85 });
  });
});
