// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import runes from '../data/runes.json';
import RuneAuditDashboard from './RuneAuditDashboard';

afterEach(cleanup);

const getRune = (name) => runes.find((rune) => rune.name === name);

const selectedRunes = {
  무기: [getRune('타오르는 영광')],
  방어구: [null, null, null, null, null],
  장신구: [null, null, null],
  엠블럼: [null],
};

const renderDashboard = (dashboardRunes = runes) => {
  render(
    <RuneAuditDashboard
      runes={dashboardRunes}
      onRunesUpdate={vi.fn()}
      selectedRunes={selectedRunes}
    />,
  );
};

describe('RuneAuditDashboard light-mode equipped rune and dictionary', () => {
  it('uses a white surface for non-equipped rows and an emerald surface only for equipped rows', () => {
    renderDashboard();

    const equippedRow = screen.getByRole('button', { name: '타오르는 영광 사전 데이터 보기' }).closest('tr');
    const inactiveRow = screen.getByRole('button', { name: '눈부신 잔영 사전 데이터 보기' }).closest('tr');

    expect(equippedRow).toHaveClass('bg-emerald-50');
    expect(inactiveRow).toHaveClass('bg-white');
    expect(inactiveRow).not.toHaveClass('bg-emerald-50');
  });

  it('marks effect-model v2 runes and describes their individual conditional effects', () => {
    const effectModelRunes = runes.map((rune) => rune.name === '승전' ? {
      ...rune,
      effectModelVersion: 2,
      conditionalEffects: [{
        id: 'nearby-kill-crit-damage',
        label: '주변 처치 치명타 피해',
        defaultUptime: 0,
        modelStatus: 'manual',
        source: '주위에서 적이 처치될 경우 치명타 피해가 증가한다.'
      }]
    } : rune);
    renderDashboard(effectModelRunes);

    expect(screen.getAllByText('효과 분리 v2').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '승전 사전 데이터 보기' }));
    expect(screen.getByText('효과 모델 v2')).toBeInTheDocument();
    expect(screen.getByText('조건부 효과·가동률 정책')).toBeInTheDocument();
    expect(screen.getByText('주변 처치 치명타 피해')).toBeInTheDocument();
    expect(screen.getByText('기본 가동률 0%')).toBeInTheDocument();
  });

  it('opens a read-only dictionary comparison from the rune name and restores focus after Escape', async () => {
    renderDashboard();

    const trigger = screen.getByRole('button', { name: '타오르는 영광 사전 데이터 보기' });
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: /타오르는 영광 사전 데이터/ });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('마스터 설명 원문')).toBeInTheDocument();
    expect(screen.getByText('저장 데이터 비교')).toBeInTheDocument();
    expect(screen.getByText(/기준 23\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/저장 23\.5%/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
