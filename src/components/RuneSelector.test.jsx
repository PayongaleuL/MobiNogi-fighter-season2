// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import runes from '../data/runes.json';
import RuneSelector, { resolveDisplayRune } from './RuneSelector';

afterEach(cleanup);

const emptyRunes = {
  무기: [null],
  방어구: Array(5).fill(null),
  장신구: Array(3).fill(null),
  엠블럼: [null],
};

const transcendLevels = {
  무기: [0],
  방어구: Array(5).fill(0),
  장신구: Array(3).fill(0),
  엠블럼: [0],
};

const getRune = (name) => runes.find((rune) => rune.name === name);

const renderSelector = (selectedRunes = emptyRunes) => {
  render(
    <RuneSelector
      selectedRunes={selectedRunes}
      onRuneChange={vi.fn()}
      transcendLevels={transcendLevels}
      onTranscendChange={vi.fn()}
    />,
  );
};

describe('RuneSelector cleaned description rendering', () => {
  it('preserves decimal values and leading battle conditions in the picker modal', () => {
    renderSelector();

    fireEvent.click(screen.getByText('무기 룬'));

    expect(screen.getByText(/공격력이 23\.5% 증가/)).toBeInTheDocument();
    expect(screen.getByText(/전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩/)).toBeInTheDocument();
    expect(screen.queryByText(/^•?\s*5% 증가$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^•?\s*시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩$/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('ALL'));

    expect(screen.getAllByText(/전투 시,? 1초마다 침식 수치가 5 증가/).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryAllByText(/^•?\s*시,? 1초마다 침식 수치가 5 증가$/)).toHaveLength(0);
  });

  it('normalizes stale saved rune objects to the latest manual stats before card rendering', () => {
    const legacyVictory = { ...getRune('승전'), stats: { ...getRune('승전').stats, '치명타피해%': 0.03 } };
    const legacyMaw = { ...getRune('아귀'), stats: { ...getRune('아귀').stats, '주는피해%': 0.12, '콤보피해%': 0.12, '무방비피해%': 0 } };
    const victory = resolveDisplayRune(legacyVictory);
    const maw = resolveDisplayRune(legacyMaw);

    expect(victory.stats).toMatchObject({ '주는피해%': 0.05, '치명타피해%': 0.1 });
    expect(maw.stats).toMatchObject({ '공격력%': 0.15, '주는피해%': 0, '콤보피해%': 0, '무방비피해%': 0.12 });

    renderSelector({ ...emptyRunes, 방어구: [legacyVictory, legacyMaw, null, null, null] });
    expect(screen.getByText('주피증 5.0% / 치피 10.0%')).toBeInTheDocument();
    expect(screen.getByText('공증 15.0% / 무방비피 12.0%')).toBeInTheDocument();
  });

  it('uses the same normalized text in the equipped-rune detail dictionary', () => {
    const equippedRunes = {
      무기: [getRune('타오르는 영광')],
      방어구: [getRune('흐릿한 형상'), getRune('승전'), null, null, null],
      장신구: [getRune('승천+'), null, null],
      엠블럼: [null],
    };

    renderSelector(equippedRunes);
    fireEvent.click(screen.getByRole('button', { name: /장착 중인 룬 상세 효과 사전/ }));

    expect(screen.getByText(/공격력이 23\.5% 증가/)).toBeInTheDocument();
    expect(screen.getByText(/전투 시 5초마다 불씨름 얻는다 이 효과는 최대 12회까지 중첩/)).toBeInTheDocument();
    expect(screen.getAllByText(/전투 시 1초마다 침식 수치가 5 증가/).length).toBeGreaterThan(0);
    expect(screen.getByText(/주위에서 적이 5\/10\/20명 처치될 경우, 치명타 피해가 3%\/6%\/12% 증가/)).toBeInTheDocument();
    expect(screen.getByText(/초월 각인 시, 적에게 주는 최종 피해량이 단계마다 1\.5% 증가/)).toBeInTheDocument();

    expect(screen.queryByText(/^•?\s*5% 증가$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^•?\s*시,? 5초마다 불씨름/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^•?\s*시,? 1초마다 침식 수치가 5 증가$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/51020명/)).not.toBeInTheDocument();
    expect(screen.queryByText(/3%6%12%/)).not.toBeInTheDocument();
  });
});
