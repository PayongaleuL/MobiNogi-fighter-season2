import { describe, expect, it } from 'vitest';
import { parseRuneMarkdown } from './runeMdParser';

describe('parseRuneMarkdown', () => {
  it('returns no runes for empty input', () => {
    expect(parseRuneMarkdown()).toEqual([]);
    expect(parseRuneMarkdown('')).toEqual([]);
  });

  it('parses every supported stat and isolates night blessing modifiers', () => {
    const markdown = `
### [신화] 1. 테스트 룬 (무기 / 속성: 빛)
**인게임 정제 문장 (cleaned_text)**
- 공격력이 10.5% 증가.
- 피해가 1.2% 증가.
- 강타 피해량 2.3% 증가.
- 연타 피해량 3.4% 증가.
- 추가타 피해량 4.5% 증가.
- 치명타 피해량 5.6% 증가.
- 스킬 피해량 6.7% 증가.
- 추가타 확률이 7.8% 증가.
- 치명타 확률이 8.9% 증가.
- 공격 속도가 9.1% 증가.
- 재사용 대기시간 회복 속도가 1.1% 증가.
- 최종 피해량이 단계마다 2.2% 증가.
- 밤의 축복 공격력이 3.3% 증가.
- 밤의축복 스킬 피해량 4.4% 증가.
## 다음 섹션
- 공격력이 99% 증가.
### 이름만 있는 룬 (엠블럼 / 속성: 없음)
**인게임 정제 문장 (cleaned_text)**
- 치명타 확률이 12% 증가.
`;

    const [weapon, emblem] = parseRuneMarkdown(markdown);
    expect(weapon).toMatchObject({ name: '[신화] 테스트 룬', type: '무기', element: '빛' });

    const expectedStats = {
      '공격력%': 0.105,
      '주는피해%': 0.012,
      '강타피해%': 0.023,
      '연타피해%': 0.034,
      '추가타피해%': 0.045,
      '치명타피해%': 0.056,
      '스킬피해%': 0.067,
      '추가타확률%': 0.078,
      '치명타확률%': 0.089,
      '스킬속도%': 0.091,
      '재사용회복%': 0.011,
      '최종피해%': 0.022,
      '밤축_공격력%': 0.033,
      '밤축_스킬피해%': 0.044
    };

    for (const [stat, expected] of Object.entries(expectedStats)) {
      expect(weapon.stats[stat]).toBeCloseTo(expected, 10);
    }
    expect(weapon.stats['마도저항']).toBe(300);
    expect(emblem).toMatchObject({ name: '이름만 있는 룬', type: '엠블럼', element: '없음' });
    expect(emblem.stats['치명타확률%']).toBe(0.12);
    expect(emblem.stats['마도저항']).toBe(0);
  });
});

describe('known malformed condition-text normalization', () => {
  it('restores the missing 광채+ condition name without changing unrelated text', () => {
    const markdown = `### 광채+ (무기 / 속성: 빛)
**인게임 정제 문장 (cleaned_text)**
- 시 적에게 주는 피해가 20% 증가한다.
- 지속 피해: 화상 방결; 감전 심판을 보유한 적 공격 시 15초 동안 치명타 피해가 15% 증가한다.`;
    const [glow] = parseRuneMarkdown(markdown);
    expect(glow.cleaned_text).toEqual([
      '지속 피해: 화상·빙결·감전·심판을 보유한 적에게 주는 피해가 20% 증가한다.',
      '지속 피해: 화상·빙결·감전·심판을 보유한 적 공격 시 15초 동안 치명타 피해가 15% 증가한다.'
    ]);
  });
});
