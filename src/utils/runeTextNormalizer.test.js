import { describe, expect, it } from 'vitest';
import runes from '../data/runes.json';
import { findRuneTextIssues, normalizeRuneText } from './runeTextNormalizer';

const getRune = (name) => runes.find((rune) => rune.name === name);

describe('RuneTextNormalizer', () => {
  it('rejoins decimal fragments and reviewed tier sequences before sentence splitting', () => {
    expect(normalizeRuneText([
      '공격력이 23.',
      '5% 증가한다.',
      '전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩된다.',
      '초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.',
      '5% 증가한다.',
      '주위에서 적이 5/10/20명 처치될 경우, 치명타 피해가 3%/6%/12% 증가한다.',
    ])).toEqual([
      '공격력이 23.5% 증가한다',
      '전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩된다',
      '초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다',
      '주위에서 적이 5/10/20명 처치될 경우, 치명타 피해가 3%/6%/12% 증가한다',
    ]);
  });

  it('keeps the four reported rune cases intact', () => {
    const burning = normalizeRuneText(getRune('타오르는 영광').cleaned_text, '타오르는 영광');
    const blurred = normalizeRuneText(getRune('흐릿한 형상').cleaned_text, '흐릿한 형상');
    const victory = normalizeRuneText(getRune('승전').cleaned_text, '승전');
    const ascension = normalizeRuneText(getRune('승천+').cleaned_text, '승천+');

    expect(burning).toEqual(expect.arrayContaining([
      '공격력이 23.5% 증가한다',
      '전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩된다',
      '궁극기 사용 시 모든 불씨름 소모하여 15초 동안 공격력이 소모한 중첩당 3.5% 증가한다',
    ]));
    expect(blurred).toEqual(expect.arrayContaining([
      '전투 시 1초마다 침식 수치가 5 증가한다',
    ]));
    expect(victory).toEqual(expect.arrayContaining([
      '주위에서 적이 5/10/20명 처치될 경우, 치명타 피해가 3%/6%/12% 증가한다',
    ]));
    expect(ascension).toEqual(expect.arrayContaining([
      '초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1.5% 증가한다',
    ]));
  });

  it('returns no orphan conditions, decimal fragments, or merged percentage sequences for all 88 runes', () => {
    expect(runes).toHaveLength(88);

    for (const rune of runes) {
      const lines = normalizeRuneText(rune.cleaned_text, rune.name);
      expect(findRuneTextIssues(lines), rune.name).toEqual([]);
    }
  });
});

  it('filters metadata and reports every prohibited standalone or merged token class', () => {
    expect(normalizeRuneText([
      null,
      '무기 룬',
      '거래 불가',
      '타오르는 영광',
      '  전투 중 6초마다 효과가 발생한다.  ',
    ], '타오르는 영광')).toEqual(['전투 중 6초마다 효과가 발생한다']);

    expect(findRuneTextIssues([
      '시 5초마다 불씨름을 얻는다',
      '중 5초마다 피해를 입는다',
      '5% 증가',
      '1.',
      '주위에서 적이 51020명 처치될 경우',
      '치명타 피해가 3%6%12% 증가한다',
      '대체 문자 \uFFFD',
    ])).toEqual([
      { type: 'ORPHAN_CONDITION', line: '시 5초마다 불씨름을 얻는다' },
      { type: 'ORPHAN_CONDITION', line: '중 5초마다 피해를 입는다' },
      { type: 'ORPHAN_PERCENT', line: '5% 증가' },
      { type: 'ORPHAN_DECIMAL', line: '1.' },
      { type: 'MERGED_NUMERIC_SEQUENCE', line: '주위에서 적이 51020명 처치될 경우' },
      { type: 'MERGED_PERCENT_SEQUENCE', line: '치명타 피해가 3%6%12% 증가한다' },
      { type: 'REPLACEMENT_CHARACTER', line: '대체 문자 \uFFFD' },
    ]);
  });
